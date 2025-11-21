import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background dark:bg-dark-background">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
