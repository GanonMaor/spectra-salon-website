import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IntelligenceCore } from "../../SpectraInvestorExperience/visuals/IntelligenceCore";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, AGENT_ACCENT, DEFAULT_AGENT_ACCENT } from "../theme";
import { LAYER3 } from "../copy";

const SHORT = ["Assistant", "Inventory", "Scheduling", "Performance", "Growth"];

export const Layer3AgentsSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["layer-3"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Layer 3 — autonomous AI agents" scrim="veil" constellation={false}>
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
        {/* Left — orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.2 }}
          className="order-2 lg:order-1"
        >
          <IntelligenceCore centerName={LAYER3.center} centerRole={LAYER3.centerRole} nodes={SHORT} dark />
        </motion.div>

        {/* Right — agents */}
        <div className="order-1 lg:order-2">
          <SlideHeading theme={theme} eyebrow={LAYER3.eyebrow} size="h2" className="mb-5" layer={3}>
            {LAYER3.headline}
          </SlideHeading>

          <motion.div className="space-y-2 mb-6" variants={stagger} initial="hidden" animate="visible">
            {LAYER3.agents.map((a) => {
              const ac = AGENT_ACCENT[a.name] ?? DEFAULT_AGENT_ACCENT;
              return (
                <motion.div key={a.name} variants={item} className="flex items-baseline gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 self-center"
                    style={{ background: ac.accent, boxShadow: `0 0 8px ${ac.glow}` }}
                  />
                  <span className="text-sm font-medium w-36 shrink-0" style={{ color: ac.accent }}>
                    {a.name}
                  </span>
                  <span className="text-sm font-light" style={{ color: INK.soft }}>
                    {a.detail}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.6 }}
            className="rounded-2xl p-5"
            style={{ background: theme.accentSoft, border: `1px solid ${theme.accentBorder}` }}
          >
            <p className="text-base font-light leading-relaxed" style={{ color: INK.strong }}>
              {LAYER3.difference}
            </p>
          </motion.div>
        </div>
      </div>
    </CinematicSlide>
  );
};
