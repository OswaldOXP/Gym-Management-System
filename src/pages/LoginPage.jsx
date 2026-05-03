import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandMark from '../components/BrandMark'
import './AuthPages.css'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) { setError('Fill in all fields.'); return }
    setLoading(true)
    const res = await login(form.email, form.password)
    if (res.success) {
      navigate('/dashboard')
      return
    }
    setError(res.error)
    setLoading(false)
  }

  const fillDemo = role => {
    const creds = {
      admin:   { email: 'admin@ironcore.com' },
      trainer: { email: 'trainer@ironcore.com' },
      member:  { email: 'member@ironcore.com' },
    }
    setForm(current => ({ ...current, ...creds[role], password: '' }))
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <Link to="/" className="auth-logo">
            <BrandMark />
          </Link>
          <h1>Welcome<br /><span className="accent">back.</span></h1>
          <p>Log in to access your gym management dashboard.</p>
          <div className="auth-left-stats">
            <div><strong>1,200+</strong><span>Members</span></div>
            <div><strong>40+</strong><span>Trainers</span></div>
            <div><strong>98%</strong><span>Satisfaction</span></div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap slide-up">
          <h2>Sign In</h2>
          <p className="auth-sub">Enter your credentials below</p>

          {/* Demo shortcuts */}
          <div className="demo-shortcuts">
            <p className="demo-label">Quick demo email:</p>
            <div className="demo-btns">
              {['admin','trainer','member'].map(r => (
                <button key={r} className="btn btn-ghost btn-sm" onClick={() => fillDemo(r)}>{r}</button>
              ))}
            </div>
          </div>

          <form onSubmit={submit} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email"
                placeholder="you@ironcore.com" value={form.email} onChange={handle} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password"
                placeholder="••••••••" value={form.password} onChange={handle} />
            </div>
            <button className="btn btn-primary" type="submit" style={{width:'100%'}} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup" className="accent">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
