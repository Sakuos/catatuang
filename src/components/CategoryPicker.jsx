import { useState } from 'react'
import { kategoriPresetUntuk, kategoriUntuk } from '../lib/categories'

// Pemilih kategori preset + kustom.
export default function CategoryPicker({
  type,
  value,
  onChange,
  customCategories = [],
  onAddCategory,
  onRemoveCategory,
}) {
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('📦')
  const [error, setError] = useState('')
  const daftar = kategoriUntuk(type, customCategories, value)

  function tambah() {
    try {
      const category = onAddCategory(type, label, emoji)
      onChange(category.id)
      setLabel('')
      setEmoji('📦')
      setError('')
      setAdding(false)
    } catch (err) {
      setError(err.message || 'Gagal menambah kategori.')
    }
  }

  function hapus(category) {
    if (!confirm(`Hapus kategori “${category.label}”? Transaksi lama tetap aman.`)) return
    onRemoveCategory(category.id)
    if (value === category.id) onChange(kategoriPresetUntuk(type)[0].id)
  }

  return (
    <div>
      <div className="category-grid">
        {daftar.map((k) => {
          const custom = k.id.startsWith('custom-')
          return (
            <div key={k.id} className={'category-chip-wrap' + (k.active === false ? ' inactive' : '')}>
              <button
                type="button"
                className={'chip' + (value === k.id ? ' chip-active' : '')}
                onClick={() => onChange(k.id)}
              >
                <span className="chip-emoji">{k.emoji}</span>
                {k.label}
              </button>
              {custom && k.active !== false && onRemoveCategory && (
                <button
                  type="button"
                  className="category-remove"
                  aria-label={`Hapus kategori ${k.label}`}
                  onClick={() => hapus(k)}
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
        {onAddCategory && (
          <button type="button" className="chip category-add-btn" onClick={() => setAdding(!adding)}>
            + Kategori
          </button>
        )}
      </div>

      {adding && (
        <div className="category-add-form">
          <input
            className="category-emoji-input"
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            aria-label="Emoji kategori"
            maxLength={4}
          />
          <input
            className="text-input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nama kategori"
            maxLength={30}
            autoFocus
          />
          <button type="button" className="budget-save" onClick={tambah}>
            Tambah
          </button>
        </div>
      )}
      {error && <div className="error-text">{error}</div>}
    </div>
  )
}
