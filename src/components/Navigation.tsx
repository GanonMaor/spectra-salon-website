import { useState } from "react";

interface NavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navigation = ({ isMobileMenuOpen, setIsMobileMenuOpen }: NavigationProps) => {
  const [isFeatureMenuOpen, setIsFeatureMenuOpen] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

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
      gradient: "linear-gradient(135deg, #1d1d1f 0%, #2c2c2e 50%, #1d1d1f 100%)",
      glowColor: "rgba(199, 156, 109, 0.15)",
      textColor: "#1d1d1f",
      icon: "🏪",
      accentColor: "#8E8E93"
    }
  ];

  // פונקציה לסגירת המנו
  const handleMenuLeave = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    
    if (clientY > rect.bottom + 10) {
      setIsFeatureMenuOpen(false);
      setHoveredFeature(null);
    }
  };

  // פונקציה לסגירת המנו בלחיצה על הרקע
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsFeatureMenuOpen(false);
      setHoveredFeature(null);
    }
  };

  // פונקציה לחזרה למסך הבית
  const handleLogoClick = () => {
    setIsFeatureMenuOpen(false);
    setHoveredFeature(null);
    // גלילה למעלה
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex justify-between items-center h-18">
            
            {/* Logo - Left Side עם לחיצה לחזרה למסך הבית */}
            <div className="flex items-center flex-shrink-0">
              <button onClick={handleLogoClick} className="transition-transform duration-200 hover:scale-105">
                <img className="h-9 w-auto" src="/image.png" alt="Spectra" />
              </button>
            </div>

            {/* Desktop Navigation - Center */}
            <div className="hidden lg:flex items-center space-x-12">
              {/* Features with Mega Menu */}
              <div 
                className="relative"
                onMouseEnter={() => setIsFeatureMenuOpen(true)}
              >
                <button className="text-[#1d1d1f] hover:text-[#c79c6d] transition-all duration-200 font-medium text-base tracking-[-0.01em] flex items-center gap-1">
                  Features
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${isFeatureMenuOpen ? 'rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <a 
                href="#about" 
                className="text-[#1d1d1f] hover:text-[#c79c6d] transition-all duration-200 font-medium text-base tracking-[-0.01em]"
              >
                About
              </a>
            </div>

            {/* CTA Button - Right Side */}
            <div className="flex items-center">
              <div className="hidden sm:block">
                <button className="group relative bg-[#007AFF] hover:bg-[#0056CC] text-white px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                  <span className="relative z-10">Start Free Trial</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF] to-[#0056CC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden ml-4 inline-flex items-center justify-center p-2 rounded-full text-[#1d1d1f] hover:text-[#c79c6d] hover:bg-gray-50 transition-all duration-200"
              >
                <svg
                  className={`h-6 w-6 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div 
              className="mx-6 sm:mx-8 mt-2 mb-4 rounded-2xl overflow-hidden shadow-xl"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.95) 0%, 
                    rgba(248, 246, 243, 0.9) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.8)'
              }}
            >
              <div className="p-6 space-y-4">
                <a 
                  href="#features-section" 
                  className="block text-[#1d1d1f] hover:text-[#c79c6d] transition-all duration-200 font-medium text-lg py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#about" 
                  className="block text-[#1d1d1f] hover:text-[#c79c6d] transition-all duration-200 font-medium text-lg py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
                
                <div className="pt-4 border-t border-gray-200/50">
                  <button className="w-full group relative bg-[#007AFF] hover:bg-[#0056CC] text-white px-6 py-4 rounded-full font-medium text-base transition-all duration-300 shadow-lg hover:shadow-xl">
                    <span className="relative z-10">Start Free Trial</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF] to-[#0056CC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* MEGA MENU - עם תיקונים */}
      {isFeatureMenuOpen && (
        <div 
          className="fixed inset-0 top-[72px] z-40"
          onMouseLeave={handleMenuLeave}
          onClick={handleBackdropClick}
        >
          {/* Dynamic Rainbow Backdrop */}
          <div 
            className="absolute inset-0 transition-all duration-700 cursor-pointer"
            style={{
              background: hoveredFeature !== null 
                ? `radial-gradient(ellipse at center, 
                    ${features[hoveredFeature].glowColor} 0%, 
                    rgba(0, 0, 0, 0.1) 50%,
                    rgba(0, 0, 0, 0.2) 100%
                  )`
                : `linear-gradient(135deg, 
                    rgba(0, 122, 255, 0.05) 0%,
                    rgba(212, 165, 116, 0.05) 20%,
                    rgba(255, 107, 107, 0.05) 40%,
                    rgba(78, 205, 196, 0.05) 60%,
                    rgba(142, 142, 147, 0.05) 80%,
                    rgba(0, 0, 0, 0.1) 100%
                  )`,
              backdropFilter: 'blur(25px)'
            }}
          />
          
          {/* Mega Menu Content */}
          <div className="relative max-w-6xl mx-auto px-6 py-8 h-full overflow-y-auto pointer-events-none">
            <div 
              className="rounded-[2rem] overflow-hidden shadow-2xl pointer-events-auto relative"
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
                  : `0 30px 60px -15px rgba(0, 0, 0, 0.2), 0 15px 30px -8px rgba(199, 156, 109, 0.25)`
              }}
            >
              {/* Close Button - קרוב יותר לפריים */}
              <button
                onClick={() => {
                  setIsFeatureMenuOpen(false);
                  setHoveredFeature(null);
                }}
                className="absolute top-4 right-4 z-50 w-10 h-10 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200/50 hover:bg-white hover:scale-110"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="p-8">
                
                {/* Dynamic Header */}
                <div className="text-center mb-8">
                  <div 
                    className="inline-flex items-center gap-3 backdrop-blur-3xl rounded-full px-6 py-3 mb-6 border shadow-lg transition-all duration-500"
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
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ 
                        background: hoveredFeature !== null 
                          ? features[hoveredFeature].accentColor 
                          : '#c79c6d' 
                      }}
                    ></div>
                    <span className="text-[#8b7355] text-xs font-semibold uppercase tracking-[0.2em]">
                      {hoveredFeature !== null 
                        ? `${features[hoveredFeature].title} ${features[hoveredFeature].subtitle}` 
                        : 'Five Powerful Tools'
                      }
                    </span>
                    <div 
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ 
                        background: hoveredFeature !== null 
                          ? features[hoveredFeature].accentColor 
                          : '#d4a574' 
                      }}
                    ></div>
                  </div>
                  
                  <h3 
                    className="text-2xl lg:text-3xl font-extralight mb-2 leading-tight tracking-[-0.02em] transition-colors duration-500"
                    style={{
                      color: hoveredFeature !== null 
                        ? features[hoveredFeature].accentColor 
                        : '#1d1d1f'
                    }}
                  >
                    Revolutionary
                  </h3>
                  <h3 className="text-2xl lg:text-3xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#d4a574] via-[#c79c6d] to-[#b8906b] leading-tight tracking-[-0.02em] drop-shadow-sm mb-4">
                    Salon Tools
                  </h3>
                  <p className="text-base text-[#6b5b47] font-light max-w-3xl mx-auto leading-relaxed">
                    {hoveredFeature !== null 
                      ? features[hoveredFeature].description
                      : 'Five cutting-edge tools that transform your salon into a profit-generating machine'
                    }
                  </p>
                </div>

                {/* 5 כלים עוצמתיים - גריד דינמי */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {features.map((feature, index) => (
                    <div
                      key={`feature-${index}`}
                      className="group relative"
                      onMouseEnter={() => setHoveredFeature(index)}
                      onMouseLeave={() => setHoveredFeature(null)}
                    >
                      {/* Dynamic Floating Glow */}
                      <div 
                        className="absolute -inset-3 rounded-[1.5rem] blur-xl transition-all duration-700"
                        style={{
                          background: feature.glowColor,
                          opacity: hoveredFeature === index ? 1 : 0
                        }}
                      />
                      
                      {/* Main Card */}
                      <div 
                        className="relative h-[260px] rounded-[1.5rem] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-700 hover:scale-[1.05] border"
                        style={{
                          background: feature.gradient,
                          borderColor: hoveredFeature === index 
                            ? feature.accentColor + '60'
                            : 'rgba(255, 255, 255, 0.2)',
                          boxShadow: hoveredFeature === index 
                            ? `0 20px 40px ${feature.glowColor}, 0 10px 20px rgba(0, 0, 0, 0.1)`
                            : '0 10px 20px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {/* Content */}
                        <div className="relative h-full flex flex-col justify-between p-4">
                          <div className="text-white">
                            <h4 className="text-lg font-extralight mb-1 leading-tight tracking-[-0.02em] drop-shadow-sm">
                              {feature.title}
                            </h4>
                            <h4 className="text-lg font-light mb-3 leading-tight tracking-[-0.02em] drop-shadow-sm">
                              {feature.subtitle}
                            </h4>
                            <p className="text-xs text-white/90 mb-4 leading-relaxed font-light">
                              {feature.description}
                            </p>
                            
                            <button 
                              className="bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full font-semibold text-xs hover:bg-white/30 transition-all duration-300 shadow-md border border-white/30"
                              style={{
                                boxShadow: hoveredFeature === index 
                                  ? `0 5px 15px ${feature.glowColor}`
                                  : '0 5px 15px rgba(0, 0, 0, 0.1)'
                              }}
                            >
                              Explore
                            </button>
                          </div>
                          
                          {/* Floating Icon */}
                          <div className="absolute top-3 right-3">
                            <div 
                              className="w-10 h-10 transform rotate-6 hover:rotate-3 transition-all duration-700 rounded-lg border shadow-lg flex items-center justify-center"
                              style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderColor: 'rgba(255, 255, 255, 0.3)',
                                transform: hoveredFeature === index 
                                  ? 'rotate(3deg) scale(1.1)' 
                                  : 'rotate(6deg) scale(1)'
                              }}
                            >
                              <div className="text-white text-xl opacity-90">{feature.icon}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dynamic CTA */}
                <div className="text-center mt-8">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button 
                      className="group relative px-8 py-3 text-white font-semibold text-base rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
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
                    
                    <button className="group flex items-center gap-3 text-[#1d1d1f] hover:text-[#c79c6d] font-medium text-base transition-all duration-300 px-6 py-3">
                      <div 
                        className="w-10 h-10 backdrop-blur-xl rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg border"
                        style={{
                          background: hoveredFeature !== null 
                            ? features[hoveredFeature].glowColor.replace('0.25', '0.1')
                            : 'rgba(255, 255, 255, 0.95)',
                          borderColor: hoveredFeature !== null 
                            ? features[hoveredFeature].accentColor + '40'
                            : 'rgba(199, 156, 109, 0.2)'
                        }}
                      >
                        <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 5v10l8-5-8-5z"/>
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-sm">Watch Demo</div>
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