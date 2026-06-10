import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide } from "./CinematicSlide";
import { SLIDE_THEME, INK } from "../theme";
import { RAISE } from "../copy";

export const WhyRaiseSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["why-raise"];

  return (
    <CinematicSlide theme={theme} ariaLabel="Open SAFE allocation" scrim="veil" constellation={false} darkOverlay fit>
      <div className="grid h-full grid-cols-1 items-center gap-8 lg:grid-cols-[0.98fr_1.02fr] lg:gap-10">
        {/* Left — ask and outcome */}
        <div
          className="max-w-2xl rounded-[34px] p-6 lg:p-7"
          style={{
            background: "linear-gradient(135deg, rgba(10,7,5,0.38), rgba(10,7,5,0.18))",
            border: "1px solid rgba(255,255,255,0.075)",
            boxShadow: "0 24px 72px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.055)",
            backdropFilter: "blur(18px) saturate(132%)",
            WebkitBackdropFilter: "blur(18px) saturate(132%)",
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.fast, ease: EASE_OUT }}
            className="flex items-center gap-2 mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.26em]" style={{ color: theme.accent }}>
              {RAISE.eyebrow}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.1 }}
            className="mb-5"
          >
            <div
              className="text-6xl font-light tracking-[-0.04em] sm:text-7xl"
              style={{ color: theme.accent, textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
            >
              {RAISE.amount}
            </div>
            <div className="mt-2 max-w-lg text-sm font-light leading-relaxed sm:text-base" style={{ color: INK.soft }}>
              {RAISE.amountSub}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.2 }}
            className="mb-6 text-3xl font-light leading-[1.02] tracking-[-0.04em] sm:text-4xl lg:text-[2.65rem]"
            style={{ color: INK.strong, textShadow: "0 2px 28px rgba(0,0,0,0.45)" }}
          >
            {RAISE.headline}
          </motion.div>

          <motion.div
            className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {RAISE.points.map((p) => (
              <motion.div
                key={p.title}
                variants={item}
                className="relative rounded-2xl px-4 py-4"
                style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.075)" }}
              >
                <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.14em]" style={{ color: theme.accent }}>
                  {p.status}
                </div>
                <div className="text-lg font-light tracking-[-0.03em]" style={{ color: INK.strong }}>
                  {p.title}
                </div>
                <div className="mt-2 text-[11px] font-light leading-relaxed" style={{ color: INK.soft }}>
                  {p.detail}
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.58 }}
            className="rounded-2xl px-5 py-4"
            style={{ background: "rgba(217,185,129,0.075)", border: "1px solid rgba(217,185,129,0.24)" }}
          >
            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: theme.accent }}>
              Use Of Funds
            </div>
            <p className="text-sm font-light leading-relaxed" style={{ color: INK.soft }}>
              {RAISE.growthNote}
            </p>
          </motion.div>
        </div>

        {/* Right — budget allocation */}
        <motion.div
          className="relative overflow-hidden rounded-[34px] p-6 lg:p-7"
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{
            background: "linear-gradient(135deg, rgba(10,7,5,0.34), rgba(10,7,5,0.16))",
            border: "1px solid rgba(255,255,255,0.075)",
            boxShadow: "0 24px 72px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.055)",
            backdropFilter: "blur(18px) saturate(132%)",
            WebkitBackdropFilter: "blur(18px) saturate(132%)",
          }}
        >
          <div className="pointer-events-none absolute -right-10 top-8 h-56 w-56 rounded-full opacity-30 blur-3xl" style={{ background: theme.glow }} />
          <div className="mb-6 flex items-start justify-between gap-6">
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
                {RAISE.budgetTitle}
              </div>
              <div className="text-3xl font-light tracking-[-0.04em]" style={{ color: INK.strong }}>
                Next 12 Months
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-light tabular-nums" style={{ color: theme.accent }}>
                $480K
              </div>
              <div className="text-[10px] uppercase tracking-[0.16em]" style={{ color: INK.soft }}>
                funded plan
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {RAISE.budget.map((budgetItem) => (
              <motion.div
                key={budgetItem.label}
                variants={item}
                className="rounded-2xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="mb-2 flex items-baseline justify-between gap-4">
                  <span className="text-sm font-medium" style={{ color: INK.strong }}>
                    {budgetItem.label}
                  </span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: theme.accent }}>
                    {budgetItem.percent}% · {budgetItem.amount}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.09)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${budgetItem.percent}%`, background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}99)` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={item} className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: theme.accent }}>
                Today
              </div>
              <div className="mt-2 text-2xl font-light tracking-[-0.04em]" style={{ color: INK.strong }}>
                $130K ARR
              </div>
            </div>
            <div className="rounded-2xl px-4 py-4" style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: theme.accent }}>
                12-Month Target
              </div>
              <div className="mt-2 text-2xl font-light tracking-[-0.04em]" style={{ color: INK.strong }}>
                $1.12M ARR
              </div>
              <div className="mt-1 text-xs font-light" style={{ color: INK.soft }}>
                562 subscriptions
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </CinematicSlide>
  );
};
