import { useState } from 'react'
import { useGymData } from '../context/GymDataContext'
import { SearchIcon, TrashIcon } from '../components/ModernIcons'

const INITIAL_MEMBERS = [
  { id: 1, name: 'Sara Al Mansoori', email: 'sara@email.com',   phone: '+971 50 111 2222', plan: 'Pro',   status: 'active',   joined: '2024-01-15', expiry: '2025-03-31' },
  { id: 2, name: 'Ahmed Khalil',     email: 'ahmed@email.com',  phone: '+971 55 333 4444', plan: 'Elite', status: 'active',   joined: '2023-11-02', expiry: '2025-11-02' },
  { id: 3, name: 'Maria Santos',     email: 'maria@email.com',  phone: '+971 52 555 6666', plan: 'Basic', status: 'active',   joined: '2024-06-10', expiry: '2025-06-10' },
  { id: 4, name: 'Omar Al Rashidi',  email: 'omar@email.com',   phone: '+971 56 777 8888', plan: 'Pro',   status: 'active',   joined: '2024-03-22', expiry: '2025-03-22' },
  { id: 5, name: 'Priya Nair',       email: 'priya@email.com',  phone: '+971 54 999 0000', plan: 'Basic', status: 'inactive', joined: '2023-08-14', expiry: '2024-08-14' },
  { id: 6, name: 'James Okafor',     email: 'james@email.com',  phone: '+971 50 111 3333', plan: 'Elite', status: 'active',   joined: '2024-02-01', expiry: '2025-02-01' },
  { id: 7, name: 'Lina Hoffmann',    email: 'lina@email.com',   phone: '+971 55 444 5555', plan: 'Pro',   status: 'active',   joined: '2024-07-19', expiry: '2025-07-19' },
  { id: 8, name: 'Kevin Park',       email: 'kevin@email.com',  phone: '+971 52 666 7777', plan: 'Basic', status: 'pending',  joined: '2025-02-28', expiry: '2026-02-28' },
]

const EMPTY_FORM = { name: '', email: '', phone: '', plan: 'Basic', status: 'active', joined: '', expiry: '' }

const PLAN_COLORS = { Basic: 'info', Pro: 'accent', Elite: 'warning' }
const STATUS_COLORS = { active: 'success', inactive: 'danger', pending: 'warning' }

export default function Members() {
  const { members, addMember, updateMember, deleteMember } = useGymData()
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [modal, setModal]       = useState(null)   // 'add' | 'edit' | 'view' | 'delete'
  const [selected, setSelected] = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.email.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || m.status === filter
    return matchSearch && matchFilter
  })

  const openAdd  = ()  => { setForm(EMPTY_FORM); setModal('add') }
  const openEdit = (m) => { setForm({ ...m }); setSelected(m); setModal('edit') }
  const openView = (m) => { setSelected(m); setModal('view') }
  const openDel  = (m) => { setSelected(m); setModal('delete') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleForm = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSave = () => {
    if (!form.name || !form.email) return
    if (modal === 'add') {
      addMember(form)
    } else {
      updateMember(selected.id, form)
    }
    closeModal()
  }

  const handleDelete = () => {
    deleteMember(selected.id)
    closeModal()
  }

  return (
    <div>
      <div className="page-header">
        <h2>Members</h2>
        <p>Manage all gym members — add, edit, and track subscriptions.</p>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
        {[
          { label: 'Total',    value: members.length,                              color: '' },
          { label: 'Active',   value: members.filter(m=>m.status==='active').length,   color: 'var(--success)' },
          { label: 'Inactive', value: members.filter(m=>m.status==='inactive').length, color: 'var(--danger)'  },
          { label: 'Pending',  value: members.filter(m=>m.status==='pending').length,  color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color || 'var(--text)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-input-wrap">
          <span className="search-icon"><SearchIcon size={16} /></span>
          <input className="form-input" placeholder="Search by name or email…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Member</button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No members found.</td></tr>
              )}
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--surface-2)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.82rem', color:'var(--text-muted)', flexShrink:0 }}>
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize:'0.9rem' }}>{m.name}</div>
                        <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{m.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{m.phone}</td>
                  <td><span className={`badge badge-${PLAN_COLORS[m.plan]}`}>{m.plan}</span></td>
                  <td><span className={`badge badge-${STATUS_COLORS[m.status]}`}>{m.status}</span></td>
                  <td style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{m.joined}</td>
                  <td style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{m.expiry}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openView(m)}>View</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>Edit</button>
                      <button className="btn btn-ghost btn-sm" style={{ color:'var(--danger)' }} onClick={() => openDel(m)}><TrashIcon size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === 'add' ? 'Add New Member' : 'Edit Member'}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" name="name" value={form.name} onChange={handleForm} placeholder="Full Name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" name="email" type="email" value={form.email} onChange={handleForm} placeholder="email@example.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" name="phone" value={form.phone} onChange={handleForm} placeholder="+971 50 000 0000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Plan</label>
                  <select className="form-select" name="plan" value={form.plan} onChange={handleForm}>
                    <option>Basic</option><option>Pro</option><option>Elite</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" name="status" value={form.status} onChange={handleForm}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Join Date</label>
                  <input className="form-input" name="joined" type="date" value={form.joined} onChange={handleForm} />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiry Date</label>
                  <input className="form-input" name="expiry" type="date" value={form.expiry} onChange={handleForm} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {modal === 'add' ? 'Add Member' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Member Details</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign:'center', marginBottom:20 }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--accent-dim)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:800, color:'var(--accent)', margin:'0 auto 12px' }}>
                  {selected.name.charAt(0)}
                </div>
                <h3>{selected.name}</h3>
                <span className={`badge badge-${STATUS_COLORS[selected.status]}`}>{selected.status}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  ['Email', selected.email],
                  ['Phone', selected.phone],
                  ['Plan', selected.plan],
                  ['Joined', selected.joined],
                  ['Expiry', selected.expiry],
                ].map(([k, v]) => (
                  <div key={k} style={{ background:'var(--surface-2)', borderRadius:'var(--radius)', padding:'12px 14px' }}>
                    <div style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', marginBottom:4 }}>{k}</div>
                    <div style={{ fontSize:'0.9rem', fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Close</button>
              <button className="btn btn-outline" onClick={() => { closeModal(); openEdit(selected) }}>Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === 'delete' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Member</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove <strong>{selected.name}</strong> from the system? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
