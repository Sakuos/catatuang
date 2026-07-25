export default function TypeToggle({ value, onChange }) {
  return (
    <div className="type-toggle">
      <button
        type="button"
        className={'type-btn' + (value === 'expense' ? ' active-expense' : '')}
        onClick={() => onChange('expense')}
      >
        Pengeluaran
      </button>
      <button
        type="button"
        className={'type-btn' + (value === 'income' ? ' active-income' : '')}
        onClick={() => onChange('income')}
      >
        Pemasukan
      </button>
    </div>
  )
}
