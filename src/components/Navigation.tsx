import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { apiClient } from "../api/client";

export const Navigation: React.FC = () => {
  const { user, isAuthenticated } = useUserContext();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await apiClient.logout();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      // Force logout locally even if API call fails
      localStorage.removeItem('auth_token');
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-8 w-auto"
                src="/base_logo.png"
                alt="Spectra"
              />
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/about"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                About
              </Link>
              <Link
                to="/features"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Features
              </Link>
              <Link
                to="/contact"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700">
                  Welcome, {user?.full_name || user?.email}
                </span>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-pink-600 hover:bg-pink-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 