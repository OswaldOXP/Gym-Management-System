import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGymData } from '../context/GymDataContext'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { UsersIcon, CheckIcon, CardIcon, WarningIcon, DumbbellIcon, CalendarIcon, FireIcon } from '../components/ModernIcons'
import './Dashboard.css'

const memberGrowth = [
  { month: 'Aug', members: 880 }, { month: 'Sep', members: 940 }, { month: 'Oct', members: 985 },
  { month: 'Nov', members: 1020 }, { month: 'Dec', members: 1080 }, { month: 'Jan', members: 1150 },
  { month: 'Feb', members: 1200 },
]
const revenueData = [
  { month: 'Aug', revenue: 52000 }, { month: 'Sep', revenue: 58000 }, { month: 'Oct', revenue: 61000 },
  { month: 'Nov', revenue: 67000 }, { month: 'Dec', revenue: 71000 }, { month: 'Jan', revenue: 74000 },
  { month: 'Feb', revenue: 79000 },
]
const tooltipStyle = {
  contentStyle: { background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 6 },
  labelStyle: { color: '#888', fontSize: 12 },
  itemStyle: { color: '#f0f0f0', fontSize: 13 },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { members, attendance, payments, sessions, subscriptions } = useGymData()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const today = new Date().toISOString().split('T')[0]

  const todayAttendance = attendance.filter(record => record.date === today)
  const paidRevenue = payments.filter(payment => payment.status === 'paid').reduce((total, payment) => total + Number(payment.amount || 0), 0)
  const expiringSoon = subscriptions.filter(subscription => subscription.status === 'expiring').length
  const mySessions = sessions.filter(session => session.member === user?.name || session.trainer === user?.name)
  const mySubscription = subscriptions.find(subscription => subscription.member === user?.name)

  const stats = isAdmin ? [
    { label: 'Total Members', value: String(members.length), change: `${members.filter(member => member.status === 'active').length} active`, icon: <UsersIcon />, up: true, link: '/members' },
    { label: 'Active Today', value: String(todayAttendance.length), change: `${todayAttendance.filter(record => !record.checkOut).length} in gym now`, icon: <CheckIcon />, up: true, link: '/attendance' },
    { label: 'Monthly Revenue', value: `AED ${paidRevenue.toLocaleString()}`, change: `${payments.filter(payment => payment.status === 'paid').length} paid invoices`, icon: <CardIcon />, up: true, link: '/payments' },
    { label: 'Expiring Soon', value: String(expiringSoon), change: 'Needs renewal follow-up', icon: <WarningIcon />, up: expiringSoon === 0, link: '/plans' },
  ] : [
    { label: 'Days Attended', value: String(attendance.filter(record => record.member === user?.name && record.date?.slice(0, 7) === today.slice(0, 7)).length), change: 'This month', icon: <CheckIcon />, up: true, link: '/attendance' },
    { label: 'Sessions Booked', value: String(mySessions.length), change: 'Trainer sessions', icon: <CalendarIcon />, up: true, link: '/booking' },
    { label: 'Plan', value: mySubscription?.plan || 'Basic', change: mySubscription ? `Status: ${mySubscription.status}` : 'No active subscription', icon: <CardIcon />, up: Boolean(mySubscription), link: '/plans' },
    { label: 'Pending Payments', value: String(payments.filter(payment => payment.member === user?.name && payment.status !== 'paid').length), change: 'Keep billing up to date', icon: <FireIcon />, up: true, link: '/payments' },
  ]

  const recentActivity = [
    ...attendance.slice(-3).reverse().map(record => ({
      name: record.member,
      action: record.checkOut ? 'Completed a gym session' : 'Checked in',
      time: record.date === today ? `${record.checkIn}` : record.date,
      avatar: record.member?.charAt(0) || 'M',
      status: record.checkOut ? 'success' : 'info',
    })),
    ...payments.slice(-2).reverse().map(payment => ({
      name: payment.member,
      action: `Payment ${payment.status} (${payment.plan})`,
      time: payment.date,
      avatar: payment.member?.charAt(0) || 'P',
      status: payment.status === 'paid' ? 'success' : payment.status === 'overdue' ? 'danger' : 'warning',
    })),
  ].slice(0, 5)

  const upcomingSessions = sessions
    .filter(session => session.status !== 'cancelled')
    .slice(-5)
    .reverse()
    .map(session => ({
      trainer: session.trainer,
      member: session.member,
      time: session.time,
      type: session.type,
    }))

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="page-header">
        <h2>Good {getGreeting()}, <span className="accent">{user?.name?.split(' ')[0]}</span></h2>
        <p>Here's what's happening at IronCore today.</p>
      </div>

      {/* Quick Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate('/workouts')} className="btn btn-outline"><DumbbellIcon /> Workouts</button>
        <button onClick={() => navigate('/booking')} className="btn btn-outline"><CalendarIcon /> Book Session</button>
        <button onClick={() => navigate('/plans')} className="btn btn-outline"><CardIcon /> View Plans</button>
        <button onClick={() => navigate('/attendance')} className="btn btn-outline"><CheckIcon /> Attendance</button>
      </div>

      {/* Stat cards - now clickable */}
      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card" onClick={() => navigate(s.link)} style={{ cursor: 'pointer' }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-change ${s.up ? '' : 'down'}`}>{s.change}</div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="charts-grid">
          {/* Member Growth */}
          <div className="card chart-card">
            <div className="chart-header">
              <h4>Member Growth</h4>
              <span className="badge badge-success">+36% YTD</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={memberGrowth}>
                <defs>
                  <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#7CFF49" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#7CFF49" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="members" stroke="#7CFF49" fill="url(#memberGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue */}
          <div className="card chart-card">
            <div className="chart-header">
              <h4>Monthly Revenue (AED)</h4>
              <span className="badge badge-info">+51.9% YTD</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} formatter={v => [`AED ${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#7CFF49" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="dashboard-bottom">
        {/* Recent Activity */}
        <div className="card">
          <h4 style={{ marginBottom: 16 }}>Recent Activity</h4>
          <div className="activity-list">
            {recentActivity.map((a, i) => (
              <div key={i} className="activity-item">
                <div className="activity-avatar">{a.avatar}</div>
                <div className="activity-info">
                  <p className="activity-name">{a.name}</p>
                  <p className="activity-action">{a.action}</p>
                </div>
                <div className="activity-right">
                  <span className={`badge badge-${a.status}`}>{a.status === 'danger' ? 'Alert' : 'OK'}</span>
                  <span className="activity-time">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions */}
        {(isAdmin || user?.role === 'trainer') && (
          <div className="card">
            <h4 style={{ marginBottom: 16 }}>Today's Sessions</h4>
            <div className="sessions-list">
              {upcomingSessions.map((s, i) => (
                <div key={i} className="session-item">
                  <div className="session-time">{s.time}</div>
                  <div className="session-info">
                    <p className="session-member">{s.member}</p>
                    <p className="session-trainer">with {s.trainer}</p>
                  </div>
                  <span className="badge badge-accent">{s.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}