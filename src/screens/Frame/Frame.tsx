import React from "react";
import { Navigation } from "../../components/Navigation";
import { DevTerminal } from "../../components/DevTerminal";
import { ChatWidget } from "../../components/ChatWidget";
import { WhatsAppWidget } from "../../components/WhatsAppWidget";
import { WhatsAppAdvanced } from "../../components/WhatsAppAdvanced";
import { HeroSection } from "./components/HeroSection";
import { StepsSection } from "./components/StepsSection";

export const Frame = (): JSX.Element => {
  return (
    <div className="bg-white w-full min-h-screen font-sans antialiased overflow-x-hidden">
      <Navigation />

      {/* Hero Section with client carousel */}
      <HeroSection />

      {/* Steps Section - 5 steps after video */}
      <StepsSection />

      {/* Dev Terminal - development mode only */}
      {import.meta.env.DEV && <DevTerminal />}

      {/* Chat Widget - always visible */}
      <ChatWidget />

      {/* WhatsApp Advanced Widget - always visible */}
      <WhatsAppAdvanced
        phoneNumber="972504322680" // Maor's WhatsApp business number
      />
    </div>
  );
};
