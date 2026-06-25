import { Link } from 'react-router-dom'

/* ── Mini mock dashboard rendered with HTML/CSS ── */
function MockDashboard() {
  const bars = [2, 4, 3, 7, 5, 9, 6, 8, 4, 6, 3, 5, 7, 9]
  const maxBar = Math.max(...bars)
  return (
    <div className="mock-window">
      <div className="mock-titlebar">
        <span className="mock-dot mock-dot--red" />
        <span className="mock-dot mock-dot--yellow" />
        <span className="mock-dot mock-dot--green" />
        <span className="mock-titlebar__label">DeskFlow — Admin Overview</span>
      </div>
      <div className="mock-body">
        {/* KPI row */}
        <div className="mock-kpis">
          {[
            { label: 'Open', value: '24', color: 'blue' },
            { label: 'In Progress', value: '12', color: 'amber' },
            { label: 'Resolved', value: '38', color: 'green' },
            { label: 'SLA Breach', value: '3', color: 'red' },
          ].map((k) => (
            <div key={k.label} className={`mock-kpi mock-kpi--${k.color}`}>
              <span className="mock-kpi__val">{k.value}</span>
              <span className="mock-kpi__lbl">{k.label}</span>
            </div>
          ))}
        </div>

        {/* Chart + activity row */}
        <div className="mock-lower">
          <div className="mock-chart-card">
            <span className="mock-section-lbl">Ticket volume — last 14 days</span>
            <div className="mock-bars">
              {bars.map((h, i) => (
                <div key={i} className="mock-bar-col">
                  <div className="mock-bar" style={{ height: `${Math.round((h / maxBar) * 52)}px` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="mock-feed-card">
            <span className="mock-section-lbl">Recent activity</span>
            {[
              { id: 'TKT-021', status: 'Open',    agent: 'Anna B.' },
              { id: 'TKT-020', status: 'In Progress', agent: 'Chris O.' },
              { id: 'TKT-019', status: 'Resolved', agent: 'Rachel G.' },
              { id: 'TKT-018', status: 'Open',    agent: 'Anna B.' },
            ].map((r) => (
              <div key={r.id} className="mock-feed-row">
                <span className="mock-feed-id">{r.id}</span>
                <span className={`mock-badge mock-badge--${r.status.toLowerCase().replace(' ', '-')}`}>{r.status}</span>
                <span className="mock-feed-agent">{r.agent}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Feature highlights strip ── */
const highlights = [
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    title: 'SLA Monitoring',
    desc: 'Live breach detection with instant alerts — never miss a deadline again.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    title: 'Smart Routing',
    desc: 'Auto-assign tickets to the right agent based on specialization and load.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    title: 'Threaded Chat',
    desc: 'Contextual messaging on every ticket. No email chains, no lost context.',
  },
  {
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
    title: 'Admin Analytics',
    desc: '30-day volume charts, KPI cards, and per-agent workload — all in one view.',
  },
]

/* ── Portal entry cards ── */
const portals = [
  {
    to: '/employee',
    title: 'Employee',
    desc: 'Submit requests and track your tickets through to resolution.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    accent: '#3B82F6',
  },
  {
    to: '/agent',
    title: 'Agent',
    desc: 'Manage your queue, resolve issues, and collaborate on tickets.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
    accent: '#8B5CF6',
  },
  {
    to: '/admin',
    title: 'Admin',
    desc: 'Operations overview, SLA health monitoring, and team workload.',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    accent: '#0EA5E9',
  },
]

export default function HomePage() {
  return (
    <div className="hp-page">

      {/* ── Hero ── */}
      <section className="hp-hero">
        {/* Top row: headline + mock */}
        <div className="hp-hero__top">
          <div className="hp-hero__left">
            <span className="hp-eyebrow">Enterprise IT Service Management</span>
            <h1 className="hp-headline">
              IT support your<br />
              <span className="hp-headline--gradient">whole team</span><br />
              can rely on
            </h1>
            <p className="hp-sub">
              DeskFlow unifies ticket intake, agent workflows, and real-time SLA tracking in one clean platform built for modern IT teams.
            </p>
            <div className="hp-stats">
              <div className="hp-stat">
                <strong>3 portals</strong>
                <span>Employee · Agent · Admin</span>
              </div>
              <div className="hp-stat-div" />
              <div className="hp-stat">
                <strong>Real-time SLA</strong>
                <span>Breach detection &amp; alerts</span>
              </div>
              <div className="hp-stat-div" />
              <div className="hp-stat">
                <strong>Google Sheets</strong>
                <span>Your data, your control</span>
              </div>
            </div>
          </div>
          <div className="hp-hero__right">
            <MockDashboard />
          </div>
        </div>

        {/* Portal cards inside the banner */}
        <div className="hp-hero__portals">
          <p className="hp-hero__portals-label">Choose your portal and jump straight in</p>
          <div className="hp-hero__portals-grid">
            {portals.map((p) => (
              <Link
                key={p.to}
                to={p.to}
                className="hp-portal-card"
                style={{ '--pa': p.accent }}
              >
                <div className="hp-portal-card__icon" style={{ background: `${p.accent}22`, color: p.accent }}>
                  {p.icon}
                </div>
                <div className="hp-portal-card__body">
                  <strong>{p.title}</strong>
                  <span>{p.desc}</span>
                </div>
                <svg className="hp-portal-card__arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature highlights ── */}
      <section className="hp-highlights">
        <div className="hp-highlights__inner">
          <div className="hp-highlights__head">
            <span className="hp-eyebrow hp-eyebrow--dark">Why DeskFlow</span>
            <h2>Built for teams that actually get things done</h2>
            <p>No bloated features. No complex setup. Just clean workflows that help IT teams stay on top of every request.</p>
          </div>
          <div className="hp-highlights__grid">
            {highlights.map((h) => (
              <div key={h.title} className="hp-hl-card">
                <div className="hp-hl-card__icon">{h.icon}</div>
                <h3>{h.title}</h3>
                <p>{h.desc}</p>
              </div>
            ))}
          </div>
          <div className="hp-highlights__cta">
            <Link to="/features" className="btn btn--primary">View all features</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
