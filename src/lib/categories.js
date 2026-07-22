// Daftar kategori preset. Emoji dipakai sebagai ikon sederhana tanpa library.

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

export function kategoriPresetUntuk(type) {
  return type === 'income' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN
}

// Normalisasi nama untuk perbandingan dan id kategori kustom.
export function normalisasiLabelKategori(label) {
  return String(label || '').trim().replace(/\s+/g, ' ')
}

export function kunciLabelKategori(label) {
  return normalisasiLabelKategori(label).toLocaleLowerCase('id-ID')
}

export function buatIdKategori(label, type) {
  const slug = normalisasiLabelKategori(label)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'kategori'
  return `custom-${type}-${slug}`
}

// Ambil preset + kategori kustom aktif. selectedId tetap disertakan saat mengedit riwayat.
export function kategoriUntuk(type, customCategories = [], selectedId = '') {
  const custom = customCategories.filter(
    (k) => k.type === type && (k.active !== false || k.id === selectedId)
  )
  return [...kategoriPresetUntuk(type), ...custom]
}

// Cari data kategori dari id untuk tampilan transaksi lama maupun baru.
export function cariKategori(type, id, customCategories = []) {
  const preset = kategoriPresetUntuk(type).find((k) => k.id === id)
  if (preset) return preset
  const custom = customCategories.find((k) => k.type === type && k.id === id)
  return custom || { id, label: id || 'Lainnya', emoji: '📦' }
}
