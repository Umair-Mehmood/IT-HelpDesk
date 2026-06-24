const API_BASE = import.meta.env.VITE_API_BASE || '/api'

export const ENDPOINTS = {
  tickets: `${API_BASE}/tickets`,
  employees: `${API_BASE}/employees`,
  agents: `${API_BASE}/agents`,
  slaRules: `${API_BASE}/slaRules`,
}

export const ADMIN_PASSCODE = 'ADMIN2024'

export const CATEGORIES = ['Hardware', 'Software', 'Network', 'Access']
export const PRIORITIES = ['Low', 'Medium', 'High', 'Critical']
export const STATUSES = ['Open', 'In Progress', 'Resolved']
