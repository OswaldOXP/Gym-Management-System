import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

const STORAGE_KEY = 'gym_users'
const USER_KEY = 'gym_user'
const TOKEN_KEY = 'gym_token'
const AUTH_CHANGED_EVENT = 'auth-changed'
const MEMBERS_KEY = 'gym_members'

function announceAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

function addMemberSnapshotFromSignup({ name, email }) {
  const raw = localStorage.getItem(MEMBERS_KEY)
  let members = []
  try {
    members = raw ? JSON.parse(raw) : []
  } catch {
    members = []
  }

  if (!Array.isArray(members)) members = []
  if (members.some(member => member.email === email)) return

  const now = new Date()
  const joined = now.toISOString().split('T')[0]
  const expiryDate = new Date(now)
  expiryDate.setMonth(expiryDate.getMonth() + 1)
  const expiry = expiryDate.toISOString().split('T')[0]

  members.unshift({
    id: Date.now(),
    name,
    email,
    phone: '',
    plan: 'Basic',
    status: 'pending',
    joined,
    expiry,
  })
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members))
}

const DEFAULT_USERS = [
  { id: 1, name: 'Admin User',    email: 'admin@ironcore.com',  password: 'admin123',  role: 'admin'   },
  { id: 2, name: 'John Trainer',  email: 'trainer@ironcore.com',password: 'train123',  role: 'trainer' },
  { id: 3, name: 'Sara Member',   email: 'member@ironcore.com', password: 'member123', role: 'member'  },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(false)
  const [users, setUsers] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_USERS
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return DEFAULT_USERS
    try {
      const parsed = JSON.parse(saved)
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_USERS
    } catch {
      return DEFAULT_USERS
    }
  })

  useEffect(() => {
    const saved = localStorage.getItem(USER_KEY)
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
    announceAuthChanged()
    setLoading(false)
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const health = await api.health()
        setApiOnline(Boolean(health?.ok))
      } catch {
        setApiOnline(false)
      }
    })()
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  }, [users])

  const login = async (email, password) => {
    if (apiOnline) {
      try {
        const result = await api.login(email, password)
        setUser(result.user)
        localStorage.setItem(USER_KEY, JSON.stringify(result.user))
        localStorage.setItem(TOKEN_KEY, result.token)
        announceAuthChanged()
        return { success: true, user: result.user }
      } catch (error) {
        return { success: false, error: error.message || 'Login failed' }
      }
    }

    const found = users.find(u => u.email === email && u.password === password)
    if (!found) return { success: false, error: 'Invalid email or password' }

    const { password: _, ...safeUser } = found
    setUser(safeUser)
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser))
    announceAuthChanged()
    return { success: true, user: safeUser }
  }

  const register = async (name, email, password) => {
    if (apiOnline) {
      try {
        const result = await api.register(name, email, password)
        setUser(result.user)
        localStorage.setItem(USER_KEY, JSON.stringify(result.user))
        localStorage.setItem(TOKEN_KEY, result.token)
        announceAuthChanged()
        return { success: true, user: result.user }
      } catch (error) {
        return { success: false, error: error.message || 'Registration failed' }
      }
    }

    const exists = users.find(u => u.email === email)
    if (exists) return { success: false, error: 'Email already registered' }
    const newUser = { id: Date.now(), name, email, role: 'member' }
    setUsers(current => [...current, { ...newUser, password }])
    setUser(newUser)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    addMemberSnapshotFromSignup({ name, email })
    announceAuthChanged()
    return { success: true, user: newUser }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    announceAuthChanged()
  }

  return (
    <AuthContext.Provider value={{ user, loading, apiOnline, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
