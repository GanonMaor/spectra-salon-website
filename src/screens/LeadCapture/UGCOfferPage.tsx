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
      
      {/* 1. Hero Section */}
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
        className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-yellow-200/50 p-3 sm:p-4 transform translate-y-full transition-transform duration-300"
      >
        <div className="max-w-md mx-auto">
          <div className="flex justify-center items-center">
            <button
              onClick={handleStartTrial}
              className="px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              aria-label="Start your free trial"
            >
              Start Free Trial
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
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                The Triple Bundle Special...
              </span>
              <br />
              <span className="text-gray-900 font-medium">Special Offer</span>
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
                    <p className="text-gray-600 leading-relaxed">Professional hardware included</p>
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
              <div className="relative inline-flex flex-col items-center bg-gradient-to-r from-white via-gray-50 to-white rounded-2xl px-6 py-4 border border-gray-200 shadow-lg">
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  SAVE $799!
                </div>
                <p className="text-sm text-gray-600 mb-1 font-medium">
                  Starting from
                </p>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  <span className="text-blue-600">$39/month</span>
                </p>
                <p className="text-sm text-gray-600 font-medium">
                  Simple, smart & affordable
                </p>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-6">Have a question?</p>
              <div className="flex flex-row gap-4 justify-center">
                <button
                  onClick={handleWhatsApp}
                  className="group bg-white hover:bg-green-50 text-gray-900 font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-md border border-gray-200 hover:border-green-200 hover:shadow-lg"
                  aria-label="Contact us on WhatsApp"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.513z"/>
                    </svg>
                    <span className="text-sm">WhatsApp</span>
                  </div>
                </button>
                
                <button
                  onClick={handleInstagram}
                  className="group bg-white hover:bg-pink-50 text-gray-900 font-medium py-3 px-4 rounded-xl transition-all duration-300 shadow-md border border-gray-200 hover:border-pink-200 hover:shadow-lg"
                  aria-label="Follow us on Instagram"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span className="text-sm">Instagram</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Savings Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
              See Your Salon's{' '}
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Real Savings
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* 80% Less Color Waste */}
            <div className="text-center p-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl border border-red-100 hover:shadow-lg transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-2">80%</h3>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Less Color Waste</h4>
              <p className="text-gray-600 leading-relaxed">
                Stop throwing money away on expired or unused color products. Our AI tracks usage patterns and optimizes your inventory.
              </p>
            </div>

            {/* 30% Time Savings */}
            <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border border-blue-100 hover:shadow-lg transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-600 mb-2">30%</h3>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Time Savings</h4>
              <p className="text-gray-600 leading-relaxed">
                Streamline your color mixing process and reduce preparation time with smart formulation recommendations.
              </p>
            </div>

            {/* 50% Less Overstock */}
            <div className="text-center p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border border-green-100 hover:shadow-lg transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">50%</h3>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Less Overstock</h4>
              <p className="text-gray-600 leading-relaxed">
                Never order too much again. Smart inventory management prevents overstocking and reduces storage costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Call to Action Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-light mb-8 leading-tight text-white">
            Ask yourself…
          </h2>
          <h3 className="text-2xl sm:text-3xl font-light mb-12 leading-relaxed text-gray-200">
            Are you still chasing the dream of being the best salon owner you set out to be or are you finally ready to become it?
          </h3>
          <p className="text-xl text-yellow-400 font-medium mb-8">
            With us, you can.
          </p>
          <button
            onClick={handleStartTrial}
            className="px-12 py-4 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white font-semibold rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
          >
            Start Your Transformation
          </button>
        </div>
      </section>

      {/* 5. Discover Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-xl mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-3">Get Started Today</h2>
              <p className="text-gray-600">Book a demo or start your free trial to see Spectra in action</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <button
                onClick={() => window.open('https://calendly.com/spectra-demo/15min', '_blank')}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-6 transition-all duration-300 hover:shadow-md group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Quick Demo</p>
                      <p className="text-sm text-gray-600">15 minutes • Core features</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => window.open('https://calendly.com/spectra-demo/30min', '_blank')}
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-xl p-6 transition-all duration-300 hover:shadow-md group text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Full Demo</p>
                      <p className="text-sm text-gray-600">30 minutes • Complete walkthrough</p>
                    </div>
                  </div>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4">Or reach out directly:</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleWhatsApp}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                >
                  WhatsApp: +972504322680
                </button>
                <button
                  onClick={handleInstagram}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
                >
                  Follow on Instagram
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom padding for floating buttons */}
      <div className="h-20 sm:h-16"></div>
      
      <MemoizedFooter />
    </div>
  );
};

 