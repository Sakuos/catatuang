import { formatBulan, formatRupiah } from '../../lib/format'
import CategoryChart from '../finance/CategoryChart'
import StatsCard from '../finance/StatsCard'
import FilterBar from '../transactions/FilterBar'
import TransactionList from '../transactions/TransactionList'
import SummaryMetric from '../ui/SummaryMetric'

// Layar Transaksi: ringkasan pemasukan/pengeluaran/selisih,
// pencarian + filter, dan daftar transaksi bulan terpilih.
export default function TransactionsScreen({
  bulan,
  income,
  expense,
  search,
  filterType,
  visibleTransactions,
  monthTransactions,
  customCategories,
  onSearch,
  onFilterType,
  onEditTransaction,
  onDeleteTransaction,
  swipeHintDismissed = false,
  onDismissSwipeHint,
}) {
  const selisih = income - expense
  const tampilkanHint = visibleTransactions.length > 0 && !swipeHintDismissed

  return (
    <div className="screen-content">
      <article className="summary-card">
        <SummaryMetric label="Pemasukan" value={formatRupiah(income)} tone="income" />
        <SummaryMetric label="Pengeluaran" value={formatRupiah(expense)} tone="expense" />
        <SummaryMetric label="Selisih" value={formatRupiah(selisih)} />
      </article>

      <FilterBar
        search={search}
        onSearch={onSearch}
        filterType={filterType}
        onFilterType={onFilterType}
      />

      <div className="date-row">
        <strong>{formatBulan(bulan)}</strong>
        <span>{visibleTransactions.length} transaksi</span>
      </div>

      <TransactionList
        transactions={visibleTransactions}
        customCategories={customCategories}
        onEdit={onEditTransaction}
        onDelete={onDeleteTransaction}
      />

      {tampilkanHint && (
        <p className="gesture-hint" onClick={onDismissSwipeHint}>
          Ketuk transaksi untuk edit
        </p>
      )}

      <StatsCard
        transactions={monthTransactions}
        bulan={bulan}
        customCategories={customCategories}
      />
      <CategoryChart transactions={monthTransactions} customCategories={customCategories} />
    </div>
  )
}
