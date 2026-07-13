import { useState } from 'react'
import { formatRupiah } from '../lib/format'

// Kartu budget bulanan: menampilkan batas, sudah terpakai, sisa,
// progress bar, dan peringatan bila mendekati/melewati batas.
// props:
//   budget (number) -> batas budget (0 = belum diatur)
//   spent  (number) -> total pengeluaran bulan ini
//   onSave(nilai)   -> simpan budget baru (0 = hapus)
export default function BudgetCard({ budget, spent, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(budget ? String(budget) : '')

  function simpan() {
    onSave(Number(val) || 0)
    setEditing(false)
  }

  function mulaiEdit() {
    setVal(budget ? String(budget) : '')
    setEditing(true)
  }

  // Mode input (mengatur / mengubah budget)
  if (editing) {
    return (
      <div className="budget-card">
        <div className="budget-edit">
          <span className="amount-prefix">Rp</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Batas pengeluaran / bulan"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            autoFocus
          />
          <button type="button" className="budget-save" onClick={simpan}>
            Simpan
          </button>
        </div>
      </div>
    )
  }

  // Belum ada budget
  if (!budget) {
    return (
      <div className="budget-card">
        <div className="budget-empty">
          <span>🎯 Belum ada budget bulanan</span>
          <button type="button" className="budget-set-btn" onClick={mulaiEdit}>
            Atur
          </button>
        </div>
      </div>
    )
  }

  // Tampilan normal dengan progress
  const pct = Math.min(100, Math.round((spent / budget) * 100))
  const over = spent > budget
  const near = !over && pct >= 80
  const sisa = budget - spent

  return (
    <div className={'budget-card' + (over ? ' over' : near ? ' near' : '')}>
      <div className="budget-head">
        <span>🎯 Budget bulan ini</span>
        <button type="button" className="budget-edit-btn" onClick={mulaiEdit}>
          ubah
        </button>
      </div>
      <div className="budget-track">
        <div className="budget-fill" style={{ width: pct + '%' }} />
      </div>
      <div className="budget-info">
        <span>
          {formatRupiah(spent)} / {formatRupiah(budget)}
        </span>
        <span>{over ? 'Lewat ' + formatRupiah(-sisa) : 'Sisa ' + formatRupiah(sisa)}</span>
      </div>
      {over && <div className="budget-warn">⚠️ Pengeluaran melebihi budget!</div>}
      {near && <div className="budget-warn">⚠️ Sudah {pct}% dari budget</div>}
    </div>
  )
}
