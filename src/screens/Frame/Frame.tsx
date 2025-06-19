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

      {/* Hero Section - Unified Color Palette */}
      <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden min-h-screen">
        {/* Background - Hermès warm elegance */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at top, 
                #fefefe 0%, 
                #f9f7f4 20%, 
                #f5f2ee 40%, 
                #f1ede8 60%, 
                #ede8e2 80%,
                #e9e4de 100%
              )
            `
          }}
        />

        {/* Subtle luxury pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c79c6d' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='0.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative max-w-6xl mx-auto px-8 sm:px-12 lg:px-16">
          <div className="text-center">
            
            {/* Trust Badge - Elegant Hermès style */}
            <div className="flex items-center justify-center gap-3 mb-16">
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#d4a574] to-[#c79c6d] rounded-full shadow-sm"></div>
              <span className="text-[#8b7355] text-xs font-semibold uppercase tracking-[0.25em] opacity-90">
                Trusted by 500+ Premium Salons
              </span>
              <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#c79c6d] to-[#b8906b] rounded-full shadow-sm"></div>
            </div>

            {/* Main Headline - Perfect harmony */}
            <div className="mb-20">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extralight text-[#1d1d1f] leading-[0.9] tracking-[-0.02em] mb-6">
                  Stop Losing
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extralight text-[#1d1d1f] leading-[0.9] tracking-[-0.02em] mb-6">
                  Money on
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#d4a574] via-[#c79c6d] to-[#b8906b] leading-[0.9] tracking-[-0.02em] drop-shadow-sm">
                  Wasted Hair Color
              </h1>
              </div>

            {/* Value Proposition - Enhanced readability */}
            <p className="text-xl sm:text-2xl lg:text-3xl text-[#2c2c2e] mb-20 leading-[1.2] font-light max-w-4xl mx-auto tracking-[-0.01em]">
              Save <span className="font-semibold text-[#c79c6d] bg-gradient-to-r from-[#c79c6d] to-[#d4a574] bg-clip-text text-transparent">$8,000+ annually</span> and reduce waste 
              by <span className="font-semibold text-[#c79c6d] bg-gradient-to-r from-[#c79c6d] to-[#d4a574] bg-clip-text text-transparent">85%</span>. 
              Setup in <span className="font-semibold text-[#c79c6d] bg-gradient-to-r from-[#c79c6d] to-[#d4a574] bg-clip-text text-transparent">5 minutes</span>.
            </p>

            {/* CTA Buttons - Perfect Apple blue with Hermès accents */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-32">
              <button className="group relative px-8 py-4 bg-[#007AFF] hover:bg-[#0056CC] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] border border-[#007AFF]/20">
                <span className="relative z-10">Start Free Trial</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#007AFF] to-[#0056CC] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button className="group flex items-center gap-4 text-[#2c2c2e] hover:text-[#c79c6d] font-medium text-lg transition-all duration-300 px-8 py-4 justify-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#f8f6f3] to-[#f0ede8] group-hover:from-[#c79c6d]/10 group-hover:to-[#d4a574]/10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md border border-[#c79c6d]/10 group-hover:border-[#c79c6d]/20">
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 5v10l8-5-8-5z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                  <div className="font-semibold">Watch Demo</div>
                  <div className="text-sm text-[#8b7355]">2 minutes</div>
                  </div>
                </button>
            </div>

            {/* Video Section - Cinema MacBook Pro */}
            <div className="flex justify-center mb-20">
              <div className="relative max-w-6xl w-full">
                
                {/* MacBook Pro - Cinema Style */}
                <div className="relative group">
                  {/* Floating glow - cinema lighting */}
                  <div className="absolute -inset-16 bg-gradient-to-br from-[#c79c6d]/20 via-[#d4a574]/10 to-transparent rounded-[5rem] blur-3xl group-hover:blur-[70px] transition-all duration-700"></div>
                  
                  {/* MacBook body - straight on view */}
                  <div className="relative">
                    {/* Screen - perfectly flat like cinema */}
                    <div className="bg-gradient-to-b from-[#2a2a2a] via-[#1f1f1f] to-[#1a1a1a] rounded-t-3xl p-3 shadow-2xl">
                      {/* Apple logo on back */}
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 opacity-30">
                        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 rounded-lg"></div>
                      </div>

                      {/* Screen bezel - minimal like cinema screen */}
                      <div className="bg-black rounded-2xl overflow-hidden relative shadow-inner">
                        {/* Video content - MAIN FOCUS - הוזזתי את זה למעלה */}
                        <div className="aspect-video relative z-20">
                      <iframe
                            className="w-full h-full rounded-2xl relative z-30"
                        src="https://www.youtube.com/embed/VA6F3PjUEX8?autoplay=0&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&enablejsapi=1"
                        title="Spectra Hair Salon Demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                        
                        {/* Subtle screen reflection - עכשיו זה מתחת לסרטון ולא חוסם */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent z-10 rounded-2xl pointer-events-none"></div>
                  </div>
                </div>

                    {/* Keyboard base - minimal and flat */}
                    <div className="bg-gradient-to-b from-[#e8e8e8] to-[#d0d0d0] rounded-b-3xl h-12 shadow-xl relative">
                      {/* Trackpad - centered */}
                      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-gradient-to-b from-[#f8f8f8] to-[#e8e8e8] rounded-xl shadow-inner border border-gray-200"></div>
                      
                      {/* Keyboard area hint */}
                      <div className="absolute top-2 left-12 right-12 h-2 bg-gradient-to-r from-transparent via-gray-300/30 to-transparent rounded-full"></div>
                    </div>
                  </div>
                  
                  {/* Cinema-style base shadow */}
                  <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-5/6 h-12 bg-gradient-to-b from-black/15 to-transparent rounded-full blur-2xl"></div>
                  
                  {/* Side ambient lighting */}
                  <div className="absolute top-1/4 -left-8 w-4 h-1/2 bg-gradient-to-r from-[#c79c6d]/20 to-transparent blur-xl"></div>
                  <div className="absolute top-1/4 -right-8 w-4 h-1/2 bg-gradient-to-l from-[#d4a574]/20 to-transparent blur-xl"></div>
                </div>
              </div>
            </div>

            {/* Stats - Enhanced with Hermès luxury */}
            <div className="flex justify-center mb-20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl">
                {[
                  { value: "85%", label: "Less Waste", color: "from-[#34C759] to-[#30D158]", accent: "border-[#34C759]/20" },
                  { value: "40%", label: "More Profit", color: "from-[#007AFF] to-[#5AC8FA]", accent: "border-[#007AFF]/20" },
                  { value: "5min", label: "Setup", color: "from-[#FF9500] to-[#FFCC02]", accent: "border-[#FF9500]/20" }
                ].map((stat, index) => (
                  <div key={index} className="group relative">
                    <div className={`bg-white/90 backdrop-blur-xl rounded-3xl p-8 border ${stat.accent} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white/95`}>
                      <div className={`text-4xl lg:text-5xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-3 drop-shadow-sm`}>
                        {stat.value}
                      </div>
                      <div className="text-sm text-[#8b7355] font-semibold uppercase tracking-wider">
                        {stat.label}
                    </div>
                    </div>
                  </div>
                ))}
                  </div>
                </div>

            {/* Trust Indicators - Luxury finish */}
            <div className="flex items-center justify-center gap-4">
              <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-[#c79c6d] drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
              </div>
              <span className="text-[#2c2c2e] text-base font-medium">4.9 from 200+ reviews</span>
            </div>

          </div>
        </div>
      </section>

      {/* 5 Steps Story - Glass Morphism Revolution */}
      <section className="relative py-32 lg:py-40 overflow-hidden">
        {/* Glass Background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at top left, 
                rgba(0, 122, 255, 0.08) 0%, 
                transparent 50%
              ),
              radial-gradient(ellipse at top right, 
                rgba(212, 165, 116, 0.08) 0%, 
                transparent 50%
              ),
              radial-gradient(ellipse at bottom left, 
                rgba(255, 107, 107, 0.06) 0%, 
                transparent 50%
              ),
              radial-gradient(ellipse at bottom right, 
                rgba(78, 205, 196, 0.06) 0%, 
                transparent 50%
              ),
              linear-gradient(135deg, 
                rgba(255, 255, 255, 0.95) 0%, 
                rgba(248, 246, 243, 0.9) 100%
              )
            `
          }}
        />

        {/* Floating Glass Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-[1800px] mx-auto px-8 sm:px-12 lg:px-16">
          
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-4 bg-white/40 backdrop-blur-3xl rounded-full px-8 py-4 mb-12 border border-white/60 shadow-2xl">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse"></div>
              <span className="text-gray-700 text-sm font-semibold uppercase tracking-[0.25em]">The Complete Journey</span>
              <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-400 rounded-full animate-pulse"></div>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-gray-900 mb-4 leading-[0.9] tracking-[-0.02em]">
              Five Revolutionary
            </h2>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 leading-[0.9] tracking-[-0.02em] drop-shadow-sm mb-8">
              Steps
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
              From chaos to perfection. Experience the future of salon management.
            </p>
          </div>

          {/* 5 Glass Steps - פרופורציות מאוזנות */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {walkthroughSteps.map((step, index) => {
              const colors = [
                { gradient: 'from-blue-500 to-cyan-400', glow: 'rgba(59, 130, 246, 0.3)', bg: 'rgba(59, 130, 246, 0.1)' },
                { gradient: 'from-amber-500 to-orange-400', glow: 'rgba(245, 158, 11, 0.3)', bg: 'rgba(245, 158, 11, 0.1)' },
                { gradient: 'from-red-500 to-pink-400', glow: 'rgba(239, 68, 68, 0.3)', bg: 'rgba(239, 68, 68, 0.1)' },
                { gradient: 'from-emerald-500 to-teal-400', glow: 'rgba(16, 185, 129, 0.3)', bg: 'rgba(16, 185, 129, 0.1)' },
                { gradient: 'from-gray-700 to-gray-500', glow: 'rgba(75, 85, 99, 0.3)', bg: 'rgba(75, 85, 99, 0.1)' }
              ];
              
              const colorScheme = colors[index] || colors[0];
              
              return (
                <div
                  key={`glass-step-${index}`}
                  className="group relative"
                >
                  {/* Floating Glow */}
                  <div 
                    className="absolute -inset-6 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-700"
                    style={{ background: colorScheme.glow }}
                  />
                  
                  {/* Glass Container - פרופורציות מאוזנות */}
                  <div 
                    className="relative bg-white/30 backdrop-blur-3xl rounded-[2rem] border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-700 group-hover:scale-[1.02] overflow-hidden h-[450px]"
                    style={{
                      background: `
                        linear-gradient(135deg, 
                          rgba(255, 255, 255, 0.4) 0%,
                          rgba(255, 255, 255, 0.1) 100%
                        ),
                        ${colorScheme.bg}
                      `,
                      boxShadow: `
                        0 20px 40px -10px ${colorScheme.glow},
                        0 0 0 1px rgba(255, 255, 255, 0.5),
                        inset 0 1px 0 rgba(255, 255, 255, 0.8)
                      `
                    }}
                  >

                    {/* Glass Image Container - פרופורציה מאוזנת */}
                    <div className="relative h-[240px] bg-white/20 backdrop-blur-xl overflow-hidden border-b border-white/30">
                      <img
                        src={step.image}
                        alt={step.alt}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br ${colorScheme.gradient} flex items-center justify-center">
                              <div class="text-center text-white">
                                <div class="text-4xl mb-2 opacity-90">📱</div>
                                <div class="text-sm font-semibold px-2 drop-shadow-lg">${step.title}</div>
                              </div>
                            </div>
                          `;
                        }}
                      />

                      {/* Glass Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10"></div>
                      
                      {/* Reflection Effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent opacity-60"></div>
                    </div>

                    {/* Glass Content - פרופורציה מאוזנת */}
                    <div className="p-5 relative h-[210px] flex flex-col justify-between">
                      <div>
                        {/* Title with Step Number */}
                        <div className="flex items-center gap-2 mb-3">
                          <div 
                            className={`w-5 h-5 bg-gradient-to-br ${colorScheme.gradient} rounded-full flex items-center justify-center shadow-md border border-white/30 flex-shrink-0`}
                            style={{
                              boxShadow: `0 2px 8px ${colorScheme.glow}`
                            }}
                          >
                            <span className="text-white text-xs font-bold">{index + 1}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 leading-tight tracking-[-0.01em]">
                            {step.title}
                          </h3>
                        </div>
                        
                        <p className="text-sm text-gray-700 leading-relaxed font-light opacity-90 mb-4">
                          {step.description}
                        </p>
                      </div>
                      
                      {/* Glass Status Badge */}
                      <div className="pt-3 border-t border-white/20">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-6 h-6 bg-gradient-to-br ${colorScheme.gradient} rounded-lg flex items-center justify-center shadow-md backdrop-blur-xl border border-white/30`}
                            style={{
                              boxShadow: `0 3px 12px ${colorScheme.glow}`
                            }}
                          >
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                          <div>
                            <div className={`text-xs font-semibold bg-gradient-to-r ${colorScheme.gradient} bg-clip-text text-transparent`}>
                              Transform Ready
                            </div>
                            <div className="text-xs text-gray-600 font-medium">Complete</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Glass Border Animation */}
                    <div 
                      className="absolute inset-0 rounded-[2rem] border-2 opacity-0 group-hover:opacity-100 transition-all duration-500"
                      style={{
                        borderImage: `linear-gradient(135deg, ${colorScheme.glow}, transparent) 1`,
                        background: `linear-gradient(135deg, ${colorScheme.glow}, transparent)`,
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'exclude'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Glass Success Indicator */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center gap-4 bg-white/40 backdrop-blur-3xl text-gray-800 px-8 py-4 rounded-full shadow-2xl border border-white/60">
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm font-bold">✓</span>
              </div>
              <span className="font-semibold text-lg">Complete Transformation</span>
            </div>
          </div>

          {/* Glass CTA */}
          <div className="text-center mt-12">
            <div className="relative max-w-4xl mx-auto">
              <div className="relative p-12 bg-white/30 backdrop-blur-3xl rounded-[3rem] border border-white/50 shadow-2xl overflow-hidden">
                
                {/* Floating Glass Elements */}
                <div className="absolute top-6 right-8 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-6 left-8 w-16 h-16 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <h3 className="text-3xl lg:text-4xl font-extralight text-gray-900 mb-4 leading-tight tracking-[-0.02em]">
                    Ready to Transform
                  </h3>
                  <h3 className="text-3xl lg:text-4xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-8 leading-tight tracking-[-0.02em] drop-shadow-sm">
                    Your Salon?
              </h3>
                  
                  <p className="text-lg text-gray-700 mb-10 leading-relaxed font-light max-w-2xl mx-auto opacity-90">
                    Experience all five revolutionary steps. Start your transformation today.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <button className="group relative px-10 py-5 bg-white/50 backdrop-blur-xl text-gray-900 font-semibold text-lg rounded-full transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] border border-white/60 hover:bg-white/70">
                      <span className="relative z-10">Start Free Trial</span>
                    </button>
                    
                    <button className="group flex items-center gap-4 text-gray-700 hover:text-gray-900 font-semibold text-lg transition-all duration-300 px-8 py-5">
                      <div className="w-16 h-16 bg-white/50 backdrop-blur-xl rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl border border-white/60 group-hover:bg-white/70">
                        <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 5v10l8-5-8-5z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                        <div className="font-bold">Experience All Steps</div>
                        <div className="text-sm text-gray-600">Interactive demo</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
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