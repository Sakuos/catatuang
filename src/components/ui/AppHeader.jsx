import MonthPicker from '../shared/MonthPicker'

// Header aplikasi konsisten lintas layar.
// props:
//   title (string)               -> judul halaman
//   eyebrow (string)             -> konteks kecil di atas judul
//   showLogo (boolean)           -> tampilkan brand-mark (Dashboard saja)
//   showMonthPicker (boolean)    -> tampilkan navigasi bulan
//   month ('YYYY-MM'), onMonth   -> nilai + ubah bulan
//   actions (ReactNode)          -> slot tombol aksi kanan (mis. tema)
export default function AppHeader({
  title,
  eyebrow = 'Keuangan pribadi',
  showLogo = false,
  showMonthPicker = false,
  month,
  onMonth,
  actions,
}) {
  return (
    <header className={'app-header' + (showLogo ? ' brand-header' : '')}>
      <div>
        {showLogo && (
          <div className="brand-mark" aria-hidden="true">
            C
          </div>
        )}
        <div className={showLogo ? '' : 'app-header-title'}>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="header-actions">
        {showMonthPicker && <MonthPicker value={month} onChange={onMonth} />}
        {actions}
      </div>
    </header>
  )
}
