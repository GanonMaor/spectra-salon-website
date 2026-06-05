import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Glyph, GlyphName } from "../../SpectraInvestorExperience/visuals/Glyph";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide } from "./CinematicSlide";
import { SLIDE_THEME, INK, darkGlass, AGENT_ACCENT, DEFAULT_AGENT_ACCENT } from "../theme";
import { OPENING } from "../copy";

const AGENT_GLYPHS: GlyphName[] = ["ai", "inventory", "calendar", "profit", "retention"];

const PLATFORM_LAYERS = [
  { label: "Cost Optimization", num: "01" },
  { label: "Booking & POS", num: "02" },
  { label: "Autonomous AI Agents", num: "03" },
];

export const SalonAIOpeningSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;
  const theme = SLIDE_THEME["salon-ai"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Salon AI" scrim="left">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">

        {/* ── Left: Headline + Platform layers + Message ── */}
        <div>
          {/* Eyebrow */}
          <motion.div
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="text-[11px] font-semibold uppercase tracking-[0.3em] mb-5"
            style={{ color: theme.accent }}
          >
            Spectra
          </motion.div>

          {/* Hero headline */}
          <motion.h1
            variants={reveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.06 }}
            className="font-light leading-[0.9] tracking-[-0.03em] mb-8"
            style={{ fontSize: "clamp(3.5rem, 8.5vw, 7rem)", color: INK.strong, textShadow: "0 2px 32px rgba(0,0,0,0.55)" }}
          >
            {OPENING.headline}
          </motion.h1>

          {/* Platform layer chips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
            className="flex flex-col gap-2 mb-8"
          >
            {PLATFORM_LAYERS.map((layer, i) => (
              <motion.div
                key={layer.num}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.22 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <span
                  className="text-[10px] font-semibold tabular-nums"
                  style={{ color: theme.accent, opacity: 0.7 }}
                >
                  {layer.num}
                </span>
                <span
                  className="h-px flex-1 max-w-[24px]"
                  style={{ background: theme.accentBorder }}
                />
                <span className="text-sm font-light tracking-wide" style={{ color: INK.soft }}>
                  {layer.label}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Message lines */}
          <div className="space-y-1.5">
            {OPENING.lines.map((line, i) => (
              <motion.p
                key={line}
                variants={reveal}
                initial="hidden"
                animate="visible"
                transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.46 + i * 0.08 }}
                className="text-sm sm:text-base font-light"
                style={{ color: INK.faint }}
              >
                {line}
              </motion.p>
            ))}
          </div>
        </div>

        {/* ── Right: Agent suite — "Sony AI" product lineup ── */}
        <div className="flex flex-col gap-2">
          {/* Suite header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.fast, ease: EASE_OUT, delay: reduced ? 0 : 0.3 }}
            className="flex items-center justify-between mb-1 px-1"
          >
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: theme.accent }}>
              AI Agent Suite
            </span>
            <span className="text-[10px] font-light" style={{ color: INK.faint }}>
              5 agents
            </span>
          </motion.div>

          {OPENING.agents.map((agent, i) => {
            const ac = AGENT_ACCENT[agent] ?? DEFAULT_AGENT_ACCENT;
            const isFirst = i === 0;
            return (
              <motion.div
                key={agent}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.36 + i * 0.09 }}
                className="relative rounded-2xl overflow-hidden flex items-center gap-0"
                style={{
                  ...darkGlass(isFirst),
                  border: "none",
                  boxShadow: isFirst
                    ? `0 0 0 1px ${ac.accentBorder}, 0 12px 48px rgba(0,0,0,0.34), 0 0 32px ${ac.glow}`
                    : `0 0 0 1px rgba(255,255,255,0.10), 0 8px 32px rgba(0,0,0,0.28)`,
                }}
              >
                {/* Color accent strip on left */}
                <div
                  className="self-stretch w-1 shrink-0 rounded-l-2xl"
                  style={{ background: `linear-gradient(180deg, ${ac.accent}, ${ac.accentDeep})` }}
                />

                {/* Icon */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mx-3 my-3"
                  style={{ background: ac.accentSoft }}
                >
                  <Glyph name={AGENT_GLYPHS[i % AGENT_GLYPHS.length]} size={15} color={ac.accent} />
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0 py-3 pr-4">
                  <span className="text-sm font-medium block leading-tight" style={{ color: INK.strong }}>
                    {agent}
                  </span>
                </div>

                {/* Badge for first (Personal Assistant) */}
                {isFirst && (
                  <span
                    className="mr-3 shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                    style={{
                      color: ac.accent,
                      background: ac.accentSoft,
                      border: `1px solid ${ac.accentBorder}`,
                    }}
                  >
                    Core
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

      </div>
    </CinematicSlide>
  );
};
