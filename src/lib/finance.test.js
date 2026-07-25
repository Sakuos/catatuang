import { expect, it } from 'vitest'
import {
  filterTransactions,
  getBudgetOverview,
  getCategoryAllocation,
  getExpenseByCategory,
  getMonthlyTotals,
  getSavedTotal,
  getTransactionsForMonth,
  getWeeklyCashFlow,
  WEEKDAY_LABELS,
} from './finance'

const transactions = [
  { id: '1', type: 'income', amount: 5000000, category: 'gaji', note: '', date: '2026-07-01' },
  {
    id: '2',
    type: 'expense',
    amount: 20000,
    category: 'makan',
    note: 'Warteg',
    date: '2026-07-02',
  },
  {
    id: '3',
    type: 'expense',
    amount: 30000,
    category: 'custom-expense-kopi',
    note: '',
    date: '2026-06-02',
  },
  { id: '4', type: 'income', amount: 100000, category: 'bonus', note: '', date: '2026-07-07' },
  { id: '5', type: 'expense', amount: 50000, category: 'makan', note: '', date: '2026-07-07' },
]

it('selects monthly transactions and totals', () => {
  const july = getTransactionsForMonth(transactions, '2026-07')
  expect(july).toHaveLength(4)
  expect(getMonthlyTotals(july)).toEqual({ income: 5100000, expense: 70000 })
  expect(getSavedTotal(transactions)).toBe(5000000)
})

it('filters by type, note, and category label', () => {
  const customCategories = [
    { id: 'custom-expense-kopi', type: 'expense', label: 'Ngopi', emoji: '☕', active: true },
  ]
  expect(filterTransactions(transactions, { type: 'income' })).toEqual([
    transactions[0],
    transactions[3],
  ])
  expect(filterTransactions(transactions, { search: 'warteg' })).toEqual([transactions[1]])
  expect(filterTransactions(transactions, { search: 'NGOPI', customCategories })).toEqual([
    transactions[2],
  ])
})

it('computes weekly cash flow (7 days Min-Sab)', () => {
  // 2026-07-07 is Tuesday. getDay=2, so Min=2026-07-06, Sab=2026-07-12.
  const week = getWeeklyCashFlow(transactions, '2026-07-07')
  expect(week).toHaveLength(7)
  expect(week[0].date).toBe('2026-07-05') // Min
  expect(week[6].date).toBe('2026-07-11') // Sab

  const totalIncome = week.reduce((a, d) => a + d.income, 0)
  const totalExpense = week.reduce((a, d) => a + d.expense, 0)
  expect(totalIncome).toBe(100000) // 2026-07-07 bonus
  expect(totalExpense).toBe(50000) // 2026-07-07 makan (2026-07-02 di pekan sebelumnya)
})

it('returns zeroes for empty transaction list', () => {
  const week = getWeeklyCashFlow([], '2026-07-07')
  expect(week.every((d) => d.income === 0 && d.expense === 0)).toBe(true)
})

it('exports 7 weekday labels Min-Sab', () => {
  expect(WEEKDAY_LABELS).toEqual(['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'])
})

it('calculates saldo (income - expense) via getSavedTotal', () => {
  // income: 5,000,000 + 100,000 = 5,100,000 → expense: 20,000 + 30,000 + 50,000 = 100,000 → saldo = 5,000,000
  expect(getSavedTotal(transactions)).toBe(5000000)
})

// ---------- Budget overview tests ----------

it('getBudgetOverview calculates pct, sisa, over, near correctly', () => {
  // Budget 5jt, spent 118rb → 2%, sisa 4.882.000
  const o = getBudgetOverview(5000000, 118000)
  expect(o.pct).toBe(2)
  expect(o.sisa).toBe(4882000)
  expect(o.over).toBe(false)
  expect(o.near).toBe(false)
})

it('getBudgetOverview detects over-budget', () => {
  // Budget 100rb, spent 150rb → over, sisa 0
  const o = getBudgetOverview(100000, 150000)
  expect(o.over).toBe(true)
  expect(o.sisa).toBe(0)
  expect(o.pct).toBe(100) // capped at 100
})

it('getBudgetOverview detects near-budget (>=80%)', () => {
  const o = getBudgetOverview(100000, 85000)
  expect(o.near).toBe(true)
  expect(o.over).toBe(false)
  expect(o.pct).toBe(85)
})

it('getBudgetOverview returns zeros when budget is 0', () => {
  const o = getBudgetOverview(0, 50000)
  expect(o.budget).toBe(0)
  expect(o.pct).toBe(0)
  expect(o.sisa).toBe(0)
  expect(o.over).toBe(false)
  expect(o.near).toBe(false)
})

it('getBudgetOverview handles negative/invalid input gracefully', () => {
  const o = getBudgetOverview(-100, -50)
  expect(o.budget).toBe(0)
  expect(o.pct).toBe(0)
})

// ---------- Expense by category tests ----------

it('getExpenseByCategory groups and sorts expenses', () => {
  // transactions: makan 20rb (Jul) + 50rb (Jul), custom-expense-kopi 30rb (Jun)
  const result = getExpenseByCategory(transactions)
  expect(result).toHaveLength(2)
  expect(result[0]).toEqual({ category: 'makan', spent: 70000 })
  expect(result[1]).toEqual({ category: 'custom-expense-kopi', spent: 30000 })
})

it('getExpenseByCategory returns empty array for no expenses', () => {
  expect(getExpenseByCategory([])).toEqual([])
})

// ---------- Category allocation tests ----------

it('getCategoryAllocation computes proportional allocation', () => {
  // Belanja 75rb, total expense 118rb, budget 5jt → alokasi = (75/118)*5jt ≈ 3.178.000
  const alokasi = getCategoryAllocation(75000, 118000, 5000000)
  expect(alokasi).toBe(3177966)
})

it('getCategoryAllocation returns 0 when budget is 0', () => {
  expect(getCategoryAllocation(75000, 118000, 0)).toBe(0)
})

it('getCategoryAllocation returns 0 when total spent is 0', () => {
  expect(getCategoryAllocation(0, 0, 5000000)).toBe(0)
})

// ---------- Fixture consistency (Belanja data) ----------

it('fixture: Belanja spent is 75.000 not 25.000', () => {
  const customTransactions = [
    { id: '1', type: 'expense', amount: 75000, category: 'belanja', note: '', date: '2026-07-21' },
  ]
  const belanjaTx = customTransactions.filter((t) => t.category === 'belanja')
  const totalBelanja = belanjaTx.reduce((a, t) => a + t.amount, 0)
  expect(totalBelanja).toBe(75000)
})
