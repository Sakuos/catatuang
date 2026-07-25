// Metrik ringkas: label + nilai. Dipakai di summary/balance grid.
// props:
//   label (string)                    -> nama metrik
//   value (string)                    -> nilai terformat
//   tone ('default'|'income'|'expense') -> warna nilai
export default function SummaryMetric({ label, value, tone = 'default' }) {
  const toneClass = tone === 'income' ? ' income' : tone === 'expense' ? ' expense' : ''
  return (
    <div>
      <span>{label}</span>
      <strong className={toneClass.trim()}>{value}</strong>
    </div>
  )
}
