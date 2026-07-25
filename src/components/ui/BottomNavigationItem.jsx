// Item bottom navigation konsisten.
// props:
//   icon (ReactNode)  -> ikon tab (emoji)
//   label (string)    -> label teks
//   active (boolean)  -> tab aktif
//   onClick (fn)      -> pindah tab
//   ariaLabel (string) -> label aksesibel
export default function BottomNavigationItem({ icon, label, active, onClick, ariaLabel }) {
  return (
    <button
      type="button"
      className={active ? 'active' : ''}
      aria-current={active ? 'page' : undefined}
      aria-label={ariaLabel || label}
      onClick={onClick}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  )
}
