import { afterEach, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import BudgetScreen from './BudgetScreen'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

const preferences = {
  budget: 5000000,
  goal: 10000000,
  goalDeadline: '2026-12',
  saveBudget() {},
  saveGoal() {},
}
const ledger = {
  recurringPatterns: [],
  customCategories: [],
}

function baseProps(overrides = {}) {
  return {
    bulan: '2026-07',
    expense: 118000,
    saved: 4882000,
    monthTransactions: [
      { id: '1', type: 'income', amount: 5000000, category: 'gaji', note: '', date: '2026-07-23' },
      { id: '2', type: 'expense', amount: 25000, category: 'makan', note: '', date: '2026-07-24' },
      {
        id: '3',
        type: 'expense',
        amount: 18000,
        category: 'transport',
        note: '',
        date: '2026-07-22',
      },
      {
        id: '4',
        type: 'expense',
        amount: 75000,
        category: 'belanja',
        note: '',
        date: '2026-07-21',
      },
    ],
    preferences,
    ledger,
    editorSheet: null,
    onCloseEditor() {},
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

it('shows budget hero with correct total, spent, and sisa', () => {
  const { container, cleanup } = render(<BudgetScreen {...baseProps()} />)
  const hero = container.querySelector('.budget-hero')
  expect(hero).not.toBeNull()
  expect(hero.textContent).toContain('Rp 5.000.000')
  expect(hero.textContent).toContain('Rp 118.000')
  expect(hero.textContent).toContain('Rp 4.882.000')
  cleanup()
})

it('shows 2% ring progress for 118k/5jt', () => {
  const { container, cleanup } = render(<BudgetScreen {...baseProps()} />)
  const ring = container.querySelector('.ring span')
  expect(ring.textContent).toBe('2%')
  cleanup()
})

it('shows empty state when budget is 0', () => {
  const { container, cleanup } = render(
    <BudgetScreen {...baseProps({ preferences: { ...preferences, budget: 0 } })} />
  )
  const hero = container.querySelector('.budget-hero.empty')
  expect(hero).not.toBeNull()
  expect(hero.textContent).toContain('Belum diatur')
  cleanup()
})

it('shows over-budget state when expense exceeds budget', () => {
  const { container, cleanup } = render(<BudgetScreen {...baseProps({ expense: 6000000 })} />)
  const hero = container.querySelector('.budget-hero.over')
  expect(hero).not.toBeNull()
  // Sisa should be 0 when over
  expect(hero.textContent).toContain('Rp 0')
  cleanup()
})

it('lists categories with spent and allocation', () => {
  const { container, cleanup } = render(<BudgetScreen {...baseProps()} />)
  const items = container.querySelectorAll('.budget-item')
  expect(items.length).toBe(3) // makan, transport, belanja
  // Belanja should be 75.000 (not 25.000)
  const belanjaItem = [...items].find((el) => el.textContent.includes('Belanja'))
  expect(belanjaItem.textContent).toContain('Rp 75.000')
  cleanup()
})

it('shows empty category hint when no expenses', () => {
  const { container, cleanup } = render(
    <BudgetScreen
      {...baseProps({
        monthTransactions: [
          {
            id: '1',
            type: 'income',
            amount: 5000000,
            category: 'gaji',
            note: '',
            date: '2026-07-23',
          },
        ],
      })}
    />
  )
  expect(container.textContent).toContain('Belum ada pengeluaran')
  cleanup()
})

it('shows goal card with correct saved/target and percentage', () => {
  const { container, cleanup } = render(<BudgetScreen {...baseProps()} />)
  const goal = container.querySelector('.goal-card')
  expect(goal).not.toBeNull()
  expect(goal.textContent).toContain('Rp 4.882.000') // terkumpul (saved)
  expect(goal.textContent).toContain('Rp 10.000.000') // target
  expect(goal.textContent).toContain('49%')
  cleanup()
})

it('shows goal deadline label', () => {
  const { container, cleanup } = render(<BudgetScreen {...baseProps()} />)
  const goal = container.querySelector('.goal-card')
  expect(goal.textContent).toContain('Desember 2026')
  cleanup()
})

it('marks goal as done when saved >= goal', () => {
  const { container, cleanup } = render(<BudgetScreen {...baseProps({ saved: 10000000 })} />)
  const goal = container.querySelector('.goal-card.done')
  expect(goal).not.toBeNull()
  expect(goal.textContent).toContain('Tercapai')
  cleanup()
})

it('triggers budget edit when editorSheet is budget', () => {
  const { container, cleanup } = render(<BudgetScreen {...baseProps({ editorSheet: 'budget' })} />)
  const input = container.querySelector('.budget-card input[type="number"]')
  expect(input).not.toBeNull()
  cleanup()
})

it('triggers goal edit when editorSheet is goal', () => {
  const { container, cleanup } = render(<BudgetScreen {...baseProps({ editorSheet: 'goal' })} />)
  const input = container.querySelector('.goal-card input[type="number"]')
  expect(input).not.toBeNull()
  cleanup()
})

it('rounds percentage correctly', () => {
  // 118000 / 5000000 = 2.36% → rounds to 2
  const { container, cleanup } = render(<BudgetScreen {...baseProps()} />)
  const ring = container.querySelector('.ring span')
  expect(ring.textContent).toBe('2%')
  cleanup()
})
