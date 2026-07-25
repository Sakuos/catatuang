import { describe, expect, it } from 'vitest'
import { bulanDari, formatRingkas, formatRupiah, geserBulan, tanggalBulanan } from './format'

describe('format', () => {
  it('formats Rupiah using Indonesian separators', () => {
    expect(formatRupiah(15000)).toBe('Rp 15.000')
  })

  it('shifts months without UTC conversion', () => {
    expect(geserBulan('2026-01', -1)).toBe('2025-12')
    expect(geserBulan('2026-12', 1)).toBe('2027-01')
    expect(bulanDari('2026-07-24')).toBe('2026-07')
  })

  it('formats compact axis labels in Indonesian style', () => {
    expect(formatRingkas(5000000)).toBe('5 jt')
    expect(formatRingkas(2500000)).toBe('2,5 jt')
    expect(formatRingkas(75000)).toBe('75 rb')
    expect(formatRingkas(999)).toBe('999')
    expect(formatRingkas(0)).toBe('0')
  })

  it('clamps recurring dates to the last day of short months', () => {
    expect(tanggalBulanan('2024-02', 31)).toBe('2024-02-29')
    expect(tanggalBulanan('2025-02', 31)).toBe('2025-02-28')
    expect(tanggalBulanan('2026-04', 31)).toBe('2026-04-30')
  })
})
