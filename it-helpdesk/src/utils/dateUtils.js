/** Excel serial date to JS Date (UTC day, then treat as local for display) */
export function excelSerialToDate(serial) {
  if (serial == null || serial === '') return null
  const n = Number(serial)
  if (Number.isNaN(n)) return null
  // Excel epoch: Dec 30, 1899; 1 = Jan 1, 1900
  const utc = (n - 25569) * 86400 * 1000
  return new Date(utc)
}

export function formatDate(d) {
  if (!d) return '—'
  const date = d instanceof Date ? d : excelSerialToDate(d)
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function formatDateShort(date) {
  if (!date) return '—'
  const d = date instanceof Date ? date : excelSerialToDate(date)
  if (!d || isNaN(d.getTime())) return '—'
  return d.toLocaleDateString()
}

/** True if resolved date is today (local date) */
export function isResolvedToday(resolvedAt) {
  if (resolvedAt == null || resolvedAt === '') return false
  const d = excelSerialToDate(resolvedAt)
  if (!d || isNaN(d.getTime())) return false
  const today = new Date()
  return d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
}

/** Current time as Excel serial (for CreatedAt/UpdatedAt/ResolvedAt) */
export function nowExcelSerial() {
  const d = new Date()
  return 25569 + (d.getTime() / (86400 * 1000))
}
