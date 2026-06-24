import { getPool } from '../../../lib/db.js'
import { sendJson, sendError, readBody } from '../../../lib/rows.js'
import { nowExcelSerial } from '../../../lib/time.js'

function commentToApi(row) {
  return {
    id: Number(row.id),
    ticketRowId: Number(row.ticketRowId),
    ticketId: row.ticketId ?? '',
    authorType: row.authorType ?? '',
    authorId: row.authorId ?? '',
    authorName: row.authorName ?? '',
    message: row.message ?? '',
    createdAt: row.createdAt == null || row.createdAt === '' ? '' : Number(row.createdAt),
  }
}

export default async function handler(req, res) {
  const ticketRowId = Number(req.query.id)
  if (!ticketRowId) {
    return sendError(res, 'Invalid ticket id')
  }

  try {
    const pool = getPool()

    const [ticketRows] = await pool.query('SELECT id, ticketId FROM tickets WHERE id = ?', [ticketRowId])
    if (!ticketRows[0]) {
      return sendError(res, 'Ticket not found', 404)
    }
    const ticket = ticketRows[0]

    if (req.method === 'GET') {
      const [rows] = await pool.query(
        'SELECT * FROM ticket_comments WHERE ticketRowId = ? ORDER BY createdAt ASC, id ASC',
        [ticketRowId]
      )
      return sendJson(res, rows.map(commentToApi))
    }

    if (req.method === 'POST') {
      const body = await readBody(req)
      const { authorType, authorId, authorName, message } = body

      if (!authorType || !['employee', 'agent'].includes(authorType)) {
        return sendError(res, 'authorType must be employee or agent')
      }
      if (!authorId?.trim() || !authorName?.trim()) {
        return sendError(res, 'authorId and authorName are required')
      }
      if (!message?.trim()) {
        return sendError(res, 'message is required')
      }

      const createdAt = nowExcelSerial()
      const [result] = await pool.execute(
        `INSERT INTO ticket_comments (
          ticketRowId, ticketId, authorType, authorId, authorName, message, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          ticketRowId,
          ticket.ticketId,
          authorType,
          authorId.trim(),
          authorName.trim(),
          message.trim(),
          createdAt,
        ]
      )

      await pool.execute('UPDATE tickets SET updatedAt = ? WHERE id = ?', [createdAt, ticketRowId])

      const [rows] = await pool.query('SELECT * FROM ticket_comments WHERE id = ?', [result.insertId])
      return sendJson(res, commentToApi(rows[0]), 201)
    }

    return sendError(res, 'Method not allowed', 405)
  } catch (err) {
    sendError(res, err.message || 'Server error', 500)
  }
}
