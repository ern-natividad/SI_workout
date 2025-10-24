import React from 'react'
import './App.css'
import { Link,Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import LandingPage  from './pages/landing_page'
import SignUp from './pages/SignUp'
import About from './pages/about'
import LoginPage from './pages/login_page'

function App() {

  return (
    
    <div>
      {/* Itong header para mag render lng to ng Header.jsx na component in order to work the route and link */}
      <Header /> 

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="*" element={<h2>Page Not Found (404)</h2>} />
      </Routes>
    </div>
    
  )
}

export default App
