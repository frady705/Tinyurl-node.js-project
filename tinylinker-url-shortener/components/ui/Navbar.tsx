
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button'; // Assuming Button component exists

const Navbar: React.FC = () => {
  const { user, logout, loadingAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-sky-600 to-cyan-500 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-white hover:text-sky-100 transition-colors">
            TinyLinker
          </Link>
          <div className="flex items-center space-x-4">
            {!loadingAuth && user && (
              <span className="text-white text-sm hidden sm:block">ברוך הבא, {user.name}!</span>
            )}
            {!loadingAuth && user ? (
              <Button onClick={handleLogout} variant="secondary" size="sm">
                התנתק
              </Button>
            ) : !loadingAuth && (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="sm">התחבר</Button>
                </Link>
              </>
            )}
             {loadingAuth && <div className="text-white text-sm">טוען...</div>}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;