import React from "react";
import { Navigation } from "../../components/Navigation";
import { HeroSection } from "./components/HeroSection";
import { HighlightsSection } from "./components/HighlightsSection";
import { VideoSection } from "./components/VideoSection";
import { InvisibleLossSection } from "./components/InvisibleLossSection";
import { StepsSection } from "./components/StepsSection";
import { ProCapabilitiesSection } from "./components/ProCapabilitiesSection";
import { SmartColorTrackingSection } from "./components/SmartColorTrackingSection";
import { ContactSection } from "../../components/ContactSection";
import { ContactForm } from "../../components/ContactForm/ContactForm";
import { BACKGROUND_IMAGES } from "../../constants/backgroundImages";
import { SiteThemeProvider, useSiteColors } from "../../contexts/SiteTheme";

const FrameInner = (): JSX.Element => {
  const c = useSiteColors();
  return (
    <div className="w-full min-h-screen font-sans antialiased overflow-x-hidden" style={{ background: c.bg.page }}>
      <Navigation />
      <HeroSection />
      <VideoSection />
      <InvisibleLossSection />
      <HighlightsSection />
      <StepsSection />
      <ProCapabilitiesSection />
      <SmartColorTrackingSection />
      <ContactSection
        backgroundImage={BACKGROUND_IMAGES.yourCustomSalon}
        title="Ready to"
        subtitle="Transform?"
        description="Join thousands of salon professionals who've revolutionized their business with Spectra."
      />
      <ContactForm />
    </div>
  );
};

export const Frame = (): JSX.Element => (
  <SiteThemeProvider>
    <FrameInner />
  </SiteThemeProvider>
);
