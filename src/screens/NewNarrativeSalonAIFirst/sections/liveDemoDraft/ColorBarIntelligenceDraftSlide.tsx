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
    desktopClass: "left-[-2%] top-[2%] w-[52%] min-w-[360px]",
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
        label="Product Scan"
        value="Zero friction"
        detail="Products are scanned at the moment of mixing — no extra steps, no interruption to the stylist's workflow."
        accent={ACCENTS.gold.accent}
      />
    ),
  },
  {
    key: "inventory",
    contextName: "Color Inventory iPad Composition",
    desktopClass: "right-[0%] top-[44%] w-[46%] min-w-[310px]",
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
        label="Active Deduction"
        value="Live inventory"
        detail="Every gram used is automatically deducted from stock in real time — no manual updates, no guesswork."
        accent={ACCENTS.copper.accent}
      />
    ),
  },
];

const cards: StagePiece[] = [
  {
    key: "formula",
    contextName: "Formula Confidence Card",
    desktopClass: "left-[21%] bottom-[7%] w-[235px]",
    node: (
      <GlassAiCard
        label="Product Scan"
        value="Zero friction"
        detail="Products are scanned at the moment of mixing — no extra steps, no interruption to the stylist's workflow."
        accent={ACCENTS.gold.accent}
      />
    ),
  },
  {
    key: "inventory-signal",
    contextName: "Inventory Signal Card",
    desktopClass: "right-[8%] top-[15%] w-[250px]",
    node: (
      <GlassAiCard
        label="Active Deduction"
        value="Live inventory"
        detail="Every gram used is automatically deducted from stock in real time — no manual updates, no guesswork."
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
