import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  addCustomCategory,
  addRecurringPattern,
  addTransaction,
  generateRecurringTransactions,
  getCustomCategories,
  getRecurringPatterns,
  getTransactions,
  importTransactions,
  removeCustomCategory,
  removeTransaction,
  setRecurringActive,
  updateRecurringPattern,
  updateTransaction,
} from './storage'

beforeEach(() => {
  localStorage.clear()
  vi.restoreAllMocks()
})

describe('storage facade', () => {
  it('falls back to an empty array for broken storage JSON', () => {
    localStorage.setItem('catatuang.transactions', '{rusak')
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(getTransactions()).toEqual([])
  })

  it('keeps transaction CRUD and import dedup behavior', () => {
    const input = {
      type: 'expense',
      amount: '12500',
      category: 'makan',
      note: 'Siang',
      date: '2026-07-24',
    }
    const created = addTransaction(input)
    expect(created.amount).toBe(12500)
    expect(updateTransaction(created.id, { amount: '15000' }).amount).toBe(15000)
    expect(importTransactions([{ ...input, amount: 15000 }])).toBe(0)
    removeTransaction(created.id)
    expect(getTransactions()).toEqual([])
  })

  it('rejects preset collisions and restores soft-deleted custom categories', () => {
    expect(() => addCustomCategory('expense', ' Makan ')).toThrow('Kategori itu sudah tersedia.')
    const category = addCustomCategory('expense', 'Ngopi', '☕')
    expect(removeCustomCategory(category.id)).toBe(true)
    expect(getCustomCategories()[0].active).toBe(false)
    const restored = addCustomCategory('expense', '  ngopi ', '🥤')
    expect(restored.id).toBe(category.id)
    expect(restored.active).toBe(true)
    expect(restored.emoji).toBe('🥤')
  })
})

describe('recurring storage', () => {
  const recurring = {
    type: 'expense',
    amount: 100000,
    category: 'tagihan',
    note: 'Internet',
    dayOfMonth: 31,
    startDate: '2026-01-01',
    endDate: '',
  }

  it('catches up, clamps short months, and stays idempotent', () => {
    const pattern = addRecurringPattern(recurring)
    expect(generateRecurringTransactions('2026-03-31')).toBe(3)
    expect(getTransactions().map((tx) => tx.date)).toEqual([
      '2026-01-31',
      '2026-02-28',
      '2026-03-31',
    ])
    expect(generateRecurringTransactions('2026-03-31')).toBe(0)
    expect(getRecurringPatterns()[0].generatedPeriods).toEqual(['2026-01', '2026-02', '2026-03'])

    const february = getTransactions().find((tx) => tx.recurringPeriod === '2026-02')
    removeTransaction(february.id)
    expect(generateRecurringTransactions('2026-03-31')).toBe(0)
    expect(getTransactions()).toHaveLength(2)
    expect(getTransactions().every((tx) => tx.recurringId === pattern.id)).toBe(true)
  })

  it('supports pause, resume, and edit without clearing its ledger', () => {
    const pattern = addRecurringPattern(recurring)
    setRecurringActive(pattern.id, false)
    expect(generateRecurringTransactions('2026-01-31')).toBe(0)
    setRecurringActive(pattern.id, true)
    expect(generateRecurringTransactions('2026-01-31')).toBe(1)
    const updated = updateRecurringPattern(pattern.id, { amount: 200000 })
    expect(updated.amount).toBe(200000)
    expect(updated.generatedPeriods).toEqual(['2026-01'])
    expect(generateRecurringTransactions('2026-02-28')).toBe(1)
    expect(getTransactions().find((tx) => tx.recurringPeriod === '2026-02').amount).toBe(200000)
  })
})
