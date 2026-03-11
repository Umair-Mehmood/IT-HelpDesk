import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getAgents } from '../api/sheetNinja'

function AgentIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  )
}

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
        navigate('/agent/dashboard', { state: { agent } })
        return
      }
      setError('Agent ID not found. Use e.g. AGT-001, AGT-002, AGT-003.')
    } catch (err) {
      setError(err.message || 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page">
      <div className="portal-card">
        <Link to="/" className="portal-breadcrumb">← Back to Home</Link>
        <div className="portal-icon-wrap agent">
          <AgentIcon />
        </div>
        <h1 className="portal-title">Agent Portal</h1>
        <p className="portal-subtitle">Enter your Agent ID to access your assigned tickets and update their status.</p>
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="agent-id">Agent ID</label>
          <input
            id="agent-id"
            type="text"
            placeholder="e.g. AGT-001"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoFocus
            disabled={loading}
          />
          {error && <p className="portal-error">{error}</p>}
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Loading…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
