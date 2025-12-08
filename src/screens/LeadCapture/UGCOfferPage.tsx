import React, { useState, useCallback, memo, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ClientCarousel } from "../../components/ClientCarousel";
import { Footer } from "../../components/Footer";
import { ContactSection } from "../../components/ContactSection";
import { BACKGROUND_IMAGES } from "../../constants/backgroundImages";
import { LeadForm } from "../../components/LeadForm";
import InAppOpenBanner from "../../components/InAppOpenBanner";
import StickyOfferBar from "../../components/StickyOfferBar";
import { Hero } from "./sections/Hero";
import { Offer } from "./sections/Offer";
import { ReviewsAndContact } from "./sections/ReviewsAndContact";
import { useClientEnv } from "../../hooks/useClientEnv";
import { holdOffer, isOfferHeld } from "../../utils/offerHold";
import { track } from "../../utils/track";

// Memoize static components for better performance
const MemoizedClientCarousel = memo(ClientCarousel);
const MemoizedFooter = memo(Footer);

export const UGCOfferPage: React.FC = () => {
  const navigate = useNavigate();
    const [leadSaved, setLeadSaved] = useState(false);
  const { isIG } = useClientEnv();

  // Use useCallback to prevent unnecessary re-renders
  const handleStartTrial = useCallback(() => {
    navigate("/signup?trial=true");
  }, [navigate]);

  const handleWhatsApp = useCallback(() => {
    window.open("https://wa.me/972504322680", "_blank");
  }, []);

  const handleInstagram = useCallback(() => {
    window.open("https://instagram.com/spectra_salon", "_blank");
  }, []);

  // Handle offer click - scroll to lead form
  const handleOfferClick = useCallback(() => {
    track("cta_click", { location: "sticky", page: "ugc_offer" });
    const leadFormSection = document.querySelector("#lead-form-section");
    if (leadFormSection) {
      leadFormSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Handle exit modal confirmation
  const handleExitConfirm = useCallback(async (payload: { name: string; phoneOrEmail: string }) => {
    try {
      track("exit_modal_convert", { page: "ugc_offer" });
      
      // Submit to standard leads endpoint
      const isEmail = /@/.test(payload.phoneOrEmail);
      const response = await fetch("/.netlify/functions/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: payload.name,
          email: isEmail ? payload.phoneOrEmail : undefined,
          phone: !isEmail ? payload.phoneOrEmail : undefined,
          source_page: "exit_modal_ugc",
          utm_source: "ugc_offer",
          utm_medium: "exit_modal",
          utm_campaign: "triple_bundle"
        }),
      });

      if (response.ok) {
        holdOffer(15); // Hold offer for 15 minutes
        setLeadSaved(true);
        
        
        // Scroll to lead form after a short delay
        setTimeout(() => {
          const leadFormSection = document.querySelector("#lead-form-section");
          if (leadFormSection) {
            leadFormSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error submitting exit lead:", error);
    }
  }, []);

  // Scroll to top when accessing page directly
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Track page view with source
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get("ref") || "direct";
    const source = isIG ? "instagram" : "web";
    track("page_view", { ref, page: "ugc_offer", source });
    
    // Check if offer is held
    if (isOfferHeld()) {
      setTimeout(() => {
        const leadFormSection = document.querySelector("#lead-form-section");
        if (leadFormSection) {
          leadFormSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 1000);
    }
  }, [isIG]);

  // Show floating buttons after scroll
  useEffect(() => {
    const handleScroll = () => {
      const floatingCta = document.getElementById("floating-cta");
      const heroSection = document.querySelector("section"); // First section (hero)

      if (floatingCta && heroSection) {
        const heroHeight = heroSection.offsetHeight;
        const scrollPosition = window.scrollY;

        // Show with smooth reveal after passing hero section
        if (scrollPosition > heroHeight * 0.9) {
          floatingCta.style.transform = "translateX(-50%) translateY(0)";
          floatingCta.style.opacity = "1";
        } else {
          floatingCta.style.transform = "translateX(-50%) translateY(120%)";
          floatingCta.style.opacity = "0";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* 1. Hero Section */}
      <Hero onStartTrial={handleStartTrial} />

      {/* 2. Offer Section */}
      <Offer onStartTrial={handleStartTrial} />

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
              Your salon's potential savings with{" "}
              <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-red-500 bg-clip-text text-transparent font-medium">
                Spectra
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              See the real impact on your bottom line and discover how much you
              could save
            </p>
          </div>

          {/* Savings Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  $8,500
                </h3>
                <p className="text-gray-600 mb-4">Average annual savings</p>
                <div className="text-sm text-gray-500">
                  <p>• Save up to 90% of wasted color (~30% of product costs)</p>
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  3.5 hours
                </h3>
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
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c79c6d' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='0.8'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Header Text */}
          <div className="text-center mb-12">
            <p className="text-xl text-spectra-gold-dark mb-4 font-medium">
              Ask yourself…
            </p>
            <h2 className="text-4xl sm:text-5xl font-light text-spectra-charcoal leading-tight">
              Are you still dreaming of being the{" "}
              <span className="bg-gradient-to-r from-spectra-gold-light via-spectra-gold to-spectra-gold-dark bg-clip-text text-transparent font-medium">
                best salon owner
              </span>{" "}
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
                  target.src =
                    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80";
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

      {/* 3. Reviews Section */}
      <ReviewsAndContact />

      {/* Contact Section - Identical to Home Page with shared background */}
      <ContactSection backgroundImage="/dream-salon2.jpg" />

      {/* Footer */}
      <MemoizedFooter />
      
      {/* Enhanced UX layer */}
      <InAppOpenBanner />
      <StickyOfferBar 
        label="$39 Solo Plan - Creators Special !" 
        cta="Get Started Now" 
        onClick={handleOfferClick} 
      />
    </div>
  );
};
