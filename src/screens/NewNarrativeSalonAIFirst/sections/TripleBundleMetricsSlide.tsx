import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, ACCENTS } from "../theme";
import { TRIPLE_BUNDLE } from "../copy";

export const TripleBundleMetricsSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const theme = SLIDE_THEME["triple-bundle"];

  const funnelAccents = [ACCENTS.gold, ACCENTS.copper, ACCENTS.sage];

  return (
    <CinematicSlide theme={theme} ariaLabel="The Triple Bundle" scrim="split-right" constellation={false} fit>
      <div className="flex w-full flex-col gap-4 py-2 lg:gap-6 lg:py-0">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.fast, ease: EASE_OUT }}>
          <SlideHeading theme={theme} eyebrow={TRIPLE_BUNDLE.eyebrow} size="h2" className="mb-1" layer={1}>
            {TRIPLE_BUNDLE.headline}
          </SlideHeading>
          <p className="text-sm font-light leading-6 lg:text-base" style={{ color: INK.soft }}>
            {TRIPLE_BUNDLE.subheadline}
          </p>
        </motion.div>

        {/* ── Main grid: left = offer + funnel, right = financials ────────── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.02fr_0.98fr]">

          {/* ── Left column ──────────────────────────────────────────────────── */}
          <div className="flex flex-col gap-5 rounded-[34px] p-5 lg:p-6"
            style={{
              background: "linear-gradient(135deg, rgba(10,7,5,0.50), rgba(10,7,5,0.24))",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(24px) saturate(145%)",
              WebkitBackdropFilter: "blur(24px) saturate(145%)",
              boxShadow: "0 28px 90px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >

            {/* Bundle offer — open signal row */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.12 }}
              className="py-1"
            >
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: theme.accent }}>
                Bundle Package
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {TRIPLE_BUNDLE.bundle.map((b, i) => (
                  <div
                    key={b.title}
                    className="relative flex min-h-[118px] flex-col justify-between rounded-2xl px-4 py-3.5"
                    style={{
                      background: "rgba(255,255,255,0.055)",
                      border: "1px solid rgba(255,255,255,0.10)",
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 14px ${theme.glow}` }} />
                    <div>
                      <p className="text-sm font-semibold leading-snug" style={{ color: INK.strong }}>{b.title}</p>
                      <p className="mt-1 text-[11px] font-light leading-5" style={{ color: INK.soft }}>{b.detail}</p>
                    </div>
                    {i < TRIPLE_BUNDLE.bundle.length - 1 && (
                      <span className="absolute -right-2 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full text-xs font-light lg:flex" style={{ color: theme.accent, background: "rgba(10,7,5,0.78)", border: `1px solid ${theme.accentBorder}` }}>+</span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Sales funnel — open metric row */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.22 }}
              className="rounded-3xl px-4 py-4"
              style={{ background: "rgba(255,255,255,0.045)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: ACCENTS.gold.accent }}>
                {TRIPLE_BUNDLE.funnelEyebrow}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                {TRIPLE_BUNDLE.funnel.map((step, i) => {
                  const ac = funnelAccents[i] ?? ACCENTS.gold;
                  const isLast = i === TRIPLE_BUNDLE.funnel.length - 1;
                  return (
                    <React.Fragment key={step.step}>
                      <div
                        className="relative flex flex-1 flex-col gap-1.5"
                      >
                        <p className="text-[9px] font-semibold uppercase tracking-[0.2em]" style={{ color: ac.accent }}>
                          {step.step}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[30px] font-light leading-none tabular-nums" style={{ color: INK.strong }}>
                            {step.n}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{ background: ac.accentSoft, color: ac.accent }}
                          >
                            {step.conv}
                          </span>
                        </div>
                        <div>
                          <p className="text-[15px] font-medium tabular-nums" style={{ color: ac.accent }}>{step.cpl}</p>
                          <p className="text-[11px] font-light" style={{ color: INK.soft }}>{step.label}</p>
                        </div>
                      </div>

                      {/* Arrow connector between steps */}
                      {!isLast && (
                        <div className="flex items-center justify-center sm:px-0.5">
                          <svg className="rotate-90 opacity-70 sm:rotate-0" width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M3 8h10M9 4l4 4-4 4" stroke={ac.accent} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.fast, ease: EASE_OUT, delay: reduced ? 0 : 0.3 }}
                  className="rounded-2xl px-5 py-4 text-[14px] font-light leading-6"
              style={{
                color: INK.strong,
                background: "rgba(217,185,129,0.09)",
                border: `1px solid ${ACCENTS.gold.accentBorder}`,
                textShadow: `0 0 16px ${ACCENTS.gold.glow}`,
              }}
            >
              {TRIPLE_BUNDLE.aiUpside}
            </motion.p>
          </div>

          {/* ── Right column — CAC + LTV + summary ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.16 }}
            className="relative flex flex-col gap-4 overflow-hidden rounded-[34px] p-5 lg:p-6"
            style={{
              background: "linear-gradient(135deg, rgba(10,7,5,0.62), rgba(20,14,8,0.36))",
              border: "1px solid rgba(255,255,255,0.14)",
              backdropFilter: "blur(26px) saturate(145%)",
              WebkitBackdropFilter: "blur(26px) saturate(145%)",
              boxShadow: "0 30px 92px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          >
            <div className="pointer-events-none absolute -right-10 top-12 h-52 w-52 rounded-full opacity-30 blur-3xl" style={{ background: ACCENTS.gold.glow }} />
            <div className="pointer-events-none absolute bottom-12 left-0 h-40 w-40 rounded-full opacity-20 blur-3xl" style={{ background: ACCENTS.sage.glow }} />

            {/* CAC Breakdown */}
            <div className="relative">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: ACCENTS.copper.accent }}>
                {TRIPLE_BUNDLE.cacEyebrow}
              </p>
              <div className="space-y-1.5">
                {TRIPLE_BUNDLE.cac.map((line) => (
                  <div key={line.label} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.035)" }}>
                    <span className="text-[13px] font-light" style={{ color: INK.soft }}>{line.label}</span>
                    <span className="text-[15px] font-medium tabular-nums" style={{ color: INK.strong }}>{line.value}</span>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between rounded-2xl px-3 py-3" style={{ background: ACCENTS.copper.accentSoft, border: `1px solid ${ACCENTS.copper.accentBorder}` }}>
                  <span className="text-[14px] font-semibold" style={{ color: INK.strong }}>Total CAC</span>
                  <span className="text-xl font-semibold tabular-nums" style={{ color: ACCENTS.copper.accent }}>({TRIPLE_BUNDLE.cacTotal})</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${ACCENTS.gold.accentBorder}, transparent)` }} />

            {/* LTV Breakdown */}
            <div className="relative">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.24em]" style={{ color: ACCENTS.sage.accent }}>
                {TRIPLE_BUNDLE.ltvEyebrow}
              </p>
              <div className="space-y-1.5">
                {TRIPLE_BUNDLE.ltv.map((row) => (
                  <div key={row.label} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.035)" }}>
                    <span className="text-[13px] font-light" style={{ color: INK.soft }}>
                      {row.label}
                      <span className="ml-1.5 text-[10px]" style={{ color: INK.faint }}>({row.note})</span>
                    </span>
                    <span className="text-[15px] font-medium tabular-nums" style={{ color: INK.strong }}>{row.value}</span>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between rounded-2xl px-3 py-3" style={{ background: ACCENTS.sage.accentSoft, border: `1px solid ${ACCENTS.sage.accentBorder}` }}>
                  <span className="text-[13px] font-semibold" style={{ color: INK.strong }}>3-Year LTV</span>
                  <span className="text-xl font-semibold tabular-nums" style={{ color: ACCENTS.sage.accent }}>{TRIPLE_BUNDLE.ltvTotal}</span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${ACCENTS.gold.accentBorder}, transparent)` }} />

            {/* Summary signal row */}
            <div className="grid grid-cols-2 gap-2 rounded-3xl p-3 sm:grid-cols-4" style={{ background: "rgba(255,255,255,0.055)", border: "1px solid rgba(255,255,255,0.10)" }}>
              {TRIPLE_BUNDLE.summary.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <p
                    className="text-xl font-semibold tabular-nums leading-none"
                    style={{ color: s.highlight ? ACCENTS.gold.accent : INK.strong }}
                  >
                    {s.value}
                  </p>
                  <p className="text-[11px] font-light" style={{ color: s.highlight ? ACCENTS.gold.accent : INK.soft }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Closing */}
            <p className="mt-auto text-[12px] font-light leading-5" style={{ color: INK.soft }}>
              {TRIPLE_BUNDLE.closing}
            </p>
          </motion.div>
        </div>
      </div>
    </CinematicSlide>
  );
};
