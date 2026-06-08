import React, { useEffect } from "react";
import { INV } from "../SpectraInvestorExperience/tokens";
import { DeckShell } from "../SpectraInvestorExperience/primitives";
import type { DeckSlide } from "../SpectraInvestorExperience/primitives";
import { CHROME } from "./copy";
import {
  BookingSchedulingIntelligenceDraftSlide,
  ColorBarIntelligenceDraftSlide,
  LiveSystemHeroDraftSlide,
  MobileAgentSuiteDraftSlide,
  ThreeConnectedArmsDraftSlide,
} from "./sections/liveDemoDraft";

/**
 * Isolated draft opening sequence for review.
 *
 * Hidden route: /investors/new-narrative-salon-ai-first/live-demo-draft
 * Keep this separate from the approved deck until the first 3-5 slides are accepted.
 */
export const NewNarrativeSalonAIFirstLiveDemoDraftPage: React.FC = () => {
  useEffect(() => {
    document.title = "Salon AI Live Demo Draft | Spectra";
    document.documentElement.style.background = INV.bg;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.background = "";
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const slides: DeckSlide[] = [
    { id: "live-system", label: "Live OS", group: "Product", fullBleed: true, tone: "deep", node: <LiveSystemHeroDraftSlide /> },
    { id: "color-bar", label: "Color Bar Intelligence", group: "Cost Optimization", fullBleed: true, tone: "deep", node: <ColorBarIntelligenceDraftSlide /> },
    { id: "booking-intelligence", label: "Booking Intelligence", group: "Booking Intelligence", fullBleed: true, tone: "deep", node: <BookingSchedulingIntelligenceDraftSlide /> },
    { id: "connected-platform", label: "Connected Platform", group: "Salon Operating System", fullBleed: true, tone: "deep", node: <ThreeConnectedArmsDraftSlide /> },
    { id: "mobile-agents", label: "Mobile AI Agents", group: "Salon AI", fullBleed: true, tone: "deep", node: <MobileAgentSuiteDraftSlide /> },
  ];

  return (
    <DeckShell
      slides={slides}
      brand={`${CHROME.brand} / LIVE DEMO DRAFT`}
      confidential={CHROME.confidential}
    />
  );
};
