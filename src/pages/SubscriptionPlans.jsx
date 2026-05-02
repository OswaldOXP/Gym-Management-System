import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGymData } from '../context/GymDataContext'
import { useAuth } from '../context/AuthContext'

const PLANS = [
  {
    id: 1, name: 'Basic', price: 149, period: 'month',
    color: '#3b82f6',
    features: ['Full gym access', 'Locker room', 'Basic equipment', '2 group classes/month', 'Mobile app access'],
    members: 420, active: true,
  },
  {
    id: 2, name: 'Pro', price: 299, period: 'month',
    color: 'var(--accent)',
    features: ['All Basic features', '2 trainer sessions/month', 'Nutrition guide', 'Unlimited group classes', 'Body measurements', 'Priority support'],
    members: 580, active: true, popular: true,
  },
  {
    id: 3, name: 'Elite', price: 499, period: 'month',
    color: '#a855f7',
    features: ['All Pro features', 'Unlimited trainer sessions', 'Body composition analysis', 'Priority booking', 'Sauna & spa access', 'Guest passes (2/month)', '24/7 gym access'],
    members: 200, active: true,
  },
  {
    id: 4, name: 'Annual Basic', price: 1490, period: 'year',
    color: '#22c55e',
    features: ['All Basic features', '2 months free', 'Annual health check'],
    members: 85, active: true,
  },
]

export default function SubscriptionPlans() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState('plans')
  const { subscriptions, toggleSubscriptionRenewal, renewSubscription, cancelSubscription, setPendingPlanPurchase, attendance } = useGymData()
  const subs = subscriptions

  const toggleAutoRenew = id => toggleSubscriptionRenewal(id)

  const STATUS_COLOR = { active: 'success', expiring: 'warning', expired: 'danger' }
  const mySub = subs.find(subscription => subscription.member === user?.name)
  const monthlyAttendance = attendance.filter(record => record.member === user?.name && record.date?.slice(0, 7) === new Date().toISOString().slice(0, 7)).length
  const recommendedPlan = monthlyAttendance >= 16 ? 'Elite' : monthlyAttendance >= 8 ? 'Pro' : 'Basic'

  const choosePlan = plan => {
    setPendingPlanPurchase({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      period: plan.period,
      features: plan.features,
    })
    navigate('/checkout')
  }

  return (
    <div>
      <div className="page-header">
        <h2>Subscription Plans</h2>
        <p>View and manage membership tiers and individual subscriptions.</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'plans' ? 'active' : ''}`} onClick={() => setTab('plans')}>Plan Overview</button>
        <button className={`tab ${tab === 'subs'  ? 'active' : ''}`} onClick={() => setTab('subs')}>Member Subscriptions</button>
      </div>

      {/* PLANS TAB */}
      {tab === 'plans' && (
        <>
          {user?.role === 'member' && (
            <div className="card" style={{ marginBottom: 16, borderColor: 'var(--accent)' }}>
              <h4 style={{ marginBottom: 8 }}>Your Plan Advisor</h4>
              <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
                Based on your monthly attendance ({monthlyAttendance} visits), the best value plan is <strong>{recommendedPlan}</strong>.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className="badge badge-info">Current: {mySub?.plan || 'No Active Plan'}</span>
                {mySub?.status && <span className={`badge badge-${STATUS_COLOR[mySub.status] || 'warning'}`}>Status: {mySub.status}</span>}
              </div>
            </div>
          )}

          <div className="stats-grid" style={{ marginBottom:28 }}>
            <div className="stat-card">
              <div className="stat-label">Total Plans</div>
              <div className="stat-value">{PLANS.length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Subscribers</div>
              <div className="stat-value">{PLANS.reduce((a,p) => a+p.members, 0)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Most Popular</div>
              <div className="stat-value" style={{ color:'var(--accent)', fontSize:'1.4rem' }}>Pro</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Monthly Revenue</div>
              <div className="stat-value" style={{ fontSize:'1.4rem' }}>AED 79k</div>
            </div>
          </div>

          <div className="subscription-plan-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20 }}>
            {PLANS.map(p => (
              <div
                key={p.id}
                className={`card subscription-plan-card ${p.popular ? 'is-popular' : ''}`}
                style={{
                  '--plan-accent': p.color,
                  borderColor: p.popular ? p.color : 'var(--border)',
                  position:'relative',
                }}
              >
                {p.popular && (
                  <div className="subscription-plan-badge" style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', background:p.color, color:'#fff', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', padding:'4px 14px', borderRadius:20 }}>
                    Most Popular
                  </div>
                )}
                <div style={{ marginBottom:16 }}>
                  <h3 style={{ color: p.color, marginBottom:4 }}>{p.name}</h3>
                  <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                    <span style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>AED</span>
                    <span style={{ fontFamily:'var(--font-display)', fontSize:'2.4rem', fontWeight:800 }}>{p.price.toLocaleString()}</span>
                    <span style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>/{p.period}</span>
                  </div>
                </div>
                <ul style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display:'flex', gap:8, fontSize:'0.85rem', color:'var(--text-muted)' }}>
                      <span style={{ color:p.color }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderTop:'1px solid var(--border)', marginTop:'auto' }}>
                  <div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800 }}>{p.members}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Subscribers</div>
                  </div>
                  <span className={`badge badge-${p.active ? 'success' : 'danger'}`}>{p.active ? 'Active' : 'Inactive'}</span>
                </div>
                {user?.role === 'member' && (
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}
                    onClick={() => choosePlan(p)}
                  >
                    {mySub?.plan === p.name ? 'Renew This Plan' : `Choose ${p.name}`}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* MEMBER SUBSCRIPTIONS TAB */}
      {tab === 'subs' && (
        <div className="card" style={{ padding:0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Auto-Renew</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subs.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight:500 }}>{s.member}</td>
                    <td><span className="badge badge-accent">{s.plan}</span></td>
                    <td style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{s.start}</td>
                    <td style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{s.end}</td>
                    <td><span className={`badge badge-${STATUS_COLOR[s.status]}`}>{s.status}</span></td>
                    <td>
                      <button
                        onClick={() => toggleAutoRenew(s.id)}
                        style={{
                          width:40, height:22, borderRadius:11,
                          background: s.autoRenew ? 'var(--success)' : 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          position:'relative', transition:'background 0.2s',
                          cursor:'pointer',
                        }}
                      >
                        <span style={{
                          position:'absolute', top:2,
                          left: s.autoRenew ? 20 : 2,
                          width:16, height:16, borderRadius:'50%',
                          background:'#fff', transition:'left 0.2s',
                        }} />
                      </button>
                    </td>
                    <td>
                      <div style={{ display:'flex', gap:6 }}>
                        {s.status !== 'active' && (
                          <button className="btn btn-sm" style={{ background:'var(--success)', color:'#fff', border:'none' }}
                            onClick={() => renewSubscription(s.id)}>
                            Renew
                          </button>
                        )}
                        <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)' }}
                              onClick={() => cancelSubscription(s.id)}>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
