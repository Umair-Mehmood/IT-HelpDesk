import { Link } from 'react-router-dom'
import { ADMIN_PASSCODE } from '../config'

const sections = [
  {
    title: 'Employee',
    to: '/employee',
    color: '#2563eb',
    whatToEnter: 'Employee ID',
    example: 'e.g. ID EMP-002',
    steps: [
      'Go to Home and click the Employee card.',
      'Enter your Employee ID in the input field.',
      'Click Continue to open your dashboard.',
      'From your dashboard you can view all your tickets and submit new ones with New Ticket.',
    ],
  },
  {
    title: 'Agent',
    to: '/agent',
    color: '#059669',
    whatToEnter: 'Agent ID',
    example: 'e.g. AGT-001, AGT-002, AGT-003',
    steps: [
      'Go to Home and click the Agent card.',
      'Enter your Agent ID in the input field.',
      'Click Continue to see tickets assigned to you.',
      'Update status, add resolution notes, and mark tickets as Resolved when done.',
    ],
  },
  {
    title: 'Admin',
    to: '/admin',
    color: '#7c3aed',
    whatToEnter: 'Passcode',
    example: ADMIN_PASSCODE,
    steps: [
      'Go to Home and click the Admin card.',
      'Enter the admin passcode.',
      'Click Enter to open the full admin dashboard.',
      'View summary cards (Open, In Progress, Resolved Today, SLA Breached), filter tickets, reassign or change priority, and see agent workload stats.',
    ],
  },
]

export default function HowToUsePage() {
  return (
    <div className="about-page how-to-use-page">
      <div className="about-hero">
        <h1>How to Use</h1>
        <p className="about-tagline">Access the app as an Employee, Agent, or Admin.</p>
      </div>

      {sections.map((s) => (
        <section key={s.title} className="about-section">
          <h2>{s.title}</h2>
          <div className="about-card how-to-use-card" style={{ '--role-accent': s.color }}>
            <div className="how-to-use-entry">
              <span className="how-to-use-label">What to enter:</span>
              <strong>{s.whatToEnter}</strong>
              <span className="how-to-use-example">{s.example}</span>
            </div>
            <ol className="how-to-use-steps">
              {s.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <Link to={s.to} className="role-link">Go to {s.title} portal →</Link>
          </div>
        </section>
      ))}

      <div className="about-cta">
        <Link to="/" className="cta-button">Back to Home</Link>
      </div>
    </div>
  )
}
