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
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%' }}>
        <Link to="/" style={{ display: 'inline-block', marginBottom: '1rem', fontSize: '0.9rem' }}>← Home</Link>
        <h2 style={{ margin: '0 0 0.5rem' }}>Admin Portal</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>Enter the admin passcode to continue</p>
        <form onSubmit={handleSubmit}>
          <label className="label" htmlFor="passcode">Passcode</label>
          <input
            id="passcode"
            type="password"
            placeholder="Passcode"
            value={passcode}
            onChange={(e) => { setPasscode(e.target.value); setError('') }}
            autoFocus
          />
          {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
          <button type="submit" className="primary" style={{ marginTop: '1rem', width: '100%' }}>Enter</button>
        </form>
      </div>
    </div>
  )
}
