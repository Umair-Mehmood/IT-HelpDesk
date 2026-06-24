export function rowToApi(row) {
  const out = {}
  for (const [key, value] of Object.entries(row)) {
    if (key === 'id') {
      out.id = Number(value)
      continue
    }
    if (['createdAt', 'updatedAt', 'resolvedAt'].includes(key)) {
      out[key] = value === null || value === '' ? '' : Number(value)
      continue
    }
    if (key === 'resolutionHours') {
      out[key] = Number(value)
      continue
    }
    out[key] = value ?? ''
  }
  return out
}

export function sendJson(res, data, status = 200) {
  res.status(status).json({ data })
}

export function sendError(res, message, status = 400) {
  res.status(status).json({ error: message })
}

export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  return {}
}
