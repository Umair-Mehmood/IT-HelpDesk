import { Link } from 'react-router-dom'

const portals = [
  { to: '/employee', title: 'Employee', desc: 'Submit requests and track your tickets', icon: 'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z' },
  { to: '/agent', title: 'Agent', desc: 'Manage queue, resolve issues, collaborate', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { to: '/admin', title: 'Admin', desc: 'Operations overview, SLA monitoring, workload', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
]

export default function HomePage() {
  return (
    <div className="landing">
      <div className="landing__content">
        <p className="landing__eyebrow">Enterprise IT Service Management</p>
        <h1>IT support your team can rely on</h1>
        <p className="landing__desc">
          DeskFlow unifies ticket intake, agent workflows, and SLA tracking in one platform built for modern IT teams.
        </p>
        <div className="portal-grid">
          {portals.map((p) => (
            <Link key={p.to} to={p.to} className="portal-tile">
              <div className="portal-tile__icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d={p.icon} />
                </svg>
              </div>
              <div>
                <strong>{p.title}</strong>
                <span>{p.desc}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="landing__visual">
        <div className="landing__visual-overlay" />
        <img src="/assets/support-team.jpg" alt="Support team collaborating" />
      </div>
    </div>
  )
}
