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
  const [hiddenUnlocked, setHiddenUnlocked] = useState(false);
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);
  const [showHiddenGate, setShowHiddenGate] = useState(false);
  const [hiddenCode, setHiddenCode] = useState("");
  const [hiddenCodeError, setHiddenCodeError] = useState("");
  const { addToast } = useToast();

  const hiddenLinks = [
    { label: "Investor Deck", to: "/investors" },
    { label: "Investor Deck (New Design)", to: "/new-design" },
    { label: "Investor Deck (2026)", to: "/new-investors-deck" },
    { label: "Deep Blue Glass", to: "/deep-blue" },
    { label: "Analytics Dashboard", to: "/analytics" },
    { label: "Payments", to: "/payments" },
    { label: "Lead Capture", to: "/lead-capture" },
  ];

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
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    if (hiddenUnlocked) {
                      setShowHiddenMenu((v) => !v);
                    } else {
                      setShowHiddenGate(true);
                      setHiddenCode("");
                      setHiddenCodeError("");
                    }
                  }}
                  className="text-gray-600 hover:text-[#B18059] px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#EAB776]/10 inline-flex items-center gap-1"
                >
                  Hidden Pages
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {hiddenUnlocked && showHiddenMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {hiddenLinks.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowHiddenMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
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
            <button
              onClick={() => {
                if (hiddenUnlocked) {
                  setShowHiddenMenu((v) => !v);
                } else {
                  setShowHiddenGate(true);
                  setHiddenCode("");
                  setHiddenCodeError("");
                }
              }}
              className="text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Hidden Pages
            </button>
            {hiddenUnlocked && showHiddenMenu && (
              <div className="ml-3 border-l border-gray-100 pl-3 flex flex-col gap-1">
                {hiddenLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => { setMobileOpen(false); setShowHiddenMenu(false); }}
                    className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            )}

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
      {showHiddenGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowHiddenGate(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 sm:p-8 text-center border border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Enter Access Code</h3>
            <p className="text-sm text-gray-500 mb-6">Unlock hidden pages</p>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={hiddenCode}
              onChange={(e) => {
                const digits = e.currentTarget.value.replace(/\D/g, "");
                setHiddenCode(digits);
                if (hiddenCodeError) setHiddenCodeError("");
                if (digits.length === 4 && digits !== "1212") {
                  setHiddenCodeError("Incorrect code. Try again.");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (hiddenCode === "1212") {
                    setHiddenUnlocked(true);
                    setShowHiddenGate(false);
                    setHiddenCodeError("");
                    setShowHiddenMenu(true);
                  } else {
                    setHiddenCodeError("Incorrect code. Try again.");
                  }
                }
              }}
              className="w-full text-center tracking-[0.6em] text-xl sm:text-2xl font-semibold bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#B18059]"
              placeholder="• • • •"
            />
            {hiddenCodeError && (
              <p className="text-xs text-red-500 mt-3">{hiddenCodeError}</p>
            )}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setShowHiddenGate(false)}
                className="px-5 py-2.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (hiddenCode === "1212") {
                    setHiddenUnlocked(true);
                    setShowHiddenGate(false);
                    setHiddenCodeError("");
                    setShowHiddenMenu(true);
                  } else {
                    setHiddenCodeError("Incorrect code. Try again.");
                  }
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#EAB776] to-[#B18059] text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
