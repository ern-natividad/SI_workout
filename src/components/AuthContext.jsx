import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// --- NOTE: IMPORTANT CONTEXT IMPLEMENTATION ---
// In a real app, this provider would fetch the userId from sessionStorage or 
// check a JWT token on load and upon successful login from your login.php.
// The hardcoded ID=1 is for testing the InformationSetup flow only!
// ----------------------------------------------

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null); // Null means not loaded/logged in
  const [userWeight, setUserWeight] = useState(null);
  const [userHeight, setUserHeight] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Mock function to simulate login
  const login = (id, token, weight = null, height = null) => {
    // In a real app, save token to storage
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('userId', id);
    if (weight) sessionStorage.setItem('userWeight', weight);
    if (height) sessionStorage.setItem('userHeight', height);
    setUserId(id);
    setUserWeight(weight);
    setUserHeight(height);
    setIsAuthenticated(true);
    console.debug('AuthContext: login()', { id, token, weight, height });
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userWeight');
    sessionStorage.removeItem('userHeight');
    setUserId(null);
    setUserWeight(null);
    setUserHeight(null);
    setIsAuthenticated(false);
    // Redirect to login page
    try {
      navigate('/loginpage');
    } catch (e) {
      // If navigate isn't available for some reason, ignore
    }
  };
  
  // Mock initialization hook (simulates checking if user is already logged in)
  useEffect(() => {
    const storedId = sessionStorage.getItem('userId');
    const storedToken = sessionStorage.getItem('authToken');
    const storedWeight = sessionStorage.getItem('userWeight');
    const storedHeight = sessionStorage.getItem('userHeight');
    
    if (storedId && storedToken) {
        // Here, you would validate the token with your backend.
        // Assume the stored ID is valid for now.
        setUserId(parseInt(storedId, 10));
        setUserWeight(storedWeight);
        setUserHeight(storedHeight);
        setIsAuthenticated(true);
        console.debug('AuthContext: initialized from sessionStorage', { storedId, storedToken, storedWeight });
    }

    // Listen for global logout events (dispatched by middleware on 401)
    const handleGlobalLogout = () => logout();
    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => window.removeEventListener('auth-logout', handleGlobalLogout);
  }, []);

  const value = {
    userId,
    userWeight,
    userHeight,
    isAuthenticated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};