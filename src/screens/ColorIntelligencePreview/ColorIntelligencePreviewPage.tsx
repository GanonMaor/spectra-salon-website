import React, { useEffect } from "react";
import { INV } from "../SpectraInvestorExperience/tokens";
import { DeckShell } from "../SpectraInvestorExperience/primitives";
import type { DeckSlide } from "../SpectraInvestorExperience/primitives";
import { CHROME } from "./copy";
import {
  MarketQuestionHeroSlide,
  ProfessionalComplexitySlide,
  WorkflowTrailSlide,
  ShadeSystemsSlide,
  BridgeToIntelligenceSlide,
  RealDataFromSalonsSlide,
  ColorFamiliesSlide,
  MostUsedShadesSlide,
  ShadeByServiceSlide,
  FormulaMixingIntelligenceSlide,
  BlondeIntelligenceSlide,
  DictionaryDrilldownSlide,
  WhySpectraCanSeeSlide,
  FinalMessageSlide,
} from "./sections";

/**
 * Private market intelligence preview for L'Oréal and color manufacturers.
 * Shows what Spectra can see — and what no other system captures.
 *
 * Hidden route: /investors/color-intelligence-preview
 * Direct URL only — not listed in public navigation.
 */
export const ColorIntelligencePreviewPage: React.FC = () => {
  useEffect(() => {
    document.title = "Color Intelligence Preview · Spectra";
    document.documentElement.style.background = INV.bgDeep;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.background = "";
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const slides: DeckSlide[] = [
    // ── Layer 1: Understanding The World ──────────────────────────────
    {
      id: "market-question",
      label: "The Question",
      group: "The World",
      fullBleed: true,
      tone: "deep",
      node: <MarketQuestionHeroSlide />,
    },
    {
      id: "color-complexity",
      label: "Thousands of Decisions",
      group: "The World",
      fullBleed: true,
      tone: "deep",
      node: <ProfessionalComplexitySlide />,
    },
    {
      id: "workflow-trail",
      label: "The Data Trail",
      group: "The World",
      fullBleed: true,
      tone: "deep",
      node: <WorkflowTrailSlide />,
    },
    {
      id: "shade-systems",
      label: "Shade Systems",
      group: "The World",
      fullBleed: true,
      tone: "deep",
      node: <ShadeSystemsSlide />,
    },
    {
      id: "bridge",
      label: "The Connection",
      group: "The World",
      fullBleed: true,
      tone: "deep",
      node: <BridgeToIntelligenceSlide />,
    },

    // ── Layer 2: What The Industry Can't See ──────────────────────────
    {
      id: "real-data",
      label: "Real Data",
      group: "Intelligence",
      fullBleed: true,
      tone: "deep",
      node: <RealDataFromSalonsSlide />,
    },
    {
      id: "color-families",
      label: "Color Families",
      group: "Intelligence",
      fullBleed: true,
      tone: "deep",
      node: <ColorFamiliesSlide />,
    },
    {
      id: "most-used-shades",
      label: "Most Used Shades",
      group: "Intelligence",
      fullBleed: true,
      tone: "deep",
      node: <MostUsedShadesSlide />,
    },
    {
      id: "shade-by-service",
      label: "Shade by Service",
      group: "Intelligence",
      fullBleed: true,
      tone: "deep",
      node: <ShadeByServiceSlide />,
    },
    {
      id: "formula-mixing",
      label: "Formula Mixing",
      group: "Intelligence",
      fullBleed: true,
      tone: "deep",
      node: <FormulaMixingIntelligenceSlide />,
    },
    {
      id: "blonde-intelligence",
      label: "Blonde Intelligence",
      group: "Intelligence",
      fullBleed: true,
      tone: "deep",
      node: <BlondeIntelligenceSlide />,
    },
    {
      id: "dictionary-drilldown",
      label: "Traceability",
      group: "Intelligence",
      fullBleed: true,
      tone: "deep",
      node: <DictionaryDrilldownSlide />,
    },

    // ── Layer 3: Why Only Spectra ─────────────────────────────────────
    {
      id: "why-spectra",
      label: "Why Only Spectra",
      group: "Closing",
      fullBleed: true,
      tone: "deep",
      node: <WhySpectraCanSeeSlide />,
    },
    {
      id: "final-message",
      label: "Final Message",
      group: "Closing",
      fullBleed: true,
      tone: "deep",
      node: <FinalMessageSlide />,
    },
  ];

  return (
    <DeckShell
      slides={slides}
      brand={CHROME.brand}
      confidential={CHROME.confidential}
    />
  );
};
