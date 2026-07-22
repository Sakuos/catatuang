import { useState, useMemo, useEffect, useRef } from 'react'
import Dashboard from './components/Dashboard'
import MonthPicker from './components/MonthPicker'
import TransactionList from './components/TransactionList'
import TransactionForm from './components/TransactionForm'
import BudgetCard from './components/BudgetCard'
import GoalCard from './components/GoalCard'
import StatsCard from './components/StatsCard'
import CategoryChart from './components/CategoryChart'
import FilterBar from './components/FilterBar'
import UpdateBanner from './components/UpdateBanner'
import RecurringCard from './components/RecurringCard'
import RecurringForm from './components/RecurringForm'
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  importTransactions,
  getBudget,
  setBudget,
  getGoal,
  setGoal,
  getTheme,
  setTheme,
  getDismissedVersion,
  setDismissedVersion,
  getCustomCategories,
  addCustomCategory,
  removeCustomCategory,
  getRecurringPatterns,
  addRecurringPattern,
  updateRecurringPattern,
  setRecurringActive,
  removeRecurringPattern,
  generateRecurringTransactions,
} from './lib/storage'
import { bulanIni, bulanDari } from './lib/format'
import { cariKategori } from './lib/categories'
import { exportCSV, parseCSV } from './lib/export'
import { checkForUpdate } from './lib/update'

export default function App() {
  const [transactions, setTransactions] = useState(() => getTransactions())
  const [customCategories, setCustomCategories] = useState(() => getCustomCategories())
  const [recurringPatterns, setRecurringPatterns] = useState(() => getRecurringPatterns())
  const [bulan, setBulan] = useState(() => bulanIni())
  const [budget, setBudgetState] = useState(() => getBudget())
  const [goal, setGoalState] = useState(() => getGoal())
  const [theme, setThemeState] = useState(() => getTheme())
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sheet, setSheet] = useState(null)
  const [recurringSheet, setRecurringSheet] = useState(null)
  const [update, setUpdate] = useState(null)
  const fileInputRef = useRef(null)

  function refresh() {
    setTransactions(getTransactions())
    setCustomCategories(getCustomCategories())
    setRecurringPatterns(getRecurringPatterns())
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    generateRecurringTransactions()
    refresh()

    function handleVisibility() {
      if (!document.hidden) {
        generateRecurringTransactions()
        refresh()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    checkForUpdate().then((info) => {
      if (info && info.version !== getDismissedVersion()) setUpdate(info)
    })
  }, [])

  function dismissUpdate() {
    if (update) setDismissedVersion(update.version)
    setUpdate(null)
  }

  const txBulanIni = useMemo(
    () => transactions.filter((t) => bulanDari(t.date) === bulan),
    [transactions, bulan]
  )

  const { income, expense } = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of txBulanIni) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }
    return { income, expense }
  }, [txBulanIni])

  const saved = useMemo(() => {
    let total = 0
    for (const t of transactions) total += t.type === 'income' ? t.amount : -t.amount
    return total
  }, [transactions])

  const txTampil = useMemo(() => {
    let list = txBulanIni
    if (filterType !== 'all') list = list.filter((t) => t.type === filterType)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((t) => {
        const kat = cariKategori(t.type, t.category, customCategories)
        return (t.note || '').toLowerCase().includes(q) || kat.label.toLowerCase().includes(q)
      })
    }
    return list
  }, [txBulanIni, filterType, search, customCategories])

  function handleSubmit(data) {
    if (sheet?.tx) updateTransaction(sheet.tx.id, data)
    else addTransaction(data)
    refresh()
    setSheet(null)
  }

  function handleDelete(id) {
    removeTransaction(id)
    refresh()
  }

  function handleAddCategory(type, label, emoji) {
    const category = addCustomCategory(type, label, emoji)
    setCustomCategories(getCustomCategories())
    return category
  }

  function handleRemoveCategory(id) {
    removeCustomCategory(id)
    setCustomCategories(getCustomCategories())
  }

  function handleSaveRecurring(data) {
    if (recurringSheet?.pattern) updateRecurringPattern(recurringSheet.pattern.id, data)
    else addRecurringPattern(data)
    generateRecurringTransactions()
    refresh()
    setRecurringSheet(null)
  }

  function handleToggleRecurring(pattern) {
    setRecurringActive(pattern.id, !pattern.active)
    if (!pattern.active) generateRecurringTransactions()
    refresh()
  }

  function handleDeleteRecurring(id) {
    removeRecurringPattern(id)
    refresh()
  }

  function handleSaveBudget(nilai) {
    setBudget(nilai)
    setBudgetState(nilai)
  }

  function handleSaveGoal(nilai) {
    setGoal(nilai)
    setGoalState(nilai)
  }

  function toggleTheme() {
    const baru = theme === 'dark' ? 'light' : 'dark'
    setTheme(baru)
    setThemeState(baru)
  }

  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const daftar = parseCSV(String(reader.result))
        if (daftar.length === 0) alert('Tidak ada transaksi yang bisa dibaca dari file itu.')
        else {
          const ditambah = importTransactions(daftar)
          refresh()
          alert(
            ditambah > 0
              ? `${ditambah} transaksi berhasil diimpor.`
              : 'Semua transaksi di file itu sudah ada (tidak ada yang baru).'
          )
        }
      } catch {
        alert('Gagal membaca file. Pastikan file CSV hasil export CatatUang.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <img className="app-logo" src="./favicon.png" alt="Logo CatatUang" />
          <h1>CatatUang</h1>
        </div>
        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Ganti tema">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      {update && <UpdateBanner info={update} onDismiss={dismissUpdate} />}

      <main className="app-main">
        <MonthPicker value={bulan} onChange={setBulan} />
        <Dashboard income={income} expense={expense} />
        <BudgetCard budget={budget} spent={expense} onSave={handleSaveBudget} />
        <GoalCard goal={goal} saved={saved} onSave={handleSaveGoal} />
        <RecurringCard
          patterns={recurringPatterns}
          customCategories={customCategories}
          onAdd={() => setRecurringSheet({})}
          onEdit={(pattern) => setRecurringSheet({ pattern })}
          onToggle={handleToggleRecurring}
          onDelete={handleDeleteRecurring}
        />
        <StatsCard transactions={txBulanIni} bulan={bulan} customCategories={customCategories} />
        <CategoryChart transactions={txBulanIni} customCategories={customCategories} />

        <div className="section-header">
          <span className="section-title">Riwayat Transaksi</span>
          <div className="section-actions">
            <button type="button" className="export-btn" onClick={() => fileInputRef.current?.click()}>
              📥 Import
            </button>
            <button type="button" className="export-btn" onClick={() => exportCSV(transactions)}>
              📤 Export
            </button>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept=".csv,text/csv" style={{ display: 'none' }} onChange={handleImportFile} />

        <FilterBar search={search} onSearch={setSearch} filterType={filterType} onFilterType={setFilterType} />
        <TransactionList
          transactions={txTampil}
          customCategories={customCategories}
          onEdit={(tx) => setSheet({ tx })}
          onDelete={handleDelete}
        />
      </main>

      <button className="fab" onClick={() => setSheet({})} aria-label="Tambah transaksi">+</button>

      {sheet && (
        <div className="sheet-overlay" onClick={() => setSheet(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h2 className="sheet-title">{sheet.tx ? 'Edit Transaksi' : 'Tambah Transaksi'}</h2>
            <TransactionForm
              initial={sheet.tx}
              onSubmit={handleSubmit}
              onCancel={() => setSheet(null)}
              customCategories={customCategories}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
            />
          </div>
        </div>
      )}

      {recurringSheet && (
        <div className="sheet-overlay" onClick={() => setRecurringSheet(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h2 className="sheet-title">
              {recurringSheet.pattern ? 'Edit Transaksi Otomatis' : 'Tambah Transaksi Otomatis'}
            </h2>
            <RecurringForm
              initial={recurringSheet.pattern}
              onSubmit={handleSaveRecurring}
              onCancel={() => setRecurringSheet(null)}
              customCategories={customCategories}
              onAddCategory={handleAddCategory}
              onRemoveCategory={handleRemoveCategory}
            />
          </div>
        </div>
      )}

      <footer className="app-footer">Data tersimpan di HP kamu · offline</footer>
    </div>
  )
}
