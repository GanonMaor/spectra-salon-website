import React from "react";
import { motion } from "framer-motion";
import { ACCENTS } from "../../theme";
import { DeviceFrame, GlassAiCard, LiveDemoSlide, LIVE_DEMO_ASSETS } from "./DeviceFrame";

export const ColorBarIntelligenceDraftSlide: React.FC = () => (
  <LiveDemoSlide
    background={LIVE_DEMO_ASSETS.colorBarScale}
    eyebrow="Spectra Color Bar"
    headline="Color work becomes measurable intelligence."
    takeaway="The color bar captures formulas, product movement, client history, and inventory signals while the stylist is working."
    backgroundPosition="center"
  >
    {/* Left — live color mixing on iPad */}
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="absolute left-[-6%] top-[2%] z-20 w-[55%] min-w-[370px]"
    >
      <img
        src={LIVE_DEMO_ASSETS.colorBarComposition}
        alt="Spectra color bar formula intelligence on iPad with live product scan"
        draggable={false}
        className="h-auto w-full"
        style={{ filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.5))" }}
      />
    </motion.div>

    {/* Right — live inventory on iPad */}
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className="absolute right-[0%] top-[31%] z-20 w-[47%] min-w-[320px]"
    >
      <img
        src={LIVE_DEMO_ASSETS.inventoryComposition}
        alt="Spectra live color inventory on iPad with product stock levels"
        draggable={false}
        className="h-auto w-full"
        style={{ filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.5))" }}
      />
    </motion.div>

    <GlassAiCard
      label="Formula Confidence"
      value="98%"
      detail="AI recommends 2g Spectra Gloss based on client history and desired finish."
      accent={ACCENTS.gold.accent}
      className="absolute left-[-5%] bottom-[9%] z-30 w-[245px]"
    />
    <GlassAiCard
      label="Inventory Signal"
      value="Color 7.21 low"
      detail="Projected runout in 6 days. Generate order before service capacity is affected."
      accent={ACCENTS.copper.accent}
      className="absolute right-[0%] top-[3%] z-30 w-[255px]"
    />
  </LiveDemoSlide>
);
