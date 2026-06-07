import React from "react";
import { ACCENTS } from "../../theme";
import { DeviceFrame, GlassAiCard, LiveDemoSlide, LIVE_DEMO_ASSETS, type StagePiece } from "./DeviceFrame";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const devices: StagePiece[] = [
  {
    key: "owner",
    desktopClass: "left-[14%] top-[12%] w-[22%] min-w-[150px]",
    mobileClass: "max-w-[240px]",
    initial: { opacity: 0, y: 36, rotate: -8 },
    animate: { opacity: 1, y: 0, rotate: -8 },
    transition: { duration: 0.8, ease: EASE },
    node: (
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.mobileOwnerExecutive}
        alt="Owner executive dashboard on mobile"
        kind="phone"
        priority
      />
    ),
  },
  {
    key: "ai-team",
    desktopClass: "left-[39%] top-[4%] w-[24%] min-w-[165px]",
    mobileClass: "max-w-[250px]",
    initial: { opacity: 0, y: 26 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay: 0.12, ease: EASE },
    node: (
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.mobileAiTeam}
        alt="AI team mobile interface"
        kind="phone"
      />
    ),
  },
  {
    key: "inventory",
    desktopClass: "right-[10%] top-[13%] w-[22%] min-w-[150px]",
    mobileClass: "max-w-[240px]",
    initial: { opacity: 0, y: 36, rotate: 8 },
    animate: { opacity: 1, y: 0, rotate: 8 },
    transition: { duration: 0.8, delay: 0.2, ease: EASE },
    node: (
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.mobileInventoryAgent}
        alt="Inventory agent mobile alert"
        kind="phone"
      />
    ),
  },
];

const cards: StagePiece[] = [
  {
    key: "owner-card",
    desktopClass: "left-[-3%] bottom-[20%] w-[245px] -rotate-2",
    node: (
      <GlassAiCard
        label="Owner"
        value="Pulse, alerts, revenue"
        detail="The business view: what changed, why it matters, and what to do next."
        accent={ACCENTS.gold.accent}
      />
    ),
  },
  {
    key: "staff-card",
    desktopClass: "left-[37%] bottom-[1%] w-[245px] rotate-1",
    node: (
      <GlassAiCard
        label="Staff"
        value="Next client, formula, timing"
        detail="The work view: service context and live guidance at the station."
        accent={ACCENTS.sage.accent}
      />
    ),
  },
  {
    key: "client-card",
    desktopClass: "right-[-2%] bottom-[24%] w-[245px] rotate-2",
    node: (
      <GlassAiCard
        label="Client"
        value="Booking, updates, retention"
        detail="The experience view: timely communication before and after every visit."
        accent={ACCENTS.rose.accent}
      />
    ),
  },
];

export const MobileAgentSuiteDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.productShelves}
    eyebrow="Mobile AI Agents"
    headline="The AI team lives in everyone's hand."
    takeaway="Owners, staff, and clients each see a different surface, powered by the same salon intelligence underneath."
    backgroundPosition="center"
    devices={devices}
    cards={cards}
  />
);
