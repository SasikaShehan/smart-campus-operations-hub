import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../services/auth';

const PrivateRoute = ({ children, roles = [] }) => {
  const authenticated = isAuthenticated();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && (!user || !roles.includes(user.role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;