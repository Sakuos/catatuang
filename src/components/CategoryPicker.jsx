import { kategoriUntuk } from '../lib/categories'

// Pemilih kategori berbentuk deretan chip.
// props: type ('income'|'expense'), value (id kategori), onChange(id)
export default function CategoryPicker({ type, value, onChange }) {
  const daftar = kategoriUntuk(type)

  return (
    <div className="category-grid">
      {daftar.map((k) => (
        <button
          key={k.id}
          type="button"
          className={'chip' + (value === k.id ? ' chip-active' : '')}
          onClick={() => onChange(k.id)}
        >
          <span className="chip-emoji">{k.emoji}</span>
          {k.label}
        </button>
      ))}
    </div>
  )
}
