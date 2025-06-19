import { useState } from "react";
import { Navigation } from "../../components/Navigation";
import { CTAButton } from "../../components/CTAButton";
// import { Footer } from "../../components/Footer"; // Commented out due to missing module
import { ClientCarousel } from "../../components/ClientCarousel";
import { walkthroughSteps } from "../../constants/walkthroughSteps";

// CSS classes moved to avoid repetitive inline styles





export const Frame = (): JSX.Element => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredVideoStep, setHoveredVideoStep] = useState<number | null>(null);

  const handleStepHover = (stepIndex: number) => {
    setHoveredVideoStep(stepIndex);
  };

  const handleStepLeave = () => {
    setHoveredVideoStep(null);
  };

  return (
    <div className="bg-white w-full min-h-screen font-sans antialiased">
      <Navigation 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 lg:pt-24 lg:pb-20 overflow-hidden min-h-screen">
        {/* Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, 
                #fdfcfb 0%, 
                #f8f6f3 25%, 
                #f6f3f0 50%, 
                #f4f1ee 75%, 
                #f2efec 100%
              )
            `
          }}
        />

        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 xl:gap-24 items-center min-h-[85vh]">
            
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              
              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 leading-[1.1] mb-8 lg:mb-10">
                <span className="text-gray-900 block">
                  Stop Losing
                </span>
                <span className="text-gray-900 block">
                  Money on
                </span>
                <span className="text-[#d4c4a8] font-normal block">
                  Wasted Hair Color
                </span>
              </h1>

              {/* Benefits List */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:gap-6 justify-center lg:justify-start mb-8 lg:mb-10">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Zero Setup</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">Instant ROI</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 font-medium">24/7 Support</span>
                </div>
              </div>

              {/* Value Proposition */}
              <p className="text-lg sm:text-xl text-gray-600 mb-8 lg:mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0">
                Save <span className="text-[#d4c4a8] font-semibold">$8,000+ annually</span> and reduce waste 
                by <span className="text-[#d4c4a8] font-semibold">85%</span>. Setup in <span className="text-[#d4c4a8] font-semibold">5 minutes</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <CTAButton size="lg">
                  Start Free Trial Now
                </CTAButton>
                
                <button className="flex items-center justify-center gap-3 text-gray-600 hover:text-[#d4c4a8] font-medium text-base transition-all duration-200 px-6 py-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l8-5-8-5z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Watch 2-min Demo</div>
                    <div className="text-sm text-gray-500">See it in action</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Content - Video with Glassmorphic Design */}
            <div className="order-1 lg:order-2">
              <div className="max-w-lg mx-auto lg:max-w-none">
                
                {/* Glassmorphic Video Container */}
                <div 
                  className="relative p-6 lg:p-8 rounded-3xl mb-8 backdrop-blur-xl border transition-all duration-500 hover:shadow-2xl"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.1),
                      0 2px 16px rgba(212, 196, 168, 0.2),
                      inset 0 1px 0 rgba(255, 255, 255, 0.4)
                    `
                  }}
                >
                  {/* Video */}
                  <div className="relative rounded-2xl overflow-hidden shadow-xl">
                    <div className="aspect-video relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/20 flex items-center justify-center z-10">
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110"
                          style={{ 
                            background: 'linear-gradient(135deg, rgba(212, 196, 168, 0.9) 0%, rgba(200, 184, 150, 0.9) 100%)',
                            backdropFilter: 'blur(10px)'
                          }}
                        >
                          <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 5v10l8-5-8-5z"/>
                          </svg>
                        </div>
                      </div>

                      <iframe
                        className="w-full h-full rounded-2xl"
                        src="https://www.youtube.com/embed/VA6F3PjUEX8?autoplay=0&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&enablejsapi=1"
                        title="Spectra Hair Salon Demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>

                {/* Stats Section with Glass Effect */}
                <div 
                  className="p-6 lg:p-8 rounded-3xl mb-8 backdrop-blur-xl border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: `
                      0 8px 32px rgba(0, 0, 0, 0.08),
                      0 2px 16px rgba(212, 196, 168, 0.15),
                      inset 0 1px 0 rgba(255, 255, 255, 0.5)
                    `
                  }}
                >
                  <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-3xl lg:text-4xl font-bold text-[#d4c4a8] mb-2">85%</div>
                      <div className="text-sm text-gray-700 font-medium">Less Waste</div>
                    </div>
                    <div>
                      <div className="text-3xl lg:text-4xl font-bold text-[#d4c4a8] mb-2">40%</div>
                      <div className="text-sm text-gray-700 font-medium">More Profit</div>
                    </div>
                    <div>
                      <div className="text-3xl lg:text-4xl font-bold text-[#d4c4a8] mb-2">5min</div>
                      <div className="text-sm text-gray-700 font-medium">Setup Time</div>
                    </div>
                  </div>
                </div>

                {/* Trust Badge with Glass Effect */}
                <div 
                  className="text-center p-6 rounded-2xl backdrop-blur-xl border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(15px)',
                    WebkitBackdropFilter: 'blur(15px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className="text-gray-600 text-sm mb-3 font-medium">Trusted by leading salons</div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-4 h-4 text-[#d4c4a8]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <div className="text-gray-700 text-sm font-semibold">4.9/5 from 200+ reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* ... הועתק מהקוד המקורי ללא שינויים ... */}

      {/* How it Works Section */}
      <section 
        id="features-section"
        className="relative py-20 sm:py-24 lg:py-28 bg-gradient-to-br from-[#fdfcfb] to-[#f1eeeb] overflow-hidden"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-2 bg-[#d4c4a8]/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-[#d4c4a8]/20">
              <div className="w-2 h-2 bg-[#d4c4a8] rounded-full" />
              <span className="text-[#a08d6b] text-xs font-medium uppercase tracking-wider">HOW IT WORKS</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-800 mb-4 sm:mb-6 leading-tight">
              <span className="text-[#d4c4a8]">5 Simple Steps</span>
            </h2>
            
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed font-light">
              Watch real salon professionals use Spectra
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
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
                  <div className="relative w-full aspect-[9/16] bg-gray-50 overflow-hidden">
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
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 leading-tight">
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
                Ready to Start Saving?
              </h3>
              <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 leading-relaxed font-light max-w-2xl mx-auto">
                Join thousands of salons already reducing waste with Spectra
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <CTAButton size="lg">
                  Start Free Trial
                </CTAButton>
                
                <button className="group flex items-center gap-3 text-gray-600 hover:text-[#d4c4a8] font-medium text-base transition-all duration-200">
                  <div className="w-12 h-12 bg-[#d4c4a8]/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#d4c4a8]/20 group-hover:bg-[#d4c4a8]/20 transition-all duration-200">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Talk to Maor</div>
                    <div className="text-xs text-gray-500">Personal guidance</div>
                  </div>
                </button>
              </div>
              
              <p className="mt-6 text-gray-500 text-sm font-light">
                No credit card • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      <ClientCarousel />

      {/* About Section */}
      <section id="about" className="relative py-20 sm:py-24 lg:py-32 bg-black overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20">
              <div className="w-2 h-2 bg-[#d4c4a8] rounded-full animate-pulse"></div>
              <span className="text-white/70 text-sm font-medium uppercase tracking-wider">OUR STORY</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-4 sm:mb-6 leading-tight">
              <span className="text-white">
                Built by Someone Who
              </span>
              <br />
              <span className="text-[#d4c4a8] font-medium">
                Lived Your Struggle
              </span>
            </h2>
          </div>

          {/* Content Layout */}
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
                
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-3">Maor Ganon</h3>
                <p className="text-[#d4c4a8] font-semibold mb-6 text-xl">Co-founder & CEO</p>
                
                <blockquote className="text-lg text-white/80 leading-relaxed italic mb-8 max-w-md mx-auto lg:mx-0">
                  "Every feature solves a problem I faced as a salon owner. Real solutions for real professionals."
                </blockquote>

                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-[#d4c4a8] mb-1">10+</div>
                    <div className="text-sm text-white/70">Years in Salons</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                    <div className="text-2xl font-bold text-[#d4c4a8] mb-1">500+</div>
                    <div className="text-sm text-white/70">Salons Transformed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Story Content */}
            <div className="lg:order-2">
              <div className="space-y-8">
                
                {/* Opening */}
                <div>
                  <p className="text-xl text-white leading-relaxed font-light mb-4">
                    Maor didn't set out to revolutionize salons. He was too busy trying to survive his own.
                  </p>
                  <p className="text-white/80 leading-relaxed">
                    Managing a thriving salon meant daily chaos: tracking color usage without proper systems, 
                    managing inventory by guesswork, watching profits disappear to waste.
                  </p>
                </div>

                {/* The Problem */}
                <div className="p-6 bg-white/10 rounded-2xl border-l-4 border-[#d4c4a8] backdrop-blur-sm">
                  <h4 className="text-lg font-semibold text-white mb-3">The Breaking Point</h4>
                  <p className="text-white/80 leading-relaxed">
                    "Clients booked months ahead, stylists at capacity, but I couldn't tell if we were profitable. 
                    Successful on paper, chaos behind the scenes."
                  </p>
                </div>

                {/* The Journey */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">The Search</h4>
                  <p className="text-white/80 leading-relaxed mb-4">
                    From New York to Milan, meeting salon owners and beauty tech experts, 
                    Maor found the same story everywhere.
                  </p>
                  <p className="text-white/80 leading-relaxed">
                    Brilliant professionals held back by outdated tools from the last century.
                  </p>
                </div>

                {/* The Solution */}
                <div className="p-6 bg-gradient-to-br from-[#d4c4a8]/20 to-[#c8b896]/10 rounded-2xl backdrop-blur-sm">
                  <h4 className="text-lg font-semibold text-white mb-3">The Solution</h4>
                  <p className="text-white/80 leading-relaxed">
                    That search became Spectra. Built by someone who lived the same pain points. 
                    Today, we're redefining how salons operate, one optimized formula at a time.
                  </p>
                </div>

                {/* Call to Action */}
                <div className="pt-6 border-t border-white/20">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button className="bg-[#d4c4a8] hover:bg-[#c8b896] text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105">
                      Start Free Trial
                    </button>
                    
                    <button className="group flex items-center gap-3 text-white/80 hover:text-[#d4c4a8] font-medium text-base transition-all duration-200">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:bg-[#d4c4a8]/20 transition-all duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">Contact Us</div>
                        <div className="text-xs text-white/60">Get in touch</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <img className="h-8 w-auto" src="/image.png" alt="Spectra" />
                <span className="ml-2 text-xl font-bold">Spectra</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                AI-powered salon management platform that reduces waste by 85% and increases profits by 40%.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-[#d4c4a8] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#d4c4a8] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-[#d4c4a8] transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Spectra Technologies. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};