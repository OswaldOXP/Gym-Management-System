import { useState } from 'react'
import { useGymData } from '../context/GymDataContext'
import { CheckIcon, ChartIcon, CalendarIcon } from '../components/ModernIcons'

function fmtDuration(min) {
  if (!min) return '—'
  return `${Math.floor(min/60)}h ${min%60}m`
}

export default function AttendanceTracking() {
  const { attendance, members, checkInMember, checkOutMember } = useGymData()
  const [checkInName, setCheckInName] = useState('')
  const [dateFilter, setDateFilter]   = useState(new Date().toISOString().split('T')[0])
  const [toast, setToast] = useState(null)

  const today = new Date().toISOString().split('T')[0]

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCheckIn = async () => {
    if (!checkInName) return
    const result = await checkInMember(checkInName)
    if (!result.success) {
      showToast(result.error, 'info')
      return
    }
    showToast(`${checkInName} checked in at ${result.time}`)
    setCheckInName('')
  }

  const handleCheckOut = async (id) => {
    const now = await checkOutMember(id)
    showToast(`Member checked out at ${now}`)
  }

  const records = attendance
  const todayRecords    = records.filter(r => r.date === today)
  const filteredRecords = records.filter(r => r.date === dateFilter)
  const currentlyIn     = todayRecords.filter(r => !r.checkOut)

  return (
    <div>
      <div className="page-header">
        <h2>Attendance Tracking</h2>
        <p>Monitor daily check-ins and check-outs across all members.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
        <div className="stat-card">
          <div className="stat-icon"><CheckIcon size={18} /></div>
          <div className="stat-label">Currently In Gym</div>
          <div className="stat-value" style={{ color:'var(--accent)' }}>{currentlyIn.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CheckIcon size={18} /></div>
          <div className="stat-label">Today's Check-ins</div>
          <div className="stat-value">{todayRecords.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><ChartIcon size={18} /></div>
          <div className="stat-label">Avg. Session</div>
          <div className="stat-value">
            {fmtDuration(
              Math.round(records.filter(r=>r.duration).reduce((a,r)=>a+r.duration,0) /
              records.filter(r=>r.duration).length)
            )}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CalendarIcon size={18} /></div>
          <div className="stat-label">Weekly Check-ins</div>
          <div className="stat-value">{records.length}</div>
        </div>
      </div>

      {/* Quick Check-In Panel */}
      <div className="card" style={{ marginBottom:20 }}>
        <h4 style={{ marginBottom:14 }}>Quick Check-In</h4>
        <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
          <select className="form-select" style={{ flex:1, minWidth:200 }}
            value={checkInName} onChange={e => setCheckInName(e.target.value)}>
            <option value="">Select member…</option>
            {members.map(m => <option key={m.id}>{m.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={handleCheckIn}>Check In</button>
        </div>

        {/* Currently in gym */}
        {currentlyIn.length > 0 && (
          <div style={{ marginTop:16 }}>
            <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:10, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600 }}>
              Currently In Gym ({currentlyIn.length})
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {currentlyIn.map(r => (
                <div key={r.id} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'8px 12px' }}>
                  <span style={{ fontSize:'0.85rem', fontWeight:500 }}>{r.member}</span>
                  <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>since {r.checkIn}</span>
                  <button className="btn btn-sm" style={{ background:'var(--danger)', color:'#fff', border:'none', padding:'4px 10px' }}
                    onClick={() => handleCheckOut(r.id)}>
                    Check Out
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="toolbar">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <label className="form-label" style={{ margin:0 }}>Date:</label>
          <input className="form-input" type="date" value={dateFilter} style={{ width:'auto' }}
            onChange={e => setDateFilter(e.target.value)} />
        </div>
        <div style={{ flex:1 }} />
        <span className="muted" style={{ fontSize:'0.85rem' }}>{filteredRecords.length} records</span>
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Date</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>No records for this date.</td></tr>
              )}
              {filteredRecords.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight:500 }}>{r.member}</td>
                  <td style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{r.date}</td>
                  <td style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--success)' }}>{r.checkIn}</td>
                  <td style={{ fontFamily:'var(--font-display)', fontWeight:700, color: r.checkOut ? 'var(--danger)' : 'var(--text-dim)' }}>
                    {r.checkOut || '—'}
                  </td>
                  <td style={{ fontSize:'0.85rem' }}>{fmtDuration(r.duration)}</td>
                  <td>
                    <span className={`badge badge-${r.checkOut ? 'success' : 'warning'}`}>
                      {r.checkOut ? 'Completed' : 'In Gym'}
                    </span>
                  </td>
                  <td>
                    {!r.checkOut && (
                      <button className="btn btn-sm btn-outline" onClick={() => handleCheckOut(r.id)}>Check Out</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            {toast.type === 'success' ? 'OK' : 'INFO'} {toast.msg}
          </div>
        </div>
      )}
    </div>
  )
}
