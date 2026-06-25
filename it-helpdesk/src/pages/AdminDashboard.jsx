import { useState, useEffect, useMemo } from 'react'
import {
  getTickets,
  getEmployees,
  getAgents,
  getSlaRules,
  getResolutionHours,
  updateTicket,
} from '../api/helpdeskApi'
import { formatDate, isResolvedToday, excelSerialToDate, nowExcelSerial } from '../utils/dateUtils'
import { STATUSES, PRIORITIES } from '../config'
import { PlatformProvider } from '../context/PlatformContext'
import { useToast } from '../context/ToastContext'
import { StatusBadge, KpiCard, TableSkeleton, FilterChip, EmptyState } from '../components/ui/Primitives'
import TicketDrawer from '../components/saas/TicketDrawer'

const CHART_RANGE_OPTIONS = [
  { label: '7 days',  days: 7  },
  { label: '14 days', days: 14 },
  { label: '30 days', days: 30 },
]

function ticketVolumeByDay(tickets, numDays) {
  const days = []
  for (let i = numDays - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    const count = tickets.filter((t) => {
      const created = excelSerialToDate(t.createdAt)
      if (!created) return false
      return created.toDateString() === d.toDateString()
    }).length
    days.push({ label, count })
  }
  return days
}

function BarChart({ data }) {
  const n = data.length
  const SLOT_W   = n <= 7 ? 52 : n <= 14 ? 32 : 19
  const BAR_W    = Math.max(8, Math.round(SLOT_W * 0.52))
  const CHART_H  = 96
  const TOP_PAD  = 20   // room for count labels above tallest bar
  const BTM_PAD  = 26   // room for date labels + baseline
  const L_PAD    = 6
  const R_PAD    = 6
  const VB_W     = L_PAD + n * SLOT_W + R_PAD
  const VB_H     = TOP_PAD + CHART_H + BTM_PAD
  const maxCount = Math.max(...data.map((d) => d.count), 1)
  const labelEvery = n <= 7 ? 1 : n <= 14 ? 2 : 5

  // Gentle gridlines at 25 %, 50 %, 75 %, 100 %
  const gridFracs = [0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="bcGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#3B82F6" stopOpacity="1"   />
          <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="bcGradHov" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2563EB" stopOpacity="1"   />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Gridlines */}
      {gridFracs.map((f) => {
        const y = TOP_PAD + CHART_H - Math.round(f * CHART_H)
        return (
          <line key={f}
            x1={L_PAD} y1={y} x2={VB_W - R_PAD} y2={y}
            stroke="#E2E8F0" strokeWidth={0.8}
            strokeDasharray={f === 1 ? '0' : '3 3'}
          />
        )
      })}

      {/* Baseline */}
      <line x1={L_PAD} y1={TOP_PAD + CHART_H} x2={VB_W - R_PAD} y2={TOP_PAD + CHART_H}
        stroke="#CBD5E1" strokeWidth={1} />

      {/* Bars + labels */}
      {data.map((d, i) => {
        const barH   = Math.max(2, Math.round((d.count / maxCount) * CHART_H))
        const barX   = L_PAD + i * SLOT_W + (SLOT_W - BAR_W) / 2
        const barY   = TOP_PAD + CHART_H - barH
        const cx     = L_PAD + i * SLOT_W + SLOT_W / 2
        const showLbl = i % labelEvery === 0 || i === n - 1
        return (
          <g key={i}>
            <title>{`${d.label}: ${d.count} ticket${d.count !== 1 ? 's' : ''}`}</title>
            <rect x={barX} y={barY} width={BAR_W} height={barH} rx={3} fill="url(#bcGrad)" />
            {d.count > 0 && (
              <text x={cx} y={barY - 4} textAnchor="middle"
                fontSize={9} fontWeight="600" fill="#475569">
                {d.count}
              </text>
            )}
            {showLbl && (
              <text x={cx} y={TOP_PAD + CHART_H + 16} textAnchor="middle"
                fontSize={9} fill="#94A3B8">
                {d.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export default function AdminDashboard() {
  const { toast } = useToast()

  const [tickets, setTickets] = useState([])
  const [agents, setAgents] = useState([])
  const [slaRules, setSlaRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [filterAgent, setFilterAgent] = useState('')
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editForm, setEditForm] = useState({ status: '', priority: '', agentId: '', agentName: '' })
  const [saving, setSaving] = useState(false)
  const [chartRange, setChartRange] = useState(7)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [t, , a, s] = await Promise.all([getTickets(), getEmployees(), getAgents(), getSlaRules()])
        if (cancelled) return
        setTickets(t || [])
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

  const breached = useMemo(() => tickets.filter((t) => {
    if (t.status === 'Resolved') return false
    const created = excelSerialToDate(t.createdAt)
    if (!created) return false
    const hours = getResolutionHours(slaRules, t.priority)
    const deadline = new Date(created.getTime() + hours * 60 * 60 * 1000)
    return new Date() > deadline
  }), [tickets, slaRules])

  const openCount = tickets.filter((t) => t.status === 'Open').length
  const inProgressCount = tickets.filter((t) => t.status === 'In Progress').length
  const resolvedTodayCount = tickets.filter((t) => isResolvedToday(t.resolvedAt)).length
  const slaBreachedCount = breached.length
  const chartData = ticketVolumeByDay(tickets, chartRange)

  const filteredTickets = useMemo(() => tickets.filter((t) => {
    if (filterStatus && t.status !== filterStatus) return false
    if (filterPriority && t.priority !== filterPriority) return false
    if (filterAgent && t.agentId !== filterAgent) return false
    if (search && !`${t.ticketId} ${t.title} ${t.employeeName}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  }), [tickets, filterStatus, filterPriority, filterAgent, search])

  const recentActivity = [...tickets]
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 20)

  const agentStats = (agents || []).map((a) => {
    const myTickets = tickets.filter((t) => (t.agentId || '').toUpperCase() === (a.agentId || '').toUpperCase())
    const active = myTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length
    const activeTickets = myTickets.filter((t) => t.status === 'Open' || t.status === 'In Progress')
    const resolved = myTickets.filter((t) => t.status === 'Resolved' && t.resolvedAt)
    const matchTicket = (b, t) => (b.id != null && t.id != null && String(b.id) === String(t.id)) || (b.ticketId && t.ticketId && b.ticketId === t.ticketId)
    const myBreached = activeTickets.filter((t) => breached.some((b) => matchTicket(b, t)))
    const breachedPct = active > 0 ? Math.round((myBreached.length / active) * 100) : 0
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
    return { ...a, active, resolvedCount: resolved.length, breachedCount: myBreached.length, breachedPct, avgHours }
  })

  const searchItems = filteredTickets.map((t) => ({
    id: t.id,
    label: `${t.ticketId} — ${t.title}`,
    meta: t.status,
    ticket: t,
  }))

  function openTicket(t) {
    setSelectedTicket(t)
    setEditForm({ status: t.status || 'Open', priority: t.priority || 'Medium', agentId: t.agentId || '', agentName: t.agentName || '' })
    setDrawerOpen(true)
  }

  function toggleSelect(id, e) {
    e?.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!selectedTicket) return
    const agent = agents.find((a) => a.agentId === editForm.agentId)
    setSaving(true)
    try {
      await updateTicket(selectedTicket.id, {
        status: editForm.status,
        priority: editForm.priority,
        agentId: editForm.agentId,
        agentName: agent ? agent.name : editForm.agentName,
        updatedAt: nowExcelSerial(),
        ...(editForm.status === 'Resolved' ? { resolvedAt: nowExcelSerial() } : { resolvedAt: '', resolutionNote: '' }),
      })
      const t = await getTickets()
      setTickets(t || [])
      toast(`Ticket ${selectedTicket.ticketId} updated`)
      setDrawerOpen(false)
    } catch (err) {
      toast(err.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  const platformValue = {
    role: 'admin',
    user: { name: 'Administrator', id: 'ADMIN' },
    breadcrumbs: [{ label: 'DeskFlow', to: '/' }, { label: 'Overview' }],
    searchItems,
    onSearchSelect: (item) => openTicket(item.ticket),
  }

  if (loading) {
    return (
      <PlatformProvider value={platformValue}>
        <TableSkeleton rows={8} cols={8} />
      </PlatformProvider>
    )
  }

  return (
    <PlatformProvider value={platformValue}>
      <div>
        <div className="page-header">
          <div>
            <h1>Operations Overview</h1>
            <p className="page-header__sub">Real-time ticket volume, SLA health, and agent workload</p>
          </div>
        </div>

        {error && <div className="sla-alert">{error}</div>}
        {slaBreachedCount > 0 && (
          <div className="sla-alert">
            <strong>{slaBreachedCount} ticket{slaBreachedCount > 1 ? 's' : ''}</strong> have breached SLA — review and reassign immediately.
          </div>
        )}

        <div className="dashboard-grid" style={{ marginBottom: 24 }}>
          <div className="col-3"><KpiCard label="Open" value={openCount} trend={5} trendUp={false} /></div>
          <div className="col-3"><KpiCard label="In Progress" value={inProgressCount} /></div>
          <div className="col-3"><KpiCard label="Resolved Today" value={resolvedTodayCount} trend={14} trendUp /></div>
          <div className="col-3"><KpiCard label="SLA Breached" value={slaBreachedCount} variant="danger" /></div>
        </div>

        <div className="dashboard-grid dashboard-overview-row" style={{ marginBottom: 24 }}>
          <div className="col-8">
            <div className="chart-card chart-card--compact">
              <div className="chart-header">
                <h4 className="section-label" style={{ margin: 0 }}>Ticket volume</h4>
                <div className="chart-range-pills">
                  {CHART_RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.days}
                      type="button"
                      className={`chart-range-pill${chartRange === opt.days ? ' chart-range-pill--active' : ''}`}
                      onClick={() => setChartRange(opt.days)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <BarChart data={chartData} />
            </div>
          </div>
          <div className="col-4">
            <div className="chart-card chart-card--compact">
              <h4 className="section-label">Recent activity</h4>
              <div className="activity-feed-scroll">
                {recentActivity.map((t) => {
                  const agentLabel = t.agentName
                    || agents.find((a) => (a.agentId || '').toUpperCase() === (t.agentId || '').toUpperCase())?.name
                  const initials = agentLabel
                    ? agentLabel.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                    : '—'
                  const statusKey = (t.status || '').toLowerCase().replace(/\s+/g, '-')
                  return (
                    <div key={t.id} className="act-row">
                      <div className={`act-avatar act-avatar--${statusKey}`}>{initials}</div>
                      <div className="act-body">
                        <div className="act-line act-line--top">
                          <span className="act-tid">{t.ticketId}</span>
                          <span className={`act-pill act-pill--${statusKey}`}>{t.status}</span>
                        </div>
                        <div className="act-line act-line--bot">
                          <span className="act-agent">{agentLabel || 'Unassigned'}</span>
                          <span className="act-time">{formatDate(t.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="toolbar">
          <input className="toolbar__search" placeholder="Search all tickets…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="filter-bar">
            <FilterChip label={filterStatus || 'Status'} active={!!filterStatus} onClick={() => {}} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: 'auto' }}>
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ width: 'auto' }}>
              <option value="">All priorities</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={filterAgent} onChange={(e) => setFilterAgent(e.target.value)} style={{ width: 'auto' }}>
              <option value="">All agents</option>
              {agents.map((a) => <option key={a.agentId} value={a.agentId}>{a.name}</option>)}
            </select>
            {(filterStatus || filterPriority || filterAgent) && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setFilterStatus(''); setFilterPriority(''); setFilterAgent('') }}>Clear</button>
            )}
          </div>
        </div>

        {filteredTickets.length === 0 ? (
          <EmptyState title="No tickets match" description="Adjust your filters or search query." />
        ) : (
          <div className="data-table-wrap data-table-wrap--scroll" style={{ marginBottom: 32 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}><input type="checkbox" aria-label="Select all" onChange={(e) => setSelectedIds(e.target.checked ? new Set(filteredTickets.map((t) => t.id)) : new Set())} /></th>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Employee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Agent</th>
                  <th>SLA</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((t) => {
                  const isBreach = breached.some((b) => b.id === t.id)
                  return (
                    <tr key={t.id} className={selectedIds.has(t.id) ? 'selected' : ''} onClick={() => openTicket(t)}>
                      <td onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(t.id)} onChange={(e) => toggleSelect(t.id, e)} aria-label={`Select ${t.ticketId}`} />
                      </td>
                      <td><strong>{t.ticketId}</strong></td>
                      <td>{t.title}</td>
                      <td>{t.employeeName}</td>
                      <td><StatusBadge priority={t.priority} /></td>
                      <td><StatusBadge status={t.status} /></td>
                      <td>{t.agentName}</td>
                      <td>{isBreach ? <StatusBadge status="Breach" /> : '—'}</td>
                      <td className="meta-text">{formatDate(t.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <h4 className="section-label">Agent workload</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {agentStats.map((a) => (
            <div key={a.agentId} className="agent-card">
              <div className="agent-card__name">{a.name}</div>
              <div className="agent-card__spec">{a.specialization || 'General'}</div>
              <dl className="agent-card__stats">
                <dt>Active</dt><dd>{a.active}</dd>
                <dt>Resolved</dt><dd>{a.resolvedCount}</dd>
                <dt>SLA Breached</dt><dd style={{ color: a.breachedCount > 0 ? 'var(--danger)' : undefined }}>{a.breachedCount}</dd>
                <dt>Breach %</dt><dd style={{ color: a.breachedPct > 0 ? 'var(--danger)' : undefined }}>{a.breachedPct}%</dd>
                <dt>Avg resolution</dt><dd>{a.avgHours != null ? `${a.avgHours.toFixed(1)}h` : '—'}</dd>
              </dl>
            </div>
          ))}
        </div>

        <TicketDrawer ticket={selectedTicket} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {selectedTicket && (
            <section className="drawer-section">
              <h4 className="section-label">Admin actions</h4>
              <form onSubmit={handleSave}>
                <label className="label">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className="label" style={{ marginTop: 12 }}>Priority</label>
                <select value={editForm.priority} onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}>
                  {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <label className="label" style={{ marginTop: 12 }}>Assign agent</label>
                <select value={editForm.agentId} onChange={(e) => {
                  const ag = agents.find((x) => x.agentId === e.target.value)
                  setEditForm((f) => ({ ...f, agentId: e.target.value, agentName: ag ? ag.name : '' }))
                }}>
                  {agents.map((a) => <option key={a.agentId} value={a.agentId}>{a.name}</option>)}
                </select>
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
