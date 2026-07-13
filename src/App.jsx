import { useState, useMemo } from 'react'
import Dashboard from './components/Dashboard'
import MonthPicker from './components/MonthPicker'
import TransactionList from './components/TransactionList'
import TransactionForm from './components/TransactionForm'
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
} from './lib/storage'
import { bulanIni, bulanDari } from './lib/format'

export default function App() {
  // Sumber kebenaran: daftar transaksi diambil dari lapisan data.
  const [transactions, setTransactions] = useState(() => getTransactions())
  const [bulan, setBulan] = useState(() => bulanIni())

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>💰 CatatUang</h1>
      </header>

      <main className="app-main">
        <MonthPicker value={bulan} onChange={setBulan} />
        <Dashboard income={income} expense={expense} />

        <div className="section-title">Riwayat Transaksi</div>
        <TransactionList
          transactions={txBulanIni}
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
