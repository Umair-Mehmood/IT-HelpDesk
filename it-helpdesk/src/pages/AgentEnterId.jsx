import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAgents } from '../api/sheetNinja'
import { Link } from 'react-router-dom'

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
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', fontSize: '0.9rem' }}>← Home</Link>
        <h2 style={{ margin: '0 0 0.5rem' }}>Agent Portal</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Enter your Agent ID to manage your tickets</p>
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
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
          <button type="submit" className="primary" style={{ marginTop: '1rem', width: '100%' }} disabled={loading}>
            {loading ? 'Loading…' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
