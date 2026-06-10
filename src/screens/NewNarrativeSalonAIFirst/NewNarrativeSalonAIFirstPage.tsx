import React, { useEffect } from "react";
import { INV } from "../SpectraInvestorExperience/tokens";
import { DeckShell } from "../SpectraInvestorExperience/primitives";
import type { DeckSlide } from "../SpectraInvestorExperience/primitives";
import {
  ThreeLayersSlide,
  BookingIntelligenceSlide,
  BackRoomFrontDeskSlide,
  SalonIntelligenceLayerSlide,
  WhyColorSlide,
  Layer1ProvenSlide,
  TripleBundleMetricsSlide,
  Layer2OperationsSlide,
  SalonAIActsSlide,
  BusinessModelSlide,
  WhyRaiseSlide,
  ClosingSlide,
} from "./sections";
import { LiveSystemHeroDraftSlide } from "./sections/liveDemoDraft";
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
    return () => {
      document.documentElement.style.background = "";
    };
  }, []);

  // Every slide is a full-bleed cinematic image; deep tone keeps deck chrome light.
  const slides: DeckSlide[] = [
    { id: "salon-ai",       label: "Live OS",                     group: "Product",                 fullBleed: true, tone: "deep", node: <LiveSystemHeroDraftSlide /> },
    { id: "three-layers",   label: "One Platform. Three Layers.", group: "Product Roadmap",         fullBleed: true, tone: "deep", node: <ThreeLayersSlide /> },
    { id: "why-color",      label: "Why We Started With Color",  group: "Cost Optimization",       fullBleed: true, tone: "deep", node: <WhyColorSlide /> },
    { id: "layer-1",        label: "Proof We Were Right",         group: "Cost Optimization",       fullBleed: true, tone: "deep", node: <Layer1ProvenSlide /> },
    { id: "triple-bundle",  label: "Retention & Unit Economics",  group: "Cost Optimization",       fullBleed: true, tone: "deep", node: <TripleBundleMetricsSlide /> },
    { id: "booking",        label: "Booking Intelligence",        group: "Booking Intelligence",    fullBleed: true, tone: "deep", node: <BookingIntelligenceSlide /> },
    { id: "front-desk",     label: "Smart Booking Demo",           group: "Booking Intelligence",   fullBleed: true, tone: "deep", node: <BackRoomFrontDeskSlide /> },
    { id: "layer-2",        label: "Layer 2 — Operations",       group: "Salon Operating System",  fullBleed: true, tone: "deep", node: <Layer2OperationsSlide /> },
    { id: "intelligence",   label: "The Intelligence Layer",      group: "Intelligence Layer",      fullBleed: true, tone: "deep", node: <SalonIntelligenceLayerSlide /> },
    { id: "salon-ai-acts",  label: "Salon AI Acts",               group: "Salon AI",                fullBleed: true, tone: "deep", node: <SalonAIActsSlide /> },
    { id: "business-model", label: "The Business Model",         group: "Business Model Expansion", fullBleed: true, tone: "deep", node: <BusinessModelSlide /> },
    { id: "why-raise",      label: "Why Raise Now",              group: "Series A",                fullBleed: true, tone: "deep", node: <WhyRaiseSlide /> },
    { id: "closing",        label: "The Vision",                 group: "Close",                   fullBleed: true, tone: "deep", node: <ClosingSlide /> },
  ];

  return <DeckShell slides={slides} brand={CHROME.brand} confidential={CHROME.confidential} />;
};
