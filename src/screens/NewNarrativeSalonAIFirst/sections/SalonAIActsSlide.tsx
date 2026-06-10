import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, AGENT_ACCENT, DEFAULT_AGENT_ACCENT } from "../theme";
import { SALON_AI_ACTS } from "../copy";

/**
 * Merged slide: "Salon AI Agent Network" + "Traditional AI vs Salon AI"
 *
 * One cinematic statement that shows WHAT the shift is (the contrast) and
 * WHO does the work (the 5 role-based agents) in a single, inevitable frame.
 */
export const SalonAIActsSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const theme = SLIDE_THEME["salon-ai-acts"];
  const pulseTransition = {
    duration: 3.2,
    repeat: reduced ? 0 : Infinity,
    repeatType: "mirror" as const,
    ease: EASE_OUT,
  };

  return (
    <CinematicSlide
      theme={theme}
      ariaLabel="Salon AI Agent Network — Software That Runs the Salon"
      scrim="veil"
      constellation={false}
      fit
      darkOverlay
    >
      <div className="grid h-full min-h-0 items-center gap-12 lg:grid-cols-[0.86fr_1.14fr]">
        {/* ── Narrative Column ── */}
        <div className="min-w-0">
          <SlideHeading
            theme={theme}
            eyebrow={SALON_AI_ACTS.eyebrow}
            size="h2"
            className="mb-4"
            layer={4}
          >
            {SALON_AI_ACTS.headline}
          </SlideHeading>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.12 }}
            className="mb-6 max-w-xl text-base font-light leading-relaxed"
            style={{ color: INK.soft }}
          >
            {SALON_AI_ACTS.subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.2 }}
            className="mb-7 flex max-w-xl flex-wrap gap-x-8 gap-y-4 border-y py-5"
            style={{ borderColor: "rgba(217,185,129,0.18)" }}
          >
            {SALON_AI_ACTS.salonAi.map((line, i) => (
              <div key={line} className="min-w-[130px]">
                <div className="mb-1 text-[10px] font-semibold tabular-nums" style={{ color: theme.accent }}>
                  0{i + 1}
                </div>
                <div className="text-sm font-light leading-snug" style={{ color: INK.strong }}>
                  {line}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.62 }}
            className="flex flex-wrap items-center gap-3"
          >
            <p className="text-xl sm:text-2xl font-light leading-tight" style={{ color: theme.accent, textShadow: `0 0 20px ${theme.glow}` }}>
              {SALON_AI_ACTS.closing}
            </p>
          </motion.div>
        </div>

        {/* ── Mobile agent list (< lg) ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:hidden"
        >
          {SALON_AI_ACTS.agents.map((agent) => {
            const ac = AGENT_ACCENT[agent.name] ?? DEFAULT_AGENT_ACCENT;
            return (
              <div
                key={agent.name}
                className="flex items-start gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(255,255,255,0.055)",
                  border: `1px solid ${ac.accentBorder}`,
                }}
              >
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: ac.accent, boxShadow: `0 0 12px ${ac.glow}` }} />
                <div className="min-w-0">
                  <p className="text-sm font-light leading-snug" style={{ color: INK.strong }}>{agent.name}</p>
                  <p className="mt-0.5 text-[10px] font-light leading-relaxed" style={{ color: INK.faint }}>{agent.actions[0]}</p>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* ── Desktop radial diagram (lg+) ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE_OUT, delay: reduced ? 0 : 0.16 }}
          className="relative hidden h-[520px] lg:block"
        >
          <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35" style={{ border: `1px solid ${theme.accentBorder}` }} />
          <div className="absolute left-1/2 top-1/2 h-[290px] w-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25" style={{ border: "1px solid rgba(255,255,255,0.18)" }} />

          <motion.div
            animate={{ scale: reduced ? 1 : [1, 1.05, 1], opacity: reduced ? 0.58 : [0.42, 0.70, 0.42] }}
            transition={pulseTransition}
            className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: `radial-gradient(circle, ${theme.glow}, transparent 68%)` }}
          />

          <div className="absolute left-1/2 top-1/2 z-10 flex h-40 w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center"
            style={{
              background: "radial-gradient(circle at 50% 38%, rgba(217,185,129,0.34), rgba(16,11,7,0.78) 68%)",
              border: `1px solid ${theme.accentBorder}`,
              boxShadow: `0 0 64px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.14)`,
            }}
          >
            <motion.span
              animate={{ opacity: reduced ? 1 : [0.62, 1, 0.62] }}
              transition={pulseTransition}
              className="mb-3 h-2 w-2 rounded-full"
              style={{ background: theme.accent, boxShadow: `0 0 16px ${theme.glow}` }}
            />
            <span className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: theme.accent }}>
              Salon AI
            </span>
            <span className="mt-2 max-w-[120px] text-2xl font-light leading-none" style={{ color: INK.strong }}>
              Live Control
            </span>
          </div>

          <motion.div variants={stagger} initial="hidden" animate="visible" className="relative z-20 h-full">
            {SALON_AI_ACTS.agents.map((agent, i) => {
              const ac = AGENT_ACCENT[agent.name] ?? DEFAULT_AGENT_ACCENT;
              const nodes = [
                { x: "13%", y: "24%", align: "left" },
                { x: "78%", y: "18%", align: "right" },
                { x: "14%", y: "70%", align: "left" },
                { x: "78%", y: "72%", align: "right" },
                { x: "50%", y: "10%", align: "center" },
              ];
              const node = nodes[i];
              return (
                <motion.div
                  key={agent.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.24 + i * 0.08 }}
                  className="absolute w-[210px]"
                  style={{
                    left: node.x,
                    top: node.y,
                    transform: node.align === "center" ? "translateX(-50%)" : undefined,
                    textAlign: node.align as React.CSSProperties["textAlign"],
                  }}
                >
                  <div className={`mb-3 flex items-center gap-2 ${node.align === "right" ? "justify-end" : node.align === "center" ? "justify-center" : ""}`}>
                    <span className="h-2 w-2 rounded-full" style={{ background: ac.accent, boxShadow: `0 0 14px ${ac.glow}` }} />
                    <span className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: ac.accent }}>
                      executing
                    </span>
                  </div>
                  <div className="text-lg font-light leading-tight" style={{ color: INK.strong, textShadow: "0 2px 18px rgba(0,0,0,0.45)" }}>
                    {agent.name}
                  </div>
                  <div className="mt-2 text-xs font-light leading-relaxed" style={{ color: INK.faint }}>
                    {agent.actions[0]} · {agent.actions[1]}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </CinematicSlide>
  );
};
