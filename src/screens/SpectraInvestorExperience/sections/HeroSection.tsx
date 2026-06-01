import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SERIF, FONT_SANS, LAYOUT, GOLD_GRADIENT } from "../tokens";
import { DURATION, EASE_OUT } from "../motion";
import { InvestorButton } from "../primitives";
import { HERO } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const HeroSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <section
      id="hero"
      aria-label="Investor Experience Hero"
      className="relative w-full overflow-hidden"
      style={{
        minHeight: "100dvh",
        background: INV.bg,
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Background: abstract salon workflow signals */}
      <FlowingEcosystem reducedMotion={reducedMotion} />

      <div
        className="relative w-full mx-auto"
        style={{
          maxWidth: LAYOUT.maxWidth,
          padding: `${LAYOUT.sectionPad} ${LAYOUT.sidePad}`,
          zIndex: 2,
        }}
      >
        <div className="grid lg:grid-cols-[1fr_auto] gap-16 items-center">
          {/* Left: Narrative */}
          <div style={{ maxWidth: 720 }}>
            {/* Eyebrow */}
            <motion.div
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.enter, ease: EASE_OUT, delay: 0.1 }}
            >
              <p
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: TYPE.eyebrow,
                  fontWeight: 600,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: INV.gold,
                  marginBottom: "24px",
                }}
              >
                {HERO.eyebrow}
              </p>
            </motion.div>

            {/* Main headline */}
            <motion.h1
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: 0.2 }}
              style={{
                fontFamily: FONT_SERIF,
                fontSize: TYPE.hero,
                fontWeight: 400,
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                color: INV.text,
                marginBottom: "8px",
              }}
            >
              {HERO.headline}
            </motion.h1>

            {/* Sub headline */}
            <motion.p
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.enter, ease: EASE_OUT, delay: 0.45 }}
              style={{
                fontFamily: FONT_SANS,
                fontSize: TYPE.h3,
                fontWeight: 400,
                lineHeight: 1.3,
                color: INV.textSoft,
                marginBottom: "40px",
                marginTop: "16px",
              }}
            >
              {HERO.subheadline}
            </motion.p>

            {/* 3 story lines */}
            <div style={{ marginBottom: "48px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {HERO.lines.map((line, i) => (
                <motion.p
                  key={i}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: DURATION.enter,
                    ease: EASE_OUT,
                    delay: reducedMotion ? 0 : 0.7 + i * 0.15,
                  }}
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: TYPE.body,
                    lineHeight: 1.6,
                    color: i === 2 ? INV.gold : INV.textSoft,
                    fontWeight: i === 2 ? 500 : 400,
                  }}
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 items-start"
              initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.enter, ease: EASE_OUT, delay: reducedMotion ? 0 : 1.15 }}
            >
              <InvestorButton variant="primary">{HERO.ctaPrimary}</InvestorButton>
              <InvestorButton variant="ghost">{HERO.ctaSecondary}</InvestorButton>
            </motion.div>
          </div>

          {/* Right: Salon signal cards */}
          <motion.div
            className="hidden lg:flex flex-col gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DURATION.slow, ease: EASE_OUT, delay: 0.8 }}
            style={{ minWidth: 260 }}
          >
            <SignalCard
              label="Color Service"
              value="Formula tracked"
              detail="70g · cost recorded"
              dot="gold"
              reducedMotion={reducedMotion}
              delay={0.9}
            />
            <SignalCard
              label="AI Insight"
              value="40% of revenue"
              detail="from color services"
              dot="success"
              reducedMotion={reducedMotion}
              delay={1.0}
            />
            <SignalCard
              label="Inventory"
              value="Reorder triggered"
              detail="Before stockout"
              dot="gold"
              reducedMotion={reducedMotion}
              delay={1.1}
            />
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          aria-hidden
        >
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: INV.textMuted,
            }}
          >
            {HERO.chapterLabel}
          </span>
          <motion.div
            animate={reducedMotion ? {} : { y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 1,
              height: 40,
              background: `linear-gradient(to bottom, ${INV.gold}, transparent)`,
            }}
          />
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Signal Cards ─────────────────────────────────────────────────────────── */

interface SignalCardProps {
  label: string;
  value: string;
  detail: string;
  dot: "gold" | "success";
  reducedMotion: boolean;
  delay: number;
}

const SignalCard: React.FC<SignalCardProps> = ({ label, value, detail, dot, reducedMotion, delay }) => (
  <motion.div
    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: DURATION.enter, ease: EASE_OUT, delay }}
    style={{
      background: INV.surfaceStrong,
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: `1px solid ${INV.border}`,
      borderRadius: "16px",
      padding: "16px 20px",
      boxShadow: `0 8px 32px ${INV.shadow}, inset 0 1px 0 rgba(255,255,255,0.6)`,
    }}
  >
    <div className="flex items-center justify-between mb-2">
      <span
        style={{
          fontFamily: FONT_SANS,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: INV.gold,
        }}
      >
        {label}
      </span>
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: dot === "gold" ? INV.gold : INV.success,
          boxShadow: `0 0 8px ${dot === "gold" ? INV.gold : INV.success}`,
        }}
      />
    </div>
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: "17px",
        fontWeight: 600,
        color: INV.text,
        lineHeight: 1.2,
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontFamily: FONT_SANS,
        fontSize: "12px",
        color: INV.textMuted,
        marginTop: "2px",
      }}
    >
      {detail}
    </div>
  </motion.div>
);

/* ─── Flowing Ecosystem Background ─────────────────────────────────────────── */

const FlowingEcosystem: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
    {/* Warm gradient wash */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(ellipse 80% 60% at 70% 50%, ${INV.bgSoft} 0%, transparent 70%)`,
      }}
    />
    {/* Subtle gold accent circles — represents data nodes */}
    <svg
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.06 }}
      viewBox="0 0 1400 900"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Data flow arcs from color bar outward */}
      <circle cx="980" cy="320" r="280" stroke={INV.gold} strokeWidth="1" />
      <circle cx="980" cy="320" r="180" stroke={INV.gold} strokeWidth="0.7" />
      <circle cx="980" cy="320" r="90" stroke={INV.gold} strokeWidth="0.5" />
      <circle cx="980" cy="320" r="8" fill={INV.gold} opacity="0.5" />
      {/* Flow lines */}
      {[45, 90, 135, 180, 225, 270, 315, 360].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 980 + 90 * Math.cos(rad);
        const y1 = 320 + 90 * Math.sin(rad);
        const x2 = 980 + 280 * Math.cos(rad);
        const y2 = 320 + 280 * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={INV.gold}
            strokeWidth="0.5"
            opacity="0.6"
          />
        );
      })}
    </svg>
    {/* Bottom gradient fade into next section */}
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "25%",
        background: `linear-gradient(to bottom, transparent, ${INV.bg})`,
      }}
    />
  </div>
);
