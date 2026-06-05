import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { RadialDiagram } from "../../SpectraInvestorExperience/visuals/RadialDiagram";
import { DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass } from "../theme";
import { LAYER2 } from "../copy";

export const Layer2OperationsSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const theme = SLIDE_THEME["layer-2"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Layer 2 — operations" scrim="split-right" constellation={false}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <SlideHeading theme={theme} eyebrow={LAYER2.eyebrow} size="h1" className="mb-5" layer={2}>
            {LAYER2.headline}
          </SlideHeading>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
            className="inline-block text-[10px] font-semibold uppercase tracking-[0.16em] px-3 py-1 rounded-full mb-6"
            style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}
          >
            {LAYER2.status}
          </motion.span>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.28 }}
            className="text-lg sm:text-xl font-light max-w-md"
            style={{ color: INK.soft }}
          >
            {LAYER2.closing}
          </motion.p>
        </div>

        {/* Diagram panel — dark glass per theme system */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.25 }}
          className="relative rounded-3xl p-5 sm:p-7"
          style={{
            ...darkGlass(true),
            borderColor: theme.accentBorder,
            boxShadow: `0 16px 56px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.08)`,
          }}
        >
          {/* Subtle accent glow — not a heavy vignette */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `radial-gradient(70% 60% at 50% 50%, ${theme.glow}, transparent 72%)`,
            }}
          />
          <RadialDiagram
            centerLabel={LAYER2.center}
            centerSub={LAYER2.centerSub}
            nodes={LAYER2.modules.map((m) => ({ label: m.label, glyph: m.glyph }))}
            dark
            cinematic
          />
        </motion.div>
      </div>
    </CinematicSlide>
  );
};
