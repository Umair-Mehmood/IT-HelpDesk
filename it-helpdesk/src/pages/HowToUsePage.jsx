import { Link } from 'react-router-dom'
import { ADMIN_PASSCODE } from '../config'

const sections = [
  {
    title: 'Employee',
    to: '/employee',
    whatToEnter: 'Employee ID',
    example: 'e.g. EMP-001',
    steps: [
      'From Home, select the Employee portal.',
      'Enter your Employee ID and continue.',
      'View tickets in the data table and click any row to open details.',
      'Use + New Ticket to submit a request and chat with your assigned agent.',
    ],
  },
  {
    title: 'Agent',
    to: '/agent',
    whatToEnter: 'Agent ID',
    example: 'e.g. AGT-001',
    steps: [
      'From Home, select the Agent portal.',
      'Enter your Agent ID to open your queue.',
      'Filter by status, search tickets, and open the slide-over drawer to update.',
      'Resolve tickets with a confirmation modal; employees are notified via the conversation thread.',
    ],
  },
  {
    title: 'Admin',
    to: '/admin',
    whatToEnter: 'Passcode',
    example: ADMIN_PASSCODE,
    steps: [
      'From Home, select the Admin portal.',
      'Enter the admin passcode to access Operations Overview.',
      'Monitor KPIs, SLA breaches, ticket volume chart, and agent workload.',
      'Reassign tickets, change priority, and bulk-select rows for review.',
    ],
  },
]

export default function HowToUsePage() {
  return (
    <div style={{ padding: '48px 32px', maxWidth: 800, margin: '0 auto' }}>
      <h1 style={{ color: '#fff', marginBottom: 8 }}>How to Use</h1>
      <p style={{ color: '#94A3B8', marginBottom: 32 }}>Access DeskFlow as an Employee, Agent, or Admin.</p>

      {sections.map((s) => (
        <div key={s.title} className="surface-card" style={{ marginBottom: 16 }}>
          <h4 className="section-label">{s.title}</h4>
          <p style={{ marginBottom: 12 }}>
            <strong>{s.whatToEnter}</strong>
            <span className="meta-text" style={{ marginLeft: 8 }}>{s.example}</span>
          </p>
          <ol style={{ margin: '0 0 16px 20px', padding: 0, lineHeight: 1.7, color: '#334155' }}>
            {s.steps.map((step, i) => <li key={i}>{step}</li>)}
          </ol>
          <Link to={s.to} className="btn btn--primary btn--sm">Open {s.title} portal</Link>
        </div>
      ))}
    </div>
  )
}
