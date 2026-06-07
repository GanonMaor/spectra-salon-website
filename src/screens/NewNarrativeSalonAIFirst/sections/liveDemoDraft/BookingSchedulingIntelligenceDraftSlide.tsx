import React from "react";
import { ACCENTS } from "../../theme";
import { DeviceFrame, GlassAiCard, LiveDemoSlide, LIVE_DEMO_ASSETS, type StagePiece } from "./DeviceFrame";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const devices: StagePiece[] = [
  {
    key: "desktop",
    desktopClass: "left-[4%] top-[11%] w-[74%]",
    mobileClass: "max-w-[600px]",
    initial: { opacity: 0, y: 30, rotateX: 6 },
    animate: { opacity: 1, y: 0, rotateX: 3 },
    transition: { duration: 0.8, ease: EASE },
    node: (
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.desktopMarketplaceSchedule}
        alt="Salon AI booking and scheduling intelligence desktop"
        kind="desktop"
        priority
      />
    ),
  },
  {
    key: "phone",
    desktopClass: "bottom-[5%] right-[8%] w-[19%] min-w-[132px]",
    mobileClass: "max-w-[240px]",
    initial: { opacity: 0, x: 40, rotate: 8 },
    animate: { opacity: 1, x: 0, rotate: 8 },
    transition: { duration: 0.8, delay: 0.14, ease: EASE },
    node: (
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.mobileSmartScheduling}
        alt="Smart scheduling mobile command"
        kind="phone"
      />
    ),
  },
];

const cards: StagePiece[] = [
  {
    key: "capacity",
    desktopClass: "right-[-2%] top-[5%] w-[235px] rotate-2",
    node: (
      <GlassAiCard
        label="Capacity Signal"
        value="81 open minutes"
        detail="AI maps gaps by stylist, skill, and client fit."
        accent={ACCENTS.sky.accent}
      />
    ),
  },
  {
    key: "action",
    desktopClass: "left-[-3%] bottom-[16%] w-[265px] -rotate-1",
    node: (
      <GlassAiCard
        label="Action"
        value="Fill 14:30 slot"
        detail="Offer toner follow-up to Sarah M. with highest acceptance probability."
        accent={ACCENTS.rose.accent}
      />
    ),
  },
];

export const BookingSchedulingIntelligenceDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.heroReception}
    eyebrow="Booking Intelligence"
    headline="The schedule becomes a revenue engine."
    takeaway="Salon AI reads the live calendar, understands staff capacity, and recommends the next best action before gaps become lost revenue."
    backgroundPosition="center"
    devices={devices}
    cards={cards}
  />
);
