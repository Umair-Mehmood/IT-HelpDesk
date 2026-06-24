import { useEffect, useState, useCallback } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { loadEmployeeSession, loadAgentSession } from '../../utils/sessionStorage'

function resolveSession(location) {
  const { pathname, state } = location
  const saved = pathname.startsWith('/employee')
    ? loadEmployeeSession()
    : pathname.startsWith('/agent')
      ? loadAgentSession()
      : null
  const merged = { ...saved, ...state }

  if (pathname.startsWith('/employee')) {
    const employee = merged?.employee
    const id = (merged?.employeeId || employee?.employeeId || '').trim()
    const name = (merged?.employeeName || employee?.name || id).trim()
    return {
      role: 'employee',
      user: id ? { name: name || id, id } : null,
      breadcrumbs: [{ label: 'DeskFlow', to: '/' }, { label: 'My Tickets' }],
    }
  }
  if (pathname.startsWith('/agent')) {
    const agent = merged?.agent
    return {
      role: 'agent',
      user: agent ? { name: agent.name, id: agent.agentId } : null,
      breadcrumbs: [{ label: 'DeskFlow', to: '/' }, { label: 'Queue' }],
    }
  }
  if (pathname.startsWith('/admin')) {
    return {
      role: 'admin',
      user: { name: 'Administrator', id: 'ADMIN' },
      breadcrumbs: [{ label: 'DeskFlow', to: '/' }, { label: 'Overview' }],
    }
  }
  return { role: null, user: null, breadcrumbs: [] }
}

const NAV = {
  employee: [
    { to: '/employee/dashboard', label: 'My Tickets', icon: 'tickets' },
  ],
  agent: [
    { to: '/agent/dashboard', label: 'Queue', icon: 'queue' },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Overview', icon: 'overview' },
  ],
}

function NavIcon({ name }) {
  const icons = {
    tickets: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
    queue: <path d="M4 6h16M4 12h16M4 18h10" />,
    overview: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />,
    home: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />,
    help: <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  )
}

function CommandPalette({ open, onClose, items, onSelect }) {
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!open) setQ('')
  }, [open])

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onClose('toggle')
      }
      if (e.key === 'Escape') onClose(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!open) return null

  const filtered = (items || []).filter((item) =>
    !q || item.label.toLowerCase().includes(q.toLowerCase()) || item.meta?.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 8)

  return (
    <div className="cmd-backdrop" onClick={() => onClose(false)} role="presentation">
      <div className="cmd-palette" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-palette__input-wrap">
          <span className="cmd-palette__hint">⌘K</span>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tickets, people, actions…"
            className="cmd-palette__input"
          />
        </div>
        <ul className="cmd-palette__list">
          {filtered.length === 0 ? (
            <li className="cmd-palette__empty">No results</li>
          ) : filtered.map((item) => (
            <li key={item.id}>
              <button type="button" className="cmd-palette__item" onClick={() => { onSelect?.(item); onClose(false) }}>
                <span>{item.label}</span>
                {item.meta && <span className="cmd-palette__meta">{item.meta}</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const session = resolveSession(location)
  const role = session.role
  const user = session.user
  const breadcrumbs = session.breadcrumbs
  const [searchItems] = useState([])
  const onSearchSelect = useCallback(() => {}, [])
  const [collapsed, setCollapsed] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)
  const handleCmdClose = useCallback((value) => {
    if (value === 'toggle') setCmdOpen((open) => !open)
    else setCmdOpen(false)
  }, [])
  const [menuOpen, setMenuOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const navItems = NAV[role] || []
  const initials = (user?.name || user?.id || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {!bannerDismissed && (
        <div className="announcement-banner">
          <span>Platform update — Ticket conversations and SLA tracking are now live.</span>
          <button type="button" className="announcement-banner__close" onClick={() => setBannerDismissed(true)} aria-label="Dismiss">×</button>
        </div>
      )}

      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <img src="/it-helpdesk-logo.svg" alt="" className="app-sidebar__logo" />
          {!collapsed && (
            <div className="app-sidebar__brand-text">
              <strong>DeskFlow</strong>
              <span>IT Operations</span>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="workspace-switcher">
            <span className="workspace-switcher__label">Workspace</span>
            <button type="button" className="workspace-switcher__btn">
              Acme Corp <span className="workspace-switcher__chev">▾</span>
            </button>
          </div>
        )}

        <nav className="app-sidebar__nav">
          <div className="nav-section-label">{!collapsed && 'Main'}</div>
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              state={location.state}
              className={`app-sidebar__link ${location.pathname === item.to ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <NavIcon name={item.icon} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
          <div className="nav-divider" />
          <div className="nav-section-label">{!collapsed && 'General'}</div>
          <Link to="/" className="app-sidebar__link" title={collapsed ? 'Home' : undefined}>
            <NavIcon name="home" />
            {!collapsed && <span>Home</span>}
          </Link>
          <Link to="/how-to-use" className="app-sidebar__link" title={collapsed ? 'Help' : undefined}>
            <NavIcon name="help" />
            {!collapsed && <span>Help</span>}
          </Link>
        </nav>

        <button type="button" className="app-sidebar__collapse" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? '→' : '←'}
        </button>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <div className="app-header__left">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              {(breadcrumbs || []).map((crumb, i) => (
                <span key={crumb.label}>
                  {i > 0 && <span className="breadcrumbs__sep">/</span>}
                  {crumb.to ? <Link to={crumb.to} state={location.state}>{crumb.label}</Link> : <span>{crumb.label}</span>}
                </span>
              ))}
            </nav>
          </div>
          <div className="app-header__right">
            <button type="button" className="header-search" onClick={() => setCmdOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <span>Search…</span>
              <kbd>⌘K</kbd>
            </button>
            <button type="button" className="header-icon-btn" aria-label="Notifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg>
              <span className="header-icon-btn__dot" />
            </button>
            <div className="header-user">
              <button type="button" className="header-avatar" onClick={() => setMenuOpen((o) => !o)} aria-expanded={menuOpen}>
                {initials}
              </button>
              {menuOpen && (
                <div className="header-dropdown">
                  <div className="header-dropdown__info">
                    <strong>{user?.name || 'User'}</strong>
                    <span>{user?.id}</span>
                  </div>
                  <button type="button" onClick={() => { navigate('/'); setMenuOpen(false) }}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <CommandPalette
        open={cmdOpen}
        onClose={handleCmdClose}
        items={searchItems}
        onSelect={onSearchSelect}
      />
    </div>
  )
}
