import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// --- NOTE: IMPORTANT CONTEXT IMPLEMENTATION ---
// In a real app, this provider would fetch the userId from sessionStorage or 
// check a JWT token on load and upon successful login from your login.php.
// The hardcoded ID=1 is for testing the InformationSetup flow only!
// ----------------------------------------------

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null); // Null means not loaded/logged in
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock function to simulate login
  const login = (id, token) => {
    // In a real app, save token to storage
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('userId', id);
    setUserId(id);
    setIsAuthenticated(true);
  };
  
  // Mock initialization hook (simulates checking if user is already logged in)
  useEffect(() => {
    const storedId = sessionStorage.getItem('userId');
    const storedToken = sessionStorage.getItem('authToken');
    
    if (storedId && storedToken) {
        // Here, you would validate the token with your backend.
        // For the demo, we assume the stored ID is valid.
        setUserId(parseInt(storedId, 10)); 
        setIsAuthenticated(true);
    } else {
        // Fallback for demonstration: assume user 1 is logged in if nothing is found
        // REMOVE THIS LINE IN PRODUCTION!
        login(1, 'mock-token-123'); 
    }
  }, []);

  const value = {
    userId,
    isAuthenticated,
    login,
    // logout function would also be here
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};