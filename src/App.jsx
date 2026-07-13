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
} from './lib/storage'
import { bulanIni, bulanDari } from './lib/format'
import { cariKategori } from './lib/categories'
import { exportCSV, parseCSV } from './lib/export'
import { checkForUpdate } from './lib/update'

export default function App() {
  // Sumber kebenaran: daftar transaksi diambil dari lapisan data.
  const [transactions, setTransactions] = useState(() => getTransactions())
  const [bulan, setBulan] = useState(() => bulanIni())
  const [budget, setBudgetState] = useState(() => getBudget())
  const [goal, setGoalState] = useState(() => getGoal())
  const [theme, setThemeState] = useState(() => getTheme())

  // Pencarian & filter jenis untuk daftar riwayat.
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Input file tersembunyi untuk import CSV.
  const fileInputRef = useRef(null)

  // Terapkan tema ke <html> setiap kali berubah.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // 'sheet' = form melayang. null = tertutup, {} = tambah, {tx} = edit.
  const [sheet, setSheet] = useState(null)

  // Info update (banner "versi baru"). null = tidak ada.
  const [update, setUpdate] = useState(null)

  // Cek update sekali saat app dibuka.
  useEffect(() => {
    checkForUpdate().then((info) => {
      if (info && info.version !== getDismissedVersion()) {
        setUpdate(info)
      }
    })
  }, [])

  function dismissUpdate() {
    if (update) setDismissedVersion(update.version)
    setUpdate(null)
  }

  // Muat ulang state dari penyimpanan setiap ada perubahan data.
  function refresh() {
    setTransactions(getTransactions())
  }

  // Transaksi bulan terpilih saja.
  const txBulanIni = useMemo(
    () => transactions.filter((t) => bulanDari(t.date) === bulan),
    [transactions, bulan]
  )

  // Hitung total pemasukan & pengeluaran bulan terpilih.
  const { income, expense } = useMemo(() => {
    let income = 0
    let expense = 0
    for (const t of txBulanIni) {
      if (t.type === 'income') income += t.amount
      else expense += t.amount
    }
    return { income, expense }
  }, [txBulanIni])

  // Tabungan sepanjang waktu (semua pemasukan - semua pengeluaran).
  const saved = useMemo(() => {
    let total = 0
    for (const t of transactions) {
      total += t.type === 'income' ? t.amount : -t.amount
    }
    return total
  }, [transactions])

  // Terapkan pencarian & filter jenis untuk daftar riwayat.
  const txTampil = useMemo(() => {
    let list = txBulanIni
    if (filterType !== 'all') list = list.filter((t) => t.type === filterType)
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((t) => {
        const kat = cariKategori(t.type, t.category)
        return (t.note || '').toLowerCase().includes(q) || kat.label.toLowerCase().includes(q)
      })
    }
    return list
  }, [txBulanIni, filterType, search])

  // Simpan dari form (tambah atau edit).
  function handleSubmit(data) {
    if (sheet && sheet.tx) {
      updateTransaction(sheet.tx.id, data)
    } else {
      addTransaction(data)
    }
    refresh()
    setSheet(null)
  }

  function handleDelete(id) {
    removeTransaction(id)
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

  // Baca file CSV yang dipilih pengguna, lalu impor.
  function handleImportFile(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const daftar = parseCSV(String(reader.result))
        if (daftar.length === 0) {
          alert('Tidak ada transaksi yang bisa dibaca dari file itu.')
        } else {
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
    e.target.value = '' // reset agar file sama bisa dipilih lagi
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <img className="app-logo" src="./favicon.png" alt="Logo CatatUang" />
          <h1>CatatUang</h1>
        </div>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Ganti tema"
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      {update && <UpdateBanner info={update} onDismiss={dismissUpdate} />}

      <main className="app-main">
        <MonthPicker value={bulan} onChange={setBulan} />
        <Dashboard income={income} expense={expense} />
        <BudgetCard budget={budget} spent={expense} onSave={handleSaveBudget} />
        <GoalCard goal={goal} saved={saved} onSave={handleSaveGoal} />
        <StatsCard transactions={txBulanIni} bulan={bulan} />
        <CategoryChart transactions={txBulanIni} />

        <div className="section-header">
          <span className="section-title">Riwayat Transaksi</span>
          <div className="section-actions">
            <button
              type="button"
              className="export-btn"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
            >
              📥 Import
            </button>
            <button
              type="button"
              className="export-btn"
              onClick={() => exportCSV(transactions)}
            >
              📤 Export
            </button>
          </div>
        </div>

        {/* Input file tersembunyi untuk import CSV */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />

        <FilterBar
          search={search}
          onSearch={setSearch}
          filterType={filterType}
          onFilterType={setFilterType}
        />

        <TransactionList
          transactions={txTampil}
          onEdit={(tx) => setSheet({ tx })}
          onDelete={handleDelete}
        />
      </main>

      {/* Tombol melayang untuk tambah transaksi */}
      <button className="fab" onClick={() => setSheet({})} aria-label="Tambah transaksi">
        +
      </button>

      {/* Sheet form (tambah/edit) */}
      {sheet && (
        <div className="sheet-overlay" onClick={() => setSheet(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h2 className="sheet-title">
              {sheet.tx ? 'Edit Transaksi' : 'Tambah Transaksi'}
            </h2>
            <TransactionForm
              initial={sheet.tx}
              onSubmit={handleSubmit}
              onCancel={() => setSheet(null)}
            />
          </div>
        </div>
      )}

      <footer className="app-footer">Data tersimpan di HP kamu · offline</footer>
    </div>
  )
}
