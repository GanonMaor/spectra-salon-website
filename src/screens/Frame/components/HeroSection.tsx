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
      <section className="relative pt-20 pb-8 sm:pt-24 sm:pb-12 lg:pt-32 lg:pb-16 overflow-hidden min-h-[90vh] sm:min-h-screen">
        {/* Background - Using new gradient class */}
        <div className="absolute inset-0 gradient-bg-hero" />

        {/* Subtle luxury pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c79c6d' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='0.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center">
            {/* Trust Badge - responsive mobile design */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-spectra-gold-light to-spectra-gold rounded-full shadow-sm"></div>
              <span className="text-spectra-gold-dark text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-90 px-2 text-center">
                Trusted by 1,500+ Hair Professionals
              </span>
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-spectra-gold to-spectra-gold-dark rounded-full shadow-sm"></div>
            </div>

            {/* Main Headline */}
            <div className="mb-10 sm:mb-14 lg:mb-20">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight text-spectra-charcoal mb-4 sm:mb-5 lg:mb-7 leading-[0.9] tracking-[-0.02em]">
                Stop Losing
              </h1>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extralight text-spectra-charcoal mb-4 sm:mb-5 lg:mb-7 leading-[0.9] tracking-[-0.02em]">
                Money on
              </h1>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-light text-transparent bg-clip-text bg-gradient-to-r from-spectra-gold-light via-spectra-gold to-spectra-gold-dark leading-[0.9] tracking-[-0.02em]">
                Wasted Hair Color
              </h1>
            </div>

            {/* Value Proposition */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-spectra-charcoal-light mb-12 sm:mb-16 lg:mb-20 leading-[1.3] sm:leading-[1.2] font-light max-w-xs sm:max-w-2xl lg:max-w-4xl mx-auto tracking-[-0.01em] px-4 sm:px-6 lg:px-0">
              Salons waste{" "}
              <span className="font-semibold text-spectra-gold-dark">
                35% of their color
              </span>{" "}
              down the sink. Spectra&apos;s AI-powered platform saves up to{" "}
              <span className="font-semibold text-spectra-gold-dark">
                90% of that waste
              </span>
              .
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-16 sm:mb-20 lg:mb-24 px-4 sm:px-6">
              <Link
                to="/signup?trial=true"
                className="inline-block px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-center min-w-fit"
                onClick={() =>
                  trackCTAClick("Start Free Trial", "Hero Section")
                }
              >
                Start Free Trial
              </Link>

              <button
                className="group flex items-center gap-3 sm:gap-4 text-spectra-charcoal-light hover:text-spectra-gold font-medium text-base sm:text-lg transition-all duration-300 px-4 sm:px-8 py-3 sm:py-4 justify-center min-w-fit"
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
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-spectra-cream-dark to-spectra-cream group-hover:from-spectra-gold/10 group-hover:to-spectra-gold-light/10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md border border-spectra-gold/10 group-hover:border-spectra-gold/20 flex-shrink-0">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 sm:ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M8 5v10l8-5-8-5z" />
                  </svg>
                </div>
                <div className="text-left">
                  <div className="font-semibold">Watch Demo</div>
                  <div className="text-sm text-spectra-gold-dark">
                    2 minutes
                  </div>
                </div>
              </button>
            </div>

            {/* Transition Text - mobile friendly */}
            <div className="mb-6 sm:mb-8">
              <p className="text-base sm:text-lg text-spectra-charcoal-light font-light px-4 sm:px-0">
                Don't just take our word for it...
              </p>
            </div>

            {/* Client Carousel - mobile friendly */}
            <div className="mb-8 sm:mb-12 w-full">
              <Suspense fallback={<LoadingSpinner />}>
                <ClientCarousel />
              </Suspense>
            </div>

            {/* Trust Indicators - mobile friendly */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-4 sm:px-0">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-spectra-gold drop-shadow-sm"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-spectra-charcoal-light text-sm sm:text-base font-medium text-center">
                4.9 from 650+ reviews
              </span>
            </div>

            {/* Smooth Transition to Next Section */}
            <div className="text-center w-full">
              <p className="text-base sm:text-lg text-spectra-charcoal-light font-light mb-4 sm:mb-6">
                Ready to see it in action?
              </p>
              <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-spectra-gold/50 to-transparent mx-auto"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Starter Offer Popup (Premium, High-Conversion) */}
      {showUGCPopup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-3 py-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-8 flex flex-col border border-gray-200">
            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
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
            <div className="mb-6 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                Start Using<br />Spectra CI Today
              </h2>
              <p className="text-gray-700 text-base font-medium">
                Everything you need to get started — hardware, setup, and full access.
              </p>
            </div>

            {/* Pricing Section */}
            <div className="mb-6 text-center bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="mb-2">
                <span className="text-gray-200 text-lg line-through">$399</span>
              </div>
              <div className="text-5xl font-bold mb-2">
                $99
              </div>
              <div className="text-blue-100 text-sm font-medium">
                One-Time Starter Payment
              </div>
              <div className="mt-3 text-xs text-blue-100 bg-white/10 rounded-full px-4 py-1.5 inline-block">
                No subscription charged today
              </div>
            </div>

            {/* Included Benefits */}
            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-900 text-sm font-semibold">
                  SmartScale + Premium Stand
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3.5 h-3.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-900 text-sm font-semibold">
                  Personal 1-on-1 setup (45 min)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-900 text-sm font-semibold">
                  Priority customer support
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-900 text-sm font-semibold">
                  50 mixes included — free
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-3.5 h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-gray-900 text-sm font-semibold">
                  Full access to all features for 30 days
                </span>
              </div>
            </div>

            {/* Trust & Risk Reversal */}
            <div className="mb-6 text-center">
              <p className="text-xs text-gray-700 leading-relaxed font-medium">
                No risk. No commitment. Cancel anytime during the trial.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
              <button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-base"
                onClick={() => {
                  navigate("/signup?trial=true&starter=99");
                  handleClosePopup();
                }}
              >
                Start for $99
              </button>
              <button 
                className="w-full border-2 border-gray-300 hover:border-blue-400 text-gray-700 hover:text-blue-600 font-semibold py-4 rounded-xl bg-white hover:bg-blue-50 transition-all duration-300"
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
