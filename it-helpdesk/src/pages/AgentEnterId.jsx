import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getAgents } from '../api/helpdeskApi'

import { saveAgentSession } from '../utils/sessionStorage'

export default function AgentEnterId() {
  const [id, setId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    const raw = (id || '').trim().toUpperCase()
    if (!raw) {
      setError('Please enter your Agent ID')
      return
    }
    setError('')
    setLoading(true)
    try {
      const agents = await getAgents()
      const agent = agents.find((a) => (a.agentId || '').toUpperCase() === raw)
      if (agent) {
        const session = { agent }
        saveAgentSession(session)
        navigate('/agent/dashboard', { state: session })
        return
      }
      setError('Agent ID not found. Try AGT-001, AGT-002, AGT-003, or AGT-004.')
    } catch (err) {
      setError(err.message || 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-back">← Back to home</Link>
        <div className="auth-card__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
        </div>
        <h1>Agent sign in</h1>
        <p className="auth-card__sub">Enter your Agent ID to access your assigned ticket queue.</p>
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="agent-id">Agent ID</label>
          <input id="agent-id" type="text" placeholder="e.g. AGT-001" value={id} onChange={(e) => setId(e.target.value)} autoFocus disabled={loading} />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? 'Signing in…' : 'Continue'}</button>
        </form>
      </div>
    </div>
  )
}
