import { cariKategori } from './categories'
import { bulanDari } from './format'

export function getTransactionsForMonth(transactions, month) {
  return transactions.filter((transaction) => bulanDari(transaction.date) === month)
}

export function getMonthlyTotals(transactions) {
  return transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === 'income') totals.income += transaction.amount
      else totals.expense += transaction.amount
      return totals
    },
    { income: 0, expense: 0 }
  )
}

export function getSavedTotal(transactions) {
  return transactions.reduce(
    (total, transaction) =>
      total + (transaction.type === 'income' ? transaction.amount : -transaction.amount),
    0
  )
}

/** Arus kas mingguan: 7 hari Min–Sab, income/expense per hari. */
export function getWeeklyCashFlow(transactions, refIso) {
  const ref = new Date(refIso + 'T00:00:00')
  const sunday = new Date(ref)
  sunday.setDate(ref.getDate() - ref.getDay()) // Minggu awal pekan (getDay: 0=Minggu)

  const pad = (n) => String(n).padStart(2, '0')
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(sunday)
    d.setDate(sunday.getDate() + i)
    // Bentuk ISO lokal (hindari toISOString yang menggeser ke UTC).
    days.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`)
  }

  const byDate = {}
  for (const d of days) {
    byDate[d] = { income: 0, expense: 0 }
  }
  for (const t of transactions) {
    if (byDate[t.date]) {
      if (t.type === 'income') byDate[t.date].income += t.amount
      else byDate[t.date].expense += t.amount
    }
  }

  return days.map((d) => ({ date: d, ...byDate[d] }))
}

/** Label hari pendek (Min–Sab) untuk 7 entri mingguan. */
export const WEEKDAY_LABELS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

/**
 * Kalkulasi overview anggaran bulanan.
 * Mengembalikan pct (0–100), sisa, over, near.
 * Budget 0 → semua nol/false.
 */
export function getBudgetOverview(budget, spent) {
  const b = Math.max(0, Number(budget) || 0)
  const s = Math.max(0, Number(spent) || 0)
  if (b <= 0) return { budget: 0, spent: s, pct: 0, sisa: 0, over: false, near: false }
  const pct = Math.min(100, Math.round((s / b) * 100))
  const over = s > b
  const near = !over && pct >= 80
  const sisa = over ? 0 : b - s
  return { budget: b, spent: s, pct, sisa, over, near }
}

/**
 * Pengeluaran per kategori untuk bulan terpilih.
 * Mengembalikan array { category, spent }, diurutkan descending.
 */
export function getExpenseByCategory(transactions) {
  const map = {}
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    map[t.category] = (map[t.category] || 0) + t.amount
  }
  return Object.entries(map)
    .map(([category, spent]) => ({ category, spent }))
    .sort((a, b) => b.spent - a.spent)
}

/**
 * Alokasi budget per kategori (proporsional terhadap pengeluaran).
 * Jika tidak ada pengeluaran, alokasi = 0.
 */
export function getCategoryAllocation(spent, totalSpent, budget) {
  const b = Math.max(0, Number(budget) || 0)
  const ts = Math.max(0, Number(totalSpent) || 0)
  if (b <= 0 || ts <= 0) return 0
  return Math.round((spent / ts) * b)
}

export function filterTransactions(
  transactions,
  { type = 'all', search = '', customCategories = [] } = {}
) {
  let filtered = transactions
  if (type !== 'all') {
    filtered = filtered.filter((transaction) => transaction.type === type)
  }

  const query = search.trim().toLocaleLowerCase('id-ID')
  if (!query) return filtered

  return filtered.filter((transaction) => {
    const category = cariKategori(transaction.type, transaction.category, customCategories)
    return (
      (transaction.note || '').toLocaleLowerCase('id-ID').includes(query) ||
      category.label.toLocaleLowerCase('id-ID').includes(query)
    )
  })
}
