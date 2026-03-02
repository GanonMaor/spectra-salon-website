import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ContactFormModal } from "./ContactForm/ContactFormModal";
import { useSiteTheme, useSiteColors } from "../contexts/SiteTheme";

const ThemeToggleBtn: React.FC = () => {
  const { isDark, toggleTheme } = useSiteTheme();
  const c = useSiteColors();
  return (
    <button
      onClick={toggleTheme}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300"
      style={{ background: c.nav.toggleBg, border: `1px solid ${c.nav.toggleBorder}` }}
      title={isDark ? "Light mode" : "Dark mode"}
    >
      {isDark ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#EAB776" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#EAB776" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )}
    </button>
  );
};

export const Navigation: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hiddenUnlocked, setHiddenUnlocked] = useState(false);
  const [showHiddenMenu, setShowHiddenMenu] = useState(false);
  const [showHiddenGate, setShowHiddenGate] = useState(false);
  const [hiddenCode, setHiddenCode] = useState("");
  const [hiddenCodeError, setHiddenCodeError] = useState("");

  const [showContactModal, setShowContactModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { isDark } = useSiteTheme();
  const c = useSiteColors();

  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = window.innerHeight * 0.8;
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hiddenLinks = [
    { label: "HairGPT", to: "/hairgpt" },
    { label: "Lead Capture", to: "/lead-capture" },
    { label: "Salon Performance", to: "/crm/analytics" },
    { label: "CRM", to: "/crm" },
    { label: "Market Intelligence", to: "/market-intelligence" },
    { label: "Investor Deck", to: "/new-investors-deck" },
    { label: "Investor Deck v2", to: "/new-investors-deck-v2" },
    { label: "Admin Dashboard", to: "/admin" },
    { label: "AI Flywheel", to: "/investors-ai-flywheel" },
    { label: "L'Oréal Analytics", to: "/loreal-analytics" },
    { label: "Stock Grid", to: "/stock-grid" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 pt-[env(safe-area-inset-top)]"
      style={{
        background: isScrolled ? c.nav.scrolledBg : c.nav.bg,
        backdropFilter: isScrolled ? "blur(12px)" : "none",
      }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 group">
              <img
                className="h-5 w-auto sm:h-6 transition-all duration-300 group-hover:opacity-80"
                src="/spectra-logo-new.png"
                alt="Spectra - AI-Powered Color Intelligence"
                loading="eager"
                decoding="async"
                style={{ filter: "none" }}
                onError={(e) => {
                  e.currentTarget.src = "/spectra_logo.png";
                }}
              />
            </Link>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              <Link
                to="/"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ color: c.text.navLink }}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ color: c.text.navLink }}
              >
                About
              </Link>
              <Link
                to="/ugc-offer"
                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ color: c.text.navLink }}
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
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 inline-flex items-center gap-1"
                  style={{ color: c.text.navLink }}
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
                      New Table
                    </button>
                  </div>
                )}
              </div>
              <ThemeToggleBtn />
            </div>
          </div>

          {/* Mobile: toggle + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggleBtn />
            <button
              type="button"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-md p-2 focus:outline-none transition-all"
              style={{ color: c.nav.hamburger }}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 top-[calc(56px+env(safe-area-inset-top))] z-40">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div
            className="relative backdrop-blur-md shadow-xl max-h-[calc(100dvh-56px-env(safe-area-inset-top))] overflow-y-auto overscroll-contain"
            style={{ background: c.nav.mobileBg }}
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              <Link to="/" onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-base min-h-[44px] flex items-center"
                style={{ color: c.nav.mobileLink }}>Home</Link>
              <Link to="/about" onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-base min-h-[44px] flex items-center"
                style={{ color: c.nav.mobileLink }}>About</Link>
              <Link to="/ugc-offer" onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-base min-h-[44px] flex items-center"
                style={{ color: c.nav.mobileLink }}>Special Offer</Link>
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
                className="text-left px-4 py-3 rounded-xl text-base min-h-[44px] flex items-center"
                style={{ color: c.nav.mobileLink }}
              >
                Hidden Pages
              </button>
              {hiddenUnlocked && showHiddenMenu && (
                <div className="ml-3 border-l-2 pl-3 flex flex-col gap-1" style={{ borderColor: c.border.medium }}>
                  {hiddenLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => { setMobileOpen(false); setShowHiddenMenu(false); }}
                      className="px-4 py-3 rounded-xl text-sm min-h-[44px] flex items-center"
                      style={{ color: c.text.muted }}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => { setMobileOpen(false); setShowHiddenMenu(false); setShowContactModal(true); }}
                    className="text-left px-4 py-3 rounded-xl text-amber-600 flex items-center gap-2 text-sm min-h-[44px]"
                  >
                    New Table
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden gate modal */}
      {showHiddenGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowHiddenGate(false)} />
          <div className="relative w-full max-w-[90vw] sm:max-w-md rounded-3xl bg-white shadow-2xl p-5 sm:p-8 text-center border border-gray-200">
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
            {hiddenCodeError && <p className="text-xs text-red-500 mt-3">{hiddenCodeError}</p>}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-center gap-2 sm:gap-3 mt-6">
              <button onClick={() => setShowHiddenGate(false)} className="px-5 py-3 sm:py-2.5 rounded-full border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition min-h-[44px]">Cancel</button>
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
                className="px-6 py-3 sm:py-2.5 rounded-full bg-gradient-to-r from-[#EAB776] to-[#B18059] text-sm font-semibold text-white hover:opacity-90 transition min-h-[44px]"
              >Unlock</button>
            </div>
          </div>
        </div>
      )}

      <ContactFormModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} />
    </nav>
  );
};
