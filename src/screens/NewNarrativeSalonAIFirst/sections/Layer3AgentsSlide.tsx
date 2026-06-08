import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass, amorphicCard, AGENT_ACCENT, DEFAULT_AGENT_ACCENT } from "../theme";
import { LAYER3 } from "../copy";

export const Layer3AgentsSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["layer-3"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Salon AI Agent Network" scrim="veil" constellation={false}>
      <SlideHeading theme={theme} eyebrow={LAYER3.eyebrow} size="h2" className="mb-3" layer={3}>
        {LAYER3.headline}
      </SlideHeading>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.14 }}
        className="mb-7 max-w-xl text-base font-light"
        style={{ color: INK.soft }}
      >
        {LAYER3.difference}
      </motion.p>

      {/* Agent cards grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {LAYER3.agents.map((agent) => {
          const ac = AGENT_ACCENT[agent.name] ?? DEFAULT_AGENT_ACCENT;
          return (
            <motion.div
              key={agent.name}
              variants={item}
              className="flex flex-col gap-3 p-4"
              style={amorphicCard(ac.accentBorder)}
            >
              {/* Agent name + indicator */}
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: ac.accent, boxShadow: `0 0 8px ${ac.glow}` }}
                />
                <span className="text-sm font-semibold leading-tight" style={{ color: ac.accent }}>
                  {agent.name}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs font-light leading-relaxed" style={{ color: INK.soft }}>
                {agent.detail}
              </p>

              {/* Action chips */}
              <div className="flex flex-wrap gap-1 mt-auto">
                {agent.actions.map((action) => (
                  <span
                    key={action}
                    className="rounded-full px-2 py-0.5 text-[9px] font-medium"
                    style={{ color: ac.accent, background: ac.accentSoft, border: `1px solid ${ac.accentBorder}` }}
                  >
                    {action}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom status badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.65 }}
        className="mt-6 flex items-center gap-3"
      >
        <span
          className="inline-block rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]"
          style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}
        >
          {LAYER3.status}
        </span>
        <span className="text-sm font-light" style={{ color: INK.faint }}>
          Each agent operates as a digital employee, performing work — not just suggesting it.
        </span>
      </motion.div>
    </CinematicSlide>
  );
};
