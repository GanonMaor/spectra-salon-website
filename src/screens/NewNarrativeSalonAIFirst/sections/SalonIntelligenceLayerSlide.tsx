import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, ACCENTS, INK } from "../theme";
import { INTELLIGENCE_LAYER } from "../copy";

// Layer-specific color tokens
const SKY    = ACCENTS.sky;    // Cost Optimization   — dusty blue
const SAGE   = ACCENTS.sage;   // Booking Intelligence — sage green
const COPPER = ACCENTS.copper; // Intelligence Engine  — copper

// ─── Animated data-stream column ─────────────────────────────────────────────
const DataStream: React.FC<{
  direction: "right" | "left";
  accent: string;
  glow: string;
}> = ({ direction, accent, glow }) => {
  const toRight = direction === "right";
  const rows = [-14, -7, 0, 7, 14];

  return (
    <div
      className="hidden lg:flex items-center justify-center shrink-0"
      style={{ width: 88 }}
    >
      <svg width={88} height={88} viewBox="0 0 88 88" overflow="visible">
        <defs>
          <linearGradient
            id={`ds-${direction}`}
            x1={toRight ? "0" : "1"} y1="0"
            x2={toRight ? "1" : "0"} y2="0"
          >
            <stop offset="0%"   stopColor={accent} stopOpacity="0.04" />
            <stop offset="55%"  stopColor={accent} stopOpacity="0.6" />
            <stop offset="100%" stopColor={accent} stopOpacity="1" />
          </linearGradient>
          <filter id={`ds-glow-${direction}`}>
            <feGaussianBlur stdDeviation="2" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {rows.map((dy) => (
          <line key={dy}
            x1={0} y1={44 + dy} x2={88} y2={44 + dy}
            stroke={accent} strokeWidth="0.4" strokeOpacity="0.12" strokeDasharray="4 9"
          />
        ))}

        {toRight ? (
          <path d="M 4 44 H 72 M 62 36 L 76 44 L 62 52"
            stroke={`url(#ds-${direction})`} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" fill="none"
            filter={`url(#ds-glow-${direction})`}
          />
        ) : (
          <path d="M 84 44 H 16 M 26 36 L 12 44 L 26 52"
            stroke={`url(#ds-${direction})`} strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" fill="none"
            filter={`url(#ds-glow-${direction})`}
          />
        )}

        {rows.map((dy, i) => (
          <circle key={dy} r={i % 2 === 0 ? 2.4 : 1.6} fill={accent}
            filter={`url(#ds-glow-${direction})`}
          >
            <animate attributeName="cx"
              from={toRight ? "-6" : "94"} to={toRight ? "94" : "-6"}
              dur={`${1.3 + i * 0.25}s`} begin={`${i * 0.22}s`} repeatCount="indefinite" />
            <animate attributeName="cy" values={`${44 + dy}`} dur="1s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;1;1;0"
              dur={`${1.3 + i * 0.25}s`} begin={`${i * 0.22}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>
    </div>
  );
};

// ─── AI Processor SVG — multicolor, space-grade ───────────────────────────────
const AIProcessorCore: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const CX = 150, CY = 150;
  const R1 = 52, R2 = 88, R3 = 124;
  const half = 42;
  const pinPads = [-18, -9, 0, 9, 18];
  const spokeAngles = [30, 90, 150, 210, 270, 330];

  return (
    <div className="relative flex items-center justify-center mx-auto" style={{ width: 300, height: 300 }}>
      {/* Tricolor nebula glow — blue left, green right, copper center */}
      <motion.div
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: -80,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 55% 55% at 25% 50%, ${SKY.glow} 0%, transparent 65%),
            radial-gradient(ellipse 55% 55% at 75% 50%, ${SAGE.glow} 0%, transparent 65%),
            radial-gradient(ellipse 50% 50% at 50% 50%, ${COPPER.glow} 0%, transparent 60%)
          `,
        }}
      />

      <svg width={300} height={300} viewBox="0 0 300 300" style={{ overflow: "visible" }}>
        <defs>
          {/* Per-ring glow filters */}
          <filter id="gf-sky">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="gf-sage">
            <feGaussianBlur stdDeviation="3.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="gf-copper">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="chip-glow">
            <feGaussianBlur stdDeviation="9" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="core-glow">
            <feGaussianBlur stdDeviation="14" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Scan line gradient — copper */}
          <linearGradient id="scan-il" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={COPPER.accent} stopOpacity="0" />
            <stop offset="50%"  stopColor={COPPER.accent} stopOpacity="0.9" />
            <stop offset="100%" stopColor={COPPER.accent} stopOpacity="0" />
          </linearGradient>

          {/* Ring gradients (stroke) — sky outer, sage middle, copper inner */}
          <linearGradient id="ring-outer" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor={SKY.accent} />
            <stop offset="100%" stopColor={SKY.accentDeep} />
          </linearGradient>
          <linearGradient id="ring-mid" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor={SAGE.accent} />
            <stop offset="100%" stopColor={SAGE.accentDeep} />
          </linearGradient>

          {/* Chip pin gradient */}
          <linearGradient id="pin-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor={SKY.accent} />
            <stop offset="50%"  stopColor={COPPER.accent} />
            <stop offset="100%" stopColor={SAGE.accent} />
          </linearGradient>
        </defs>

        {/* ── Outer orbit ring — SKY ── */}
        <circle cx={CX} cy={CY} r={R3} stroke={SKY.accentBorder} strokeWidth="1.2" fill="none" />
        <circle cx={CX} cy={CY} r={R3} stroke={SKY.accent} strokeWidth="0.6" fill="none"
          strokeOpacity="0.5" strokeDasharray="20 14" />

        {/* ── Middle orbit ring — SAGE ── */}
        <circle cx={CX} cy={CY} r={R2} stroke={SAGE.accentBorder} strokeWidth="1.2" fill="none" />
        <circle cx={CX} cy={CY} r={R2} stroke={SAGE.accent} strokeWidth="0.5" fill="none"
          strokeOpacity="0.45" strokeDasharray="12 10" />

        {/* ── Inner orbit ring — COPPER ── */}
        <circle cx={CX} cy={CY} r={R1} stroke={COPPER.accent} strokeWidth="1.8" fill="none" strokeOpacity="0.9" />

        {/* ── Neural spokes — tricolor ── */}
        {spokeAngles.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const col = i % 3 === 0 ? SKY.accent : i % 3 === 1 ? SAGE.accent : COPPER.accent;
          return (
            <line key={angle}
              x1={CX + R3 * Math.cos(rad)} y1={CY + R3 * Math.sin(rad)}
              x2={CX + (half + 2) * Math.cos(rad)} y2={CY + (half + 2) * Math.sin(rad)}
              stroke={col} strokeWidth="0.5" strokeOpacity="0.28" strokeDasharray="3 8"
            />
          );
        })}

        {/* ── Chip body ── */}
        <rect x={CX - half} y={CY - half} width={half * 2} height={half * 2} rx="14"
          fill="rgba(10,6,3,0.94)" stroke="url(#pin-grad)" strokeWidth="2"
          filter="url(#chip-glow)"
        />

        {/* Chip pins — top (sky color) */}
        {pinPads.map((off) => (
          <React.Fragment key={`t${off}`}>
            <line x1={CX + off} y1={CY - half} x2={CX + off} y2={CY - half - 12}
              stroke={SKY.accent} strokeWidth="2" strokeOpacity="0.9" />
            <rect x={CX + off - 3.5} y={CY - half - 16.5} width={7} height={5} rx="2" fill={SKY.accent} />
          </React.Fragment>
        ))}
        {/* Chip pins — bottom (sage color) */}
        {pinPads.map((off) => (
          <React.Fragment key={`b${off}`}>
            <line x1={CX + off} y1={CY + half} x2={CX + off} y2={CY + half + 12}
              stroke={SAGE.accent} strokeWidth="2" strokeOpacity="0.9" />
            <rect x={CX + off - 3.5} y={CY + half + 11.5} width={7} height={5} rx="2" fill={SAGE.accent} />
          </React.Fragment>
        ))}
        {/* Chip pins — left (sky color) */}
        {pinPads.map((off) => (
          <React.Fragment key={`l${off}`}>
            <line x1={CX - half} y1={CY + off} x2={CX - half - 12} y2={CY + off}
              stroke={SKY.accent} strokeWidth="2" strokeOpacity="0.9" />
            <rect x={CX - half - 16.5} y={CY + off - 3.5} width={5} height={7} rx="2" fill={SKY.accent} />
          </React.Fragment>
        ))}
        {/* Chip pins — right (sage color) */}
        {pinPads.map((off) => (
          <React.Fragment key={`r${off}`}>
            <line x1={CX + half} y1={CY + off} x2={CX + half + 12} y2={CY + off}
              stroke={SAGE.accent} strokeWidth="2" strokeOpacity="0.9" />
            <rect x={CX + half + 11.5} y={CY + off - 3.5} width={5} height={7} rx="2" fill={SAGE.accent} />
          </React.Fragment>
        ))}

        {/* Chip internals — cross grid */}
        <line x1={CX} y1={CY - half + 6} x2={CX} y2={CY + half - 6}
          stroke={COPPER.accent} strokeWidth="0.6" strokeOpacity="0.4" />
        <line x1={CX - half + 6} y1={CY} x2={CX + half - 6} y2={CY}
          stroke={COPPER.accent} strokeWidth="0.6" strokeOpacity="0.4" />

        {/* Chip internals — 4 corner quadrant boxes */}
        {([
          [CX - half + 6, CY - half + 6, SKY.accentSoft,    SKY.accentBorder],
          [CX + 4,        CY - half + 6, SAGE.accentSoft,   SAGE.accentBorder],
          [CX - half + 6, CY + 4,        SAGE.accentSoft,   SAGE.accentBorder],
          [CX + 4,        CY + 4,        SKY.accentSoft,    SKY.accentBorder],
        ] as [number, number, string, string][]).map(([bx, by, bg, bc], i) => (
          <rect key={i} x={bx} y={by} width={half - 10} height={half - 10} rx="4"
            stroke={bc} strokeWidth="0.7" fill={bg} />
        ))}

        {/* Center core — glowing copper */}
        <circle cx={CX} cy={CY} r={18} fill={COPPER.accentSoft} stroke={COPPER.accent}
          strokeWidth="1.5" filter="url(#core-glow)" />
        <circle cx={CX} cy={CY} r={10} fill={COPPER.accent} fillOpacity="0.3" />

        {/* AI label */}
        <text x={CX} y={CY + 5} textAnchor="middle"
          fontSize="14" fontWeight="800" letterSpacing="0.08em" fill={COPPER.accent}
          style={{ fontFamily: "ui-monospace, monospace", filter: `drop-shadow(0 0 10px ${COPPER.accent})` }}>
          AI
        </text>

        {/* Scan line — scoped to chip */}
        {!reduced && (
          <rect x={CX - half + 2} y={CY - half + 2} width={(half - 2) * 2} height={7}
            rx="2" fill="url(#scan-il)" opacity="0.9">
            <animateTransform attributeName="transform" type="translate"
              values={`0,0; 0,${(half - 2) * 2 - 7}; 0,0`} dur="2.6s" repeatCount="indefinite" />
          </rect>
        )}

        {/* ── Inner orbit: 3 COPPER dots, CCW ── */}
        {!reduced && [0, 120, 240].map((a, i) => (
          <g key={`i${i}`}>
            <circle cx={CX} cy={CY - R1} r={4.5} fill={COPPER.accent} filter="url(#gf-copper)">
              <animateTransform attributeName="transform" type="rotate"
                from={`${a} ${CX} ${CY}`} to={`${a - 360} ${CX} ${CY}`}
                dur={`${4.2 + i * 0.55}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* ── Middle orbit: 4 SAGE dots, CW ── */}
        {!reduced && [0, 90, 180, 270].map((a, i) => (
          <g key={`m${i}`}>
            <circle cx={CX} cy={CY - R2} r={i % 2 === 0 ? 5 : 3}
              fill={SAGE.accent} fillOpacity={i % 2 === 0 ? 1 : 0.65}
              filter={i % 2 === 0 ? "url(#gf-sage)" : undefined}>
              <animateTransform attributeName="transform" type="rotate"
                from={`${a} ${CX} ${CY}`} to={`${a + 360} ${CX} ${CY}`}
                dur={`${8.5 + i * 1.4}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* ── Outer orbit: 6 SKY dots, CCW ── */}
        {!reduced && [0, 60, 120, 180, 240, 300].map((a, i) => (
          <g key={`o${i}`}>
            <circle cx={CX} cy={CY - R3} r={i % 2 === 0 ? 5.5 : 2.8}
              fill={SKY.accent} fillOpacity={i % 2 === 0 ? 1 : 0.55}
              filter={i % 2 === 0 ? "url(#gf-sky)" : undefined}>
              <animateTransform attributeName="transform" type="rotate"
                from={`${a} ${CX} ${CY}`} to={`${a - 360} ${CX} ${CY}`}
                dur={`${12 + i * 1.3}s`} repeatCount="indefinite" />
            </circle>
          </g>
        ))}
      </svg>
    </div>
  );
};

// ─── Open signal column ───────────────────────────────────────────────────────
const SignalColumn: React.FC<{
  title: string;
  signals: readonly { title: string; items: string }[];
  accent: string;
  accentBorder: string;
  glow: string;
  align?: "left" | "right";
}> = ({ title, signals, accent, accentBorder, glow, align = "left" }) => (
  <div className={`flex h-full flex-col justify-center gap-3 ${align === "right" ? "lg:items-end" : ""}`}>
    <p className="text-[10px] font-semibold uppercase mb-1"
      style={{ color: accent, letterSpacing: "0.22em", textAlign: align }}>
      {title}
    </p>

    {signals.map((s, i) => (
      <div
        key={s.title}
        className={`group relative w-full py-2.5 ${align === "right" ? "lg:text-right lg:pr-5" : "lg:pl-5"}`}
        style={{
          borderTop: i === 0 ? `1px solid ${accentBorder}` : undefined,
          borderBottom: `1px solid ${accentBorder}`,
        }}
      >
        <span
          className={`absolute top-1/2 hidden h-2 w-2 -translate-y-1/2 rounded-full lg:block ${align === "right" ? "right-0" : "left-0"}`}
          style={{ background: accent, boxShadow: `0 0 16px ${glow}` }}
        />
        <span
          className={`absolute top-1/2 hidden h-px w-10 -translate-y-1/2 lg:block ${align === "right" ? "right-4" : "left-4"}`}
          style={{ background: `linear-gradient(${align === "right" ? "270deg" : "90deg"}, ${accentBorder}, transparent)` }}
        />
        <div className="text-[12px] font-semibold mb-0.5" style={{ color: INK.strong }}>
          {s.title}
        </div>
        <div className="text-[10px] font-light leading-relaxed" style={{ color: INK.faint }}>
          {s.items}
        </div>
      </div>
    ))}
  </div>
);

// ─── Main slide ───────────────────────────────────────────────────────────────
export const SalonIntelligenceLayerSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const theme = SLIDE_THEME["intelligence-layer"]; // copper accent for heading

  return (
    <CinematicSlide
      theme={theme}
      ariaLabel="The intelligence layer"
      scrim="veil"
      constellation
      darkOverlay
      fit
    >
      <SlideHeading
        theme={theme}
        eyebrow={INTELLIGENCE_LAYER.eyebrow}
        size="h2"
        className="mb-5 max-w-3xl"
        layer={4}
      >
        {INTELLIGENCE_LAYER.headline}
      </SlideHeading>

      {/* ── Open intelligence field ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_76px_300px_76px_1fr] gap-0 items-center">

        {/* Left — Cost Optimization (sky/blue) */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.1 }}
        >
          <SignalColumn
            title="Cost Optimization"
            signals={INTELLIGENCE_LAYER.costSignals}
            accent={SKY.accent}
            accentBorder={SKY.accentBorder}
            glow={SKY.glow}
            align="left"
          />
        </motion.div>

        {/* Stream sky → center */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.35 }}
        >
          <DataStream direction="right" accent={SKY.accent} glow={SKY.glow} />
        </motion.div>

        {/* Center — AI Processor */}
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, scale: 0.82 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: DUR.slow * 1.2, ease: EASE_OUT, delay: reduced ? 0 : 0.2 }}
        >
          <AIProcessorCore />

          <div className="text-center mt-2">
            <p className="text-sm font-semibold" style={{ color: INK.strong }}>
              Salon Intelligence Engine
            </p>
            <p className="text-[10px] font-light mt-0.5" style={{ color: INK.faint }}>
              Every signal flows into one model
            </p>
          </div>

          {/* Engine objects as quiet signal labels */}
          <motion.div
            className="mt-4 grid max-w-[320px] grid-cols-3 gap-x-4 gap-y-2 border-y py-3"
            style={{ borderColor: "rgba(255,255,255,0.10)" }}
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {INTELLIGENCE_LAYER.engineObjects.map((obj, i) => {
              const col = i % 3 === 0 ? SKY : i % 3 === 1 ? SAGE : COPPER;
              return (
                <motion.span
                  key={obj}
                  variants={item}
                  className="text-center text-[10px] font-light"
                  style={{
                    color: col.accent,
                    textShadow: `0 0 14px ${col.glow}`,
                  }}
                >
                  {obj}
                </motion.span>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Stream sage ← center */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.35 }}
        >
          <DataStream direction="left" accent={SAGE.accent} glow={SAGE.glow} />
        </motion.div>

        {/* Right — Booking Intelligence (sage/green) */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.1 }}
        >
          <SignalColumn
            title="Booking Intelligence"
            signals={INTELLIGENCE_LAYER.bookingSignals}
            accent={SAGE.accent}
            accentBorder={SAGE.accentBorder}
            glow={SAGE.glow}
            align="right"
          />
        </motion.div>
      </div>

      {/* Closing */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.78 }}
        className="mt-5 text-center text-xs font-light max-w-3xl mx-auto"
        style={{ color: INK.faint }}
      >
        {INTELLIGENCE_LAYER.closing}
      </motion.p>
    </CinematicSlide>
  );
};
