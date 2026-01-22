import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUserContext } from "../context/UserContext";
import { apiClient } from "../api/client";
import { ConfirmationModal } from "./ui/confirmation-modal";
import { useToast } from "./ui/toast";

export const Navigation: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useUserContext();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { addToast } = useToast();

  const handleSignOut = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      addToast({
        type: "success",
        message: "Successfully logged out",
        duration: 3000,
      });
    } catch (error) {
      console.error("Sign out error:", error);
      addToast({
        type: "error",
        message: "Error during logout. Please try again.",
        duration: 5000,
      });

      // fallback cleanup
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
      window.location.href = "/";
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
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
                  loading="eager"
                  decoding="async"
                  onError={(e) => {
                    console.log("New logo failed to load, using fallback");
                    e.currentTarget.src = "/spectra_logo.png";
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links (desktop) */}
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
                to="/ugc-offer"
                className="text-gray-600 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10"
              >
                Special Offer
              </Link>
              <Link
                to="/investors"
                className="text-gray-600 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10"
              >
                Investors
              </Link>
              <Link
                to="/analytics"
                className="text-gray-600 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10"
              >
                Analytics
              </Link>
              <Link
                to="/new-design"
                className="text-gray-600 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10"
              >
                New Design
              </Link>
            </div>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            >
              {mobileOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Authentication Section (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* User Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-gray-700 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10"
                >
                  <span>👤</span>
                  <span className="hidden sm:inline">
                    {user?.full_name || user?.email?.split("@")[0]}
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
                  onClick={() => setShowLogoutModal(true)}
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
                  to="/signup?trial=true"
                  className="bg-gradient-to-r from-[#EAB776] to-[#B18059] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:from-[#B18059] hover:to-[#8B5D44] shadow-md hover:shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Menu Panel */}
      <div className={`md:hidden ${mobileOpen ? "block" : "hidden"}`}>
        <div className="px-4 pb-4 border-t border-gray-100 bg-white/95 backdrop-blur-md shadow">
          <div className="flex flex-col gap-2 py-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Home</Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">About</Link>
            <Link to="/ugc-offer" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Special Offer</Link>
            <Link to="/investors" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Investors</Link>
            <Link to="/analytics" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Analytics</Link>
            <Link to="/new-design" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">New Design</Link>

            <div className="border-t border-gray-100 my-2"></div>
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Profile</Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-purple-700 hover:bg-purple-50">Dashboard</Link>
                )}
                <button
                  onClick={() => { setShowLogoutModal(true); setMobileOpen(false); }}
                  className="text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Sign In</Link>
                <Link to="/signup?trial=true" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-md text-white bg-gradient-to-r from-[#EAB776] to-[#B18059]">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleSignOut}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        variant="destructive"
        loading={isLoggingOut}
      />
    </nav>
  );
};
