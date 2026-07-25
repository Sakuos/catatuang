import { formatBulan, geserBulan } from '../../lib/format'

// Navigasi bulan: tombol kiri/kanan untuk pindah bulan.
// props: value ('YYYY-MM'), onChange('YYYY-MM')
export default function MonthPicker({ value, onChange }) {
  function geser(delta) {
    onChange(geserBulan(value, delta))
  }

  return (
    <div className="month-picker">
      <button
        type="button"
        className="month-btn"
        onClick={() => geser(-1)}
        aria-label="Bulan sebelumnya"
      >
        ‹
      </button>
      <span className="month-label">{formatBulan(value)}</span>
      <button
        type="button"
        className="month-btn"
        onClick={() => geser(1)}
        aria-label="Bulan berikutnya"
      >
        ›
      </button>
    </div>
  )
}
