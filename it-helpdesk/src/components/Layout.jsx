import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'

const LINKEDIN_URL = 'https://www.linkedin.com/in/umairbuildsai'
const INSTAGRAM_URL = 'https://www.instagram.com/umairbuildsai'

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
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
          <div className="platform-social-wrap">
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="platform-social-link" aria-label="LinkedIn profile of Umair Mehmood">
              <LinkedInIcon />
              <span>Umair Mehmood</span>
            </a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="platform-social-link" aria-label="Instagram @umairbuildsai">
              <InstagramIcon />
              <span>@umairbuildsai</span>
            </a>
          </div>
        </div>
      </header>
      <main className="platform-main">
        <Outlet />
      </main>
      <footer className="platform-footer">
        <div className="platform-footer-inner">
          <span>Developed by Umair Mehmood</span>
          <span className="platform-footer-sep">·</span>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="platform-social-link platform-social-link--footer" aria-label="LinkedIn profile of Umair Mehmood">
            <LinkedInIcon />
            <span>Umair Mehmood</span>
          </a>
          <span className="platform-footer-sep">·</span>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="platform-social-link platform-social-link--footer" aria-label="Instagram @umairbuildsai">
            <InstagramIcon />
            <span>@umairbuildsai</span>
          </a>
          <span className="platform-footer-sep">·</span>
          <Link to="/how-to-use">How to Use</Link>
        </div>
      </footer>
    </div>
  )
}
