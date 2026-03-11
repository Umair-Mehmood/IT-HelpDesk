import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/how-to-use', label: 'How to Use' },
  { to: '/vibe-code-prompt', label: 'Vibe Code Prompt' },
  { to: '/sheet-ninja', label: 'Data Dictionary' },
  { to: '/workflow', label: 'Problem & Solution' },
]

export default function Layout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="platform-layout">
      <header className="platform-header">
        <div className="platform-header-inner">
          <Link to="/" className="platform-logo-wrap" onClick={() => setMenuOpen(false)}>
            <img src="/it-helpdesk-logo.svg" alt="" className="platform-logo-img" />
            <span className="platform-logo">IT Help Desk</span>
          </Link>
          <button
            type="button"
            className="platform-menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <nav className={`platform-nav ${menuOpen ? 'is-open' : ''}`}>
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`platform-nav-link ${location.pathname === to ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="platform-powered-wrap">
            <img src="/sheet-ninja-logo.svg" alt="" className="platform-powered-logo" />
            <span className="platform-powered-text">Powered by Sheet Ninja</span>
          </div>
        </div>
      </header>
      <main className="platform-main">
        <Outlet />
      </main>
      <footer className="platform-footer">
        <div className="platform-footer-inner">
          <img src="/sheet-ninja-logo.svg" alt="" className="platform-footer-logo" />
          <span>Powered by Sheet Ninja</span>
          <span className="platform-footer-sep">·</span>
          <span>Developed by Umair Mehmood</span>
          <a href="https://www.linkedin.com/in/umair-mehmood-357018a8" target="_blank" rel="noopener noreferrer" className="platform-footer-linkedin" aria-label="LinkedIn profile of Umair Mehmood">
            <LinkedInIcon />
          </a>
          <span className="platform-footer-sep">·</span>
          <Link to="/workflow">Problem & Solution</Link>
          <span className="platform-footer-sep">·</span>
          <Link to="/how-to-use">How to Use</Link>
          <span className="platform-footer-sep">·</span>
          <Link to="/sheet-ninja">Data Dictionary</Link>
          <span className="platform-footer-sep">·</span>
          <Link to="/vibe-code-prompt">Vibe Code Prompt</Link>
        </div>
      </footer>
    </div>
  )
}
