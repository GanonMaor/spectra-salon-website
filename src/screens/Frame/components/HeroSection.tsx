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

  // Smart UGC popup logic with localStorage and navigation tracking
  useEffect(() => {
    const popupShownKey = 'ugc_popup_shown';
    const popupClosedKey = 'ugc_popup_closed_at';
    const currentPageKey = 'ugc_current_page';
    const leftHomePageKey = 'ugc_left_home_page';
    
    const hasSeenPopup = localStorage.getItem(popupShownKey);
    const lastClosedTime = localStorage.getItem(popupClosedKey);
    const hasLeftHomePage = localStorage.getItem(leftHomePageKey);
    
    // Mark that we're currently on the home page
    localStorage.setItem(currentPageKey, 'home');
    
    let delay = 20000; // Default 20 seconds for first visit
    let shouldShowPopup = true;
    
    if (hasSeenPopup && lastClosedTime) {
      // User has seen popup before and closed it
      if (!hasLeftHomePage) {
        // User is still on the same session, don't show popup again
        shouldShowPopup = false;
      } else {
        // User left home page and came back, show after 40 seconds
        delay = 40000;
        // Reset the flag since we're showing popup again
        localStorage.removeItem(leftHomePageKey);
      }
    }

    if (!shouldShowPopup) {
      return;
    }

    const timer = setTimeout(() => {
      setShowUGCPopup(true);
      localStorage.setItem(popupShownKey, 'true');
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  // Track when user leaves the home page
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentPage = localStorage.getItem('ugc_current_page');
      if (currentPage === 'home') {
        localStorage.setItem('ugc_left_home_page', 'true');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const currentPage = localStorage.getItem('ugc_current_page');
        if (currentPage === 'home') {
          localStorage.setItem('ugc_left_home_page', 'true');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleClosePopup = () => {
    setShowUGCPopup(false);
    // Remember when user closed the popup
    localStorage.setItem('ugc_popup_closed_at', Date.now().toString());
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
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4 overflow-y-auto" onClick={handleClosePopup}>
          <div className="bg-white shadow-2xl w-full max-w-4xl mx-auto relative my-4 max-h-[90vh] overflow-hidden flex" onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-200 transition-all duration-300 z-50 cursor-pointer shadow-lg"
              aria-label="Close popup"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Left Side - Image */}
            <div className="w-1/2 relative">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
            </div>

            {/* Right Side - Content */}
            <div className="w-1/2 p-12 flex flex-col justify-center bg-black text-white">
              
              {/* Main Headline */}
              <div className="mb-8 text-center">
                <div className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 uppercase tracking-wider">
                  🎁 Amazing Opportunity
                </div>
                <h2 className="text-4xl font-light text-white mb-4 leading-tight">
                  Join Our Content
                </h2>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 leading-tight">
                  Creators Plan
                </h3>
                <p className="text-lg text-gray-300 font-light leading-relaxed mb-6">
                  An incredible opportunity to join our content creators program with tons of amazing gifts!
                </p>
                
                {/* Benefits */}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-white/90">Free professional equipment worth $2,000+</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    <span className="text-white/90">Exclusive brand partnerships & collaborations</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-white/90">Monthly surprise gift packages</span>
                  </div>
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                    <span className="text-white/90">VIP access to new products & features</span>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleClosePopup}
                  className="w-full block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg text-center transition-all duration-300 shadow-lg"
                >
                  🚀 I Want to Join & Get Gifts!
                </button>
                
                <button
                  onClick={handleClosePopup}
                  className="w-full px-8 py-4 bg-transparent text-white font-medium text-lg border border-white hover:bg-white hover:text-black transition-all duration-300"
                >
                  Tell Me More
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection; 