import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';
import BrandMark from '../components/BrandMark'
import { DumbbellIcon, UsersIcon, ChartIcon, ShieldIcon } from '../components/ModernIcons'

export default function AboutPage() {
  const navigate = useNavigate();

  const values = [
    { icon: <DumbbellIcon />, title: "Excellence", desc: "We strive for the highest standards" },
    { icon: <UsersIcon />, title: "Community", desc: "Supportive environment for all members" },
    { icon: <ChartIcon />, title: "Results", desc: "Committed to helping you achieve goals" },
    { icon: <ShieldIcon />, title: "Integrity", desc: "Honest guidance, no shortcuts" }
  ];

  return (
    <div className="about-page">
      {/* Simple navigation for public pages */}
      <div className="public-nav">
        <div className="nav-brand" onClick={() => navigate('/')}><BrandMark /></div>
        <div className="nav-links">
          <button onClick={() => navigate('/')}>Home</button>
          <button onClick={() => navigate('/about')} className="active">About</button>
          <button onClick={() => navigate('/contact')}>Contact</button>
          <button onClick={() => navigate('/plans')}>Plans</button>
        </div>
        <div className="nav-buttons">
          <button className="btn-outline" onClick={() => navigate('/login')}>Login</button>
          <button className="btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="about-hero">
        <h1>About IronCore Gym</h1>
        <p>Your journey to a better you starts here</p>
      </div>

      {/* Content Section */}
      <div className="about-content">
        {/* Our Story */}
        <div className="about-section">
          <h2>Our Story</h2>
          <p>Founded in 2020, IronCore Gym has grown from a small local gym into a premier fitness destination in the UAE. We believe fitness is for everyone, regardless of your starting point or goals. Our state-of-the-art facility spans over 10,000 sq ft and features the latest equipment, dedicated training zones, and a community that pushes each other to be better.</p>
        </div>

        {/* Our Mission */}
        <div className="about-section">
          <h2>Our Mission</h2>
          <p>To empower individuals to achieve their fitness goals through expert guidance, state-of-the-art facilities, and a supportive community. We're not just a gym - we're a family that celebrates every victory, big or small.</p>
        </div>

        {/* Why Choose Us */}
        <div className="about-section">
          <h2>Why Choose IronCore?</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-card">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <div className="stat-item">
            <div className="stat-number">5+</div>
            <div className="stat-label">Years of Excellence</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Happy Members</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">10+</div>
            <div className="stat-label">Expert Trainers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">50+</div>
            <div className="stat-label">Weekly Classes</div>
          </div>
        </div>
      </div>
    </div>
  );
}