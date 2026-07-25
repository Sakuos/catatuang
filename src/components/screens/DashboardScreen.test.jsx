import { afterEach, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import DashboardScreen from './DashboardScreen'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const preferences = { budget: 0, goal: 0, saveBudget() {}, saveGoal() {} }
const ledger = {
  recurringPatterns: [],
  customCategories: [],
  toggleRecurring() {},
  deleteRecurring() {},
}

function baseProps(overrides = {}) {
  return {
    bulan: '2026-07',
    income: 5000000,
    expense: 118000,
    saved: 4882000,
    monthTransactions: [],
    preferences,
    ledger,
    onEditTransaction() {},
    onAddRecurring() {},
    onEditRecurring() {},
    onLihatSemua() {},
    ...overrides,
  }
}

function render(ui) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(ui))
  return {
    container,
    cleanup: () => {
      act(() => root.unmount())
      container.remove()
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

it('shows income, expense, and balance (income - expense)', () => {
  const { container, cleanup } = render(<DashboardScreen {...baseProps()} />)
  const balance = container.querySelector('.balance-card h2')
  expect(balance.textContent).toBe('Rp 4.882.000') // 5.000.000 - 118.000
  const grid = container.querySelector('.balance-grid')
  expect(grid.textContent).toContain('Rp 5.000.000')
  expect(grid.textContent).toContain('Rp 118.000')
  cleanup()
})

it('renders negative balance with class when expense exceeds income', () => {
  const { container, cleanup } = render(
    <DashboardScreen {...baseProps({ income: 100000, expense: 250000 })} />
  )
  const balance = container.querySelector('.balance-card h2')
  expect(balance.classList.contains('negative')).toBe(true)
  expect(balance.textContent).toBe('Rp -150.000')
  cleanup()
})

it('shows empty transaction hint when no transactions', () => {
  const { container, cleanup } = render(
    <DashboardScreen {...baseProps({ monthTransactions: [] })} />
  )
  expect(container.querySelector('.transaction-list.compact')).toBeNull()
  expect(container.textContent).toContain('Belum ada transaksi')
  cleanup()
})

it('shows at most 3 recent transactions', () => {
  const txs = Array.from({ length: 5 }, (_, i) => ({
    id: String(i),
    type: 'expense',
    amount: 1000 * (i + 1),
    category: 'makan',
    note: '',
    date: `2026-07-0${i + 1}`,
  }))
  const { container, cleanup } = render(
    <DashboardScreen {...baseProps({ monthTransactions: txs })} />
  )
  expect(container.querySelectorAll('.transaction-list.compact .transaction')).toHaveLength(3)
  cleanup()
})

it('calls onLihatSemua when "Lihat semua" clicked', () => {
  const onLihatSemua = vi.fn()
  const { container, cleanup } = render(<DashboardScreen {...baseProps({ onLihatSemua })} />)
  const btn = [...container.querySelectorAll('button')].find((b) =>
    b.textContent.includes('Lihat semua')
  )
  act(() => btn.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(onLihatSemua).toHaveBeenCalledTimes(1)
  cleanup()
})
