// Bar progress pengeluaran per kategori, dengan emoji + label + persentase.
// props:
//   emoji (string)   -> ikon kategori
//   label (string)   -> nama kategori
//   spent (number)   -> nominal terpakai
//   total (number)   -> alokasi / total
//   pct (number)     -> persentase (0–100)
//   showAmount (boolean) -> tampilkan nominal
//   amountLabel (string) -> label terformat (opsional)
export default function CategoryProgress({ emoji, label, pct, amountLabel, showAmount = false }) {
  return (
    <>
      <div className="budget-top">
        <div className="transaction-icon" aria-hidden="true">
          {emoji}
        </div>
        <div>
          <strong>{label}</strong>
          {showAmount && amountLabel && <span>{amountLabel}</span>}
        </div>
        <b>{pct}%</b>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <i style={{ width: Math.max(pct, 2) + '%' }} />
      </div>
    </>
  )
}
