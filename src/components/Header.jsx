import React from 'react'
import { Link } from 'react-router-dom'
import '../style/header.css'

const Header = () => {
  return (
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
