import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ADMIN_PASSCODE } from '../config'

function AdminIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export default function AdminPasscode() {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if ((passcode || '').trim().toUpperCase() === ADMIN_PASSCODE) {
      navigate('/admin/dashboard', { replace: true })
      return
    }
    setError('Incorrect passcode')
  }

  return (
    <div className="portal-page">
      <div className="portal-card">
        <Link to="/" className="portal-breadcrumb">← Back to Home</Link>
        <div className="portal-icon-wrap admin">
          <AdminIcon />
        </div>
        <h1 className="portal-title">Admin Portal</h1>
        <p className="portal-subtitle">Enter the admin passcode to access the full dashboard and manage all tickets.</p>
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="passcode">Passcode</label>
          <input
            id="passcode"
            type="password"
            placeholder={`Enter Passcode: ${ADMIN_PASSCODE}`}
            value={passcode}
            onChange={(e) => { setPasscode(e.target.value); setError('') }}
            autoFocus
          />
          {error && <p className="portal-error">{error}</p>}
          <button type="submit" className="primary">Enter</button>
        </form>
      </div>
    </div>
  )
}
