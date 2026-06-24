const EMPLOYEE_SESSION_KEY = 'deskflow_employee_session'
const AGENT_SESSION_KEY = 'deskflow_agent_session'

export function saveEmployeeSession(data) {
  try {
    sessionStorage.setItem(EMPLOYEE_SESSION_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function loadEmployeeSession() {
  try {
    const raw = sessionStorage.getItem(EMPLOYEE_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearEmployeeSession() {
  try {
    sessionStorage.removeItem(EMPLOYEE_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

export function saveAgentSession(data) {
  try {
    sessionStorage.setItem(AGENT_SESSION_KEY, JSON.stringify(data))
  } catch {
    /* ignore */
  }
}

export function loadAgentSession() {
  try {
    const raw = sessionStorage.getItem(AGENT_SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearAgentSession() {
  try {
    sessionStorage.removeItem(AGENT_SESSION_KEY)
  } catch {
    /* ignore */
  }
}
