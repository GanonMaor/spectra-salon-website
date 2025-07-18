import React, { useState, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';
import { ClientCarousel } from '../../components/ClientCarousel';
import { Footer } from '../../components/Footer';

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
      <Navigation isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      {/* 1. Hero Section - Clean and Simple */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Darker Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 w-full h-full">
            <img 
              src="/colorbar_with_spectra.png"
              alt="Luxury salon color bar with Spectra"
              className="w-full h-full object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
          {/* Darker overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/70 to-black/75"></div>
        </div>

        {/* Content - Text and Action Buttons */}
        <div className="relative z-10 w-full h-full flex flex-col justify-center items-center">
          {/* Text Content - Centered */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-20">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-tight text-white w-full">
              Stop wasting money – start optimizing your salon with{' '}
              <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                Spectra's AI Cost Optimization App
              </span>
            </h1>
          </div>

          {/* Action Buttons - Below Text */}
          <div id="main-cta" className="flex justify-center">
            <div className="flex justify-center items-center mx-auto px-4">
              <button
                onClick={handleStartTrial}
                className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA Buttons */}
      <div 
        id="floating-cta"
        className="fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-gray-700 p-4 sm:p-6 transform translate-y-full transition-transform duration-300"
      >
        <div className="max-w-md mx-auto">
          <div className="flex justify-center items-center">
            <button
              onClick={handleStartTrial}
              className="px-8 py-4 bg-black text-white font-semibold rounded-lg text-lg border border-white hover:bg-white hover:text-black transition-colors duration-200 w-full"
              aria-label="Try Spectra for free"
            >
              Try Spectra for Free
            </button>
          </div>
        </div>
      </div>

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
                    <p className="text-gray-600 leading-relaxed">Complete setup and team training included</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
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
                    <p className="text-xs text-gray-500 font-medium">Team</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  Simple, smart & affordable
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Savings Benefits Section */}
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
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Savings Card 1 */}
            <div className="text-center p-5 bg-gradient-to-br from-amber-50/60 via-yellow-50/70 to-orange-50/60 backdrop-blur-sm rounded-2xl border border-amber-200/40 shadow-md">
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-amber-50/20 rounded-2xl"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  Up to $5,000
                </h3>
                <p className="text-amber-700 font-medium mb-2 text-sm">Saved per year</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Through smart inventory management and waste reduction
                </p>
              </div>
            </div>

            {/* Savings Card 2 */}
            <div className="text-center p-5 bg-gradient-to-br from-orange-50/60 via-red-50/70 to-amber-50/60 backdrop-blur-sm rounded-2xl border border-orange-200/40 shadow-md">
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-orange-50/20 rounded-2xl"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  +1 Hour
                </h3>
                <p className="text-orange-700 font-medium mb-2 text-sm">Per day</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Extra time saved through automated processes and efficiency
                </p>
              </div>
            </div>

            {/* Savings Card 3 */}
            <div className="text-center p-5 bg-gradient-to-br from-yellow-50/60 via-amber-50/70 to-orange-50/60 backdrop-blur-sm rounded-2xl border border-yellow-200/40 shadow-md">
              {/* Glass effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-yellow-50/20 rounded-2xl"></div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  $300+
                </h3>
                <p className="text-amber-700 font-medium mb-2 text-sm">Per month</p>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Overstock optimization and smart purchasing decisions
                </p>
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
            src="/colorbar_with_spectra.png" 
            alt="Luxury salon color bar with Spectra"
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
                <div className="inline-flex items-center justify-center w-12 h-12 bg-black/50 backdrop-blur-sm rounded-xl mb-3 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Get In Touch</h3>
                <p className="text-gray-300 text-sm">Have a question? We're here to help</p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-black/30 hover:bg-black/40 border border-gray-700/40 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.513z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </div>
                </button>
                
                <button
                  onClick={handleInstagram}
                  className="w-full bg-black/30 hover:bg-black/40 border border-gray-700/40 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button
              onClick={handleStartTrial}
              className="px-12 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-semibold rounded-full text-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              Start Your Free Trial Today
            </button>
          </div>
        </div>
      </section>

      {/* Bottom padding for floating buttons */}
      <div className="h-20 sm:h-16"></div>
      
      <MemoizedFooter />
    </div>
  );
};