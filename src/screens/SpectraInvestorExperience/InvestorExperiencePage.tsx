import React, { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { INV } from "./tokens";
import { ProgressRail } from "./primitives";
import {
  HeroSection,
  ColorBarOriginSection,
  SpectraTodaySection,
  CustomerValidationSection,
  WhatWeLearnedSection,
  WhyUsSection,
  WhyNowSection,
  SalonOSSection,
  UnexpectedAssetSection,
  OpportunitySection,
  EconomicsImproveSection,
  SalonAIRevealSection,
  SalonNetworkSection,
  BeyondSoftwareSection,
  IndustryIntelligenceSection,
  FutureMarketExpansionSection,
  FlywheelSection,
  FinalVisionSection,
} from "./sections";
import { META, CHROME } from "./copy";

/**
 * Chapter labels used by ProgressRail.
 * Must match the 18-section order in the plan.
 */
const CHAPTERS = [
  "Hero",
  "Color Bar",
  "Traction",
  "Customers",
  "Discovery",
  "Why Us",
  "Why Now",
  "SalonOS",
  "Data",
  "Opportunity",
  "Economics",
  "Salon AI",
  "Network",
  "Revenue",
  "Intelligence",
  "Expansion",
  "Flywheel",
  "Vision",
];

export const InvestorExperiencePage: React.FC = () => {
  const prefersReducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    document.title = META.title;
    document.documentElement.style.background = INV.bg;
    return () => {
      document.documentElement.style.background = "";
    };
  }, []);

  return (
    <main
      role="main"
      style={{
        background: INV.bg,
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* Confidential strip */}
      <div
        className="flex items-center justify-between px-8 py-3"
        style={{
          background: `${INV.bgDark}F0`,
          backdropFilter: "blur(12px)",
          borderBottom: `1px solid rgba(200,169,106,0.15)`,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(245,240,232,0.55)",
          }}
        >
          {CHROME.brand}
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: "rgba(200,169,106,0.60)",
          }}
        >
          {CHROME.confidential}
        </span>
      </div>

      {/* Progress rail — desktop only */}
      <ProgressRail
        chapters={CHAPTERS}
        reducedMotion={prefersReducedMotion}
      />

      {/* Section 1 */}
      <HeroSection reducedMotion={prefersReducedMotion} />

      {/* Section 2 */}
      <ColorBarOriginSection reducedMotion={prefersReducedMotion} />

      {/* Section 3 */}
      <SpectraTodaySection reducedMotion={prefersReducedMotion} />

      {/* Section 4 */}
      <CustomerValidationSection reducedMotion={prefersReducedMotion} />

      {/* Section 5 */}
      <WhatWeLearnedSection reducedMotion={prefersReducedMotion} />

      {/* Section 6 */}
      <WhyUsSection reducedMotion={prefersReducedMotion} />

      {/* Section 7 */}
      <WhyNowSection reducedMotion={prefersReducedMotion} />

      {/* Section 8 */}
      <SalonOSSection reducedMotion={prefersReducedMotion} />

      {/* Section 9 */}
      <UnexpectedAssetSection reducedMotion={prefersReducedMotion} />

      {/* Section 10 */}
      <OpportunitySection reducedMotion={prefersReducedMotion} />

      {/* Section 11 */}
      <EconomicsImproveSection reducedMotion={prefersReducedMotion} />

      {/* Section 12 */}
      <SalonAIRevealSection reducedMotion={prefersReducedMotion} />

      {/* Section 13 */}
      <SalonNetworkSection reducedMotion={prefersReducedMotion} />

      {/* Section 14 */}
      <BeyondSoftwareSection reducedMotion={prefersReducedMotion} />

      {/* Section 15 */}
      <IndustryIntelligenceSection reducedMotion={prefersReducedMotion} />

      {/* Section 16 */}
      <FutureMarketExpansionSection reducedMotion={prefersReducedMotion} />

      {/* Section 17 */}
      <FlywheelSection reducedMotion={prefersReducedMotion} />

      {/* Section 18 */}
      <FinalVisionSection reducedMotion={prefersReducedMotion} />
    </main>
  );
};
