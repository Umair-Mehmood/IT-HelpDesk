import { Link } from 'react-router-dom'

const mainPrompt = `IT Helpdesk Tracker is a React app connected to Google Sheets via Sheet Ninja.
Each table has its own API endpoint:
• Tickets
• Employees
• Agents
• SLA Rules

The Tickets table stores every support request with fields for TicketID, EmployeeID, EmployeeName, Title, Description, Category, Priority, Status, AgentID, AgentName, CreatedAt, UpdatedAt, ResolvedAt, ResolutionNote, and InternalNote.
The Employees table stores EmployeeID, Name, Department, and Email.
The Agents table stores AgentID, Name, Specialization, Email, and ActiveTickets.
The SLA Rules table stores Priority and ResolutionHours.
There are 3 portals — Employee, Agent, and Admin. Employees submit tickets, the system auto-assigns them to the right agent based on category and workload, agents update and resolve tickets, and the admin gets a full dashboard with filters, SLA breach alerts, and agent workload stats.
All data is read from and written to Google Sheets in real time via Sheet Ninja's REST API.`

const employeeFlow = `The employee lands on the homepage and clicks the Employee card. They are taken to the Employee portal where they see a simple input field asking for their Employee ID. They type their ID (e.g. EMP-001) and hit Enter. The app fetches their profile and ticket history and loads their personal dashboard. From here they can see all their past tickets and their current statuses. They can also click New Ticket to open a form, fill in the details, and submit. After submitting they see a confirmation message and the new ticket appears in their list.`

const agentFlow = `The agent lands on the homepage and clicks the IT Agent card. They are taken to the Agent portal where they enter their Agent ID (e.g. AGT-001) and hit Enter. The app loads all tickets assigned to them sorted by priority with Critical at the top. They can click any ticket to open the detail view, update the status, add an internal note, and if resolving they must write a resolution note before saving.`

const adminFlow = `The admin lands on the homepage and clicks the Admin card. They are taken to a passcode screen where they enter ADMIN2024 and hit Enter. The full admin dashboard loads showing summary cards at the top (Open, In Progress, Resolved Today, SLA Breached) and a full ticket table below with filters. The admin can reassign tickets, escalate priority, reopen or close any ticket. Below the ticket table is an agent workload section showing how many tickets each agent has and their average resolution time.`

const noLoginNote = `No login, no accounts, no passwords — just ID based access for employees and agents, and a single passcode for admin.`

export default function VibeCodePromptPage() {
  return (
    <div className="about-page vibe-code-page">
      <div className="about-hero">
        <h1>Vibe Code Prompt</h1>
        <p className="about-tagline">Prompts used to build and refine this application.</p>
      </div>

      <section className="about-section">
        <h2>Main app prompt</h2>
        <div className="about-card vibe-prompt-block">
          <pre className="vibe-pre">{mainPrompt}</pre>
        </div>
      </section>

      <section className="about-section">
        <h2>EMPLOYEE FLOW</h2>
        <div className="about-card vibe-prompt-block">
          <pre className="vibe-pre">{employeeFlow}</pre>
        </div>
      </section>

      <section className="about-section">
        <h2>AGENT FLOW</h2>
        <div className="about-card vibe-prompt-block">
          <pre className="vibe-pre">{agentFlow}</pre>
        </div>
      </section>

      <section className="about-section">
        <h2>ADMIN FLOW</h2>
        <div className="about-card vibe-prompt-block">
          <pre className="vibe-pre">{adminFlow}</pre>
        </div>
      </section>

      <section className="about-section">
        <h2>Access model</h2>
        <div className="about-card vibe-prompt-block">
          <p className="vibe-quote">{noLoginNote}</p>
        </div>
      </section>

      <div className="about-cta">
        <Link to="/" className="cta-button">Back to Home</Link>
      </div>
    </div>
  )
}
