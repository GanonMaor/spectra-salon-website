import React from "react";
import { ACCENTS } from "../../theme";
import { GlassAiCard, LiveDemoSlide, LIVE_DEMO_ASSETS, type StagePiece } from "./DeviceFrame";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const compositionImg = (src: string, alt: string) => (
  <img
    src={src}
    alt={alt}
    draggable={false}
    className="h-auto w-full"
    style={{ filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.5))" }}
  />
);

const devices: StagePiece[] = [
  {
    key: "color-mixing",
    contextName: "Color Formula iPad Composition",
    desktopClass: "left-[-6%] top-[2%] w-[55%] min-w-[370px]",
    mobileClass: "max-w-[520px]",
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE },
    node: compositionImg(
      LIVE_DEMO_ASSETS.colorBarComposition,
      "Spectra color bar formula intelligence on iPad with live product scan",
    ),
    mobileCaption: (
      <GlassAiCard
        label="Formula Confidence"
        value="98%"
        detail="Formula screen: AI recommends 2g Spectra Gloss based on client history and desired finish."
        accent={ACCENTS.gold.accent}
      />
    ),
  },
  {
    key: "inventory",
    contextName: "Color Inventory iPad Composition",
    desktopClass: "right-[0%] top-[31%] w-[47%] min-w-[320px]",
    mobileClass: "max-w-[520px]",
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.16, ease: EASE },
    node: compositionImg(
      LIVE_DEMO_ASSETS.inventoryComposition,
      "Spectra live color inventory on iPad with product stock levels",
    ),
    mobileCaption: (
      <GlassAiCard
        label="Inventory Signal"
        value="Color 7.21 low"
        detail="Inventory screen: projected runout in 6 days, generating the order before capacity is affected."
        accent={ACCENTS.copper.accent}
      />
    ),
  },
];

const cards: StagePiece[] = [
  {
    key: "formula",
    contextName: "Formula Confidence Card",
    desktopClass: "left-[-5%] bottom-[9%] w-[245px]",
    node: (
      <GlassAiCard
        label="Formula Confidence"
        value="98%"
        detail="AI recommends 2g Spectra Gloss based on client history and desired finish."
        accent={ACCENTS.gold.accent}
      />
    ),
  },
  {
    key: "inventory-signal",
    contextName: "Inventory Signal Card",
    desktopClass: "right-[0%] top-[3%] w-[255px]",
    node: (
      <GlassAiCard
        label="Inventory Signal"
        value="Color 7.21 low"
        detail="Projected runout in 6 days. Generate order before service capacity is affected."
        accent={ACCENTS.copper.accent}
      />
    ),
  },
];

export const ColorBarIntelligenceDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.colorBarScale}
    eyebrow="Spectra Color Bar"
    headline="Color work becomes measurable intelligence."
    takeaway="The color bar captures formulas, product movement, client history, and inventory signals while the stylist is working."
    backgroundPosition="center"
    devices={devices}
    cards={cards}
  />
);
