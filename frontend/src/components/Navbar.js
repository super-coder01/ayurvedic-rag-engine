import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-ayurveda-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-xl font-bold">
            🌿 Ayurvedic Nutrition Engine
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">Welcome, {user.username}</span>
                <Link to="/dashboard" className="hover:text-ayurveda-accent">
                  Dashboard
                </Link>
                <Link to="/generate-plan" className="hover:text-ayurveda-accent">
                  Generate Plan
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-ayurveda-secondary px-3 py-1 rounded hover:bg-ayurveda-dark transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-ayurveda-accent">
                  Login
                </Link>
                <Link to="/register" className="bg-ayurveda-secondary px-3 py-1 rounded hover:bg-ayurveda-dark transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;