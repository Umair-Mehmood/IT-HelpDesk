import { ENDPOINTS } from '../config'
import { nowExcelSerial } from '../utils/dateUtils'

async function get(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  const json = await res.json()
  return json.data ?? json
}

export async function getTickets() {
  return get(ENDPOINTS.tickets)
}

export async function getEmployees() {
  return get(ENDPOINTS.employees)
}

export async function getAgents() {
  return get(ENDPOINTS.agents)
}

export async function getSlaRules() {
  return get(ENDPOINTS.slaRules)
}

/** Hours to resolve by priority (Critical not in sheet = 4h) */
export function getResolutionHours(slaRules, priority) {
  const rule = (slaRules || []).find((r) => (r.priority || '').toLowerCase() === (priority || '').toLowerCase())
  if (rule && rule.resolutionHours != null) return Number(rule.resolutionHours)
  if ((priority || '').toLowerCase() === 'critical') return 4
  return 24
}

/** Pick agent by category (specialization) and then by lowest active count */
export function pickAgentForTicket(tickets, agents, category) {
  const openOrInProgress = (t) => t.status === 'Open' || t.status === 'In Progress'
  const byAgent = {}
  agents.forEach((a) => { byAgent[a.agentId] = { ...a, count: 0 } })
  tickets.filter(openOrInProgress).forEach((t) => {
    if (byAgent[t.agentId]) byAgent[t.agentId].count += 1
  })
  const withCount = Object.values(byAgent)
  const matchSpecialization = withCount.filter((a) =>
    a.specialization && a.specialization.toLowerCase() === (category || '').toLowerCase()
  )
  const pool = matchSpecialization.length > 0 ? matchSpecialization : withCount
  pool.sort((a, b) => a.count - b.count)
  return pool[0] ? { agentId: pool[0].agentId, agentName: pool[0].name } : null
}

/** Generate next ticket ID (e.g. TKT-021) from existing tickets */
export function nextTicketId(tickets) {
  const nums = tickets
    .map((t) => (t.ticketId && t.ticketId.replace(/^TKT-0*/, '')) || '0')
    .map((n) => parseInt(n, 10))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `TKT-${String(max + 1).padStart(3, '0')}`
}

/** Create ticket: POST to Sheet Ninja. Assigns agent from category + workload. */
export async function createTicket(payload, tickets, agents) {
  const now = nowExcelSerial()
  const ticketId = nextTicketId(tickets)
  const assigned = pickAgentForTicket(tickets, agents, payload.category)
  const body = {
    ticketId,
    employeeId: payload.employeeId,
    employeeName: payload.employeeName,
    title: payload.title,
    description: payload.description || '',
    category: payload.category,
    priority: payload.priority || 'Medium',
    status: 'Open',
    agentId: assigned?.agentId || (agents[0]?.agentId ?? ''),
    agentName: assigned?.agentName || (agents[0]?.name ?? ''),
    createdAt: now,
    updatedAt: now,
    resolvedAt: '',
    resolutionNote: '',
    internalNote: '',
  }
  const res = await fetch(ENDPOINTS.tickets, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Create failed: ${res.status}`)
  }
  return res.json()
}

/** Update ticket: PATCH by row id */
export async function updateTicket(rowId, updates) {
  const url = `${ENDPOINTS.tickets}/${rowId}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Update failed: ${res.status}`)
  }
  return res.json()
}
