import { useState } from 'react'
import { useGymData } from '../context/GymDataContext'
import { CardIcon, UsersIcon, ChartIcon, WarningIcon } from '../components/ModernIcons'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts'

const memberData = [
  { month: 'Sep', new: 62, churned: 18, net: 44 },
  { month: 'Oct', new: 74, churned: 22, net: 52 },
  { month: 'Nov', new: 58, churned: 15, net: 43 },
  { month: 'Dec', new: 91, churned: 19, net: 72 },
  { month: 'Jan', new: 105, churned: 24, net: 81 },
  { month: 'Feb', new: 88, churned: 21, net: 67 },
  { month: 'Mar', new: 97, churned: 17, net: 80 },
]

const revenueData = [
  { month: 'Sep', basic: 22400, pro: 28000, elite: 8000 },
  { month: 'Oct', basic: 23800, pro: 30100, elite: 9200 },
  { month: 'Nov', basic: 21000, pro: 31500, elite: 9800 },
  { month: 'Dec', basic: 25200, pro: 35700, elite: 11200 },
  { month: 'Jan', basic: 27300, pro: 36800, elite: 11500 },
  { month: 'Feb', basic: 28100, pro: 38400, elite: 12000 },
  { month: 'Mar', basic: 29500, pro: 39800, elite: 12500 },
]

const planDistribution = [
  { name: 'Basic', value: 420, color: '#3b82f6' },
  { name: 'Pro',   value: 580, color: '#7CFF49' },
  { name: 'Elite', value: 200, color: '#a855f7' },
]

const attendanceData = [
  { day: 'Mon', checkins: 142 }, { day: 'Tue', checkins: 128 }, { day: 'Wed', checkins: 165 },
  { day: 'Thu', checkins: 134 }, { day: 'Fri', checkins: 172 }, { day: 'Sat', checkins: 198 },
  { day: 'Sun', checkins: 87 },
]

const tooltipStyle = {
  contentStyle: { background: '#1e1e1e', border: '1px solid #2a2a2a', borderRadius: 6, fontSize: 12 },
  labelStyle: { color: '#888' },
  itemStyle: { color: '#f0f0f0' },
}

const KPI_CARDS = [
  { label: 'Total Revenue (YTD)',  value: 'AED 487,000', change: '+28.4%', up: true,  icon: <CardIcon /> },
  { label: 'Net New Members (YTD)',value: '439',          change: '+14.2%', up: true,  icon: <UsersIcon /> },
  { label: 'Avg. Churn Rate',      value: '1.9%/mo',     change: '-0.3%',  up: true,  icon: <WarningIcon /> },
  { label: 'Revenue / Member',     value: 'AED 266',     change: '+8.1%',  up: true,  icon: <ChartIcon /> },
]

export default function Reports() {
  const [period, setPeriod] = useState('7mo')
  const { members, payments, sessions, attendance } = useGymData()

  const totalRevenue = payments.filter(payment => payment.status === 'paid').reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const totalMembers = members.length
  const weeklyCheckins = attendance.length
  const activeSessions = sessions.filter(session => session.status !== 'cancelled').length

  return (
    <div>
      <div className="page-header" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <h2>Reports & Analytics</h2>
          <p>Key performance metrics and data insights.</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['7mo','30d','90d'].map(p => (
            <button key={p} className={`btn btn-sm ${period===p ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setPeriod(p)}>
              {p === '7mo' ? '7 Months' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
          {KPI_CARDS.map(k => (
          <div key={k.label} className="stat-card">
            <div className="stat-icon">{k.icon}</div>
            <div className="stat-label">{k.label}</div>
            <div className="stat-value" style={{ fontSize:'1.4rem' }}>{k.value}</div>
            <div className={`stat-change ${k.up ? '' : 'down'}`}>{k.change} vs prior period</div>
          </div>
        ))}
      </div>

      <div className="stats-grid" style={{ marginBottom:24 }}>
        <div className="stat-card"><div className="stat-label">Current Members</div><div className="stat-value" style={{ fontSize:'1.4rem' }}>{totalMembers}</div></div>
        <div className="stat-card"><div className="stat-label">Active Sessions</div><div className="stat-value" style={{ fontSize:'1.4rem' }}>{activeSessions}</div></div>
        <div className="stat-card"><div className="stat-label">Check-ins Logged</div><div className="stat-value" style={{ fontSize:'1.4rem' }}>{weeklyCheckins}</div></div>
        <div className="stat-card"><div className="stat-label">Real Paid Revenue</div><div className="stat-value" style={{ fontSize:'1.4rem' }}>AED {totalRevenue.toLocaleString()}</div></div>
      </div>

      {/* Revenue Stacked */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h4>Revenue by Plan (AED)</h4>
          <span className="badge badge-success">+51.9% YTD</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="month" tick={{ fill:'#888', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#888', fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} formatter={v => [`AED ${v.toLocaleString()}`, '']} />
            <Legend wrapperStyle={{ fontSize:12, color:'#888' }} />
            <Bar dataKey="basic" name="Basic" stackId="a" fill="#3b82f6" />
            <Bar dataKey="pro"   name="Pro"   stackId="a" fill="#7CFF49" />
            <Bar dataKey="elite" name="Elite" stackId="a" fill="#a855f7" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        {/* Member Growth */}
        <div className="card">
          <h4 style={{ marginBottom:16 }}>Member Growth</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={memberData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="month" tick={{ fill:'#888', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#888', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Legend wrapperStyle={{ fontSize:12, color:'#888' }} />
              <Line type="monotone" dataKey="new"     name="New"     stroke="#22c55e" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="churned" name="Churned" stroke="#ef4444" strokeWidth={2} dot={false} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="net"     name="Net"     stroke="#7CFF49" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution Pie */}
        <div className="card">
          <h4 style={{ marginBottom:16 }}>Member Distribution by Plan</h4>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                  dataKey="value" paddingAngle={3}>
                  {planDistribution.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
              {planDistribution.map(p => (
                <div key={p.name} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ width:10, height:10, borderRadius:'50%', background:p.color, flexShrink:0 }} />
                  <span style={{ fontSize:'0.85rem', flex:1 }}>{p.name}</span>
                  <span style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>{p.value}</span>
                  <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
                    ({Math.round(p.value/1200*100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Heatmap */}
      <div className="card">
        <h4 style={{ marginBottom:16 }}>Weekly Attendance Pattern</h4>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={attendanceData}>
            <defs>
                <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7CFF49" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#7CFF49" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis dataKey="day" tick={{ fill:'#888', fontSize:11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill:'#888', fontSize:11 }} axisLine={false} tickLine={false} />
            <Tooltip {...tooltipStyle} formatter={v => [v, 'Check-ins']} />
            <Area type="monotone" dataKey="checkins" stroke="#7CFF49" fill="url(#attGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:12, paddingTop:12, borderTop:'1px solid var(--border)' }}>
          {[['Busiest Day', 'Saturday'], ['Quietest Day', 'Sunday'], ['Daily Average', '146 check-ins'], ['Peak Time', '6:00–9:00 AM']].map(([k,v]) => (
            <div key={k} style={{ textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem' }}>{v}</div>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{k}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
