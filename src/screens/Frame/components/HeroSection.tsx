import React, { Suspense, lazy, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../../components/LoadingSpinner";
import { useGTM } from "../../../hooks/useGTM";
import { useSiteColors } from "../../../contexts/SiteTheme";
import { HeroChat } from "./HeroChat";

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
  const c = useSiteColors();

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
            backgroundImage: `${c.hero.overlay}, url('/wow222.jpg')`,
          }}
        />
        
        {/* Subtle glow overlays */}
        <div className="absolute inset-0 pointer-events-none z-[1]">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl" style={{ background: c.hero.glowA }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-3xl" style={{ background: c.hero.glowB }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-8 lg:px-16">
          <div className="text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2 mb-10 sm:mb-12 lg:mb-14">
              <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
              <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em]" style={{ color: c.hero.textDimmed }}>
                Built for Hair Colorists
              </span>
            </div>

            {/* Main Headline */}
            <div className="mb-10 sm:mb-12 lg:mb-16">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-extralight mb-4 sm:mb-6 lg:mb-8 leading-[0.95] tracking-[-0.03em]" style={{ color: c.hero.textPrimary }}>
                Spectra-CI.
              </h1>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] leading-[1.1] tracking-[-0.02em]">
                Salon Cost Optimization for Pros.
              </h1>
            </div>

            {/* Value Proposition */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-8 sm:mb-10 lg:mb-12 leading-[1.7] font-light max-w-sm sm:max-w-2xl lg:max-w-3xl mx-auto tracking-[-0.01em] px-4 sm:px-6 lg:px-0" style={{ color: c.hero.textMuted }}>
              Stop losing money on wasted hair color. Salons waste 35% of their color down the sink.{" "}
              <span className="font-medium" style={{ color: c.hero.textHighlight }}>
                Spectra's AI-powered platform saves up to 90% of that waste.
              </span>
            </p>

            {/* AI Chat Widget */}
            <div className="w-full px-0 sm:px-4 mt-6 sm:mt-10">
              <p className="text-sm sm:text-base font-light mb-4 tracking-wide" style={{ color: c.hero.textMuted, opacity: 0.7 }}>
                Ask how Spectra can save your salon money
              </p>
              <HeroChat />
            </div>
          </div>
        </div>
      </section>

      {/* Client Carousel Section - Separate with solid black background */}
      <section className="py-16 sm:py-20 border-t" style={{ background: c.hero.carouselBg, borderColor: c.hero.carouselBorder }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 lg:px-16 text-center">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-1.5 h-1.5 bg-[#EAB776]/60 rounded-full" />
              <span className="text-xs font-medium uppercase tracking-[0.15em]" style={{ color: c.hero.textDimmed }}>
                Our Community
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extralight mb-4" style={{ color: c.hero.textPrimary }}>
              Trusted by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E0A263] to-[#CF915B]">
                Professionals
              </span>
            </h2>
            <p className="text-base sm:text-lg font-light max-w-xl mx-auto" style={{ color: c.hero.textDimmed }}>
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
            <span className="text-sm sm:text-base font-medium text-center" style={{ color: c.hero.textMuted }}>
              4.9 from 650+ reviews
            </span>
          </div>

          {/* Scroll hint */}
          <div className="text-center w-full">
            <p className="text-base sm:text-lg font-light mb-4 sm:mb-6" style={{ color: c.hero.textDimmed }}>
              See how it works
            </p>
            <div className="w-px h-8 sm:h-12 bg-gradient-to-b from-[#EAB776]/60 to-transparent mx-auto animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Starter Offer Popup (Always Light Mode) */}
      {showUGCPopup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-6 sm:px-6">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl px-6 py-8 sm:px-10 sm:py-10 flex flex-col border border-black/[0.06] overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#EAB776]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#B18059]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={handleClosePopup}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center text-black/50 hover:text-black/70 hover:bg-black/5 rounded-full transition-all"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className="relative mb-7 text-center">
              <h2 className="text-2xl sm:text-3xl font-extralight text-[#1A1A1A] mb-2 leading-tight tracking-tight">
                Start Using<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">
                  Spectra CI Today
                </span>
              </h2>
              <p className="text-[#999] text-sm sm:text-base font-light">
                Everything you need to get started
              </p>
            </div>

            {/* Pricing Section */}
            <div className="relative mb-7 text-center bg-gradient-to-br from-[#EAB776]/10 to-[#B18059]/5 rounded-2xl px-6 py-5 sm:py-6 border border-[#EAB776]/15">
              <div className="mb-1">
                <span className="text-[#BBB] text-base line-through">$399</span>
              </div>
              <div className="text-4xl sm:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059] mb-1">
                $99
              </div>
              <div className="text-[#777] text-sm font-light">
                One-Time Starter Payment
              </div>
              <div className="mt-3 text-xs text-[#999] bg-black/[0.03] rounded-full px-4 py-1.5 inline-block border border-black/[0.06]">
                No subscription charged today
              </div>
            </div>

            {/* Included Benefits */}
            <div className="relative space-y-3 mb-7">
              {[
                "SmartScale + Premium Stand",
                "Personal 1-on-1 setup (45 min)",
                "Priority customer support",
                "50 mixes included — free",
                "Full access to all features for 30 days"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-[#EAB776]/15 to-[#B18059]/10 rounded-full flex items-center justify-center mt-0.5 border border-[#EAB776]/25">
                    <svg className="w-3.5 h-3.5 text-[#D4A06A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[#444] text-sm font-light">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* Trust */}
            <div className="mb-6 text-center">
              <p className="text-xs text-[#BBB] leading-relaxed font-light">
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
                className="w-full border border-black/10 hover:border-black/20 text-[#555] hover:text-[#1A1A1A] font-medium py-4 rounded-full bg-black/[0.02] hover:bg-black/[0.04] transition-all duration-300"
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
