import { formatAmountInput } from '../../lib/amount'

export default function AmountInput({ value, onChange }) {
  return (
    <div className="amount-input">
      <span className="amount-prefix">Rp</span>
      <input
        type="text"
        inputMode="numeric"
        placeholder="0"
        value={value}
        onChange={(event) => onChange(formatAmountInput(event.target.value))}
      />
    </div>
  )
}
