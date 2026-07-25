import { afterEach, expect, it, vi } from 'vitest'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import TransactionsScreen from './TransactionsScreen'

globalThis.IS_REACT_ACT_ENVIRONMENT = true

// Fixture transaksi Juli 2026 — nominal konkret untuk verifikasi summary & format.
function tx(id, overrides = {}) {
  return {
    id,
    type: 'expense',
    amount: 1000,
    category: 'makan',
    note: 'Makan siang',
    date: '2026-07-24',
    recurringId: null,
    ...overrides,
  }
}

const MONTH_TXS = [
  tx('1', {
    type: 'income',
    amount: 5000000,
    category: 'gaji',
    note: 'Gaji Bulanan',
    date: '2026-07-23',
  }),
  tx('2', {
    type: 'expense',
    amount: 25000,
    category: 'makan',
    note: 'Makan siang',
    date: '2026-07-24',
  }),
  tx('3', {
    type: 'expense',
    amount: 18000,
    category: 'transport',
    note: 'Transportasi',
    date: '2026-07-22',
  }),
]

const customCategories = []

function baseProps(overrides = {}) {
  return {
    bulan: '2026-07',
    income: 5000000,
    expense: 43000,
    search: '',
    filterType: 'all',
    visibleTransactions: MONTH_TXS,
    monthTransactions: MONTH_TXS,
    customCategories,
    onSearch() {},
    onFilterType() {},
    onEditTransaction() {},
    onDeleteTransaction() {},
    swipeHintDismissed: false,
    onDismissSwipeHint() {},
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

it('renders summary (income, expense, selisih) from period data', () => {
  const { container, cleanup } = render(<TransactionsScreen {...baseProps()} />)
  const card = container.querySelector('.summary-card')
  expect(card.textContent).toContain('Rp 5.000.000') // pemasukan
  expect(card.textContent).toContain('Rp 43.000') // pengeluaran
  expect(card.textContent).toContain('Rp 4.957.000') // selisih 5.000.000 - 43.000
  cleanup()
})

it('shows date row with active period and transaction count', () => {
  const { container, cleanup } = render(<TransactionsScreen {...baseProps()} />)
  const row = container.querySelector('.date-row')
  expect(row.textContent).toContain('Juli 2026')
  expect(row.textContent).toContain('3 transaksi')
  cleanup()
})

it('passes search and filter button to FilterBar', () => {
  const onSearch = vi.fn()
  const onFilterType = vi.fn()
  const { container, cleanup } = render(
    <TransactionsScreen {...baseProps({ onSearch, onFilterType, filterType: 'all' })} />
  )
  const input = container.querySelector('.search input')
  act(() => {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(input, 'gaji')
    input.dispatchEvent(new Event('input', { bubbles: true }))
  })
  expect(onSearch).toHaveBeenCalledWith('gaji')

  const filterBtn = container.querySelector('.filter-btn')
  expect(filterBtn.textContent).toBe('Semua')
  act(() => filterBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  // 'all' -> 'expense' (sesuai siklus FilterBar)
  expect(onFilterType).toHaveBeenCalledWith('expense')
  cleanup()
})

it('marks active filter button label', () => {
  const { container, cleanup } = render(
    <TransactionsScreen {...baseProps({ filterType: 'expense' })} />
  )
  const filterBtn = container.querySelector('.filter-btn')
  expect(filterBtn.textContent).toBe('Pengeluaran')
  cleanup()
})

it('renders transaction list with name, category, date, amount, icon', () => {
  const { container, cleanup } = render(<TransactionsScreen {...baseProps()} />)
  const items = container.querySelectorAll('.tx-item')
  expect(items).toHaveLength(3)
  // Pengeluaran merah, pemasukan hijau
  const amounts = container.querySelectorAll('.tx-amount')
  expect([...amounts].some((a) => a.classList.contains('expense'))).toBe(true)
  expect([...amounts].some((a) => a.classList.contains('income'))).toBe(true)
  // Format nominal konsisten Rupiah
  expect(container.textContent).toContain('Rp 5.000.000')
  expect(container.textContent).toContain('Rp 25.000')
  // Ikon kategori hadir
  expect(container.querySelectorAll('.tx-emoji').length).toBeGreaterThan(0)
  // Grouping per tanggal
  expect(container.querySelectorAll('.tx-date').length).toBeGreaterThan(0)
  cleanup()
})

it('clicking a row calls onEditTransaction with that tx', () => {
  const onEditTransaction = vi.fn()
  const { container, cleanup } = render(
    <TransactionsScreen {...baseProps({ onEditTransaction })} />
  )
  const item = container.querySelector('.tx-item')
  act(() => item.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(onEditTransaction).toHaveBeenCalledTimes(1)
  expect(onEditTransaction.mock.calls[0][0]).toHaveProperty('id')
  cleanup()
})

it('delete button stops row propagation and confirms before deleting', () => {
  const onEditTransaction = vi.fn()
  const onDeleteTransaction = vi.fn()
  const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(false)
  const { container, cleanup } = render(
    <TransactionsScreen {...baseProps({ onEditTransaction, onDeleteTransaction })} />
  )
  const delBtn = container.querySelector('.tx-delete')
  act(() => delBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  // Konfirmasi ditolak -> tidak hapus, tidak edit
  expect(confirmSpy).toHaveBeenCalledTimes(1)
  expect(onDeleteTransaction).not.toHaveBeenCalled()
  expect(onEditTransaction).not.toHaveBeenCalled()

  // Konfirmasi diterima -> hapus, tetap tidak edit
  confirmSpy.mockReturnValue(true)
  act(() => delBtn.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(onDeleteTransaction).toHaveBeenCalledTimes(1)
  expect(onEditTransaction).not.toHaveBeenCalled()
  confirmSpy.mockRestore()
  cleanup()
})

it('shows empty state when no transactions match', () => {
  const { container, cleanup } = render(
    <TransactionsScreen {...baseProps({ visibleTransactions: [] })} />
  )
  expect(container.querySelector('.tx-item')).toBeNull()
  expect(container.textContent).toContain('Belum ada transaksi')
  // Hint swipe tidak tampil saat kosong
  expect(container.querySelector('.gesture-hint')).toBeNull()
  cleanup()
})

it('shows swipe hint once and hides it after dismiss', () => {
  const onDismissSwipeHint = vi.fn()
  const { container, cleanup } = render(
    <TransactionsScreen {...baseProps({ onDismissSwipeHint })} />
  )
  const hint = container.querySelector('.gesture-hint')
  expect(hint).not.toBeNull()
  act(() => hint.dispatchEvent(new MouseEvent('click', { bubbles: true })))
  expect(onDismissSwipeHint).toHaveBeenCalledTimes(1)
  cleanup()
})

it('hides swipe hint when already dismissed', () => {
  const { container, cleanup } = render(
    <TransactionsScreen {...baseProps({ swipeHintDismissed: true })} />
  )
  expect(container.querySelector('.gesture-hint')).toBeNull()
  cleanup()
})
