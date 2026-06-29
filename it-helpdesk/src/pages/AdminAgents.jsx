import { useState, useEffect, useCallback } from 'react'
import {
  getAgents,
  getTickets,
  createAgent,
  updateAgent,
  deleteAgent,
  nextAgentId,
} from '../api/helpdeskApi'
import { PlatformProvider } from '../context/PlatformContext'
import { useToast } from '../context/ToastContext'
import { CATEGORIES } from '../config'

const SPECIALIZATIONS = CATEGORIES

const EMPTY_FORM = { agentId: '', name: '', specialization: '' }

function AgentModal({ agent, suggestedId, onSave, onClose, saving }) {
  const isEdit = !!agent
  const [form, setForm] = useState(
    isEdit
      ? { agentId: agent.agentId, name: agent.name, specialization: agent.specialization || '' }
      : { ...EMPTY_FORM, agentId: suggestedId }
  )
  const [errors, setErrors] = useState({})

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: '' }))
  }

  function validate() {
    const errs = {}
    if (!form.agentId.trim()) errs.agentId = 'Agent ID is required'
    if (!form.name.trim()) errs.name = 'Name is required'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSave({ agentId: form.agentId.trim(), name: form.name.trim(), specialization: form.specialization || null })
  }

  return (
    <div className="am-backdrop" onClick={onClose} role="presentation">
      <div className="am-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="am-modal__header">
          <h3>{isEdit ? 'Edit Agent' : 'Add New Agent'}</h3>
          <button type="button" className="am-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form className="am-modal__body" onSubmit={handleSubmit} noValidate>
          <div className="am-field">
            <label className="am-label">Agent ID</label>
            <input
              className={`am-input${errors.agentId ? ' am-input--error' : ''}`}
              value={form.agentId}
              onChange={(e) => set('agentId', e.target.value)}
              placeholder="e.g. AGT-005"
              disabled={isEdit}
            />
            {errors.agentId && <span className="am-error">{errors.agentId}</span>}
            {isEdit && <span className="am-hint">Agent ID cannot be changed after creation.</span>}
          </div>

          <div className="am-field">
            <label className="am-label">Full Name <span className="am-required">*</span></label>
            <input
              className={`am-input${errors.name ? ' am-input--error' : ''}`}
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Jordan Lee"
              autoFocus={!isEdit}
            />
            {errors.name && <span className="am-error">{errors.name}</span>}
          </div>

          <div className="am-field">
            <label className="am-label">Specialization</label>
            <select
              className="am-input"
              value={form.specialization}
              onChange={(e) => set('specialization', e.target.value)}
            >
              <option value="">Select specialization…</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="am-modal__footer">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({ agent, onConfirm, onClose, saving }) {
  return (
    <div className="am-backdrop" onClick={onClose} role="presentation">
      <div className="am-modal am-modal--sm" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="am-modal__header">
          <h3>Remove Agent</h3>
          <button type="button" className="am-modal__close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="am-modal__body">
          <p className="am-confirm-text">
            Are you sure you want to remove <strong>{agent.name}</strong> ({agent.agentId})?
            Any tickets currently assigned to this agent will remain but become unattended.
          </p>
        </div>
        <div className="am-modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={saving}>
            {saving ? 'Removing…' : 'Remove agent'}
          </button>
        </div>
      </div>
    </div>
  )
}

const AVATAR_PALETTE = [
  { bg: 'rgba(59,130,246,0.15)',  fg: '#3B82F6' },
  { bg: 'rgba(168,85,247,0.15)',  fg: '#8B5CF6' },
  { bg: 'rgba(34,197,94,0.15)',   fg: '#16A34A' },
  { bg: 'rgba(245,158,11,0.15)',  fg: '#D97706' },
  { bg: 'rgba(239,68,68,0.15)',   fg: '#DC2626' },
  { bg: 'rgba(20,184,166,0.15)',  fg: '#0D9488' },
]
function avatarColor(name) {
  if (!name) return AVATAR_PALETTE[0]
  let h = 0
  for (const c of name) h = ((h << 5) - h + c.charCodeAt(0)) | 0
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

export default function AdminAgents() {
  const { toast } = useToast()
  const [agents, setAgents] = useState([])
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState(null)
  const [deletingAgent, setDeletingAgent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    try {
      const [a, t] = await Promise.all([getAgents(), getTickets()])
      setAgents(a || [])
      setTickets(t || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load agents')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const agentsWithStats = agents.map((a) => {
    const mine = tickets.filter((t) => (t.agentId || '').toUpperCase() === (a.agentId || '').toUpperCase())
    const active = mine.filter((t) => t.status === 'Open' || t.status === 'In Progress').length
    const resolved = mine.filter((t) => t.status === 'Resolved').length
    return { ...a, active, resolved, total: mine.length }
  })

  const filtered = agentsWithStats.filter((a) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (a.agentId || '').toLowerCase().includes(q) ||
      (a.name || '').toLowerCase().includes(q) ||
      (a.specialization || '').toLowerCase().includes(q)
    )
  })

  async function handleSave(formData) {
    setSaving(true)
    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id, { name: formData.name, specialization: formData.specialization })
        toast(`${formData.name} updated successfully`)
      } else {
        await createAgent(formData)
        toast(`${formData.name} added to the team`)
      }
      setModalOpen(false)
      setEditingAgent(null)
      await load()
    } catch (err) {
      toast(err.message || 'Save failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deletingAgent) return
    setSaving(true)
    try {
      await deleteAgent(deletingAgent.id)
      toast(`${deletingAgent.name} removed`)
      setDeletingAgent(null)
      await load()
    } catch (err) {
      toast(err.message || 'Delete failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  function openAdd() {
    setEditingAgent(null)
    setModalOpen(true)
  }

  function openEdit(agent) {
    setEditingAgent(agent)
    setModalOpen(true)
  }

  const platformValue = {
    role: 'admin',
    user: { name: 'Administrator', id: 'ADMIN' },
    breadcrumbs: [{ label: 'DeskFlow', to: '/' }, { label: 'Agents' }],
    searchItems: [],
    onSearchSelect: () => {},
  }

  return (
    <PlatformProvider value={platformValue}>
      <div>
        <div className="page-header">
          <div>
            <h1>Agent Management</h1>
            <p className="page-header__sub">Add, edit, and remove agents from your team</p>
          </div>
          <button type="button" className="btn btn--primary" onClick={openAdd}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Add agent
          </button>
        </div>

        {error && <div className="sla-alert">{error}</div>}

        {/* Summary stats */}
        <div className="am-stat-row">
          <div className="am-stat-card">
            <span className="am-stat-card__val">{agents.length}</span>
            <span className="am-stat-card__lbl">Total agents</span>
          </div>
          <div className="am-stat-card">
            <span className="am-stat-card__val">{agentsWithStats.reduce((s, a) => s + a.active, 0)}</span>
            <span className="am-stat-card__lbl">Active tickets</span>
          </div>
          <div className="am-stat-card">
            <span className="am-stat-card__val">{agentsWithStats.reduce((s, a) => s + a.resolved, 0)}</span>
            <span className="am-stat-card__lbl">Tickets resolved</span>
          </div>
          <div className="am-stat-card">
            <span className="am-stat-card__val">{[...new Set(agents.map((a) => a.specialization).filter(Boolean))].length}</span>
            <span className="am-stat-card__lbl">Specializations</span>
          </div>
        </div>

        {/* Search + table */}
        <div className="chart-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="am-table-toolbar">
            <div className="am-search-wrap">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="am-search-icon">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                className="am-search"
                placeholder="Search agents…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <span className="am-count">{filtered.length} agent{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {loading ? (
            <div className="am-loading">Loading agents…</div>
          ) : filtered.length === 0 ? (
            <div className="am-empty">
              <p>{search ? 'No agents match your search.' : 'No agents yet. Add your first agent to get started.'}</p>
            </div>
          ) : (
            <table className="data-table am-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Agent ID</th>
                  <th>Specialization</th>
                  <th>Active Tickets</th>
                  <th>Resolved</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const col = avatarColor(a.name)
                  const initials = (a.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
                  return (
                    <tr key={a.id || a.agentId}>
                      <td>
                        <div className="am-agent-cell">
                          <div className="am-avatar" style={{ background: col.bg, color: col.fg }}>{initials}</div>
                          <div className="am-agent-info">
                            <strong>{a.name}</strong>
                          </div>
                        </div>
                      </td>
                      <td><code className="am-id">{a.agentId}</code></td>
                      <td>
                        {a.specialization
                          ? <span className="am-spec-badge">{a.specialization}</span>
                          : <span className="am-no-spec">General</span>}
                      </td>
                      <td>
                        <span className={`am-ticket-count${a.active > 0 ? ' am-ticket-count--active' : ''}`}>
                          {a.active}
                        </span>
                      </td>
                      <td>
                        <span className="am-ticket-count am-ticket-count--resolved">{a.resolved}</span>
                      </td>
                      <td>
                        <div className="am-actions">
                          <button
                            type="button"
                            className="am-btn-edit"
                            onClick={() => openEdit(a)}
                            title="Edit agent"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Edit
                          </button>
                          <button
                            type="button"
                            className="am-btn-delete"
                            onClick={() => setDeletingAgent(a)}
                            title="Remove agent"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                            </svg>
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <AgentModal
          agent={editingAgent}
          suggestedId={nextAgentId(agents)}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingAgent(null) }}
          saving={saving}
        />
      )}

      {deletingAgent && (
        <DeleteConfirm
          agent={deletingAgent}
          onConfirm={handleDelete}
          onClose={() => setDeletingAgent(null)}
          saving={saving}
        />
      )}
    </PlatformProvider>
  )
}
