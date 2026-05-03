import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'
import { addNotification } from '../lib/notifications'

const AuthContext = createContext(null)

const USER_KEY = 'gym_user'
const TOKEN_KEY = 'gym_token'
const AUTH_CHANGED_EVENT = 'auth-changed'

function announceAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(false)

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

  const login = async (email, password) => {
    if (!apiOnline) return { success: false, error: 'Backend is offline. Start the API and try again.' }

    try {
      const result = await api.login(email, password)
      setUser(result.user)
      localStorage.setItem(USER_KEY, JSON.stringify(result.user))
      localStorage.setItem(TOKEN_KEY, result.token)
      addNotification({
        title: 'Welcome Back',
        message: `Signed in as ${result.user.name}.`,
        type: 'info',
        link: '/dashboard',
      })
      announceAuthChanged()
      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const register = async (name, email, password) => {
    if (!apiOnline) return { success: false, error: 'Backend is offline. Start the API and try again.' }

    try {
      const result = await api.register(name, email, password)
      setUser(result.user)
      localStorage.setItem(USER_KEY, JSON.stringify(result.user))
      localStorage.setItem(TOKEN_KEY, result.token)
      addNotification({
        title: 'Account Created',
        message: `Welcome to IronCore, ${result.user.name}.`,
        type: 'success',
        link: '/dashboard',
      })
      announceAuthChanged()
      return { success: true, user: result.user }
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  const logout = () => {
    const currentName = user?.name || 'User'
    setUser(null)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(TOKEN_KEY)
    addNotification({
      title: 'Signed Out',
      message: `${currentName} has signed out.`,
      type: 'warning',
      link: '/login',
    })
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
