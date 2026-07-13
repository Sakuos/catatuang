// ============================================================
// LAPISAN DATA (Data Layer)
// ------------------------------------------------------------
// SEMUA akses data melewati file ini. Komponen UI tidak boleh
// menyentuh localStorage secara langsung.
//
// Kenapa? Supaya di TAHAP 2 (sinkron cloud Cloudflare) kita
// cukup mengganti isi fungsi di bawah dengan panggilan ke API,
// TANPA mengubah satu pun komponen UI.
// ============================================================

const STORAGE_KEY = 'catatuang.transactions'

// Baca semua transaksi dari penyimpanan.
// Bentuk 1 transaksi:
// { id, type: 'income'|'expense', amount: number,
//   category: string, note: string, date: 'YYYY-MM-DD' }
export function getTransactions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Gagal membaca data:', err)
    return []
  }
}

// Simpan seluruh array transaksi (dipakai internal).
function saveAll(transactions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
}

// Buat id unik sederhana (cukup untuk penyimpanan lokal).
function makeId() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`
}

// Tambah transaksi baru. Mengembalikan transaksi yang tersimpan.
export function addTransaction(input) {
  const transactions = getTransactions()
  const tx = {
    id: makeId(),
    type: input.type,
    amount: Number(input.amount),
    category: input.category,
    note: input.note || '',
    date: input.date,
  }
  transactions.push(tx)
  saveAll(transactions)
  return tx
}

// Perbarui transaksi berdasarkan id.
export function updateTransaction(id, changes) {
  const transactions = getTransactions()
  const idx = transactions.findIndex((t) => t.id === id)
  if (idx === -1) return null
  transactions[idx] = {
    ...transactions[idx],
    ...changes,
    amount: changes.amount !== undefined ? Number(changes.amount) : transactions[idx].amount,
  }
  saveAll(transactions)
  return transactions[idx]
}

// Hapus transaksi berdasarkan id.
export function removeTransaction(id) {
  const transactions = getTransactions().filter((t) => t.id !== id)
  saveAll(transactions)
}
