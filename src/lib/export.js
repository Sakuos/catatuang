import { Capacitor } from '@capacitor/core'

// Susun data transaksi menjadi teks CSV (bisa dibuka di Excel/Spreadsheet).
export function buildCSV(transactions) {
  const header = ['Tanggal', 'Jenis', 'Kategori', 'Nominal', 'Catatan']

  // Bungkus tiap sel dengan tanda kutip & escape kutip di dalamnya.
  const cell = (v) => `"${String(v).replace(/"/g, '""')}"`

  const rows = transactions
    .slice()
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((t) =>
      [
        t.date,
        t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        t.category,
        t.amount,
        t.note || '',
      ]
        .map(cell)
        .join(',')
    )

  return [header.map(cell).join(','), ...rows].join('\r\n')
}

// Nama file dengan tanggal hari ini, mis. catatuang-2026-07-14.csv
function namaFile() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `catatuang-${y}-${m}-${day}.csv`
}

// Export transaksi ke CSV.
// - Di HP (Android): tulis file lalu buka menu "Bagikan" untuk simpan/kirim.
// - Di browser: unduh file langsung.
export async function exportCSV(transactions) {
  if (!transactions.length) {
    alert('Belum ada transaksi untuk diexport.')
    return
  }

  // ﻿ (BOM) agar Excel membaca karakter dengan benar.
  const csv = '﻿' + buildCSV(transactions)
  const filename = namaFile()

  if (Capacitor.isNativePlatform()) {
    // Di HP: pakai plugin Filesystem + Share.
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem')
    const { Share } = await import('@capacitor/share')

    await Filesystem.writeFile({
      path: filename,
      data: csv,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })
    const { uri } = await Filesystem.getUri({ path: filename, directory: Directory.Cache })
    await Share.share({
      title: 'Export CatatUang',
      text: 'Data keuangan CatatUang',
      url: uri,
    })
  } else {
    // Di browser: unduh langsung lewat link.
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
