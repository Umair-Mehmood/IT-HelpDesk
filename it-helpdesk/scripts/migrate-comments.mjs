import mysql from 'mysql2/promise'
import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { getPool } from '../lib/db.js'

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

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error('Missing DB credentials in .env')
  process.exit(1)
}

const schema = `
CREATE TABLE IF NOT EXISTS ticket_comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticketRowId INT NOT NULL,
  ticketId VARCHAR(32) NOT NULL,
  authorType ENUM('employee', 'agent') NOT NULL,
  authorId VARCHAR(32) NOT NULL,
  authorName VARCHAR(120) NOT NULL,
  message TEXT NOT NULL,
  createdAt DOUBLE NOT NULL,
  INDEX idx_comments_ticket (ticketRowId)
);
`

async function main() {
  const pool = getPool()
  for (const stmt of schema.split(';').map((s) => s.trim()).filter(Boolean)) {
    await pool.execute(stmt)
  }
  console.log('ticket_comments table ready')
  await pool.end()
}

main().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
