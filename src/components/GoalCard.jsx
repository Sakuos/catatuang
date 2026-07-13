import { useState } from 'react'
import { formatRupiah } from '../lib/format'

// Kartu target menabung.
// props:
//   goal (number)  -> target (0 = belum diatur)
//   saved (number) -> tabungan saat ini (saldo semua waktu)
//   onSave(nilai)  -> simpan target baru (0 = hapus)
export default function GoalCard({ goal, saved, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(goal ? String(goal) : '')

  function simpan() {
    onSave(Number(val) || 0)
    setEditing(false)
  }

  function mulaiEdit() {
    setVal(goal ? String(goal) : '')
    setEditing(true)
  }

  if (editing) {
    return (
      <div className="goal-card">
        <div className="budget-edit">
          <span className="amount-prefix">Rp</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Target menabung"
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

  if (!goal) {
    return (
      <div className="goal-card">
        <div className="budget-empty">
          <span>🏆 Belum ada target menabung</span>
          <button type="button" className="budget-set-btn" onClick={mulaiEdit}>
            Atur
          </button>
        </div>
      </div>
    )
  }

  const pct = Math.max(0, Math.min(100, Math.round((saved / goal) * 100)))
  const tercapai = saved >= goal
  const kurang = goal - saved

  return (
    <div className={'goal-card' + (tercapai ? ' done' : '')}>
      <div className="budget-head">
        <span>🏆 Target menabung</span>
        <button type="button" className="budget-edit-btn" onClick={mulaiEdit}>
          ubah
        </button>
      </div>
      <div className="budget-track">
        <div className="goal-fill" style={{ width: pct + '%' }} />
      </div>
      <div className="budget-info">
        <span>
          {formatRupiah(saved)} / {formatRupiah(goal)}
        </span>
        <span>{tercapai ? '🎉 Tercapai!' : 'Kurang ' + formatRupiah(kurang)}</span>
      </div>
    </div>
  )
}
