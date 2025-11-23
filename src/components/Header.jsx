import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../style/header.css'

const Header = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.toLowerCase().startsWith(path.toLowerCase());
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-wrap">
          <img src="/logoblack.png" alt="logo" className="header-logo" />
        </div>

        <nav className="nav-links">
          <ul>
            <li><Link to="/" className={isActive('/') ? 'nav-active' : ''}>Home</Link></li>
            <li><Link to="/About" className={isActive('/About') ? 'nav-active' : ''}>About</Link></li>
            <li><Link to="/faq" className={isActive('/faq') ? 'nav-active' : ''}>FAQ</Link></li>
            <li><Link to="/contacts" className={isActive('/contacts') ? 'nav-active' : ''}>Contacts</Link></li>
          </ul>
        </nav>
      </div>

      <Link to="/LoginPage" className="profile-link">
        <img src="/avatar.png" alt="Login" className="profile-image" />
      </Link>
    </header>
  );
};


export default Header
