// Baris pencarian + filter jenis transaksi.
// props:
//   search (string)        -> teks pencarian
//   onSearch(str)          -> ubah teks pencarian
//   filterType ('all'|'income'|'expense')
//   onFilterType(v)        -> ubah filter jenis
const PILIHAN = [
  { id: 'all', label: 'Semua' },
  { id: 'income', label: 'Pemasukan' },
  { id: 'expense', label: 'Pengeluaran' },
]

export default function FilterBar({ search, onSearch, filterType, onFilterType }) {
  function nextFilter() {
    if (filterType === 'all') return 'expense'
    if (filterType === 'expense') return 'income'
    return 'all'
  }

  return (
    <div className="filter-bar">
      <div className="toolbar">
        <label className="search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Cari transaksi..."
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => onSearch('')}
              aria-label="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </label>
      </div>
      <div className="filter-tabs" aria-label="Filter transaksi">
        {PILIHAN.map((pilihan) => (
          <button
            key={pilihan.id}
            type="button"
            className={filterType === pilihan.id ? 'filter-btn active' : ''}
            aria-pressed={filterType === pilihan.id}
            onClick={() => onFilterType(filterType === pilihan.id ? nextFilter() : pilihan.id)}
          >
            {pilihan.label}
          </button>
        ))}
      </div>
    </div>
  )
}
