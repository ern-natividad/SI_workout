import React from 'react'
import { Link } from 'react-router-dom'
import '../style/header.css'

const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-wrap">
          <img src="/logoblack.png" alt="logo" className="header-logo" />
        </div>

        <nav className="nav-links">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/About">About</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contacts">Contacts</Link></li>
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
