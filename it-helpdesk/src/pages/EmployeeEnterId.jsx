import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getEmployees, getTickets } from '../api/helpdeskApi'

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
      navigate('/employee/dashboard', { state: { employeeId: raw, employeeName: fromTicket?.employeeName || raw } })
    } catch (err) {
      setError(err.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-back">← Back to home</Link>
        <div className="auth-card__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" /></svg>
        </div>
        <h1>Employee sign in</h1>
        <p className="auth-card__sub">Enter your Employee ID to access your tickets and submit requests.</p>
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="emp-id">Employee ID</label>
          <input id="emp-id" type="text" placeholder="e.g. EMP-001" value={id} onChange={(e) => setId(e.target.value)} autoFocus disabled={loading} />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? 'Signing in…' : 'Continue'}</button>
        </form>
      </div>
    </div>
  )
}
