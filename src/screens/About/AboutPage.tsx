import React, { useState } from "react";
import { Navigation } from "../../components/Navigation";
import { CTAButton } from "../../components/CTAButton";
import { ContactSection } from "../../components/ContactSection";
import { BACKGROUND_IMAGES } from "../../constants/backgroundImages";

export const AboutPage: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white w-full min-h-screen font-sans antialiased">
      <Navigation 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-20 overflow-hidden bg-gradient-to-br from-spectra-cream/30 via-white to-spectra-gold/10">
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c79c6d' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='0.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 text-center">
          <div className="inline-flex items-center gap-3 bg-white/40 backdrop-blur-xl rounded-full px-6 py-3 mb-8 border border-spectra-gold/20 shadow-lg">
            <div className="w-2 h-2 bg-spectra-gold rounded-full animate-pulse"></div>
            <span className="text-spectra-gold-dark text-sm font-semibold uppercase tracking-[0.25em]">Our Story</span>
            <div className="w-2 h-2 bg-spectra-gold-light rounded-full animate-pulse"></div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-spectra-charcoal mb-6 leading-[0.9] tracking-[-0.02em]">
            Built by Someone Who
          </h1>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-spectra-gold-light via-spectra-gold to-spectra-gold-dark leading-[0.9] tracking-[-0.02em] drop-shadow-sm mb-8">
            Lived Your Struggle
          </h1>
          
          <p className="text-xl lg:text-2xl text-spectra-charcoal-light max-w-4xl mx-auto leading-relaxed font-light">
            Every feature in Spectra solves a problem we faced as salon professionals. Real solutions for real challenges.
          </p>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left Side - Founder Profile */}
            <div className="lg:order-1">
              <div className="text-center lg:text-left">
                <div className="relative w-64 h-64 lg:w-80 lg:h-80 rounded-3xl mx-auto lg:mx-0 mb-8 overflow-hidden shadow-2xl">
                  <img 
                    src="/maor-ganon.png" 
                    alt="Maor Ganon - Founder of Spectra"
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
                
                <h2 className="text-3xl lg:text-4xl font-light text-spectra-charcoal mb-3">Maor Ganon</h2>
                <p className="text-spectra-gold font-semibold mb-6 text-xl">Founder & CEO</p>
                
                <blockquote className="text-lg text-spectra-charcoal-light leading-relaxed italic mb-8 max-w-md mx-auto lg:mx-0 border-l-4 border-spectra-gold pl-6">
                  "I didn't set out to revolutionize salons. I was too busy trying to survive my own."
                </blockquote>

                <div className="grid grid-cols-2 gap-4 lg:gap-6 max-w-md mx-auto lg:mx-0">
                  <div className="bg-gradient-to-br from-spectra-cream to-spectra-cream-dark rounded-2xl p-6 text-center backdrop-blur-sm border border-spectra-gold/20">
                    <div className="text-3xl font-light text-spectra-gold mb-2">10+</div>
                    <div className="text-sm text-spectra-charcoal-light font-medium">Years in Beauty</div>
                  </div>
                  <div className="bg-gradient-to-br from-spectra-cream to-spectra-cream-dark rounded-2xl p-6 text-center backdrop-blur-sm border border-spectra-gold/20">
                    <div className="text-3xl font-light text-spectra-gold mb-2">1,500+</div>
                    <div className="text-sm text-spectra-charcoal-light font-medium">Professionals Served</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Story Content */}
            <div className="lg:order-2">
              <div className="space-y-8">
                
                {/* The Problem */}
                <div>
                  <h3 className="text-2xl font-light text-spectra-charcoal mb-4">The Problem</h3>
                  <p className="text-lg text-spectra-charcoal-light leading-relaxed mb-4">
                    Managing a thriving salon meant daily chaos: tracking color usage without proper systems, 
                    managing inventory by guesswork, watching profits disappear to waste.
                  </p>
                  <p className="text-spectra-charcoal-light leading-relaxed">
                    "Clients booked months ahead, stylists at capacity, but I couldn't tell if we were profitable. 
                    Successful on paper, chaos behind the scenes."
                  </p>
                </div>

                {/* The Search */}
                <div className="bg-gradient-to-br from-spectra-cream/30 to-spectra-gold/10 rounded-2xl p-6 border border-spectra-gold/20">
                  <h3 className="text-2xl font-light text-spectra-charcoal mb-4">The Search</h3>
                  <p className="text-spectra-charcoal-light leading-relaxed mb-4">
                    From New York to Milan, meeting salon owners and beauty tech experts, 
                    I found the same story everywhere.
                  </p>
                  <p className="text-spectra-charcoal-light leading-relaxed">
                    Brilliant professionals held back by outdated tools from the last century.
                  </p>
                </div>

                {/* The Solution */}
                <div>
                  <h3 className="text-2xl font-light text-spectra-charcoal mb-4">The Solution</h3>
                  <p className="text-lg text-spectra-charcoal-light leading-relaxed mb-4">
                    That search became Spectra. Built by someone who lived the same pain points.
                  </p>
                  <p className="text-spectra-charcoal-light leading-relaxed">
                    Today, we're redefining how salons operate, one optimized formula at a time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-spectra-cream/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-spectra-charcoal mb-6">
              Our <span className="text-gradient-spectra font-semibold">Mission</span>
            </h2>
            <p className="text-xl text-spectra-charcoal-light max-w-4xl mx-auto leading-relaxed">
              To empower every hair professional with intelligent tools that eliminate waste, 
              maximize profits, and elevate the art of beauty.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-spectra-gold/20 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-spectra-gold-light to-spectra-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-spectra-charcoal mb-4">Precision</h3>
              <p className="text-spectra-charcoal-light leading-relaxed">
                Every formula calculated to perfection, eliminating guesswork and waste.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-spectra-gold/20 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white">🚀</span>
              </div>
              <h3 className="text-xl font-semibold text-spectra-charcoal mb-4">Innovation</h3>
              <p className="text-spectra-charcoal-light leading-relaxed">
                Cutting-edge technology meets decades of salon experience.
              </p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg border border-spectra-gold/20 hover:shadow-xl transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl text-white">🌱</span>
              </div>
              <h3 className="text-xl font-semibold text-spectra-charcoal mb-4">Sustainability</h3>
              <p className="text-spectra-charcoal-light leading-relaxed">
                Reducing waste while increasing profits - good for business and planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 lg:py-24 bg-spectra-charcoal">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mb-6">
              Our <span className="text-spectra-gold font-semibold">Impact</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Real numbers from real salons using Spectra every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-light text-spectra-gold mb-3">1,500+</div>
              <div className="text-white/80 font-medium text-lg mb-2">Hair Professionals</div>
              <div className="text-sm text-white/60">Across 25+ countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-light text-spectra-gold mb-3">$3M+</div>
              <div className="text-white/80 font-medium text-lg mb-2">Waste Prevented</div>
              <div className="text-sm text-white/60">In product costs saved</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-light text-spectra-gold mb-3">85%</div>
              <div className="text-white/80 font-medium text-lg mb-2">Average Waste Reduction</div>
              <div className="text-sm text-white/60">Measured across all users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-light text-spectra-gold mb-3">4+</div>
              <div className="text-white/80 font-medium text-lg mb-2">Years of Innovation</div>
              <div className="text-sm text-white/60">Continuous development</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-spectra-cream/30 via-white to-spectra-gold/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 lg:px-16 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-spectra-charcoal mb-6">
            Ready to <span className="text-gradient-spectra font-semibold">Transform</span> Your Business?
          </h2>
          <p className="text-xl text-spectra-charcoal-light mb-12 leading-relaxed max-w-2xl mx-auto">
            Join thousands of hair professionals who've already revolutionized their work with Spectra.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <CTAButton>
              Start Free Trial
            </CTAButton>
            
            <button className="group flex items-center gap-4 text-spectra-charcoal-light hover:text-spectra-gold font-medium text-lg transition-all duration-300 px-8 py-4">
              <div className="w-14 h-14 bg-white/60 backdrop-blur-xl rounded-full flex items-center justify-center border border-spectra-gold/20 group-hover:bg-white/80 transition-all duration-300 shadow-lg">
                <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="font-semibold">Talk to Our Team</div>
                <div className="text-sm text-spectra-gold-dark">Personal guidance</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection 
        backgroundImage={BACKGROUND_IMAGES.luxurySalon}
        title="Ready to"
        subtitle="Connect?"
        description="Let's discuss how Spectra can help your salon reach new heights of success."
      />
    </div>
  );
};

export default AboutPage; 