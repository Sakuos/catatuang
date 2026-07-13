// Utilitas format tampilan: mata uang Rupiah & tanggal Indonesia.

// Format angka jadi Rupiah, contoh: 15000 -> "Rp 15.000"
export function formatRupiah(amount) {
  const n = Number(amount) || 0
  return 'Rp ' + n.toLocaleString('id-ID')
}

// Format 'YYYY-MM-DD' -> "Senin, 14 Jul 2026"
export function formatTanggal(isoDate) {
  const d = new Date(isoDate + 'T00:00:00')
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Format bulan 'YYYY-MM' -> "Juli 2026"
export function formatBulan(yearMonth) {
  const [y, m] = yearMonth.split('-')
  const d = new Date(Number(y), Number(m) - 1, 1)
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

// Tanggal hari ini dalam bentuk 'YYYY-MM-DD' (waktu lokal).
export function hariIni() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Bulan sekarang 'YYYY-MM'.
export function bulanIni() {
  return hariIni().slice(0, 7)
}

// Ambil 'YYYY-MM' dari sebuah tanggal 'YYYY-MM-DD'.
export function bulanDari(isoDate) {
  return isoDate.slice(0, 7)
}
