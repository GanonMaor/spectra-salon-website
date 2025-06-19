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
      {/* Navigation bar - עם הצבעים החדשים */}
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img className="h-8 w-auto" alt="Spectra Logo" src="/image.png" />
            </div>

            <nav className="hidden lg:flex items-center space-x-8" role="navigation">
              <a href="#features" className="text-gray-700 hover:text-[#d4c4a8] font-medium text-sm transition-colors duration-200">Features</a>
              <a href="#about" className="text-gray-700 hover:text-[#d4c4a8] font-medium text-sm transition-colors duration-200">About</a>
              <a href="#contact" className="text-gray-700 hover:text-[#d4c4a8] font-medium text-sm transition-colors duration-200">Contact</a>
            </nav>

            <div className="hidden lg:flex items-center">
              <Button className="bg-[#d4c4a8] hover:bg-[#c8b896] text-white px-6 py-2 rounded-xl font-medium text-sm transition-all duration-200 border-0 h-auto shadow-lg hover:shadow-xl">
                Start now
              </Button>
            </div>

            <button
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:text-[#d4c4a8] hover:bg-gray-100 transition-all duration-200"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle mobile menu"
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

          {isMobileMenuOpen && (
            <div id="mobile-menu" className="lg:hidden border-t border-gray-200/50 py-6 px-4">
              <nav className="space-y-6">
                <a href="#features" className="block text-gray-700 hover:text-[#d4c4a8] font-medium text-base py-2 transition-colors duration-200" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
                <a href="#about" className="block text-gray-700 hover:text-[#d4c4a8] font-medium text-base py-2 transition-colors duration-200" onClick={() => setIsMobileMenuOpen(false)}>About</a>
                <a href="#contact" className="block text-gray-700 hover:text-[#d4c4a8] font-medium text-base py-2 transition-colors duration-200" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
                <Button className="w-full bg-[#d4c4a8] hover:bg-[#c8b896] text-white py-3 rounded-xl font-medium text-base mt-4">Start now</Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - חזרה לעיצוב הקודם עם הצבעים החדשים */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* רקע רך עם הצבעים החדשים */}
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
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 right-1/5 w-64 h-64 bg-gradient-to-br from-[#d4c4a8]/15 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/6 w-48 h-48 bg-gradient-to-br from-[#e8dcc6]/10 to-transparent rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-[#d4c4a8]/8 to-transparent rounded-full blur-3xl" />
          </div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-20 xl:gap-24 items-center">
            
            {/* Content משמאל */}
            <div className="lg:col-span-6 xl:col-span-7 text-center lg:text-left">
              
              {/* Trust Badge עם הצבעים החדשים */}
              <div className="inline-flex items-center gap-2 bg-[#d4c4a8]/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#d4c4a8]/20">
                <div className="w-2 h-2 bg-[#d4c4a8] rounded-full animate-pulse"></div>
                <span className="text-[#a08d6b] text-sm font-medium">
                  Trusted by 500+ Premium Salons
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-light text-gray-800 leading-[1.05] mb-6 sm:mb-8">
                <span className="bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Stop Losing Money on
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#d4c4a8] via-[#c8b896] to-[#d4c4a8] bg-clip-text text-transparent font-medium">
                  Wasted Hair Color
                </span>
              </h1>

              {/* Value Proposition */}
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-2xl text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Professional salons using Spectra save <span className="text-[#a08d6b] font-semibold">$8,000+ annually</span> 
                while reducing product waste by <span className="text-[#a08d6b] font-semibold">85%</span>. 
                Ready in <span className="text-[#a08d6b] font-semibold">5 minutes</span>, no training required.
              </p>

              {/* Benefits עם הצבעים החדשים */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8 sm:mb-10 lg:mb-12">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-[#d4c4a8]/20">
                  <svg className="w-4 h-4 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#a08d6b] text-sm font-medium">Zero Setup</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-[#d4c4a8]/20">
                  <svg className="w-4 h-4 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#a08d6b] text-sm font-medium">Instant ROI</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-[#d4c4a8]/20">
                  <svg className="w-4 h-4 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#a08d6b] text-sm font-medium">24/7 Support</span>
                </div>
              </div>

              {/* כפתורי CTA עם הצבעים החדשים */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
                <button 
                  className="group relative w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #d4c4a8 0%, #c8b896 100%)',
                    color: 'white'
                  }}
                >
                  <span className="relative z-10">Start Free Trial Now</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button className="group flex items-center gap-3 text-gray-600 hover:text-[#a08d6b] font-medium text-base transition-all duration-200">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#d4c4a8]/20 group-hover:bg-[#d4c4a8]/20 transition-all duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l8-5-8-5z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Watch 2-min Demo</div>
                    <div className="text-xs text-gray-500">See it in action</div>
                  </div>
                </button>
              </div>

              {/* Social Proof עם הצבעים החדשים */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
                <div className="text-center sm:text-left">
                  <div className="text-gray-500 text-sm mb-2">Trusted by leading salons</div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-[#d4c4a8]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-gray-600 text-sm ml-2 font-medium">4.9/5 from 200+ reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* הכדור הבלורי - ברקע */}
            <div className="absolute -top-12 -right-16 lg:-top-16 lg:-right-24 z-10">
              <div 
                className="relative w-32 h-32 lg:w-40 lg:h-40 transform hover:scale-105 transition-all duration-1000 animate-pulse"
                style={{ 
                  animationDuration: '6s',
                  filter: 'drop-shadow(0 10px 25px rgba(212, 196, 168, 0.15))'
                }}
              >
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
                  <div className="absolute top-3 left-3 w-6 h-6 lg:w-8 lg:h-8 bg-white/70 rounded-full blur-sm" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-12 h-12 lg:w-16 lg:h-16 text-[#d4c4a8]/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* וידאו מימין - עם הצבעים החדשים */}
            <div className="lg:col-span-6 xl:col-span-5 relative lg:mt-8">
              <div className="relative z-10">
                <div 
                  className="group relative p-8 rounded-3xl max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto transform hover:-translate-y-2 transition-all duration-500"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 252, 251, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: `
                      0 8px 32px -8px rgba(0, 0, 0, 0.06),
                      0 4px 16px -4px rgba(212, 196, 168, 0.08),
                      inset 0 1px 0 rgba(255, 255, 255, 0.8)
                    `,
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.6)'
                  }}
                >
                  
                  <div 
                    className="relative rounded-2xl overflow-hidden transform group-hover:scale-105 transition-all duration-500"
                    style={{
                      transform: 'perspective(1000px) rotateX(-2deg) rotateY(-1deg)',
                      boxShadow: '0 8px 25px -5px rgba(212, 196, 168, 0.2)'
                    }}
                  >
                    
                    <div className="aspect-video rounded-2xl overflow-hidden border-4 border-gray-100 relative">
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-10 opacity-100 group-hover:opacity-0 transition-all duration-300">
                        <div 
                          className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300"
                          style={{ background: 'linear-gradient(135deg, #d4c4a8 0%, #c8b896 100%)' }}
                        >
                          <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 5v10l8-5-8-5z"/>
                          </svg>
                        </div>
                      </div>

                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/VA6F3PjUEX8?autoplay=0&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&enablejsapi=1"
                        title="Spectra Hair Salon Demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-[#d4c4a8]/10 via-transparent to-transparent pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">
                      See Spectra in Action
                    </h3>
                    <p className="text-gray-600 text-base mb-6 leading-relaxed max-w-sm mx-auto">
                      Watch how top salons save thousands monthly while improving client satisfaction
                    </p>

                    <div className="flex justify-center gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#a08d6b]">85%</div>
                        <div className="text-xs text-gray-500">Less Waste</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#a08d6b]">40%</div>
                        <div className="text-xs text-gray-500">More Profit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#a08d6b]">5min</div>
                        <div className="text-xs text-gray-500">Setup Time</div>
                      </div>
                    </div>

                    <button 
                      className="group relative w-full h-12 rounded-2xl font-semibold text-sm transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                      style={{
                        background: 'linear-gradient(135deg, #d4c4a8 0%, #c8b896 100%)',
                        color: 'white',
                        boxShadow: '0 4px 16px -4px rgba(212, 196, 168, 0.3)'
                      }}
                    >
                      <span className="relative z-10">Start Your Transformation</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ✨ Features Section - פיצ'רים חדשים ועשירים */}
      <section id="features" className="relative py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-[#fdfcfb] to-[#f1eeeb] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#d4c4a8]/5 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-2 bg-[#d4c4a8]/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#d4c4a8]/20">
              <div className="w-2 h-2 bg-[#d4c4a8] rounded-full animate-pulse"></div>
              <span className="text-[#a08d6b] text-sm font-medium uppercase tracking-wider">FEATURES</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-800 mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                Why Premium Salons Choose
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#d4c4a8] via-[#c8b896] to-[#d4c4a8] bg-clip-text text-transparent font-medium">
                Spectra Over Competitors
              </span>
            </h2>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              Built specifically for color professionals who demand precision, efficiency, and real profit improvements
            </p>
          </div>

          {/* Main Features Grid */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 xl:gap-12 mb-20">
            
            {/* Feature 1 - Smart Tracking */}
            <div className="group relative">
              <div 
                className="relative p-8 lg:p-10 rounded-3xl transform group-hover:-translate-y-2 transition-all duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 252, 251, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `
                    0 8px 32px -8px rgba(0, 0, 0, 0.06),
                    0 4px 16px -4px rgba(212, 196, 168, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8)
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.6)'
                }}
              >
                <div className="mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #d4c4a8 0%, #c8b896 100%)' }}
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">Precision Product Tracking</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Know exactly how much Wella, L'Oréal, or Goldwell you're using on each client. Our smart scales track usage down to the gram, so you never over-mix again.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Real-time product monitoring</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Automated waste calculations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Predictive analytics</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - Financial Insights */}
            <div className="group relative">
              <div 
                className="relative p-8 lg:p-10 rounded-3xl transform group-hover:-translate-y-2 transition-all duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 252, 251, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `
                    0 8px 32px -8px rgba(0, 0, 0, 0.06),
                    0 4px 16px -4px rgba(212, 196, 168, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8)
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.6)'
                }}
              >
                <div className="mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #d4c4a8 0%, #c8b896 100%)' }}
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">Real Profit Analysis</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    See your actual cost per service, not just estimates. Track which color formulas eat into your margins and which stylists consistently over-use product.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Profit margin analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Cost optimization suggestions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Revenue forecasting</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 - Seamless Integration */}
            <div className="group relative">
              <div 
                className="relative p-8 lg:p-10 rounded-3xl transform group-hover:-translate-y-2 transition-all duration-500"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 252, 251, 0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `
                    0 8px 32px -8px rgba(0, 0, 0, 0.06),
                    0 4px 16px -4px rgba(212, 196, 168, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8)
                  `,
                  border: '1px solid rgba(255, 255, 255, 0.6)'
                }}
              >
                <div className="mb-6">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #d4c4a8 0%, #c8b896 100%)' }}
                  >
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">Works With Your Workflow</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    Your stylists keep doing what they do best. No complicated software to learn, no changing your booking system. Just weigh, mix, and save money.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">5-minute installation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">Works with existing workflow</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-[#a08d6b]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">24/7 expert support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-20">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#a08d6b] mb-2">85%</div>
              <div className="text-gray-600 font-medium">Waste Reduction</div>
              <div className="text-sm text-gray-500 mt-1">Average across 500+ salons</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#a08d6b] mb-2">40%</div>
              <div className="text-gray-600 font-medium">Profit Increase</div>
              <div className="text-sm text-gray-500 mt-1">Within first 3 months</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#a08d6b] mb-2">5min</div>
              <div className="text-gray-600 font-medium">Setup Time</div>
              <div className="text-sm text-gray-500 mt-1">No training required</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#a08d6b] mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Expert Support</div>
              <div className="text-sm text-gray-500 mt-1">Always here to help</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div 
              className="inline-block p-8 lg:p-12 rounded-3xl max-w-4xl mx-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(253, 252, 251, 0.9) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: `
                  0 8px 32px -8px rgba(0, 0, 0, 0.06),
                  0 4px 16px -4px rgba(212, 196, 168, 0.1),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `,
                border: '1px solid rgba(255, 255, 255, 0.6)'
              }}
            >
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800 mb-4 sm:mb-6">
                Ready to Save Money Today?
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-10 leading-relaxed font-light max-w-2xl mx-auto">
                Join thousands of salons already reducing waste and increasing profits with Spectra's smart technology
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                  className="group relative w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #d4c4a8 0%, #c8b896 100%)',
                    color: 'white'
                  }}
                >
                  <span className="relative z-10">Start Free 14-Day Trial</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button className="group flex items-center gap-3 text-gray-600 hover:text-[#a08d6b] font-medium text-base transition-all duration-200">
                  <div className="w-12 h-12 bg-[#d4c4a8]/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#d4c4a8]/20 group-hover:bg-[#d4c4a8]/20 transition-all duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Schedule Demo</div>
                    <div className="text-xs text-gray-500">Talk to an expert</div>
                  </div>
                </button>
              </div>
              
              <p className="mt-6 text-gray-500 text-sm font-light">
                No credit card required • Cancel anytime • Full support included
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section - עם הצבעים החדשים */}
      <section 
        id="features-section"
        className="relative py-20 sm:py-24 lg:py-28 bg-black overflow-hidden"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-[#d4c4a8] rounded-full" />
              <span className="text-white/70 text-xs font-medium uppercase tracking-wider">HOW IT WORKS</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-white mb-4 sm:mb-6 leading-tight">
              <span className="text-[#d4c4a8]">See Spectra in Action</span>
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light">
              Real colorists at premium salons show you exactly how Spectra saves them thousands every month
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 mb-16 sm:mb-20 lg:mb-24">
            {walkthroughSteps.map((step, index) => (
              <article
                key={`${step.title}-${index}`}
                className="group relative"
                onMouseEnter={() => handleStepHover(index)}
                onMouseLeave={handleStepLeave}
              >
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:-translate-y-2">
                  <div className="relative w-full aspect-[9/16] bg-gray-100 overflow-hidden">
                    <img
                      src={step.image}
                      alt={step.alt}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-[#d4c4a8] to-[#c8b896] flex items-center justify-center">
                            <div class="text-center text-white">
                              <div class="text-4xl mb-4">📱</div>
                              <div class="text-lg font-medium">${step.title}</div>
                            </div>
                          </div>
                        `;
                      }}
                    />

                    <div className={`absolute inset-0 bg-[#d4c4a8]/10 transition-all duration-300 ${
                      hoveredVideoStep === index ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </div>

                  <div className="p-4 sm:p-5 lg:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-black mb-2 sm:mb-3 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>

                  <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
                    hoveredVideoStep === index 
                      ? 'border-[#d4c4a8]/30' 
                      : 'border-transparent'
                  }`} />
                </div>
              </article>
            ))}
          </div>

          <div className="text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto border border-white/10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4 sm:mb-6">
                Ready to Transform Your Salon?
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 mb-8 sm:mb-10 leading-relaxed font-light max-w-2xl mx-auto">
                Join thousands of salons already saving money and reducing waste with Spectra
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="w-full sm:w-auto bg-[#d4c4a8] hover:bg-[#c8b896] text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl">
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

      <ClientCarousel />

      {/* About Section - New Clean Layout */}
      <section id="about" className="relative py-20 sm:py-24 lg:py-32 bg-white overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 bg-[#d4c4a8]/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#d4c4a8]/20">
              <div className="w-2 h-2 bg-[#d4c4a8] rounded-full animate-pulse"></div>
              <span className="text-[#a08d6b] text-sm font-medium uppercase tracking-wider">OUR STORY</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-800 mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                Built by Someone Who
              </span>
              <br />
              <span className="bg-gradient-to-r from-[#d4c4a8] via-[#c8b896] to-[#d4c4a8] bg-clip-text text-transparent font-medium">
                Lived Your Struggle
              </span>
            </h2>
          </div>

          {/* Content Layout - Balanced */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Left Side - Founder Profile */}
            <div className="lg:order-1">
              <div className="text-center lg:text-left">
                <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-3xl mx-auto lg:mx-0 mb-8 overflow-hidden border-4 border-[#d4c4a8]/20 shadow-2xl">
                  <img 
                    src="/maor-ganon.png" 
                    alt="Maor Ganon - Co-founder & CEO of Spectra"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-3">Maor Ganon</h3>
                <p className="text-[#a08d6b] font-semibold mb-6 text-xl">Co-founder & CEO</p>
                
                <blockquote className="text-lg text-gray-600 leading-relaxed italic mb-8 max-w-md mx-auto lg:mx-0">
                  "Every feature in Spectra solves a problem I personally faced as a salon owner. 
                  We're not building technology for tech's sake. We're solving real problems for real professionals."
                </blockquote>

                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  <div className="bg-[#d4c4a8]/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#a08d6b] mb-1">10+</div>
                    <div className="text-sm text-gray-600">Years in Salons</div>
                  </div>
                  <div className="bg-[#d4c4a8]/10 rounded-2xl p-4 text-center">
                    <div className="text-2xl font-bold text-[#a08d6b] mb-1">500+</div>
                    <div className="text-sm text-gray-600">Salons Transformed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Story Content */}
            <div className="lg:order-2">
              <div className="space-y-8">
                
                {/* Opening */}
                <div>
                  <p className="text-xl text-gray-700 leading-relaxed font-light mb-4">
                    Maor Ganon didn't set out to revolutionize the salon industry. He was too busy trying to survive it.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    As founder and manager of a thriving hair salon, Maor watched his business grow rapidly, but with growth came chaos. 
                    Every day brought the same impossible challenges: tracking color usage without proper systems, 
                    struggling to deliver consistent results, managing inventory that felt more like guesswork than science.
                  </p>
                </div>

                {/* The Problem */}
                <div className="p-6 bg-gray-50 rounded-2xl border-l-4 border-[#d4c4a8]">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">The Breaking Point</h4>
                  <p className="text-gray-600 leading-relaxed">
                    "I had clients booking months in advance, stylists working at capacity, but I couldn't tell you 
                    if we were actually profitable," Maor recalls. "We were successful on paper, but behind the scenes? Complete chaos."
                  </p>
                </div>

                {/* The Journey */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">A Global Search for Solutions</h4>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    Frustrated but determined, Maor embarked on a journey that took him from New York to Milan, 
                    meeting with salon owners, global color educators, and beauty tech experts.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Everywhere he went, he found the same story: brilliant creative professionals held back by 
                    outdated tools and systems that belonged in the last century, not this one.
                  </p>
                </div>

                {/* The Solution */}
                <div className="p-6 bg-gradient-to-br from-[#d4c4a8]/10 to-[#c8b896]/5 rounded-2xl">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">The Breakthrough</h4>
                  <p className="text-gray-600 leading-relaxed">
                    That global search became Spectra. Not just another app, but a platform built by someone 
                    who lived the exact same pain points our users face every day. Today, Maor and his team are 
                    redefining how professional color salons operate, one optimized formula at a time.
                  </p>
                </div>

                {/* Call to Action */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      className="group relative px-8 py-4 rounded-xl font-semibold text-base transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #d4c4a8 0%, #c8b896 100%)',
                        color: 'white'
                      }}
                    >
                      <span className="relative z-10">Start Your Free Trial</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                    
                    <button className="group flex items-center gap-3 text-gray-600 hover:text-[#a08d6b] font-medium text-base transition-all duration-200">
                      <div className="w-12 h-12 bg-[#d4c4a8]/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#d4c4a8]/20 group-hover:bg-[#d4c4a8]/20 transition-all duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">Talk to Maor's Team</div>
                        <div className="text-xs text-gray-500">Get personal guidance</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 pt-12 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-[#a08d6b] mb-2">500+</div>
                <div className="text-gray-600 font-medium">Salons Transformed</div>
                <div className="text-sm text-gray-500 mt-1">Across 20+ countries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-[#a08d6b] mb-2">$2M+</div>
                <div className="text-gray-600 font-medium">Waste Prevented</div>
                <div className="text-sm text-gray-500 mt-1">In product costs saved</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-[#a08d6b] mb-2">3+</div>
                <div className="text-gray-600 font-medium">Years of Innovation</div>
                <div className="text-sm text-gray-500 mt-1">Continuous development</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <img className="h-8 w-auto" alt="Spectra Logo" src="/image.png" />
                <span className="ml-3 text-xl font-semibold">Spectra</span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                The smart choice for professional salons. Reduce waste, increase profits, and streamline your color services with precision tracking technology.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#d4c4a8] transition-colors duration-200">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#d4c4a8] transition-colors duration-200">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.197-1.559-.748-.948-1.147-2.193-1.123-3.504.024-1.311.472-2.543 1.263-3.466.79-.924 1.924-1.471 3.193-1.541 1.269-.07 2.507.332 3.485 1.133.978.801 1.622 1.935 1.814 3.196.192 1.261-.09 2.544-.793 3.611-.703 1.067-1.764 1.849-2.988 2.202-.612.177-1.239.201-1.865.101-.626-.1-1.227-.342-1.789-.728z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#d4c4a8] transition-colors duration-200">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">Features</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Pricing</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Case Studies</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">API Documentation</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">Training Resources</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white transition-colors duration-200">System Status</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Spectra Technologies. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};