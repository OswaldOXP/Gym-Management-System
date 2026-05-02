import { useNavigate } from 'react-router-dom';
import BrandMark from './BrandMark'
import './PublicNavbar.css';

export default function PublicNavbar() {
  const navigate = useNavigate();

  return (
    <nav className="public-navbar">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <BrandMark />
      </div>
      
      <div className="nav-links">
        <button onClick={() => navigate('/')}>Home</button>
        <button onClick={() => navigate('/about')}>About</button>
        <button onClick={() => navigate('/contact')}>Contact</button>
        <button onClick={() => navigate('/plans')}>Plans</button>
      </div>
      
      <div className="nav-buttons">
        <button className="btn-back" onClick={() => navigate('/dashboard')}>Dashboard</button>
        <button className="btn-outline" onClick={() => navigate('/login')}>Login</button>
        <button className="btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
      </div>
    </nav>
  );
}