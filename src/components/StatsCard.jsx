import { formatRupiah } from '../lib/format'
import { cariKategori } from '../lib/categories'

// Kartu statistik ringkas untuk bulan terpilih.
// props:
//   transactions -> transaksi bulan terpilih
//   bulan ('YYYY-MM')
export default function StatsCard({ transactions, bulan }) {
  if (transactions.length === 0) return null

  const pengeluaran = transactions.filter((t) => t.type === 'expense')
  const totalKeluar = pengeluaran.reduce((a, t) => a + t.amount, 0)

  // Jumlah hari di bulan tsb (untuk rata-rata per hari).
  const [y, m] = bulan.split('-').map(Number)
  const jumlahHari = new Date(y, m, 0).getDate()
  const rataPerHari = Math.round(totalKeluar / jumlahHari)

  // Transaksi pengeluaran terbesar.
  let terbesar = null
  for (const t of pengeluaran) {
    if (!terbesar || t.amount > terbesar.amount) terbesar = t
  }
  const katTerbesar = terbesar ? cariKategori('expense', terbesar.category) : null

  return (
    <div className="stats-card">
      <div className="stats-title">📊 Statistik bulan ini</div>
      <div className="stats-grid">
        <div className="stat">
          <div className="stat-value">{formatRupiah(rataPerHari)}</div>
          <div className="stat-label">Rata-rata / hari</div>
        </div>
        <div className="stat">
          <div className="stat-value">{transactions.length}</div>
          <div className="stat-label">Transaksi</div>
        </div>
        <div className="stat">
          <div className="stat-value">
            {terbesar ? formatRupiah(terbesar.amount) : '-'}
          </div>
          <div className="stat-label">
            {katTerbesar ? `Terbesar (${katTerbesar.label})` : 'Terbesar'}
          </div>
        </div>
      </div>
    </div>
  )
}
