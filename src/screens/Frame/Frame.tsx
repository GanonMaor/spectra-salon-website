import { useState } from "react";
import { Navigation } from "../../components/Navigation";
import { CTAButton } from "../../components/CTAButton";
import { ClientCarousel } from "../../components/ClientCarousel";
import { walkthroughSteps } from "../../constants/walkthroughSteps";

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
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden min-h-screen">
        {/* Background - Hermès inspired */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at top, 
                #fefefe 0%, 
                #f9f7f4 25%, 
                #f5f2ee 50%, 
                #f1ede8 75%, 
                #ede8e2 100%
              )
            `
          }}
        />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="text-center">
            
            {/* Trust Badge - Centered */}
            <div className="flex items-center justify-center gap-3 mb-16">
              <div className="w-1 h-1 bg-gradient-to-r from-[#d4a574] to-[#c79c6d] rounded-full"></div>
              <span className="text-[#6b5b47] text-xs font-medium uppercase tracking-[0.2em]">
                Trusted by 500+ Premium Salons
              </span>
            </div>

            {/* Main Headline - Centered */}
            <div className="mb-20">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extralight text-[#1d1d1f] leading-[0.9] tracking-[-0.02em] mb-6">
                Stop Losing
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extralight text-[#1d1d1f] leading-[0.9] tracking-[-0.02em] mb-6">
                Money on
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#d4a574] via-[#c79c6d] to-[#b8906b] leading-[0.9] tracking-[-0.02em]">
                Wasted Hair Color
              </h1>
            </div>

            {/* Value Proposition - Centered */}
            <p className="text-xl sm:text-2xl lg:text-3xl text-[#1d1d1f] mb-20 leading-[1.2] font-light max-w-4xl mx-auto tracking-[-0.01em]">
              Save <span className="font-medium text-[#c79c6d]">$8,000+ annually</span> and reduce waste 
              by <span className="font-medium text-[#c79c6d]">85%</span>. 
              Setup in <span className="font-medium text-[#c79c6d]">5 minutes</span>.
            </p>

            {/* CTA Buttons - Centered */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-32">
              <button className="group relative px-8 py-4 bg-[#007AFF] hover:bg-[#0056CC] text-white font-medium text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]">
                <span className="relative z-10">Start Free Trial</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF] to-[#0056CC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button className="group flex items-center gap-4 text-[#1d1d1f] hover:text-[#c79c6d] font-medium text-lg transition-all duration-300 px-8 py-4 justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#f5f5f7] to-[#e8e8ed] group-hover:from-[#c79c6d]/10 group-hover:to-[#c79c6d]/20 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md">
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Watch Demo</div>
                  <div className="text-sm text-[#86868b]">2 minutes</div>
                </div>
              </button>
            </div>

            {/* Video Section - Centered below text */}
            <div className="flex justify-center mb-20">
              <div className="relative max-w-2xl lg:max-w-3xl xl:max-w-4xl w-full">
                
                {/* Video Container - Apple inspired design */}
                <div className="relative group">
                  {/* Floating background elements */}
                  <div className="absolute -inset-6 bg-gradient-to-br from-[#c79c6d]/10 via-transparent to-[#d4a574]/10 rounded-3xl blur-3xl group-hover:blur-[40px] transition-all duration-700"></div>
                  <div className="absolute -inset-3 bg-gradient-to-br from-white/50 to-white/20 rounded-3xl backdrop-blur-sm"></div>
                  
                  {/* Main video container */}
                  <div className="relative bg-white rounded-3xl p-3 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                    <div className="aspect-video relative rounded-2xl overflow-hidden bg-black">
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
                  </div>
                  
                  {/* Reflection effect */}
                  <div className="absolute -bottom-40 left-0 right-0 h-40 bg-gradient-to-b from-white/10 to-transparent rounded-3xl transform scale-y-[-1] opacity-20"></div>
                </div>
              </div>
            </div>

            {/* Stats - Apple style cards centered */}
            <div className="flex justify-center mb-20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
                {[
                  { value: "85%", label: "Less Waste", color: "from-[#34C759] to-[#30D158]" },
                  { value: "40%", label: "More Profit", color: "from-[#007AFF] to-[#5AC8FA]" },
                  { value: "5min", label: "Setup", color: "from-[#FF9500] to-[#FFCC02]" }
                ].map((stat, index) => (
                  <div key={index} className="group relative">
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      <div className={`text-4xl lg:text-5xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-[#86868b] font-medium uppercase tracking-wider">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Indicators - Centered at bottom */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#c79c6d]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[#1d1d1f] text-base font-medium">4.9 from 200+ reviews</span>
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
                    <CTAButton>
                      Start Free Trial
                    </CTAButton>
                    
                    <button className="group flex items-center gap-3 text-white/80 hover:text-[#d4c4a8] font-medium text-base transition-all duration-200">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 group-hover:bg-[#d4c4a8]/20 transition-all duration-200">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-semibold">Talk to Maor</div>
                        <div className="text-xs text-white/60">Personal guidance</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 pt-12 border-t border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-[#d4c4a8] mb-2">500+</div>
                <div className="text-white/70 font-medium">Salons Transformed</div>
                <div className="text-sm text-white/50 mt-1">Across 20+ countries</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-[#d4c4a8] mb-2">$2M+</div>
                <div className="text-white/70 font-medium">Waste Prevented</div>
                <div className="text-sm text-white/50 mt-1">In product costs saved</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold text-[#d4c4a8] mb-2">3+</div>
                <div className="text-white/70 font-medium">Years of Innovation</div>
                <div className="text-sm text-white/50 mt-1">Continuous development</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};