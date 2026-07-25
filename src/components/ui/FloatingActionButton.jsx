// FAB: posisi konsisten terhadap bottom-nav + safe-area. lihat `.fab` di transactions.css.
export default function FloatingActionButton({
  onClick,
  label = 'Tambah transaksi',
  children = '+',
}) {
  return (
    <button type="button" className="fab" onClick={onClick} aria-label={label}>
      {children}
    </button>
  )
}
