# CatatUang — Petunjuk untuk Claude

Aplikasi pencatat keuangan harian Android, offline-first, bahasa Indonesia. Pemilik: Bayu (pemula/vibecoder). Penjelasan praktis, singkat, bahasa Indonesia.

## Dokumen kanonis

Baca hanya yang relevan dengan tugas. Jangan sapu seluruh repo atau output generated Android.

- `README.md` — install, pakai, development.
- `PRD.md` — kebenaran produk: scope, requirement, arah.
- `plan.md` — roadmap eksekusi dan milestone aktif.
- `CLAUDE.md` — file ini: aturan kode, peta arsitektur, verifikasi.

## Stack & peta file

React 18 + Vite 5 + Capacitor 6. Data di `localStorage` WebView. Locale `id-ID`, Rupiah.

- `src/App.jsx` — orkestrasi UI dan state.
- `src/components/` — komponen UI (Dashboard, TransactionForm, RecurringForm, dll.).
- `src/lib/storage.js` — **satu-satunya** boundary data (facade). Semua akses `localStorage` lewat sini.
- `src/lib/categories.js` — preset + kategori kustom, pencarian label.
- `src/lib/format.js` — Rupiah, tanggal, bulan, tanggalBulanan (jepit 29–31).
- `src/lib/export.js` — CSV build/parse, export Filesystem/Share.
- `src/lib/update.js` — cek GitHub Release terbaru.
- `src/styles.css` — tampilan.
- `.github/workflows/build-apk.yml` — build/release APK otomatis.
- `android/` — project Capacitor; hasil build diabaikan, jangan edit file generated.

## Aturan kode

### Batas lunak 500 baris

Target maksimum **500 baris fisik** per file source buatan atau komponen React bila pemisahan kohesif masuk akal. Aturan ini soft: ditinjau, bukan CI gagal.

- Saat mendekati/melewati 500 baris: tinjau tanggung jawab, lalu pecah berdasarkan domain, bukan potongan baris mekanis.
- Jangan buat wrapper satu-baris atau micro-file hanya demi angka.
- Boleh melewati batas: generated files, lockfile, vendor, data statis, config, dan `android/` generated.
- File source yang sengaja tetap >500 baris wajib punya alasan kohesi tertulis di `plan.md` atau PR.

### Invariant (jangan dilanggar)

- Komponen UI tidak boleh menyentuh `localStorage` langsung; lewat `src/lib/storage.js`.
- Pertahankan key `catatuang.*` yang ada. Migrasi storage hanya bila dirancang eksplisit.
- Data pengguna yang sudah terpasang harus selamat melewati update/refactor.
- Tanggal lokal `YYYY-MM-DD`; bulan `YYYY-MM`. Jangan pakai timezone UTC.
- Recurring generation harus idempoten; instance recurring yang dihapus tidak boleh diregenerasi untuk bulan itu.
- Kategori soft-delete (`active: false`) tetap harus terbaca di riwayat transaksi.
- Offline tetap berfungsi tanpa jaringan; update check gagal diam-diam.

### Cara kerja

- Mulai dengan membaca `PRD.md` dan milestone aktif di `plan.md`.
- Baca file domain sempit, bukan seluruh source.
- Saat refactor: pertahankan perilaku, lalu jalankan verifikasi.
- Dokumen kanonis jangan duplikat; perbarui sumbernya.
- Jangan commit `.claude/`, `konteks.txt`, `*.apk`, `*.zip`, `dist/`, atau output Android.

## Verifikasi minimum

1. Checks terfokus sesuai perubahan (lihat milestone `plan.md`).
2. `npm run build` — harus sukses tanpa error.
3. Untuk perubahan UI/alur penting: jalankan skill **`catatuang:verify`** (Vite + Chrome headless/CDP, mobile viewport, localStorage, reload, screenshot).
