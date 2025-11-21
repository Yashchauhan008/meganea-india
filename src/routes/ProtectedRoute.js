import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading session...</div>; // Or a spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified, check if the user's role is included
  if (roles && !roles.includes(user.role)) {
    // User is authenticated but not authorized for this specific route
    return <Navigate to="/dashboard" state={{ error: "Unauthorized" }} replace />;
  }

  return children;
};

export default ProtectedRoute;
