import React from "react";
import { motion } from "framer-motion";
import { Section, Eyebrow, Headline } from "../primitives";
import { BeautyDatasetMatrix, DatasetFlywheel, BrandProductIntelligence, SalonAtmosphere } from "../visuals";
import { DATASET } from "../copy";
import { COLORS, SALON, TYPE } from "../tokens";
import { staggerContainer, staggerItem, fadeOnly, VIEWPORT_ONCE } from "../motion";
import {
  PROOF,
  DATA_CATEGORIES,
  COMPETITORS,
  VISIBILITY_COLUMNS,
  FLYWHEEL_STEPS,
  CONFIDENCE_LABEL,
  type Confidence,
} from "../dataMoat";

interface SectionComponentProps {
  reducedMotion?: boolean;
}

const CONFIDENCE_DOT: Record<Confidence, string> = {
  real: SALON.sage,
  proxy: COLORS.gold,
  future: "rgba(155,129,115,0.55)",
};

const PROOF_POINTS: readonly { value: string; label: string }[] = [
  { value: PROOF.salonAccounts.toLocaleString("en-US"), label: "salon accounts" },
  { value: `${(PROOF.services / 1000).toFixed(0)}K`, label: "services analyzed" },
  { value: `${(PROOF.grams / 1_000_000).toFixed(1)}M`, label: "grams measured" },
  { value: PROOF.brands.toLocaleString("en-US"), label: "brands observed" },
  { value: `${PROOF.monthsOfHistory}`, label: "months of history" },
];

/** Section 9 — The Beauty Intelligence Dataset. Uniqueness and defensibility. */
export const BeautyIntelligenceDatasetSection: React.FC<SectionComponentProps> = ({
  reducedMotion = false,
}) => {
  return (
    <Section
      id="dataset"
      reducedMotion={reducedMotion}
      aria-label="The beauty intelligence dataset"
      backdrop={<SalonAtmosphere variant="products" reducedMotion={reducedMotion} />}
    >
      <div className="text-center mb-10">
        <Eyebrow className="mb-8">{DATASET.eyebrow}</Eyebrow>
        <Headline lines={[DATASET.headline]} size="h1" reducedMotion={reducedMotion} />
        <p
          className="mx-auto mt-6"
          style={{ fontSize: TYPE.body, color: COLORS.textMuted, maxWidth: 640 }}
        >
          {DATASET.subhead}
        </p>
      </div>

      {/* Real proof points */}
      <div className="text-center mb-6">
        <span className="uppercase" style={{ fontSize: TYPE.eyebrow, letterSpacing: "0.16em", color: COLORS.textDim }}>
          {DATASET.proofLine}
        </span>
      </div>
      <motion.ul
        className="flex flex-wrap items-stretch justify-center gap-3 list-none mb-20"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {PROOF_POINTS.map((p) => (
          <motion.li
            key={p.label}
            variants={reducedMotion ? fadeOnly : staggerItem}
            className="spv-glass-soft rounded-2xl px-5 py-4 text-center"
            style={{ minWidth: 130 }}
          >
            <div style={{ fontSize: TYPE.h2, fontWeight: 700, color: SALON.copper, lineHeight: 1 }}>
              {p.value}
            </div>
            <div className="mt-1" style={{ fontSize: TYPE.small, color: COLORS.textDim }}>
              {p.label}
            </div>
          </motion.li>
        ))}
      </motion.ul>

      {/* One salon → scale matrix */}
      <div className="text-center mb-8">
        <span style={{ fontSize: TYPE.h2, fontWeight: 600, color: COLORS.warmWhite }}>
          {DATASET.scaleLabel}
        </span>
      </div>
      <div className="mb-24">
        <BeautyDatasetMatrix reducedMotion={reducedMotion} />
      </div>

      {/* Brand & product intelligence — how real products are used in salons */}
      <div className="text-center mb-10">
        <Eyebrow className="mb-6">{DATASET.brandEyebrow}</Eyebrow>
        <Headline lines={[DATASET.brandHeadline]} size="h2" reducedMotion={reducedMotion} />
      </div>
      <div className="mb-24">
        <BrandProductIntelligence reducedMotion={reducedMotion} />
      </div>

      {/* Data categories matrix — what the data enables */}
      <div className="text-center mb-10">
        <Eyebrow className="mb-6">{DATASET.categoriesEyebrow}</Eyebrow>
        <Headline lines={[DATASET.categoriesHeadline]} size="h2" reducedMotion={reducedMotion} />
      </div>
      <motion.ul
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 list-none mb-24"
        variants={reducedMotion ? fadeOnly : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
      >
        {DATA_CATEGORIES.map((c) => (
          <motion.li
            key={c.id}
            variants={reducedMotion ? fadeOnly : staggerItem}
            className="spv-glass-soft rounded-2xl px-5 py-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: TYPE.body, fontWeight: 600, color: COLORS.warmWhite }}>{c.name}</span>
              <span className="flex items-center gap-1.5">
                <span className="rounded-full" style={{ width: 6, height: 6, background: CONFIDENCE_DOT[c.confidence] }} />
                <span className="uppercase" style={{ fontSize: 9, letterSpacing: "0.1em", color: COLORS.textDim }}>
                  {CONFIDENCE_LABEL[c.confidence]}
                </span>
              </span>
            </div>
            <p style={{ fontSize: TYPE.small, color: COLORS.textMuted }}>{c.enables}</p>
          </motion.li>
        ))}
      </motion.ul>

      {/* Competitive visibility */}
      <div className="text-center mb-10">
        <Eyebrow className="mb-6">{DATASET.visibilityEyebrow}</Eyebrow>
        <Headline lines={[DATASET.visibilityHeadline]} size="h2" reducedMotion={reducedMotion} />
      </div>
      <div
        className="spv-glass-soft mx-auto mb-6 overflow-x-auto rounded-2xl"
        style={{ maxWidth: 1100 }}
      >
        <table className="w-full" style={{ borderCollapse: "collapse", minWidth: 720 }}>
          <thead>
            <tr>
              <th
                className="text-left px-4 py-3"
                style={{ fontSize: TYPE.small, color: COLORS.textDim, fontWeight: 500 }}
              >
                Platform
              </th>
              {VISIBILITY_COLUMNS.map((col) => (
                <th
                  key={col.id}
                  className="px-2 py-3"
                  style={{ fontSize: 11, color: COLORS.textDim, fontWeight: 500 }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPETITORS.map((row) => {
              const isUs = row.id === "salonai";
              return (
                <tr
                  key={row.id}
                  style={{
                    borderTop: `1px solid ${COLORS.panelBorder}`,
                    background: isUs ? "rgba(232,185,168,0.20)" : "transparent",
                  }}
                >
                  <td
                    className="text-left px-4 py-3 whitespace-nowrap"
                    style={{
                      fontSize: TYPE.small,
                      fontWeight: isUs ? 700 : 500,
                      color: isUs ? COLORS.gold : COLORS.warmWhite,
                    }}
                  >
                    {row.name}
                  </td>
                  {VISIBILITY_COLUMNS.map((col) => {
                    const on = !!row.sees[col.id];
                    return (
                      <td key={col.id} className="text-center px-2 py-3" style={{ fontSize: 14 }}>
                        <span
                          style={{
                            color: on ? (isUs ? COLORS.gold : SALON.sage) : "rgba(120,80,60,0.28)",
                          }}
                          aria-label={on ? "sees" : "does not see"}
                        >
                          {on ? "\u25CF" : "\u25CB"}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-center mb-24" style={{ fontSize: TYPE.body, color: COLORS.warmWhite, fontWeight: 500 }}>
        {DATASET.visibilityClosing}
      </p>

      {/* Flywheel */}
      <div className="text-center mb-10">
        <Eyebrow className="mb-6">{DATASET.flywheelEyebrow}</Eyebrow>
        <Headline lines={[DATASET.flywheelHeadline]} size="h2" reducedMotion={reducedMotion} />
      </div>
      <div className="mb-24">
        <DatasetFlywheel steps={FLYWHEEL_STEPS} reducedMotion={reducedMotion} />
      </div>

      {/* Investor takeaway */}
      <div className="text-center mx-auto" style={{ maxWidth: 760 }}>
        <p style={{ fontSize: TYPE.body, color: COLORS.textMuted }}>{DATASET.takeawayLead}</p>
        <p
          className="mt-3"
          style={{
            fontSize: TYPE.h2,
            fontWeight: 600,
            backgroundImage: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.gold4})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          {DATASET.takeaway}
        </p>
      </div>
    </Section>
  );
};
