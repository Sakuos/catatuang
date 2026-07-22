// Semua akses data melewati lapisan ini agar komponen UI tidak menyentuh localStorage.

import {
  buatIdKategori,
  kategoriPresetUntuk,
  kunciLabelKategori,
  normalisasiLabelKategori,
} from './categories'
import { geserBulan, hariIni, tanggalBulanan } from './format'

const STORAGE_KEY = 'catatuang.transactions'
const BUDGET_KEY = 'catatuang.budget'
const DISMISS_KEY = 'catatuang.dismissedUpdate'
const THEME_KEY = 'catatuang.theme'
const GOAL_KEY = 'catatuang.goal'
const CUSTOM_CATEGORY_KEY = 'catatuang.customCategories'
const RECURRING_KEY = 'catatuang.recurringPatterns'

function readArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error(`Gagal membaca ${key}:`, err)
    return []
  }
}

function saveArray(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

function makeId(prefix = '') {
  return `${prefix}${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

// --- Tema (dark / light) ---
export function getTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme === 'dark' ? 'dark' : 'light')
}

// --- Target menabung ---
export function getGoal() {
  const n = Number(localStorage.getItem(GOAL_KEY))
  return n > 0 ? n : 0
}

export function setGoal(amount) {
  localStorage.setItem(GOAL_KEY, String(Number(amount) || 0))
}

// --- Banner update ---
export function getDismissedVersion() {
  return localStorage.getItem(DISMISS_KEY) || ''
}

export function setDismissedVersion(version) {
  localStorage.setItem(DISMISS_KEY, String(version || ''))
}

// --- Budget bulanan ---
export function getBudget() {
  const n = Number(localStorage.getItem(BUDGET_KEY))
  return n > 0 ? n : 0
}

export function setBudget(amount) {
  localStorage.setItem(BUDGET_KEY, String(Number(amount) || 0))
}

// --- Kategori kustom ---
export function getCustomCategories() {
  return readArray(CUSTOM_CATEGORY_KEY).filter(
    (k) => k && k.id && (k.type === 'income' || k.type === 'expense')
  )
}

export function addCustomCategory(type, label, emoji = '📦') {
  if (type !== 'income' && type !== 'expense') throw new Error('Jenis kategori tidak valid.')
  const nama = normalisasiLabelKategori(label)
  if (!nama) throw new Error('Nama kategori wajib diisi.')
  if (nama.length > 30) throw new Error('Nama kategori maksimal 30 karakter.')

  const key = kunciLabelKategori(nama)
  if (kategoriPresetUntuk(type).some((k) => kunciLabelKategori(k.label) === key)) {
    throw new Error('Kategori itu sudah tersedia.')
  }

  const categories = getCustomCategories()
  const existing = categories.find((k) => k.type === type && kunciLabelKategori(k.label) === key)
  if (existing) {
    if (existing.active !== false) throw new Error('Kategori itu sudah tersedia.')
    existing.active = true
    existing.label = nama
    existing.emoji = String(emoji || '📦').trim() || '📦'
    saveArray(CUSTOM_CATEGORY_KEY, categories)
    return existing
  }

  let id = buatIdKategori(nama, type)
  if (categories.some((k) => k.id === id)) id = `${id}-${Date.now()}`
  const category = {
    id,
    type,
    label: nama,
    emoji: String(emoji || '📦').trim() || '📦',
    active: true,
  }
  categories.push(category)
  saveArray(CUSTOM_CATEGORY_KEY, categories)
  return category
}

export function removeCustomCategory(id) {
  const categories = getCustomCategories()
  const category = categories.find((k) => k.id === id)
  if (!category) return false
  category.active = false
  saveArray(CUSTOM_CATEGORY_KEY, categories)
  return true
}

// --- Transaksi ---
// Bentuk dasar: { id, type, amount, category, note, date }
// Transaksi otomatis juga punya { recurringId, recurringPeriod }.
export function getTransactions() {
  return readArray(STORAGE_KEY)
}

function saveAll(transactions) {
  saveArray(STORAGE_KEY, transactions)
}

export function addTransaction(input) {
  const transactions = getTransactions()
  const tx = {
    id: makeId(),
    type: input.type,
    amount: Number(input.amount),
    category: input.category,
    note: input.note || '',
    date: input.date,
  }
  transactions.push(tx)
  saveAll(transactions)
  return tx
}

export function updateTransaction(id, changes) {
  const transactions = getTransactions()
  const idx = transactions.findIndex((t) => t.id === id)
  if (idx === -1) return null
  transactions[idx] = {
    ...transactions[idx],
    ...changes,
    amount: changes.amount !== undefined ? Number(changes.amount) : transactions[idx].amount,
  }
  saveAll(transactions)
  return transactions[idx]
}

export function removeTransaction(id) {
  saveAll(getTransactions().filter((t) => t.id !== id))
}

export function importTransactions(list) {
  const transactions = getTransactions()
  const kunci = (t) => `${t.date}|${t.type}|${t.amount}|${t.category}|${t.note || ''}`
  const sudahAda = new Set(transactions.map(kunci))

  let ditambah = 0
  for (const input of list) {
    const tx = {
      id: makeId(),
      type: input.type,
      amount: Number(input.amount),
      category: input.category,
      note: input.note || '',
      date: input.date,
    }
    if (sudahAda.has(kunci(tx))) continue
    sudahAda.add(kunci(tx))
    transactions.push(tx)
    ditambah++
  }
  saveAll(transactions)
  return ditambah
}

// --- Pola transaksi bulanan ---
export function getRecurringPatterns() {
  return readArray(RECURRING_KEY)
    .filter((p) => p && p.id && (p.type === 'income' || p.type === 'expense'))
    .map((p) => ({ ...p, active: p.active !== false, generatedPeriods: p.generatedPeriods || [] }))
}

function validateRecurring(input) {
  const amount = Number(input.amount)
  const dayOfMonth = Number(input.dayOfMonth)
  if (input.type !== 'income' && input.type !== 'expense') throw new Error('Jenis transaksi tidak valid.')
  if (!amount || amount <= 0) throw new Error('Nominal wajib lebih dari 0.')
  if (!Number.isInteger(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
    throw new Error('Tanggal bulanan harus antara 1 dan 31.')
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.startDate || '')) {
    throw new Error('Tanggal mulai tidak valid.')
  }
  if (input.endDate && (!/^\d{4}-\d{2}-\d{2}$/.test(input.endDate) || input.endDate < input.startDate)) {
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
  saveArray(RECURRING_KEY, patterns)
  return pattern
}

export function updateRecurringPattern(id, changes) {
  const patterns = getRecurringPatterns()
  const index = patterns.findIndex((p) => p.id === id)
  if (index === -1) return null
  const current = patterns[index]
  patterns[index] = {
    ...current,
    ...validateRecurring({ ...current, ...changes }),
    active: changes.active === undefined ? current.active : changes.active !== false,
    generatedPeriods: current.generatedPeriods,
  }
  saveArray(RECURRING_KEY, patterns)
  return patterns[index]
}

export function setRecurringActive(id, active) {
  const patterns = getRecurringPatterns()
  const pattern = patterns.find((p) => p.id === id)
  if (!pattern) return null
  pattern.active = Boolean(active)
  saveArray(RECURRING_KEY, patterns)
  return pattern
}

export function removeRecurringPattern(id) {
  const patterns = getRecurringPatterns().filter((p) => p.id !== id)
  saveArray(RECURRING_KEY, patterns)
}

function selisihBulan(from, to) {
  const [fy, fm] = from.split('-').map(Number)
  const [ty, tm] = to.split('-').map(Number)
  return (ty - fy) * 12 + tm - fm
}

// Buat semua occurrence yang sudah jatuh tempo. Mengembalikan jumlah transaksi baru.
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
    const totalMonths = selisihBulan(firstMonth, currentMonth)
    if (totalMonths < 0) continue

    // Maksimal 120 bulan terbaru untuk melindungi app dari data tanggal yang rusak.
    let month = totalMonths >= 120 ? geserBulan(currentMonth, -119) : firstMonth
    const ledger = new Set(pattern.generatedPeriods)

    while (month <= currentMonth) {
      const occurrence = tanggalBulanan(month, pattern.dayOfMonth)
      const due = occurrence >= pattern.startDate && occurrence <= today
      const beforeEnd = !pattern.endDate || occurrence <= pattern.endDate
      const linked = transactions.some(
        (t) => t.recurringId === pattern.id && t.recurringPeriod === month
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

  // Transaksi disimpan lebih dulu. Run berikutnya dapat memperbaiki ledger bila proses terputus.
  if (added) saveAll(transactions)
  if (patternsChanged) saveArray(RECURRING_KEY, patterns)
  return added
}
