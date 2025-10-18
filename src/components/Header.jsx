import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <div>
        <header>
      Navigation links will go here
      <ul>
        <li>
            <Link to="/" >Workout</Link>
        </li>
        <li>
            <Link to="/LoginPage" >Start</Link>
        </li>
        <li>
            <Link to="/About" >About</Link>
        </li>
      </ul>
      </header>
    </div>
  )
}

export default Header
