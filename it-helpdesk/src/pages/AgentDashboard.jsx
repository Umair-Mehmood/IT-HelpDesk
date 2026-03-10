import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { getTickets, getAgents, updateTicket } from '../api/sheetNinja'
import { formatDate, nowExcelSerial } from '../utils/dateUtils'
import { STATUSES, PRIORITIES } from '../config'

export default function AgentDashboard() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const agent = state?.agent

  const [tickets, setTickets] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ status: '', resolutionNote: '', internalNote: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!agent?.agentId) {
      navigate('/agent', { replace: true })
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
  }, [agent?.agentId, navigate])

  const myTickets = (tickets || []).filter((t) => (t.agentId || '').toUpperCase() === (agent?.agentId || '').toUpperCase())
  const openCount = myTickets.filter((t) => t.status === 'Open').length
  const inProgressCount = myTickets.filter((t) => t.status === 'In Progress').length
  const resolvedCount = myTickets.filter((t) => t.status === 'Resolved').length

  async function startEdit(t) {
    setEditingId(t.id)
    setEditForm({
      status: t.status || 'Open',
      resolutionNote: t.resolutionNote || '',
      internalNote: t.internalNote || '',
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    if (editingId == null) return
    setSaving(true)
    setError('')
    try {
      const updates = {
        status: editForm.status,
        updatedAt: nowExcelSerial(),
      }
      if (editForm.resolutionNote !== undefined) updates.resolutionNote = editForm.resolutionNote
      if (editForm.internalNote !== undefined) updates.internalNote = editForm.internalNote
      if (editForm.status === 'Resolved') {
        updates.resolvedAt = nowExcelSerial()
        if (editForm.resolutionNote !== undefined) updates.resolutionNote = editForm.resolutionNote
      } else {
        updates.resolvedAt = ''
        updates.resolutionNote = ''
      }
      await updateTicket(editingId, updates)
      const [t] = await Promise.all([getTickets()])
      setTickets(t || [])
      setEditingId(null)
    } catch (err) {
      setError(err.message || 'Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ status: '', resolutionNote: '', internalNote: '' })
  }

  if (!agent?.agentId) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '1.5rem' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', fontSize: '0.9rem' }}>← Home</Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0 }}>Agent Dashboard</h1>
            <p style={{ color: 'var(--muted)', margin: '0.25rem 0 0' }}>{agent.name} · {agent.specialization}</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <span className="card" style={{ padding: '0.5rem 0.75rem' }}>Open: {openCount}</span>
            <span className="card" style={{ padding: '0.5rem 0.75rem' }}>In Progress: {inProgressCount}</span>
            <span className="card" style={{ padding: '0.5rem 0.75rem' }}>Resolved: {resolvedCount}</span>
          </div>
        </div>

        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

        {loading ? (
          <p>Loading tickets…</p>
        ) : myTickets.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--muted)', margin: 0 }}>No tickets assigned to you.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {myTickets.map((t) => (
              <div key={t.id || t.ticketId} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <strong>{t.ticketId}</strong> — {t.title}
                    <div style={{ fontSize: '0.875rem', color: 'var(--muted)', marginTop: 0.25 }}>
                      {t.employeeName} · {t.category} · {t.priority}
                    </div>
                  </div>
                  <span className={`badge ${(t.status || '').toLowerCase().replace(/\s+/g, '-')}`}>{t.status}</span>
                </div>
                {t.description && <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0', color: '#4b5563' }}>{t.description}</p>}
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0.5rem 0 0' }}>
                  Created {formatDate(t.createdAt)}
                  {t.resolvedAt && ` · Resolved ${formatDate(t.resolvedAt)}`}
                </p>
                {t.resolutionNote && <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}><strong>Resolution:</strong> {t.resolutionNote}</p>}
                {t.internalNote && <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.25rem' }}><em>Internal:</em> {t.internalNote}</p>}

                {editingId === t.id ? (
                  <form onSubmit={handleSave} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <label className="label">Status</label>
                    <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {(editForm.status === 'Resolved') && (
                      <>
                        <label className="label" style={{ marginTop: '0.75rem' }}>Resolution note</label>
                        <textarea value={editForm.resolutionNote} onChange={(e) => setEditForm((f) => ({ ...f, resolutionNote: e.target.value }))} rows={2} />
                      </>
                    )}
                    <label className="label" style={{ marginTop: '0.75rem' }}>Internal note</label>
                    <textarea value={editForm.internalNote} onChange={(e) => setEditForm((f) => ({ ...f, internalNote: e.target.value }))} rows={2} />
                    <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                      <button type="submit" className="primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                      <button type="button" className="secondary" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <button type="button" className="secondary" style={{ marginTop: '0.75rem' }} onClick={() => startEdit(t)}>Update / Resolve</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
