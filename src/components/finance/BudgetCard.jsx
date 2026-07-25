import { useEffect, useState } from 'react'
import { useAmountEditor } from '../../hooks/useAmountEditor'
import { formatRupiah } from '../../lib/format'
import { getBudgetOverview } from '../../lib/finance'

// Kartu budget bulanan: menampilkan batas, sudah terpakai, sisa,
// progress bar, dan peringatan bila mendekati/melewati batas.
// props:
//   budget (number)  -> batas budget (0 = belum diatur)
//   spent  (number)  -> total pengeluaran bulan ini
//   onSave(nilai)    -> simpan budget baru (0 = hapus)
//   forceEdit (boolean) -> mulai mode edit dari luar (FAB action sheet)
//   onClose ()       -> callback setelah edit selesai dari forceEdit
export default function BudgetCard({ budget, spent, onSave, forceEdit, onClose }) {
  const editor = useAmountEditor(budget, onSave)
  const [wasForceEdit, setWasForceEdit] = useState(false)

  useEffect(() => {
    if (forceEdit && !editor.editing) {
      editor.startEditing()
      setWasForceEdit(true)
    }
  }, [forceEdit, editor])

  function handleSave() {
    editor.save()
    if (wasForceEdit) {
      setWasForceEdit(false)
      onClose?.()
    }
  }

  function handleCancel() {
    editor.setEditing(false)
    if (wasForceEdit) {
      setWasForceEdit(false)
      onClose?.()
    }
  }

  // Mode input (mengatur / mengubah budget)
  if (editor.editing) {
    return (
      <div className="budget-card">
        <label className="field-label" style={{ marginTop: 0 }}>
          Budget bulanan
        </label>
        <div className="amount-input">
          <span className="amount-prefix">Rp</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={editor.draft}
            onChange={(e) => editor.setDraft(e.target.value)}
            autoFocus
          />
        </div>
        <div className="form-actions">
          {wasForceEdit ? (
            <button type="button" className="btn btn-ghost" onClick={handleCancel}>
              Batal
            </button>
          ) : (
            <button type="button" className="btn btn-ghost" onClick={handleCancel}>
              Batal
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={handleSave}>
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
          <button type="button" className="budget-set-btn" onClick={editor.startEditing}>
            Atur
          </button>
        </div>
      </div>
    )
  }

  // Tampilan normal dengan progress
  const overview = getBudgetOverview(budget, spent)
  const { pct, over, near, sisa } = overview

  return (
    <div className={'budget-card' + (over ? ' over' : near ? ' near' : '')}>
      <div className="budget-head">
        <span>🎯 Budget bulan ini</span>
        <button type="button" className="budget-edit-btn" onClick={editor.startEditing}>
          ubah
        </button>
      </div>
      <div
        className="budget-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="budget-fill" style={{ width: pct + '%' }} />
      </div>
      <div className="budget-info">
        <span>
          {formatRupiah(spent)} / {formatRupiah(budget)}
        </span>
        <span>{over ? 'Lewat ' + formatRupiah(spent - budget) : 'Sisa ' + formatRupiah(sisa)}</span>
      </div>
      {over && <div className="budget-warn">⚠️ Pengeluaran melebihi budget!</div>}
      {near && <div className="budget-warn">⚠️ Sudah {pct}% dari budget</div>}
    </div>
  )
}
