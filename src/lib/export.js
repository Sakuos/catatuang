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

// Parse teks CSV (format hasil export kita) menjadi daftar transaksi.
// Menangani sel berkutip & escape "" . Baris header & baris rusak dilewati.
export function parseCSV(text) {
  const bersih = text.replace(/^﻿/, '') // buang BOM bila ada
  const baris = bersih.split(/\r?\n/).filter((b) => b.trim() !== '')
  const hasil = []

  for (let i = 0; i < baris.length; i++) {
    const kolom = pecahBarisCSV(baris[i])
    if (kolom.length < 4) continue
    const [tanggal, jenis, kategori, nominal, catatan] = kolom

    // Lewati baris header.
    if (i === 0 && tanggal.toLowerCase() === 'tanggal') continue

    const amount = Number(String(nominal).replace(/[^\d.-]/g, ''))
    if (!/^\d{4}-\d{2}-\d{2}$/.test(tanggal) || !amount) continue

    hasil.push({
      date: tanggal,
      type: jenis.toLowerCase().startsWith('pemasukan') ? 'income' : 'expense',
      category: kategori || 'lainnya',
      amount,
      note: catatan || '',
    })
  }
  return hasil
}

// Pecah satu baris CSV menjadi array sel (menghormati tanda kutip).
function pecahBarisCSV(baris) {
  const out = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < baris.length; i++) {
    const c = baris[i]
    if (inQuote) {
      if (c === '"') {
        if (baris[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          inQuote = false
        }
      } else {
        cur += c
      }
    } else if (c === '"') {
      inQuote = true
    } else if (c === ',') {
      out.push(cur)
      cur = ''
    } else {
      cur += c
    }
  }
  out.push(cur)
  return out.map((s) => s.trim())
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
