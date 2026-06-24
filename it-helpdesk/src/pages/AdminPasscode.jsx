import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ADMIN_PASSCODE } from '../config'

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
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-back">← Back to home</Link>
        <div className="auth-card__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>
        </div>
        <h1>Admin access</h1>
        <p className="auth-card__sub">Enter the admin passcode to access operations overview and workload management.</p>
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="passcode">Passcode</label>
          <input id="passcode" type="password" placeholder="Enter passcode" value={passcode} onChange={(e) => { setPasscode(e.target.value); setError('') }} autoFocus />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="btn btn--primary">Continue</button>
        </form>
      </div>
    </div>
  )
}
