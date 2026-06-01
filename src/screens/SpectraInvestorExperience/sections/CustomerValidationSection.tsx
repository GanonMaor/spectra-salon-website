import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { VALIDATION } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const CustomerValidationSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="validation"
      aria-label="Customer validation"
      reducedMotion={reducedMotion}
    >
      {/* Header */}
      <div className="text-center mb-16" style={{ maxWidth: 640, margin: "0 auto 64px" }}>
        <InvestorEyebrow className="mb-6">{VALIDATION.eyebrow}</InvestorEyebrow>
        <InvestorHeadline size="h1" as="h2" className="mb-5">
          {VALIDATION.headline}
        </InvestorHeadline>
        <InvestorCopy muted>{VALIDATION.subhead}</InvestorCopy>
      </div>

      {/* Geography badges */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 mb-16"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {VALIDATION.regions.map((region) => (
          <motion.div key={region} variants={reducedMotion ? fadeItem : staggerItem}>
            <RegionBadge label={region} />
          </motion.div>
        ))}
      </motion.div>

      {/* World Map */}
      <motion.div
        className="mb-16"
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        <ValidationMap />
      </motion.div>

      {/* Quote cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {VALIDATION.quotes.map((q, i) => (
          <motion.div key={i} variants={reducedMotion ? fadeItem : staggerItem}>
            <GlassPanel hover style={{ padding: "28px 32px" }}>
              <div
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: TYPE.h3,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  color: INV.text,
                  marginBottom: "20px",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{q.quote}&rdquo;
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: TYPE.small,
                      fontWeight: 600,
                      color: INV.text,
                    }}
                  >
                    {q.role}
                  </div>
                  <div
                    style={{
                      fontFamily: FONT_SANS,
                      fontSize: "12px",
                      color: INV.textMuted,
                    }}
                  >
                    {q.location}
                  </div>
                </div>
                <span
                  style={{
                    padding: "4px 12px",
                    borderRadius: "99px",
                    background: `${INV.gold}15`,
                    border: `1px solid ${INV.goldLine}`,
                    fontFamily: FONT_SANS,
                    fontSize: "11px",
                    fontWeight: 600,
                    color: INV.gold,
                  }}
                >
                  Verified
                </span>
              </div>
            </GlassPanel>
          </motion.div>
        ))}
      </motion.div>

      <motion.p
        className="text-center mt-10"
        variants={pickReveal(reducedMotion)}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        style={{
          fontFamily: FONT_SANS,
          fontSize: TYPE.small,
          color: INV.textMuted,
        }}
      >
        {VALIDATION.mapNote}
      </motion.p>
    </InvestorSection>
  );
};

/* ─── Region Badge ─────────────────────────────────────────────────────────── */

const RegionBadge: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      padding: "8px 20px",
      borderRadius: "99px",
      background: INV.surfaceStrong,
      border: `1px solid ${INV.border}`,
      fontFamily: FONT_SANS,
      fontSize: TYPE.small,
      fontWeight: 500,
      color: INV.text,
      boxShadow: `0 4px 16px ${INV.shadow}`,
    }}
  >
    {label}
  </div>
);

/* ─── Validation Map ───────────────────────────────────────────────────────── */

const ValidationMap: React.FC = () => (
  <div
    style={{
      background: INV.surfaceStrong,
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: `1px solid ${INV.border}`,
      borderRadius: "24px",
      padding: "40px",
      boxShadow: `0 8px 40px ${INV.shadow}`,
    }}
  >
    {/* Simple SVG world map representation */}
    <svg
      viewBox="0 0 800 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full"
      aria-label="World map showing Spectra active regions"
      style={{ maxHeight: "260px" }}
    >
      {/* Very simplified world outlines */}
      {/* Americas */}
      <path
        d="M80 80 Q90 70 100 75 Q120 65 125 80 Q130 95 120 120 Q110 140 105 160 Q100 190 110 220 Q115 240 105 255 Q95 265 90 255 Q80 240 85 220 Q75 190 70 165 Q65 140 70 115 Q75 95 80 80Z"
        fill={INV.bgSoft}
        stroke={INV.border}
        strokeWidth="1"
      />
      {/* North America */}
      <path
        d="M100 55 Q140 45 170 55 Q200 60 210 80 Q220 100 215 120 Q205 140 190 145 Q175 148 165 140 Q150 130 145 110 Q135 90 120 80 Q105 70 100 55Z"
        fill={INV.bgSoft}
        stroke={INV.border}
        strokeWidth="1"
      />
      {/* Europe */}
      <path
        d="M360 75 Q380 65 400 70 Q420 75 425 90 Q430 105 420 120 Q410 130 395 128 Q380 125 370 110 Q360 95 360 75Z"
        fill={INV.bgSoft}
        stroke={INV.border}
        strokeWidth="1"
      />
      {/* Africa */}
      <path
        d="M355 135 Q380 125 400 135 Q420 148 425 175 Q430 210 420 240 Q410 265 390 270 Q370 272 355 255 Q340 240 342 210 Q345 180 345 155 Q345 140 355 135Z"
        fill={INV.bgSoft}
        stroke={INV.border}
        strokeWidth="1"
      />
      {/* Asia */}
      <path
        d="M430 60 Q510 50 570 65 Q620 75 640 100 Q655 120 640 145 Q620 165 590 168 Q555 170 530 155 Q500 140 475 120 Q450 100 430 80 Q425 70 430 60Z"
        fill={INV.bgSoft}
        stroke={INV.border}
        strokeWidth="1"
      />
      {/* Australia */}
      <path
        d="M580 200 Q615 190 640 205 Q660 220 655 250 Q648 272 625 278 Q600 282 580 265 Q562 248 565 228 Q568 210 580 200Z"
        fill={INV.bgSoft}
        stroke={INV.border}
        strokeWidth="1"
      />

      {/* Active region markers */}
      {/* US */}
      <ActiveMarker cx={155} cy={105} label="US" />
      {/* Canada */}
      <ActiveMarker cx={150} cy={75} label="CA" />
      {/* Israel */}
      <ActiveMarker cx={428} cy={120} label="IL" />
      {/* Europe */}
      <ActiveMarker cx={390} cy={88} label="EU" />
    </svg>

    <div className="flex items-center justify-center gap-8 mt-6 flex-wrap">
      <LegendItem color={INV.gold} label="Active markets" />
      <LegendItem color={INV.bgSoft} label="Future expansion" />
    </div>
  </div>
);

const ActiveMarker: React.FC<{ cx: number; cy: number; label: string }> = ({ cx, cy, label }) => (
  <g>
    <circle cx={cx} cy={cy} r="14" fill={`${INV.gold}20`} stroke={INV.gold} strokeWidth="1" />
    <circle cx={cx} cy={cy} r="5" fill={INV.gold} />
    <text
      x={cx}
      y={cy + 26}
      textAnchor="middle"
      fill={INV.gold}
      fontSize="9"
      fontFamily="Inter, sans-serif"
      fontWeight="600"
    >
      {label}
    </text>
  </g>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <span
      style={{ width: 10, height: 10, borderRadius: "50%", background: color, border: `1px solid ${INV.border}` }}
    />
    <span style={{ fontFamily: FONT_SANS, fontSize: "12px", color: INV.textMuted }}>{label}</span>
  </div>
);
