import React, { useState, useCallback, memo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClientCarousel } from '../../components/ClientCarousel';
import { Footer } from '../../components/Footer';
import { ContactSection } from '../../components/ContactSection';
import { BACKGROUND_IMAGES } from '../../constants/backgroundImages';
import { LeadForm } from '../../components/LeadForm';

// Memoize static components for better performance
const MemoizedClientCarousel = memo(ClientCarousel);
const MemoizedFooter = memo(Footer);

export const UGCOfferPage: React.FC = () => {
  const navigate = useNavigate();

  // Use useCallback to prevent unnecessary re-renders
  const handleStartTrial = useCallback(() => {
    navigate('/signup?trial=true');
  }, [navigate]);

  const handleWhatsApp = useCallback(() => {
    window.open('https://wa.me/972504322680', '_blank');
  }, []);

  const handleInstagram = useCallback(() => {
    window.open('https://instagram.com/spectra_salon', '_blank');
  }, []);

  // Scroll to top when accessing page directly
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Show floating buttons after scroll
  useEffect(() => {
    const handleScroll = () => {
      const floatingCta = document.getElementById('floating-cta');
      const heroSection = document.querySelector('section'); // First section (hero)
      
      if (floatingCta && heroSection) {
        const heroHeight = heroSection.offsetHeight;
        const scrollPosition = window.scrollY;
        
        // Show with smooth reveal after passing hero section
        if (scrollPosition > heroHeight * 0.9) {
          floatingCta.style.transform = 'translateX(-50%) translateY(0)';
          floatingCta.style.opacity = '1';
        } else {
          floatingCta.style.transform = 'translateX(-50%) translateY(120%)';
          floatingCta.style.opacity = '0';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* 1. Hero Section - Full Screen */}
      <section className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-16 overflow-hidden min-h-screen flex items-center">
        {/* Background - Using same gradient as home */}
        <div className="absolute inset-0 gradient-bg-hero" />

        {/* Subtle luxury pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c79c6d' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='0.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 h-full flex flex-col justify-center">
          <div className="text-center">

            {/* Trust Badge - Larger and more spaced */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 lg:mb-20">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-spectra-gold-light to-spectra-gold rounded-full shadow-sm"></div>
              <span className="text-spectra-gold-dark text-xs sm:text-sm lg:text-base font-semibold uppercase tracking-[0.3em] sm:tracking-[0.35em] opacity-90 px-3 text-center">
                Trusted by 1,500+ Hair Professionals
              </span>
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-spectra-gold to-spectra-gold-dark rounded-full shadow-sm"></div>
            </div>

            {/* Main Headline - Much larger and spaced */}
            <div className="mb-16 sm:mb-20 lg:mb-24 xl:mb-28">
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[8rem] 2xl:text-[10rem] font-extralight text-spectra-charcoal mb-6 sm:mb-8 lg:mb-10 leading-[0.85] tracking-[-0.03em]">
                Stop Losing
              </h1>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[8rem] 2xl:text-[10rem] font-extralight text-spectra-charcoal mb-6 sm:mb-8 lg:mb-10 leading-[0.85] tracking-[-0.03em]">
                Money on
              </h1>
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[8rem] 2xl:text-[10rem] font-light text-transparent bg-clip-text bg-gradient-to-r from-spectra-gold-light via-spectra-gold to-spectra-gold-dark leading-[0.85] tracking-[-0.03em] drop-shadow-lg">
                Wasted Hair Color
            </h1>
          </div>

            {/* Value Proposition - Larger and more spaced */}
            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl text-spectra-charcoal-light mb-16 sm:mb-20 lg:mb-24 xl:mb-28 leading-[1.3] sm:leading-[1.25] font-light max-w-2xl sm:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto tracking-[-0.02em] px-2 sm:px-0">
              Spectra's <span className="font-semibold text-gradient-spectra">AI-powered platform</span> cuts color waste by&nbsp;
              <span className="font-semibold text-gradient-spectra">85%</span> and saves salons 
              <span className="font-semibold text-gradient-spectra"> up to&nbsp;$10,000+ a year</span>. 
              Get set up in <span className="font-semibold text-gradient-spectra">5&nbsp;minutes</span>.
            </p>

            {/* CTA Buttons - Larger and more spaced */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 lg:gap-10 justify-center items-center px-4 sm:px-0">
              <button
                onClick={handleStartTrial}
                className="inline-block px-8 py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white font-semibold text-base md:text-lg lg:text-xl rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] text-center min-w-fit"
              >
                Take me straight to my free trial
              </button>
              
              <button 
                onClick={() => window.open('https://calendly.com/spectra-demo/15min', '_blank')}
                className="group flex items-center gap-4 sm:gap-6 lg:gap-8 text-spectra-charcoal-light hover:text-spectra-gold font-medium text-lg sm:text-xl lg:text-2xl xl:text-3xl transition-all duration-300 px-6 sm:px-10 lg:px-12 py-4 sm:py-6 lg:py-8 justify-center min-w-fit"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-gradient-to-br from-spectra-cream-dark to-spectra-cream group-hover:from-spectra-gold/10 group-hover:to-spectra-gold-light/10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl border border-spectra-gold/10 group-hover:border-spectra-gold/20 flex-shrink-0">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 ml-1 sm:ml-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z"/>
                  </svg>
                </div>
                <span className="whitespace-nowrap">Watch Demo</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Triple Bundle Special Offer Section - NO COUNTDOWN */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-100 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main Section Header - NO LIMITED TIME */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent font-medium">
                Triple Bundle
              </span>
              <span className="text-gray-900 font-light"> Special Offer</span>
            </h2>
          </div>

          <div className="max-w-lg mx-auto">
            {/* Offer Items - Clean Numbered List */}
            <div className="space-y-6 mb-12">
              <div className="group p-6 hover:bg-gray-50/80 transition-all duration-300 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-medium text-gray-900 mb-2">
                      30 Day Free Trial
                    </h4>
                    <p className="text-gray-600 leading-relaxed">Full access, no commitment required</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 hover:bg-gray-50/80 transition-all duration-300 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-medium text-gray-900 mb-2">
                      Free Equipment
                    </h4>
                    <p className="text-gray-600 leading-relaxed">Smart Bluetooth Scale & Premium Lamicall Stand included as gift</p>
                  </div>
                </div>
              </div>
              
              <div className="group p-6 hover:bg-gray-50/80 transition-all duration-300 rounded-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-medium text-gray-900 mb-2">
                      Custom Training & Setup
                    </h4>
                    <p className="text-gray-600 leading-relaxed">Complete setup and team training included (Value: $500)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing without Limited Time Badge */}
            <div className="text-center mb-8">
              <div className="relative inline-flex flex-col items-center bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl px-8 py-6 border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-500 transform hover:scale-105">
                
                {/* 50% OFF Badge */}
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                  50% OFF
                </div>
                
                <p className="text-sm text-gray-600 mb-2 font-medium">
                  Starting from
                </p>
                <div className="flex items-center gap-6 mb-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600 mb-1 transform hover:scale-110 transition-transform duration-200">
                      $39<span className="text-lg">/month</span>
                    </p>
                    <p className="text-xs text-gray-500 font-medium">Solo User</p>
                  </div>
                  <div className="w-px h-12 bg-gray-300"></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600 mb-1 transform hover:scale-110 transition-transform duration-200">
                      $79<span className="text-lg">/month</span>
                    </p>
                    <p className="text-xs text-gray-500 font-medium">Team Plan</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Full access included
                </p>
              </div>
            </div>

            {/* Single CTA Button */}
            <div className="text-center">
              <button
                onClick={handleStartTrial}
                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white px-8 py-3 md:px-10 md:py-4 rounded-xl text-base md:text-lg font-semibold shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 min-w-[260px] md:min-w-[280px]"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  Take me straight to my free trial
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-800 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Savings Calculator Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-green-100 to-cyan-100 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
              Your salon's potential savings with{' '}
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent font-medium">
                Spectra
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              See the real impact on your bottom line and discover how much you could save
            </p>
          </div>
          
          {/* Savings Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">$8,500</h3>
                <p className="text-gray-600 mb-4">Average annual savings</p>
                <div className="text-sm text-gray-500">
                  <p>• 85% less color waste</p>
                  <p>• Better inventory management</p>
                  <p>• Optimized color mixing</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">⏱️</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">3.5 hours</h3>
                <p className="text-gray-600 mb-4">Saved per week</p>
                <div className="text-sm text-gray-500">
                  <p>• Automated color calculations</p>
                  <p>• Instant mixing ratios</p>
                  <p>• Real-time tracking</p>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">23%</h3>
                <p className="text-gray-600 mb-4">Increase in profits</p>
                <div className="text-sm text-gray-500">
                  <p>• Better cost control</p>
                  <p>• Reduced waste</p>
                  <p>• Enhanced efficiency</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Inspirational Section - Same as Hero Background */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background - Same as Hero */}
        <div className="absolute inset-0 gradient-bg-hero" />

        {/* Subtle luxury pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c79c6d' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='0.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header Text */}
          <div className="text-center mb-12">
            <p className="text-xl text-spectra-gold-dark mb-4 font-medium">Ask yourself…</p>
            <h2 className="text-4xl sm:text-5xl font-light text-spectra-charcoal leading-tight">
              Are you still dreaming of being the{' '}
              <span className="bg-gradient-to-r from-spectra-gold-light via-spectra-gold to-spectra-gold-dark bg-clip-text text-transparent font-medium">
                best salon owner
              </span>{' '}
              you can be?
            </h2>
          </div>

          {/* Image - new image of red_head_using_spectra */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-spectra-gold/20 to-spectra-gold-light/20 rounded-3xl blur-xl opacity-40"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-spectra-gold-light/15 to-spectra-gold/15 rounded-3xl blur-lg"></div>
            
            <div className="relative rounded-3xl overflow-hidden border-2 border-spectra-gold/30 shadow-[0_20px_60px_rgba(199,156,109,0.2)]">
              <img 
                src="/red_haed_using_spectra.jpg"
                alt="Red-haired stylist using Spectra system"
                className="w-full h-auto object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";
                }}
              />
            </div>
          </div>

          {/* "With us, you can" - below image with spacing */}
          <p className="text-lg text-spectra-charcoal-light max-w-3xl mx-auto">
            With us, you can.
          </p>
        </div>
      </section>

      {/* 5. Client Reviews + Contact Section - single section with dark background */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Dream Salon Background - Modern Glass Store with Pink Clouds */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)),
              url('/dream-salon2.jpg')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        />
        
        {/* Extra Dark Gradient Overlay for Header Section */}
        <div className="absolute inset-0 z-5 bg-gradient-to-b from-black/60 via-transparent to-transparent h-1/3"></div>

        {/* Enhanced Floating Glass Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-amber-400/8 to-orange-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>
          
          {/* Additional atmospheric elements */}
          <div className="absolute top-10 right-32 w-64 h-64 bg-gradient-to-br from-pink-400/5 to-purple-400/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-10 left-32 w-48 h-48 bg-gradient-to-br from-cyan-400/8 to-blue-400/8 rounded-full blur-2xl animate-pulse delay-3000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-12 lg:px-16">
          
          {/* Client Reviews Section - title design like "Ready to Transform?" */}
          <div className="mb-20">
          <div className="text-center mb-12">
              <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-white mb-6 leading-[0.9] tracking-[-0.02em]">
              See what Spectra{' '}
              <span className="bg-gradient-to-r from-spectra-gold-light via-spectra-gold to-spectra-gold-dark bg-clip-text text-transparent font-medium">
                clients
              </span>{' '}
              are saying
            </h2>
          </div>
          
          <div className="relative">
            <MemoizedClientCarousel />
          </div>
        </div>

          {/* Contact Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extralight text-white mb-6 leading-[0.9] tracking-[-0.02em]">
              Ready to
            </h2>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 leading-[0.9] tracking-[-0.02em] drop-shadow-2xl mb-8">
              Transform?
            </h2>
            <p className="text-xl lg:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed font-light">
              Join thousands of salon professionals who've revolutionized their business with Spectra.
            </p>
          </div>

          {/* Lead form removed per request */}

          {/* 1. DEMO WIDGET - TOP SECTION */}
          <div className="mb-16">
            <div className="relative max-w-4xl mx-auto">
              <div className="relative p-8 lg:p-12 bg-white/15 backdrop-blur-3xl rounded-[3rem] border border-white/25 shadow-2xl overflow-hidden">
                
                {/* 3D Effect Elements */}
                <div className="absolute top-6 right-8 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="absolute bottom-6 left-8 w-12 h-12 bg-gradient-to-br from-purple-400/20 to-pink-300/20 rounded-full blur-xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-8 h-8 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-lg animate-pulse delay-500"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  
                  <h3 className="text-3xl lg:text-4xl font-light text-white mb-4 leading-tight tracking-[-0.02em]">
                    Book Your Demo
                  </h3>
                  
                  <p className="text-lg text-white/80 mb-8 leading-relaxed font-light max-w-2xl mx-auto">
                    See Spectra in action with a personalized walkthrough
                  </p>
                  
                  <a 
                    href="https://calendly.com/spectra-ci/demo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-[#FF9500] to-[#E6850E] hover:from-[#E6850E] hover:to-[#CC7A0D] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] border border-[#FF9500]/20"
                  >
                    <span className="relative z-10">Schedule Demo</span>
                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#E6850E] to-[#CC7A0D] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </a>
                  </div>
              </div>
            </div>
              </div>

          {/* 2. COMMUNICATION METHODS - 3 BUTTONS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto">
            
            {/* WhatsApp */}
            <div className="group relative">
              <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-50 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-green-400/40 to-green-500/40"></div>
              <a 
                href="https://wa.me/972504322680?text=Hi! I'm interested in learning more about Spectra"
                target="_blank"
                rel="noopener noreferrer"
                className="relative bg-white/15 backdrop-blur-3xl rounded-[2rem] border border-white/25 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 block group-hover:scale-[1.02] group-hover:border-white/40 h-full"
              >
                
                <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                
                <div className="relative flex flex-col items-center text-center h-full justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">WhatsApp</h3>
                  <p className="text-white/70 text-sm">Quick response</p>
                </div>
              </a>
            </div>

            {/* Instagram */}
            <div className="group relative">
              <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-50 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-pink-400/40 to-purple-500/40"></div>
              <a 
                href="https://www.instagram.com/spectra.ci/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative bg-white/15 backdrop-blur-3xl rounded-[2rem] border border-white/25 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 block group-hover:scale-[1.02] group-hover:border-white/40 h-full"
                onClick={(e) => {
                  e.preventDefault();
                  navigator.clipboard.writeText("Hi! I'm interested in learning more about Spectra. Can you help me get started?");
                  window.open("https://www.instagram.com/spectra.ci/", "_blank");
                  const notification = document.createElement('div');
                  notification.innerHTML = 'Message copied! Paste it in Instagram DM';
                  notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                  document.body.appendChild(notification);
                  setTimeout(() => notification.remove(), 3000);
                }}
              >
                
                <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                
                <div className="relative flex flex-col items-center text-center h-full justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Instagram DM</h3>
                  <p className="text-white/70 text-sm">@spectra.ci</p>
              </div>
              </a>
            </div>

            {/* Email */}
            <div className="group relative">
              <div className="absolute -inset-4 rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-40 transition-all duration-700 ease-out pointer-events-none bg-gradient-to-r from-blue-400/30 to-cyan-300/30"></div>
              <a 
                href="mailto:office@spectra-ci.com"
                className="relative bg-white/15 backdrop-blur-3xl rounded-[2rem] border border-white/25 shadow-2xl hover:shadow-3xl transition-all duration-500 p-8 block group-hover:scale-[1.02] group-hover:border-white/40 h-full"
              >
                
                <div className="absolute inset-1 rounded-[1.8rem] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
                
                <div className="relative flex flex-col items-center text-center h-full justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-xl border border-white/30 group-hover:scale-110 transition-transform duration-500 mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">Email Us</h3>
                  <p className="text-white/70 text-sm">office@spectra-ci.com</p>
                </div>
              </a>
          </div>

          </div>
        </div>
      </section>

      {/* Floating CTA - same as before */}
      <div 
        id="floating-cta"
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 translate-y-full opacity-0 transition-all duration-500 ease-in-out z-50"
        style={{ transform: 'translateX(-50%) translateY(120%)', opacity: 0 }}
      >
        <div className="relative">
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-red-400 rounded-full blur-lg opacity-30 scale-110"></div>
          
          <button
            onClick={handleStartTrial}
            className="relative group bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 text-white px-7 py-3 md:px-8 md:py-4 rounded-full font-semibold shadow-[0_6px_25px_rgba(251,146,60,0.35)] hover:shadow-[0_8px_35px_rgba(251,146,60,0.5)] transition-all duration-300 hover:scale-105 flex items-center gap-3 text-sm md:text-base whitespace-nowrap"
          >
            <span className="whitespace-nowrap">Take me straight to my free trial</span>
          </button>
        </div>
      </div>
      
      <MemoizedFooter />
    </div>
  );
};