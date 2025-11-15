<<<<<<< HEAD
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header';
import HeaderUser from './components/HeaderUser';

import LandingPage from './pages/landing_page';
import SignUp from './pages/SignUp';
import About from './pages/about';
import LoginPage from './pages/login_page';
import ContactPage from './pages/contact_page';
import TDEECalculator from './components/TDEECalculator';
import Faq from './pages/faq_page';
import InformationSetup from './pages/information_setup';
import HomePage from './pages/HomePage';
import StatisticsPage from './pages/statistics';
import Tools from './pages/tools';
import WorkoutPage from './pages/workout';


function App() {
  const location = useLocation();

  const path = location.pathname.toLowerCase();

  // Pages that show NO header
  const noHeader = [
    '/loginpage',
    '/signup',
    '/information-setup'
  ];

  // Public pages (landing + info pages)
  const publicHeader = [
    '/about',
    '/contacts',
    '/faq'
  ];

  // SPECIAL CASE → Landing page "/" must match EXACT only
  const isLanding = path === '/';

  // public header if EXACT landing OR other public pages
  const showPublicHeader =
    isLanding || publicHeader.some(route => path.startsWith(route));

  // user header if NOT in noHeader AND NOT public
  const showUserHeader =
    !noHeader.some(route => path.startsWith(route)) &&
    !showPublicHeader;

  return (
    <div>

      {showPublicHeader && <Header />}
      {showUserHeader && <HeaderUser />}
=======
import React from 'react'
{/*import './App.css'*/}
import { Link,Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import LandingPage  from './pages/landing_page'
import SignUp from './pages/SignUp'
import About from './pages/about'
import LoginPage from './pages/login_page'
import TDEECalculator from './components/TDEECalculator'
import GlassMorph from './components/GlassMorph'

function App() {

  return (
    
    <div>
      {/* Itong header para mag render lng to ng Header.jsx na component in order to work the route and link */}
      <GlassMorph className="layout-wrapper">
      <Header /> 
>>>>>>> 684e05aaf3c30168d79172643eb459a9f1dfb4ad

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />
<<<<<<< HEAD
        <Route path="/contacts" element={<ContactPage />} />
        <Route path="/loginpage" element={<LoginPage />} />

        <Route path="/faq" element={<Faq />} />

        <Route path="/tdee" element={<TDEECalculator />} />
        <Route path="/tools" element={<Tools />} />

        <Route path="/information-setup" element={<InformationSetup />} />

        <Route path="/homepage" element={<HomePage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/workout" element={<WorkoutPage />} />

        <Route path="*" element={<h2>404 Page Not Found</h2>} />
      </Routes>
    </div>
  );
}

export default App;

=======
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/tdee" element={<TDEECalculator />} />
        <Route path="*" element={<h2>Page Not Found (404)</h2>} />
      </Routes>

      </GlassMorph>
    </div>
    
  )
}

export default App
>>>>>>> 684e05aaf3c30168d79172643eb459a9f1dfb4ad
