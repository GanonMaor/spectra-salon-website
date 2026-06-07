import React from "react";
import { ACCENTS, INK } from "../../theme";
import { DeviceFrame, LiveDemoSlide, LIVE_DEMO_ASSETS, type StagePiece } from "./DeviceFrame";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const surfaces = [
  { index: "01", title: "Desktop Operations", detail: "Calendar · clients · live floor", accent: ACCENTS.sky.accent },
  { index: "02", title: "Color Intelligence", detail: "Scale · formulas · inventory", accent: ACCENTS.copper.accent },
  { index: "03", title: "AI Team in Hand", detail: "Owner · staff · client agents", accent: ACCENTS.gold.accent },
];

function SurfaceItem({ s }: { s: (typeof surfaces)[number] }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="text-lg font-light tabular-nums"
        style={{ color: s.accent, textShadow: `0 0 14px ${s.accent}` }}
      >
        {s.index}
      </span>
      <span className="h-9 w-px shrink-0" style={{ background: "rgba(255,255,255,0.28)" }} />
      <div className="flex flex-col leading-tight">
        <span
          className="whitespace-nowrap text-sm font-medium uppercase tracking-[0.16em]"
          style={{ color: INK.strong, textShadow: "0 1px 12px rgba(0,0,0,0.85)" }}
        >
          {s.title}
        </span>
        <span
          className="mt-0.5 whitespace-nowrap text-[11px]"
          style={{ color: INK.soft, textShadow: "0 1px 10px rgba(0,0,0,0.8)" }}
        >
          {s.detail}
        </span>
      </div>
    </div>
  );
}

const devices: StagePiece[] = [
  {
    key: "desktop",
    contextName: "Desktop Operations Surface",
    desktopClass: "left-1/2 bottom-[18%] w-[42%] -translate-x-1/2",
    mobileClass: "max-w-[600px]",
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: EASE },
    node: (
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.desktopOperationalHub}
        alt="Connected desktop operations surface"
        kind="desktop"
        priority
      />
    ),
    mobileCaption: <SurfaceItem s={surfaces[0]} />,
  },
  {
    key: "tablet",
    contextName: "Color Intelligence Surface",
    desktopClass: "left-[1%] bottom-[18%] w-[31%] min-w-[210px]",
    mobileClass: "max-w-[460px]",
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: 0.14, ease: EASE },
    node: (
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.tabletColorIntelligence}
        alt="Connected color intelligence surface"
        kind="tablet"
      />
    ),
    mobileCaption: <SurfaceItem s={surfaces[1]} />,
  },
  {
    key: "phone",
    contextName: "AI Team Mobile Surface",
    desktopClass: "right-[3%] bottom-[18%] w-[14%] min-w-[110px]",
    mobileClass: "max-w-[240px]",
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay: 0.24, ease: EASE },
    node: (
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.mobileAiTeam}
        alt="Connected mobile AI team surface"
        kind="phone"
      />
    ),
    mobileCaption: <SurfaceItem s={surfaces[2]} />,
  },
];

export const ThreeConnectedArmsDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.heroReception}
    eyebrow="Connected Platform"
    headline="Three surfaces. One live data loop."
    takeaway="The investor story starts after the product is clear: every interaction improves the operating layer, the color layer, and the AI layer."
    backgroundPosition="center"
    devices={devices}
    cards={[]}
    desktopStageExtra={
      <div className="absolute bottom-[2.5%] left-1/2 flex -translate-x-1/2 items-center gap-8 lg:gap-14">
        {surfaces.map((s) => (
          <SurfaceItem key={s.title} s={s} />
        ))}
      </div>
    }
  />
);
