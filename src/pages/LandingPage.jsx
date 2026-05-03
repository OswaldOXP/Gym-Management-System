import { Link, useNavigate } from 'react-router-dom'
import BrandMark from '../components/BrandMark'
import { DumbbellIcon, ChartIcon, CardIcon, CalendarIcon, ShieldIcon, MobileIcon } from '../components/ModernIcons'
import './LandingPage.css'

const FEATURES = [
  { icon: <DumbbellIcon />, title: 'Expert Trainers',      desc: 'Certified professionals who build personalised programs for your goals.' },
  { icon: <ChartIcon />, title: 'Progress Tracking',    desc: 'Track attendance, workouts, and body metrics in real time.' },
  { icon: <CardIcon />, title: 'Flexible Plans',        desc: 'Monthly, quarterly, and annual memberships to fit your budget.' },
  { icon: <CalendarIcon />, title: 'Easy Scheduling',       desc: 'Book trainer sessions and group classes from any device.' },
  { icon: <ShieldIcon />, title: 'Secure Payments',       desc: 'PCI-compliant payment processing with instant receipts.' },
  { icon: <MobileIcon />, title: 'Member Portal',          desc: 'Manage your membership, workouts, and payments in one place.' },
]

const PLANS = [
  { name: 'Basic',    price: 149, period: '/mo', color: '#3b82f6', perks: ['Gym access', 'Locker room', 'Basic equipment'] },
  { name: 'Pro',      price: 299, period: '/mo', color: '#7CFF49', perks: ['All Basic perks', '2 trainer sessions/mo', 'Nutrition guide', 'Group classes'] },
  { name: 'Elite',    price: 499, period: '/mo', color: '#a855f7', perks: ['All Pro perks', 'Unlimited trainer sessions', 'Body composition analysis', 'Priority booking'] },
]

const STATS = [
  { value: '1,200+', label: 'Active Members' },
  { value: '40+',    label: 'Expert Trainers' },
  { value: '98%',    label: 'Retention Rate' },
  { value: '5 yrs',  label: 'In Operation' },
]

export default function LandingPage() {
  const navigate = useNavigate();

  // Function to scroll to section if on home page, or navigate and then scroll
  const scrollToSection = (sectionId) => {
    if (window.location.pathname === '/') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <BrandMark />
          </div>
          
          <div className="landing-nav-links">
            <button onClick={() => navigate('/')} className="nav-link">Home</button>
            <button onClick={() => scrollToSection('features')} className="nav-link">Features</button>
            <button onClick={() => scrollToSection('plans')} className="nav-link">Plans</button>
            <button onClick={() => navigate('/about')} className="nav-link">About</button>
            <button onClick={() => navigate('/contact')} className="nav-link">Contact</button>
            
          </div>
          
          <div className="landing-nav-actions">
            <Link to="/login"  className="btn btn-outline btn-sm">Log In</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Join Now</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-grid"></div>
          <div className="hero-glow"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge badge-accent">Dubai's Premier Gym</span>
          </div>
          <h1 className="hero-title">
            FORGE YOUR<br />
            <span className="accent">STRONGEST</span><br />
            SELF.
          </h1>
          <p className="hero-sub">
            IronCore combines world-class equipment, certified trainers, and smart member management — all in one platform.
          </p>
          <div className="hero-actions">
            <button onClick={() => navigate('/signup')} className="btn btn-primary btn-lg">Start Today</button>
            <button onClick={() => navigate('/login')} className="btn btn-outline btn-lg">Member Login</button>
          </div>
          <div className="hero-demo-hint">
            <span className="muted" style={{fontSize:'0.78rem'}}>
              Demo logins are managed in the backend Login_info collection.
            </span>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="stats-bar">
        {STATS.map(s => (
          <div key={s.label} className="stat-item">
            <span className="stat-val">{s.value}</span>
            <span className="stat-lbl">{s.label}</span>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">What we offer</span>
            <h2>Everything you need to run a <span className="accent">modern gym</span></h2>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="section plans-section" id="plans">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Membership</span>
            <h2>Plans built for <span className="accent">every goal</span></h2>
          </div>
          <div className="plans-grid">
            {PLANS.map(p => (
              <div key={p.name} className={`plan-card ${p.name === 'Pro' ? 'plan-featured' : ''}`} style={{'--plan-color': p.color}}>
                {p.name === 'Pro' && <div className="plan-popular">Most Popular</div>}
                <h3 className="plan-name">{p.name}</h3>
                <div className="plan-price">
                  <span className="plan-currency">AED</span>
                  <span className="plan-amount">{p.price}</span>
                  <span className="plan-period">{p.period}</span>
                </div>
                <ul className="plan-perks">
                  {p.perks.map(pk => (
                    <li key={pk}><span style={{color: p.color}}>✓</span> {pk}</li>
                  ))}
                </ul>
                <button onClick={() => navigate('/signup')} className="btn btn-outline" style={{width:'100%', justifyContent:'center', borderColor: p.color, color: p.color}}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2>Ready to start your transformation?</h2>
          <p>Join over 1,200 members already training at IronCore.</p>
          <button onClick={() => navigate('/signup')} className="btn btn-primary btn-lg">Create Free Account</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="landing-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <BrandMark />
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px', justifyContent: 'center' }}>
            <button onClick={() => navigate('/about')} className="footer-link">About</button>
            <button onClick={() => navigate('/contact')} className="footer-link">Contact</button>
            
          </div>
          <p className="muted" style={{fontSize:'0.82rem', marginTop: '20px'}}>© 2025 IronCore Gym. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}