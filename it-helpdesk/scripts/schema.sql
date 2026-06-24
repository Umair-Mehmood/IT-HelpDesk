-- IT Help Desk schema + seed data
-- Import this file in Hostinger hPanel → phpMyAdmin → IT_Helpdesk → Import

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS agents;
DROP TABLE IF EXISTS sla_rules;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employeeId VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL
);

CREATE TABLE agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agentId VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  specialization VARCHAR(64) DEFAULT NULL
);

CREATE TABLE sla_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  priority VARCHAR(32) NOT NULL UNIQUE,
  resolutionHours INT NOT NULL
);

CREATE TABLE tickets (
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

INSERT INTO employees (employeeId, name) VALUES
('EMP-001', 'Sarah Chen'),
('EMP-002', 'James Wilson'),
('EMP-003', 'Priya Patel'),
('EMP-004', 'Marcus Johnson'),
('EMP-005', 'Emily Rodriguez'),
('EMP-006', 'David Kim'),
('EMP-007', 'Lisa Thompson'),
('EMP-008', 'Alex Morgan');

INSERT INTO agents (agentId, name, specialization) VALUES
('AGT-001', 'Mike Torres', 'Hardware'),
('AGT-002', 'Anna Becker', 'Software'),
('AGT-003', 'Chris Okafor', 'Network'),
('AGT-004', 'Rachel Green', 'Access');

INSERT INTO sla_rules (priority, resolutionHours) VALUES
('Low', 72),
('Medium', 48),
('High', 24),
('Critical', 4);

INSERT INTO tickets (
  ticketId, employeeId, employeeName, title, description, category, priority, status,
  agentId, agentName, createdAt, updatedAt, resolvedAt, resolutionNote, internalNote
) VALUES
('TKT-001', 'EMP-001', 'Sarah Chen', 'Laptop not charging', 'Dell laptop battery shows plugged in but not charging. Tried different outlet.', 'Hardware', 'High', 'Open', 'AGT-001', 'Mike Torres', 46082.625, 46082.625, NULL, '', ''),
('TKT-002', 'EMP-002', 'James Wilson', 'Cannot access shared drive', 'Getting permission denied on \\fileserver\\marketing folder since this morning.', 'Access', 'Medium', 'In Progress', 'AGT-004', 'Rachel Green', 46083.7917, 46084.9167, NULL, '', 'Checking AD group membership'),
('TKT-003', 'EMP-003', 'Priya Patel', 'Outlook keeps crashing', 'Outlook closes immediately after opening. Reinstalled once, same issue.', 'Software', 'High', 'Open', 'AGT-002', 'Anna Becker', 46085.3333, 46085.3333, NULL, '', ''),
('TKT-004', 'EMP-004', 'Marcus Johnson', 'VPN disconnects every 10 minutes', 'Remote VPN drops connection repeatedly on home WiFi.', 'Network', 'Critical', 'In Progress', 'AGT-003', 'Chris Okafor', 46085.8333, 46086.9583, NULL, '', 'Suspect ISP MTU issue'),
('TKT-005', 'EMP-005', 'Emily Rodriguez', 'New monitor flickering', 'Second monitor flickers when moving windows between screens.', 'Hardware', 'Low', 'Resolved', 'AGT-001', 'Mike Torres', 46079.0, 46080.0833, 46080.0833, 'Replaced HDMI cable and updated GPU drivers.', ''),
('TKT-006', 'EMP-006', 'David Kim', 'Need Adobe license', 'Requesting Adobe Creative Cloud license for design work.', 'Software', 'Medium', 'Open', 'AGT-002', 'Anna Becker', 46081.0, 46081.0, NULL, '', ''),
('TKT-007', 'EMP-007', 'Lisa Thompson', 'Printer offline', 'Floor 3 printer shows offline for all users.', 'Hardware', 'Medium', 'Resolved', 'AGT-001', 'Mike Torres', 46078.0, 46079.1667, 46079.1667, 'Restarted print spooler and cleared stuck queue.', ''),
('TKT-008', 'EMP-008', 'Alex Morgan', 'Slack notifications not working', 'Desktop Slack app not showing notifications on Windows 11.', 'Software', 'Low', 'Open', 'AGT-002', 'Anna Becker', 46083.0, 46083.0, NULL, '', ''),
('TKT-009', 'EMP-001', 'Sarah Chen', 'WiFi slow in conference room B', 'WiFi speed drops below 5 Mbps during meetings in room B.', 'Network', 'High', 'In Progress', 'AGT-003', 'Chris Okafor', 46082.0, 46083.0, NULL, '', 'AP signal survey scheduled'),
('TKT-010', 'EMP-003', 'Priya Patel', 'Password reset needed', 'Locked out of account after too many failed login attempts.', 'Access', 'Critical', 'Resolved', 'AGT-004', 'Rachel Green', 46085.75, 46085.7917, 46085.7917, 'Reset password and enabled MFA.', ''),
('TKT-011', 'EMP-002', 'James Wilson', 'Teams audio not working', 'Microphone not detected in Microsoft Teams calls.', 'Software', 'Medium', 'Open', 'AGT-002', 'Anna Becker', 46080.0, 46080.0, NULL, '', ''),
('TKT-012', 'EMP-005', 'Emily Rodriguez', 'Keyboard keys sticking', 'Several keys on laptop keyboard stick or repeat characters.', 'Hardware', 'Low', 'In Progress', 'AGT-001', 'Mike Torres', 46081.0833, 46082.0, NULL, '', 'Ordering replacement keyboard'),
('TKT-013', 'EMP-004', 'Marcus Johnson', 'Email rules not syncing', 'Outlook rules created on web do not appear on desktop client.', 'Software', 'Medium', 'Resolved', 'AGT-002', 'Anna Becker', 46077.0, 46078.125, 46078.125, 'Forced OST rebuild and re-synced rules.', ''),
('TKT-014', 'EMP-006', 'David Kim', 'Guest WiFi access request', 'Need temporary guest WiFi credentials for vendor visit Friday.', 'Network', 'Low', 'Open', 'AGT-003', 'Chris Okafor', 46085.9167, 46085.9167, NULL, '', ''),
('TKT-015', 'EMP-007', 'Lisa Thompson', 'SharePoint upload failing', 'Cannot upload files larger than 50MB to project site.', 'Access', 'High', 'Open', 'AGT-004', 'Rachel Green', 46083.875, 46083.875, NULL, '', ''),
('TKT-016', 'EMP-008', 'Alex Morgan', 'Blue screen after Windows update', 'BSOD with stop code MEMORY_MANAGEMENT after KB update.', 'Software', 'Critical', 'In Progress', 'AGT-002', 'Anna Becker', 46085.875, 46086.9583, NULL, '', 'Rolling back update'),
('TKT-017', 'EMP-001', 'Sarah Chen', 'Docking station USB ports dead', 'USB ports on Dell dock stopped working after power outage.', 'Hardware', 'Medium', 'Resolved', 'AGT-001', 'Mike Torres', 46074.0, 46075.0833, 46075.0833, 'Replaced docking station under warranty.', ''),
('TKT-018', 'EMP-003', 'Priya Patel', 'Cannot connect to database VPN', 'Need access to staging DB via VPN for QA testing.', 'Access', 'High', 'Open', 'AGT-004', 'Rachel Green', 46082.0417, 46082.0417, NULL, '', '');
