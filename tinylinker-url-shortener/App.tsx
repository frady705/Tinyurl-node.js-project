
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/ui/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import LinkDetailsPage from './pages/LinkDetailsPage';
// import RedirectHandlerPage from './pages/RedirectHandlerPage'; // Removed
import NotFoundPage from './pages/NotFoundPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loadingAuth } = useAuth();
  if (loadingAuth) {
    // Optionally return a global loading spinner here
    return <div className="flex justify-center items-center h-screen"><p>טוען אימות...</p></div>;
  }
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/link/:linkId" element={<ProtectedRoute><LinkDetailsPage /></ProtectedRoute>} />
          {/* <Route path="/r/:linkId" element={<RedirectHandlerPage />} /> */} {/* Route removed */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;