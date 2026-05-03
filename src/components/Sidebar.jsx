import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import BrandMark from './BrandMark'
import './Sidebar.css'

const NAV_ITEMS = [
  { path: '/dashboard',  label: 'Dashboard',    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 10.5L12 3l9 7.5v8.5a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5z" fill="currentColor" />
      </svg>
    ), roles: ['admin','trainer','member'] },
  { path: '/workouts',   label: 'Workouts',     icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7h-2l-1 2-3 1-2-1-3 1-1-2H4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ), roles: ['admin','trainer','member'] },
  { path: '/booking',    label: 'Book Session', icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M16 2v4M8 2v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ), roles: ['admin','trainer','member'] },
  { path: '/plans',      label: 'Membership',   icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="7" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M3 11h18" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ), roles: ['admin','trainer','member'] },
  { path: '/attendance', label: 'Attendance',   icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ), roles: ['admin','trainer','member'] },
  { path: '/members',    label: 'Members',      icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11z" fill="currentColor" />
      </svg>
    ), roles: ['admin','trainer'] },
  { path: '/trainers',   label: 'Scheduling',   icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 11h10M7 15h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ), roles: ['admin','trainer'] },
  { path: '/payments',   label: 'Payments',     icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 10v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 13h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ), roles: ['admin'] },
  { path: '/reports',    label: 'Reports',      icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 14v4M14 9v9M19 6v13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ), roles: ['admin'] },
]

export default function Sidebar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role))

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <BrandMark />
      </div>

      {/* User info */}
      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="user-info">
          <p className="user-name">{user?.name}</p>
          <span className={`badge badge-${user?.role === 'admin' ? 'accent' : user?.role === 'trainer' ? 'info' : 'success'}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <p className="nav-section-label">Menu</p>
        {visibleItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}