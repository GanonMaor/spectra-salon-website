import React from "react";
import { motion } from "framer-motion";
import { INV, TYPE, FONT_SANS, FONT_SERIF } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, fadeItem, VIEWPORT_ONCE, pickReveal } from "../motion";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy, GlassPanel } from "../primitives";
import { SALON_OS } from "../copy";

interface Props {
  reducedMotion?: boolean;
}

export const SalonOSSection: React.FC<Props> = ({ reducedMotion = false }) => {
  return (
    <InvestorSection
      id="salonos"
      aria-label="Building SalonOS — the operating system"
      reducedMotion={reducedMotion}
    >
      <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-center">
        {/* Left: headline + narrative */}
        <div>
          <InvestorEyebrow className="mb-6">{SALON_OS.eyebrow}</InvestorEyebrow>
          <InvestorHeadline size="h1" as="h2" className="mb-3">
            {SALON_OS.headlineLine1}
          </InvestorHeadline>
          <InvestorHeadline size="h1" as="h2" className="mb-8" gradient>
            {SALON_OS.headlineLine2}
          </InvestorHeadline>
          <InvestorCopy className="mb-10">{SALON_OS.subhead}</InvestorCopy>

          {/* Switching cost insight */}
          <motion.div
            variants={pickReveal(reducedMotion)}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
          >
            <div
              style={{
                padding: "24px 28px",
                borderRadius: "16px",
                background: `${INV.gold}10`,
                border: `1px solid ${INV.goldLine}`,
              }}
            >
              <p
                style={{
                  fontFamily: FONT_SERIF,
                  fontSize: TYPE.h3,
                  fontWeight: 400,
                  fontStyle: "italic",
                  color: INV.gold,
                  lineHeight: 1.4,
                }}
              >
                {SALON_OS.closing}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right: OS flow diagram */}
        <motion.div
          variants={pickReveal(reducedMotion)}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
        >
          <OperatingSystemFlow reducedMotion={reducedMotion} />
        </motion.div>
      </div>
    </InvestorSection>
  );
};

/* ─── Operating System Flow ────────────────────────────────────────────────── */

const OperatingSystemFlow: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <div
    style={{
      background: INV.surfaceStrong,
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: `1px solid ${INV.border}`,
      borderRadius: "24px",
      padding: "36px",
      boxShadow: `0 12px 50px ${INV.shadow}`,
    }}
  >
    {/* OS label */}
    <div className="flex items-center justify-between mb-8">
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: TYPE.eyebrow,
          fontWeight: 600,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: INV.textMuted,
        }}
      >
        SalonOS — Unified Layer
      </div>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: INV.success,
          boxShadow: `0 0 8px ${INV.success}`,
        }}
      />
    </div>

    {/* Flow steps */}
    <div className="flex flex-col gap-0">
      {SALON_OS.flow.map((step, i) => (
        <React.Fragment key={step.label}>
          <motion.div
            variants={reducedMotion ? fadeItem : staggerItem}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT_ONCE}
            transition={{ delay: i * 0.06 }}
          >
            <FlowStep
              label={step.label}
              note={step.note}
              index={i}
              isLast={i === SALON_OS.flow.length - 1}
            />
          </motion.div>

          {i < SALON_OS.flow.length - 1 && (
            <div
              aria-hidden
              style={{
                width: "1.5px",
                height: "20px",
                background: `linear-gradient(to bottom, ${INV.gold}80, ${INV.gold}30)`,
                marginLeft: "19px",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

interface FlowStepProps {
  label: string;
  note: string;
  index: number;
  isLast: boolean;
}

const FlowStep: React.FC<FlowStepProps> = ({ label, note, index, isLast }) => (
  <div className="flex items-center gap-4">
    {/* Node */}
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: isLast ? INV.gold : `${INV.gold}18`,
        border: `1.5px solid ${isLast ? INV.gold : INV.goldLine}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontFamily: FONT_SANS,
        fontSize: "12px",
        fontWeight: 700,
        color: isLast ? "#fff" : INV.gold,
      }}
    >
      {index + 1}
    </div>

    {/* Labels */}
    <div>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: "15px",
          fontWeight: 600,
          color: INV.text,
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: "12px",
          color: INV.textMuted,
        }}
      >
        {note}
      </div>
    </div>
  </div>
);
