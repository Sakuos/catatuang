import { Capacitor } from '@capacitor/core'

// ============================================================
// CEK UPDATE — memberi tahu bila ada versi APK lebih baru.
// ------------------------------------------------------------
// App membaca rilis terbaru dari GitHub Releases (API publik),
// membandingkan dengan versi yang terpasang, lalu memberi sinyal
// bila ada yang lebih baru.
//
// CATATAN: hanya berfungsi bila repo PUBLIK (API rilis bisa
// dibaca tanpa login). Bila privat/offline, fetch gagal dan
// fungsi mengembalikan null (tidak ada banner) — aman.
// ============================================================

const REPO = 'Sakuos/catatuang'
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`

// Versi app ini. Disuntikkan saat build oleh GitHub Actions
// (VITE_APP_VERSION = 1.0.<nomor-build>). Saat `npm run dev` nilainya
// kosong -> dianggap '0.0.0' (mode ngoding, cek dilewati).
export function getCurrentVersion() {
  return import.meta.env.VITE_APP_VERSION || '0.0.0'
}

// Ubah 'v1.0.12' / '1.0.12' -> [1, 0, 12]
function parseVersion(str) {
  return String(str)
    .replace(/^v/i, '')
    .split('.')
    .map((n) => parseInt(n, 10) || 0)
}

// Apakah `latest` lebih baru dari `current`? (bandingkan angka)
export function isNewer(latest, current) {
  const a = parseVersion(latest)
  const b = parseVersion(current)
  const len = Math.max(a.length, b.length)
  for (let i = 0; i < len; i++) {
    const x = a[i] || 0
    const y = b[i] || 0
    if (x > y) return true
    if (x < y) return false
  }
  return false
}

// Cek apakah ada update. Mengembalikan:
//   { hasUpdate: true, version: 'v1.0.11', url: '<link unduh>' }
//   atau null bila tidak ada update / gagal / mode dev.
export async function checkForUpdate() {
  const current = getCurrentVersion()
  // Lewati saat mode dev (belum ada versi asli).
  if (current === '0.0.0') return null

  try {
    const res = await fetch(API_URL, { headers: { Accept: 'application/vnd.github+json' } })
    if (!res.ok) return null // 404 (privat/belum ada rilis) atau error lain
    const data = await res.json()
    const latest = data.tag_name
    if (!latest || !isNewer(latest, current)) return null

    // Cari aset CatatUang.apk untuk unduhan satu-tap; fallback ke halaman rilis.
    const apk = (data.assets || []).find((a) => a.name && a.name.endsWith('.apk'))
    const url = apk ? apk.browser_download_url : data.html_url

    return { hasUpdate: true, version: latest, url }
  } catch {
    return null // offline / diblokir -> diam saja
  }
}

// Buka link unduhan di browser HP (agar unduhan APK ditangani sistem).
export async function openDownload(url) {
  if (Capacitor.isNativePlatform()) {
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url })
  } else {
    window.open(url, '_blank')
  }
}
