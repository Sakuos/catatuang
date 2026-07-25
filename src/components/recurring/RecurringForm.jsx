import { useState } from 'react'
import CategoryPicker from '../categories/CategoryPicker'
import AmountInput from '../shared/AmountInput'
import { parseAmount } from '../../lib/amount'
import TypeToggle from '../shared/TypeToggle'
import { kategoriUntuk } from '../../lib/categories'
import { hariIni } from '../../lib/format'

export default function RecurringForm({
  initial,
  onSubmit,
  onCancel,
  customCategories = [],
  onAddCategory,
  onRemoveCategory,
}) {
  const initialType = initial?.type || 'expense'
  const [type, setType] = useState(initialType)
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState(
    initial?.category || kategoriUntuk(initialType, customCategories)[0].id
  )
  const [note, setNote] = useState(initial?.note || '')
  const [dayOfMonth, setDayOfMonth] = useState(String(initial?.dayOfMonth || new Date().getDate()))
  const [startDate, setStartDate] = useState(initial?.startDate || hariIni())
  const [endDate, setEndDate] = useState(initial?.endDate || '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function gantiJenis(nextType) {
    setType(nextType)
    setCategory(kategoriUntuk(nextType, customCategories)[0].id)
  }

  function submit(e) {
    e.preventDefault()
    const nominal = parseAmount(amount)
    const day = Number(dayOfMonth)
    if (!nominal) return setError('Masukkan nominal yang benar.')
    if (!Number.isInteger(day) || day < 1 || day > 31)
      return setError('Tanggal bulanan harus 1–31.')
    if (!startDate || (endDate && endDate < startDate))
      return setError('Rentang tanggal tidak valid.')
    setError('')
    setIsSubmitting(true)
    onSubmit({ type, amount: nominal, category, note, dayOfMonth: day, startDate, endDate })
  }

  return (
    <form className="form" onSubmit={submit}>
      <TypeToggle value={type} onChange={gantiJenis} />

      <label className="field-label">Nominal bulanan</label>
      <AmountInput value={amount} onChange={setAmount} />

      <label className="field-label">Kategori</label>
      <CategoryPicker
        type={type}
        value={category}
        onChange={setCategory}
        customCategories={customCategories}
        onAddCategory={onAddCategory}
        onRemoveCategory={onRemoveCategory}
      />

      <label className="field-label">Catatan</label>
      <input
        className="text-input"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="mis. Netflix atau Gaji"
      />

      <div className="recurring-date-grid">
        <div>
          <label className="field-label">Setiap tanggal</label>
          <input
            className="text-input"
            type="number"
            min="1"
            max="31"
            inputMode="numeric"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Mulai</label>
          <input
            className="text-input"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
      </div>

      <label className="field-label">Selesai (opsional)</label>
      <input
        className="text-input"
        type="date"
        min={startDate}
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />

      <div className="form-info">
        Tanggal 29–31 otomatis pindah ke hari terakhir pada bulan yang lebih pendek.
        {initial ? ' Perubahan hanya memengaruhi transaksi yang belum dibuat.' : ''}
      </div>
      {error && <div className="error-text">{error}</div>}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={isSubmitting}>
          Batal
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : initial ? 'Simpan Perubahan' : 'Buat Otomatis'}
        </button>
      </div>
    </form>
  )
}
