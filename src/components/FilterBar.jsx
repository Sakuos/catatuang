// Baris pencarian + filter jenis transaksi.
// props:
//   search (string)        -> teks pencarian
//   onSearch(str)          -> ubah teks pencarian
//   filterType ('all'|'income'|'expense')
//   onFilterType(v)        -> ubah filter jenis
const PILIHAN = [
  ['all', 'Semua'],
  ['income', 'Pemasukan'],
  ['expense', 'Pengeluaran'],
]

export default function FilterBar({ search, onSearch, filterType, onFilterType }) {
  return (
    <div className="filter-bar">
      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="text"
          placeholder="Cari catatan atau kategori..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        {search && (
          <button type="button" className="search-clear" onClick={() => onSearch('')} aria-label="Hapus">
            ✕
          </button>
        )}
      </div>
      <div className="filter-chips">
        {PILIHAN.map(([v, label]) => (
          <button
            key={v}
            type="button"
            className={'filter-chip' + (filterType === v ? ' active' : '')}
            onClick={() => onFilterType(v)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
