import { afterEach, expect, it } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import CashFlowChart from './CashFlowChart'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

function render(ui) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)
  act(() => root.render(ui))
  return {
    container,
    root,
    cleanup: () => {
      act(() => root.unmount())
      container.remove()
    },
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})

it('renders 7 weekday labels Min-Sab', () => {
  const { container, cleanup } = render(
    <CashFlowChart
      transactions={[
        { id: '1', type: 'income', amount: 50000, category: 'gaji', note: '', date: '2026-07-07' },
      ]}
      refIso="2026-07-07"
    />
  )
  const labels = [...container.querySelectorAll('.cashflow-xlabel')].map((el) => el.textContent)
  expect(labels).toEqual(['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'])
  cleanup()
})

it('renders y axis labels scaled from data', () => {
  const { container, cleanup } = render(
    <CashFlowChart
      transactions={[
        {
          id: '1',
          type: 'income',
          amount: 5000000,
          category: 'gaji',
          note: '',
          date: '2026-07-07',
        },
      ]}
      refIso="2026-07-07"
    />
  )
  const labels = [...container.querySelectorAll('.cashflow-ylabels span')].map(
    (el) => el.textContent
  )
  expect(labels).toEqual(['5 jt', '2,5 jt', '0'])
  cleanup()
})

it('shows empty state when no transactions', () => {
  const { container, cleanup } = render(<CashFlowChart transactions={[]} refIso="2026-07-07" />)
  expect(container.querySelector('.ui-state')).toBeTruthy()
  expect(container.textContent).toContain('Belum ada arus kas')
  cleanup()
})

it('shows loading state', () => {
  const { container, cleanup } = render(
    <CashFlowChart transactions={[]} refIso="2026-07-07" loading />
  )
  expect(container.textContent).toContain('Memuat arus kas')
  cleanup()
})

it('shows error state', () => {
  const { container, cleanup } = render(
    <CashFlowChart transactions={[]} refIso="2026-07-07" error="Jaringan gagal" />
  )
  expect(container.textContent).toContain('Gagal memuat arus kas')
  expect(container.textContent).toContain('Jaringan gagal')
  cleanup()
})

it('renders income and expense totals from data', () => {
  const { container, cleanup } = render(
    <CashFlowChart
      transactions={[
        { id: '1', type: 'income', amount: 100000, category: 'gaji', note: '', date: '2026-07-07' },
        {
          id: '2',
          type: 'expense',
          amount: 25000,
          category: 'makan',
          note: '',
          date: '2026-07-07',
        },
      ]}
      refIso="2026-07-07"
    />
  )
  const totals = container.querySelector('.cashflow-totals')
  expect(totals.textContent).toContain('Rp 100.000')
  expect(totals.textContent).toContain('Rp 25.000')
  expect(container.querySelector('.cashflow-line-income')).toBeTruthy()
  expect(container.querySelector('.cashflow-line-expense')).toBeTruthy()
  cleanup()
})
