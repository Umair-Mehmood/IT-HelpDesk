import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { getTickets, getAgents, createTicket } from '../api/helpdeskApi'
import { formatDate } from '../utils/dateUtils'
import { CATEGORIES, PRIORITIES } from '../config'
import { useToast } from '../context/ToastContext'
import { saveEmployeeSession, loadEmployeeSession } from '../utils/sessionStorage'
import { StatusBadge, EmptyState, TableSkeleton, FilterChip } from '../components/ui/Primitives'
import TicketDrawer from '../components/saas/TicketDrawer'

export default function EmployeeDashboard() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const outlet = useOutletContext() || {}
  const saved = loadEmployeeSession()
  const merged = { ...saved, ...state }
  const employee = merged?.employee
  const employeeId = (merged?.employeeId || employee?.employeeId || '').trim()
  const employeeName = (merged?.employeeName || employee?.name || '').trim()

  const [tickets, setTickets] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'Software', priority: 'Medium' })
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    if (!employeeId) {
      navigate('/employee', { replace: true })
      return
    }
    saveEmployeeSession(merged)
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

  const myTickets = useMemo(() =>
    (tickets || [])
      .filter((t) => (t.employeeId || '').toUpperCase() === employeeId.toUpperCase())
      .filter((t) => !filterStatus || t.status === filterStatus)
      .filter((t) => !search || `${t.ticketId} ${t.title} ${t.category}`.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (b.id || 0) - (a.id || 0)),
    [tickets, employeeId, filterStatus, search]
  )

  function openTicket(t) {
    setSelectedTicket(t)
    setDrawerOpen(true)
  }

  useEffect(() => {
    if (!outlet.setSearchItems) return
    outlet.setSearchItems(myTickets.map((t) => ({
      id: t.id,
      label: `${t.ticketId} — ${t.title}`,
      meta: t.status,
      ticket: t,
    })))
    outlet.setOnSearchSelect((item) => openTicket(item.ticket))
  }, [myTickets, outlet.setSearchItems, outlet.setOnSearchSelect])

  async function handleSubmitTicket(e) {
    e.preventDefault()
    if (!form.title?.trim()) return
    setSubmitting(true)
    try {
      const created = await createTicket(
        { employeeId, employeeName: employeeName || employeeId, title: form.title.trim(), description: (form.description || '').trim(), category: form.category, priority: form.priority },
        tickets,
        agents
      )
      const [t] = await Promise.all([getTickets()])
      setTickets(t || [])
      setForm({ title: '', description: '', category: 'Software', priority: 'Medium' })
      setShowForm(false)
      toast(`Ticket ${created?.ticketId || ''} created`)
    } catch (err) {
      setError(err.message || 'Failed to submit ticket')
      toast(err.message || 'Failed to submit ticket', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (!employeeId) return null

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>My Tickets</h1>
          <p className="page-header__sub">{employeeName || employeeId}</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>+ New Ticket</button>
        </div>
      </div>

      {error && <div className="sla-alert">{error}</div>}

      <div className="toolbar">
        <input
          className="toolbar__search"
          placeholder="Search tickets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-bar">
          {['', ...['Open', 'In Progress', 'Resolved']].map((s) => (
            <FilterChip
              key={s || 'all'}
              label={s || 'All statuses'}
              active={filterStatus === s}
              onClick={() => setFilterStatus(s)}
              onClear={s ? () => setFilterStatus('') : undefined}
            />
          ))}
        </div>
      </div>

      {showForm && (
        <div className="surface-card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>New ticket</h3>
          <form onSubmit={handleSubmitTicket}>
            <label className="label">Title</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Brief summary" required />
            <label className="label" style={{ marginTop: 12 }}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe the issue…" rows={3} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <label className="label">Category</label>
                <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit ticket'}</button>
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : myTickets.length === 0 ? (
        <EmptyState
          title="No tickets yet"
          description="Create your first support request and track it through resolution."
          action={<button type="button" className="btn btn--primary" onClick={() => setShowForm(true)}>Create ticket</button>}
        />
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Agent</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {myTickets.map((t) => (
                <tr key={t.id} onClick={() => openTicket(t)}>
                  <td><strong>{t.ticketId}</strong></td>
                  <td>{t.title}</td>
                  <td>{t.category}</td>
                  <td><StatusBadge priority={t.priority} /></td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>{t.agentName || '—'}</td>
                  <td className="meta-text">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TicketDrawer
        ticket={selectedTicket}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        chatProps={{ authorType: 'employee', authorId: employeeId, authorName: employeeName || employeeId }}
      />
    </div>
  )
}
