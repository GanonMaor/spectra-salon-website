import React, { Suspense, lazy, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { LoadingSpinner } from "../../../components/LoadingSpinner";

// Lazy Loading של קרוסלת הלקוחות
const ClientCarousel = lazy(() => 
  import("../../../components/ClientCarousel").then(module => ({
    default: module.ClientCarousel
  }))
);

export const HeroSection: React.FC = () => {
  const [showUGCPopup, setShowUGCPopup] = useState(false);

  // Show UGC popup after 12 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowUGCPopup(true);
    }, 12000);

    return () => clearTimeout(timer);
  }, []);

  const handleClosePopup = () => {
    setShowUGCPopup(false);
  };

  return (
    <>
      <section className="relative pt-20 pb-8 sm:pt-24 sm:pb-12 lg:pt-32 lg:pb-16 overflow-hidden min-h-[90vh] sm:min-h-screen">
        {/* Background - Using new gradient class */}
        <div className="absolute inset-0 gradient-bg-hero" />

        {/* Subtle luxury pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c79c6d' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='0.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center">
            
            {/* Trust Badge - מותאם למובייל */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-spectra-gold-light to-spectra-gold rounded-full shadow-sm"></div>
              <span className="text-spectra-gold-dark text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-90 px-2 text-center">
                Trusted by 1,500+ Hair Professionals
              </span>
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-spectra-gold to-spectra-gold-dark rounded-full shadow-sm"></div>
            </div>

            {/* Main Headline - מותאם למובייל */}
            <div className="mb-8 sm:mb-12 lg:mb-16">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight text-spectra-charcoal mb-3 sm:mb-4 lg:mb-6 leading-[0.9] tracking-[-0.02em]">
                Stop Losing
              </h1>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight text-spectra-charcoal mb-3 sm:mb-4 lg:mb-6 leading-[0.9] tracking-[-0.02em]">
                Money on
              </h1>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-spectra-gold-light via-spectra-gold to-spectra-gold-dark leading-[0.9] tracking-[-0.02em] drop-shadow-sm">
                Wasted Hair Color
              </h1>
            </div>

            {/* Value Proposition - מותאם למובייל */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-spectra-charcoal-light mb-8 sm:mb-12 lg:mb-16 leading-[1.3] sm:leading-[1.2] font-light max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto tracking-[-0.01em] px-2 sm:px-0">
              Spectra's <span className="font-semibold text-gradient-spectra">AI-powered platform</span> cuts color waste by&nbsp;
              <span className="font-semibold text-gradient-spectra">85%</span> and saves salons 
              <span className="font-semibold text-gradient-spectra"> up to&nbsp;$10,000+ a year</span>. 
              Get set up in <span className="font-semibold text-gradient-spectra">5&nbsp;minutes</span>.
            </p>

            {/* CTA Buttons - Fixed alignment */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0">
              <Link 
                to="/lead-capture" 
                className="inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-center min-w-fit"
              >
                Start Free Trial
              </Link>
              
              <button className="group flex items-center gap-3 sm:gap-4 text-spectra-charcoal-light hover:text-spectra-gold font-medium text-base sm:text-lg transition-all duration-300 px-4 sm:px-8 py-3 sm:py-4 justify-center min-w-fit">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-spectra-cream-dark to-spectra-cream group-hover:from-spectra-gold/10 group-hover:to-spectra-gold-light/10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md border border-spectra-gold/10 group-hover:border-spectra-gold/20 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 sm:ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5v10l8-5-8-5z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Watch Demo</div>
                  <div className="text-sm text-spectra-gold-dark">2 minutes</div>
                </div>
              </button>
            </div>

            {/* Transition Text - מותאם למובייל */}
            <div className="mb-6 sm:mb-8">
              <p className="text-base sm:text-lg text-spectra-charcoal-light font-light px-4 sm:px-0">
                Don't just take our word for it...
              </p>
            </div>

            {/* Client Carousel - מותאם למובייל */}
            <div className="mb-8 sm:mb-12 -mx-4 sm:mx-0">
              <Suspense fallback={<LoadingSpinner />}>
                <ClientCarousel />
              </Suspense>
            </div>

            {/* Trust Indicators - מותאם למובייל */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-4 sm:px-0">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-spectra-gold drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-spectra-charcoal-light text-sm sm:text-base font-medium text-center">4.9 from 650+ reviews</span>
            </div>

            {/* Smooth Transition to Next Section - מותאם למובייל */}
            <div className="text-center px-4 sm:px-0">
              <p className="text-base sm:text-lg text-spectra-charcoal-light font-light mb-4 sm:mb-6">
                Ready to see it in action?
              </p>
              <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-spectra-gold/50 to-transparent mx-auto"></div>
            </div>

          </div>
        </div>
      </section>

      {/* UGC Special Offer Popup */}
      {showUGCPopup && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={handleClosePopup}>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl w-full max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto relative my-4 max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/30 text-white hover:bg-white/40 hover:border-white/50 transition-all duration-300 z-50 cursor-pointer group"
              aria-label="Close popup"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Dark Salon Background */}
            <div 
              className="absolute inset-0 z-0 rounded-2xl sm:rounded-3xl"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)),
                  url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />

            {/* Content */}
            <div className="relative z-10 p-3 sm:p-6 lg:p-8">
              
              {/* Header Badge */}
              <div className="text-center mb-3 sm:mb-6">
                <div className="inline-flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-xl rounded-full px-3 py-1 sm:px-6 sm:py-2 border border-white/20 shadow-xl">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white/90 text-xs sm:text-sm font-semibold uppercase tracking-[0.1em] sm:tracking-[0.2em]">Special UGC Offer</span>
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Updated Headline */}
              <div className="text-center mb-4 sm:mb-8">
                <h2 className="text-lg sm:text-2xl lg:text-4xl font-extralight text-white mb-2 sm:mb-4 leading-tight">
                  Welcome to the UGC Experience
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-white/90 font-light leading-relaxed mb-1 sm:mb-2 px-2">
                  Step into the future of salon management with your very own plug & play smart system — fully customized for your salon.
                </p>
                <p className="text-xs sm:text-sm lg:text-base text-orange-300/90 font-medium px-2">
                  Now available with exclusive early-access pricing — up to 50% off + a complete $2,500 system, absolutely FREE.
                </p>
              </div>

              {/* Pricing Plans */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
                
                {/* Solo Plan - 50% OFF */}
                <div className="bg-white/5 backdrop-blur-xl rounded-lg sm:rounded-2xl p-2 sm:p-4 border border-white/10 text-center relative">
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-orange-500 text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl text-xs font-bold">
                    50% OFF
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm font-medium mb-1 sm:mb-2">SOLO</div>
                  <div className="text-orange-400 text-xs sm:text-sm line-through mb-1">$79</div>
                  <div className="text-lg sm:text-2xl font-light text-white mb-2 sm:mb-3">$39<span className="text-xs sm:text-sm text-white/60">/mo</span></div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Multi Plan - 38% OFF */}
                <div className="bg-white/5 backdrop-blur-xl rounded-lg sm:rounded-2xl p-2 sm:p-4 border border-white/10 text-center relative">
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-orange-500 text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl text-xs font-bold">
                    38% OFF
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm font-medium mb-1 sm:mb-2">MULTI</div>
                  <div className="text-orange-400 text-xs sm:text-sm line-through mb-1">$129</div>
                  <div className="text-lg sm:text-2xl font-light text-white mb-2 sm:mb-3">$79<span className="text-xs sm:text-sm text-white/60">/mo</span></div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                </div>

                {/* Studio Plan - 31% OFF */}
                <div className="bg-white/5 backdrop-blur-xl rounded-lg sm:rounded-2xl p-2 sm:p-4 border border-white/10 text-center relative">
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-orange-500 text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl text-xs font-bold">
                    31% OFF
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm font-medium mb-1 sm:mb-2">STUDIO</div>
                  <div className="text-orange-400 text-xs sm:text-sm line-through mb-1">$189</div>
                  <div className="text-lg sm:text-2xl font-light text-white mb-2 sm:mb-3">$129<span className="text-xs sm:text-sm text-white/60">/mo</span></div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm12 12V6H4v10h12z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Enterprise Plan - 24% OFF */}
                <div className="bg-white/5 backdrop-blur-xl rounded-lg sm:rounded-2xl p-2 sm:p-4 border border-white/10 text-center relative">
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-orange-500 text-white px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl text-xs font-bold">
                    24% OFF
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm font-medium mb-1 sm:mb-2">ENTERPRISE</div>
                  <div className="text-orange-400 text-xs sm:text-sm line-through mb-1">$249</div>
                  <div className="text-lg sm:text-2xl font-light text-white mb-2 sm:mb-3">$189<span className="text-xs sm:text-sm text-white/60">/mo</span></div>
                  <div className="w-6 h-6 sm:w-8 sm:h-8 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm10-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1h12V5zM4 9v5h12V9H4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Updated Free Starter Kit Box */}
              <div className="bg-gradient-to-r from-orange-600/30 to-red-600/30 backdrop-blur-xl rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-orange-400/30 text-center mb-4 sm:mb-8">
                <h3 className="text-sm sm:text-xl font-semibold text-white mb-1 sm:mb-2">🎁 Your Free Starter Kit</h3>
                <p className="text-xs sm:text-base text-white/90 font-light leading-relaxed">
                  Enjoy a $2,500 Spectra system at no cost — includes Bluetooth scale, stand, and premium onboarding.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-2 sm:gap-4 justify-center">
                <Link
                  to="/ugc-offer"
                  onClick={handleClosePopup}
                  className="px-4 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-sm sm:text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] text-center"
                >
                  Claim Free System
                </Link>
                
                <button
                  onClick={handleClosePopup}
                  className="px-4 py-3 sm:px-8 sm:py-4 bg-white/5 backdrop-blur-3xl border border-white/15 hover:border-white/30 text-white font-semibold text-sm sm:text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02]"
                >
                  Maybe Later
                </button>
              </div>

              {/* Updated Small Print */}
              <p className="text-center text-white/50 text-xs font-light mt-2 sm:mt-4">
                *No card required — free trial begins only after setup is complete.*
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection; 