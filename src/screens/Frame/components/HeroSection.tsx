import React, { Suspense, lazy, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { useGTM } from "../../../hooks/useGTM";

// Lazy Loading for client carousel
const ClientCarousel = lazy(() =>
  import("../../../components/ClientCarousel").then((module) => ({
    default: module.ClientCarousel,
  })),
);

export const HeroSection: React.FC = () => {
  const [showUGCPopup, setShowUGCPopup] = useState(false);
  const navigate = useNavigate();
  const { trackCTAClick, trackPageView } = useGTM();

  // Smart UGC popup logic with localStorage and navigation tracking
  useEffect(() => {
    const popupShownKey = "ugc_popup_shown";
    const popupClosedKey = "ugc_popup_closed_at";
    const currentPageKey = "ugc_current_page";
    const leftHomePageKey = "ugc_left_home_page";

    const hasSeenPopup = localStorage.getItem(popupShownKey);
    const lastClosedTime = localStorage.getItem(popupClosedKey);
    const hasLeftHomePage = localStorage.getItem(leftHomePageKey);

    // Mark that we're currently on the home page
    localStorage.setItem(currentPageKey, "home");

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
      localStorage.setItem(popupShownKey, "true");
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  // Track when user leaves the home page
  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentPage = localStorage.getItem("ugc_current_page");
      if (currentPage === "home") {
        localStorage.setItem("ugc_left_home_page", "true");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const currentPage = localStorage.getItem("ugc_current_page");
        if (currentPage === "home") {
          localStorage.setItem("ugc_left_home_page", "true");
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleClosePopup = () => {
    setShowUGCPopup(false);
    // Remember when user closed the popup
    localStorage.setItem("ugc_popup_closed_at", Date.now().toString());
  };

  return (
    <>
      <section className="relative pt-[calc(56px+env(safe-area-inset-top)+1rem)] pb-12 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-24 overflow-hidden min-h-[88dvh] flex items-start">
        {/* Background Image - Same as Investors page */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat lg:bg-fixed"
          style={{
            backgroundImage: `
              linear-gradient(to bottom, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.80) 50%, rgba(0, 0, 0, 0.90) 100%),
              url('/wow222.jpg')
            `,
          }}
        />
        
        {/* Subtle glow overlays */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#EAB776]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#B18059]/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center">
            {/* Trust Badge - Subtle */}
            <div className="inline-flex items-center gap-2 mb-10 sm:mb-12 lg:mb-14">
              <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
              <span className="text-white/40 text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em]">
                Built for Hair Colorists
              </span>
            </div>

            {/* Main Headline - Apple Pro Dark Style */}
            <div className="mb-10 sm:mb-12 lg:mb-16">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight text-white mb-4 sm:mb-6 lg:mb-8 leading-[0.95] tracking-[-0.03em]">
                Spectra-CI.
              </h1>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] leading-[1.1] tracking-[-0.02em]">
                Salon Cost Optimization for Pros.
              </h1>
            </div>

            {/* Value Proposition - Dark style */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/60 mb-16 sm:mb-20 lg:mb-24 leading-[1.7] font-light max-w-sm sm:max-w-2xl lg:max-w-3xl mx-auto tracking-[-0.01em] px-4 sm:px-6 lg:px-0">
              Stop losing money on wasted hair color. Salons waste 35% of their color down the sink.{" "}
              <span className="font-medium text-white">
                Spectra's AI-powered platform saves up to 90% of that waste.
              </span>
            </p>

            {/* CTA Buttons - Dark style */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center px-2 sm:px-6">
              <Link
                to="/signup?trial=true"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#EAB776] to-[#B18059] hover:from-[#B18059] hover:to-[#EAB776] text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                onClick={() =>
                  trackCTAClick("Start Free Trial", "Hero Section")
                }
              >
                Start Free Trial
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <button
                className="group flex items-center gap-3 sm:gap-4 text-white/70 hover:text-white font-medium text-base sm:text-lg transition-all duration-300 px-4 sm:px-8 py-3 sm:py-4 justify-center min-w-fit"
                onClick={() => {
                  trackCTAClick("Watch Demo", "Hero Section");
                  sessionStorage.setItem("playVideo", "true");
                  const videoSection = document.getElementById("video-demo");
                  if (videoSection) {
                    videoSection.scrollIntoView({ behavior: "smooth", block: "center" });
                  } else {
                    window.location.hash = "#video-demo";
                  }
                }}
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 group-hover:bg-white/15 rounded-full flex items-center justify-center transition-all duration-300 border border-white/20 group-hover:border-white/30 flex-shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 sm:ml-1 text-[#D4A06A]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 5v10l8-5-8-5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Watch Demo</div>
                  <div className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">
                    2 minutes
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Client Carousel Section - Separate with solid black background */}
      <section className="py-16 sm:py-20 bg-black border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 text-center">
          {/* Section Header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
              <span className="text-white/40 text-xs font-medium uppercase tracking-[0.15em]">
                Our Community
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight text-white mb-4">
              Trusted by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E0A263] to-[#CF915B]">
                Professionals
              </span>
            </h2>
            <p className="text-white/40 text-base sm:text-lg font-light max-w-xl mx-auto">
              Join hundreds of salons already saving with Spectra
            </p>
          </div>
          <Suspense fallback={<LoadingSpinner />}>
            <ClientCarousel />
          </Suspense>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-10 sm:mt-12 mb-8 px-4 sm:px-0">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#D4A06A] drop-shadow-sm"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-white/50 text-sm sm:text-base font-medium text-center">
              4.9 from 650+ reviews
            </span>
          </div>

          {/* Scroll hint */}
          <div className="text-center w-full">
            <p className="text-base sm:text-lg text-white/40 font-light mb-4 sm:mb-6">
              See how it works
            </p>
            <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-[#EAB776]/60 to-transparent mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Starter Offer Popup (Premium Dark Glass Style) */}
      {showUGCPopup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-md px-3 py-4">
          <div className="relative w-full max-w-md bg-black/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col border border-white/10">
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#EAB776]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#B18059]/20 rounded-full blur-3xl pointer-events-none" />
            
            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Header */}
            <div className="relative mb-6 text-center">
              <h2 className="text-3xl sm:text-4xl font-extralight text-white mb-3 leading-tight tracking-tight">
                Start Using<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">
                  Spectra CI Today
                </span>
              </h2>
              <p className="text-white/50 text-base font-light">
                Everything you need to get started
              </p>
            </div>

            {/* Pricing Section */}
            <div className="relative mb-6 text-center bg-gradient-to-br from-[#EAB776]/20 to-[#B18059]/10 backdrop-blur-sm rounded-2xl p-6 border border-[#EAB776]/20">
              <div className="mb-2">
                <span className="text-white/40 text-lg line-through">$399</span>
              </div>
              <div className="text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] mb-2">
                $99
              </div>
              <div className="text-white/60 text-sm font-light">
                One-Time Starter Payment
              </div>
              <div className="mt-3 text-xs text-white/50 bg-white/5 rounded-full px-4 py-1.5 inline-block border border-white/10">
                No subscription charged today
              </div>
            </div>

            {/* Included Benefits */}
            <div className="relative space-y-3 mb-6">
              {[
                "SmartScale + Premium Stand",
                "Personal 1-on-1 setup (45 min)",
                "Priority customer support",
                "50 mixes included — free",
                "Full access to all features for 30 days"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#EAB776]/20 to-[#B18059]/10 rounded-full flex items-center justify-center mt-0.5 border border-[#EAB776]/30">
                    <svg className="w-3.5 h-3.5 text-[#EAB776]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white/80 text-sm font-light">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* Trust & Risk Reversal */}
            <div className="mb-6 text-center">
              <p className="text-xs text-white/40 leading-relaxed font-light">
                No risk. No commitment. Cancel anytime during the trial.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="relative space-y-3">
              <button
                className="w-full bg-gradient-to-r from-[#EAB776] to-[#B18059] hover:from-[#B18059] hover:to-[#EAB776] text-white font-semibold py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-base"
                onClick={() => {
                  navigate("/signup?trial=true&starter=99");
                  handleClosePopup();
                }}
              >
                Start for $99
              </button>
              <button 
                className="w-full border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-medium py-4 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                onClick={() => {
                  const videoSection = document.getElementById("video-demo");
                  if (videoSection) {
                    videoSection.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                  handleClosePopup();
                }}
              >
                See how it works
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeroSection;
