import { useState } from 'react'
import { useGymData } from '../context/GymDataContext'
import { DumbbellIcon, FireIcon, CalendarIcon, SearchIcon, TrashIcon } from '../components/ModernIcons'

const LEVEL_COLOR = { 'Beginner': 'success', 'Intermediate': 'warning', 'Advanced': 'danger', 'All Levels': 'info' }
const GOAL_ICONS  = {
  'Build Strength': <DumbbellIcon />,
  'Weight Loss': <FireIcon />,
  'Flexibility': <CalendarIcon />,
  'Muscle Gain': <DumbbellIcon />,
  'Endurance': <CalendarIcon />,
}

const EMPTY_FORM = { name:'', trainer:'', goal:'Build Strength', level:'Beginner', weeks:'8', sessions:'3' }

export default function WorkoutPlans() {
  const { workoutPlans, addWorkoutPlan, deleteWorkoutPlan } = useGymData()
  const plans = workoutPlans
  const [selected, setSelected] = useState(null)
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')

  const filtered = plans.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.trainer.toLowerCase().includes(search.toLowerCase()) ||
    p.goal.toLowerCase().includes(search.toLowerCase())
  )

  const openView = p => { setSelected(p); setModal('view') }
  const openAdd  = () => { setForm(EMPTY_FORM); setModal('add') }
  const openDel  = p => { setSelected(p); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleForm = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleSave = () => {
    if (!form.name || !form.trainer) return
    addWorkoutPlan({ ...form, assignedTo: [], exercises: [], weeks: Number(form.weeks), sessions: Number(form.sessions) })
    closeModal()
  }
  const handleDelete = () => { deleteWorkoutPlan(selected.id); closeModal() }

  return (
    <div>
      <div className="page-header">
        <h2>Workout Plans</h2>
        <p>Create and assign structured exercise programs to members.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Plans</div>
          <div className="stat-value">{plans.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Members Assigned</div>
          <div className="stat-value">{plans.reduce((a,p) => a+p.assignedTo.length, 0)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Trainers</div>
          <div className="stat-value">{[...new Set(plans.map(p=>p.trainer))].length}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-input-wrap">
          <span className="search-icon"><SearchIcon size={16} /></span>
          <input className="form-input" placeholder="Search plans…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ New Plan</button>
      </div>

      {/* Plan Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
        {filtered.map(p => (
          <div key={p.id} className="card" style={{ cursor:'default' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
              <div>
                <div style={{ width: 28, height: 28, marginBottom: 10, color: 'var(--accent)' }}>{GOAL_ICONS[p.goal] || <DumbbellIcon />}</div>
                <h4 style={{ marginBottom:4 }}>{p.name}</h4>
                <p style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>by {p.trainer}</p>
              </div>
              <span className={`badge badge-${LEVEL_COLOR[p.level]}`}>{p.level}</span>
            </div>

            <div style={{ display:'flex', gap:16, marginBottom:14, paddingBottom:14, borderBottom:'1px solid var(--border)' }}>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800 }}>{p.weeks}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Weeks</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800 }}>{p.sessions}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Sessions/wk</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800 }}>{p.exercises.length}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Exercises</div>
              </div>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800 }}>{p.assignedTo.length}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Members</div>
              </div>
            </div>

            <div style={{ marginBottom:14 }}>
              <span className="badge badge-accent">{p.goal}</span>
            </div>

            {p.assignedTo.length > 0 && (
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                {p.assignedTo.map(m => (
                  <span key={m} style={{ fontSize:'0.72rem', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:20, padding:'2px 8px', color:'var(--text-muted)' }}>{m.split(' ')[0]}</span>
                ))}
              </div>
            )}

            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-outline btn-sm" style={{ flex:1, justifyContent:'center' }} onClick={() => openView(p)}>View Plan</button>
              <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)' }} onClick={() => openDel(p)}><TrashIcon size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* View Plan Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" style={{ maxWidth:600 }} onClick={e => e.stopPropagation()}>
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
                    {selected.exercises.map((e,i) => (
                      <tr key={i}>
                        <td style={{ fontWeight:500 }}>{e.name}</td>
                        <td>{e.sets}</td>
                        <td>{e.reps}</td>
                        <td style={{ color:'var(--text-muted)' }}>{e.rest}</td>
                      </tr>
                    ))}
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

      {/* Add Plan Modal */}
      {modal === 'add' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Workout Plan</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Plan Name</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleForm} placeholder="e.g. Advanced Powerlifting" />
                </div>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Trainer</label>
                  <input className="form-input" name="trainer" value={form.trainer} onChange={handleForm} placeholder="Trainer name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Goal</label>
                  <select className="form-select" name="goal" value={form.goal} onChange={handleForm}>
                    {['Build Strength','Weight Loss','Flexibility','Muscle Gain','Endurance'].map(g=><option key={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Level</label>
                  <select className="form-select" name="level" value={form.level} onChange={handleForm}>
                    {['Beginner','Intermediate','Advanced','All Levels'].map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (weeks)</label>
                  <input className="form-input" type="number" name="weeks" value={form.weeks} onChange={handleForm} min="1" max="52" />
                </div>
                <div className="form-group">
                  <label className="form-label">Sessions / week</label>
                  <input className="form-input" type="number" name="sessions" value={form.sessions} onChange={handleForm} min="1" max="7" />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Create Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
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
