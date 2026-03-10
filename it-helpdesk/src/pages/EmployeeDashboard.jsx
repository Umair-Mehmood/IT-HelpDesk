import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getTickets, getAgents, createTicket } from '../api/sheetNinja'
import { formatDate } from '../utils/dateUtils'
import { CATEGORIES, PRIORITIES } from '../config'

export default function EmployeeDashboard() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const employee = state?.employee
  const employeeId = (state?.employeeId || employee?.employeeId || '').trim()
  const employeeName = (state?.employeeName || employee?.name || '').trim()

  const [tickets, setTickets] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [form, setForm] = useState({ title: '', description: '', category: 'Software', priority: 'Medium' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!employeeId) {
      navigate('/employee', { replace: true })
      return
    }
    let cancelled = false
    async function load() {
      try {
        const [t, a] = await Promise.all([getTickets(), getAgents()])
        if (cancelled) return
        setTickets(t || [])
        setAgents(a || [])
        setError('')
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [employeeId, navigate])

  const myTickets = (tickets || []).filter((t) => (t.employeeId || '').toUpperCase() === employeeId.toUpperCase()).sort((a, b) => (b.id || 0) - (a.id || 0))

  async function handleSubmitTicket(e) {
    e.preventDefault()
    if (!form.title?.trim()) return
    setSubmitting(true)
    setSubmitSuccess('')
    try {
      await createTicket(
        {
          employeeId,
          employeeName: employeeName || employeeId,
          title: form.title.trim(),
          description: (form.description || '').trim(),
          category: form.category,
          priority: form.priority,
        },
        tickets,
        agents
      )
      setSubmitSuccess('Ticket submitted. Refreshing list…')
      setForm({ title: '', description: '', category: 'Software', priority: 'Medium' })
      setShowForm(false)
      const [t] = await Promise.all([getTickets()])
      setTickets(t || [])
      setSubmitSuccess('Ticket submitted successfully.')
    } catch (err) {
      setSubmitSuccess('')
      setError(err.message || 'Failed to submit ticket')
    } finally {
      setSubmitting(false)
    }
  }

  if (!employeeId) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '1.5rem' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', fontSize: '0.9rem' }}>← Home</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0 }}>My Tickets</h1>
            <p style={{ color: 'var(--muted)', margin: '0.25rem 0 0' }}>{employeeName || employeeId}</p>
          </div>
          <button type="button" className="primary" onClick={() => setShowForm(true)}>New Ticket</button>
        </div>

        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}
        {submitSuccess && <p style={{ color: 'var(--success)', marginBottom: '1rem' }}>{submitSuccess}</p>}

        {showForm && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0 }}>Submit new ticket</h3>
            <form onSubmit={handleSubmitTicket}>
              <label className="label">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Brief summary"
                required
              />
              <label className="label" style={{ marginTop: '0.75rem' }}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Details..."
                rows={3}
              />
              <label className="label" style={{ marginTop: '0.75rem' }}>Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <label className="label" style={{ marginTop: '0.75rem' }}>Priority</label>
              <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit'}</button>
                <button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <p>Loading tickets…</p>
        ) : myTickets.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--muted)', margin: 0 }}>You have no tickets yet. Click “New Ticket” to create one.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myTickets.map((t) => (
              <div key={t.id || t.ticketId} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <strong>{t.ticketId}</strong> — {t.title}
                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: 0.25 }}>
                      {t.category} · {t.priority} · Assigned to {t.agentName || '—'}
                    </div>
                  </div>
                  <span className={`badge ${(t.status || '').toLowerCase().replace(/\s+/g, '-')}`}>{t.status}</span>
                </div>
                {t.description && <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0', color: '#4b5563' }}>{t.description}</p>}
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0.5rem 0 0' }}>
                  Created {formatDate(t.createdAt)}
                  {t.resolvedAt && ` · Resolved ${formatDate(t.resolvedAt)}`}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
