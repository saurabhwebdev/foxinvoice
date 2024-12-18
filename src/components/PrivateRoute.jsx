import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (currentUser && !currentUser.emailVerified && window.location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" />;
  }

  return children;
}

export default PrivateRoute; 