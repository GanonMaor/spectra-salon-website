import React, { useState, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';
import { ClientCarousel } from '../../components/ClientCarousel';
import { Footer } from '../../components/Footer';
import { CountdownTimer } from '../../components/CountdownTimer';

// Memoize static components for better performance
const MemoizedClientCarousel = memo(ClientCarousel);
const MemoizedFooter = memo(Footer);

export const UGCOfferPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      if (floatingCta) {
        if (window.scrollY > 400) {
          floatingCta.style.transform = 'translateY(0)';
        } else {
          floatingCta.style.transform = 'translateY(100%)';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navigation />
      
      {/* 1. Hero Section - Clean and Simple */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Darker Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="/pink-hair_bg.jpg"
              alt="Professional salon with pink hair styling"
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
          {/* Darker overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/75"></div>
        </div>

        {/* Content - Text and Action Buttons */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-white mb-8 leading-tight">
            Stop Losing Money on
            <br />
            <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent font-medium">
              Wasted Hair Color
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed">
            Spectra's <strong className="text-yellow-400">AI-powered platform</strong> cuts color waste by <strong className="text-green-400">85%</strong> and saves salons 
            <strong className="text-yellow-400"> up to $10,000+ a year</strong>. Get set up in 
            <strong className="text-blue-400"> 5 minutes</strong>.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleStartTrial}
              className="group relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 hover:rotate-1"
            >
              <span className="relative z-10">Start Free Trial</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <div className="flex gap-4">
              <button
                onClick={handleWhatsApp}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                📱 WhatsApp
              </button>
              <button
                onClick={handleInstagram}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
              >
                📸 Instagram
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Triple Bundle Special Offer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gray-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gray-100 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Main Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent font-medium">
                Triple Bundle
              </span>
              <span className="text-gray-900 font-light"> Special Offer</span>
            </h2>
            <div className="flex justify-center mb-8">
              <CountdownTimer />
            </div>
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
                      Free Equipment Worth $300+
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

            {/* Pricing with Enhanced Design */}
            <div className="text-center mb-8">
              <div className="relative inline-flex flex-col items-center bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl px-8 py-6 border border-gray-200 shadow-lg hover:shadow-xl hover:border-gray-300 transition-all duration-500 transform hover:scale-105">
                <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold px-3 py-2 rounded-full shadow-lg animate-bounce">
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
                  Normally $78-$158/month
                </p>
              </div>
            </div>

            {/* Single CTA Button */}
            <div className="text-center">
              <button
                onClick={handleStartTrial}
                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white px-12 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 min-w-[280px]"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  🚀 Claim Your Bundle Now
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

      {/* 4. Inspirational Section with Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
        {/* Dark Background Effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header Text */}
          <div className="text-center mb-12">
            <p className="text-xl text-gray-300 mb-4">Ask yourself…</p>
            <h2 className="text-4xl sm:text-5xl font-light text-white leading-tight">
              Are you still dreaming of being the{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent font-medium">
                best salon owner
              </span>{' '}
              you can be?
            </h2>
            <p className="text-2xl text-gray-100 mt-8 font-medium">
              With us, you can.
            </p>
          </div>

          {/* Image */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-40"></div>
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-400/15 to-yellow-400/15 rounded-3xl blur-lg"></div>
            
            <div className="relative rounded-3xl overflow-hidden border-2 border-yellow-400/30 shadow-[0_20px_60px_rgba(255,193,7,0.2)]">
              <img 
                src="/hair_colorist_in_a_color_bar.png"
                alt="Professional hair colorist working at color bar"
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
        </div>
      </section>

      {/* 5. Discover Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-6">
              See what Spectra clients are saying
            </h2>
          </div>
          
          <div className="relative">
            <MemoizedClientCarousel />
          </div>
        </div>
      </section>

      {/* 6. Contact & Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/spectra_logo.png" 
            alt="Spectra - AI-Powered Salon Management"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-gray-900/95 to-black/90"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="mb-12">
            <h2 className="text-3xl sm:text-4xl font-light text-white mb-6">
              Ready to transform your salon?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Get started today or schedule a personalized demo
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Demo Booking */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-gray-800/40 shadow-xl hover:bg-black/40 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-600/60 backdrop-blur-sm rounded-xl mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Book Your Demo</h3>
                <p className="text-gray-300 text-sm">See Spectra in action</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.open('https://calendly.com/spectra-demo/15min', '_blank')}
                  className="w-full bg-black/30 hover:bg-black/40 border border-gray-700/40 rounded-xl p-4 transition-all duration-300 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="text-left">
                        <p className="font-medium">Quick Demo</p>
                        <p className="text-sm opacity-80">15 minutes • Core features</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>

                <button
                  onClick={() => window.open('https://calendly.com/spectra-demo/30min', '_blank')}
                  className="w-full bg-black/30 hover:bg-black/40 border border-gray-700/40 rounded-xl p-4 transition-all duration-300 text-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <div className="text-left">
                        <p className="font-medium">Full Demo</p>
                        <p className="text-sm opacity-80">30 minutes • Complete walkthrough</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>

            {/* Contact Options */}
            <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-gray-800/40 shadow-xl hover:bg-black/40 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600/60 backdrop-blur-sm rounded-xl mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Get In Touch</h3>
                <p className="text-gray-300 text-sm">Direct contact options</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-green-600/20 hover:bg-green-600/30 border border-green-600/40 rounded-xl p-4 transition-all duration-300 text-white"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl">📱</span>
                    <span className="font-medium">WhatsApp</span>
                  </div>
                </button>

                <button
                  onClick={handleInstagram}
                  className="w-full bg-pink-600/20 hover:bg-pink-600/30 border border-pink-600/40 rounded-xl p-4 transition-all duration-300 text-white"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl">📸</span>
                    <span className="font-medium">Instagram</span>
                  </div>
                </button>

                <button
                  onClick={() => window.open('mailto:hello@spectra-ci.com', '_blank')}
                  className="w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/40 rounded-xl p-4 transition-all duration-300 text-white"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl">✉️</span>
                    <span className="font-medium">Email</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center">
            <button
              onClick={handleStartTrial}
              className="group relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white px-12 py-4 rounded-xl text-xl font-semibold shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10">🚀 Start Your Transformation Today</span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            <p className="text-gray-400 text-sm mt-4">
              30-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Floating CTA */}
      <div 
        id="floating-cta"
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 translate-y-full transition-transform duration-500 z-50"
      >
        <button
          onClick={handleStartTrial}
          className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-semibold shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          🔥 Limited Time Offer
        </button>
      </div>

      <MemoizedFooter />
    </div>
  );
};