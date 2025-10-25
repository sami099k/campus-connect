import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { startRegister, verifyOtp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleStart = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await startRegister(form)
      setPreview(res.academicDetails)
      setStep(2)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await verifyOtp({ email: form.email, name: form.name, password: form.password, otp })
      navigate('/')
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 520 }}>
      <div className="card stack">
        <h2>Register</h2>
        {step === 1 ? (
          <form onSubmit={handleStart} className="stack">
            <label className="field">
              <div className="label">Name</div>
              <input className="input" name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label className="field">
              <div className="label">College Email</div>
              <input className="input" name="email" value={form.email} onChange={handleChange} type="email" required placeholder="you@student.nitw.ac.in" />
            </label>
            <label className="field">
              <div className="label">Password</div>
              <input className="input" name="password" value={form.password} onChange={handleChange} type="password" required />
            </label>
            <label className="field">
              <div className="label">Confirm Password</div>
              <input className="input" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} type="password" required />
            </label>
            {error ? <div style={{ color: 'crimson' }}>{error}</div> : null}
            <button className="btn primary" disabled={loading} type="submit">{loading ? 'Sending OTP…' : 'Send OTP'}</button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="stack">
            <p>We sent an OTP to <strong>{form.email}</strong>. Enter it below to create your account.</p>
            {preview ? (
              <div className="card" style={{ padding: 12 }}>
                <div><strong>Branch:</strong> {preview.branch}</div>
                <div><strong>Class:</strong> {preview.className}</div>
                <div><strong>Year:</strong> {preview.year}</div>
                <div><strong>Section:</strong> {preview.section}</div>
                <div><strong>Roll No:</strong> {preview.rollNumber}</div>
              </div>
            ) : null}
            <label className="field">
              <div className="label">OTP</div>
              <input
                className="input"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                title="Enter the 6-digit code"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                pattern="[0-9]{6}"
                maxLength={6}
              />
            </label>
            {error ? <div style={{ color: 'crimson' }}>{error}</div> : null}
            <button className="btn primary" disabled={loading} type="submit">{loading ? 'Verifying…' : 'Verify & Create Account'}</button>
          </form>
        )}
        <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  )
}
