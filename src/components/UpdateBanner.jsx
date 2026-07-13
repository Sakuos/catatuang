import { openDownload } from '../lib/update'

// Banner pemberitahuan versi baru.
// props:
//   info { version, url } -> data update
//   onDismiss()           -> tutup banner (dan ingat versinya)
export default function UpdateBanner({ info, onDismiss }) {
  return (
    <div className="update-banner">
      <div className="update-text">
        <strong>✨ Versi baru tersedia</strong>
        <span>{info.version} — perbarui untuk fitur terbaru</span>
      </div>
      <div className="update-actions">
        <button type="button" className="update-btn" onClick={() => openDownload(info.url)}>
          Update
        </button>
        <button
          type="button"
          className="update-close"
          onClick={onDismiss}
          aria-label="Tutup"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
