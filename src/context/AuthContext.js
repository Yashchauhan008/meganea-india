import React, { createContext, useState, useEffect, useMemo } from 'react';
import { logoutUser as apiLogout } from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  // THIS useEffect IS THE CORE LOGIC FOR THEME TOGGLING
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove the old theme class
    const oldTheme = theme === 'dark' ? 'light' : 'dark';
    root.classList.remove(oldTheme);

    // Add the new theme class
    root.classList.add(theme);
    
    // Save the theme preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]); // This effect runs every time the 'theme' state changes

  // Authentication check on initial load (no changes here)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.location === 'India' || parsedUser.role === 'admin') {
            setUser(parsedUser);
        } else {
            localStorage.clear();
            setUser(null);
        }
      } catch (error) {
        localStorage.clear();
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    if (data.user.location !== 'India' && data.user.role !== 'admin') {
        throw new Error("Access Denied: This portal is for India-based staff only.");
    }
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    apiLogout();
    setUser(null);
  };

  // This function will be called by the button in the sidebar
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      theme, // Expose the current theme
      login,
      logout,
      toggleTheme, // Expose the toggle function
    }),
    [user, loading, theme]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
