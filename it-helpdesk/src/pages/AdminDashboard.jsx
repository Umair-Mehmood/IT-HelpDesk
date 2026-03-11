import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  getTickets,
  getEmployees,
  getAgents,
  getSlaRules,
  getResolutionHours,
  updateTicket,
} from '../api/sheetNinja'
import { formatDate, isResolvedToday, excelSerialToDate, nowExcelSerial } from '../utils/dateUtils'
import { STATUSES, PRIORITIES } from '../config'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [employees, setEmployees] = useState([])
  const [agents, setAgents] = useState([])
  const [slaRules, setSlaRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterAgent, setFilterAgent] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ status: '', priority: '', agentId: '', agentName: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [t, e, a, s] = await Promise.all([
          getTickets(),
          getEmployees(),
          getAgents(),
          getSlaRules(),
        ])
        if (cancelled) return
        setTickets(t || [])
        setEmployees(e || [])
        setAgents(a || [])
        setSlaRules(s || [])
        setError('')
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const openCount = tickets.filter((t) => t.status === 'Open').length
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length
  const resolvedTodayCount = tickets.filter((t) => isResolvedToday(t.resolvedAt)).length
  const breached = tickets.filter((t) => {
    if (t.status === 'Resolved') return false
    const created = excelSerialToDate(t.createdAt)
    if (!created) return false
    const hours = getResolutionHours(slaRules, t.priority)
    const deadline = new Date(created.getTime() + hours * 60 * 60 * 1000)
    return new Date() > deadline
  })
  const slaBreachedCount = breached.length

  const filteredTickets = tickets.filter((t) => {
    if (filterStatus && (t.status || '') !== filterStatus) return false
    if (filterPriority && (t.priority || '') !== filterPriority) return false
    if (filterAgent && (t.agentId || '') !== filterAgent) return false
    return true
  })

  // Agent workload: active, resolved, breached count, breached %, avg resolution (only active tickets count toward breach %)
  const agentStats = (agents || []).map((a) => {
    const myTickets = tickets.filter((t) => (t.agentId || '').toUpperCase() === (a.agentId || '').toUpperCase())
    const active = myTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length
    const activeTickets = myTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress')
    const resolved = myTickets.filter((t) => t.status === 'Resolved' && t.resolvedAt)
    const matchTicket = (b, t) => (b.id != null && t.id != null && String(b.id) === String(t.id)) || (b.ticketId && t.ticketId && b.ticketId === t.ticketId)
    const myBreached = activeTickets.filter((t) => breached.some((b) => matchTicket(b, t)))
    const breachedCount = myBreached.length
    const breachedPct = active > 0 ? Math.round((breachedCount / active) * 100) : 0
    let avgHours = null
    if (resolved.length > 0) {
      const totalMs = resolved.reduce((sum, t) => {
        const created = excelSerialToDate(t.createdAt)
        const resolvedAt = excelSerialToDate(t.resolvedAt)
        if (!created || !resolvedAt) return sum
        return sum + (resolvedAt.getTime() - created.getTime())
      }, 0)
      avgHours = (totalMs / resolved.length) / (60 * 60 * 1000)
    }
    return { ...a, active, resolvedCount: resolved.length, breachedCount, breachedPct, avgHours }
  })

  function startEdit(t) {
    setEditingId(t.id)
    setEditForm({
      status: t.status || 'Open',
      priority: t.priority || 'Medium',
      agentId: t.agentId || '',
      agentName: t.agentName || '',
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    if (editingId == null) return
    const agent = agents.find((a) => a.agentId === editForm.agentId)
    setSaving(true)
    setError('')
    try {
      await updateTicket(editingId, {
        status: editForm.status,
        priority: editForm.priority,
        agentId: editForm.agentId,
        agentName: agent ? agent.name : editForm.agentName,
        updatedAt: nowExcelSerial(),
        ...(editForm.status === 'Resolved' ? { resolvedAt: nowExcelSerial() } : { resolvedAt: '', resolutionNote: '' }),
      })
      const [t] = await Promise.all([getTickets()])
      setTickets(t || [])
      setEditingId(null)
    } catch (err) {
      setError(err.message || 'Failed to update ticket')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>Loading dashboard…</div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '1.5rem' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', fontSize: '0.9rem' }}>← Home</Link>
        <h1 style={{ margin: '0 0 1rem' }}>Admin Dashboard</h1>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)' }}>{openCount}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Open</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--warning)' }}>{inProgressCount}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>In Progress</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>{resolvedTodayCount}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Resolved Today</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--danger)' }}>{slaBreachedCount}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>SLA Breached</div>
          </div>
        </div>

        {error && <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>}

        {/* Filters */}
        <div className="card" style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 500 }}>Filters:</span>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 'auto', minWidth: 120 }}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ width: 'auto', minWidth: 120 }}>
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} style={{ width: 'auto', minWidth: 140 }}>
            <option value="">All agents</option>
            {(agents || []).map((a) => <option key={a.agentId} value={a.agentId}>{a.name}</option>)}
          </select>
          <button
            type="button"
            className="secondary"
            onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterAgent(''); }}
            style={{ marginLeft: '0.25rem' }}
          >
            Reset filters
          </button>
        </div>

        {/* Ticket table */}
        <div className="card" style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem 0.75rem' }}>ID</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Title</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Employee</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Category</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Priority</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Agent</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Created</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>SLA</th>
                <th style={{ padding: '0.5rem 0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map((t) => {
                const isBreach = breached.some((b) => b.id === t.id)
                return (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{t.ticketId}</td>
                    <td style={{ padding: '0.5rem 0.75rem', maxWidth: 180 }}>{t.title}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{t.employeeName}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{t.category}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span className={`badge ${(t.priority || '').toLowerCase()}`}>{t.priority}</span>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span className={`badge ${(t.status || '').toLowerCase().replace(/\s+/g, '-')}`}>{t.status}</span>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{t.agentName}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>{formatDate(t.createdAt)}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      {isBreach ? <span className="badge breach">Breach</span> : '—'}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      {editingId === t.id ? (
                        <form onSubmit={handleSave} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                          <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))} style={{ width: 'auto' }}>
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <select value={editForm.priority} onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))} style={{ width: 'auto' }}>
                            {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                          </select>
                          <select value={editForm.agentId} onChange={(e) => {
                            const a = agents.find((x) => x.agentId === e.target.value)
                            setEditForm((f) => ({ ...f, agentId: e.target.value, agentName: a ? a.name : '' }))
                          }} style={{ width: 'auto' }}>
                            {(agents || []).map((a) => <option key={a.agentId} value={a.agentId}>{a.name}</option>)}
                          </select>
                          <button type="submit" className="primary" disabled={saving}>Save</button>
                          <button type="button" className="secondary" onClick={() => setEditingId(null)}>Cancel</button>
                        </form>
                      ) : (
                        <button type="button" className="secondary" onClick={() => startEdit(t)}>Edit</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filteredTickets.length === 0 && <p style={{ padding: '1rem', color: 'var(--muted)', margin: 0 }}>No tickets match the filters.</p>}
        </div>

        {/* Agent workload */}
        <h2 style={{ marginBottom: '0.75rem' }}>Agent workload</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {agentStats.map((a) => (
            <div key={a.agentId} className="card" style={{ padding: '1rem' }}>
              <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{a.name}</strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '0.75rem' }}>{a.specialization || '—'}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 0.75rem', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--muted)' }}>Active</span>
                <strong style={{ textAlign: 'right' }}>{a.active}</strong>
                <span style={{ color: 'var(--muted)' }}>Resolved</span>
                <strong style={{ textAlign: 'right' }}>{a.resolvedCount}</strong>
                <span style={{ color: 'var(--muted)' }}>SLA Breached</span>
                <strong style={{ textAlign: 'right', color: a.breachedCount > 0 ? 'var(--danger)' : 'inherit' }}>{a.breachedCount}</strong>
                <span style={{ color: 'var(--muted)' }}>SLA Breached %</span>
                <strong style={{ textAlign: 'right', color: a.breachedPct > 0 ? 'var(--danger)' : 'inherit' }}>{a.breachedPct}%</strong>
                <span style={{ color: 'var(--muted)' }}>Avg resolution</span>
                <strong style={{ textAlign: 'right' }}>{a.avgHours != null ? `${a.avgHours.toFixed(1)}h` : '—'}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
