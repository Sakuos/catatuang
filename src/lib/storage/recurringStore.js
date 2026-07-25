import { geserBulan, hariIni, tanggalBulanan } from '../format'
import { getTransactions, saveTransactions } from './transactionStore'
import { makeId, readArray, saveArray, STORAGE_KEYS } from './shared'

export function getRecurringPatterns() {
  return readArray(STORAGE_KEYS.recurringPatterns)
    .filter(
      (pattern) =>
        pattern && pattern.id && (pattern.type === 'income' || pattern.type === 'expense')
    )
    .map((pattern) => ({
      ...pattern,
      active: pattern.active !== false,
      generatedPeriods: pattern.generatedPeriods || [],
    }))
}

function validateRecurring(input) {
  const amount = Number(input.amount)
  const dayOfMonth = Number(input.dayOfMonth)
  if (input.type !== 'income' && input.type !== 'expense') {
    throw new Error('Jenis transaksi tidak valid.')
  }
  if (!amount || amount <= 0) throw new Error('Nominal wajib lebih dari 0.')
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    throw new Error('Tanggal bulanan harus antara 1 dan 31.')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.startDate || '')) {
    throw new Error('Tanggal mulai tidak valid.')
  }
  if (
    input.endDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(input.endDate) || input.endDate < input.startDate)
  ) {
    throw new Error('Tanggal selesai tidak valid.')
  }
  return {
    type: input.type,
    amount,
    category: input.category,
    note: String(input.note || '').trim(),
    dayOfMonth,
    startDate: input.startDate,
    endDate: input.endDate || '',
  }
}

export function addRecurringPattern(input) {
  const patterns = getRecurringPatterns()
  const pattern = {
    id: makeId('recurring-'),
    ...validateRecurring(input),
    active: true,
    generatedPeriods: [],
  }
  patterns.push(pattern)
  saveArray(STORAGE_KEYS.recurringPatterns, patterns)
  return pattern
}

export function updateRecurringPattern(id, changes) {
  const patterns = getRecurringPatterns()
  const index = patterns.findIndex((pattern) => pattern.id === id)
  if (index === -1) return null
  const current = patterns[index]
  patterns[index] = {
    ...current,
    ...validateRecurring({ ...current, ...changes }),
    active: changes.active === undefined ? current.active : changes.active !== false,
    generatedPeriods: current.generatedPeriods,
  }
  saveArray(STORAGE_KEYS.recurringPatterns, patterns)
  return patterns[index]
}

export function setRecurringActive(id, active) {
  const patterns = getRecurringPatterns()
  const pattern = patterns.find((item) => item.id === id)
  if (!pattern) return null
  pattern.active = Boolean(active)
  saveArray(STORAGE_KEYS.recurringPatterns, patterns)
  return pattern
}

export function removeRecurringPattern(id) {
  const patterns = getRecurringPatterns().filter((pattern) => pattern.id !== id)
  saveArray(STORAGE_KEYS.recurringPatterns, patterns)
}

function monthDifference(from, to) {
  const [fromYear, fromMonth] = from.split('-').map(Number)
  const [toYear, toMonth] = to.split('-').map(Number)
  return (toYear - fromYear) * 12 + toMonth - fromMonth
}

export function generateRecurringTransactions(today = hariIni()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return 0

  const patterns = getRecurringPatterns()
  const transactions = getTransactions()
  const currentMonth = today.slice(0, 7)
  let added = 0
  let patternsChanged = false

  for (const pattern of patterns) {
    if (!pattern.active) continue
    const firstMonth = pattern.startDate.slice(0, 7)
    const totalMonths = monthDifference(firstMonth, currentMonth)
    if (totalMonths < 0) continue

    let month = totalMonths >= 120 ? geserBulan(currentMonth, -119) : firstMonth
    const ledger = new Set(pattern.generatedPeriods)

    while (month <= currentMonth) {
      const occurrence = tanggalBulanan(month, pattern.dayOfMonth)
      const due = occurrence >= pattern.startDate && occurrence <= today
      const beforeEnd = !pattern.endDate || occurrence <= pattern.endDate
      const linked = transactions.some(
        (transaction) =>
          transaction.recurringId === pattern.id && transaction.recurringPeriod === month
      )

      if (linked && !ledger.has(month)) {
        ledger.add(month)
        patternsChanged = true
      } else if (due && beforeEnd && !ledger.has(month)) {
        transactions.push({
          id: makeId(),
          type: pattern.type,
          amount: pattern.amount,
          category: pattern.category,
          note: pattern.note,
          date: occurrence,
          recurringId: pattern.id,
          recurringPeriod: month,
        })
        ledger.add(month)
        added++
        patternsChanged = true
      }

      month = geserBulan(month, 1)
    }

    pattern.generatedPeriods = [...ledger].sort()
  }

  if (added) saveTransactions(transactions)
  if (patternsChanged) saveArray(STORAGE_KEYS.recurringPatterns, patterns)
  return added
}
