import React, { useEffect } from "react";
import { INV } from "./tokens";
import { DeckShell } from "./primitives";
import type { DeckSlide } from "./primitives";
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
  AgendaSlide,
} from "./sections";
import type { AgendaItem } from "./sections";
import { META, CHROME } from "./copy";

const AGENDA: AgendaItem[] = [
  { num: "01", title: "The Color Bar Origin", meta: "Chapter 1 · The real problem", id: "color-bar" },
  { num: "02", title: "Spectra Today", meta: "Traction & KPIs", id: "spectra-today" },
  { num: "03", title: "The Bigger Problem", meta: "Chapter 2 · Fragmentation", id: "what-we-learned" },
  { num: "04", title: "Our Right To Win", meta: "Why Spectra", id: "why-us" },
  { num: "05", title: "The Data Asset", meta: "Chapter 3 · Operational moat", id: "unexpected-asset" },
  { num: "06", title: "The Operating System", meta: "Chapter 4 · SalonOS", id: "salonos" },
  { num: "07", title: "Market Opportunity", meta: "TAM / SAM / SOM", id: "opportunity" },
  { num: "08", title: "Economics", meta: "Chapter 5 · Business model", id: "economics" },
  { num: "09", title: "Salon AI", meta: "Chapter 6 · Intelligence", id: "salon-ai-reveal" },
  { num: "10", title: "Revenue Engines", meta: "Chapter 7 · Platform", id: "beyond-software" },
  { num: "11", title: "The Data Flywheel", meta: "Chapter 8 · Network effect", id: "flywheel" },
  { num: "12", title: "The Vision", meta: "Long-term", id: "final-vision" },
];

export const InvestorExperiencePage: React.FC = () => {
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

  const slides: DeckSlide[] = [
    { id: "title", label: "Title", group: "Open", fullBleed: true, node: <HeroSection /> },
    { id: "agenda", label: "Agenda", group: "Open", tone: "soft", node: <AgendaSlide items={AGENDA} /> },
    { id: "color-bar", label: "The Color Bar Origin", group: "Chapter 1", node: <ColorBarOriginSection /> },
    { id: "spectra-today", label: "Spectra Today", group: "Traction", tone: "soft", node: <SpectraTodaySection /> },
    { id: "validation", label: "Customer Validation", group: "Traction", node: <CustomerValidationSection /> },
    { id: "what-we-learned", label: "The Bigger Problem", group: "Chapter 2", node: <WhatWeLearnedSection /> },
    { id: "why-us", label: "Our Right To Win", group: "Chapter 2", tone: "soft", node: <WhyUsSection /> },
    { id: "why-now", label: "Why Now", group: "Chapter 2", node: <WhyNowSection /> },
    { id: "unexpected-asset", label: "The Data Asset", group: "Chapter 3", tone: "deep", node: <UnexpectedAssetSection /> },
    { id: "salonos", label: "The Operating System", group: "Chapter 4", tone: "gold", node: <SalonOSSection /> },
    { id: "opportunity", label: "Market Opportunity", group: "Market", tone: "soft", node: <OpportunitySection /> },
    { id: "economics", label: "Economics", group: "Chapter 5", node: <EconomicsImproveSection /> },
    { id: "salon-ai-reveal", label: "Salon AI", group: "Chapter 6", tone: "deep", fullBleed: true, node: <SalonAIRevealSection /> },
    { id: "salon-network", label: "The Salon Network", group: "Chapter 6", node: <SalonNetworkSection /> },
    { id: "beyond-software", label: "Revenue Engines", group: "Chapter 7", tone: "soft", node: <BeyondSoftwareSection /> },
    { id: "industry-intelligence", label: "Industry Intelligence", group: "Upside", tone: "deep", node: <IndustryIntelligenceSection /> },
    { id: "market-expansion", label: "Market Expansion", group: "Optionality", tone: "soft", node: <FutureMarketExpansionSection /> },
    { id: "flywheel", label: "The Data Flywheel", group: "Chapter 8", node: <FlywheelSection /> },
    { id: "final-vision", label: "The Vision", group: "Vision", tone: "deep", fullBleed: true, node: <FinalVisionSection /> },
  ];

  return <DeckShell slides={slides} brand={CHROME.brand} confidential={CHROME.confidential} />;
};
