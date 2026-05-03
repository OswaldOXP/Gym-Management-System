import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useGymData } from '../context/GymDataContext'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  UsersIcon,
  CheckIcon,
  CardIcon,
  CalendarIcon,
  FireIcon,
  DumbbellIcon,
  WarningIcon,
  ShieldIcon,
} from '../components/ModernIcons'
import './Dashboard.css'

const memberGrowth = [
  { month: 'Aug', members: 880 },
  { month: 'Sep', members: 940 },
  { month: 'Oct', members: 985 },
  { month: 'Nov', members: 1020 },
  { month: 'Dec', members: 1080 },
  { month: 'Jan', members: 1150 },
  { month: 'Feb', members: 1200 },
]

const revenueData = [
  { month: 'Aug', revenue: 52000 },
  { month: 'Sep', revenue: 58000 },
  { month: 'Oct', revenue: 61000 },
  { month: 'Nov', revenue: 67000 },
  { month: 'Dec', revenue: 71000 },
  { month: 'Jan', revenue: 74000 },
  { month: 'Feb', revenue: 79000 },
]

const tooltipStyle = {
  contentStyle: { background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.3)', zIndex: 1000, pointerEvents: 'none' },
  labelStyle: { color: '#888', fontSize: 12 },
  itemStyle: { color: '#f0f0f0', fontSize: 13 },
  wrapperStyle: { outline: 'none', pointerEvents: 'none' },
}

export default function Dashboard() {
  const { user } = useAuth()
  const { members, attendance, payments, sessions, subscriptions } = useGymData()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const today = new Date().toISOString().split('T')[0]

  const todayAttendance = attendance.filter(record => record.date === today)
  const paidRevenue = payments
    .filter(payment => payment.status === 'paid')
    .reduce((total, payment) => total + Number(payment.amount || 0), 0)
  const expiringSoon = subscriptions.filter(subscription => subscription.status === 'expiring').length
  const mySessions = sessions.filter(session => session.member === user?.name || session.trainer === user?.name)
  const mySubscription = subscriptions.find(subscription => subscription.member === user?.name)
  const checkedInNow = todayAttendance.filter(record => !record.checkOut).length
  const todayRevenue = payments
    .filter(payment => payment.date === today && payment.status === 'paid')
    .reduce((total, payment) => total + Number(payment.amount || 0), 0)
  const checkInRate = members.length ? Math.round((todayAttendance.length / members.length) * 100) : 0
  const safeCheckInRate = Math.max(0, Math.min(checkInRate, 100))

  const adminOverview = [
    {
      label: 'Total Members',
      value: String(members.length),
      change: `${members.filter(member => member.status === 'active').length} active`,
      icon: <UsersIcon />,
    },
    {
      label: 'Check-Ins Today',
      value: String(todayAttendance.length),
      change: `${checkedInNow} in gym now`,
      icon: <CheckIcon />,
    },
    {
      label: 'Revenue Today',
      value: `AED ${todayRevenue.toLocaleString()}`,
      change: `AED ${paidRevenue.toLocaleString()} total paid`,
      icon: <CardIcon />,
    },
    {
      label: 'Expiring Soon',
      value: String(expiringSoon),
      change: 'Renewals needed',
      icon: <WarningIcon />,
    },
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

  const memberOverviewRows = [
    { label: 'Members', value: members.length },
    { label: 'Check-Ins', value: todayAttendance.length },
    { label: 'Revenue', value: `AED ${todayRevenue.toLocaleString()}` },
    { label: 'Expiring', value: expiringSoon },
  ]

  return (
    <div className="dashboard">
      {isAdmin ? (
        <>
          <div className="dashboard-hero dashboard-hero-compact">
            <div>
              <p className="dashboard-kicker">Admin command center</p>
              <h2>Dashboard</h2>
              <p>Overview only. Open Reports for full operational details.</p>
            </div>
            <button className="btn btn-primary dashboard-hero-btn" onClick={() => navigate('/reports')}>
              <ShieldIcon size={16} />
              Reports
            </button>
          </div>

          <div className="stats-grid dashboard-stats-grid">
            {adminOverview.map(card => (
              <div
                key={card.label}
                className="stat-card dashboard-stat-card dashboard-clickable-card"
                onClick={() => navigate('/reports')}
                style={{ cursor: 'pointer' }}
              >
                <div className="stat-icon">{card.icon}</div>
                <div className="stat-label">{card.label}</div>
                <div className="stat-value">{card.value}</div>
                <div className="stat-change">{card.change}</div>
              </div>
            ))}
          </div>

          <div className="dashboard-overview-grid">
            <div className="card dashboard-ring-card dashboard-clickable-card" onClick={() => navigate('/reports')}>
              <div className="section-head">
                <h4>Gym Overview</h4>
                <span className="badge badge-accent">Overview</span>
              </div>

              <div className="overview-ring-row">
                <div className="overview-ring-ring">
                  <div
                    className="overview-ring-shell"
                    style={{
                      background: `conic-gradient(var(--accent) 0 ${safeCheckInRate}%, rgba(255,255,255,0.08) ${safeCheckInRate}% 100%)`,
                    }}
                  >
                    <div className="overview-ring-inner">
                      <span className="ring-number">{todayAttendance.length}</span>
                      <span className="ring-label">Check-Ins</span>
                    </div>
                  </div>
                </div>

                <div className="overview-ring-metrics">
                  {memberOverviewRows.map(item => (
                    <div key={item.label} className="overview-mini-metric">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card dashboard-mini-bars dashboard-clickable-card" onClick={() => navigate('/reports')}>
              <div className="section-head">
                <h4>Weekly Snapshot</h4>
                <span className="badge badge-info">Reports</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    {...tooltipStyle}
                    cursor={{ fill: 'rgba(124,255,73,0.08)' }}
                    formatter={value => [`AED ${Number(value).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#7CFF49"
                    activeBar={{ fill: '#95ff6a', stroke: '#b3ff8f', strokeWidth: 1 }}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="dashboard-hero dashboard-hero-simple">
            <div>
              <p className="dashboard-kicker">Welcome back</p>
              <h2>
                Good {getGreeting()}, <span className="accent">{user?.name?.split(' ')[0]}</span>
              </h2>
              <p>Your training status at a glance.</p>
            </div>
          </div>

          <div className="dashboard-quick-actions">
            <button onClick={() => navigate('/workouts')} className="btn btn-outline"><DumbbellIcon /> Workouts</button>
            <button onClick={() => navigate('/booking')} className="btn btn-outline"><CalendarIcon /> Book Session</button>
            <button onClick={() => navigate('/plans')} className="btn btn-outline"><CardIcon /> View Plans</button>
            <button onClick={() => navigate('/attendance')} className="btn btn-outline"><CheckIcon /> Attendance</button>
          </div>

          <div className="stats-grid dashboard-stats-grid dashboard-stats-grid-simple">
            <div className="stat-card" onClick={() => navigate('/attendance')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon"><CheckIcon /></div>
              <div className="stat-label">Days Attended</div>
              <div className="stat-value">{String(attendance.filter(record => record.member === user?.name && record.date?.slice(0, 7) === today.slice(0, 7)).length)}</div>
              <div className="stat-change">This month</div>
            </div>
            <div className="stat-card" onClick={() => navigate('/booking')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon"><CalendarIcon /></div>
              <div className="stat-label">Sessions Booked</div>
              <div className="stat-value">{String(mySessions.length)}</div>
              <div className="stat-change">Trainer sessions</div>
            </div>
            <div className="stat-card" onClick={() => navigate('/plans')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon"><CardIcon /></div>
              <div className="stat-label">Plan</div>
              <div className="stat-value">{mySubscription?.plan || 'Basic'}</div>
              <div className="stat-change">{mySubscription ? `Status: ${mySubscription.status}` : 'No active subscription'}</div>
            </div>
            <div className="stat-card" onClick={() => navigate('/payments')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon"><FireIcon /></div>
              <div className="stat-label">Pending Payments</div>
              <div className="stat-value">{String(payments.filter(payment => payment.member === user?.name && payment.status !== 'paid').length)}</div>
              <div className="stat-change">Keep billing up to date</div>
            </div>
          </div>

          <div className="dashboard-bottom dashboard-bottom-simple">
            <div className="card dashboard-compact-card">
              <div className="section-head">
                <h4>Recent Activity</h4>
                <button className="section-link" onClick={() => navigate('/reports')}>Reports</button>
              </div>
              <div className="activity-list">
                {recentActivity.slice(0, 4).map((a, i) => (
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

            <div className="card dashboard-compact-card">
              <div className="section-head">
                <h4>{user?.role === 'trainer' ? "Today's Sessions" : 'Next Sessions'}</h4>
                <button className="section-link" onClick={() => navigate('/booking')}>Book</button>
              </div>
              <div className="sessions-list">
                {upcomingSessions.slice(0, 4).map((s, i) => (
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
          </div>
        </>
      )}
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
