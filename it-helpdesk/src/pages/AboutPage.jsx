import { Link } from 'react-router-dom'

const roles = [
  {
    title: 'Employee',
    desc: 'Staff who need IT support. They enter their ID, view their own tickets, and submit new requests (Hardware, Software, Network, Access) with priority levels.',
    to: '/employee',
    color: '#2563eb',
  },
  {
    title: 'Agent',
    desc: 'IT support agents who manage and resolve tickets. They see assigned tickets, update status (Open → In Progress → Resolved), and work within SLA targets.',
    to: '/agent',
    color: '#059669',
  },
  {
    title: 'Admin',
    desc: 'Administrators with full visibility. They view all tickets, filter by status/priority, see agent workload, and access the system via passcode.',
    to: '/admin',
    color: '#7c3aed',
  },
]

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>Problem & Solution</h1>
        <p className="about-tagline">The challenge we address and how the platform solves it.</p>
      </div>

      <section className="about-section">
        <h2>Problem Statement</h2>
        <div className="about-card problem-card">
          <p>
            Organizations often struggle to track IT support requests in a single, transparent system. 
            Tickets get lost in email, spreadsheets are hard to share, and there’s no clear view of who 
            is handling what or whether SLAs are being met.
          </p>
          <p>
            This platform solves that by providing a <strong>centralized helpdesk</strong> where employees 
            submit tickets, agents manage and resolve them, and admins oversee workload and performance — 
            all backed by a simple spreadsheet (Google Sheets) via Sheet Ninja, so no complex backend is required.
          </p>
        </div>
      </section>

      <section className="about-section">
        <h2>User Roles</h2>
        <p className="about-section-desc">Three roles work together to handle support from request to resolution.</p>
        <div className="roles-grid">
          {roles.map((r) => (
            <div key={r.title} className="role-card" style={{ '--role-accent': r.color }}>
              <div className="role-card-header">
                <span className="role-dot" />
                <h3>{r.title}</h3>
              </div>
              <p>{r.desc}</p>
              <Link to={r.to} className="role-link">Go to {r.title} portal →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="about-section">
        <h2>Workflow Diagram</h2>
        <p className="about-section-desc">How a ticket moves from request to resolution.</p>
        <div className="workflow-diagram">
          <svg viewBox="0 0 720 320" className="workflow-svg" aria-label="Ticket workflow diagram">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
              </marker>
              <filter id="cardShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
              </filter>
            </defs>
            {/* Employee */}
            <g filter="url(#cardShadow)">
              <rect x="20" y="120" width="120" height="80" rx="10" fill="#eff6ff" stroke="#2563eb" strokeWidth="2" />
              <text x="80" y="158" textAnchor="middle" fill="#1e40af" fontWeight="600" fontSize="14">Employee</text>
              <text x="80" y="178" textAnchor="middle" fill="#64748b" fontSize="11">Enter ID</text>
            </g>
            <path d="M 140 160 L 195 160" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="4 3" />
            <text x="167" y="152" textAnchor="middle" fill="#64748b" fontSize="10">Submit</text>

            {/* New ticket / Open */}
            <g filter="url(#cardShadow)">
              <rect x="200" y="120" width="120" height="80" rx="10" fill="#fef3c7" stroke="#d97706" strokeWidth="2" />
              <text x="260" y="158" textAnchor="middle" fill="#92400e" fontWeight="600" fontSize="14">New Ticket</text>
              <text x="260" y="178" textAnchor="middle" fill="#64748b" fontSize="11">Open</text>
            </g>
            <path d="M 320 160 L 375 160" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="4 3" />
            <text x="347" y="152" textAnchor="middle" fill="#64748b" fontSize="10">Assign</text>

            {/* Agent */}
            <g filter="url(#cardShadow)">
              <rect x="380" y="120" width="120" height="80" rx="10" fill="#ecfdf5" stroke="#059669" strokeWidth="2" />
              <text x="440" y="158" textAnchor="middle" fill="#047857" fontWeight="600" fontSize="14">Agent</text>
              <text x="440" y="178" textAnchor="middle" fill="#64748b" fontSize="11">In Progress</text>
            </g>
            <path d="M 500 160 L 555 160" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrowhead)" strokeDasharray="4 3" />
            <text x="527" y="152" textAnchor="middle" fill="#64748b" fontSize="10">Resolve</text>

            {/* Resolved */}
            <g filter="url(#cardShadow)">
              <rect x="560" y="120" width="120" height="80" rx="10" fill="#d1fae5" stroke="#047857" strokeWidth="2" />
              <text x="620" y="158" textAnchor="middle" fill="#065f46" fontWeight="600" fontSize="14">Resolved</text>
              <text x="620" y="178" textAnchor="middle" fill="#64748b" fontSize="11">Done</text>
            </g>

            {/* Admin oversight - spans top */}
            <g filter="url(#cardShadow)">
              <rect x="220" y="20" width="280" height="60" rx="10" fill="#f5f3ff" stroke="#7c3aed" strokeWidth="2" />
              <text x="360" y="45" textAnchor="middle" fill="#5b21b6" fontWeight="600" fontSize="14">Admin: view all tickets, assign agents, monitor SLA</text>
              <text x="360" y="62" textAnchor="middle" fill="#64748b" fontSize="11">Oversight across the entire workflow</text>
            </g>
            <path d="M 360 80 L 360 115" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.7" />
            <path d="M 260 80 L 260 115" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
            <path d="M 460 80 L 460 115" stroke="#7c3aed" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
          </svg>
        </div>
        <div className="workflow-legend">
          <span><strong>Employee</strong> submits a ticket → appears as <strong>Open</strong> → <strong>Agent</strong> picks it up and moves to <strong>In Progress</strong> → when fixed, marks <strong>Resolved</strong>. <strong>Admin</strong> can see and manage everything at any stage.</span>
        </div>
      </section>

      <div className="about-cta">
        <Link to="/" className="cta-button">Back to Home</Link>
      </div>
    </div>
  )
}
