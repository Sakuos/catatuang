// Baris pencarian + filter jenis transaksi.
// props:
//   search (string)        -> teks pencarian
//   onSearch(str)          -> ubah teks pencarian
//   filterType ('all'|'income'|'expense')
//   onFilterType(v)        -> ubah filter jenis
const PILIHAN = {
  all: 'Semua',
  expense: 'Pengeluaran',
  income: 'Pemasukan',
}

export default function FilterBar({ search, onSearch, filterType, onFilterType }) {
  const nextFilter = () => {
    if (filterType === 'all') return 'expense'
    if (filterType === 'expense') return 'income'
    return 'all'
  }

  return (
    <div className="toolbar">
      <label className="search">
        <span aria-hidden="true">⌕</span>
        <input
          type="text"
          placeholder="Cari transaksi"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--muted)',
              cursor: 'pointer',
              padding: '0 4px',
              fontSize: '14px',
            }}
            onClick={() => onSearch('')}
            aria-label="Hapus"
          >
            ✕
          </button>
        )}
      </label>
      <button type="button" className="filter-btn" onClick={() => onFilterType(nextFilter())}>
        {PILIHAN[filterType]}
      </button>
    </div>
  )
}
