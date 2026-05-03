import { useMemo, useState } from 'react'
import { useGymData } from '../context/GymDataContext'
import { DumbbellIcon, FireIcon, CalendarIcon, SearchIcon, TrashIcon } from '../components/ModernIcons'
import './WorkoutPlans.css'

const LEVEL_COLOR = { 'Beginner': 'success', 'Intermediate': 'warning', 'Advanced': 'danger', 'All Levels': 'info' }
const GOAL_ICONS  = {
  'Build Strength': <DumbbellIcon />,
  'Weight Loss': <FireIcon />,
  'Flexibility': <CalendarIcon />,
  'Muscle Gain': <DumbbellIcon />,
  'Endurance': <CalendarIcon />,
}

const EMPTY_FORM = { name: '', trainer: '', goal: 'Build Strength', level: 'Beginner', weeks: '8', sessions: '3' }

function normalizePlan(plan) {
  return {
    ...plan,
    exercises: Array.isArray(plan.exercises) ? plan.exercises : [],
    assignedTo: Array.isArray(plan.assignedTo) ? plan.assignedTo : [],
    weeks: Number(plan.weeks || 0),
    sessions: Number(plan.sessions || 0),
  }
}

export default function WorkoutPlans() {
  const { workoutPlans, addWorkoutPlan, deleteWorkoutPlan } = useGymData()
  const plans = useMemo(() => workoutPlans.map(normalizePlan), [workoutPlans])
  const [selected, setSelected] = useState(null)
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')

  const filtered = plans.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.trainer.toLowerCase().includes(search.toLowerCase()) ||
    p.goal.toLowerCase().includes(search.toLowerCase())
  )

  const openView = p => { setSelected(p); setModal('view') }
  const openDel = p => { setSelected(p); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleForm = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSave = () => {
    if (!form.name || !form.trainer) return
    addWorkoutPlan({ ...form, assignedTo: [], exercises: [], weeks: Number(form.weeks), sessions: Number(form.sessions) })
    setForm(EMPTY_FORM)
  }
  const handleDelete = () => { deleteWorkoutPlan(selected.id); closeModal() }

  const totalMembers = plans.reduce((a,p) => a+p.assignedTo.length, 0)
  const trainerCount = [...new Set(plans.map(p=>p.trainer))].length
  const avgSessionsPerWeek = plans.length
    ? (plans.reduce((sum, plan) => sum + Number(plan.sessions || 0), 0) / plans.length).toFixed(1)
    : '0.0'

  return (
    <div className="workout-plans-page">
      <div className="page-header">
        <div>
          <h2>Workout Plans</h2>
          <p>Create and assign structured exercise programs to members.</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon"><DumbbellIcon /></div>
          <div className="stat-label">Total Plans</div>
          <div className="stat-value">{plans.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CalendarIcon /></div>
          <div className="stat-label">Members Assigned</div>
          <div className="stat-value">{totalMembers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FireIcon /></div>
          <div className="stat-label">Active Trainers</div>
          <div className="stat-value">{trainerCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CalendarIcon /></div>
          <div className="stat-label">Avg. Sessions / Week</div>
          <div className="stat-value">{avgSessionsPerWeek}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h4 style={{ marginBottom: 14 }}>Quick Create Plan</h4>
        <div className="workout-quick-form">
          <input className="form-input" name="name" value={form.name} onChange={handleForm} placeholder="Plan name" />
          <input className="form-input" name="trainer" value={form.trainer} onChange={handleForm} placeholder="Trainer" />
          <select className="form-select" name="goal" value={form.goal} onChange={handleForm}>
            {['Build Strength', 'Weight Loss', 'Flexibility', 'Muscle Gain', 'Endurance'].map(goal => <option key={goal}>{goal}</option>)}
          </select>
          <select className="form-select" name="level" value={form.level} onChange={handleForm}>
            {['Beginner', 'Intermediate', 'Advanced', 'All Levels'].map(level => <option key={level}>{level}</option>)}
          </select>
          <input className="form-input" type="number" name="weeks" value={form.weeks} onChange={handleForm} min="1" max="52" placeholder="Weeks" />
          <input className="form-input" type="number" name="sessions" value={form.sessions} onChange={handleForm} min="1" max="7" placeholder="Sessions/wk" />
          <button className="btn btn-primary" onClick={handleSave}>Create Plan</button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search-input-wrap" style={{ minWidth: 250, flex: 1 }}>
          <span className="search-icon"><SearchIcon size={16} /></span>
          <input
            className="form-input"
            placeholder="Search plans, trainers, goals..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="muted" style={{ fontSize: '0.85rem' }}>{filtered.length} records</span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Trainer</th>
                <th>Goal</th>
                <th>Level</th>
                <th>Duration</th>
                <th>Sessions/wk</th>
                <th>Members</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    No workout plans found.
                  </td>
                </tr>
              )}
              {filtered.map(plan => (
                <tr key={plan.id}>
                  <td style={{ fontWeight: 600 }}>
                    <div className="workout-plan-cell">
                      <span className="workout-plan-icon">{GOAL_ICONS[plan.goal] || <DumbbellIcon size={14} />}</span>
                      <span>{plan.name}</span>
                    </div>
                  </td>
                  <td>{plan.trainer}</td>
                  <td><span className="badge badge-accent">{plan.goal}</span></td>
                  <td><span className={`badge badge-${LEVEL_COLOR[plan.level]}`}>{plan.level}</span></td>
                  <td>{plan.weeks} weeks</td>
                  <td>{plan.sessions}</td>
                  <td>{plan.assignedTo.length}</td>
                  <td>
                    <div className="workout-table-actions">
                      <button className="btn btn-sm btn-outline" onClick={() => openView(plan)}>View</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => openDel(plan)}>
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected.name}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
                <span className={`badge badge-${LEVEL_COLOR[selected.level]}`}>{selected.level}</span>
                <span className="badge badge-accent">{selected.goal}</span>
                <span className="muted" style={{ fontSize:'0.82rem' }}>by {selected.trainer}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:20 }}>
                {[['Duration',`${selected.weeks} weeks`],['Frequency',`${selected.sessions}x/week`],['Members',selected.assignedTo.length]].map(([k,v])=>(
                  <div key={k} style={{ background:'var(--surface-2)', borderRadius:'var(--radius)', padding:'12px', textAlign:'center' }}>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:800 }}>{v}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{k}</div>
                  </div>
                ))}
              </div>
              <h4 style={{ marginBottom:12 }}>Exercises</h4>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Exercise</th><th>Sets</th><th>Reps/Duration</th><th>Rest</th></tr></thead>
                  <tbody>
                    {selected.exercises.length > 0 ? selected.exercises.map((e,i) => (
                      <tr key={i}>
                        <td style={{ fontWeight:500 }}>{e.name}</td>
                        <td>{e.sets}</td>
                        <td>{e.reps}</td>
                        <td style={{ color:'var(--text-muted)' }}>{e.rest}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No exercises yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              {selected.assignedTo.length > 0 && (
                <>
                  <h4 style={{ margin:'16px 0 10px' }}>Assigned Members</h4>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    {selected.assignedTo.map(m => (
                      <span key={m} style={{ fontSize:'0.82rem', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:20, padding:'4px 12px' }}>{m}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'delete' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Plan</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <p>Delete <strong>{selected.name}</strong>? This removes it for all {selected.assignedTo.length} assigned members.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
