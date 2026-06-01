import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF, LAYOUT } from "../tokens";
import { VIEWPORT_ONCE, pickReveal, staggerContainer, staggerItem, fadeOnly, fadeItem, DURATION, EASE_OUT } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy } from "../primitives";
import { FLYWHEEL } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const FlywheelSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="flywheel"
      aria-label="The data network flywheel"
      reducedMotion={reducedMotion}
      padY="clamp(80px, 12vh, 160px)"
      backdrop={
        <div
          style={{ position: "absolute", inset: 0, background: INV.bgSoft }}
        />
      }
    >
      {/* Header */}
      <div className="text-center mb-16" style={{ maxWidth: 680, margin: "0 auto 64px" }}>
        <InvestorEyebrow className="mb-6">{FLYWHEEL.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" as="h2" className="mb-5">
          {FLYWHEEL.headline}
        </InvestorHeadline>
        <InvestorCopy muted>{FLYWHEEL.subhead}</InvestorCopy>
      </div>

      {/* Flywheel visualization */}
      <motion.div
        className="flex justify-center mb-16"
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        <DataNetworkFlywheel reducedMotion={reducedMotion} />
      </motion.div>

      {/* Step explanations */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 gap-5"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {FLYWHEEL.steps.map((step, i) => (
          <motion.div key={step.label} variants={reducedMotion ? fadeItem : staggerItem}>
            <div
              style={{
                padding: "20px",
                borderRadius: "16px",
                background: INV.surfaceStrong,
                border: `1px solid ${INV.border}`,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: `${INV.gold}20`,
                  border: `1.5px solid ${INV.goldLine}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: FONT_SANS,
                  fontSize: "11px",
                  fontWeight: 700,
                  color: INV.gold,
                  marginBottom: "10px",
                }}
              >
                {i + 1}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: TYPE.small,
                  fontWeight: 700,
                  color: INV.text,
                  marginBottom: "4px",
                }}
              >
                {step.label}
              </div>
              <div
                style={{
                  fontFamily: FONT_SANS,
                  fontSize: "12px",
                  color: INV.textMuted,
                  lineHeight: 1.5,
                }}
              >
                {step.detail}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Closing */}
      <motion.p
        className="text-center mt-16 mx-auto"
        style={{ maxWidth: 560 }}
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        <span
          style={{
            fontFamily: FONT_SERIF,
            fontSize: TYPE.h2,
            fontWeight: 400,
            fontStyle: "italic",
            color: INV.textSoft,
            lineHeight: 1.4,
          }}
        >
          {FLYWHEEL.closing}
        </span>
      </motion.p>
    </InvestorSection>
  );
};

/* ─── Data Network Flywheel ────────────────────────────────────────────────── */

const DataNetworkFlywheel: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => {
  const steps = FLYWHEEL.steps.map((s) => s.label);
  const r = 150;
  const cx = 200;
  const cy = 200;

  return (
    <div style={{ position: "relative", width: 400, height: 400 }}>
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full" aria-hidden>
        {/* Orbit ring */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={INV.gold}
          strokeWidth="0.8"
          strokeOpacity="0.3"
          strokeDasharray="6 8"
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        />

        {/* Arrows between nodes */}
        {steps.map((_, i) => {
          const angle1 = (i / steps.length) * 2 * Math.PI - Math.PI / 2;
          const angle2 = ((i + 1) / steps.length) * 2 * Math.PI - Math.PI / 2;
          const midAngle = (angle1 + angle2) / 2;

          const x1 = cx + (r - 8) * Math.cos(angle1);
          const y1 = cy + (r - 8) * Math.sin(angle1);
          const x2 = cx + (r - 8) * Math.cos(angle2);
          const y2 = cy + (r - 8) * Math.sin(angle2);
          const mx = cx + (r + 20) * Math.cos(midAngle);
          const my = cy + (r + 20) * Math.sin(midAngle);

          return (
            <path
              key={i}
              d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
              fill="none"
              stroke={INV.gold}
              strokeWidth="1"
              strokeOpacity="0.25"
              markerEnd="url(#arrowhead)"
            />
          );
        })}

        {/* Arrowhead marker */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="3"
            refY="3"
            orient="auto"
          >
            <path d="M 0 0 L 6 3 L 0 6 Z" fill={INV.gold} opacity="0.4" />
          </marker>
        </defs>
      </svg>

      {/* Center label */}
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${INV.gold}20, ${INV.gold}08)`,
            border: `1.5px solid ${INV.goldLine}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 0 40px ${INV.gold}20`,
          }}
        >
          <span
            style={{
              fontFamily: FONT_SANS,
              fontSize: "10px",
              fontWeight: 700,
              color: INV.gold,
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            {FLYWHEEL.center}
          </span>
        </div>
      </div>

      {/* Step labels around the wheel */}
      {steps.map((step, i) => {
        const angle = (i / steps.length) * 2 * Math.PI - Math.PI / 2;
        const x = 50 + ((cx + r * Math.cos(angle)) / 400) * 100;
        const y = 50 + ((cy + r * Math.sin(angle)) / 400) * 100;

        return (
          <div
            key={step}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "99px",
                background: INV.surfaceStrong,
                border: `1px solid ${INV.border}`,
                backdropFilter: "blur(12px)",
                fontFamily: FONT_SANS,
                fontSize: "11px",
                fontWeight: 700,
                color: INV.text,
                whiteSpace: "nowrap",
                boxShadow: `0 4px 16px ${INV.shadow}`,
              }}
            >
              {step}
            </div>
          </div>
        );
      })}
    </div>
  );
};
