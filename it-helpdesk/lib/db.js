import mysql from 'mysql2/promise'

let pool

export function getPool() {
  if (!pool) {
    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env
    if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
      throw new Error('Missing database environment variables')
    }
    pool = mysql.createPool({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      port: Number(DB_PORT || 3306),
      waitForConnections: true,
      connectionLimit: 4,
    })
  }
  return pool
}
