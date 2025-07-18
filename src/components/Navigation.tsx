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
      localStorage.removeItem('auth_token');
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-10 w-auto"
                src="/base_logo.png"
                alt="Spectra"
                onError={(e) => {
                  console.log('Logo failed to load, using fallback');
                  e.currentTarget.src = "/image.png";
                }}
              />
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              <Link
                to="/about"
                className="text-gray-500 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/features"
                className="text-gray-500 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                to="/payments"
                className="text-gray-500 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/ugc-offer"
                className="text-pink-600 hover:text-pink-700 px-3 py-2 rounded-md text-sm font-semibold transition-colors"
              >
                🎁 Special Offer
              </Link>
              <Link
                to="/contact"
                className="text-gray-500 hover:text-pink-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700 hidden sm:block">
                  Welcome, {user?.full_name || user?.email}
                </span>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 