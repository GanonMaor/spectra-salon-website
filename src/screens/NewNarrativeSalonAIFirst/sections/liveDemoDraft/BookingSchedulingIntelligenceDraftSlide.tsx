import React from "react";
import { motion } from "framer-motion";
import { ACCENTS } from "../../theme";
import { DeviceFrame, GlassAiCard, LiveDemoSlide, LIVE_DEMO_ASSETS } from "./DeviceFrame";

export const BookingSchedulingIntelligenceDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.heroReception}
    eyebrow="Booking Intelligence"
    headline="The schedule becomes a revenue engine."
    takeaway="Salon AI reads the live calendar, understands staff capacity, and recommends the next best action before gaps become lost revenue."
    backgroundPosition="center"
  >
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 6 }}
      animate={{ opacity: 1, y: 0, rotateX: 3 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-[4%] top-[11%] w-[74%]"
    >
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.desktopMarketplaceSchedule}
        alt="Salon AI booking and scheduling intelligence desktop"
        kind="desktop"
        priority
      />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, x: 40, rotate: 8 }}
      animate={{ opacity: 1, x: 0, rotate: 8 }}
      transition={{ duration: 0.8, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
      className="absolute bottom-[5%] right-[8%] w-[19%] min-w-[132px]"
    >
      <DeviceFrame
        src={LIVE_DEMO_ASSETS.mobileSmartScheduling}
        alt="Smart scheduling mobile command"
        kind="phone"
      />
    </motion.div>

    <GlassAiCard
      label="Capacity Signal"
      value="81 open minutes"
      detail="AI maps gaps by stylist, skill, and client fit."
      accent={ACCENTS.sky.accent}
      className="absolute right-[-2%] top-[5%] w-[235px] rotate-2"
    />
    <GlassAiCard
      label="Action"
      value="Fill 14:30 slot"
      detail="Offer toner follow-up to Sarah M. with highest acceptance probability."
      accent={ACCENTS.rose.accent}
      className="absolute left-[-3%] bottom-[16%] w-[265px] -rotate-1"
    />
  </LiveDemoSlide>
);
