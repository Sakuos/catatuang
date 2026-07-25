# 💰 CatatUang — Pencatat Keuangan Harian

**Offline-First Android App · MIT License**

CatatUang adalah aplikasi pencatat keuangan harian untuk Android yang berjalan sepenuhnya **offline**. Catat pemasukan dan pengeluaran, pantau saldo, atur budget bulanan, dan lihat statistik pengeluaran — semua tanpa login, tanpa server, tanpa iklan. Data tersimpan di HP kamu sendiri.

Dibangun dengan **React + Vite**, dibungkus jadi APK memakai **Capacitor**, dan dirilis otomatis lewat **GitHub Actions** dengan APK yang sudah **signed** (bisa update in-place tanpa kehilangan data).

> 📖 **Dokumentasi proyek** — [PRD.md](PRD.md) (rujukan produk), [plan.md](plan.md) (roadmap eksekusi), [CLAUDE.md](CLAUDE.md) (aturan kode & verifikasi).

---

## 🚀 Fitur Utama

- 💾 **Offline & Privat**: Semua data disimpan lokal di HP (`localStorage` WebView). Tanpa akun, tanpa upload, tanpa tracking.
- ➕ **Catat Transaksi Cepat**: Pemasukan / pengeluaran dengan nominal, kategori, catatan, dan tanggal. Bisa diedit dan dihapus.
- 📊 **Ringkasan Bulanan**: Saldo, total pemasukan, total pengeluaran, dan selisih untuk bulan yang dipilih.
- 📈 **Grafik Arus Kas & Kategori**: Lihat ke mana uang pergi lewat grafik pengeluaran per kategori.
- 🎯 **Budget Bulanan**: Tetapkan batas belanja dengan peringatan otomatis saat mendekati atau melewati batas.
- 🔄 **Transaksi Otomatis Bulanan**: Gaji, langganan, dan tagihan dibuat otomatis tiap bulan. Idempoten — tanggal 29–31 dijepit aman untuk bulan pendek, instance yang kamu hapus tidak muncul lagi.
- 🏷️ **Kategori Kustom**: Tambah nama dan ikon sendiri. Kategori yang dihapus tetap terbaca di riwayat lama (soft-delete).
- 🏆 **Target Menabung**: Tetapkan target dan pantau progresnya dari saldo berjalan.
- 📊 **Statistik Bulan**: Rata-rata pengeluaran per hari, transaksi terbesar, dan jumlah transaksi.
- 🔍 **Cari & Filter**: Filter per jenis transaksi atau cari lewat kata kunci.
- 📤 **Export & Import CSV**: Backup data atau pindah HP lewat file CSV, dengan dedup saat import.
- 🌙 **Mode Gelap**: Tema terang dan gelap, mengikuti pilihan kamu.
- 🔔 **Notifikasi Update**: Banner "Update" muncul di dalam app saat ada rilis baru di GitHub. Gagal cek jaringan tidak mengganggu pemakaian offline.
- 💵 **Format Rupiah & Locale `id-ID`**: Angka, tanggal, dan nama bulan dalam bahasa Indonesia.

---

## 📦 Tech Stack

| Komponen        | Versi / Teknologi                              |
| --------------- | ---------------------------------------------- |
| UI Framework    | React 18                                       |
| Build Tool      | Vite 5                                         |
| Native Wrapper  | Capacitor 6 (Android)                          |
| Penyimpanan     | `localStorage` WebView (offline, tanpa server) |
| Plugin Native   | Filesystem, Share, Browser (`@capacitor/*`)    |
| Testing         | Vitest 2 + jsdom                               |
| Kualitas Kode   | ESLint 9 + Prettier 3                          |
| CI/CD           | GitHub Actions (build + release APK signed)    |
| Bahasa & Format | Locale `id-ID`, mata uang Rupiah               |

---

## 📲 Download & Install (untuk pengguna)

APK terbaru selalu tersedia di halaman **[Releases](../../releases)**:

1. Buka tab **Releases** (di kanan halaman repo, atau klik tautan di atas).
2. Di rilis paling atas, bagian **Assets**, unduh **`CatatUang.apk`**.
3. Buka file-nya di HP → **Install**. Jika diminta, izinkan "Install dari sumber tak dikenal".

> 🔄 **Cara update:** ulangi langkah di atas dengan rilis terbaru. APK bisa langsung ditimpa tanpa hapus data.

> ⚠️ **Catatan untuk pengguna versi lama (≤ v1.0.12):**
> Versi setelah v1.0.12 mulai memakai kunci signing permanen. Jika HP menolak pembaruan (error bentrok aplikasi / "app not installed"), lakukan migrasi satu kali:
>
> 1. Buka CatatUang lama → **Profil → Import & Export**.
> 2. Export ke file CSV.
> 3. Hapus (uninstall) aplikasi lama.
> 4. Pasang APK versi terbaru.
> 5. Buka **Profil → Import & Export** → masukkan file CSV tadi.
>
> Setelah migrasi ini, semua update ke depan bisa ditimpa in-place tanpa kehilangan data.

---

## 🛠️ Cara Penggunaan

- **Tambah transaksi**: tekan tombol tambah, pilih jenis (pemasukan / pengeluaran), isi nominal, pilih kategori, lalu simpan.
- **Pindah bulan**: gunakan pemilih bulan di bagian atas untuk melihat ringkasan bulan lain.
- **Atur budget**: buka layar **Budget**, tetapkan batas bulanan, lalu pantau indikator peringatannya.
- **Transaksi otomatis**: buat pola bulanan (mis. gaji tanggal 25) di layar transaksi otomatis. Bisa di-pause, diedit, atau dihapus per instance.
- **Backup data**: **Profil → Import & Export → Export CSV**, lalu simpan atau bagikan file-nya.
- **Pindah HP**: export CSV dari HP lama, install APK di HP baru, lalu import CSV tersebut.

---

## 👨‍💻 Untuk Developer (Build dari Source Code)

Butuh **Node.js 18+**.

```bash
# 1. Clone repositori sekaligus submodule referensi desain
git clone --recurse-submodules https://github.com/Sakuos/catatuang.git
cd catatuang

# 2. Install dependencies
npm install

# 3. Jalankan mode development (buka http://localhost:5173)
npm run dev

# 4. Quality checks
npm run format:check
npm run lint
npm run test:run

# 5. Build produksi + cek hasilnya
npm run build
npm run preview
```

### 📱 Build APK otomatis lewat GitHub Actions

Tidak perlu install Android Studio — server GitHub yang membangun APK-nya, langsung versi **release** dan **signed**.

1. Siapkan keystore sekali saja, lalu simpan hasilnya sebagai **Repository secrets** (Settings → Secrets and variables → Actions):

   ```bash
   # buat keystore (simpan file & password ini baik-baik, jangan pernah di-commit)
   keytool -genkeypair -v -keystore catatuang-release.jks \
     -keyalg RSA -keysize 2048 -validity 10000 -alias catatuang

   # ubah jadi base64 untuk ditempel ke secret
   base64 -w 0 catatuang-release.jks > keystore.base64.txt
   ```

   | Secret                      | Isi                         |
   | --------------------------- | --------------------------- |
   | `ANDROID_KEYSTORE_BASE64`   | isi `keystore.base64.txt`   |
   | `ANDROID_KEYSTORE_PASSWORD` | password keystore           |
   | `ANDROID_KEY_ALIAS`         | alias key, mis. `catatuang` |
   | `ANDROID_KEY_PASSWORD`      | password key                |

   Kalau salah satu secret kosong, workflow berhenti dengan pesan jelas — bukan diam-diam menghasilkan APK tanpa tanda tangan.

2. Workflow **"Build APK"** (`.github/workflows/build-apk.yml`) otomatis jalan setiap `push` ke `main`, dan bisa dipicu manual lewat tombol **Run workflow**.

3. Tunggu sampai ✅ hijau (sekitar 3–5 menit). Hasilnya ada di dua tempat:
   - **Releases** → rilis `v1.0.<nomor-build>` dengan aset **`CatatUang.apk`** (khusus push ke `main`)
   - **Artifacts** di halaman run → **`CatatUang-apk`** sebagai cadangan

> `versionName` = `1.0.<nomor-build>` dan `versionCode` naik otomatis tiap build, jadi update berikutnya bisa ditimpa in-place. Sebelum diunggah, APK diperiksa dengan `apksigner verify` supaya build gagal kalau tanda tangannya tidak sah.

### 🔐 Build release di komputer sendiri

Butuh 4 environment variable yang sama seperti CI:

```bash
export CATATUANG_KEYSTORE_FILE=/path/catatuang-release.jks
export CATATUANG_KEYSTORE_PASSWORD=...
export CATATUANG_KEY_ALIAS=catatuang
export CATATUANG_KEY_PASSWORD=...

npm run build
npm run cap:sync
cd android && ./gradlew assembleRelease
```

Tanpa keempat variable itu, `assembleRelease` sengaja gagal (lihat `android/app/build.gradle`) agar tidak ada APK release tanpa signing.

### 🖥️ (Opsional) Buka di Android Studio

```bash
npm run build
npm run cap:sync     # menyalin hasil web terbaru ke project Android
npm run cap:open     # membuka folder android/ di Android Studio
```

Lalu tekan tombol **Run** di Android Studio (butuh Android Studio + HP/emulator).

---

## 📂 Struktur Folder Penting

```
src/
├── components/          # komponen per domain: transactions, recurring, categories, finance, shared
├── hooks/               # state & lifecycle (useLedger, preferences, update)
├── lib/
│   ├── storage.js       # facade data publik — SATU-SATUNYA jalur akses data
│   ├── storage/         # implementasi persistence per domain (internal)
│   ├── categories.js    # preset + kategori kustom
│   ├── finance.js       # selector & kalkulasi finance murni
│   ├── format.js        # Rupiah, tanggal, bulan
│   ├── export.js        # build/parse CSV, export Filesystem & Share
│   └── update.js        # cek rilis terbaru di GitHub
├── styles/              # CSS per layer; urutan cascade diatur dari styles.css
├── App.jsx              # komposisi halaman & sheet
└── styles.css           # entry import CSS
android/                 # project Android hasil Capacitor (jangan edit file generated)
external/
└── awesome-design-md/   # submodule referensi desain, bukan dependency runtime
.github/workflows/build-apk.yml
```

> **Catatan teknis:** komponen UI tidak boleh menyentuh `localStorage` langsung — semua akses data lewat `src/lib/storage.js`. Rencana **sinkron cloud** (Cloudflare) akan memakai facade ini juga, tapi auth, state async, dan UI konflik kemungkinan menyentuh layer lain. Detail di [PRD.md](PRD.md).

### Referensi desain eksternal

Repo `VoltAgent/awesome-design-md` dipasang sebagai Git submodule, bukan disalin ke source app.

```bash
# Jika repo sudah pernah di-clone tanpa submodule
git submodule update --init --recursive

# Ambil versi terbaru upstream; review perubahan pointer sebelum commit
git submodule update --remote external/awesome-design-md
```

---

## ⚠️ Troubleshooting (Masalah Umum)

- **APK baru gagal dipasang ("app not installed" / bentrok signing)**: Instalasi lama masih memakai kunci debug yang lama. Ikuti langkah migrasi CSV di bagian [Download & Install](#-download--install-untuk-pengguna).
- **Workflow gagal di step `Decode keystore`**: Salah satu dari empat secret belum diisi atau isi base64-nya rusak. Buat ulang `keystore.base64.txt` dengan `base64 -w 0` (tanpa baris baru), lalu tempel ulang.
- **`./gradlew assembleRelease` gagal di komputer sendiri**: Empat variable `CATATUANG_*` belum di-export. Ini memang disengaja agar tidak menghasilkan APK tanpa tanda tangan.
- **Perubahan web tidak muncul di APK**: Jalankan `npm run build` lalu `npm run cap:sync` sebelum build Android. Capacitor memakai hasil di `dist/`.
- **Banner update tidak muncul**: Cek koneksi internet. Pengecekan rilis memang gagal diam-diam agar aplikasi tetap jalan penuh saat offline.
- **Transaksi otomatis tidak muncul di tanggal 31**: Untuk bulan yang lebih pendek, tanggal 29–31 dijepit ke hari terakhir bulan tersebut. Ini perilaku yang diharapkan.

---

## 🔜 Rencana Berikutnya

Arah produk lengkap ada di [PRD.md](PRD.md); urutan eksekusi di [plan.md](plan.md). Singkatnya:

- ☁️ Sinkron cloud pakai **Cloudflare Workers + D1** agar data bisa diakses dari beberapa perangkat
- 🔐 Login sederhana, dengan syarat offline-first tetap utuh

---

## 📄 Lisensi

MIT
