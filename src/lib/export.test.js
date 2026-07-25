import { describe, expect, it } from 'vitest'
import { buildCSV, parseCSV } from './export'

describe('CSV', () => {
  it('round-trips quoted commas and quotes', () => {
    const transactions = [
      {
        date: '2026-07-24',
        type: 'expense',
        category: 'makan',
        amount: 12500,
        note: 'Nasi, "spesial"',
      },
    ]

    expect(parseCSV(buildCSV(transactions))).toEqual(transactions)
  })

  it('skips malformed rows and accepts a BOM', () => {
    const csv =
      '﻿"Tanggal","Jenis","Kategori","Nominal","Catatan"\nrusak\n"2026-07-24","Pemasukan","gaji","1000",""'
    expect(parseCSV(csv)).toEqual([
      {
        date: '2026-07-24',
        type: 'income',
        category: 'gaji',
        amount: 1000,
        note: '',
      },
    ])
  })
})
