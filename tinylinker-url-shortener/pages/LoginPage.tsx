
import React from 'react';
import AuthForm from '../components/auth/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Card from '../components/ui/Card';

const LoginPage: React.FC = () => {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-150px)]"><p>טוען...</p></div>;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md">
        <AuthForm />
      </Card>
    </div>
  );
};

export default LoginPage;