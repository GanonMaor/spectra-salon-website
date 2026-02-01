import React from "react";
import { Navigation } from "../../components/Navigation";
// Chat/WhatsApp floating widgets removed
import { HeroSection } from "./components/HeroSection";
import { HighlightsSection } from "./components/HighlightsSection";
import { VideoSection } from "./components/VideoSection";
import { StepsSection } from "./components/StepsSection";
import { ProCapabilitiesSection } from "./components/ProCapabilitiesSection";
import { SmartColorTrackingSection } from "./components/SmartColorTrackingSection";
import { ContactSection } from "../../components/ContactSection";
import { ContactForm } from "../../components/ContactForm/ContactForm";
import { BACKGROUND_IMAGES } from "../../constants/backgroundImages";

export const Frame = (): JSX.Element => {
  return (
    <div className="bg-black w-full min-h-screen font-sans antialiased overflow-x-hidden">
      <Navigation />

      {/* Hero Section - Apple Pro dark style */}
      <HeroSection />

      {/* Video Section - YouTube Demo */}
      <VideoSection />

      {/* Highlights Strip - 4 key features */}
      <HighlightsSection />

      {/* How It Works - 5 steps workflow */}
      <StepsSection />

      {/* Pro Capabilities - Feature blocks */}
      <ProCapabilitiesSection />

      {/* Why Spectra-CI + The Bottom Line */}
      <SmartColorTrackingSection />

      {/* Contact Section - Final CTA */}
      <ContactSection
        backgroundImage={BACKGROUND_IMAGES.yourCustomSalon}
        title="Ready to"
        subtitle="Transform?"
        description="Join thousands of salon professionals who've revolutionized their business with Spectra."
      />

      {/* Contact Form - Floating button in bottom right */}
      <ContactForm />
    </div>
  );
};
