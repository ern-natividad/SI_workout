import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Simple protected route wrapper: if not authenticated, redirect to login
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/loginpage" replace />;
  }
  return children;
};

export default ProtectedRoute;
