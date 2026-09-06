import React from "react";
import type { UpdateLang } from "./finalCopy";
import { ResponsiveWebDeck } from "./WebDeckPrimitives";
import {
  CoverWebSlide,
} from "./webDeck/OpeningSlides";
import { ColorRoomWedgeWebSlide } from "./webDeck/ColorRoomWedgeWebSlide";
import { AdoptionScaleWebSlide } from "./webDeck/AdoptionScaleWebSlide";
import { DataMoatWebSlide } from "./webDeck/DataMoatWebSlide";
import { IndustryValidationWebSlide } from "./webDeck/IndustryValidationWebSlide";
import { SalonSystemWebSlide } from "./webDeck/SalonSystemWebSlide";
import { MarketSalonWebSlide } from "./webDeck/MarketSalonWebSlide";
import { MarketProductsWebSlide } from "./webDeck/MarketProductsWebSlide";
import { IndustryBlindWebSlide } from "./webDeck/IndustryBlindWebSlide";
import { OperationalDataLayerWebSlide } from "./webDeck/OperationalDataLayerWebSlide";
import {
  ClientAppWebSlide,
  GtmExperimentWebSlide,
  GtmRouteWebSlide,
  OwnerAppWebSlide,
  PlatformArchitectureWebSlide,
  PlatformPayoffWebSlide,
  ProofCustomerWebSlide,
  SalonOperatingWebSlide,
} from "./webDeck/CommercialPlatformSlides";
import {
  DataDepthWebSlide,
  DataHubWebSlide,
  DataImplicationsWebSlide,
  DataInterstitialWebSlide,
  SalonAiConvergenceWebSlide,
  SalonAiCurtainWebSlide,
  SalonAiThesisWebSlide,
  SixSalonFindingsWebSlide,
} from "./webDeck/SalonAiDataSlides";
import {
  LandscapeWebSlide,
  ModelWebSlide,
  OptionalityWebSlide,
  RaiseWebSlide,
  TeamFoundersWebSlide,
  TeamNetworkWebSlide,
} from "./webDeck/ClosingSlides";

export const ExternalInvestorWebDeck: React.FC<{
  lang: UpdateLang;
  reducedMotion: boolean;
}> = ({ lang, reducedMotion }) => (
  <ResponsiveWebDeck>
    <CoverWebSlide lang={lang} />
    <MarketSalonWebSlide lang={lang} />
    <MarketProductsWebSlide lang={lang} />
    <IndustryBlindWebSlide lang={lang} />
    <OperationalDataLayerWebSlide lang={lang} />
    <ColorRoomWedgeWebSlide lang={lang} />
    <AdoptionScaleWebSlide lang={lang} />
    <DataMoatWebSlide lang={lang} reducedMotion={reducedMotion} />
    <IndustryValidationWebSlide lang={lang} />
    <SalonSystemWebSlide lang={lang} />
    <ProofCustomerWebSlide lang={lang} />
    <GtmRouteWebSlide lang={lang} />
    <GtmExperimentWebSlide lang={lang} />
    <PlatformArchitectureWebSlide lang={lang} />
    <PlatformPayoffWebSlide lang={lang} />
    <SalonOperatingWebSlide lang={lang} />
    <OwnerAppWebSlide lang={lang} />
    <ClientAppWebSlide lang={lang} />
    <SalonAiCurtainWebSlide lang={lang} reducedMotion={reducedMotion} />
    <SalonAiThesisWebSlide lang={lang} reducedMotion={reducedMotion} />
    <SalonAiConvergenceWebSlide lang={lang} reducedMotion={reducedMotion} />
    <DataInterstitialWebSlide lang={lang} reducedMotion={reducedMotion} />
    <DataHubWebSlide lang={lang} reducedMotion={reducedMotion} />
    <DataDepthWebSlide lang={lang} reducedMotion={reducedMotion} />
    <SixSalonFindingsWebSlide lang={lang} reducedMotion={reducedMotion} />
    <DataImplicationsWebSlide lang={lang} reducedMotion={reducedMotion} />
    <ModelWebSlide lang={lang} />
    <LandscapeWebSlide lang={lang} />
    <TeamFoundersWebSlide lang={lang} />
    <TeamNetworkWebSlide lang={lang} />
    <RaiseWebSlide lang={lang} />
    <OptionalityWebSlide lang={lang} />
  </ResponsiveWebDeck>
);

export default ExternalInvestorWebDeck;

