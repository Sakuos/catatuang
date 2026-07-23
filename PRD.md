# PRD — CatatUang

- **Produk:** CatatUang
- **Status:** aktif
- **Tahap:** offline-first Android (data di `localStorage`)
- **Terakhir ditinjau:** 2026-07-23
- **Pemilik:** Bayu

## 1. Visi

Pencatat keuangan harian yang sederhana, privat, dan tetap berguna tanpa akun, jaringan, atau layanan eksternal.

## 2. Pengguna & masalah

- Individu pengguna Rupiah di Indonesia.
- Butuh catat pemasukan/pengeluaran cepat.
- Butuh ringkasan bulanan yang mudah dipahami.
- Butuh privasi lokal dan akses offline andal.
- Butuh backup/pindah perangkat lewat CSV.

## 3. Prinsip produk

- **Offline-first:** app berfungsi penuh tanpa jaringan.
- **Data milik pengguna:** tidak ada akun wajib atau unggahan data tanpa persetujuan.
- **Gesekan rendah:** input transaksi secepat mungkin.
- **Locale Indonesia:** Rupiah, format tanggal `id-ID`.
- **Kompatibilitas data di atas keindahan arsitektur:** data pengguna lama harus selamat.
- **Fitur cloud tidak boleh diam-diam melemahkan perilaku offline.**

## 4. Kemampuan saat ini

- **Transaksi:** tambah/edit/hapus pemasukan & pengeluaran (nominal, kategori, catatan, tanggal).
- **Dashboard bulanan:** saldo, total pemasukan, total pengeluaran, navigasi antar bulan.
- **Statistik:** rata-rata/hari, transaksi terbesar, jumlah transaksi.
- **Budget:** bulanan dengan peringatan saat mendekati/melewati batas.
- **Target menabung:** progress dari saldo total.
- **Grafik:** pengeluaran per kategori.
- **Kategori:** preset ber-emoji; kategori kustom (tambah/hapus); preset tidak bisa dihapus; kategori yang dihapus tetap terbaca di riwayat.
- **Transaksi otomatis bulanan:** pola recurring untuk gaji/langganan/tagihan; tambah/edit/jeda/aktifkan/hapus; catch-up transaksi jatuh tempo; tanggal 29–31 dijepit ke akhir bulan; ledger cegah duplikat; instance yang sengaja dihapus tidak diregenerasi.
- **Filter & cari:** per jenis dan kata kunci (catatan/label kategori).
- **CSV:** export & import (backup/pindah HP), import melewatkan duplikat.
- **Tema:** dark/light, tersimpan.
- **Update:** banner notifikasi versi baru dari GitHub Release; instalasi manual.
- **Android:** build APK otomatis lewat GitHub Actions.

## 5. Model domain

### Transaksi
`{ id, type: 'income'|'expense', amount: number, category: string, note: string, date: 'YYYY-MM-DD' }`
Transaksi otomatis juga punya `{ recurringId: string, recurringPeriod: 'YYYY-MM' }`.

### Kategori kustom
`{ id, type: 'income'|'expense', label, emoji, active: boolean }`. `active: false` = soft-delete (sembunyi dari picker, tetap tampil di riwayat).

### Pola recurring
`{ id, type, amount, category, note, dayOfMonth: 1..31, startDate, endDate|null, active: boolean, generatedPeriods: string[] }`.

### Preferensi
tema (`'dark'|'light'`), budget (number), goal (number), `dismissedUpdateVersion` (string).

### Format
Tanggal `YYYY-MM-DD` lokal; bulan `YYYY-MM`. Mata uang Rupiah `id-ID`.

### Storage keys (jangan diubah tanpa migrasi)
`catatuang.transactions`, `catatuang.budget`, `catatuang.goal`, `catatuang.theme`, `catatuang.dismissedUpdate`, `catatuang.customCategories`, `catatuang.recurringPatterns`.

## 6. Requirement & acceptance criteria

- CRUD transaksi bertahan setelah reload/restart app.
- Import CSV melewatkan baris duplikat (kunci: date|type|amount|category|note).
- Hapus kategori kustom menyembunyikannya dari picker tetapi riwayat tetap menampilkan label.
- Pembuatan kategori yang menabrak preset ditolak; kategori soft-deleted dapat dipulihkan ulang dengan nama sama.
- Recurring catch-up: transaksi jatuh tempo dibuat sekali, tidak diduplikasi saat reload.
- Tanggal 29–31 dijepit ke hari terakhir bulan pendek (mis. 31 → 28 di Februari).
- Pause mencegah occurrence baru; resume melanjutkan.
- Edit pola tidak mengubah transaksi lama.
- Hapus instance recurring tidak meregenerasi bulan tersebut.
- Cek update gagal diam-diam saat offline/repo privat; tidak mengganggu app.
- Tema, budget, goal bertahan setelah reload.

## 7. Requirement nonfungsional

- **Privasi:** tanpa akun dan unggahan data (tahap ini).
- **Reliability:** storage rusak/malformed tidak boleh crash app (fallback aman).
- **Kompatibilitas:** data lokal pengguna lama selamat melewati rilis/refactor.
- **Performa:** launch dan filter bulanan tetap responsif.
- **Aksesibilitas:** kontrol interaktif punya label dan semantik keyboard.
- **Maintainability:** modul fokus, target lunak 500 baris (lihat `CLAUDE.md`).
- **Keamanan rilis:** signing stabil diperlukan sebelum update in-place publik andal.

## 8. Non-goal tahap ini

Tidak dikerjakan sekarang (bukan larangan permanen — butuh keputusan di section 9):

- Implementasi cloud sync.
- Implementasi login.
- Penulisan ulang skema storage.
- Redesain visual.
- Integrasi bank.
- Instalasi APK otomatis.

## 9. Arah tahap berikutnya (perlu keputusan)

Cloudflare Workers + D1 dan login sederhana tetap arah masa depan, tetapi membutuhkan keputusan produk sebelum kode:

- Sync cloud opsional atau wajib?
- Perilaku offline saat autentikasi/jaringan gagal.
- Identitas perangkat vs identitas pengguna.
- Migrasi data localStorage saat unggah pertama.
- Resolusi konflik antar perangkat.
- Semantik penghapusan dan penggabungan ledger recurring lintas perangkat.
- Penghapusan/ekspor akun.
- Enkripsi dan retensi data.
- Dampak persistensi async terhadap state React.

> **Catatan:** README lama menyiratkan cloud sync cukup mengubah isi `storage.js`. Facade memang mengurangi dampak, tetapi auth, state async, error/conflict UI, dan migrasi kemungkinan menyentuh layer lain. Jangan janjikan UI tak berubah sebelum keputusan diselesaikan.

## 10. Kriteria sukses

- Pengguna menyelesaikan alur inti sepenuhnya offline.
- Reload mempertahankan state; tidak ada duplikat recurring.
- Data lama tetap kompatibel; CSV round-trip bekerja.
- Build Android produksi sukses.
- Fase cloud baru dimulai setelah keputusan open di section 9 selesai.

## 11. Keputusan terbuka

(Rekam keputusan singkat di sini; pindah ke requirement saat selesai.)

- Sync cloud opsional atau wajib? — *belum*
- Strategi migrasi + conflict resolution — *belum*
- Signing release tetap di GitHub Secrets? — *belum*
