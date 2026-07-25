import { useEffect, useMemo, useRef, useState } from 'react'
import BudgetScreen from './components/screens/BudgetScreen'
import DashboardScreen from './components/screens/DashboardScreen'
import ProfileScreen from './components/screens/ProfileScreen'
import TransactionsScreen from './components/screens/TransactionsScreen'
import RecurringForm from './components/recurring/RecurringForm'
import TransactionForm from './components/transactions/TransactionForm'
import UpdateBanner from './components/shared/UpdateBanner'
import AppHeader from './components/ui/AppHeader'
import BottomNavigationItem from './components/ui/BottomNavigationItem'
import FloatingActionButton from './components/ui/FloatingActionButton'
import { useAppUpdate } from './hooks/useAppUpdate'
import { useLedger } from './hooks/useLedger'
import { usePreferences } from './hooks/usePreferences'
import { parseCSV } from './lib/export'
import {
  filterTransactions,
  getMonthlyTotals,
  getSavedTotal,
  getTransactionsForMonth,
} from './lib/finance'
import { bulanIni, formatBulan } from './lib/format'

// App adalah shell tab: header + area scroll per layar + bottom nav.
// State/sheet logic tetap di sini; screen hanya presentasi.
// Tab: dashboard, transactions, budget, profile.
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
  { id: 'transactions', label: 'Transaksi', icon: '⇅' },
  { id: 'budget', label: 'Anggaran', icon: '◫' },
  { id: 'profile', label: 'Profil', icon: '○' },
]

export default function App() {
  const ledger = useLedger()
  const preferences = usePreferences()
  const { update, dismissUpdate } = useAppUpdate()
  const [bulan, setBulan] = useState(() => bulanIni())
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [tab, setTab] = useState('dashboard')
  const [sheet, setSheet] = useState(null)
  const [recurringSheet, setRecurringSheet] = useState(null)
  const [budgetMenuSheet, setBudgetMenuSheet] = useState(false)
  const [budgetEditorSheet, setBudgetEditorSheet] = useState(null) // 'budget' | 'goal' | null
  const fileInputRef = useRef(null)
  const lastFocusedRef = useRef(null)
  const activeOverlay = Boolean(sheet || recurringSheet || budgetMenuSheet)

  useEffect(() => {
    if (!activeOverlay) return

    lastFocusedRef.current = document.activeElement
    const dialog = document.querySelector('.sheet[role="dialog"]')
    const firstControl = dialog?.querySelector('button, input, select, textarea, [tabindex="0"]')
    firstControl?.focus()

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSheet(null)
        setRecurringSheet(null)
        setBudgetMenuSheet(false)
        return
      }
      if (event.key !== 'Tab' || !dialog) return

      const controls = [
        ...dialog.querySelectorAll('button, input, select, textarea, [tabindex="0"]'),
      ].filter((control) => !control.disabled)
      if (controls.length === 0) return
      const first = controls[0]
      const last = controls[controls.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      lastFocusedRef.current?.focus?.()
    }
  }, [activeOverlay])

  const monthTransactions = useMemo(
    () => getTransactionsForMonth(ledger.transactions, bulan),
    [ledger.transactions, bulan]
  )
  const { income, expense } = useMemo(
    () => getMonthlyTotals(monthTransactions),
    [monthTransactions]
  )
  const saved = useMemo(() => getSavedTotal(ledger.transactions), [ledger.transactions])
  const visibleTransactions = useMemo(
    () =>
      filterTransactions(monthTransactions, {
        type: filterType,
        search,
        customCategories: ledger.customCategories,
      }),
    [monthTransactions, filterType, search, ledger.customCategories]
  )

  function handleSubmit(data) {
    ledger.saveTransaction(sheet?.tx, data)
    setSheet(null)
  }

  function handleSaveRecurring(data) {
    ledger.saveRecurring(recurringSheet?.pattern, data)
    setRecurringSheet(null)
  }

  function handleImportFile(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const transactions = parseCSV(String(reader.result))
        if (transactions.length === 0) {
          alert('Tidak ada transaksi yang bisa dibaca dari file itu.')
        } else {
          const added = ledger.importList(transactions)
          alert(
            added > 0
              ? `${added} transaksi berhasil diimpor.`
              : 'Semua transaksi di file itu sudah ada (tidak ada yang baru).'
          )
        }
      } catch {
        alert('Gagal membaca file. Pastikan file CSV hasil export CatatUang.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  function triggerImport() {
    fileInputRef.current?.click()
  }

  return (
    <div className={'app' + (update ? ' has-update' : '')}>
      {update && <UpdateBanner info={update} onDismiss={dismissUpdate} />}
      <AppHeader
        title={
          tab === 'dashboard' ? 'CatatUang' : (TABS.find((t) => t.id === tab)?.label ?? 'CatatUang')
        }
        eyebrow={
          tab === 'dashboard'
            ? 'Keuangan pribadi'
            : tab === 'profile'
              ? 'Pengaturan'
              : formatBulan(bulan)
        }
        showLogo={tab === 'dashboard'}
        showMonthPicker={tab !== 'profile'}
        month={bulan}
        onMonth={setBulan}
        actions={
          <button
            type="button"
            className="icon-btn"
            onClick={preferences.toggleTheme}
            aria-label="Ganti tema"
          >
            {preferences.theme === 'dark' ? '☀' : '🌙'}
          </button>
        }
      />

      <main className="app-main">
        {tab === 'dashboard' && (
          <DashboardScreen
            bulan={bulan}
            income={income}
            expense={expense}
            saved={saved}
            monthTransactions={monthTransactions}
            preferences={preferences}
            ledger={ledger}
            onEditTransaction={(tx) => setSheet({ tx })}
            onAddRecurring={() => setRecurringSheet({})}
            onEditRecurring={(pattern) => setRecurringSheet({ pattern })}
            onLihatSemua={() => setTab('transactions')}
          />
        )}
        {tab === 'transactions' && (
          <TransactionsScreen
            bulan={bulan}
            income={income}
            expense={expense}
            search={search}
            filterType={filterType}
            visibleTransactions={visibleTransactions}
            monthTransactions={monthTransactions}
            customCategories={ledger.customCategories}
            onSearch={setSearch}
            onFilterType={setFilterType}
            onEditTransaction={(tx) => setSheet({ tx })}
            onDeleteTransaction={ledger.deleteTransaction}
            swipeHintDismissed={preferences.swipeHintDismissed}
            onDismissSwipeHint={preferences.dismissSwipeHint}
          />
        )}
        {tab === 'budget' && (
          <BudgetScreen
            bulan={bulan}
            expense={expense}
            saved={saved}
            monthTransactions={monthTransactions}
            preferences={preferences}
            ledger={ledger}
            editorSheet={budgetEditorSheet}
            onCloseEditor={() => setBudgetEditorSheet(null)}
          />
        )}
        {tab === 'profile' && (
          <ProfileScreen
            preferences={preferences}
            ledger={ledger}
            update={update}
            dismissUpdate={dismissUpdate}
            onImportFile={triggerImport}
            onAddRecurring={() => setRecurringSheet({})}
            onEditRecurring={(pattern) => setRecurringSheet({ pattern })}
            onGoToTransactions={() => setTab('transactions')}
            showUpdate={false}
          />
        )}
      </main>

      {tab === 'budget' && (
        <FloatingActionButton
          onClick={() => setBudgetMenuSheet(true)}
          label="Tambah anggaran atau target"
        />
      )}
      {(tab === 'dashboard' || tab === 'transactions') && (
        <FloatingActionButton onClick={() => setSheet({})} label="Tambah transaksi" />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />

      <nav className="bottom-nav">
        {TABS.map((t) => (
          <BottomNavigationItem
            key={t.id}
            icon={t.icon}
            label={t.label}
            active={tab === t.id}
            onClick={() => setTab(t.id)}
          />
        ))}
      </nav>

      {sheet && (
        <div className="sheet-overlay" onClick={() => setSheet(null)}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-sheet-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <h2 className="sheet-title" id="transaction-sheet-title">
              {sheet.tx ? 'Edit Transaksi' : 'Tambah Transaksi'}
            </h2>
            <TransactionForm
              initial={sheet.tx}
              onSubmit={handleSubmit}
              onCancel={() => setSheet(null)}
              customCategories={ledger.customCategories}
              onAddCategory={ledger.addCategory}
              onRemoveCategory={ledger.deleteCategory}
            />
          </div>
        </div>
      )}

      {recurringSheet && (
        <div className="sheet-overlay" onClick={() => setRecurringSheet(null)}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recurring-sheet-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <h2 className="sheet-title" id="recurring-sheet-title">
              {recurringSheet.pattern ? 'Edit Transaksi Otomatis' : 'Tambah Transaksi Otomatis'}
            </h2>
            <RecurringForm
              initial={recurringSheet.pattern}
              onSubmit={handleSaveRecurring}
              onCancel={() => setRecurringSheet(null)}
              customCategories={ledger.customCategories}
              onAddCategory={ledger.addCategory}
              onRemoveCategory={ledger.deleteCategory}
            />
          </div>
        </div>
      )}
      {budgetMenuSheet && (
        <div className="sheet-overlay" onClick={() => setBudgetMenuSheet(false)}>
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="budget-menu-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sheet-handle" />
            <h2 className="sheet-title" id="budget-menu-title">
              Buat baru
            </h2>
            <div
              className="settings-group"
              style={{ margin: 0, boxShadow: 'none', border: 0, background: 'none' }}
            >
              <button
                type="button"
                onClick={() => {
                  setBudgetMenuSheet(false)
                  setBudgetEditorSheet('budget')
                }}
              >
                <span className="setting-icon">🎯</span>
                <div>
                  <b>Tambah Anggaran</b>
                  <small>Batasi pengeluaran bulanan</small>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setBudgetMenuSheet(false)
                  setBudgetEditorSheet('goal')
                }}
              >
                <span className="setting-icon">🏆</span>
                <div>
                  <b>Tambah Target</b>
                  <small>Tentukan target tabungan</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
