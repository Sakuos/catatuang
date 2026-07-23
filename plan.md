# plan.md — Roadmap Eksekusi CatatUang

Sumber produk: `PRD.md`. Aturan kode & verifikasi: `CLAUDE.md`.

## Legenda status

- `planned` — belum dimulai.
- `active` — sedang dikerjakan (maksimal satu, kecuali dinyatakan paralel).
- `blocked` — menunggu keputusan/dependensi.
- `done` — selesai & terverifikasi.

## Milestone 0 — Fondasi governance & dokumentasi `active`

**Deliverable:** `CLAUDE.md`, `PRD.md`, `plan.md`, tautan README, ignore `.claude/` + `konteks.txt`.

**Constraint:** tanpa perubahan perilaku aplikasi.

**Done ketika:** kepemilikan dokumen kanonis jelas; fitur sekarang vs masa depan terpisah; aturan 500 baris tertulis; `.claude/` & `konteks.txt` tidak muncul di `git status`.

**Verifikasi:** `git diff --check`, link check, `npm run build`, `git status --short` bersih.

## Milestone 1 — Baseline test otomatis `planned`

**Deliverable:** tambah Vitest + script `test`/`test:run`. Uji perilaku sekarang sebelum dipindah.

**Cakupan:** storage rusak fallback, CRUD transaksi, CSV dedup & parse sel berkutip, preset/custom kategori collision, soft-delete & restore, recurring clamping 29–31, catch-up, idempotensi reload, instance terhapus tak regenerasi, pause/resume/edit, selector finance (totals, saved, filter), `isNewer` update version.

**Constraint:** tanpa perubahan perilaku; tes membekukan kontrak yang ada.

**Done ketika:** `npm test` lulus dan menjelaskan perilaku saat ini.

## Milestone 2 — Pecah internal persistence `planned`

**Deliverable:** pertahankan `src/lib/storage.js` sebagai facade publik; pindahkan internal ke domain fokus (mis. `storage/shared.js`, `settings.js`, `categoryStore.js`, `transactionStore.js`, `recurringStore.js`). Pola usulan, bukan hasil final — tentukan saat mengerjakan.

**Constraint:** tidak ada perubahan import publik, tidak ada perubahan key `catatuang.*`, tanpa dependensi sirkular, tanpa migrasi data.

**Done ketika:** semua tes Milestone 1 lulus; `npm run build` sukses; export publik `storage.js` tak berubah.

## Milestone 3 — Pecah orkestrasi App `planned`

**Deliverable:** pindahkan kalkulasi finance murni ke modul (mis. `src/lib/finance.js`); pindahkan state/lifecycle ke hook fokus (mis. `src/hooks/useLedger.js`, `useAppPreferences.js`); `App.jsx` hanya komposisi halaman + pemilih sheet.

**Constraint:** pertahankan perilaku; jangan ganti satu orchestrator besar dengan satu hook besar — pecah lagi saat tanggung jawab berubah independen.

**Done ketika:** tes lulus; smoke UI via `catatuang:verify` setara; `App.jsx` di bawah target lunak.

## Milestone 4 — Pecah CSS `planned`

**Deliverable:** `src/styles.css` jadi entry import-only; pecah per layer (mis. `base`, `layout`, `forms`, `cards`, `transactions`, `responsive`). Pola usulan — tentukan saat mengerjakan.

**Constraint:** pertahankan urutan cascade & visual; variabel/base dimuat dulu, responsif terakhir; tanpa redesain.

**Done ketika:** `npm run build` sukses; screenshot light/dark sebelum-sesudah identik; alur UI `catatuang:verify` lulus.

## Milestone 5 — Keandalan rilis `planned`

**Deliverable:** ganti debug signing yang berubah-ubah dengan release signing stabil; keystore & password di GitHub Secrets; build APK/AAB signed.

**Constraint:** update APK baru dapat menimpa instalasi lama tanpa kehilangan data lokal.

**Done ketika:** update in-place terpasang dan data pengguna selamat (diverifikasi di HP).

## Milestone 6 — Discovery cloud/auth `blocked`

**Deliverable:** selesaikan keputusan terbuka di `PRD.md` section 9; definisikan protokol sync, conflict resolution, migrasi skema, auth & lifecycle, serta apakah facade menjadi async atau punya adapter local/remote. Tulis acceptance test sebelum implementasi Cloudflare Workers + D1.

**Constraint:** jangan letakkan implementasi cloud dalam PR decomposition. Wajib offline-first tetap utuh.

**Done ketika:** keputusan selesai, desain tertulis, tes penerimaan hijau sebelum kode cloud.
