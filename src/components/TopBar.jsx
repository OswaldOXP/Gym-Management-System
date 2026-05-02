import { useLocation } from 'react-router-dom'
import { BellIcon } from './ModernIcons'
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
  const { pathname } = useLocation()
  const info = PAGE_TITLES[pathname] || { title: 'IronCore', sub: '' }
  const now = new Date().toLocaleDateString('en-AE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">{info.title}</h1>
        <span className="topbar-sub">{info.sub}</span>
      </div>
      <div className="topbar-right">
        <span className="topbar-date">{now}</span>
        <div className="topbar-notif">
          <BellIcon size={18} />
          <span className="notif-dot"></span>
        </div>
      </div>
    </header>
  )
}
