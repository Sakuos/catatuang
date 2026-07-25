import { useEffect, useState } from 'react'
import { useAmountEditor } from '../../hooks/useAmountEditor'
import { formatBulan, formatRupiah } from '../../lib/format'

// Kartu target menabung.
// props:
//   goal (number)     -> target (0 = belum diatur)
//   saved (number)    -> tabungan saat ini (saldo semua waktu)
//   deadline (string) -> 'YYYY-MM' target deadline (opsional)
//   onSave(amount, deadline) -> simpan target baru (0 = hapus)
//   forceEdit (boolean) -> mulai mode edit dari luar (FAB action sheet)
//   onClose ()        -> callback setelah edit selesai dari forceEdit
export default function GoalCard({ goal, saved = 0, deadline = '', onSave, forceEdit, onClose }) {
  const editor = useAmountEditor(goal, onSave)
  const [deadlineDraft, setDeadlineDraft] = useState(deadline)
  const [wasForceEdit, setWasForceEdit] = useState(false)

  useEffect(() => {
    if (forceEdit && !editor.editing) {
      editor.startEditing()
      setDeadlineDraft(deadline)
      setWasForceEdit(true)
    }
  }, [forceEdit, editor, deadline])

  function handleSave() {
    editor.save()
    onSave(Number(editor.draft) || 0, deadlineDraft)
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

  if (editor.editing) {
    return (
      <div className="goal-card">
        <label className="field-label" style={{ marginTop: 0 }}>
          Target nominal
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
        <label className="field-label">Deadline (opsional)</label>
        <input
          className="text-input"
          type="month"
          value={deadlineDraft}
          onChange={(e) => setDeadlineDraft(e.target.value)}
        />
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

  if (!goal) {
    return (
      <div className="goal-card">
        <div className="budget-empty">
          <span>🏆 Belum ada target menabung</span>
          <button type="button" className="budget-set-btn" onClick={editor.startEditing}>
            Atur
          </button>
        </div>
      </div>
    )
  }

  const pct = Math.max(0, Math.min(100, Math.round((saved / goal) * 100)))
  const tercapai = saved >= goal
  const kurang = Math.max(0, goal - saved)
  const deadlineLabel = deadline ? formatBulan(deadline) : ''

  // Cek apakah deadline sudah lewat dan target belum tercapai.
  const now = new Date()
  const deadlineDate = deadline ? new Date(deadline + '-01T00:00:00') : null
  const deadlineLewat = deadlineDate && now > deadlineDate && !tercapai

  return (
    <article className={'goal-card' + (tercapai ? ' done' : deadlineLewat ? ' over' : '')}>
      <div className="goal-top">
        <div className="target-icon">◎</div>
        <div>
          <strong>Target menabung</strong>
          <span>
            {tercapai
              ? '🎉 Tercapai!'
              : deadlineLewat
                ? '⚠️ Deadline lewat'
                : deadlineLabel
                  ? `Deadline ${deadlineLabel}`
                  : `Kurang ${formatRupiah(kurang)}`}
          </span>
        </div>
        <b className={tercapai ? 'income' : deadlineLewat ? 'expense' : ''}>{pct}%</b>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <i style={{ width: pct + '%' }}></i>
      </div>
      <div className="goal-values">
        <span>
          Terkumpul <b>{formatRupiah(saved)}</b>
        </span>
        <span>
          Target <b>{formatRupiah(goal)}</b>
        </span>
      </div>
      <button type="button" className="budget-edit-btn" onClick={editor.startEditing}>
        ubah
      </button>
    </article>
  )
}
