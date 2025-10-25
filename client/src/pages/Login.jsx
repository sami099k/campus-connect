import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 420 }}>
      <div className="card stack">
        <h2>Login</h2>
        <form onSubmit={handleSubmit} className="stack">
          <label className="field">
            <div className="label">Email</div>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@student.nitw.ac.in" />
          </label>
          <label className="field">
            <div className="label">Password</div>
            <input className="input" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          {error ? <div style={{ color: 'crimson' }}>{error}</div> : null}
          <button className="btn primary" disabled={loading} type="submit">{loading ? 'Logging in…' : 'Login'}</button>
        </form>
        <p className="muted">No account? <Link to="/register">Register</Link></p>
      </div>
    </div>
  )
}
