import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function GlobalBackButton() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { pathname } = useLocation()

  const visibleRoutes = [
    '/dashboard',
    '/members',
    '/trainers',
    '/attendance',
    '/payments',
    '/reports',
    '/workouts',
    '/plans',
    '/booking',
    '/checkout',
  ]

  const isDetailRoute = pathname.startsWith('/workout/') || pathname.startsWith('/trainer/')
  const isVisible = visibleRoutes.includes(pathname) || isDetailRoute

  if (!isVisible || pathname === '/dashboard') return null

  const target = user ? '/dashboard' : '/login'

  return (
    <button className="global-back-btn" onClick={() => navigate(target)} aria-label="Back to dashboard">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span>Dashboard</span>
    </button>
  )
}