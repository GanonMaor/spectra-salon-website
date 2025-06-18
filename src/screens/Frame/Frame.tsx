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

              {/* כותרת עם הצבעים החדשים */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-light text-gray-800 leading-[1.05] mb-6 sm:mb-8">
                <span className="bg-gradient-to-r from-gray-800 to-gray-700 bg-clip-text text-transparent">
                  Transform Your
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#d4c4a8] via-[#c8b896] to-[#d4c4a8] bg-clip-text text-transparent font-medium">
                  Salon Experience
                </span>
              </h1>

              {/* תיאור עם הצבעים החדשים */}
              <p className="text-lg sm:text-xl lg:text-2xl xl:text-2xl text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Effortlessly reduce waste by <span className="text-[#a08d6b] font-semibold">85%</span>, 
                boost profits by <span className="text-[#a08d6b] font-semibold">40%</span>, and 
                transform your salon in under <span className="text-[#a08d6b] font-semibold">5 minutes</span>
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
              <span className="text-[#d4c4a8]">5 Simple Steps</span>
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light">
              Watch real salon professionals use Spectra to streamline operations, reduce waste, and increase profits
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
    </div>
  );
};