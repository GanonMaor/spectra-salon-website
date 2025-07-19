import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { apiClient } from "../api/client";

export const Navigation: React.FC = () => {
  const { user, isAuthenticated, isAdmin } = useUserContext();
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
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 group">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-r from-[#EAB776]/20 via-[#B18059]/20 to-[#EAB776]/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <img
                  className="relative h-6 w-auto sm:h-7 lg:h-8 transition-all duration-300 group-hover:scale-105"
                  src="/spectra-logo-new.png"
                  alt="Spectra - AI-Powered Color Intelligence"
                  onError={(e) => {
                    console.log('New logo failed to load, using fallback');
                    e.currentTarget.src = "/spectra_logo.png";
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-600 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10"
              >
                About
              </Link>
              <Link
                to="/features"
                className="text-gray-600 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10"
              >
                Features
              </Link>
              <Link
                to="/contact"
                className="text-gray-600 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Authentication Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* User Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10"
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">
                    {user?.full_name || user?.email?.split('@')[0]}
                  </span>
                </Link>

                {/* Admin Dashboard Link */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 text-purple-600 hover:text-purple-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-purple-50"
                  >
                    <span>👑</span>
                    <span className="hidden sm:inline">Dashboard</span>
                  </Link>
                )}

                {/* Sign Out Button */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-red-50"
                >
                  <span>🚪</span>
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-[#B18059] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-[#EAB776] to-[#B18059] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:from-[#B18059] hover:to-[#8B5D44] shadow-md hover:shadow-lg"
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