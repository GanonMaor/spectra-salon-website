import React from "react";
import { motion } from "framer-motion";
import { ACCENTS } from "../../theme";
import { DeviceFrame, GlassAiCard, LiveDemoSlide, LIVE_DEMO_ASSETS } from "./DeviceFrame";

export const LiveSystemHeroDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.heroReception}
    eyebrow="Salon AI"
    headline="The operating system of a modern salon."
    takeaway="A live product layer over the salon floor: bookings, clients, color, inventory, staff, and AI agents moving together."
    backgroundPosition="center"
  >
    <motion.div
      initial={{ opacity: 0, x: 34, rotateY: -8 }}
      animate={{ opacity: 1, x: 0, rotateY: -5 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-[8%] top-[8%] w-[76%]"
      style={{ perspective: "1400px" }}
    >
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.desktopOperationalHub}
        alt="Salon AI live operating system desktop dashboard"
        kind="desktop"
        priority
      />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-[2%] left-[6%] w-[38%] min-w-[260px]"
    >
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.tabletColorIntelligence}
        alt="Spectra color intelligence tablet"
        kind="tablet"
      />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 42, rotate: 7 }}
      animate={{ opacity: 1, y: 0, rotate: 7 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-[4%] right-[2%] w-[15%] min-w-[118px]"
    >
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.mobileOwnerExecutive}
        alt="Salon owner mobile executive dashboard"
        kind="phone"
      />
    </motion.div>

    <GlassAiCard
      label="Live AI Layer"
      value="12 active signals"
      detail="Capacity, stock, delays, formulas, and customer moments are being interpreted in real time."
      accent={ACCENTS.gold.accent}
      className="absolute left-[9%] top-[3%] w-[250px] -rotate-2"
    />
    <GlassAiCard
      label="Next Best Action"
      value="+$1,240 today"
      detail="AI found color revenue hidden inside open schedule blocks."
      accent={ACCENTS.sage.accent}
      strong
      className="absolute right-[8%] bottom-[1%] w-[230px] rotate-1"
    />
  </LiveDemoSlide>
);
