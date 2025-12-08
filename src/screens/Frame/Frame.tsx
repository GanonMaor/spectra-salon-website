import React from "react";
import { Navigation } from "../../components/Navigation";
import { DevTerminal } from "../../components/DevTerminal";
// Chat/WhatsApp floating widgets removed
import { HeroSection } from "./components/HeroSection";
import { SmartColorTrackingSection } from "./components/SmartColorTrackingSection";
import { VideoSection } from "./components/VideoSection";
import { ContactSection } from "../../components/ContactSection";
import { BACKGROUND_IMAGES } from "../../constants/backgroundImages";

export const Frame = (): JSX.Element => {
  return (
    <div className="bg-white w-full min-h-screen font-sans antialiased overflow-x-hidden">
      <Navigation />

      {/* Hero Section with client carousel */}
      <HeroSection />

      {/* Smart Color Intelligence Section */}
      <SmartColorTrackingSection />

      {/* Video Section */}
      <VideoSection />

      {/* Contact Section */}
      <ContactSection
        backgroundImage={BACKGROUND_IMAGES.yourCustomSalon}
        title="Ready to"
        subtitle="Transform?"
        description="Join thousands of salon professionals who've revolutionized their business with Spectra."
      />

      {/* Dev Terminal - development mode only */}
      {import.meta.env.DEV && <DevTerminal />}

      {/* Floating widgets removed – simple links remain in content/footer */}
    </div>
  );
};
