import React from "react";
import { motion } from "framer-motion";
import { ACCENTS } from "../../theme";
import { DeviceFrame, GlassAiCard, LiveDemoSlide, LIVE_DEMO_ASSETS } from "./DeviceFrame";

export const MobileAgentSuiteDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.productShelves}
    eyebrow="Mobile AI Agents"
    headline="The AI team lives in everyone's hand."
    takeaway="Owners, staff, and clients each see a different surface, powered by the same salon intelligence underneath."
    backgroundPosition="center"
  >
    <motion.div
      initial={{ opacity: 0, y: 36, rotate: -8 }}
      animate={{ opacity: 1, y: 0, rotate: -8 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-[14%] top-[12%] w-[22%] min-w-[150px]"
    >
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.mobileOwnerExecutive}
        alt="Owner executive dashboard on mobile"
        kind="phone"
        priority
      />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-[39%] top-[4%] w-[24%] min-w-[165px]"
    >
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.mobileAiTeam}
        alt="AI team mobile interface"
        kind="phone"
      />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 36, rotate: 8 }}
      animate={{ opacity: 1, y: 0, rotate: 8 }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-[10%] top-[13%] w-[22%] min-w-[150px]"
    >
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.mobileInventoryAgent}
        alt="Inventory agent mobile alert"
        kind="phone"
      />
    </motion.div>

    <GlassAiCard
      label="Owner"
      value="Pulse, alerts, revenue"
      detail="The business view: what changed, why it matters, and what to do next."
      accent={ACCENTS.gold.accent}
      className="absolute left-[-3%] bottom-[20%] w-[245px] -rotate-2"
    />
    <GlassAiCard
      label="Staff"
      value="Next client, formula, timing"
      detail="The work view: service context and live guidance at the station."
      accent={ACCENTS.sage.accent}
      className="absolute left-[37%] bottom-[1%] w-[245px] rotate-1"
    />
    <GlassAiCard
      label="Client"
      value="Booking, updates, retention"
      detail="The experience view: timely communication before and after every visit."
      accent={ACCENTS.rose.accent}
      className="absolute right-[-2%] bottom-[24%] w-[245px] rotate-2"
    />
  </LiveDemoSlide>
);
