import { formatBulan } from '../lib/format'

// Navigasi bulan: tombol kiri/kanan untuk pindah bulan.
// props: value ('YYYY-MM'), onChange('YYYY-MM')
export default function MonthPicker({ value, onChange }) {
  function geser(delta) {
    const [y, m] = value.split('-').map(Number)
    const d = new Date(y, m - 1 + delta, 1)
    const ny = d.getFullYear()
    const nm = String(d.getMonth() + 1).padStart(2, '0')
    onChange(`${ny}-${nm}`)
  }

  return (
    <div className="month-picker">
      <button type="button" className="month-btn" onClick={() => geser(-1)} aria-label="Bulan sebelumnya">
        ‹
      </button>
      <span className="month-label">{formatBulan(value)}</span>
      <button type="button" className="month-btn" onClick={() => geser(1)} aria-label="Bulan berikutnya">
        ›
      </button>
    </div>
  )
}
