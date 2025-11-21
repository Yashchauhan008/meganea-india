import axios from 'axios';

// Ensure this environment variable points to your backend URL in a .env file
// or default to your local development server.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
} );

// This is the interceptor that automatically adds the authentication token
// to every single request made with this 'api' instance.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
