import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, GlassPanel } from "../primitives";
import { UNEXPECTED } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const UnexpectedAssetSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="unexpected-asset"
      aria-label="The unexpected asset — operational data"
      reducedMotion={reducedMotion}
      backdrop={
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: INV.bgSoft,
          }}
        />
      }
    >
      {/* Header */}
      <div className="text-center mb-16" style={{ maxWidth: 760, margin: "0 auto 64px" }}>
        <InvestorEyebrow className="mb-6">{UNEXPECTED.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" as="h2">
          {UNEXPECTED.headline}
        </InvestorHeadline>
      </div>

      {/* Data equation */}
      <motion.div
        className="flex items-center justify-center gap-4 flex-wrap mb-16 text-center"
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        <DataEquationBox label={UNEXPECTED.equation.left} />
        <span
          style={{
            fontFamily: FONT_SERIF,
            fontSize: TYPE.h1,
            color: INV.textMuted,
            fontWeight: 400,
          }}
        >
          {UNEXPECTED.equation.plus}
        </span>
        <DataEquationBox label={UNEXPECTED.equation.right} />
        <span
          style={{
            fontFamily: FONT_SERIF,
            fontSize: TYPE.h1,
            color: INV.gold,
            fontWeight: 400,
          }}
        >
          {UNEXPECTED.equation.equals}
        </span>
        <DataEquationBox label={UNEXPECTED.equation.result} accent />
      </motion.div>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-start">
        {/* Left: signal list */}
        <div>
          <div
            style={{
              fontFamily: FONT_SANS,
              fontSize: TYPE.eyebrow,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: INV.textMuted,
              marginBottom: "24px",
            }}
          >
            Every operational signal captured
          </div>
          <motion.div
            className="flex flex-col gap-3"
            variants={reducedMotion ? fadeOnly : staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            {UNEXPECTED.signals.map((signal, i) => (
              <motion.div
                key={signal}
                variants={reducedMotion ? fadeItem : staggerItem}
                className="flex items-center gap-4"
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: INV.gold,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: FONT_SANS,
                    fontSize: TYPE.body,
                    color: INV.text,
                    lineHeight: 1.4,
                  }}
                >
                  {signal}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right: the memorable quote + node graph */}
        <div className="flex flex-col gap-8">
          {/* Node graph visual */}
          <motion.div
            variants={pickReveal(reducedMotion)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            <OperationalDataGraph />
          </motion.div>

          {/* The quote */}
          <motion.div
            variants={pickReveal(reducedMotion)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            <div
              style={{
                padding: "36px 40px",
                borderRadius: "20px",
                background: INV.bgDark,
                border: `1px solid rgba(200,169,106,0.25)`,
              }}
            >
              <p
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: TYPE.h2,
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: INV.textLight,
                  lineHeight: 1.4,
                  whiteSpace: "pre-line",
                }}
              >
                &ldquo;{UNEXPECTED.quote}&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Closing */}
      <motion.p
        className="mt-16 text-center mx-auto"
        style={{ maxWidth: 680 }}
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        <span
          style={{
            fontFamily: FONT_SANS,
            fontSize: TYPE.body,
            color: INV.textSoft,
            lineHeight: 1.6,
          }}
        >
          {UNEXPECTED.closing}
        </span>
      </motion.p>
    </InvestorSection>
  );
};

/* ─── Data Equation Box ────────────────────────────────────────────────────── */

const DataEquationBox: React.FC<{ label: string; accent?: boolean }> = ({ label, accent }) => (
  <div
    style={{
      padding: "16px 24px",
      borderRadius: "14px",
      background: accent ? `${INV.gold}15` : INV.surfaceStrong,
      border: `1.5px solid ${accent ? INV.goldLine : INV.border}`,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      fontFamily: FONT_SANS,
      fontSize: TYPE.small,
      fontWeight: 700,
      color: accent ? INV.gold : INV.text,
      letterSpacing: "-0.01em",
    }}
  >
    {label}
  </div>
);

/* ─── Operational Data Graph ───────────────────────────────────────────────── */

const OperationalDataGraph: React.FC = () => {
  const nodes = [
    { label: "Booking", x: 50, y: 20 },
    { label: "Service", x: 170, y: 10 },
    { label: "Formula", x: 280, y: 30 },
    { label: "Inventory", x: 50, y: 120 },
    { label: "Payment", x: 170, y: 140 },
    { label: "Client", x: 280, y: 120 },
  ];

  const centerX = 165;
  const centerY = 80;

  return (
    <GlassPanel style={{ padding: "28px" }}>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: TYPE.eyebrow,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: INV.textMuted,
          marginBottom: "20px",
        }}
      >
        Operational Intelligence Layer
      </div>

      <svg viewBox="0 0 340 180" className="w-full" style={{ maxHeight: 180 }} aria-hidden>
        {/* Connection lines to center */}
        {nodes.map((n) => (
          <line
            key={n.label}
            x1={n.x + 36}
            y1={n.y + 12}
            x2={centerX}
            y2={centerY}
            stroke={INV.gold}
            strokeWidth="0.8"
            strokeOpacity="0.35"
          />
        ))}

        {/* Center node */}
        <circle cx={centerX} cy={centerY} r="22" fill={`${INV.gold}20`} stroke={INV.gold} strokeWidth="1.5" />
        <circle cx={centerX} cy={centerY} r="8" fill={INV.gold} />
        <text x={centerX} y={centerY + 36} textAnchor="middle" fill={INV.gold} fontSize="9" fontFamily="Inter, sans-serif" fontWeight="700">
          Intelligence
        </text>

        {/* Outer nodes */}
        {nodes.map((n) => (
          <g key={n.label}>
            <rect
              x={n.x}
              y={n.y}
              width="74"
              height="24"
              rx="6"
              fill={INV.surfaceStrong}
              stroke={INV.border}
              strokeWidth="0.8"
            />
            <text
              x={n.x + 37}
              y={n.y + 15}
              textAnchor="middle"
              fill={INV.textSoft}
              fontSize="9"
              fontFamily="Inter, sans-serif"
              fontWeight="600"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </GlassPanel>
  );
};
