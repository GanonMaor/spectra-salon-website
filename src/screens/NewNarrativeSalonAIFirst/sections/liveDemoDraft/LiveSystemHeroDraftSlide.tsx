import React from "react";
import { ACCENTS } from "../../theme";
import { DeviceFrame, GlassAiCard, LiveDemoSlide, LIVE_DEMO_ASSETS, type StagePiece } from "./DeviceFrame";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const devices: StagePiece[] = [
  {
    key: "desktop",
    contextName: "Desktop Operations Hub",
    desktopClass: "right-[8%] top-[8%] w-[76%]",
    mobileClass: "max-w-[600px]",
    style: { perspective: "1400px" },
    initial: { opacity: 0, x: 34, rotateY: -8 },
    animate: { opacity: 1, x: 0, rotateY: -5 },
    transition: { duration: 0.8, ease: EASE },
    node: (
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.desktopOperationalHub}
        alt="Salon AI live operating system desktop dashboard"
        kind="desktop"
        priority
      />
    ),
    mobileCaption: (
      <GlassAiCard
        label="Live AI Layer"
        value="12 active signals"
        detail="Desktop hub: bookings, clients, capacity, stock, delays, formulas, and customer moments are interpreted in real time."
        accent={ACCENTS.gold.accent}
      />
    ),
  },
  {
    key: "tablet",
    contextName: "Color Intelligence iPad",
    desktopClass: "bottom-[2%] left-[6%] w-[38%] min-w-[260px]",
    mobileClass: "max-w-[460px]",
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.12, ease: EASE },
    node: (
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.tabletColorIntelligence}
        alt="Spectra color intelligence tablet"
        kind="tablet"
      />
    ),
    mobileCaption: (
      <GlassAiCard
        label="Color Bar"
        value="Formula intelligence"
        detail="The iPad surface captures color decisions and formula context directly from the salon floor."
        accent={ACCENTS.copper.accent}
      />
    ),
  },
  {
    key: "phone",
    contextName: "Owner Mobile Executive View",
    desktopClass: "bottom-[4%] right-[2%] w-[15%] min-w-[118px]",
    mobileClass: "max-w-[230px]",
    initial: { opacity: 0, y: 42, rotate: 7 },
    animate: { opacity: 1, y: 0, rotate: 7 },
    transition: { duration: 0.8, delay: 0.2, ease: EASE },
    node: (
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.mobileOwnerExecutive}
        alt="Salon owner mobile executive dashboard"
        kind="phone"
      />
    ),
    mobileCaption: (
      <GlassAiCard
        label="Next Best Action"
        value="+$1,240 today"
        detail="Mobile owner view: AI finds color revenue hidden inside open schedule blocks."
        accent={ACCENTS.sage.accent}
        strong
      />
    ),
  },
];

const cards: StagePiece[] = [
  {
    key: "live-layer",
    contextName: "Desktop Live AI Layer Card",
    desktopClass: "left-[9%] top-[3%] w-[250px] -rotate-2",
    node: (
      <GlassAiCard
        label="Live AI Layer"
        value="12 active signals"
        detail="Capacity, stock, delays, formulas, and customer moments are being interpreted in real time."
        accent={ACCENTS.gold.accent}
      />
    ),
  },
  {
    key: "next-action",
    contextName: "Owner Next Best Action Card",
    desktopClass: "right-[8%] bottom-[1%] w-[230px] rotate-1",
    node: (
      <GlassAiCard
        label="Next Best Action"
        value="+$1,240 today"
        detail="AI found color revenue hidden inside open schedule blocks."
        accent={ACCENTS.sage.accent}
        strong
      />
    ),
  },
];

export const LiveSystemHeroDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.heroReception}
    eyebrow="Salon AI"
    headline="The operating system of a modern salon."
    takeaway="A live product layer over the salon floor: bookings, clients, color, inventory, staff, and AI agents moving together."
    backgroundPosition="center"
    devices={devices}
    cards={cards}
  />
);
