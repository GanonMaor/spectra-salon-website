import React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK, ACCENTS } from "../theme";
import { THREE_LAYERS } from "../copy";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STATUS_COLOR: Record<string, string> = {
  "Live & Growing": "#A6C0A0",
  "Built — Testing": "#D9B981",
  "September 2026": "#C6A8CE",
  "January 2027": "#E0996A",
};

const LAYER_ACCENTS = [ACCENTS.sky, ACCENTS.sage, ACCENTS.copper, ACCENTS.gold];

export const ThreeLayersSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["three-layers"];

  const [activeIdx, setActiveIdx] = React.useState(0);
  const activeLayer = THREE_LAYERS.layers[activeIdx];
  const activeAccent = LAYER_ACCENTS[activeIdx] ?? ACCENTS.gold;

  return (
    <CinematicSlide theme={theme} ariaLabel="One platform. Four compounding layers." scrim="veil" fit>
      <div className="flex h-full w-full max-w-6xl flex-col justify-center">

        <SlideHeading theme={theme} eyebrow={THREE_LAYERS.eyebrow} size="h1" className="mb-7 max-w-4xl">
          {THREE_LAYERS.headline}
        </SlideHeading>

        <div
          className="grid gap-4 rounded-[32px] p-3 lg:grid-cols-[0.9fr_1.25fr] lg:items-stretch lg:gap-5 lg:p-4"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.13)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 30px 90px rgba(0,0,0,0.14)",
          }}
        >

          {/* ── Left: compact layer selector ──────────────────────────────── */}
          <div className="flex flex-col">
            <motion.div className="flex flex-col gap-2" variants={stagger} initial="hidden" animate="visible">
              {THREE_LAYERS.layers.map((layer, i) => {
                const accent = LAYER_ACCENTS[i] ?? ACCENTS.gold;
                const isActive = activeIdx === i;

                return (
                  <motion.button
                    key={layer.num}
                    type="button"
                    variants={item}
                    onMouseEnter={() => setActiveIdx(i)}
                    onFocus={() => setActiveIdx(i)}
                    onClick={() => setActiveIdx(i)}
                    className="group relative flex items-start gap-4 rounded-[22px] px-5 py-4 text-left transition-all duration-300"
                    style={{
                      background: isActive
                      ? `linear-gradient(135deg, rgba(8,5,3,0.82), ${accent.accentSoft})`
                      : "rgba(255,255,255,0.08)",
                    border: `1px solid ${isActive ? "rgba(255,255,255,0.24)" : "rgba(255,255,255,0.14)"}`,
                      boxShadow: isActive ? "0 16px 46px rgba(0,0,0,0.22)" : "none",
                      backdropFilter: "blur(22px)",
                      WebkitBackdropFilter: "blur(22px)",
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      className="mt-1.5 h-[42px] w-0.5 shrink-0 rounded-full transition-all duration-300"
                      style={{
                      background: isActive
                        ? `linear-gradient(180deg, ${accent.accent}, transparent)`
                        : "rgba(255,255,255,0.12)",
                      }}
                    />

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors duration-300"
                          style={{ color: isActive ? accent.accent : "rgba(251,246,239,0.55)" }}
                        >
                          {layer.num}
                        </span>
                        <span
                          className="text-base font-light tracking-[-0.02em] transition-colors duration-300 sm:text-lg"
                          style={{ color: isActive ? INK.strong : "rgba(251,246,239,0.92)" }}
                        >
                          {layer.title}
                        </span>
                      </div>
                      <p
                        className="mt-1 text-[13px] font-light leading-5 transition-colors duration-300"
                        style={{ color: isActive ? INK.faint : "rgba(251,246,239,0.65)" }}
                      >
                        {layer.detail}
                      </p>
                    </div>

                    <span
                      className="mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] transition-all duration-300"
                      style={{
                        color: STATUS_COLOR[layer.status] ?? accent.accent,
                        border: `1px solid ${isActive ? accent.accentBorder : "rgba(255,255,255,0.10)"}`,
                        background: "rgba(12,9,7,0.32)",
                        opacity: isActive ? 1 : 0.88,
                      }}
                    >
                      {layer.status}
                    </span>

                    {/* Mobile reveal (inline, below row) */}
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          key="mobile-reveal"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                          className="absolute left-5 right-5 top-full z-10 overflow-hidden lg:hidden"
                          style={{ marginTop: 4 }}
                        >
                          <div
                            className="rounded-2xl p-4"
                            style={{
                              background: "rgba(10,7,5,0.82)",
                              border: `1px solid ${accent.accentBorder}`,
                              backdropFilter: "blur(24px)",
                              WebkitBackdropFilter: "blur(24px)",
                            }}
                          >
                            <RevealContent layer={activeLayer} accent={activeAccent} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Closing line */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.75 }}
              className="mt-5 flex items-center gap-3 px-2"
            >
              <span className="h-px w-6 shrink-0" style={{ background: theme.accentBorder }} />
              <p className="text-[11px] font-light uppercase tracking-[0.18em]" style={{ color: INK.faint }}>
                {THREE_LAYERS.closing}
              </p>
            </motion.div>
          </div>

          {/* ── Right: reveal panel (desktop only) ────────────────────────── */}
          <div className="relative hidden lg:flex lg:items-stretch">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, x: 24, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -12, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: EASE }}
              className="w-full rounded-[28px] p-8"
              style={{
                background: `linear-gradient(150deg, rgba(34,27,22,0.58) 0%, ${activeAccent.accentSoft} 54%, rgba(255,255,255,0.12) 100%)`,
                border: `1px solid ${activeAccent.accentBorder}`,
                boxShadow: `0 32px 80px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.16)`,
                backdropFilter: "blur(32px) saturate(150%)",
                WebkitBackdropFilter: "blur(32px) saturate(150%)",
                minHeight: "430px",
              }}
            >
              {/* Top glow */}
              <div
                className="absolute inset-x-0 top-0 h-px rounded-t-[28px]"
                style={{
                  background: `linear-gradient(90deg, transparent 10%, ${activeAccent.accent} 50%, transparent 90%)`,
                }}
              />
              {/* Corner glow */}
              <div
                className="absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-50 blur-3xl pointer-events-none"
                style={{ background: activeAccent.glow }}
              />

              <div className="relative flex h-full flex-col">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.26em]" style={{ color: activeAccent.accent }}>
                      {activeLayer.num}
                    </p>
                    <h3 className="mt-2 text-2xl font-light leading-tight tracking-[-0.03em] sm:text-3xl" style={{ color: INK.strong }}>
                      {activeLayer.title}
                    </h3>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em]"
                    style={{
                      color: STATUS_COLOR[activeLayer.status] ?? activeAccent.accent,
                      border: `1px solid ${activeAccent.accentBorder}`,
                      background: "rgba(12,9,7,0.28)",
                    }}
                  >
                    {activeLayer.status}
                  </span>
                </div>

                <RevealContent layer={activeLayer} accent={activeAccent} />

                {/* Milestones */}
                <div className="mt-auto pt-6">
                  <div className="mb-4 h-px w-full" style={{ background: "rgba(255,255,255,0.09)" }} />
                  <div className="flex flex-wrap gap-3">
                    {activeLayer.milestones.map((m) => (
                      <div key={m} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: activeAccent.accent }} />
                        <span className="text-[11px] font-light uppercase tracking-[0.14em]" style={{ color: INK.faint }}>
                          {m}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          </div>
        </div>
      </div>
    </CinematicSlide>
  );
};

/* ─── Shared reveal content (used in both desktop panel and mobile inline) ─── */
interface RevealContentProps {
  layer: typeof THREE_LAYERS.layers[number];
  accent: typeof ACCENTS.gold;
}

const RevealContent: React.FC<RevealContentProps> = ({ layer, accent }) => (
  <div className="space-y-4">
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent.accent }}>
        Pain solved
      </p>
      <p className="text-sm font-light leading-6" style={{ color: INK.soft }}>
        {layer.pain}
      </p>
    </div>
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent.accent }}>
        What it does
      </p>
      <p className="text-sm font-light leading-6" style={{ color: INK.soft }}>
        {layer.whatItDoes}
      </p>
    </div>
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent.accent }}>
        How it works
      </p>
      <p className="text-sm font-light leading-6" style={{ color: INK.soft }}>
        {layer.howItWorks}
      </p>
    </div>
    <div>
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: accent.accent }}>
        Why it matters
      </p>
      <p className="text-sm font-light leading-6" style={{ color: INK.soft }}>
        {layer.whyItMatters}
      </p>
    </div>
  </div>
);
