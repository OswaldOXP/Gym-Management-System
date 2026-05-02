import { useState } from 'react'
import { useGymData } from '../context/GymDataContext'
import { TrashIcon } from '../components/ModernIcons'

const EMPTY_FORM = { trainer: '', member: '', date: '', time: '', duration: '60', type: 'Strength', status: 'pending' }
const STATUS_COLOR = { confirmed: 'success', pending: 'warning', cancelled: 'danger' }

export default function TrainerScheduling() {
  const { sessions, addSession, updateSession, deleteSession, trainers } = useGymData()
  const [tab, setTab] = useState('sessions')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filter, setFilter] = useState('all')

  const filtered = sessions.filter(session => filter === 'all' || session.status === filter)

  const handleForm = e => setForm(current => ({ ...current, [e.target.name]: e.target.value }))
  const openAdd = () => { setForm(EMPTY_FORM); setModal('add') }
  const openEdit = session => { setForm({ ...session }); setSelected(session); setModal('edit') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleSave = () => {
    if (!form.trainer || !form.member || !form.date) return
    if (modal === 'add') {
      addSession(form)
    } else if (selected) {
      updateSession(selected.id, form)
    }
    closeModal()
  }

  const handleDelete = id => deleteSession(id)
  const updateStatus = (id, status) => updateSession(id, { status })

  return (
    <div>
      <div className="page-header">
        <h2>Trainer Scheduling</h2>
        <p>Manage trainer sessions and availability.</p>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'sessions' ? 'active' : ''}`} onClick={() => setTab('sessions')}>Sessions</button>
        <button className={`tab ${tab === 'trainers' ? 'active' : ''}`} onClick={() => setTab('trainers')}>Trainers</button>
      </div>

      {tab === 'sessions' && (
        <>
          <div className="toolbar">
            <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">All Sessions</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={openAdd}>+ Book Session</button>
          </div>

          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Trainer</th>
                    <th>Member</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Duration</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(session => (
                    <tr key={session.id}>
                      <td style={{ fontWeight: 500, fontSize: '0.9rem' }}>{session.trainer}</td>
                      <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>{session.member}</td>
                      <td style={{ fontSize: '0.85rem' }}>{session.date}</td>
                      <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>{session.time}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{session.duration} min</td>
                      <td><span className="badge badge-accent">{session.type}</span></td>
                      <td><span className={`badge badge-${STATUS_COLOR[session.status]}`}>{session.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {session.status === 'pending' && (
                            <button className="btn btn-sm" style={{ background: 'var(--success)', color: '#fff', border: 'none' }} onClick={() => updateStatus(session.id, 'confirmed')}>✓</button>
                          )}
                          <button className="btn btn-ghost btn-sm" onClick={() => openEdit(session)}>Edit</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(session.id)}><TrashIcon size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'trainers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 16 }}>
          {trainers.map(trainer => (
            <div key={trainer.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {trainer.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{trainer.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{trainer.specialty}</div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>{trainer.rating}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Rating</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>{trainer.sessions}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sessions</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span className={`badge badge-${trainer.available ? 'success' : 'danger'}`}>{trainer.available ? 'Available' : 'Busy'}</span>
                </div>
              </div>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={openAdd}>
                Book Session
              </button>
            </div>
          ))}
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'add' ? 'Book New Session' : 'Edit Session'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Trainer</label>
                  <select className="form-select" name="trainer" value={form.trainer} onChange={handleForm}>
                    <option value="">Select trainer…</option>
                    {trainers.map(trainer => <option key={trainer.id}>{trainer.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Member Name</label>
                  <input className="form-input" name="member" value={form.member} onChange={handleForm} placeholder="Member name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" name="date" value={form.date} onChange={handleForm} />
                </div>
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <input className="form-input" type="time" name="time" value={form.time} onChange={handleForm} />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (min)</label>
                  <select className="form-select" name="duration" value={form.duration} onChange={handleForm}>
                    <option value="30">30</option>
                    <option value="45">45</option>
                    <option value="60">60</option>
                    <option value="90">90</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Session Type</label>
                  <select className="form-select" name="type" value={form.type} onChange={handleForm}>
                    {['Strength', 'Cardio', 'HIIT', 'Yoga', 'Pilates', 'Wellness'].map(type => <option key={type}>{type}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>{modal === 'add' ? 'Book Session' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
