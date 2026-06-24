import { getPool } from '../lib/db.js'
import { rowToApi, sendJson, sendError } from '../lib/rows.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', 405)
  }

  try {
    const pool = getPool()
    const [rows] = await pool.query('SELECT * FROM employees ORDER BY id ASC')
    sendJson(res, rows.map(rowToApi))
  } catch (err) {
    sendError(res, err.message || 'Server error', 500)
  }
}
