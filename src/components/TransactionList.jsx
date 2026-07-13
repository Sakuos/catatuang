import { formatRupiah, formatTanggal } from '../lib/format'
import { cariKategori } from '../lib/categories'

// Daftar transaksi, dikelompokkan per tanggal (terbaru di atas).
// props:
//   transactions -> array transaksi (sudah difilter per bulan)
//   onEdit(tx)   -> minta edit
//   onDelete(id) -> minta hapus
export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="empty">
        <div className="empty-emoji">🗒️</div>
        <p>Belum ada transaksi di bulan ini.</p>
        <p className="empty-hint">Tekan tombol + untuk menambah.</p>
      </div>
    )
  }

  // Urutkan terbaru dulu, lalu kelompokkan per tanggal.
  const urut = [...transactions].sort((a, b) => (a.date < b.date ? 1 : -1))
  const grup = {}
  for (const tx of urut) {
    if (!grup[tx.date]) grup[tx.date] = []
    grup[tx.date].push(tx)
  }

  return (
    <div className="tx-list">
      {Object.keys(grup).map((tanggal) => (
        <div key={tanggal} className="tx-group">
          <div className="tx-date">{formatTanggal(tanggal)}</div>
          {grup[tanggal].map((tx) => {
            const kat = cariKategori(tx.type, tx.category)
            return (
              <div key={tx.id} className="tx-item" onClick={() => onEdit(tx)}>
                <div className="tx-emoji">{kat.emoji}</div>
                <div className="tx-info">
                  <div className="tx-category">{kat.label}</div>
                  {tx.note && <div className="tx-note">{tx.note}</div>}
                </div>
                <div className="tx-right">
                  <div className={'tx-amount ' + tx.type}>
                    {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                  </div>
                  <button
                    type="button"
                    className="tx-delete"
                    aria-label="Hapus"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Hapus transaksi ini?')) onDelete(tx.id)
                    }}
                  >
                    🗑
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
