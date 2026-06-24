import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getTickets, getAgents, updateTicket } from '../api/helpdeskApi'
import { formatDate, nowExcelSerial, excelSerialToDate } from '../utils/dateUtils'
import { STATUSES } from '../config'
import { PlatformProvider } from '../context/PlatformContext'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { StatusBadge, EmptyState, TableSkeleton, FilterChip, KpiCard } from '../components/ui/Primitives'
import TicketDrawer from '../components/saas/TicketDrawer'

export default function AgentDashboard() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const agent = state?.agent

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
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
        const t = await getTickets()
        if (cancelled) return
        setTickets(t || [])
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

  const myTickets = useMemo(() =>
    (tickets || [])
      .filter((t) => (t.agentId || '').toUpperCase() === (agent?.agentId || '').toUpperCase())
      .filter((t) => !filterStatus || t.status === filterStatus)
      .filter((t) => !search || `${t.ticketId} ${t.title} ${t.employeeName}`.toLowerCase().includes(search.toLowerCase())),
    [tickets, agent?.agentId, filterStatus, search]
  )

  const openCount = myTickets.filter((t) => t.status === 'Open').length
  const inProgressCount = myTickets.filter((t) => t.status === 'In Progress').length
  const resolvedCount = myTickets.filter((t) => t.status === 'Resolved').length

  const searchItems = myTickets.map((t) => ({
    id: t.id,
    label: `${t.ticketId} — ${t.title}`,
    meta: t.employeeName,
    ticket: t,
  }))

  function openTicket(t) {
    setSelectedTicket(t)
    setEditForm({ status: t.status || 'Open', resolutionNote: t.resolutionNote || '', internalNote: t.internalNote || '' })
    setDrawerOpen(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!selectedTicket) return

    if (editForm.status === 'Resolved') {
      const ok = await confirm({
        title: 'Resolve ticket?',
        message: `Mark ${selectedTicket.ticketId} as resolved? The employee will see your resolution note.`,
        confirmLabel: 'Resolve',
      })
      if (!ok) return
    }

    setSaving(true)
    setError('')
    try {
      const updates = {
        status: editForm.status,
        updatedAt: nowExcelSerial(),
        resolutionNote: editForm.resolutionNote,
        internalNote: editForm.internalNote,
      }
      if (editForm.status === 'Resolved') {
        updates.resolvedAt = nowExcelSerial()
      } else {
        updates.resolvedAt = ''
        updates.resolutionNote = ''
      }
      await updateTicket(selectedTicket.id, updates)
      const t = await getTickets()
      setTickets(t || [])
      const updated = (t || []).find((x) => x.id === selectedTicket.id)
      setSelectedTicket(updated || null)
      toast(`Ticket ${selectedTicket.ticketId} updated`)
    } catch (err) {
      setError(err.message || 'Failed to update ticket')
      toast(err.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!agent?.agentId) return null

  const platformValue = {
    role: 'agent',
    user: { name: agent.name, id: agent.agentId },
    breadcrumbs: [{ label: 'DeskFlow', to: '/' }, { label: 'Queue' }],
    searchItems,
    onSearchSelect: (item) => openTicket(item.ticket),
  }

  return (
    <PlatformProvider value={platformValue}>
      <div>
        <div className="page-header">
          <div>
            <h1>Agent Queue</h1>
            <p className="page-header__sub">{agent.name} · {agent.specialization}</p>
          </div>
        </div>

        {error && <div className="sla-alert">{error}</div>}

        <div className="dashboard-grid" style={{ marginBottom: 24 }}>
          <div className="col-4"><KpiCard label="Open" value={openCount} trend={12} trendUp={false} /></div>
          <div className="col-4"><KpiCard label="In Progress" value={inProgressCount} /></div>
          <div className="col-4"><KpiCard label="Resolved" value={resolvedCount} trend={8} trendUp /></div>
        </div>

        <div className="toolbar">
          <input className="toolbar__search" placeholder="Search queue…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="filter-bar">
            {['', ...STATUSES].map((s) => (
              <FilterChip key={s || 'all'} label={s || 'All'} active={filterStatus === s} onClick={() => setFilterStatus(s)} onClear={s ? () => setFilterStatus('') : undefined} />
            ))}
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : myTickets.length === 0 ? (
          <EmptyState title="Queue is clear" description="No tickets are assigned to you right now." />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {myTickets.map((t) => (
                  <tr key={t.id} onClick={() => openTicket(t)}>
                    <td><strong>{t.ticketId}</strong></td>
                    <td>{t.title}</td>
                    <td>{t.employeeName}</td>
                    <td>{t.category}</td>
                    <td><StatusBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
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
          chatProps={{ authorType: 'agent', authorId: agent.agentId, authorName: agent.name }}
        >
          {selectedTicket && (
            <section className="drawer-section">
              <h4 className="section-label">Update ticket</h4>
              <form onSubmit={handleSave}>
                <label className="label">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                {editForm.status === 'Resolved' && (
                  <>
                    <label className="label" style={{ marginTop: 12 }}>Resolution note</label>
                    <textarea value={editForm.resolutionNote} onChange={(e) => setEditForm((f) => ({ ...f, resolutionNote: e.target.value }))} rows={2} />
                  </>
                )}
                <label className="label" style={{ marginTop: 12 }}>Internal note</label>
                <textarea value={editForm.internalNote} onChange={(e) => setEditForm((f) => ({ ...f, internalNote: e.target.value }))} rows={2} />
                <button type="submit" className="btn btn--primary" style={{ marginTop: 16 }} disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </form>
            </section>
          )}
        </TicketDrawer>
      </div>
    </PlatformProvider>
  )
}
