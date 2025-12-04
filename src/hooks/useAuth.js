// // frontend/src/hooks/useAuth.js

// import React, { useState, useContext, createContext, useEffect } from 'react';

// // Create the context that components will consume.
// const AuthContext = createContext(null);

// // Create the provider component that will wrap your app.
// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true); // Add loading state

//   // This effect runs once on app startup to check if a user is already logged in.
//   useEffect(() => {
//     try {
//       const userInfoString = localStorage.getItem('userInfo');
//       if (userInfoString) {
//         setUser(JSON.parse(userInfoString));
//       }
//     } catch (error) {
//       console.error("Failed to parse user info from localStorage", error);
//       // Clear corrupted data if parsing fails
//       localStorage.removeItem('userInfo');
//       localStorage.removeItem('token');
//     } finally {
//       setLoading(false); // Stop loading once user is checked
//     }
//   }, []);

//   // The login function now correctly saves the token and user info separately.
//   const login = (data) => {
//     if (data && data.token && data.userInfo) {
//       localStorage.setItem('token', data.token);
//       localStorage.setItem('userInfo', JSON.stringify(data.userInfo));
//       setUser(data.userInfo);
//     } else {
//       console.error("Login failed: data object is missing token or userInfo.");
//     }
//   };

//   // The logout function now correctly clears both items.
//   const logout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userInfo');
//     setUser(null);
//   };

//   // The value provided to consuming components.
//   const value = { user, login, logout, loading };

//   // Render children only when not in initial loading state.
//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// // The custom hook that components will use to access the context.
// export const useAuth = () => {
//   return useContext(AuthContext);
// };

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
