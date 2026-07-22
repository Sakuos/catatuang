import { formatRupiah } from '../lib/format'
import { cariKategori } from '../lib/categories'

// Warna batang (dipakai berulang bila kategori banyak).
const WARNA = ['#0f766e', '#0891b2', '#7c3aed', '#db2777', '#ea580c', '#ca8a04', '#65a30d']

// Grafik pengeluaran per kategori untuk transaksi yang diberikan.
// Bentuk: batang horizontal proporsional (tanpa library chart).
// props: transactions -> array transaksi bulan terpilih
export default function CategoryChart({ transactions, customCategories = [] }) {
  const pengeluaran = transactions.filter((t) => t.type === 'expense')
  if (pengeluaran.length === 0) return null

  // Jumlahkan per kategori.
  const perKategori = {}
  for (const t of pengeluaran) {
    perKategori[t.category] = (perKategori[t.category] || 0) + t.amount
  }
  const total = Object.values(perKategori).reduce((a, b) => a + b, 0)

  // Urutkan dari terbesar.
  const baris = Object.entries(perKategori)
    .map(([cat, amt]) => ({ cat, amt, pct: Math.round((amt / total) * 100) }))
    .sort((a, b) => b.amt - a.amt)

  return (
    <div className="chart-card">
      <div className="chart-title">📊 Pengeluaran per kategori</div>
      {baris.map((r, i) => {
        const k = cariKategori('expense', r.cat, customCategories)
        return (
          <div key={r.cat} className="chart-row">
            <div className="chart-label">
              <span>
                {k.emoji} {k.label}
              </span>
              <span className="chart-value">
                {formatRupiah(r.amt)} · {r.pct}%
              </span>
            </div>
            <div className="chart-track">
              <div
                className="chart-fill"
                style={{ width: Math.max(r.pct, 3) + '%', background: WARNA[i % WARNA.length] }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
