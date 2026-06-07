import React from "react";
import { motion } from "framer-motion";
import { ACCENTS, INK } from "../../theme";
import { DeviceFrame, LiveDemoSlide, LIVE_DEMO_ASSETS } from "./DeviceFrame";

const surfaces = [
  { index: "01", title: "Desktop Operations", detail: "Calendar · clients · live floor", accent: ACCENTS.sky.accent },
  { index: "02", title: "Color Intelligence", detail: "Scale · formulas · inventory", accent: ACCENTS.copper.accent },
  { index: "03", title: "AI Team in Hand", detail: "Owner · staff · client agents", accent: ACCENTS.gold.accent },
];

export const ThreeConnectedArmsDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.heroReception}
    eyebrow="Connected Platform"
    headline="Three surfaces. One live data loop."
    takeaway="The investor story starts after the product is clear: every interaction improves the operating layer, the color layer, and the AI layer."
    backgroundPosition="center"
  >
    {/* Three devices in one symmetric row, aligned on a shared baseline */}
    <div className="absolute inset-x-0 top-0 bottom-[15%] z-10 flex items-end justify-center gap-6 px-2 lg:gap-10">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
        className="w-[34%] min-w-[220px] shrink-0"
      >
        <DeviceFrame
          src={LIVE_DEMO_ASSETS.tabletColorIntelligence}
          alt="Connected color intelligence surface"
          kind="tablet"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="w-[44%] shrink-0"
      >
        <DeviceFrame
          src={LIVE_DEMO_ASSETS.desktopOperationalHub}
          alt="Connected desktop operations surface"
          kind="desktop"
          priority
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="w-[15%] min-w-[110px] shrink-0"
      >
        <DeviceFrame
          src={LIVE_DEMO_ASSETS.mobileAiTeam}
          alt="Connected mobile AI team surface"
          kind="phone"
        />
      </motion.div>
    </div>

    {/* Numbered surface legend — clear, single-line titles with descriptors */}
    <div className="absolute bottom-[2.5%] left-1/2 flex -translate-x-1/2 items-center gap-8 lg:gap-14">
      {surfaces.map((s) => (
        <div key={s.title} className="flex items-center gap-3">
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
      ))}
    </div>
  </LiveDemoSlide>
);
