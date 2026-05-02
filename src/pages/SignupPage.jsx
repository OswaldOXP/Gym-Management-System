import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandMark from '../components/BrandMark'
import './AuthPages.css'

export default function SignupPage() {
  const { register } = useAuth()
  const navigate      = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setLoading(true)
    const res = await register(form.name, form.email, form.password)
    if (res.success) {
      navigate('/dashboard')
      return
    }
    setError(res.error)
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">
            <BrandMark />
          </Link>
          <h1>Join the<br /><span className="accent">IronCore</span><br />family.</h1>
          <p>Start your fitness journey today with access to world-class trainers and facilities.</p>
          <ul className="auth-perks">
            <li>✓ Access to all gym equipment</li>
            <li>✓ Member dashboard & progress tracking</li>
            <li>✓ Trainer scheduling</li>
            <li>✓ Flexible subscription plans</li>
          </ul>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap slide-up">
          <h2>Create Account</h2>
          <p className="auth-sub">Free to register — upgrade your plan anytime</p>

          <form onSubmit={submit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" name="name"
                placeholder="John Smith" value={form.name} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email"
                placeholder="you@example.com" value={form.email} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password"
                placeholder="Min. 6 characters" value={form.password} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" name="confirm"
                placeholder="Repeat password" value={form.confirm} onChange={handle} />
            </div>
            <button className="btn btn-primary" type="submit" style={{width:'100%'}} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch">
            Already a member? <Link to="/login" className="accent">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
