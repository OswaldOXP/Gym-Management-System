import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BellIcon, SearchIcon } from './ModernIcons'
import { useAuth } from '../context/AuthContext'
import {
  clearNotifications,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationChangeEvent,
} from '../lib/notifications'
import './TopBar.css'

const PAGE_TITLES = {
  '/dashboard':  { title: 'Dashboard',          sub: 'Welcome back' },
  '/members':    { title: 'Members',            sub: 'Manage gym members' },
  '/trainers':   { title: 'Trainer Scheduling', sub: 'Sessions & availability' },
  '/plans':      { title: 'Subscription Plans', sub: 'Membership tiers' },
  '/attendance': { title: 'Attendance',         sub: 'Check-in tracking' },
  '/workouts':   { title: 'Workout Plans',      sub: 'Programs & exercises' },
  '/payments':   { title: 'Payments',           sub: 'Billing & invoices' },
  '/reports':    { title: 'Reports & Analytics',sub: 'Data insights' },
  '/booking':    { title: 'Book Session',       sub: 'Trainer appointment flow' },
  '/checkout':   { title: 'Checkout',           sub: 'Complete payment' },
  '/about':      { title: 'About',              sub: 'Gym story and values' },
  '/contact':    { title: 'Contact',            sub: 'Talk to the team' },
}

export default function TopBar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const panelRef = useRef(null)
  const profileRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => getNotifications())

  const refreshNotifications = () => setNotifications(getNotifications())

  useEffect(() => {
    refreshNotifications()
    const onChange = () => refreshNotifications()
    window.addEventListener(notificationChangeEvent, onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener(notificationChangeEvent, onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const onPointerDown = event => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [open])

  useEffect(() => {
    if (!profileOpen) return
    const onPointerDown = event => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false)
      }
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [profileOpen])

  useEffect(() => {
    if (!open) return
    const unread = notifications.some(notification => !notification.read)
    if (unread) {
      markAllNotificationsRead()
      refreshNotifications()
    }
  }, [open, notifications])

  const unreadCount = useMemo(
    () => notifications.filter(notification => !notification.read).length,
    [notifications],
  )

  const isDashboard = pathname === '/dashboard'
  const info = PAGE_TITLES[pathname] || { title: 'IronCore', sub: '' }
  const now = new Date().toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const openNotification = notification => {
    markNotificationRead(notification.id)
    refreshNotifications()
    if (notification.link) {
      navigate(notification.link)
      setOpen(false)
    }
  }

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  const renderProfile = () => (
    <div className="topbar-profile-wrap" ref={profileRef}>
      <button className="topbar-profile" type="button" onClick={() => setProfileOpen(prev => !prev)}>
        <div className="topbar-profile-meta">
          <strong>{user?.name?.split(' ')[0] || 'Admin'}</strong>
          <span>{user?.role || 'member'}</span>
        </div>
        <div className="topbar-profile-avatar">{user?.name?.charAt(0) || 'A'}</div>
      </button>

      {profileOpen && (
        <div className="topbar-profile-menu">
          <button type="button" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  )

  return (
    <header className="topbar">
      {isDashboard ? (
        <>
          <div className="topbar-search-wrap">
            <SearchIcon size={18} className="topbar-search-icon" />
            <input className="topbar-search" type="text" placeholder="Search" aria-label="Search" />
          </div>

          <div className="topbar-right topbar-right-dashboard">
            <div className="topbar-toolgroup">
              <span className="topbar-clock">{now}</span>
              <button className="topbar-tool-btn" type="button" aria-label="Settings">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M4.5 12h2m11 0h2M12 4.5v2m0 11v2M6.3 6.3l1.4 1.4m8.6 8.6 1.4 1.4M17.7 6.3l-1.4 1.4M8.3 15.7l-1.4 1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {renderProfile()}

            <div className="topbar-notif-wrap" ref={panelRef}>
              <button
                className="topbar-notif"
                aria-label="Open notifications"
                onClick={() => setOpen(prev => !prev)}
              >
                <BellIcon size={18} />
                {unreadCount > 0 && <span className="notif-dot" />}
                {unreadCount > 0 && <span className="notif-count">{Math.min(unreadCount, 9)}{unreadCount > 9 ? '+' : ''}</span>}
              </button>

              {open && (
                <div className="notif-panel">
                  <div className="notif-panel-header">
                    <h4>Notifications</h4>
                    <div className="notif-actions">
                      <button type="button" onClick={() => { markAllNotificationsRead(); refreshNotifications() }}>Mark all read</button>
                      <button type="button" onClick={() => { clearNotifications(); refreshNotifications() }}>Clear</button>
                    </div>
                  </div>

                  <div className="notif-list">
                    {notifications.length ? notifications.map(notification => (
                      <button
                        key={notification.id}
                        type="button"
                        className={`notif-item notif-${notification.type} ${notification.read ? 'is-read' : ''}`}
                        onClick={() => openNotification(notification)}
                      >
                        <div className="notif-item-head">
                          <strong>{notification.title}</strong>
                          <span>{new Date(notification.createdAt).toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p>{notification.message}</p>
                      </button>
                    )) : (
                      <div className="notif-empty">
                        <p>No notifications yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="topbar-left">
            <h1 className="topbar-title">{info.title}</h1>
            <span className="topbar-sub">{info.sub}</span>
          </div>
          <div className="topbar-right">
            <span className="topbar-date">{now}</span>
            {renderProfile()}
            <div className="topbar-notif-wrap" ref={panelRef}>
              <button
                className="topbar-notif"
                aria-label="Open notifications"
                onClick={() => setOpen(prev => !prev)}
              >
                <BellIcon size={18} />
                {unreadCount > 0 && <span className="notif-dot" />}
                {unreadCount > 0 && <span className="notif-count">{Math.min(unreadCount, 9)}{unreadCount > 9 ? '+' : ''}</span>}
              </button>

              {open && (
                <div className="notif-panel">
                  <div className="notif-panel-header">
                    <h4>Notifications</h4>
                    <div className="notif-actions">
                      <button type="button" onClick={() => { markAllNotificationsRead(); refreshNotifications() }}>Mark all read</button>
                      <button type="button" onClick={() => { clearNotifications(); refreshNotifications() }}>Clear</button>
                    </div>
                  </div>

                  <div className="notif-list">
                    {notifications.length ? notifications.map(notification => (
                      <button
                        key={notification.id}
                        type="button"
                        className={`notif-item notif-${notification.type} ${notification.read ? 'is-read' : ''}`}
                        onClick={() => openNotification(notification)}
                      >
                        <div className="notif-item-head">
                          <strong>{notification.title}</strong>
                          <span>{new Date(notification.createdAt).toLocaleTimeString('en-AE', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p>{notification.message}</p>
                      </button>
                    )) : (
                      <div className="notif-empty">
                        <p>No notifications yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  )
}
