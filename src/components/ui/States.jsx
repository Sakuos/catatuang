// State presentasi reusable untuk konten kosong, loading, dan error.
function State({ icon, title, hint, role = 'status' }) {
  return (
    <div className="ui-state" role={role}>
      {icon && (
        <div className="ui-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <p className="ui-state-title">{title}</p>
      {hint && <p className="ui-state-hint">{hint}</p>}
    </div>
  )
}

export function EmptyState({ icon = '🗒️', title, hint }) {
  return <State icon={icon} title={title} hint={hint} />
}

export function LoadingState({ title = 'Memuat…' }) {
  return <State icon="◌" title={title} />
}

export function ErrorState({ title = 'Terjadi kesalahan.', hint }) {
  return <State icon="!" title={title} hint={hint} role="alert" />
}
