import React from "react";
import { Navigation } from "../../components/Navigation";
import { DevTerminal } from "../../components/DevTerminal";
// Chat/WhatsApp floating widgets removed
import { HeroSection } from "./components/HeroSection";
import { VideoSection } from "./components/VideoSection";
import { StepsSection } from "./components/StepsSection";

export const Frame = (): JSX.Element => {
  return (
    <div className="bg-white w-full min-h-screen font-sans antialiased overflow-x-hidden">
      <Navigation />

      {/* Hero Section with client carousel */}
      <HeroSection />

      {/* Video Section - YouTube Demo */}
      <VideoSection />

      {/* Steps Section - 5 steps after video */}
      <StepsSection />

      {/* Dev Terminal - development mode only */}
      {import.meta.env.DEV && <DevTerminal />}

      {/* Floating widgets removed – simple links remain in content/footer */}
    </div>
  );
};
