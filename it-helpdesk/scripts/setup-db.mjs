import mysql from 'mysql2/promise'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    const key = trimmed.slice(0, i).trim()
    const value = trimmed.slice(i + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

const config = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
}

if (!config.host || !config.user || !config.password || !config.database) {
  console.error('Missing DB credentials. Copy .env.example to .env and fill in DB_HOST, DB_USER, DB_PASSWORD, DB_NAME.')
  process.exit(1)
}

function excelSerial(daysAgo = 0, hoursOffset = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(d.getHours() - hoursOffset)
  return 25569 + d.getTime() / (86400 * 1000)
}

const schema = `
CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL
);

CREATE TABLE IF NOT EXISTS agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agentId VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  specialization VARCHAR(64) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS sla_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  priority VARCHAR(32) NOT NULL UNIQUE,
  resolutionHours INT NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticketId VARCHAR(32) NOT NULL UNIQUE,
  employeeId VARCHAR(32) NOT NULL,
  employeeName VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(64) NOT NULL,
  priority VARCHAR(32) NOT NULL DEFAULT 'Medium',
  status VARCHAR(32) NOT NULL DEFAULT 'Open',
  agentId VARCHAR(32) DEFAULT NULL,
  agentName VARCHAR(120) DEFAULT NULL,
  createdAt DOUBLE NOT NULL,
  updatedAt DOUBLE NOT NULL,
  resolvedAt DOUBLE DEFAULT NULL,
  resolutionNote TEXT,
  internalNote TEXT,
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_agent (agentId),
  INDEX idx_tickets_employee (employeeId)
);
`

async function main() {
  const conn = await mysql.createConnection(config)
  console.log('Connected to MySQL')

  for (const stmt of schema.split(';').map((s) => s.trim()).filter(Boolean)) {
    await conn.execute(stmt)
  }
  console.log('Tables created')

  await conn.execute('DELETE FROM tickets')
  await conn.execute('DELETE FROM employees')
  await conn.execute('DELETE FROM agents')
  await conn.execute('DELETE FROM sla_rules')
  console.log('Cleared existing rows')

  await conn.execute(
    'INSERT INTO employees (employeeId, name) VALUES ?',
    [[
      ['EMP-001', 'Sarah Chen'],
      ['EMP-002', 'James Wilson'],
      ['EMP-003', 'Priya Patel'],
      ['EMP-004', 'Marcus Johnson'],
      ['EMP-005', 'Emily Rodriguez'],
      ['EMP-006', 'David Kim'],
      ['EMP-007', 'Lisa Thompson'],
      ['EMP-008', 'Alex Morgan'],
    ]]
  )

  await conn.execute(
    'INSERT INTO agents (agentId, name, specialization) VALUES ?',
    [[
      ['AGT-001', 'Mike Torres', 'Hardware'],
      ['AGT-002', 'Anna Becker', 'Software'],
      ['AGT-003', 'Chris Okafor', 'Network'],
      ['AGT-004', 'Rachel Green', 'Access'],
    ]]
  )

  await conn.execute(
    'INSERT INTO sla_rules (priority, resolutionHours) VALUES ?',
    [[
      ['Low', 72],
      ['Medium', 48],
      ['High', 24],
      ['Critical', 4],
    ]]
  )

  const tickets = [
    ['TKT-001', 'EMP-001', 'Sarah Chen', 'Laptop not charging', 'Dell laptop battery shows plugged in but not charging. Tried different outlet.', 'Hardware', 'High', 'Open', 'AGT-001', 'Mike Torres', excelSerial(2, 3), excelSerial(2, 3), null, '', ''],
    ['TKT-002', 'EMP-002', 'James Wilson', 'Cannot access shared drive', 'Getting permission denied on \\\\fileserver\\marketing folder since this morning.', 'Access', 'Medium', 'In Progress', 'AGT-004', 'Rachel Green', excelSerial(1, 5), excelSerial(0, 2), null, '', 'Checking AD group membership'],
    ['TKT-003', 'EMP-003', 'Priya Patel', 'Outlook keeps crashing', 'Outlook closes immediately after opening. Reinstalled once, same issue.', 'Software', 'High', 'Open', 'AGT-002', 'Anna Becker', excelSerial(0, 8), excelSerial(0, 8), null, '', ''],
    ['TKT-004', 'EMP-004', 'Marcus Johnson', 'VPN disconnects every 10 minutes', 'Remote VPN drops connection repeatedly on home WiFi.', 'Network', 'Critical', 'In Progress', 'AGT-003', 'Chris Okafor', excelSerial(0, 4), excelSerial(0, 1), null, '', 'Suspect ISP MTU issue'],
    ['TKT-005', 'EMP-005', 'Emily Rodriguez', 'New monitor flickering', 'Second monitor flickers when moving windows between screens.', 'Hardware', 'Low', 'Resolved', 'AGT-001', 'Mike Torres', excelSerial(5, 0), excelSerial(4, 2), excelSerial(4, 2), 'Replaced HDMI cable and updated GPU drivers.', ''],
    ['TKT-006', 'EMP-006', 'David Kim', 'Need Adobe license', 'Requesting Adobe Creative Cloud license for design work.', 'Software', 'Medium', 'Open', 'AGT-002', 'Anna Becker', excelSerial(3, 0), excelSerial(3, 0), null, '', ''],
    ['TKT-007', 'EMP-007', 'Lisa Thompson', 'Printer offline', 'Floor 3 printer shows offline for all users.', 'Hardware', 'Medium', 'Resolved', 'AGT-001', 'Mike Torres', excelSerial(6, 0), excelSerial(5, 4), excelSerial(5, 4), 'Restarted print spooler and cleared stuck queue.', ''],
    ['TKT-008', 'EMP-008', 'Alex Morgan', 'Slack notifications not working', 'Desktop Slack app not showing notifications on Windows 11.', 'Software', 'Low', 'Open', 'AGT-002', 'Anna Becker', excelSerial(1, 0), excelSerial(1, 0), null, '', ''],
    ['TKT-009', 'EMP-001', 'Sarah Chen', 'WiFi slow in conference room B', 'WiFi speed drops below 5 Mbps during meetings in room B.', 'Network', 'High', 'In Progress', 'AGT-003', 'Chris Okafor', excelSerial(2, 0), excelSerial(1, 0), null, '', 'AP signal survey scheduled'],
    ['TKT-010', 'EMP-003', 'Priya Patel', 'Password reset needed', 'Locked out of account after too many failed login attempts.', 'Access', 'Critical', 'Resolved', 'AGT-004', 'Rachel Green', excelSerial(0, 6), excelSerial(0, 5), excelSerial(0, 5), 'Reset password and enabled MFA.', ''],
    ['TKT-011', 'EMP-002', 'James Wilson', 'Teams audio not working', 'Microphone not detected in Microsoft Teams calls.', 'Software', 'Medium', 'Open', 'AGT-002', 'Anna Becker', excelSerial(4, 0), excelSerial(4, 0), null, '', ''],
    ['TKT-012', 'EMP-005', 'Emily Rodriguez', 'Keyboard keys sticking', 'Several keys on laptop keyboard stick or repeat characters.', 'Hardware', 'Low', 'In Progress', 'AGT-001', 'Mike Torres', excelSerial(3, 2), excelSerial(2, 0), null, '', 'Ordering replacement keyboard'],
    ['TKT-013', 'EMP-004', 'Marcus Johnson', 'Email rules not syncing', 'Outlook rules created on web do not appear on desktop client.', 'Software', 'Medium', 'Resolved', 'AGT-002', 'Anna Becker', excelSerial(7, 0), excelSerial(6, 3), excelSerial(6, 3), 'Forced OST rebuild and re-synced rules.', ''],
    ['TKT-014', 'EMP-006', 'David Kim', 'Guest WiFi access request', 'Need temporary guest WiFi credentials for vendor visit Friday.', 'Network', 'Low', 'Open', 'AGT-003', 'Chris Okafor', excelSerial(0, 2), excelSerial(0, 2), null, '', ''],
    ['TKT-015', 'EMP-007', 'Lisa Thompson', 'SharePoint upload failing', 'Cannot upload files larger than 50MB to project site.', 'Access', 'High', 'Open', 'AGT-004', 'Rachel Green', excelSerial(1, 3), excelSerial(1, 3), null, '', ''],
    ['TKT-016', 'EMP-008', 'Alex Morgan', 'Blue screen after Windows update', 'BSOD with stop code MEMORY_MANAGEMENT after KB update.', 'Software', 'Critical', 'In Progress', 'AGT-002', 'Anna Becker', excelSerial(0, 3), excelSerial(0, 1), null, '', 'Rolling back update'],
    ['TKT-017', 'EMP-001', 'Sarah Chen', 'Docking station USB ports dead', 'USB ports on Dell dock stopped working after power outage.', 'Hardware', 'Medium', 'Resolved', 'AGT-001', 'Mike Torres', excelSerial(10, 0), excelSerial(9, 2), excelSerial(9, 2), 'Replaced docking station under warranty.', ''],
    ['TKT-018', 'EMP-003', 'Priya Patel', 'Cannot connect to database VPN', 'Need access to staging DB via VPN for QA testing.', 'Access', 'High', 'Open', 'AGT-004', 'Rachel Green', excelSerial(2, 1), excelSerial(2, 1), null, '', ''],
  ]

  await conn.execute(
    `INSERT INTO tickets (
      ticketId, employeeId, employeeName, title, description, category, priority, status,
      agentId, agentName, createdAt, updatedAt, resolvedAt, resolutionNote, internalNote
    ) VALUES ?`,
    [tickets]
  )

  const [[{ empCount }]] = await conn.query('SELECT COUNT(*) AS empCount FROM employees')
  const [[{ agtCount }]] = await conn.query('SELECT COUNT(*) AS agtCount FROM agents')
  const [[{ slaCount }]] = await conn.query('SELECT COUNT(*) AS slaCount FROM sla_rules')
  const [[{ tktCount }]] = await conn.query('SELECT COUNT(*) AS tktCount FROM tickets')

  console.log(`Seeded: ${empCount} employees, ${agtCount} agents, ${slaCount} SLA rules, ${tktCount} tickets`)
  await conn.end()
}

main().catch((err) => {
  console.error('Setup failed:', err.message)
  process.exit(1)
})
