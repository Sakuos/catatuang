// Row transaksi reusable untuk dashboard dan daftar transaksi.
// Business data sudah diformat di parent; komponen hanya presentasi.
export default function TransactionRow({
  icon,
  title,
  subtitle,
  amount,
  type,
  badge,
  onClick,
  action,
}) {
  const content = (
    <>
      <div className="transaction-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <h4>
          {title}
          {badge && (
            <span className="recurring-badge" style={{ marginLeft: 6 }}>
              {badge}
            </span>
          )}
        </h4>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <strong className={type}>{amount}</strong>
      {action}
    </>
  )

  if (onClick) {
    return (
      <div
        className="transaction"
        style={{ cursor: 'pointer', textAlign: 'left' }}
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onClick()
          }
        }}
        role="button"
        tabIndex={0}
      >
        {content}
      </div>
    )
  }

  return <div className="transaction">{content}</div>
}
