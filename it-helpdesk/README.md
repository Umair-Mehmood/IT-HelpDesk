# IT Helpdesk Tracker

React app connected to Google Sheets via [Sheet Ninja](https://sheetninja.io). No login — Employee/Agent ID for access, single passcode for Admin.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview   # preview production build
```

## Portals

- **Employee** — Enter Employee ID (e.g. EMP-001). View ticket history and submit new tickets. New tickets are auto-assigned by category and agent workload.
- **Agent** — Enter Agent ID (e.g. AGT-001). View assigned tickets; update status, add resolution note and internal note.
- **Admin** — Passcode: `ADMIN2024`. Summary cards (Open, In Progress, Resolved Today, SLA Breached), filtered ticket table, reassign/escalate/reopen/close, agent workload and average resolution time.

## API

Data is read/written via Sheet Ninja REST API:

- Tickets: `.../itHelpDeskDatabase/tickets`
- Employees: `.../itHelpDeskDatabase/employees`
- Agents: `.../itHelpDeskDatabase/agents`
- SLA Rules: `.../itHelpDeskDatabase/slaRules`

Create ticket: `POST` to tickets. Update ticket: `PATCH` to `tickets/:id` (row id).
