import React from "react";
import { CTAButton } from "../../../components/CTAButton";

export const AboutSection: React.FC = () => {
  return (
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
                  src="/teamSpectra.png" 
                  alt="Team Spectra - The team behind the revolution"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-3">Team Spectra</h3>
              <p className="text-[#d4c4a8] font-semibold mb-6 text-xl">The Team Behind the Revolution</p>
              
              <blockquote className="text-lg text-white/80 leading-relaxed italic mb-8 max-w-md mx-auto lg:mx-0">
                "Every feature solves a problem we faced as salon professionals. Real solutions for real challenges."
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
                      <div className="text-sm font-semibold">Talk to Our Team</div>
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
  );
};

// Default export for lazy loading
export default AboutSection; 