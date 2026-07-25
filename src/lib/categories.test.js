import { describe, expect, it } from 'vitest'
import { cariKategori, kategoriUntuk } from './categories'

describe('categories', () => {
  const custom = [
    { id: 'custom-expense-ngopi', type: 'expense', label: 'Ngopi', emoji: '☕', active: false },
  ]

  it('keeps a soft-deleted selected category available while editing', () => {
    expect(kategoriUntuk('expense', custom, 'custom-expense-ngopi')).toContainEqual(custom[0])
    expect(kategoriUntuk('expense', custom)).not.toContainEqual(custom[0])
  })

  it('resolves soft-deleted categories for transaction history', () => {
    expect(cariKategori('expense', 'custom-expense-ngopi', custom)).toEqual(custom[0])
  })
})
