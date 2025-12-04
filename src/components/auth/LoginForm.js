import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginUser } from '../../api/authApi';
import Input from '../ui/Input';
import Label from '../ui/Label';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Make sure the backend server is running!
    try {
      const data = await loginUser({ username, password });
      auth.login(data); // Context handles location check and storing data
      navigate('/dashboard'); // Redirect on success
    } catch (err) {
      // Display a user-friendly error message
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-foreground dark:bg-dark-foreground rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-text dark:text-dark-text">India Operations Portal</h2>
      {error && <p className="text-center text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>
      <p className="text-center text-sm text-text-secondary dark:text-dark-text-secondary">
        Need an account?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline dark:text-dark-primary">
          Register here
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;