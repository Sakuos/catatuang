import { formatRupiah } from '../lib/format'

// Kartu ringkasan: saldo bulan ini, total pemasukan, total pengeluaran.
// props: income (number), expense (number)
export default function Dashboard({ income, expense }) {
  const saldo = income - expense

  return (
    <div className="dashboard">
      <div className="balance-card">
        <div className="balance-label">Saldo bulan ini</div>
        <div className={'balance-value' + (saldo < 0 ? ' negative' : '')}>
          {formatRupiah(saldo)}
        </div>
      </div>

      <div className="summary-row">
        <div className="summary-card income">
          <div className="summary-label">↓ Pemasukan</div>
          <div className="summary-value">{formatRupiah(income)}</div>
        </div>
        <div className="summary-card expense">
          <div className="summary-label">↑ Pengeluaran</div>
          <div className="summary-value">{formatRupiah(expense)}</div>
        </div>
      </div>
    </div>
  )
}
