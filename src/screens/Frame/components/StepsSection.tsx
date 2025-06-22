import React from "react";
import { walkthroughSteps } from "../../../constants/walkthroughSteps";
import { VideoSection } from "./VideoSection";
import { ContactSection } from "../../../components/ContactSection";
import { BACKGROUND_IMAGES } from "../../../constants/backgroundImages";

export const StepsSection: React.FC = () => {
  return (
    <>
    <section className="relative py-16 lg:py-20 overflow-hidden">
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 bg-white/40 backdrop-blur-3xl rounded-full px-8 py-4 mb-8 border border-white/60 shadow-2xl">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-pulse"></div>
            <span className="text-gray-700 text-sm font-semibold uppercase tracking-[0.25em]">The Complete Journey</span>
            <div className="w-2 h-2 bg-gradient-to-r from-amber-500 to-orange-400 rounded-full animate-pulse"></div>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extralight text-gray-900 mb-4 leading-[0.9] tracking-[-0.02em]">
            Five Revolutionary
          </h2>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 leading-[0.9] tracking-[-0.02em] drop-shadow-sm mb-6">
            Steps
          </h2>
          <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            From chaos to perfection. Experience the future of salon management.
          </p>
        </div>

        {/* 5 Glass Steps with Lazy Loading */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
          {walkthroughSteps.map((step, index) => {
            const colors = [
              { gradient: 'from-blue-500 to-cyan-400', glow: 'rgba(59, 130, 246, 0.15)', bg: 'rgba(59, 130, 246, 0.08)' },
              { gradient: 'from-amber-500 to-orange-400', glow: 'rgba(245, 158, 11, 0.15)', bg: 'rgba(245, 158, 11, 0.08)' },
              { gradient: 'from-red-500 to-pink-400', glow: 'rgba(239, 68, 68, 0.15)', bg: 'rgba(239, 68, 68, 0.08)' },
              { gradient: 'from-emerald-500 to-teal-400', glow: 'rgba(16, 185, 129, 0.15)', bg: 'rgba(16, 185, 129, 0.08)' },
              { gradient: 'from-gray-700 to-gray-500', glow: 'rgba(75, 85, 99, 0.15)', bg: 'rgba(75, 85, 99, 0.08)' }
            ];
            
            const colorScheme = colors[index] || colors[0];
            
            return (
              <div key={`glass-step-${index}`} className="group relative">
                {/* Refined Floating Glow - More Elegant */}
                <div 
                  className="absolute -inset-3 rounded-[2.5rem] blur-lg opacity-0 group-hover:opacity-75 transition-all duration-500 ease-out pointer-events-none"
                  style={{ background: colorScheme.glow }}
                />
                
                {/* Glass Container */}
                <div 
                  className="relative bg-white/30 backdrop-blur-3xl rounded-[2rem] border border-white/40 shadow-xl hover:shadow-2xl transition-all duration-500 ease-out group-hover:scale-[1.015] overflow-hidden h-[400px]"
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

                  {/* Glass Image Container with Lazy Loading */}
                  <div className="relative h-[200px] bg-white/20 backdrop-blur-xl overflow-hidden border-b border-white/30">
                    <img
                      src={step.image}
                      alt={step.alt}
                      className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
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

                  {/* Glass Content */}
                  <div className="p-5 relative h-[200px] flex flex-col justify-between">
                    <div>
                      {/* Title with Step Number */}
                      <div className="flex items-center gap-2 mb-3">
                        <div 
                          className={`w-5 h-5 bg-gradient-to-br ${colorScheme.gradient} rounded-full flex items-center justify-center shadow-md border border-white/30 flex-shrink-0 transition-all duration-300 ease-out`}
                          style={{
                            boxShadow: `0 2px 6px ${colorScheme.glow}`
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
                  </div>

                  {/* Refined Glass Border Animation */}
                  <div 
                    className="absolute inset-0 rounded-[2rem] border opacity-0 group-hover:opacity-60 transition-all duration-400 ease-out pointer-events-none"
                    style={{
                      borderColor: colorScheme.glow.replace('0.15', '0.25'),
                      borderWidth: '1px'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Glass CTA - עיצוב בהיר ומינימליסטי */}
        <div className="text-center">
          <div className="relative max-w-3xl mx-auto">
            <div className="relative p-8 bg-white/30 backdrop-blur-3xl rounded-[2.5rem] border border-white/50 shadow-2xl overflow-hidden">
              {/* Floating Glass Elements */}
              <div className="absolute top-4 right-6 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"></div>
              <div className="absolute bottom-4 left-6 w-12 h-12 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-xl"></div>
              <div className="relative z-10">
                <h3 className="text-2xl lg:text-3xl font-extralight text-gray-900 mb-3 leading-tight tracking-[-0.02em]">
                  Ready to Transform
                </h3>
                <h3 className="text-2xl lg:text-3xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-6 leading-tight tracking-[-0.02em] drop-shadow-sm">
                  Your Business?
                </h3>
                <p className="text-base text-gray-700 mb-8 leading-relaxed font-light max-w-xl mx-auto opacity-90">
                  Experience all five revolutionary steps. Start your transformation today.
                </p>
                
                {/* כפתור יחיד - Start Free Trial בלבד */}
                <button className="group relative px-12 py-6 bg-gradient-to-r from-[#FF9500] to-[#E6850E] hover:from-[#E6850E] hover:to-[#CC7A0D] text-white font-semibold text-xl rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] border border-[#FF9500]/20">
                  <span className="relative z-10">Start Free Trial</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E6850E] to-[#CC7A0D] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>

    {/* Video Section */}
    <VideoSection />

    {/* Contact Section - עם התמונה שלך */}
    <ContactSection 
      backgroundImage={BACKGROUND_IMAGES.yourCustomSalon}
      title="Ready to"
      subtitle="Transform?"
      description="Join thousands of salon professionals who've revolutionized their business with Spectra."
    />
    </>
  );
}; 