import React from 'react';
import LoginForm from '../components/auth/LoginForm'; // Named import

const LoginPage = ( ) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background">
      <LoginForm />
    </div>
  );
};

// Make sure to have a default export for the page component
export default LoginPage;
