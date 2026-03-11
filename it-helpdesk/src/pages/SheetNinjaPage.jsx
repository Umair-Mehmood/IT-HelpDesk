import { Link } from 'react-router-dom'
import { CATEGORIES, PRIORITIES, STATUSES } from '../config'

const tables = [
  {
    name: 'tickets',
    description: 'Stores all support tickets: request details, assignment, status, and resolution.',
    columns: [
      { name: 'id', type: 'number', description: 'Sheet Ninja row ID; used for PATCH/update operations.' },
      { name: 'ticketId', type: 'string', description: 'Human-readable ID (e.g. TKT-001). Auto-generated on create.' },
      { name: 'employeeId', type: 'string', description: 'ID of the employee who submitted the ticket.' },
      { name: 'employeeName', type: 'string', description: 'Display name of the employee.' },
      { name: 'title', type: 'string', description: 'Short summary of the issue.' },
      { name: 'description', type: 'string', description: 'Detailed description of the request.' },
      { name: 'category', type: 'string', description: `One of: ${CATEGORIES.join(', ')}.` },
      { name: 'priority', type: 'string', description: `One of: ${PRIORITIES.join(', ')}. Drives SLA.` },
      { name: 'status', type: 'string', description: `One of: ${STATUSES.join(', ')}.` },
      { name: 'agentId', type: 'string', description: 'ID of the agent assigned to this ticket.' },
      { name: 'agentName', type: 'string', description: 'Display name of the assigned agent.' },
      { name: 'createdAt', type: 'number', description: 'Excel serial date/time when the ticket was created.' },
      { name: 'updatedAt', type: 'number', description: 'Excel serial date/time of last update.' },
      { name: 'resolvedAt', type: 'number', description: 'Excel serial date/time when status was set to Resolved; empty if open.' },
      { name: 'resolutionNote', type: 'string', description: 'Note visible to the employee describing the resolution.' },
      { name: 'internalNote', type: 'string', description: 'Internal note for agents/admins only.' },
    ],
  },
  {
    name: 'employees',
    description: 'Registry of employees who can log in and submit tickets (optional; tickets can reference unknown IDs).',
    columns: [
      { name: 'id', type: 'number', description: 'Sheet Ninja row ID.' },
      { name: 'employeeId', type: 'string', description: 'Unique employee identifier (e.g. EMP-001). Used to log in.' },
      { name: 'name', type: 'string', description: 'Display name of the employee.' },
    ],
  },
  {
    name: 'agents',
    description: 'IT support agents who can be assigned tickets. Workload and specialization drive auto-assignment.',
    columns: [
      { name: 'id', type: 'number', description: 'Sheet Ninja row ID.' },
      { name: 'agentId', type: 'string', description: 'Unique agent identifier. Used to log in and assign tickets.' },
      { name: 'name', type: 'string', description: 'Display name of the agent.' },
      { name: 'specialization', type: 'string', description: `Optional category (e.g. ${CATEGORIES.join(', ')}) for preferred ticket assignment.` },
    ],
  },
  {
    name: 'slaRules',
    description: 'SLA resolution time (in hours) per priority. Used for breach calculation and reporting.',
    columns: [
      { name: 'id', type: 'number', description: 'Sheet Ninja row ID.' },
      { name: 'priority', type: 'string', description: `One of: ${PRIORITIES.join(', ')}.` },
      { name: 'resolutionHours', type: 'number', description: 'Target hours to resolve tickets of this priority. Critical defaults to 4 if missing.' },
    ],
  },
]

export default function SheetNinjaPage() {
  return (
    <div className="about-page sheet-ninja-page">
      <div className="about-hero">
        <h1>Data Dictionary</h1>
        <p className="about-tagline">Column definitions for the Google Sheets tables that power this app via Sheet Ninja API.</p>
      </div>

      {tables.map((table) => (
        <section key={table.name} className="about-section">
          <h2>{table.name}</h2>
          <p className="about-section-desc">{table.description}</p>
          <div className="about-card">
            <h3 className="dict-title">Data dictionary</h3>
            <div className="table-dict-wrap">
              <table className="dict-table">
                <thead>
                  <tr>
                    <th>Column</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {table.columns.map((col) => (
                    <tr key={col.name}>
                      <td><code>{col.name}</code></td>
                      <td><span className="dict-type">{col.type}</span></td>
                      <td>{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ))}

      <div className="about-cta">
        <Link to="/" className="cta-button">Back to Home</Link>
      </div>
    </div>
  )
}
