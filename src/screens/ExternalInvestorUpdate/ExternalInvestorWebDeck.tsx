import React from "react";
import type { UpdateLang } from "./finalCopy";
import { ResponsiveWebDeck } from "./WebDeckPrimitives";
import { CoverWebSlide } from "./webDeck/OpeningSlides";
import {
  BusinessTestWebSlide,
  FounderProblemWebSlide,
  IsraelSolutionWebSlide,
  ItWorkedWebSlide,
} from "./webDeck/narrative/FoundingChapter";
import {
  AiDifferenceWebSlide,
  BowlDataWebSlide,
  BrandBlindSpotWebSlide,
  CloseLoopWebSlide,
  CommercePositionWebSlide,
  IndustryLayerWebSlide,
  LandscapeExactWebSlide,
  MarketLayersWebSlide,
  OptionalityExactWebSlide,
  RaiseExactWebSlide,
  RevenueLayersWebSlide,
  SalonAiExpansionWebSlide,
  TeamExactWebSlide,
  WhyStopWebSlide,
} from "./webDeck/narrative/DiscoveryChapter";

export const ExternalInvestorWebDeck: React.FC<{
  lang: UpdateLang;
  reducedMotion: boolean;
}> = ({ lang }) => (
  <ResponsiveWebDeck>
    <CoverWebSlide lang={lang} />
    <FounderProblemWebSlide lang={lang} />
    <IsraelSolutionWebSlide lang={lang} />
    <BusinessTestWebSlide lang={lang} />
    <ItWorkedWebSlide lang={lang} />
    <BrandBlindSpotWebSlide lang={lang} />
    <BowlDataWebSlide lang={lang} />
    <WhyStopWebSlide lang={lang} />
    <SalonAiExpansionWebSlide lang={lang} />
    <CommercePositionWebSlide lang={lang} />
    <IndustryLayerWebSlide lang={lang} />
    <MarketLayersWebSlide lang={lang} />
    <RevenueLayersWebSlide lang={lang} />
    <LandscapeExactWebSlide lang={lang} />
    <AiDifferenceWebSlide lang={lang} />
    <OptionalityExactWebSlide lang={lang} />
    <RaiseExactWebSlide lang={lang} />
    <TeamExactWebSlide lang={lang} />
    <CloseLoopWebSlide lang={lang} />
  </ResponsiveWebDeck>
);

export default ExternalInvestorWebDeck;
