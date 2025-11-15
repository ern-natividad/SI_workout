import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../style/headerUser.css";

const HeaderUser = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    alert("You have been logged out!");
    navigate("/LoginPage");
  };

  return (
    <header className="header-user">
   
      <div className="logo-wrap">
        <img src="logoblack.png" alt="Fitness Hub Logo" className="header-logo" />
      </div>

    
      <nav className="nav-links">
        <ul>
          <li>
            <NavLink to="/homepage" className={({ isActive }) => (isActive ? "active" : "")}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/statistics" className={({ isActive }) => (isActive ? "active" : "")}>
              Statistics
            </NavLink>
          </li>
          <li>
            <NavLink to="/workout" className={({ isActive }) => (isActive ? "active" : "")}>
              Workout
            </NavLink>
          </li>
          <li>
            <NavLink to="/tools" className={({ isActive }) => (isActive ? "active" : "")}>
              Tools
            </NavLink>
          </li>
        </ul>
      </nav>

      <div className="profile-container">
  <img
    src="/default-profile.jpg"
    alt="Profile"
    className="profile-image"
    onClick={() => setMenuOpen(!menuOpen)}
  />

  {menuOpen && (
    <div className="profile-dropdown">
      <button onClick={() => navigate("/profile")}>Profile</button>
      <button onClick={() => navigate("/settings")}>Settings</button>
      <div className="divider"></div>
      <button className="logout" onClick={handleLogout}>Logout</button>
    </div>
  )}
</div>


    </header>
  );
};

export default HeaderUser;
