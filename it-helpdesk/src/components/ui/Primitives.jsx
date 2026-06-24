export function StatusBadge({ status, priority }) {
  const value = status || priority || ''
  const slug = value.toLowerCase().replace(/\s+/g, '-')
  return <span className={`status-pill status-pill--${slug}`}>{value}</span>
}

export function KpiCard({ label, value, trend, trendUp, variant = 'default' }) {
  return (
    <div className={`kpi-card kpi-card--${variant}`}>
      <span className="kpi-card__label">{label}</span>
      <div className="kpi-card__row">
        <span className="kpi-card__value">{value}</span>
        {trend != null && (
          <span className={`kpi-card__trend ${trendUp ? 'up' : 'down'}`}>
            {trendUp ? '↑' : '↓'} {trend}%
          </span>
        )}
      </div>
    </div>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon" aria-hidden="true">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="table-skeleton">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="table-skeleton__row" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className="skeleton skeleton--cell" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton({ count = 3 }) {
  return (
    <div className="card-skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton--card" />
      ))}
    </div>
  )
}

export function FilterChip({ label, active, onClick, onClear }) {
  return (
    <button type="button" className={`filter-chip ${active ? 'active' : ''}`} onClick={onClick}>
      {label}
      {active && onClear && (
        <span
          className="filter-chip__clear"
          onClick={(e) => { e.stopPropagation(); onClear() }}
          role="button"
          tabIndex={0}
          aria-label="Clear filter"
        >×</span>
      )}
    </button>
  )
}
