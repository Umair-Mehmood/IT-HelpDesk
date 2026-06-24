import { getPool } from '../lib/db.js'
import { rowToApi, sendJson, sendError, readBody } from '../lib/rows.js'

async function fetchTicketById(pool, id) {
  const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id])
  return rows[0] ? rowToApi(rows[0]) : null
}

export default async function handler(req, res) {
  try {
    const pool = getPool()

    if (req.method === 'GET') {
      const [rows] = await pool.query('SELECT * FROM tickets ORDER BY id ASC')
      return sendJson(res, rows.map(rowToApi))
    }

    if (req.method === 'POST') {
      const body = await readBody(req)
      const required = [
        'ticketId', 'employeeId', 'employeeName', 'title', 'category',
        'priority', 'status', 'agentId', 'agentName', 'createdAt', 'updatedAt',
      ]
      for (const field of required) {
        if (!(field in body)) {
          return sendError(res, `Missing field: ${field}`)
        }
      }

      const [result] = await pool.execute(
        `INSERT INTO tickets (
          ticketId, employeeId, employeeName, title, description, category, priority, status,
          agentId, agentName, createdAt, updatedAt, resolvedAt, resolutionNote, internalNote
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          body.ticketId,
          body.employeeId,
          body.employeeName,
          body.title,
          body.description ?? '',
          body.category,
          body.priority,
          body.status,
          body.agentId,
          body.agentName,
          Number(body.createdAt),
          Number(body.updatedAt),
          body.resolvedAt === '' || body.resolvedAt == null ? null : Number(body.resolvedAt),
          body.resolutionNote ?? '',
          body.internalNote ?? '',
        ]
      )

      const created = await fetchTicketById(pool, result.insertId)
      return sendJson(res, created, 201)
    }

    return sendError(res, 'Method not allowed', 405)
  } catch (err) {
    sendError(res, err.message || 'Server error', 500)
  }
}
