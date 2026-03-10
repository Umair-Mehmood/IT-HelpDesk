import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEmployees, getTickets } from '../api/sheetNinja'
import { Link } from 'react-router-dom'

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
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', fontSize: '0.9rem' }}>← Home</Link>
        <h2 style={{ margin: '0 0 0.5rem' }}>Employee Portal</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Enter your Employee ID to view your tickets</p>
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="emp-id">Employee ID</label>
          <input
            id="emp-id"
            type="text"
            placeholder="e.g. EMP-001"
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
