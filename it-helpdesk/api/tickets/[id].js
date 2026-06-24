import { getPool } from '../../lib/db.js'
import { rowToApi, sendJson, sendError, readBody } from '../../lib/rows.js'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return sendError(res, 'Method not allowed', 405)
  }

  const id = Number(req.query.id)
  if (!id) {
    return sendError(res, 'Invalid ticket id')
  }

  try {
    const body = await readBody(req)
    if (!body || !Object.keys(body).length) {
      return sendError(res, 'No updates provided')
    }

    const allowed = new Set([
      'status', 'priority', 'agentId', 'agentName', 'updatedAt', 'resolvedAt',
      'resolutionNote', 'internalNote', 'title', 'description', 'category',
    ])

    const sets = []
    const values = []
    for (const [key, value] of Object.entries(body)) {
      if (!allowed.has(key)) continue
      sets.push(`\`${key}\` = ?`)
      if (['createdAt', 'updatedAt', 'resolvedAt'].includes(key)) {
        values.push(value === '' || value == null ? null : Number(value))
      } else {
        values.push(value)
      }
    }

    if (!sets.length) {
      return sendError(res, 'No valid updates provided')
    }

    values.push(id)
    const pool = getPool()
    await pool.execute(`UPDATE tickets SET ${sets.join(', ')} WHERE id = ?`, values)

    const [rows] = await pool.query('SELECT * FROM tickets WHERE id = ?', [id])
    if (!rows[0]) {
      return sendError(res, 'Not found', 404)
    }

    sendJson(res, rowToApi(rows[0]))
  } catch (err) {
    sendError(res, err.message || 'Server error', 500)
  }
}
