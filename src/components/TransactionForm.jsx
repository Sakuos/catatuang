import { useState } from 'react'
import CategoryPicker from './CategoryPicker'
import { hariIni } from '../lib/format'

// Form tambah / edit transaksi.
// props:
//   initial (opsional) -> transaksi yang sedang diedit
//   onSubmit(data)     -> dipanggil saat disimpan
//   onCancel()         -> batal (mode edit)
export default function TransactionForm({ initial, onSubmit, onCancel }) {
  const [type, setType] = useState(initial?.type || 'expense')
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState(initial?.category || 'makan')
  const [note, setNote] = useState(initial?.note || '')
  const [date, setDate] = useState(initial?.date || hariIni())
  const [error, setError] = useState('')

  // Saat ganti jenis, reset kategori ke default jenis tsb.
  function gantiJenis(t) {
    setType(t)
    setCategory(t === 'income' ? 'gaji' : 'makan')
  }

  function submit(e) {
    e.preventDefault()
    const nominal = Number(amount)
    if (!nominal || nominal <= 0) {
      setError('Masukkan nominal yang benar.')
      return
    }
    setError('')
    onSubmit({ type, amount: nominal, category, note: note.trim(), date })
    // Reset form hanya kalau mode tambah (bukan edit).
    if (!initial) {
      setAmount('')
      setNote('')
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      {/* Pilih jenis: Pengeluaran / Pemasukan */}
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

      {/* Nominal */}
      <label className="field-label">Nominal</label>
      <div className="amount-input">
        <span className="amount-prefix">Rp</span>
        <input
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
        />
      </div>

      {/* Kategori */}
      <label className="field-label">Kategori</label>
      <CategoryPicker type={type} value={category} onChange={setCategory} />

      {/* Tanggal */}
      <label className="field-label">Tanggal</label>
      <input
        className="text-input"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Catatan */}
      <label className="field-label">Catatan (opsional)</label>
      <input
        className="text-input"
        type="text"
        placeholder="mis. makan siang warteg"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

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
