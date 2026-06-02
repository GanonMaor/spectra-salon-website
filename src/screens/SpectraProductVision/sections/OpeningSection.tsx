import React from "react";
import { motion } from "framer-motion";
import { Section, Eyebrow, AssetSlot, LuxuryButton } from "../primitives";
import { Glyph, type GlyphName } from "../visuals";
import { ASSETS } from "../assetManifest";
import { OPENING, CHROME } from "../copy";
import { COLORS, SALON, TYPE } from "../tokens";
import { EASE_OUT, DURATION } from "../motion";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

/**
 * VisionOS-style depth: each card sits at a slightly different z-plane.
 * opacity  → how "close" to the eye the object feels
 * scale    → faint size difference reinforces depth
 * auraOp   → ambient intelligence intensity
 * floatAmp → pixels of vertical float travel
 * floatDur → float period in seconds
 */
const CARD_DEPTH = [
  { opacity: 1.00, scale: 1.00,  auraOp: 0.22, floatAmp: 6,  floatDur: 7.8  }, // Schedule
  { opacity: 0.95, scale: 0.985, auraOp: 0.18, floatAmp: 5,  floatDur: 8.4  }, // Color Bar
  { opacity: 0.90, scale: 0.965, auraOp: 0.15, floatAmp: 7,  floatDur: 9.0  }, // Insight (anchor)
  { opacity: 1.00, scale: 1.02,  auraOp: 0.22, floatAmp: 6,  floatDur: 7.4  }, // AI Agent
];

/** Deeper rose-gold for legible emphasis text over bright imagery. */
const HIGHLIGHT_GRADIENT = "linear-gradient(90deg, #9C5238 0%, #C07A5E 100%)";
const LABEL_ROSE = "#C8A18D";
const ICON_ROSE = "#C89A84";

/** Section 1 — The Opening. A product-reveal hero: message + live salon cards. */
export const OpeningSection: React.FC<SectionComponentProps> = ({
  reducedMotion = false,
}) => {
  return (
    <Section
      id="opening"
      reducedMotion={reducedMotion}
      aria-label="Opening"
      backdrop={
        <>
          {/* Real premium salon interior — the room the page lives inside. */}
          <AssetSlot
            asset={ASSETS.heroSalonPhoto}
            alt="Premium salon interior"
            fit="cover"
            lazy={false}
            decorative
            className="absolute inset-0 w-full h-full"
          />
          {/* Cinematic warm edge vignette: depth + impact. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(125% 115% at 50% 42%, transparent 58%, rgba(58,36,22,0.30) 100%)",
            }}
          />
          {/* Light wash, ~40% lighter: bright at left, nearly clear at right so the salon lives. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(255,248,243,0.58) 0%, rgba(255,248,243,0.38) 38%, rgba(255,248,243,0.14) 70%, transparent 100%)",
            }}
          />
          {/* Focused glow behind the message — restores text contrast without flattening the room. */}
          <div
            className="absolute left-[6%] top-1/2 -translate-y-1/2 rounded-full blur-3xl"
            style={{ width: 720, height: 560, background: "radial-gradient(closest-side, rgba(255,249,244,0.85), transparent 72%)" }}
          />
          {/* Soft rose warmth + bottom fade into the page. */}
          <div
            className="absolute left-[20%] top-1/3 -translate-x-1/2 rounded-full blur-3xl"
            style={{ width: 560, height: 560, background: "rgba(232,185,168,0.18)" }}
          />
          <div
            className="absolute inset-x-0 bottom-0"
            style={{ height: "28%", background: `linear-gradient(to top, ${SALON.bgWarm}, transparent)` }}
          />
        </>
      }
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        {/* ── Left: the message ───────────────────────────────────────── */}
        <motion.div
          className="text-left"
          style={{ maxWidth: 600 }}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.enter, ease: EASE_OUT }}
        >
          <Eyebrow align="left" className="mb-6">
            {OPENING.eyebrow}
          </Eyebrow>

          <h1
            style={{
              fontSize: "clamp(56px, 7vw, 96px)",
              fontWeight: 600,
              lineHeight: 0.96,
              letterSpacing: "-0.035em",
              color: COLORS.warmWhite,
              textShadow: "0 1px 30px rgba(255,249,244,0.7)",
            }}
          >
            Meet
            <br />
            Salon AI
          </h1>

          <p
            className="mt-5"
            style={{
              fontSize: TYPE.h2,
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              color: SALON.text,
            }}
          >
            {OPENING.subheadline}
          </p>

          <p
            className="mt-5"
            style={{ fontSize: TYPE.body, color: SALON.textSoft, maxWidth: 500 }}
          >
            {OPENING.supporting}
          </p>

          <p
            className="mt-7"
            style={{
              fontSize: "clamp(24px, 2.6vw, 34px)",
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              whiteSpace: "pre-line",
              backgroundImage: HIGHLIGHT_GRADIENT,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {OPENING.highlight}
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <LuxuryButton variant="primary">{OPENING.ctaPrimary}</LuxuryButton>
            <LuxuryButton variant="ghost">{OPENING.ctaSecondary}</LuxuryButton>
          </div>
        </motion.div>

        {/* ── Right: AI intelligence orbiting the salon, in story order ── */}
        <div className="relative flex flex-col gap-4 lg:block lg:h-[600px]">
          {/* Glowing nervous system connecting every signal to one origin. */}
          <ConnectionLines reducedMotion={reducedMotion} />
          {/* The origin: intelligence emerging from inside the salon. */}
          <OriginCore reducedMotion={reducedMotion} />

          {/* 1 · The client / appointment — top of the flow. */}
          <FloatObject
            index={0}
            reducedMotion={reducedMotion}
            posClass="lg:top-0 lg:left-1/2 lg:-translate-x-1/2"
            widthClass="w-full lg:w-[210px]"
            rotateClass="lg:-rotate-1"
          >
            <ChipBody
              glyph="agent-operations"
              eyebrow={OPENING.cards[0].eyebrow}
              value={OPENING.cards[0].value}
              detail={OPENING.cards[0].detail}
              dot="amber"
            />
          </FloatObject>

          {/* 2 · The service (color bar) — right. */}
          <FloatObject
            index={1}
            reducedMotion={reducedMotion}
            posClass="lg:top-1/2 lg:right-0 lg:-translate-y-1/2"
            widthClass="w-full lg:w-[200px]"
            rotateClass="lg:rotate-1"
          >
            <ChipBody
              glyph="colorbar"
              eyebrow={OPENING.cards[2].eyebrow}
              value={OPENING.cards[2].value}
              detail={OPENING.cards[2].detail}
              dot="amber"
            />
          </FloatObject>

          {/* 3 · The insight (focus) — bottom, largest, nearest the desk. */}
          <FloatObject
            index={2}
            reducedMotion={reducedMotion}
            posClass="lg:bottom-0 lg:left-1/2 lg:-translate-x-1/2"
            widthClass="w-full lg:w-[236px]"
            rotateClass="lg:rotate-1"
          >
            <StatBody reducedMotion={reducedMotion} />
          </FloatObject>

          {/* 4 · The action (AI agent acts) — left. */}
          <FloatObject
            index={3}
            reducedMotion={reducedMotion}
            posClass="lg:top-1/2 lg:left-0 lg:-translate-y-1/2"
            widthClass="w-full lg:w-[206px]"
            rotateClass="lg:-rotate-1"
          >
            <ChipBody
              glyph="agent-customer-success"
              eyebrow={OPENING.cards[3].eyebrow}
              value={OPENING.cards[3].value}
              detail={OPENING.cards[3].detail}
              dot="sage"
            />
          </FloatObject>
        </div>
      </div>

      <span className="sr-only">{CHROME.brand}</span>
    </Section>
  );
};

/* ──────────────────────────────────────────────────────────────────────────
 * Floating AI objects — weightless glass that emits intelligence.
 * ────────────────────────────────────────────────────────────────────────── */

interface FloatObjectProps {
  index: number;
  reducedMotion: boolean;
  posClass: string;
  widthClass: string;
  rotateClass: string;
  children: React.ReactNode;
}

const FloatObject: React.FC<FloatObjectProps> = ({
  index,
  reducedMotion,
  posClass,
  widthClass,
  rotateClass,
  children,
}) => {
  const depth = CARD_DEPTH[index % CARD_DEPTH.length];
  return (
    // Outer: position + centering + tilt (static, never animated).
    <div className={`static lg:absolute ${posClass} ${widthClass} ${rotateClass}`} style={{ zIndex: 2 }}>
      {/* Middle: entrance fade-in with per-card scale target from depth table. */}
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.95 }}
        animate={{ opacity: depth.opacity, y: 0, scale: depth.scale }}
        transition={{ duration: DURATION.enter, ease: EASE_OUT, delay: reducedMotion ? 0 : 0.4 + index * 0.13 }}
      >
        <div className="relative">
          {/* Ambient intelligence aura — intensity varies per card. */}
          <span
            className="spv-ai-aura"
            style={{ opacity: depth.auraOp / 0.22 }}
            aria-hidden
          />
          {/* Inner: perpetual float — amplitude + duration from depth table. */}
          <motion.div
            className="spv-ai-card p-4"
            animate={reducedMotion ? undefined : { y: [0, -depth.floatAmp, 0] }}
            transition={{
              duration: depth.floatDur,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.5,
            }}
          >
            {/* Reflection streak — the angled light glancing across the glass face. */}
            <span className="spv-ai-reflection" aria-hidden />
            {children}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

/** The intelligence origin — a glowing core the AI signals orbit. */
const OriginCore: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <div
    className="hidden lg:block absolute lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2"
    style={{ zIndex: 1 }}
    aria-hidden
  >
    <div className="relative flex items-center justify-center" style={{ width: 16, height: 16 }}>
      {!reducedMotion && (
        <motion.span
          className="absolute rounded-full"
          style={{ width: 16, height: 16, border: "1px solid rgba(235,197,175,0.6)" }}
          animate={{ scale: [1, 3.2], opacity: [0.55, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span
        className="rounded-full"
        style={{
          width: 11,
          height: 11,
          background: "radial-gradient(circle at 35% 30%, #FFF3EC, #D59A86 70%)",
          boxShadow: "0 0 16px rgba(213,154,134,0.8), 0 0 4px rgba(255,243,236,0.9)",
        }}
      />
    </div>
  </div>
);

/** Subtle glowing lines — light, not SaaS wires — wiring every signal to the core. */
const ConnectionLines: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const paths = ["M50 50 L50 15", "M50 50 L81 50", "M50 50 L50 85", "M50 50 L19 50"];
  return (
    <svg
      className="hidden lg:block absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <filter id="spv-line-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>
      <g stroke="#EBC5AF" strokeWidth="0.4" fill="none" opacity="0.55" filter="url(#spv-line-blur)">
        {paths.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            strokeLinecap="round"
            initial={reducedMotion ? { pathLength: 1, opacity: 0.55 } : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.55 }}
            transition={{ duration: 1, ease: EASE_OUT, delay: reducedMotion ? 0 : 0.7 + i * 0.16 }}
          />
        ))}
      </g>
    </svg>
  );
};

const IconDisc: React.FC<{ glyph: GlyphName; size?: number }> = ({ glyph, size = 42 }) => (
  <span
    className="inline-flex items-center justify-center shrink-0"
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      color: ICON_ROSE,
      background: "linear-gradient(150deg, rgba(255,255,255,0.55), rgba(255,224,208,0.16))",
      border: "1px solid rgba(255,255,255,0.5)",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7), 0 6px 18px rgba(200,154,132,0.16)",
    }}
  >
    <Glyph name={glyph} size={Math.round(size * 0.48)} strokeWidth={1.5} />
  </span>
);

const Label: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = LABEL_ROSE }) => (
  <div className="uppercase" style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.22em", color }}>
    {children}
  </div>
);

const SignalDot: React.FC<{ tone: "amber" | "sage"; reducedMotion?: boolean }> = ({ tone, reducedMotion }) => (
  <motion.span
    className={`${tone === "amber" ? "spv-ai-dot" : ""} rounded-full shrink-0`}
    style={
      tone === "amber"
        ? { width: 8, height: 8 }
        : { width: 8, height: 8, background: SALON.sage, boxShadow: `0 0 10px ${SALON.sage}` }
    }
    animate={reducedMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
    transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
    aria-hidden
  />
);

interface ChipBodyProps {
  glyph: GlyphName;
  eyebrow: string;
  value: string;
  detail: string;
  dot: "amber" | "sage";
}

const ChipBody: React.FC<ChipBodyProps> = ({ glyph, eyebrow, value, detail, dot }) => (
  <div className="flex items-center gap-3.5">
    <IconDisc glyph={glyph} />
    <div className="min-w-0">
      <Label>{eyebrow}</Label>
      <div style={{ fontSize: 17, fontWeight: 600, color: SALON.text, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
        {value}
      </div>
      <div style={{ fontSize: TYPE.small, color: SALON.textSoft, marginTop: 1 }}>{detail}</div>
    </div>
    <span className="ml-auto self-start pt-1">
      <SignalDot tone={dot} />
    </span>
  </div>
);

/** The signature stat: color services are the growth engine. */
const StatBody: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <div>
    <div className="flex items-center justify-between">
      <Label color="#B47C61">AI INSIGHT</Label>
      <SignalDot tone="amber" reducedMotion={reducedMotion} />
    </div>
    <div className="flex items-end gap-2 mt-2">
      <span style={{ fontSize: 42, fontWeight: 600, color: SALON.text, lineHeight: 0.9, letterSpacing: "-0.03em" }}>
        40%
      </span>
      <span style={{ fontSize: 12, color: SALON.textSoft, marginBottom: 6, lineHeight: 1.1 }}>
        of revenue from<br />color services
      </span>
    </div>
    <StatSparkline />
    <span
      className="inline-flex items-center gap-1 mt-2.5 rounded-full"
      style={{
        padding: "3px 9px",
        background: "rgba(169,183,154,0.20)",
        border: "1px solid rgba(169,183,154,0.4)",
        fontSize: 11,
        fontWeight: 600,
        color: "#6E7E5C",
      }}
    >
      <span aria-hidden>↑</span> 18% vs last month
    </span>
  </div>
);

const StatSparkline: React.FC = () => (
  <svg className="mt-3 w-full" height="34" viewBox="0 0 200 34" fill="none" preserveAspectRatio="none" aria-hidden>
    <defs>
      <linearGradient id="spv-spark-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={SALON.roseLine} stopOpacity="0.30" />
        <stop offset="100%" stopColor={SALON.roseLine} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0 28 C 30 26, 48 22, 74 20 S 120 14, 148 9 S 182 4, 200 2 L200 34 L0 34 Z"
      fill="url(#spv-spark-fill)"
    />
    <path
      d="M0 28 C 30 26, 48 22, 74 20 S 120 14, 148 9 S 182 4, 200 2"
      stroke={SALON.roseLine}
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    <circle cx="200" cy="2" r="3" fill={SALON.copper} />
    <circle cx="200" cy="2" r="6" fill={SALON.copper} fillOpacity="0.22" />
  </svg>
);

