import { Link } from 'react-router-dom'

const portals = [
  { to: '/employee', title: 'Employee', desc: 'View your tickets and submit new requests' },
  { to: '/agent', title: 'Agent', desc: 'Manage and resolve assigned tickets' },
  { to: '/admin', title: 'Admin', desc: 'Full dashboard, filters, and agent workload' },
]

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '2rem', marginBottom: '0.5rem' }}>IT Help Desk Ticket Management System</h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2.5rem' }}>Choose your portal to continue</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {portals.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              style={{
                display: 'block',
                padding: '1.25rem 1.5rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
                color: '#fff',
                textDecoration: 'none',
                textAlign: 'left',
                transition: 'background 0.2s, border-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.14)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
              }}
            >
              <strong style={{ fontSize: '1.125rem' }}>{p.title}</strong>
              <div style={{ fontSize: '0.9rem', opacity: 0.85, marginTop: 0.25 }}>{p.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
