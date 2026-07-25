import { useMemo } from 'react'
import { cariKategori } from '../../lib/categories'
import { formatBulan, formatRupiah, hariIni } from '../../lib/format'
import BudgetCard from '../finance/BudgetCard'
import CashFlowChart from '../finance/CashFlowChart'
import GoalCard from '../finance/GoalCard'
import RecurringCard from '../recurring/RecurringCard'
import SectionHeader from '../ui/SectionHeader'
import TransactionRow from '../ui/TransactionRow'

// Layar Dashboard: balance card, arus kas mingguan, ringkasan
// (budget/target/recurring), dan 3 transaksi terbaru.
// Semua data dari props (state App); saldo = income - expense.
export default function DashboardScreen({
  bulan,
  income,
  expense,
  saved,
  monthTransactions,
  preferences,
  ledger,
  onEditTransaction,
  onAddRecurring,
  onEditRecurring,
  onLihatSemua,
}) {
  const saldo = income - expense
  const terbaru = useMemo(
    () => [...monthTransactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 3),
    [monthTransactions]
  )
  const refIso = hariIni()

  return (
    <div className="screen-content">
      <article className="balance-card">
        <div>
          <p>Saldo tersedia</p>
          <h2 className={saldo < 0 ? 'negative' : ''}>{formatRupiah(saldo)}</h2>
        </div>
        <span className="month-chip">{formatBulan(bulan)}</span>

        <div className="balance-grid">
          <div>
            <span>Pemasukan</span>
            <strong className="income">{'+ ' + formatRupiah(income)}</strong>
          </div>
          <div>
            <span>Pengeluaran</span>
            <strong className="expense">{'− ' + formatRupiah(expense)}</strong>
          </div>
        </div>
      </article>

      <SectionHeader
        eyebrow="Ringkasan"
        title="Arus kas minggu ini"
        action={<span className="cashflow-hint">7 hari terakhir</span>}
      />
      <CashFlowChart transactions={monthTransactions} refIso={refIso} />

      <SectionHeader eyebrow="Ringkasan" title="Keuangan bulan ini" />

      <BudgetCard budget={preferences.budget} spent={expense} onSave={preferences.saveBudget} />
      <GoalCard goal={preferences.goal} saved={saved} onSave={preferences.saveGoal} />

      <RecurringCard
        patterns={ledger.recurringPatterns}
        customCategories={ledger.customCategories}
        onAdd={onAddRecurring}
        onEdit={onEditRecurring}
        onToggle={ledger.toggleRecurring}
        onDelete={ledger.deleteRecurring}
      />

      <SectionHeader
        eyebrow="Aktivitas"
        title="Transaksi terbaru"
        action={
          <button type="button" className="text-btn" onClick={onLihatSemua}>
            Lihat semua
          </button>
        }
      />
      {terbaru.length > 0 ? (
        <div className="transaction-list compact">
          {terbaru.map((tx) => {
            const kat = cariKategori(tx.type, tx.category, ledger.customCategories)
            return (
              <TransactionRow
                key={tx.id}
                icon={kat.emoji}
                title={kat.label}
                subtitle={`${tx.note || kat.label} · ${formatTanggalSingkat(tx.date)}`}
                amount={`${tx.type === 'income' ? '+ ' : '− '}${formatRupiah(tx.amount)}`}
                type={tx.type}
                compact
                onClick={() => onEditTransaction(tx)}
              />
            )
          })}
        </div>
      ) : (
        <p className="gesture-hint">Belum ada transaksi di {formatBulan(bulan)}.</p>
      )}
    </div>
  )
}

// Tanggal singkat "24 Jul" untuk kartu ringkas di dashboard.
function formatTanggalSingkat(isoDate) {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
