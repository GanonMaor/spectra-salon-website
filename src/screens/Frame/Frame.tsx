import React from "react";
import { Navigation } from "../../components/Navigation";
import { DevTerminal } from "../../components/DevTerminal";
import { HeroSection } from "./components/HeroSection";
import { StepsSection } from "./components/StepsSection";

export const Frame = (): JSX.Element => {
  return (
    <div className="bg-white w-full min-h-screen font-sans antialiased">
      <Navigation />

      {/* Hero Section - עם קרוסלת הלקוחות */}
      <HeroSection />

      {/* Steps Section - 5 צעדים אחרי הווידאו */}
      <StepsSection />

      {/* Dev Terminal - רק במצב פיתוח */}
      {import.meta.env.DEV && <DevTerminal />}
    </div>
  );
};