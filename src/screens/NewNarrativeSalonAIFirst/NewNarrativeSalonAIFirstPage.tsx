import React, { useEffect } from "react";
import { INV } from "../SpectraInvestorExperience/tokens";
import { DeckShell } from "../SpectraInvestorExperience/primitives";
import type { DeckSlide } from "../SpectraInvestorExperience/primitives";
import {
  SalonAIOpeningSlide,
  WhyNowSlide,
  ThreeLayersSlide,
  WhyColorSlide,
  Layer1ProvenSlide,
  TripleBundleMetricsSlide,
  DataAdvantageSlide,
  Layer2OperationsSlide,
  Layer3AgentsSlide,
  WhyAIWorksSlide,
  BusinessModelSlide,
  WhyRaiseSlide,
  ClosingSlide,
} from "./sections";
import { META, CHROME } from "./copy";

/**
 * New Narrative Salon AI First — a premium, Salon AI-first investor experience.
 * Hidden route: /investors/new-narrative-salon-ai-first (also in Hidden Pages menu).
 *
 * Reuses the SpectraInvestorExperience deck system, tokens, primitives, and visuals.
 */
export const NewNarrativeSalonAIFirstPage: React.FC = () => {
  useEffect(() => {
    document.title = META.title;
    document.documentElement.style.background = INV.bg;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.background = "";
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // Every slide is a full-bleed cinematic image; deep tone keeps deck chrome light.
  const slides: DeckSlide[] = [
    { id: "salon-ai",       label: "Salon AI",                    group: "Open",         fullBleed: true, tone: "deep", node: <SalonAIOpeningSlide /> },
    { id: "three-layers",   label: "One Platform. Three Layers.", group: "Architecture", fullBleed: true, tone: "deep", node: <ThreeLayersSlide /> },
    { id: "layer-1",        label: "Layer 1 — Already Running",  group: "Proof",        fullBleed: true, tone: "deep", node: <Layer1ProvenSlide /> },
    { id: "triple-bundle",  label: "Sales & Unit Economics",      group: "Proof",        fullBleed: true, tone: "deep", node: <TripleBundleMetricsSlide /> },
    { id: "why-color",      label: "Why We Started With Color",  group: "Architecture", fullBleed: true, tone: "deep", node: <WhyColorSlide /> },
    { id: "why-now",        label: "Why Now",                    group: "Context",      fullBleed: true, tone: "deep", node: <WhyNowSlide /> },
    { id: "data-advantage", label: "The Data Advantage",         group: "Moat",         fullBleed: true, tone: "deep", node: <DataAdvantageSlide /> },
    { id: "layer-2",        label: "Layer 2 — Operations",       group: "Platform",     fullBleed: true, tone: "deep", node: <Layer2OperationsSlide /> },
    { id: "layer-3",        label: "Layer 3 — AI Agents",        group: "Platform",     fullBleed: true, tone: "deep", node: <Layer3AgentsSlide /> },
    { id: "why-ai",         label: "Why AI Works Here",          group: "Platform",     fullBleed: true, tone: "deep", node: <WhyAIWorksSlide /> },
    { id: "business-model", label: "The Business Model",         group: "Economics",    fullBleed: true, tone: "deep", node: <BusinessModelSlide /> },
    { id: "why-raise",      label: "Why Raise Now",              group: "The Ask",      fullBleed: true, tone: "deep", node: <WhyRaiseSlide /> },
    { id: "closing",        label: "The Vision",                 group: "Close",        fullBleed: true, tone: "deep", node: <ClosingSlide /> },
  ];

  return <DeckShell slides={slides} brand={CHROME.brand} confidential={CHROME.confidential} />;
};
