import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { FloatingAICard } from "../../visuals/demo/FloatingAICard";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../visuals/demo/motion";
import { DEMO } from "../../copy";
import { GlyphName } from "../../visuals/Glyph";

const CARD_GLYPHS: GlyphName[] = ["calendar", "bowl", "inventory", "ai"];

export const MeetSalonAISlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;

  return (
    <section
      className="relative w-full h-full overflow-hidden flex items-center"
      style={{ background: INV.bgDeep }}
      aria-label="Meet Salon AI"
    >
      {/* Background photo */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(180deg,rgba(18,14,11,0.52) 0%,rgba(18,14,11,0.30) 40%,rgba(18,14,11,0.78) 100%), linear-gradient(100deg,rgba(18,14,11,0.88) 0%,rgba(18,14,11,0.52) 48%,rgba(18,14,11,0.08) 100%), url('/investor-vision/salon-os/hero-salon-ai.png')",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left — headline */}
        <div>
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-6"
            style={{ color: INV.gold }}
          >
            {DEMO.meet.eyebrow}
          </motion.div>

          <motion.h1
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
            className="font-light leading-[0.95] tracking-[-0.03em] mb-6"
            style={{ fontSize: "clamp(3.5rem, 8vw, 6.5rem)", color: INV.textOnDark, textShadow: "0 2px 24px rgba(0,0,0,0.45)" }}
          >
            {DEMO.meet.headline}
          </motion.h1>

          <motion.p
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
            className="text-xl sm:text-2xl font-light leading-snug"
            style={{ color: "rgba(251,246,239,0.85)", textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
          >
            {DEMO.meet.subhead}
          </motion.p>
        </div>

        {/* Right — floating AI capability cards */}
        <div className="flex flex-col gap-3 max-w-xs">
          {DEMO.meet.cards.map((label, i) => (
            <FloatingAICard
              key={label}
              label={label}
              glyph={CARD_GLYPHS[i % CARD_GLYPHS.length]}
              delay={reduced ? 0 : 0.3 + i * 0.12}
              dark
            />
          ))}
        </div>
      </div>
    </section>
  );
};
