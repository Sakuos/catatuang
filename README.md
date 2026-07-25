# 💰 CatatUang

Aplikasi **pencatat keuangan harian** sederhana — catat pemasukan & pengeluaran,
lihat saldo dan ringkasan per bulan. Berjalan **offline** (data tersimpan di HP kamu)
dan bisa dipasang sebagai **aplikasi Android (APK)**.

Dibuat dengan **React + Vite** lalu dibungkus jadi APK dengan **Capacitor**.

> 📖 **Dokumentasi proyek** — [PRD.md](PRD.md) (rujukan produk), [plan.md](plan.md) (roadmap), [CLAUDE.md](CLAUDE.md) (aturan kode & verifikasi).

---

## 📲 Download & Install (untuk pengguna)

APK terbaru selalu tersedia di halaman **[Releases](../../releases)**:

1. Buka tab **Releases** (di kanan halaman repo, atau klik link di atas)
2. Di rilis paling atas, bagian **Assets**, unduh **`CatatUang.apk`**
3. Buka file-nya di HP → **Install**. Jika diminta, izinkan "Install dari sumber tak dikenal"

> 🔄 **Cara update:** cukup ulangi langkah di atas dengan rilis terbaru. Data lama kamu
> tetap aman (tersimpan di HP). Android akan meminta konfirmasi setiap update — ini normal
> untuk aplikasi di luar Play Store.

---

## ✨ Fitur

- ➕ Tambah transaksi: pemasukan / pengeluaran, nominal, kategori, catatan, tanggal
- ✏️ Edit & 🗑️ hapus transaksi
- 📊 Ringkasan bulan: saldo, total pemasukan, total pengeluaran
- 📈 Grafik pengeluaran per kategori
- 🎯 Budget bulanan dengan peringatan bila mendekati/melewati batas
- 🔍 Cari & filter transaksi (per jenis / kata kunci)
- 📤 Export & 📥 Import transaksi via CSV (backup / pindah HP)
- 🏆 Target menabung dengan progress dari saldo
- 📊 Statistik bulan: rata-rata/hari, transaksi terbesar, jumlah transaksi
- 🌙 Mode gelap (dark mode)
- 🔔 Notifikasi otomatis saat ada versi baru (banner "Update" di dalam app)
- 📅 Pindah antar bulan
- 🏷️ Kategori dengan ikon (Makan, Transport, Gaji, dll.)
- ✨ Kategori kustom — tambah ikon/nama sendiri, hapus tanpa merusak riwayat
- 🔄 Transaksi otomatis bulanan untuk gaji, langganan, tagihan, dan lainnya
- 💾 Data tersimpan di HP (offline, privat, tanpa login)
- 💵 Format Rupiah

---

## 🚀 Menjalankan di komputer (untuk ngoding / uji coba)

Butuh **Node.js 18+**.

```bash
# 1. Install dependencies dan submodule referensi desain
npm install
git submodule update --init --recursive

# 2. Jalankan mode development (buka http://localhost:5173)
npm run dev

# 3. Quality checks
npm run format:check
npm run lint
npm run test:run
npm run build

# 4. Cek hasil build
npm run preview
```

---

## 📱 Membuat APK Android (otomatis lewat GitHub)

Kamu **tidak perlu** install Android Studio. Server GitHub yang membuat APK-nya.

1. Buat repo baru di GitHub, lalu unggah project ini:

   ```bash
   git init
   git add .
   git commit -m "CatatUang - versi pertama"
   git branch -M main
   git remote add origin https://github.com/USERNAME/NAMAREPO.git
   git push -u origin main
   ```

2. Buka repo di GitHub → tab **Actions**. Workflow **"Build APK"** akan otomatis jalan
   setiap kali kamu `push`. (Bisa juga ditekan manual lewat tombol **Run workflow**.)

3. Tunggu sampai ✅ hijau (sekitar 3–5 menit). Klik workflow yang selesai → bagian
   **Artifacts** di bawah → unduh **`CatatUang-apk`**.

4. Di dalamnya ada file **`app-debug.apk`**. Kirim ke HP (WhatsApp/Telegram/kabel USB),
   lalu buka untuk memasang. Jika diminta, aktifkan **"Install dari sumber tak dikenal"**.

> APK ini versi **debug** (untuk pemakaian sendiri). Untuk publikasi ke Play Store nanti
> perlu APK/AAB versi **release** yang ditandatangani (signed).

---

## 🖥️ (Opsional) Buka di Android Studio nanti

Project ini sudah kompatibel dengan Android Studio. Kalau nanti mau build/preview
langsung dari komputer:

```bash
npm run build
npm run cap:sync     # menyalin hasil web terbaru ke project Android
npm run cap:open     # membuka folder android/ di Android Studio
```

Lalu tekan tombol **Run** di Android Studio (butuh Android Studio + HP/emulator).

---

## 📂 Struktur singkat

```
src/
├── components/   # komponen per domain: transactions, recurring, finance, shared
├── hooks/        # state dan lifecycle aplikasi
├── lib/
│   ├── storage.js       # facade data publik
│   ├── storage/         # implementasi persistence per domain
│   └── *.js             # format, kategori, finance, CSV, update
├── styles/       # CSS per layer; urutan cascade dari styles.css
├── App.jsx       # komposisi halaman
└── styles.css    # entry import CSS
external/
└── awesome-design-md/   # submodule referensi desain; bukan dependency runtime
android/                  # project Android dari Capacitor
.github/workflows/build-apk.yml
```

> **Catatan teknis:** semua akses data lewat `src/lib/storage.js` (facade tunggal).
> Rencana **sinkron cloud** (Cloudflare) akan menggunakan facade ini, tetapi auth,
> state async, dan UI konflik kemungkinan menyentuh layer lain — detail di [PRD.md](PRD.md).

### Referensi desain eksternal

Repo `VoltAgent/awesome-design-md` dipasang sebagai Git submodule, bukan disalin ke source app.

```bash
# Clone baru sekaligus submodule
git clone --recurse-submodules https://github.com/Sakuos/catatuang.git

# Jika repo sudah pernah di-clone
git submodule update --init --recursive

# Ambil versi terbaru upstream; review perubahan pointer sebelum commit
git submodule update --remote external/awesome-design-md
```

---

## 🔜 Rencana berikutnya (Tahap 2)

Arah produk lengkap ada di [PRD.md](PRD.md); urutan eksekusi di [plan.md](plan.md). Singkatnya:

- ☁️ Sinkron cloud pakai **Cloudflare Workers + D1** agar data bisa diakses dari beberapa perangkat
- 🔐 Login sederhana

---

## 📄 Lisensi

MIT
