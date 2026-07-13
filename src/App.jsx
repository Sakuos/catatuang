import { useState, useMemo } from 'react'
import Dashboard from './components/Dashboard'
import MonthPicker from './components/MonthPicker'
import TransactionList from './components/TransactionList'
import TransactionForm from './components/TransactionForm'
import BudgetCard from './components/BudgetCard'
import CategoryChart from './components/CategoryChart'
import FilterBar from './components/FilterBar'
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  getBudget,
  setBudget,
} from './lib/storage'
import { bulanIni, bulanDari } from './lib/format'
import { cariKategori } from './lib/categories'
import { exportCSV } from './lib/export'

export default function App() {
  // Sumber kebenaran: daftar transaksi diambil dari lapisan data.
  const [transactions, setTransactions] = useState(() => getTransactions())
  const [bulan, setBulan] = useState(() => bulanIni())
  const [budget, setBudgetState] = useState(() => getBudget())

  // Pencarian & filter jenis untuk daftar riwayat.
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

  // 'sheet' = form melayang. null = tertutup, {} = tambah, {tx} = edit.
  const [sheet, setSheet] = useState(null)

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 CatatUang</h1>
      </header>

      <main className="app-main">
        <MonthPicker value={bulan} onChange={setBulan} />
        <Dashboard income={income} expense={expense} />
        <BudgetCard budget={budget} spent={expense} onSave={handleSaveBudget} />
        <CategoryChart transactions={txBulanIni} />

        <div className="section-header">
          <span className="section-title">Riwayat Transaksi</span>
          <button
            type="button"
            className="export-btn"
            onClick={() => exportCSV(transactions)}
          >
            📤 Export
          </button>
        </div>

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
