// Daftar kategori preset. Silakan tambah/ubah sesuai kebutuhan.
// emoji dipakai sebagai ikon sederhana tanpa perlu library.

export const KATEGORI_PENGELUARAN = [
  { id: 'makan', label: 'Makan', emoji: '🍜' },
  { id: 'transport', label: 'Transport', emoji: '🚌' },
  { id: 'belanja', label: 'Belanja', emoji: '🛒' },
  { id: 'tagihan', label: 'Tagihan', emoji: '🧾' },
  { id: 'hiburan', label: 'Hiburan', emoji: '🎮' },
  { id: 'kesehatan', label: 'Kesehatan', emoji: '💊' },
  { id: 'lainnya', label: 'Lainnya', emoji: '📦' },
]

export const KATEGORI_PEMASUKAN = [
  { id: 'gaji', label: 'Gaji', emoji: '💰' },
  { id: 'bonus', label: 'Bonus', emoji: '🎁' },
  { id: 'usaha', label: 'Usaha', emoji: '🏪' },
  { id: 'lainnya', label: 'Lainnya', emoji: '📦' },
]

// Ambil daftar kategori sesuai jenis transaksi.
export function kategoriUntuk(type) {
  return type === 'income' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN
}

// Cari data kategori (label + emoji) dari id-nya, untuk ditampilkan.
export function cariKategori(type, id) {
  const found = kategoriUntuk(type).find((k) => k.id === id)
  return found || { id, label: id, emoji: '📦' }
}
