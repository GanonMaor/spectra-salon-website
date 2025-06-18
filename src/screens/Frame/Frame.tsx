import { useState } from "react";
import { Button } from "../../components/ui/button";
import { ClientCarousel } from "../../components/ClientCarousel";

// CSS classes moved to avoid repetitive inline styles
const bgGradientStyle = {
  background: `
    linear-gradient(135deg, 
      #f9f7f4 0%, 
      #f5f1eb 25%, 
      #f8f5f0 50%, 
      #f3ede5 75%, 
      #f6f2ec 100%
    )
  `
};

const cardGradientStyle = {
  background: `
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0.85) 100%
    )
  `,
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: `
    0 25px 50px -12px rgba(0, 0, 0, 0.1),
    0 10px 30px -8px rgba(199, 156, 109, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.9)
  `
};

const sphereGradientStyle = {
  background: `
    radial-gradient(circle at 30% 30%, 
      #ffffff 0%, 
      #c79c6d 30%, 
      #b8906b 70%, 
      #a67c5a 100%
    )
  `,
  boxShadow: `
    0 0 0 4px rgba(199, 156, 109, 0.1),
    0 20px 40px rgba(199, 156, 109, 0.3),
    inset -10px -10px 20px rgba(0, 0, 0, 0.1),
    inset 10px 10px 20px rgba(255, 255, 255, 0.8)
  `
};

const ctaButtonStyle = {
  background: 'linear-gradient(135deg, #c79c6d 0%, #d4a574 100%)',
  color: 'white',
  boxShadow: '0 10px 30px -8px rgba(199, 156, 109, 0.4)'
};

const floatingElementStyle = {
  background: `
    linear-gradient(135deg, 
      rgba(255, 255, 255, 0.9) 0%,
      rgba(245, 241, 235, 0.8) 100%
    )
  `,
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(199, 156, 109, 0.2)',
  boxShadow: '0 10px 25px rgba(199, 156, 109, 0.2)'
};

export const Frame = (): JSX.Element => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredVideoStep, setHoveredVideoStep] = useState<number | null>(null);

  const walkthroughSteps = [
    {
      image: "/stap 1 chack in.jpeg",
      title: "Check-In",
      alt: "Spectra Check-In process demonstration",
      description: "Client arrives and checks in through our streamlined system"
    },
    {
      image: "/stepn 2 select service.jpeg", 
      title: "Service",
      alt: "Professional hair service demonstration",
      description: "Professional hair service with precise color application"
    },
    {
      image: "/step 3 scan tube.jpeg",
      title: "Scan", 
      alt: "Barcode scanning demonstration",
      description: "Quick barcode scan to track product usage automatically"
    },
    {
      image: "/step 4 squiz the color.jpeg",
      title: "Squeeze",
      alt: "Precise color measurement demonstration",
      description: "Precise measurement and application with zero waste"
    },
    {
      image: "/step 4 squiz the color.jpeg",
      title: "Reweigh",
      alt: "Product reweighing demonstration",
      description: "Track leftovers, reduce waste, and start saving money"
    }
  ];

  const handleStepHover = (stepIndex: number) => {
    setHoveredVideoStep(stepIndex);
  };

  const handleStepLeave = () => {
    setHoveredVideoStep(null);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="bg-white w-full min-h-screen font-sans antialiased">
      {/* Navigation bar - CLEAN MINIMAL DESIGN */}
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img
                className="h-8 w-auto"
                alt="Spectra Logo"
                src="/image.png"
              />
            </div>

            {/* Minimal Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8" role="navigation" aria-label="Main navigation">
              <a 
                href="#features" 
                className="text-gray-700 hover:text-[#c79c6d] font-medium text-sm transition-colors duration-200"
              >
                Features
              </a>
              <a 
                href="#about" 
                className="text-gray-700 hover:text-[#c79c6d] font-medium text-sm transition-colors duration-200"
              >
                About
              </a>
              <a 
                href="#contact" 
                className="text-gray-700 hover:text-[#c79c6d] font-medium text-sm transition-colors duration-200"
              >
                Contact
              </a>
            </nav>

            {/* Clean CTA Button */}
            <div className="hidden lg:flex items-center">
              <Button className="bg-[#c79c6d] hover:bg-[#b8906b] text-white px-6 py-2 rounded-xl font-medium text-sm transition-all duration-200 border-0 h-auto shadow-lg hover:shadow-xl">
                Start now
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-[#c79c6d] hover:bg-gray-100 transition-all duration-200"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle mobile menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div id="mobile-menu" className="lg:hidden border-t border-gray-200/50 py-6 px-4">
              <nav className="space-y-6" role="navigation" aria-label="Mobile navigation">
                <a 
                  href="#features" 
                  className="block text-gray-700 hover:text-[#c79c6d] font-medium text-base py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#about" 
                  className="block text-gray-700 hover:text-[#c79c6d] font-medium text-base py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </a>
                <a 
                  href="#contact" 
                  className="block text-gray-700 hover:text-[#c79c6d] font-medium text-base py-2 transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </a>
                <Button className="w-full bg-[#c79c6d] hover:bg-[#b8906b] text-white py-3 rounded-xl font-medium text-base mt-4">
                  Start now
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - REFINED FLOATING CARD DESIGN */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Softer Gradient Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, 
                #fdfcfb 0%, 
                #f7f4f1 25%, 
                #f5f2ef 50%, 
                #f3f0ed 75%, 
                #f1eeeb 100%
              )
            `
          }}
        >
          {/* Very Subtle Background Patterns */}
          <div className="absolute inset-0 opacity-20" aria-hidden="true">
            <div className="absolute top-1/4 right-1/5 w-64 h-64 bg-gradient-to-br from-[#d4c4a8]/15 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/6 w-48 h-48 bg-gradient-to-br from-[#e8dcc6]/10 to-transparent rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#d4c4a8]/8 to-transparent rounded-full blur-3xl" />
          </div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="relative flex items-center justify-center min-h-[70vh]">
            
            {/* Crystal Sphere - Behind Everything */}
            <div className="absolute -top-12 -right-16 lg:-top-16 lg:-right-24 z-10" aria-hidden="true">
              <div 
                className="relative w-32 h-32 lg:w-40 lg:h-40 transform hover:scale-105 transition-all duration-1000 animate-pulse"
                style={{ 
                  animationDuration: '6s',
                  filter: 'drop-shadow(0 10px 25px rgba(212, 196, 168, 0.15))'
                }}
              >
                {/* Refined Crystal Sphere */}
                <div 
                  className="w-full h-full rounded-full relative overflow-hidden"
                  style={{
                    background: `
                      radial-gradient(circle at 25% 25%, 
                        rgba(255, 255, 255, 0.9) 0%, 
                        rgba(248, 245, 240, 0.8) 20%,
                        rgba(212, 196, 168, 0.6) 60%, 
                        rgba(200, 184, 158, 0.4) 100%
                      )
                    `,
                    boxShadow: `
                      0 0 0 2px rgba(212, 196, 168, 0.1),
                      0 8px 32px rgba(212, 196, 168, 0.15),
                      inset -8px -8px 16px rgba(200, 184, 158, 0.1),
                      inset 8px 8px 16px rgba(255, 255, 255, 0.8)
                    `
                  }}
                >
                  {/* Soft Highlight */}
                  <div className="absolute top-3 left-3 w-6 h-6 lg:w-8 lg:h-8 bg-white/70 rounded-full blur-sm" />
                  
                  {/* Gentle Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 lg:w-16 lg:h-16 text-[#d4c4a8]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Floating Card - Centered */}
            <main 
              className="relative max-w-5xl w-full mx-auto transform hover:-translate-y-1 transition-all duration-500"
              style={{ filter: 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.04))' }}
            >
              <div 
                className="relative p-8 sm:p-12 lg:p-16 rounded-3xl overflow-hidden"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(255, 255, 255, 0.95) 0%,
                      rgba(253, 252, 251, 0.9) 100%
                    )
                  `,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.6)',
                  boxShadow: `
                    0 8px 32px -8px rgba(0, 0, 0, 0.06),
                    0 4px 16px -4px rgba(212, 196, 168, 0.08),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8)
                  `
                }}
              >
                
                {/* Subtle Inner Glow */}
                <div 
                  className="absolute inset-0 rounded-3xl opacity-30"
                  style={{
                    background: `radial-gradient(circle at top left, rgba(212, 196, 168, 0.03) 0%, transparent 50%)`
                  }}
                  aria-hidden="true"
                />

                {/* Content Grid */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  
                  {/* Left Content */}
                  <div className="relative z-10 text-center lg:text-left">
                    
                    {/* Trust Badge */}
                    <div className="inline-flex items-center gap-2 bg-[#d4c4a8]/10 rounded-full px-4 py-2 mb-6 border border-[#d4c4a8]/20">
                      <div className="w-2 h-2 bg-[#d4c4a8] rounded-full animate-pulse" aria-hidden="true" />
                      <span className="text-[#a08d6b] text-sm font-medium">
                        Trusted by 500+ Premium Salons
                      </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-800 leading-[1.05] mb-6">
                      <span className="block">Transform Your</span>
                      <span className="block font-medium bg-gradient-to-r from-[#d4c4a8] to-[#c8b896] bg-clip-text text-transparent">
                        Salon Experience
                      </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed font-light">
                      Effortlessly reduce waste by <span className="text-[#a08d6b] font-medium">85%</span> 
                      while increasing profits through intelligent inventory management
                    </p>

                    {/* Benefits */}
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
                      {['5-minute setup', 'Instant ROI', 'Premium support'].map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2 bg-gray-50/70 rounded-full px-4 py-2">
                          <svg className="w-4 h-4 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-600 text-sm font-medium">{benefit}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-6">
                      <button 
                        className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-300 overflow-hidden transform hover:-translate-y-0.5"
                        style={{
                          background: 'linear-gradient(135deg, #d4c4a8 0%, #c8b896 100%)',
                          color: 'white',
                          boxShadow: '0 4px 16px -4px rgba(212, 196, 168, 0.3)'
                        }}
                        aria-label="View dashboard and start free trial"
                      >
                        <span className="relative z-10">View Dashboard</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                      </button>
                      
                      <button 
                        className="group flex items-center gap-3 text-gray-600 hover:text-[#a08d6b] font-medium text-base transition-all duration-200"
                        aria-label="Watch 2-minute demo video"
                      >
                        <div className="w-12 h-12 bg-gray-100/70 rounded-full flex items-center justify-center group-hover:bg-[#d4c4a8]/10 transition-all duration-200">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M8 5v10l8-5-8-5z"/>
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-semibold">2-min demo</div>
                          <div className="text-xs text-gray-500">See it in action</div>
                        </div>
                      </button>
                    </div>

                    {/* Social Proof */}
                    <div className="text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-1 mb-2" aria-label="5 out of 5 stars rating">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-[#d4c4a8]" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-gray-500 text-sm font-light">
                        4.9/5 from 200+ salon owners • No contracts • Cancel anytime
                      </p>
                    </div>
                  </div>

                  {/* Right Side - Hyper Realistic iPad */}
                  <div className="relative lg:ml-8">
                    {/* iPad Stand Base */}
                    <div className="relative flex items-end justify-center">
                      
                      {/* Stand Base */}
                      <div 
                        className="relative w-32 h-8 rounded-full transform"
                        style={{
                          background: `
                            linear-gradient(145deg, 
                              #e8e8e8 0%, 
                              #d0d0d0 50%, 
                              #b8b8b8 100%
                            )
                          `,
                          boxShadow: `
                            0 4px 12px rgba(0, 0, 0, 0.1),
                            inset 0 1px 0 rgba(255, 255, 255, 0.8),
                            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                          `
                        }}
                      >
                        {/* Stand Arm */}
                        <div 
                          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full w-4 h-16"
                          style={{
                            background: `
                              linear-gradient(90deg, 
                                #e0e0e0 0%, 
                                #f0f0f0 50%, 
                                #e0e0e0 100%
                              )
                            `,
                            borderRadius: '8px 8px 0 0',
                            boxShadow: `
                              inset 1px 0 0 rgba(255, 255, 255, 0.6),
                              inset -1px 0 0 rgba(0, 0, 0, 0.1),
                              0 0 8px rgba(0, 0, 0, 0.05)
                            `
                          }}
                        />
                      </div>

                      {/* iPad Device */}
                      <div 
                        className="absolute bottom-8 transform rotate-12 transition-transform duration-700 hover:rotate-6"
                        style={{
                          filter: 'drop-shadow(0 8px 25px rgba(0, 0, 0, 0.15))'
                        }}
                      >
                        {/* iPad Frame */}
                        <div 
                          className="relative w-72 h-96 rounded-3xl overflow-hidden"
                          style={{
                            background: `
                              linear-gradient(145deg, 
                                #f8f8f8 0%, 
                                #e8e8e8 100%
                              )
                            `,
                            border: '3px solid #d0d0d0',
                            boxShadow: `
                              0 0 0 1px rgba(255, 255, 255, 0.8),
                              0 8px 32px rgba(0, 0, 0, 0.12),
                              inset 0 1px 0 rgba(255, 255, 255, 0.9),
                              inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                            `
                          }}
                        >
                          
                          {/* Screen Bezel */}
                          <div className="absolute inset-2 rounded-2xl overflow-hidden bg-black">
                            
                            {/* Screen Content */}
                            <div 
                              className="w-full h-full relative overflow-hidden rounded-2xl"
                              style={{
                                background: `
                                  linear-gradient(135deg, 
                                    #f9f7f4 0%, 
                                    #f5f1eb 25%, 
                                    #f8f5f0 50%, 
                                    #f3ede5 75%, 
                                    #f6f2ec 100%
                                  )
                                `
                              }}
                            >
                              
                              {/* Simple App Interface */}
                              <div className="absolute inset-4 flex flex-col">
                                
                                {/* Top Bar */}
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-[#d4c4a8] rounded-lg flex items-center justify-center">
                                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                      </svg>
                                    </div>
                                    <div>
                                      <div className="text-sm font-semibold text-gray-800">Spectra</div>
                                      <div className="text-xs text-gray-500">Salon Dashboard</div>
                                    </div>
                                  </div>
                                  
                                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                </div>

                                {/* Content Cards */}
                                <div className="space-y-3 flex-1">
                                  {/* Stats Card */}
                                  <div className="bg-white/80 rounded-xl p-4 backdrop-blur-sm border border-white/50">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium text-gray-600">Today's Savings</span>
                                      <div className="w-4 h-4 bg-[#d4c4a8] rounded-full"></div>
                                    </div>
                                    <div className="text-lg font-bold text-gray-800">85%</div>
                                    <div className="text-xs text-gray-500">Waste Reduction</div>
                                  </div>

                                  {/* Progress Card */}
                                  <div className="bg-white/80 rounded-xl p-4 backdrop-blur-sm border border-white/50">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-xs font-medium text-gray-600">Inventory Status</span>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Color Products</span>
                                        <span className="text-gray-800">78%</span>
                                      </div>
                                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                                        <div className="bg-[#d4c4a8] h-1.5 rounded-full" style={{width: '78%'}}></div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Quick Actions */}
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="bg-white/60 rounded-lg p-3 text-center">
                                      <div className="w-6 h-6 bg-[#d4c4a8]/20 rounded-lg mx-auto mb-1 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-[#d4c4a8] rounded-full"></div>
                                      </div>
                                      <span className="text-xs text-gray-600">Scan</span>
                                    </div>
                                    <div className="bg-white/60 rounded-lg p-3 text-center">
                                      <div className="w-6 h-6 bg-[#d4c4a8]/20 rounded-lg mx-auto mb-1 flex items-center justify-center">
                                        <div className="w-2 h-2 bg-[#d4c4a8] rounded-full"></div>
                                      </div>
                                      <span className="text-xs text-gray-600">Mix</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Screen Reflection */}
                              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-2xl"></div>
                            </div>
                          </div>

                          {/* Home Button */}
                          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                            <div 
                              className="w-12 h-1 rounded-full"
                              style={{
                                background: 'linear-gradient(90deg, #d0d0d0 0%, #e8e8e8 50%, #d0d0d0 100%)'
                              }}
                            />
                          </div>

                          {/* Device Reflection */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-3xl"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section 
        id="features-section"
        className="relative py-20 sm:py-24 lg:py-28 bg-black overflow-hidden" 
        aria-labelledby="how-it-works-heading"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-[#c79c6d] rounded-full" aria-hidden="true" />
              <span className="text-white/70 text-xs font-medium uppercase tracking-wider">
                HOW IT WORKS
              </span>
            </div>
            
            <h2 id="how-it-works-heading" className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-white mb-4 sm:mb-6 leading-tight">
              <span className="text-[#c79c6d]">5 Simple Steps</span>
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light">
              Watch real salon professionals use Spectra to streamline operations, reduce waste, and increase profits
            </p>
          </div>

          {/* Step Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 mb-16 sm:mb-20 lg:mb-24">
            {walkthroughSteps.map((step, index) => (
              <article
                key={`${step.title}-${index}`}
                className="group relative"
                onMouseEnter={() => handleStepHover(index)}
                onMouseLeave={handleStepLeave}
              >
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:-translate-y-2">
                  {/* Image Container */}
                  <div className="relative w-full aspect-[9/16] bg-gray-100 overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.alt}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-[#c79c6d] to-[#b8906b] flex items-center justify-center">
                            <div class="text-center text-white">
                              <div class="text-4xl mb-4" aria-hidden="true">📱</div>
                              <div class="text-lg font-medium">${step.title}</div>
                            </div>
                          </div>
                        `;
                      }}
                    />

                    {/* Hover Highlight */}
                    <div className={`absolute inset-0 bg-[#c79c6d]/10 transition-all duration-300 ${
                      hoveredVideoStep === index ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </div>

                  {/* Content Section */}
                  <div className="p-4 sm:p-5 lg:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-black mb-2 sm:mb-3 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>

                  {/* Border Highlight */}
                  <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
                    hoveredVideoStep === index 
                      ? 'border-[#c79c6d]/30' 
                      : 'border-transparent'
                  }`} />
                </div>
              </article>
            ))}
          </div>

          {/* Bottom CTA Section */}
          <div className="text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto border border-white/10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4 sm:mb-6">
                Ready to Transform Your Salon?
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 mb-8 sm:mb-10 leading-relaxed font-light max-w-2xl mx-auto">
                Join thousands of salons already saving money and reducing waste with Spectra
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="w-full sm:w-auto bg-[#c79c6d] hover:bg-[#b8906b] text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl">
                  Start Your Free Trial
                </button>
                
                <button className="w-full sm:w-auto bg-transparent border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 backdrop-blur-sm">
                  Watch Full Demo
                </button>
              </div>
              
              <p className="mt-6 text-white/50 text-sm font-light">
                14-day free trial • No commitment, no charge • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials Section */}
      <ClientCarousel />
    </div>
  );
};