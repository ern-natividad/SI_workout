import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header';
import HeaderUser from './components/HeaderUser';
import { useAuth } from './components/AuthContext';

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
import BMI from './pages/BMI';
import HeartRate from './pages/HeartRate';
import Profile from './pages/Profile';
import ProfileEdit from './pages/ProfileEdit';


function App() {
  const location = useLocation();

  const path = location.pathname.toLowerCase();
  // Use AuthContext instead of localStorage for logged-in state
  const { isAuthenticated } = useAuth();
  const isLoggedIn = Boolean(isAuthenticated);

  // Pages that show NO header
  const noHeader = [
    '/loginpage',
    '/information_setup',
    '/signup'
  ];
  
  // Pages that show HeaderUser
  const userHeader = [
    '/homepage',
    '/statistics',
    '/tools',
    '/workout',
    "/tdee",
    '/bmi',
    '/heartrate',
    '/profile',
    '/profile/edit',
    '/information_setup'
  ];

  // Public pages (landing + info pages)
  const publicHeader = [
    '/about',
    '/contacts',
    '/faq',
  ];

  // SPECIAL CASE → Landing page "/" must match EXACT only
  const isLanding = path === '/';

  // public header if NOT logged in and (landing OR public pages)
  const showPublicHeader =
    !isLoggedIn && (isLanding || publicHeader.some(route => path.startsWith(route)));

  // user header when on user pages and logged in
  const showUserHeader = isLoggedIn && userHeader.some(route => path.startsWith(route));

  return (
    <div>

      {/* Public header for unauthenticated visitors (includes landing and public pages) */}
      {(showPublicHeader || (isLanding && !isLoggedIn)) && <Header />}
      {showUserHeader && <HeaderUser />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />
        <Route path="/contacts" element={<ContactPage />} />
        <Route path="/loginpage" element={<LoginPage />} />

        <Route path="/faq" element={<Faq />} />
        

        <Route path="/tdee" element={<TDEECalculator />} />
        <Route path="/bmi" element={<BMI />} />
        <Route path="/heartrate" element={<HeartRate />} />
        <Route path="/tools" element={<Tools />} />

        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<ProfileEdit />} />
        
        

        <Route path="/homepage" element={<HomePage />} />
        <Route path='/information_setup' element={<InformationSetup />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/workout" element={<WorkoutPage />} />

        <Route path="*" element={<h2>404 Page Not Found</h2>} />
      </Routes>
    </div>
  );
}

export default App;

