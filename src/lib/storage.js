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
const BUDGET_KEY = 'catatuang.budget'
const DISMISS_KEY = 'catatuang.dismissedUpdate'
const THEME_KEY = 'catatuang.theme'
const GOAL_KEY = 'catatuang.goal'

// --- Tema (dark / light) ---
export function getTheme() {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme === 'dark' ? 'dark' : 'light')
}

// --- Target menabung (satu angka) ---
export function getGoal() {
  const n = Number(localStorage.getItem(GOAL_KEY))
  return n > 0 ? n : 0
}

export function setGoal(amount) {
  localStorage.setItem(GOAL_KEY, String(Number(amount) || 0))
}

// --- Banner update: versi yang sudah ditutup pengguna ---
// Supaya banner tak muncul lagi untuk versi yang sama, tapi tetap
// muncul saat ada versi lebih baru.
export function getDismissedVersion() {
  return localStorage.getItem(DISMISS_KEY) || ''
}

export function setDismissedVersion(version) {
  localStorage.setItem(DISMISS_KEY, String(version || ''))
}

// --- Budget bulanan (satu angka batas pengeluaran per bulan) ---

// Ambil budget (0 = belum diatur).
export function getBudget() {
  const n = Number(localStorage.getItem(BUDGET_KEY))
  return n > 0 ? n : 0
}

// Simpan budget. Kirim 0 untuk menghapus.
export function setBudget(amount) {
  localStorage.setItem(BUDGET_KEY, String(Number(amount) || 0))
}

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

// Impor banyak transaksi (dari CSV). Anti-duplikat: baris yang identik
// (tanggal+jenis+nominal+kategori+catatan) tidak ditambahkan dua kali.
// Mengembalikan jumlah transaksi yang benar-benar ditambahkan.
export function importTransactions(list) {
  const transactions = getTransactions()
  const kunci = (t) => `${t.date}|${t.type}|${t.amount}|${t.category}|${t.note || ''}`
  const sudahAda = new Set(transactions.map(kunci))

  let ditambah = 0
  for (const input of list) {
    const tx = {
      id: makeId(),
      type: input.type,
      amount: Number(input.amount),
      category: input.category,
      note: input.note || '',
      date: input.date,
    }
    if (sudahAda.has(kunci(tx))) continue
    sudahAda.add(kunci(tx))
    transactions.push(tx)
    ditambah++
  }
  saveAll(transactions)
  return ditambah
}
