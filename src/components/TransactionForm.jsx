import { useState } from 'react'
import CategoryPicker from './CategoryPicker'
import { kategoriUntuk } from '../lib/categories'
import { hariIni } from '../lib/format'

// Form tambah / edit transaksi.
export default function TransactionForm({
  initial,
  onSubmit,
  onCancel,
  customCategories = [],
  onAddCategory,
  onRemoveCategory,
}) {
  const initialType = initial?.type || 'expense'
  const defaultCategory = kategoriUntuk(initialType, customCategories, initial?.category)[0].id
  const [type, setType] = useState(initialType)
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState(initial?.category || defaultCategory)
  const [note, setNote] = useState(initial?.note || '')
  const [date, setDate] = useState(initial?.date || hariIni())
  const [error, setError] = useState('')

  function gantiJenis(t) {
    setType(t)
    setCategory(kategoriUntuk(t, customCategories)[0].id)
  }

  function submit(e) {
    e.preventDefault()
    const nominal = Number(amount.replace(/\D/g, ''))
    if (!nominal || nominal <= 0) {
      setError('Masukkan nominal yang benar.')
      return
    }
    setError('')
    onSubmit({ type, amount: nominal, category, note: note.trim(), date })
  }

  return (
    <form className="form" onSubmit={submit}>
      <div className="type-toggle">
        <button
          type="button"
          className={'type-btn' + (type === 'expense' ? ' active-expense' : '')}
          onClick={() => gantiJenis('expense')}
        >
          Pengeluaran
        </button>
        <button
          type="button"
          className={'type-btn' + (type === 'income' ? ' active-income' : '')}
          onClick={() => gantiJenis('income')}
        >
          Pemasukan
        </button>
      </div>

      <label className="field-label">Nominal</label>
      <div className="amount-input">
        <span className="amount-prefix">Rp</span>
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={amount}
          onChange={(e) => {
            const angka = e.target.value.replace(/\D/g, '')
            setAmount(angka ? Number(angka).toLocaleString('id-ID') : '')
          }}
        />
      </div>

      <label className="field-label">Kategori</label>
      <CategoryPicker
        type={type}
        value={category}
        onChange={setCategory}
        customCategories={customCategories}
        onAddCategory={onAddCategory}
        onRemoveCategory={onRemoveCategory}
      />

      <label className="field-label">Tanggal</label>
      <input className="text-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      <label className="field-label">Catatan (opsional)</label>
      <input
        className="text-input"
        type="text"
        placeholder="mis. makan siang warteg"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      {initial?.recurringId && (
        <div className="form-info">Transaksi otomatis. Perubahan hanya berlaku untuk transaksi ini.</div>
      )}
      {error && <div className="error-text">{error}</div>}

      <div className="form-actions">
        {initial && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Batal
          </button>
        )}
        <button type="submit" className="btn btn-primary">
          {initial ? 'Simpan Perubahan' : 'Tambah'}
        </button>
      </div>
    </form>
  )
}
