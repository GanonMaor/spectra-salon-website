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
    <nav className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Logo Section - צד שמאל */}
          <div className="flex items-center ml-[10%]">
            <Link to="/" className="flex-shrink-0 group">
              <div className="relative flex items-center justify-center">
                {/* Glow effect behind logo */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#EAB776]/20 via-[#B18059]/20 to-[#EAB776]/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                
                {/* Main logo */}
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

          {/* Navigation Links - ממורכז */}
          <div className="hidden lg:flex lg:items-center lg:justify-center lg:space-x-2">
            <Link
              to="/about"
              className="relative text-gray-700 hover:text-[#B18059] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-[#EAB776]/5 hover:to-[#B18059]/5 group"
            >
              <span className="relative z-10">About</span>
            </Link>
            <Link
              to="/features"
              className="relative text-gray-700 hover:text-[#B18059] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-[#EAB776]/5 hover:to-[#B18059]/5 group"
            >
              <span className="relative z-10">Features</span>
            </Link>
            <Link
              to="/payments"
              className="relative text-gray-700 hover:text-[#B18059] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-[#EAB776]/5 hover:to-[#B18059]/5 group"
            >
              <span className="relative z-10">Pricing</span>
            </Link>
            <Link
              to="/ugc-offer"
              className="relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 group border border-[#EAB776]/30"
              style={{
                background: `linear-gradient(129.67deg, #EAB776/10 9.93%, #B18059/10 130.56%)`,
                color: '#B18059'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="text-orange-500 text-sm">🎁</span>
                <span className="hidden xl:inline">Special Offer</span>
                <span className="xl:hidden">Offer</span>
              </span>
            </Link>
            <Link
              to="/contact"
              className="relative text-gray-700 hover:text-[#B18059] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gradient-to-r hover:from-[#EAB776]/5 hover:to-[#B18059]/5 group"
            >
              <span className="relative z-10">Contact</span>
            </Link>
          </div>
          
          {/* Right Side - Auth Buttons עם padding מימין */}
          <div className="flex items-center space-x-3 mr-[10%]">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-700 hidden md:block font-medium truncate max-w-32 lg:max-w-none">
                  Welcome, {user?.full_name || user?.email}
                </span>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 text-white"
                    style={{
                      background: `linear-gradient(129.67deg, #B18059 9.93%, #EAB776 130.56%)`
                    }}
                  >
                    <span className="relative z-10 hidden sm:inline">Admin Dashboard</span>
                    <span className="relative z-10 sm:hidden">Admin</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100"
                >
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-[#B18059] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100"
                >
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">In</span>
                </Link>
                <Link
                  to="/signup"
                  className="relative px-4 sm:px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 group overflow-hidden text-white"
                  style={{
                    background: `linear-gradient(129.67deg, #EAB776 9.93%, #B18059 130.56%)`
                  }}
                >
                  <span className="relative z-10">
                    <span className="hidden sm:inline">Start Free Trial</span>
                    <span className="sm:hidden">Trial</span>
                  </span>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 