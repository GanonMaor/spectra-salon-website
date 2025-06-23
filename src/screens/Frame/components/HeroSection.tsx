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

            {/* CTA Buttons - ללא אייקון וואטסאפ */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 lg:mb-20 px-4 sm:px-0">
              <Link to="/lead-capture" className="btn-apple group relative">
                <span className="relative z-10">Start Free Trial</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <button className="group flex items-center gap-3 sm:gap-4 text-spectra-charcoal-light hover:text-spectra-gold font-medium text-base sm:text-lg transition-all duration-300 px-4 sm:px-8 py-3 sm:py-4 justify-center">
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
        <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4">
          <div className="bg-white/15 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl max-w-4xl mx-auto relative overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 text-white hover:bg-white/30 transition-all duration-300 z-10"
            >
              ×
            </button>

            {/* Dark Salon Background */}
            <div 
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9)),
                  url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')
                `,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />

            <div className="relative z-10 p-8 md:p-12">
              
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-3xl rounded-full px-6 py-3 mb-6 border border-white/20">
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white/90 text-sm font-semibold uppercase tracking-[0.3em]">Special UGC Offer</span>
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-500 rounded-full animate-pulse"></div>
                </div>
                
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extralight text-white mb-4 leading-[0.9] tracking-[-0.02em]">
                  Free Spectra
                </h2>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 leading-[0.9] tracking-[-0.02em] drop-shadow-2xl mb-6">
                  UGC Program
                </h2>
                
                <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-light">
                  Get your complete $2,500 Spectra system absolutely free for sharing your authentic salon experience
                </p>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                
                {/* Solo Plan */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 text-center relative">
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-xl text-xs font-medium">
                    50% OFF
                  </div>
                  <div className="mb-3">
                    <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">Solo</p>
                    <div className="space-y-1">
                      <p className="text-orange-400 text-lg line-through font-light">$79</p>
                      <p className="text-2xl font-extralight text-white">$39<span className="text-sm">/mo</span></p>
                    </div>
                  </div>
                  <div className="w-6 h-6 mx-auto bg-orange-500/30 rounded-lg flex items-center justify-center">
                    <span className="text-orange-300 text-sm">⚖️</span>
                  </div>
                </div>

                {/* Multi Plan */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 text-center relative">
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-xl text-xs font-medium">
                    38% OFF
                  </div>
                  <div className="mb-3">
                    <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">Multi</p>
                    <div className="space-y-1">
                      <p className="text-orange-400 text-lg line-through font-light">$129</p>
                      <p className="text-2xl font-extralight text-white">$79<span className="text-sm">/mo</span></p>
                    </div>
                  </div>
                  <div className="w-6 h-6 mx-auto bg-orange-500/30 rounded-lg flex items-center justify-center">
                    <span className="text-orange-300 text-sm">👥</span>
                  </div>
                </div>

                {/* Studio Plan */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 text-center relative">
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-xl text-xs font-medium">
                    31% OFF
                  </div>
                  <div className="mb-3">
                    <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">Studio</p>
                    <div className="space-y-1">
                      <p className="text-orange-400 text-lg line-through font-light">$189</p>
                      <p className="text-2xl font-extralight text-white">$129<span className="text-sm">/mo</span></p>
                    </div>
                  </div>
                  <div className="w-6 h-6 mx-auto bg-orange-500/30 rounded-lg flex items-center justify-center">
                    <span className="text-orange-300 text-sm">🏢</span>
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 text-center relative">
                  <div className="absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-xl text-xs font-medium">
                    24% OFF
                  </div>
                  <div className="mb-3">
                    <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">Enterprise</p>
                    <div className="space-y-1">
                      <p className="text-orange-400 text-lg line-through font-light">$249</p>
                      <p className="text-2xl font-extralight text-white">$189<span className="text-sm">/mo</span></p>
                    </div>
                  </div>
                  <div className="w-6 h-6 mx-auto bg-orange-500/30 rounded-lg flex items-center justify-center">
                    <span className="text-orange-300 text-sm">🚀</span>
                  </div>
                </div>
              </div>

              {/* Special Offer Highlight */}
              <div className="text-center mb-8">
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-400/30">
                  <h3 className="text-2xl font-light text-white mb-2">UGC Special Offer</h3>
                  <p className="text-4xl font-extralight text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 mb-2">
                    FREE
                  </p>
                  <p className="text-white/70 text-sm">Complete system worth $2,500 for UGC participants</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/ugc-offer"
                  onClick={handleClosePopup}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02] text-center"
                >
                  Claim Free System
                </Link>
                
                <button
                  onClick={handleClosePopup}
                  className="px-8 py-4 bg-white/5 backdrop-blur-3xl border border-white/15 hover:border-white/30 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-2xl hover:shadow-3xl transform hover:scale-[1.02]"
                >
                  Maybe Later
                </button>
              </div>

              <p className="text-center text-white/50 text-xs font-light mt-4">
                Limited to first 300 salons in USA • No payment required
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection; 