import React, { useEffect } from "react";
import { INV } from "../SpectraInvestorExperience/tokens";
import { DeckShell } from "../SpectraInvestorExperience/primitives";
import type { DeckSlide } from "../SpectraInvestorExperience/primitives";
import {
  WhyNowSlide,
  ThreeLayersSlide,
  BookingIntelligenceSlide,
  BackRoomFrontDeskSlide,
  SmartBookingDemoSlide,
  SalonIntelligenceLayerSlide,
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
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.background = "";
      document.body.style.overflow = prevOverflow;
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
    { id: "front-desk",     label: "From Back Room To Front Desk", group: "Booking Intelligence",   fullBleed: true, tone: "deep", node: <BackRoomFrontDeskSlide /> },
    { id: "booking-demo",   label: "Smart Booking Demo",          group: "Booking Intelligence",    fullBleed: true, tone: "deep", node: <SmartBookingDemoSlide /> },
    { id: "data-advantage", label: "Market Intelligence",         group: "Intelligence Layer",      fullBleed: true, tone: "deep", node: <DataAdvantageSlide /> },
    { id: "intelligence",   label: "The Intelligence Layer",      group: "Intelligence Layer",      fullBleed: true, tone: "deep", node: <SalonIntelligenceLayerSlide /> },
    { id: "layer-2",        label: "Layer 2 — Operations",       group: "Salon Operating System",  fullBleed: true, tone: "deep", node: <Layer2OperationsSlide /> },
    { id: "layer-3",        label: "Layer 3 — AI Agents",        group: "Salon AI",                fullBleed: true, tone: "deep", node: <Layer3AgentsSlide /> },
    { id: "why-ai",         label: "Traditional AI vs Salon AI",  group: "Salon AI",                fullBleed: true, tone: "deep", node: <WhyAIWorksSlide /> },
    { id: "business-model", label: "The Business Model",         group: "Business Model Expansion", fullBleed: true, tone: "deep", node: <BusinessModelSlide /> },
    { id: "why-raise",      label: "Why Raise Now",              group: "Series A",                fullBleed: true, tone: "deep", node: <WhyRaiseSlide /> },
    { id: "closing",        label: "The Vision",                 group: "Close",                   fullBleed: true, tone: "deep", node: <ClosingSlide /> },
    { id: "why-now",        label: "Why Now",                    group: "Archive / Unused Slides", fullBleed: true, tone: "deep", node: <WhyNowSlide /> },
  ];

  return <DeckShell slides={slides} brand={CHROME.brand} confidential={CHROME.confidential} />;
};
