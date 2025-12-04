// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';

// const ProtectedRoute = ({ children, roles }) => {
//   // Call ALL hooks at the top level, before any conditionals
//   const authContext = useAuth();
//   const location = useLocation();

//   // Now we can use conditionals
//   if (!authContext) {
//     return <Navigate to="/login" replace />;
//   }

//   const { user, loading } = authContext;

//   if (loading) {
//     return <div>Loading session...</div>; // Or a spinner
//   }

//   // If user is null, they are not authenticated
//   if (!user) {
//     return <Navigate to="/login" state={{ from: location }} replace />;
//   }

//   // If roles are specified, check if the user's role is included
//   if (roles && !roles.includes(user.role)) {
//     // User is authenticated but not authorized for this specific route
//     return <Navigate to="/dashboard" state={{ error: "Unauthorized" }} replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, roles }) => {
  // Call ALL hooks at the top level, before any conditionals
  const authContext = useAuth();
  const location = useLocation();

  // Now we can use conditionals
  if (!authContext) {
    return <Navigate to="/login" replace />;
  }

  const { user, loading, isAuthenticated } = authContext;

  if (loading) {
    return <div>Loading session...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" state={{ error: "Unauthorized" }} replace />;
  }

  return children;
};

export default ProtectedRoute;
