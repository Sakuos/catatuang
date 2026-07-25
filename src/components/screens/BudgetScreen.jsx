import { cariKategori } from '../../lib/categories'
import { formatBulan, formatRupiah } from '../../lib/format'
import { getCategoryAllocation, getBudgetOverview, getExpenseByCategory } from '../../lib/finance'
import BudgetCard from '../finance/BudgetCard'
import GoalCard from '../finance/GoalCard'
import SectionHeader from '../ui/SectionHeader'

// Layar Anggaran: hero ring progress total, rincian per kategori,
// budget bulanan, dan target menabung.
// Nominal seluruhnya dari data/state aplikasi.
export default function BudgetScreen({
  bulan,
  expense,
  saved,
  monthTransactions,
  preferences,
  ledger,
  editorSheet = null,
  onCloseEditor,
}) {
  const budget = preferences.budget
  const spent = Math.max(0, expense)
  const overview = getBudgetOverview(budget, spent)

  // Pengeluaran per kategori (untuk budget-list).
  const baris = getExpenseByCategory(monthTransactions)
  const totalKategori = baris.reduce((a, b) => a + b.spent, 0)

  return (
    <div className="screen-content">
      <div className="scroll-area">
        {budget > 0 ? (
          <article className={'budget-hero' + (overview.over ? ' over' : '')}>
            <div
              className="ring"
              style={{
                background: `radial-gradient(circle closest-side, var(--surface) 76%, transparent 77% 99%), conic-gradient(var(--red) ${overview.pct}%, var(--track-bg) 0)`,
              }}
              role="progressbar"
              aria-valuenow={overview.pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Persentase anggaran terpakai"
            >
              <span>{overview.pct}%</span>
            </div>
            <div className="hero-copy">
              <span>Total Anggaran</span>
              <strong>{formatRupiah(budget)}</strong>
              <div className="balance-grid budget-balance-grid">
                <div>
                  <span>Terpakai</span>
                  <strong className="expense">{formatRupiah(spent)}</strong>
                </div>
                <div>
                  <span>Sisa</span>
                  <strong className={overview.over ? 'expense' : 'income'}>
                    {formatRupiah(overview.sisa)}
                  </strong>
                </div>
              </div>
            </div>
          </article>
        ) : (
          <article className="budget-hero empty">
            <div className="hero-copy">
              <span>Total anggaran</span>
              <strong>Belum diatur</strong>
              <p className="mini-hint">
                Atur anggaran bulanan untuk memantau pengeluaran {formatBulan(bulan)}.
              </p>
            </div>
          </article>
        )}

        <SectionHeader eyebrow="Kategori" title="Penggunaan anggaran" />

        {baris.length > 0 ? (
          <div className="budget-list">
            {baris.map((r) => {
              const k = cariKategori('expense', r.category, ledger.customCategories)
              const alokasi = getCategoryAllocation(r.spent, totalKategori, budget)
              const p =
                budget > 0 && alokasi > 0 ? Math.min(100, Math.round((r.spent / alokasi) * 100)) : 0
              const overBudget = budget > 0 && alokasi > 0 && r.spent > alokasi

              return (
                <div key={r.category} className={'budget-item' + (overBudget ? ' over' : '')}>
                  <div className="budget-top">
                    <div className="transaction-icon">{k.emoji}</div>
                    <div>
                      <strong>{k.label}</strong>
                      <div
                        className="progress"
                        role="progressbar"
                        aria-label={`Pemakaian anggaran ${k.label}`}
                        aria-valuenow={p}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      >
                        <i style={{ width: p + '%' }} />
                      </div>
                    </div>
                    <div className="budget-amount">
                      <strong className="expense">{formatRupiah(r.spent)}</strong>
                      {alokasi > 0 && (
                        <span>
                          {formatRupiah(r.spent)} / {formatRupiah(alokasi)}
                        </span>
                      )}
                    </div>
                  </div>
                  {overBudget && (
                    <div className="budget-item-warn">
                      ⚠️ Lewat {formatRupiah(r.spent - alokasi)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="gesture-hint">Belum ada pengeluaran di {formatBulan(bulan)}.</p>
        )}

        <SectionHeader eyebrow="Batas" title="Anggaran bulanan" />
        <BudgetCard
          key={editorSheet === 'budget' ? 'budget-edit' : 'budget-view'}
          budget={budget}
          spent={spent}
          onSave={preferences.saveBudget}
          forceEdit={editorSheet === 'budget'}
          onClose={onCloseEditor}
        />

        <SectionHeader eyebrow="Target" title="Tabungan" />
        <GoalCard
          key={editorSheet === 'goal' ? 'goal-edit' : 'goal-view'}
          goal={preferences.goal}
          deadline={preferences.goalDeadline}
          saved={saved}
          onSave={preferences.saveGoal}
          forceEdit={editorSheet === 'goal'}
          onClose={onCloseEditor}
        />
      </div>
    </div>
  )
}
