import { useState } from 'react'
import { formatRupiah } from '../../lib/format'
import { exportCSV } from '../../lib/export'
import RecurringCard from '../recurring/RecurringCard'
import UpdateBanner from '../shared/UpdateBanner'
import SectionHeader from '../ui/SectionHeader'
import pkg from '../../../package.json'

// Layar Profil: kartu profil, pengaturan (tema, kategori),
// data (recurring, import/export), dan tentang (update).
// Integrasi fitur yang tak terlihat di mockup tapi tetap dipertahankan.
export default function ProfileScreen({
  preferences,
  ledger,
  update,
  dismissUpdate,
  onImportFile,
  onAddRecurring,
  onEditRecurring,
  onGoToTransactions,
  showUpdate = true,
}) {
  const totalTransaksi = ledger.transactions.length
  const totalRecurring = ledger.recurringPatterns.length
  const [exportStatus, setExportStatus] = useState('')

  async function handleExport() {
    setExportStatus('Mengekspor data…')
    try {
      await exportCSV(ledger.transactions)
      setExportStatus('Export CSV selesai.')
    } catch {
      setExportStatus('Export CSV gagal. Coba lagi.')
    }
  }

  return (
    <div className="screen-content">
      <div className="scroll-area">
        {showUpdate && update && <UpdateBanner info={update} onDismiss={dismissUpdate} />}

        <article className="profile-card">
          <div className="avatar">C</div>
          <div>
            <h2>CatatUang</h2>
            <p>
              {totalTransaksi} transaksi · {totalRecurring} otomatis ·{' '}
              {formatRupiah(
                ledger.transactions.reduce((a, t) => a + (t.type === 'income' ? t.amount : 0), 0)
              )}{' '}
              tercatat
            </p>
          </div>
        </article>

        <div className="settings-group">
          <h3>Preferensi</h3>
          <button type="button" onClick={preferences.toggleTheme}>
            <span className="setting-icon">{preferences.theme === 'dark' ? '◐' : '☀'}</span>
            <div>
              <b>Tampilan</b>
              <small>{preferences.theme === 'dark' ? 'Mode gelap' : 'Mode terang'}</small>
            </div>
            <i>›</i>
          </button>
          <button type="button" aria-label="Mata uang Rupiah" disabled>
            <span className="setting-icon">Rp</span>
            <div>
              <b>Mata uang</b>
              <small>Rupiah Indonesia</small>
            </div>
            <i>›</i>
          </button>
          <button type="button" onClick={onGoToTransactions}>
            <span className="setting-icon">⌁</span>
            <div>
              <b>Kategori</b>
              <small>Atur kategori transaksi</small>
            </div>
            <i>›</i>
          </button>
        </div>

        <SectionHeader
          eyebrow="Otomatis"
          title="Transaksi berulang"
          action={
            <button type="button" className="text-btn" onClick={onAddRecurring}>
              + Tambah
            </button>
          }
        />
        <RecurringCard
          patterns={ledger.recurringPatterns}
          customCategories={ledger.customCategories}
          onAdd={onAddRecurring}
          onEdit={onEditRecurring}
          onToggle={ledger.toggleRecurring}
          onDelete={ledger.deleteRecurring}
        />

        <div className="settings-group">
          <h3>Data</h3>
          <button type="button" onClick={onImportFile}>
            <span className="setting-icon">↥</span>
            <div>
              <b>Backup & Pulihkan</b>
              <small>Amankan data lokal (Import CSV)</small>
            </div>
            <i>›</i>
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exportStatus === 'Mengekspor data…'}
          >
            <span className="setting-icon">⇄</span>
            <div>
              <b>Import & Export</b>
              <small>Export data CSV</small>
            </div>
            <i>›</i>
          </button>
        </div>
        {exportStatus && (
          <p className="gesture-hint" role="status" aria-live="polite">
            {exportStatus}
          </p>
        )}

        <div className="settings-group">
          <h3>Tentang</h3>
          <div className="setting-static">
            <span className="setting-icon">i</span>
            <div>
              <b>CatatUang</b>
              <small>Versi {pkg.version}</small>
            </div>
          </div>
        </div>

        <p className="gesture-hint">Data tersimpan di HP kamu · offline</p>
      </div>
    </div>
  )
}
