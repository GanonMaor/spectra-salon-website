import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

interface NavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navigation = ({ isMobileMenuOpen, setIsMobileMenuOpen }: NavigationProps) => {
  const [isFeatureMenuOpen, setIsFeatureMenuOpen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const location = useLocation();

  const features = [
    {
      title: "Smart",
      subtitle: "Inventory",
      description: "Track every tube. Know exactly what you have. Never run out again.",
      gradient: "linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)",
      glowColor: "rgba(0, 122, 255, 0.25)",
      textColor: "#007AFF",
      icon: "📱",
      accentColor: "#007AFF"
    },
    {
      title: "Perfect",
      subtitle: "Color Mix",
      description: "Precise formulas. Zero waste. Every shade, perfectly mixed.",
      gradient: "linear-gradient(135deg, #d4a574 0%, #c79c6d 50%, #b8906b 100%)",
      glowColor: "rgba(212, 165, 116, 0.25)",
      textColor: "#c79c6d",
      icon: "🎨",
      accentColor: "#c79c6d"
    },
    {
      title: "AI",
      subtitle: "Analytics",
      description: "Smart insights that predict trends and optimize your color inventory.",
      gradient: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
      glowColor: "rgba(255, 107, 107, 0.25)",
      textColor: "#FF6B6B",
      icon: "🧠",
      accentColor: "#FF6B6B"
    },
    {
      title: "Real-time",
      subtitle: "Tracking",
      description: "Live updates on every color usage, waste reduction, and profit margins.",
      gradient: "linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)",
      glowColor: "rgba(78, 205, 196, 0.25)",
      textColor: "#4ECDC4",
      icon: "📊",
      accentColor: "#4ECDC4"
    },
    {
      title: "Professional",
      subtitle: "Management",
      description: "Complete salon control from one beautiful, intuitive interface.",
      gradient: "linear-gradient(135deg, #8E8E93 0%, #636366 100%)",
      glowColor: "rgba(142, 142, 147, 0.25)",
      textColor: "#8E8E93",
      icon: "💼",
      accentColor: "#8E8E93"
    }
  ];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsFeatureMenuOpen(false);
      setHoveredFeature(null);
    }
  };

  const handleLogoClick = () => {
    setIsFeatureMenuOpen(false);
    setHoveredFeature(null);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="w-full px-2 sm:px-4">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-18">
            
            {/* Spectra Logo - מרווח נוח מהשמאל */}
            <div className="flex items-center">
              <Link 
                to="/"
                onClick={handleLogoClick}
                className="transition-transform duration-200 hover:scale-105"
              >
                <img 
                  src="/image.png" 
                  alt="Spectra Logo" 
                  className="h-5 sm:h-6 md:h-8 lg:h-10 w-auto"
                  loading="eager"
                />
              </Link>
            </div>

            {/* Desktop Navigation - מרכז */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8 absolute left-1/2 transform -translate-x-1/2">
              <Link 
                to="/" 
                className={`transition-colors duration-200 font-medium ${
                  location.pathname === '/' 
                    ? 'text-[#c79c6d]' 
                    : 'text-gray-700 hover:text-[#c79c6d]'
                }`}
              >
                Home
              </Link>
              
              <Link 
                to="/features" 
                className={`transition-colors duration-200 font-medium ${
                  location.pathname === '/features' 
                    ? 'text-[#c79c6d]' 
                    : 'text-gray-700 hover:text-[#c79c6d]'
                }`}
              >
                Features
              </Link>
              
              <Link 
                to="/about" 
                className={`transition-colors duration-200 font-medium ${
                  location.pathname === '/about' 
                    ? 'text-[#c79c6d]' 
                    : 'text-gray-700 hover:text-[#c79c6d]'
                }`}
              >
                About
              </Link>
            </div>

            {/* Desktop CTA Buttons - רווח סימטרי */}
            <div className="hidden md:flex items-center gap-6">
              {/* Social Links - סגנון דקיק כמו לינקי הנוויגייטור */}
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/spectra.ci/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-[#c79c6d] transition-colors duration-200 font-medium text-sm flex items-center gap-1.5"
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText("Hi! I'm interested in learning more about Spectra. Can you help me get started?");
                    window.open("https://www.instagram.com/spectra.ci/", "_blank");
                    const notification = document.createElement('div');
                    notification.innerHTML = 'Message copied! Paste it in Instagram DM';
                    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                    document.body.appendChild(notification);
                    setTimeout(() => notification.remove(), 3000);
                  }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                  </svg>
                  DM us on Instagram
                </a>

                <a
                  href="https://wa.me/972504322680?text=Hi! I'm interested in learning more about Spectra"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-[#c79c6d] transition-colors duration-200 font-medium text-sm flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp
                </a>
              </div>

              {/* Main CTA - רווח סימטרי משני הצדדים */}
              <div className="flex items-center">
                <button className="bg-[#007AFF] hover:bg-[#0056CC] text-white px-6 py-3 rounded-full font-semibold text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02]">
                  Start Free Trial
                </button>
              </div>
            </div>

            {/* Mobile Menu Button - מרווח נוח מהימין */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 z-50 relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu - שיפור ה-z-index והפוזישן */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
            <div className="px-4 py-3 space-y-2">
              <Link
                to="/"
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === '/'
                    ? 'text-[#c79c6d] bg-[#c79c6d]/10'
                    : 'text-gray-700 hover:text-[#c79c6d] hover:bg-gray-50 active:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🏠 Home
              </Link>
              <Link
                to="/features"
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === '/features'
                    ? 'text-[#c79c6d] bg-[#c79c6d]/10'
                    : 'text-gray-700 hover:text-[#c79c6d] hover:bg-gray-50 active:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ⚡ Features
              </Link>
              <Link
                to="/about"
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === '/about'
                    ? 'text-[#c79c6d] bg-[#c79c6d]/10'
                    : 'text-gray-700 hover:text-[#c79c6d] hover:bg-gray-50 active:bg-gray-100'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ℹ️ About
              </Link>
              <div className="pt-3 border-t border-gray-100 space-y-4">
                {/* Mobile Social Links */}
                <div className="flex gap-6 justify-center">
                  <a
                    href="https://www.instagram.com/spectra.ci/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-[#c79c6d] transition-colors duration-200 font-medium text-base flex items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      navigator.clipboard.writeText("Hi! I'm interested in learning more about Spectra. Can you help me get started?");
                      window.open("https://www.instagram.com/spectra.ci/", "_blank");
                      setIsMobileMenuOpen(false);
                      const notification = document.createElement('div');
                      notification.innerHTML = 'Message copied! Paste it in Instagram DM';
                      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                      document.body.appendChild(notification);
                      setTimeout(() => notification.remove(), 3000);
                    }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                    </svg>
                    DM us on Instagram
                  </a>
                  
                  <a
                    href="https://wa.me/972504322680?text=Hi! I'm interested in learning more about Spectra"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-[#c79c6d] transition-colors duration-200 font-medium text-base flex items-center gap-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    WhatsApp
                  </a>
                </div>
                
                <button 
                  className="w-full bg-[#007AFF] hover:bg-[#0056CC] active:bg-[#004999] text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 shadow-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* MEGA MENU with Proper Close Detection */}
      {isFeatureMenuOpen && (
        <div 
          className="fixed inset-0 top-[72px] z-40"
          onMouseLeave={() => {
            // Close popup when mouse leaves the entire container from ANY side
            setTimeout(() => {
              setIsFeatureMenuOpen(false);
              setHoveredFeature(null);
            }, 100);
          }}
          onClick={handleBackdropClick}
        >
          {/* Subtle Glass Backdrop - Very gentle blur effect */}
          <div 
            className="absolute inset-0 cursor-pointer transition-all duration-300 ease-out"
            style={{
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              background: 'rgba(255, 255, 255, 0.02)'
            }}
          />
          
          {/* Mega Menu Content */}
          <div className="relative w-[85vw] max-w-[1400px] h-[82vh] mx-auto mt-[1vh] px-6 overflow-y-auto pointer-events-none">
            <div 
              className="h-full rounded-[2rem] overflow-hidden shadow-2xl pointer-events-auto relative flex flex-col transition-all duration-300 ease-out"
              onMouseEnter={() => {
                // Prevent closing when mouse is inside the popup content
              }}
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.98) 0%, 
                    rgba(248, 246, 243, 0.96) 50%,
                    rgba(253, 252, 251, 0.98) 100%
                  )
                `,
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                border: '2px solid rgba(255, 255, 255, 0.9)',
                boxShadow: hoveredFeature !== null 
                  ? `0 30px 60px -15px ${features[hoveredFeature].glowColor}, 0 15px 30px -8px rgba(199, 156, 109, 0.25)`
                  : `0 30px 60px -15px rgba(0, 0, 0, 0.15), 0 15px 30px -8px rgba(199, 156, 109, 0.25)`
              }}
            >
              {/* Refined Close Button */}
              <button
                onClick={() => {
                  setIsFeatureMenuOpen(false);
                  setHoveredFeature(null);
                }}
                className="absolute top-6 right-6 z-50 group flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 hover:bg-white/95"
              >
                <svg className="w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors duration-200">
                  Close
                </span>
              </button>

              <div className="flex-1 p-12 flex flex-col">
                
                {/* Dynamic Header */}
                <div className="text-center mb-12">
                  <div 
                    className="inline-flex items-center gap-4 backdrop-blur-3xl rounded-full px-8 py-4 mb-8 border shadow-lg transition-all duration-500"
                    style={{
                      background: hoveredFeature !== null 
                        ? features[hoveredFeature].glowColor.replace('0.25', '0.15')
                        : 'rgba(255, 255, 255, 0.8)',
                      borderColor: hoveredFeature !== null 
                        ? features[hoveredFeature].accentColor + '40'
                        : 'rgba(199, 156, 109, 0.2)',
                      boxShadow: hoveredFeature !== null 
                        ? `0 10px 25px ${features[hoveredFeature].glowColor}`
                        : '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <div 
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ 
                        background: hoveredFeature !== null 
                          ? features[hoveredFeature].accentColor 
                          : '#c79c6d' 
                      }}
                    ></div>
                    <span className="text-[#8b7355] text-sm font-semibold uppercase tracking-[0.2em]">
                      {hoveredFeature !== null 
                        ? `${features[hoveredFeature].title} ${features[hoveredFeature].subtitle}` 
                        : 'Five Powerful Tools'
                      }
                    </span>
                    <div 
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ 
                        background: hoveredFeature !== null 
                          ? features[hoveredFeature].accentColor 
                          : '#d4a574' 
                      }}
                    ></div>
                  </div>
                  
                  <h3 
                    className="text-4xl lg:text-5xl font-extralight mb-3 leading-tight tracking-[-0.02em] transition-colors duration-500"
                    style={{
                      color: hoveredFeature !== null 
                        ? features[hoveredFeature].accentColor 
                        : '#1d1d1f'
                    }}
                  >
                    Revolutionary
                  </h3>
                  <h3 className="text-4xl lg:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#d4a574] via-[#c79c6d] to-[#b8906b] leading-tight tracking-[-0.02em] drop-shadow-sm mb-6">
                    Salon Tools
                  </h3>
                  <p className="text-lg text-[#6b5b47] font-light max-w-4xl mx-auto leading-relaxed">
                    {hoveredFeature !== null 
                      ? features[hoveredFeature].description
                      : 'Five cutting-edge tools that transform your salon into a profit-generating machine'
                    }
                  </p>
                </div>

                {/* 5 Tools Grid */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                  {features.map((feature, index) => (
                    <div
                      key={`feature-${index}`}
                      className="group relative"
                      onMouseEnter={() => setHoveredFeature(index)}
                      onMouseLeave={() => setHoveredFeature(null)}
                    >
                      {/* Refined Floating Glow - More subtle */}
                      <div 
                        className="absolute -inset-2 rounded-[2rem] blur-lg transition-all duration-500 ease-out pointer-events-none"
                        style={{
                          background: feature.glowColor.replace('0.25', '0.12'),
                          opacity: hoveredFeature === index ? 0.8 : 0
                        }}
                      />
                      
                      {/* Main Card */}
                      <div 
                        className="relative h-[320px] rounded-[2rem] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 ease-out hover:scale-[1.02] border"
                        style={{
                          background: feature.gradient,
                          borderColor: hoveredFeature === index 
                            ? feature.accentColor + '60'
                            : 'rgba(255, 255, 255, 0.2)',
                          boxShadow: hoveredFeature === index 
                            ? `0 20px 40px ${feature.glowColor.replace('0.25', '0.15')}, 0 10px 20px rgba(0, 0, 0, 0.1)`
                            : '0 10px 20px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {/* Content */}
                        <div className="relative h-full flex flex-col justify-between p-6">
                          <div className="text-white">
                            <h4 className="text-xl font-extralight mb-2 leading-tight tracking-[-0.02em] drop-shadow-sm">
                              {feature.title}
                            </h4>
                            <h4 className="text-xl font-light mb-4 leading-tight tracking-[-0.02em] drop-shadow-sm">
                              {feature.subtitle}
                            </h4>
                            <p className="text-sm text-white/90 mb-6 leading-relaxed font-light">
                              {feature.description}
                            </p>
                            
                            <button 
                              className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold text-sm hover:bg-white/30 transition-all duration-300 shadow-md border border-white/30"
                              style={{
                                boxShadow: hoveredFeature === index 
                                  ? `0 5px 15px ${feature.glowColor.replace('0.25', '0.15')}`
                                  : '0 5px 15px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              Explore
                            </button>
                          </div>
                          
                          {/* Floating Icon */}
                          <div className="absolute top-4 right-4">
                            <div 
                              className="w-12 h-12 transform rotate-6 hover:rotate-3 transition-all duration-500 ease-out rounded-lg border shadow-lg flex items-center justify-center"
                              style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                transform: hoveredFeature === index 
                                  ? 'rotate(3deg) scale(1.05)' 
                                  : 'rotate(6deg) scale(1)'
                              }}
                            >
                              <div className="text-white text-2xl opacity-90">{feature.icon}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center">
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button 
                      className="group relative px-10 py-4 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                      style={{
                        background: hoveredFeature !== null 
                          ? features[hoveredFeature].gradient
                          : 'linear-gradient(135deg, #c79c6d 0%, #d4a574 100%)',
                        boxShadow: hoveredFeature !== null 
                          ? `0 10px 30px ${features[hoveredFeature].glowColor}`
                          : '0 10px 30px rgba(199, 156, 109, 0.3)'
                      }}
                    >
                      <span className="relative z-10">
                        {hoveredFeature !== null 
                          ? `Experience ${features[hoveredFeature].title} ${features[hoveredFeature].subtitle}` 
                          : 'Try All Tools Free'
                        }
                      </span>
                    </button>
                    
                    <button className="group flex items-center gap-3 text-[#6b5b47] hover:text-[#c79c6d] font-medium text-base transition-all duration-200">
                      <div className="w-12 h-12 bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-200/50 group-hover:bg-white/80 transition-all duration-200">
                        <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 5v10l8-5-8-5z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">Watch Demo</div>
                        <div className="text-xs text-gray-500">2 minutes</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 