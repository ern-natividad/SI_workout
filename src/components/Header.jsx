import React from 'react'
import { Link } from 'react-router-dom'
import '../style/header.css'

const Header = () => {
  return (
<<<<<<< HEAD
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
=======
    <div class="glass-wrapper">
      <header>
        <div class="ul-wrapper">
        <ul>
          <li>
            <Link to="/" >Home</Link>
            <br></br> <Link to="/signup" >Sign Up</Link>
            <br></br> <Link to="/tdee" >Calculator</Link>
          </li>
          <li>
            <Link to="/LoginPage" >Start</Link>
          </li>
          <li>
            <Link to="/About" >About</Link>
          </li>
          <li>FAQ's</li>
          <li>Contacts</li>
        </ul></div>
      </header>
    </div>
    


  )
}

export default Header
>>>>>>> 684e05aaf3c30168d79172643eb459a9f1dfb4ad
