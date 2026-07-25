import { useMemo } from 'react'
import { getWeeklyCashFlow, WEEKDAY_LABELS } from '../../lib/finance'
import { formatRingkas, formatRupiah } from '../../lib/format'
import { EmptyState, ErrorState, LoadingState } from '../ui/States'

// Grafik arus kas mingguan (Min–Sab) dari transaksi existing.
// Lebih pendek ~20% dari desain lama; label sumbu tak terpotong di layar kecil.
// props:
//   transactions -> array transaksi bulan terpilih
//   loading (bool) -> tampilkan loading state
//   error (string|null) -> tampilkan error state
//   refIso ('YYYY-MM-DD') -> tanggal acuan (hari ini)
export default function CashFlowChart({
  transactions = [],
  loading = false,
  error = null,
  refIso,
}) {
  const weekly = useMemo(() => getWeeklyCashFlow(transactions, refIso), [transactions, refIso])
  const maxVal = Math.max(...weekly.map((d) => Math.max(d.income, d.expense)), 1)

  if (loading) return <LoadingState title="Memuat arus kas…" />
  if (error) return <ErrorState title="Gagal memuat arus kas" hint={error} />

  const adaData = weekly.some((d) => d.income > 0 || d.expense > 0)
  if (!adaData) {
    return (
      <EmptyState
        title="Belum ada arus kas minggu ini."
        hint="Tambahkan transaksi untuk melihat grafik."
      />
    )
  }

  const W = 320
  const H = 84 // ~20% lebih pendek dari 130
  const PAD = { top: 12, bottom: 16, left: 0, right: 0 }
  const plotH = H - PAD.top - PAD.bottom
  const stepX = W / 6

  const toX = (i) => i * stepX
  const toY = (v) => PAD.top + plotH - (v / maxVal) * plotH

  const incomePath = weekly.map((d, i) => `${i ? 'L' : 'M'}${toX(i)},${toY(d.income)}`).join(' ')
  const expensePath = weekly.map((d, i) => `${i ? 'L' : 'M'}${toX(i)},${toY(d.expense)}`).join(' ')
  const incomeArea = `${incomePath} L${W},${H - PAD.bottom} L0,${H - PAD.bottom} Z`

  const totalIncome = weekly.reduce((a, d) => a + d.income, 0)
  const totalExpense = weekly.reduce((a, d) => a + d.expense, 0)

  return (
    <div className="cashflow-card">
      <div className="cashflow-legend">
        <span className="legend-item">
          <i className="dot income-bg" />
          Pemasukan
        </span>
        <span className="legend-item">
          <i className="dot expense-bg" />
          Pengeluaran
        </span>
      </div>
      <div className="cashflow-plot" role="img" aria-label="Grafik arus kas minggu ini">
        <div className="cashflow-ylabels" aria-hidden="true">
          <span>{formatRingkas(maxVal)}</span>
          <span>{formatRingkas(maxVal / 2)}</span>
          <span>0</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="cashflow-svg">
          <defs>
            <linearGradient id="cashflow-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--income)" stopOpacity="0.25" />
              <stop offset="1" stopColor="var(--income)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            className="cashflow-grid"
            d={`M0 ${toY(maxVal)} H${W} M0 ${toY(maxVal / 2)} H${W} M0 ${toY(0)} H${W}`}
          />
          <path className="cashflow-area" d={incomeArea} fill="url(#cashflow-fill)" />
          <path className="cashflow-line cashflow-line-income" d={incomePath} />
          <path className="cashflow-line cashflow-line-expense" d={expensePath} />
        </svg>
        <div className="cashflow-xlabels">
          {weekly.map((d, i) => (
            <span key={d.date} className="cashflow-xlabel">
              {WEEKDAY_LABELS[i]}
            </span>
          ))}
        </div>
      </div>
      <div className="cashflow-totals">
        <span className="income">+{formatRupiah(totalIncome)}</span>
        <span className="expense">−{formatRupiah(totalExpense)}</span>
      </div>
    </div>
  )
}
