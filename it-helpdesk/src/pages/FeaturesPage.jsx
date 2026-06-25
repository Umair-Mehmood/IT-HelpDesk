import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>
      </svg>
    ),
    title: 'Smart Ticket Management',
    desc: 'Employees submit structured requests through a dedicated portal. Every ticket is automatically categorised, prioritised, and routed to the right agent — no manual triage required.',
    tags: ['Auto-routing', 'Categories', 'Priority tiers'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: 'Real-time SLA Monitoring',
    desc: 'Define SLA rules per priority level. DeskFlow tracks every open ticket against its deadline and surfaces breaches instantly — so nothing falls through the cracks.',
    tags: ['Breach alerts', 'Deadline tracking', 'Priority SLAs'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Multi-Portal Access',
    desc: 'Three purpose-built portals — Employee, Agent, and Admin — each tailored to the exact information and actions that role needs. No clutter, no confusion.',
    tags: ['Employee portal', 'Agent queue', 'Admin overview'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    title: 'Built-in Conversations',
    desc: 'Every ticket has a threaded message panel. Employees and agents communicate in context — no email chains, no lost history. Full conversation log, always attached to the ticket.',
    tags: ['Thread-per-ticket', 'Agent ↔ Employee', 'Persistent history'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    title: 'Agent Workload Dashboard',
    desc: 'Agents see only their own queue — filtered, sortable, and searchable. Clear workload metrics show active vs. resolved tickets, breach percentages, and average resolution time.',
    tags: ['Personal queue', 'Workload metrics', 'Avg. resolution time'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Operations Overview',
    desc: 'Admins get a full command centre — KPI cards, a 30-day ticket volume chart, SLA breach alerts, per-agent workload grid, and complete ticket management with bulk actions.',
    tags: ['KPI cards', '30-day chart', 'Bulk operations'],
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    title: 'Priority Classification',
    desc: 'Four-tier priority system — Low, Medium, High, Critical. Colour-coded badges throughout the UI ensure the most urgent tickets are impossible to miss.',
    tags: ['4-tier system', 'Colour badges', 'SLA-linked'],
  },
]

const portals = [
  { to: '/employee', label: 'Employee portal', desc: 'Submit tickets and track resolutions', color: '#3B82F6' },
  { to: '/agent', label: 'Agent portal',    desc: 'Manage your queue and resolve issues', color: '#8B5CF6' },
  { to: '/admin', label: 'Admin portal',    desc: 'Full operations overview and controls', color: '#0EA5E9' },
]

export default function FeaturesPage() {
  const gridRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fp-page">

      {/* Hero */}
      <section className="fp-hero">
        <div className="fp-hero__inner">
          <span className="fp-eyebrow">Platform capabilities</span>
          <h1>Everything your IT team needs</h1>
          <p>DeskFlow is built for real IT operations — not demos. Every feature exists because a real team needed it.</p>
          <div className="fp-hero__ctas">
            <Link to="/employee" className="btn btn--primary">Get started free</Link>
            <Link to="/" className="fp-link-back">← Back to home</Link>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="fp-grid-section" ref={gridRef}>
        <div className="fp-grid">
          {features.map((f) => (
            <div key={f.title} className="fp-card">
              <div className="fp-card__icon">{f.icon}</div>
              <h3 className="fp-card__title">{f.title}</h3>
              <p className="fp-card__desc">{f.desc}</p>
              <div className="fp-card__tags">
                {f.tags.map((t) => <span key={t} className="fp-tag">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Portal CTA strip */}
      <section className="fp-portals">
        <div className="fp-portals__inner">
          <h2>Ready to get started?</h2>
          <p>Choose your portal below and start managing tickets in minutes.</p>
          <div className="fp-portals__row">
            {portals.map((p) => (
              <Link key={p.to} to={p.to} className="fp-portal-card" style={{ '--pc': p.color }}>
                <strong>{p.label}</strong>
                <span>{p.desc}</span>
                <svg className="fp-portal-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
