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

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />
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

