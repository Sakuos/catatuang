import { cariKategori } from '../lib/categories'
import { formatRupiah } from '../lib/format'

export default function RecurringCard({
  patterns,
  customCategories = [],
  onAdd,
  onEdit,
  onToggle,
  onDelete,
}) {
  return (
    <div className="recurring-card">
      <div className="recurring-head">
        <div>
          <div className="recurring-title">🔄 Transaksi Otomatis</div>
          <div className="recurring-subtitle">Langganan dan pemasukan bulanan</div>
        </div>
        <button type="button" className="budget-set-btn" onClick={onAdd}>+ Atur</button>
      </div>

      {patterns.length === 0 ? (
        <div className="recurring-empty">Belum ada transaksi bulanan otomatis.</div>
      ) : (
        <div className="recurring-list">
          {patterns.map((pattern) => {
            const category = cariKategori(pattern.type, pattern.category, customCategories)
            return (
              <div key={pattern.id} className={'recurring-item' + (!pattern.active ? ' paused' : '')}>
                <div className="recurring-emoji">{category.emoji}</div>
                <div className="recurring-info">
                  <div className="recurring-name">
                    {pattern.note || category.label}
                    {!pattern.active && <span className="recurring-status">Dijeda</span>}
                  </div>
                  <div className="recurring-meta">
                    Tanggal {pattern.dayOfMonth} · {formatRupiah(pattern.amount)}
                  </div>
                </div>
                <div className="recurring-actions">
                  <button type="button" onClick={() => onEdit(pattern)}>Edit</button>
                  <button type="button" onClick={() => onToggle(pattern)}>{pattern.active ? 'Jeda' : 'Aktifkan'}</button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => {
                      if (confirm('Hapus pola ini? Transaksi lama tetap tersimpan.')) onDelete(pattern.id)
                    }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
