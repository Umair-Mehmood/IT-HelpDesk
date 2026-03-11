import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getEmployees, getTickets } from '../api/sheetNinja'

function EmployeeIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

export default function EmployeeEnterId() {
  const [id, setId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    const raw = (id || '').trim().toUpperCase()
    if (!raw) {
      setError('Please enter your Employee ID')
      return
    }
    setError('')
    setLoading(true)
    try {
      const [employees, tickets] = await Promise.all([getEmployees(), getTickets()])
      const emp = employees.find((e) => (e.employeeId || '').toUpperCase() === raw)
      if (emp) {
        navigate('/employee/dashboard', { state: { employee: emp } })
        return
      }
      const fromTicket = (tickets || []).find((t) => (t.employeeId || '').toUpperCase() === raw)
      const name = fromTicket?.employeeName || raw
      navigate('/employee/dashboard', { state: { employeeId: raw, employeeName: name } })
    } catch (err) {
      setError(err.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="portal-page">
      <div className="portal-card">
        <Link to="/" className="portal-breadcrumb">← Back to Home</Link>
        <div className="portal-icon-wrap employee">
          <EmployeeIcon />
        </div>
        <h1 className="portal-title">Employee Portal</h1>
        <p className="portal-subtitle">Enter your Employee ID to view your tickets and submit new requests.</p>
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="emp-id">Employee ID</label>
          <input
            id="emp-id"
            type="text"
            placeholder="e.g. ID EMP-002"
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
