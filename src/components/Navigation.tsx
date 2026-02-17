import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ContactFormModal } from "./ContactForm/ContactFormModal";

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hiddenUnlocked, setHiddenUnlocked] = useState(false);
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);
  const [showHiddenGate, setShowHiddenGate] = useState(false);
  const [hiddenCode, setHiddenCode] = useState("");
  const [hiddenCodeError, setHiddenCodeError] = useState("");

  const [showContactModal, setShowContactModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Market Intelligence separate gate
  const [miUnlocked, setMiUnlocked] = useState(() => sessionStorage.getItem("mi_unlocked") === "1");
  const [showMiGate, setShowMiGate] = useState(false);
  const [miCode, setMiCode] = useState("");
  const [miCodeError, setMiCodeError] = useState("");

  // Detect scroll to change navbar background
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = window.innerHeight * 0.8;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hiddenLinks = [
    { label: "Investor Deck", to: "/new-investors-deck" },
    { label: "Investor Deck v2", to: "/new-investors-deck-v2" },
    { label: "Lead Capture", to: "/lead-capture" },
    { label: "Admin Dashboard", to: "/admin" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/95 backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 group">
              <img
                className="h-5 w-auto sm:h-6 transition-all duration-300 group-hover:opacity-80"
                src="/spectra-logo-new.png"
                alt="Spectra - AI-Powered Color Intelligence"
                loading="eager"
                decoding="async"
                onError={(e) => {
                  console.log("New logo failed to load, using fallback");
                  e.currentTarget.src = "/spectra_logo.png";
                }}
              />
            </Link>
          </div>

          {/* Navigation Links (desktop) */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              <Link
                to="/"
                className="text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                About
              </Link>
              <Link
                to="/ugc-offer"
                className="text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              >
                Special Offer
              </Link>
              {/* Salon Performance */}
              <Link
                to="/crm/analytics"
                className="text-blue-400/80 hover:text-blue-300 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
                Salon Performance
              </Link>

              {/* Market Intelligence (separate, own code) */}
              <button
                type="button"
                onClick={() => {
                  if (miUnlocked) {
                    navigate("/market-intelligence");
                  } else {
                    setShowMiGate(true);
                    setMiCode("");
                    setMiCodeError("");
                  }
                }}
                className="text-amber-400/80 hover:text-amber-300 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Market Intel
              </button>

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
                  className="text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1"
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
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => { setShowHiddenMenu(false); setShowContactModal(true); }}
                      className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                    >
                      📋 New Table
                    </button>
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
              className="inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:text-white hover:bg-white/10 focus:outline-none transition-all"
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
        </div>
      </div>
      {/* Mobile Menu Panel */}
      <div className={`md:hidden ${mobileOpen ? "block" : "hidden"}`}>
        <div className="px-4 pb-4 border-t border-gray-100 bg-white/95 backdrop-blur-md shadow">
          <div className="flex flex-col gap-2 py-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Home</Link>
            <Link to="/about" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">About</Link>
            <Link to="/ugc-offer" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Special Offer</Link>
            <Link to="/crm/analytics" onClick={() => setMobileOpen(false)} className="px-3 py-2 rounded-lg text-blue-700 hover:bg-blue-50 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Salon Performance
            </Link>
            <button
              onClick={() => {
                if (miUnlocked) {
                  navigate("/market-intelligence");
                  setMobileOpen(false);
                } else {
                  setShowMiGate(true);
                  setMiCode("");
                  setMiCodeError("");
                }
              }}
              className="text-left px-3 py-2 rounded-lg text-amber-700 hover:bg-amber-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Market Intel
            </button>
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
                <button
                  onClick={() => { setMobileOpen(false); setShowHiddenMenu(false); setShowContactModal(true); }}
                  className="text-left px-3 py-2 rounded-lg text-amber-600 hover:bg-amber-50 flex items-center gap-2"
                >
                  📋 New Table
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
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
      {/* Market Intelligence Gate Modal */}
      {showMiGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowMiGate(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 sm:p-8 text-center border border-gray-200">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Market Intelligence</h3>
            <p className="text-sm text-gray-500 mb-6">Enter access code to open dashboard</p>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={miCode}
              onChange={(e) => {
                const digits = e.currentTarget.value.replace(/\D/g, "");
                setMiCode(digits);
                if (miCodeError) setMiCodeError("");
                if (digits.length === 6 && digits !== "070315") {
                  setMiCodeError("Incorrect code. Try again.");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (miCode === "070315") {
                    setMiUnlocked(true);
                    sessionStorage.setItem("mi_unlocked", "1");
                    setShowMiGate(false);
                    setMiCodeError("");
                    navigate("/market-intelligence");
                  } else {
                    setMiCodeError("Incorrect code. Try again.");
                  }
                }
              }}
              className="w-full text-center tracking-[0.4em] text-xl sm:text-2xl font-semibold bg-gray-50 text-gray-900 placeholder:text-gray-400 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="• • • • • •"
              autoFocus
            />
            {miCodeError && (
              <p className="text-xs text-red-500 mt-3">{miCodeError}</p>
            )}
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setShowMiGate(false)}
                className="px-5 py-2.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (miCode === "070315") {
                    setMiUnlocked(true);
                    sessionStorage.setItem("mi_unlocked", "1");
                    setShowMiGate(false);
                    setMiCodeError("");
                    navigate("/market-intelligence");
                  } else {
                    setMiCodeError("Incorrect code. Try again.");
                  }
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Contact Form Modal */}
      <ContactFormModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </nav>
  );
};
