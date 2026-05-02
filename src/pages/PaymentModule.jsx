import { useState } from 'react'
import { useGymData } from '../context/GymDataContext'
import { CardIcon, FireIcon, WarningIcon, CalendarIcon, SearchIcon, AppleIcon, MobileIcon, BagIcon } from '../components/ModernIcons'

const STATUS_COLOR = { paid: 'success', pending: 'warning', overdue: 'danger', refunded: 'info' }
const METHOD_ICON  = { Card: <CardIcon size={15} />, Cash: <CalendarIcon size={15} />, Bank: <CalendarIcon size={15} />, 'Apple Pay': <AppleIcon size={15} />, 'Google Pay': <MobileIcon size={15} />, 'Samsung Pay': <MobileIcon size={15} />, Tabby: <BagIcon size={15} />, 'Digital Wallet': <CardIcon size={15} /> }

export default function PaymentModule() {
  const { payments, addPayment, markPaymentPaid, refundPayment } = useGymData()
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)
  const [form, setForm]         = useState({ member:'', plan:'Pro', amount:'', method:'Card', date:'', status:'pending' })

  const filtered = payments.filter(p => {
    const matchStatus = filter === 'all' || p.status === filter
    const matchSearch = p.member.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const totalPaid    = payments.filter(p=>p.status==='paid').reduce((a,p)=>a+p.amount,0)
  const totalPending = payments.filter(p=>p.status==='pending').reduce((a,p)=>a+p.amount,0)
  const totalOverdue = payments.filter(p=>p.status==='overdue').reduce((a,p)=>a+p.amount,0)

  const markPaid   = id => markPaymentPaid(id)
  const markRefund = id => refundPayment(id)
  const openView   = p  => { setSelected(p); setModal('view') }
  const closeModal = () => { setModal(null); setSelected(null) }

  const handleSave = () => {
    if (!form.member || !form.amount) return
    addPayment({ ...form, amount: parseFloat(form.amount) })
    setModal(null)
    setForm({ member:'', plan:'Pro', amount:'', method:'Card', date:'', status:'pending' })
  }

  return (
    <div>
      <div className="page-header">
        <h2>Payments</h2>
        <p>Track invoices, billing history, and outstanding balances.</p>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ marginBottom:24 }}>
        <div className="stat-card">
          <div className="stat-icon"><CardIcon size={18} /></div>
          <div className="stat-label">Collected (MTD)</div>
          <div className="stat-value" style={{ fontSize:'1.5rem' }}>AED {totalPaid.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><WarningIcon size={18} /></div>
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ fontSize:'1.5rem', color:'var(--warning)' }}>AED {totalPending.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><WarningIcon size={18} /></div>
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ fontSize:'1.5rem', color:'var(--danger)' }}>AED {totalOverdue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CalendarIcon size={18} /></div>
          <div className="stat-label">Total Invoices</div>
          <div className="stat-value">{payments.length}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-input-wrap">
          <span className="search-icon"><SearchIcon size={16} /></span>
          <input className="form-input" placeholder="Search member or invoice ID…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width:'auto' }} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
          <option value="refunded">Refunded</option>
        </select>
        <button className="btn btn-primary" onClick={() => setModal('add')}>+ New Invoice</button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Member</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.95rem' }}>{p.id}</td>
                  <td style={{ fontWeight:500 }}>{p.member}</td>
                  <td><span className="badge badge-accent">{p.plan}</span></td>
                  <td style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem' }}>AED {p.amount}</td>
                  <td style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{p.date}</td>
                  <td style={{ fontSize:'0.85rem' }}>{METHOD_ICON[p.method]} {p.method}</td>
                  <td><span className={`badge badge-${STATUS_COLOR[p.status]}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openView(p)}>View</button>
                      {p.status === 'pending' && (
                        <button className="btn btn-sm" style={{ background:'var(--success)', color:'#fff', border:'none' }} onClick={() => markPaid(p.id)}>Mark Paid</button>
                      )}
                      {p.status === 'paid' && (
                        <button className="btn btn-ghost btn-sm" style={{ color:'var(--info)' }} onClick={() => markRefund(p.id)}>Refund</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Invoice Modal */}
      {modal === 'view' && selected && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invoice {selected.id}</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, padding:'16px', background:'var(--surface-2)', borderRadius:'var(--radius)' }}>
                <div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Total Due</div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800 }}>AED {selected.amount}</div>
                </div>
                <span className={`badge badge-${STATUS_COLOR[selected.status]}`} style={{ fontSize:'0.85rem', padding:'6px 14px' }}>{selected.status}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  ['Member', selected.member],
                  ['Plan', selected.plan],
                  ['Date', selected.date],
                  ['Method', `${METHOD_ICON[selected.method]} ${selected.method}`],
                ].map(([k,v]) => (
                  <div key={k} style={{ background:'var(--surface-2)', borderRadius:'var(--radius)', padding:'12px 14px' }}>
                    <div style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-muted)', marginBottom:4 }}>{k}</div>
                    <div style={{ fontWeight:500 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Close</button>
              {selected.status === 'pending' && (
                <button className="btn btn-primary" onClick={() => { markPaid(selected.id); closeModal() }}>Mark as Paid</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {modal === 'add' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Invoice</h3>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div className="form-group" style={{ gridColumn:'1/-1' }}>
                  <label className="form-label">Member Name</label>
                  <input className="form-input" value={form.member} onChange={e => setForm(f=>({...f,member:e.target.value}))} placeholder="Member name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Plan</label>
                  <select className="form-select" value={form.plan} onChange={e => setForm(f=>({...f,plan:e.target.value}))}>
                    <option>Basic</option><option>Pro</option><option>Elite</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount (AED)</label>
                  <input className="form-input" type="number" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select className="form-select" value={form.method} onChange={e => setForm(f=>({...f,method:e.target.value}))}>
                    <option>Card</option><option>Apple Pay</option><option>Google Pay</option><option>Samsung Pay</option><option>Tabby</option><option>Cash</option><option>Bank</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Create Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
