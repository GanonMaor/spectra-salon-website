/**
 * Layer 2 — What The Industry Can't See
 * Slides 6–12: real intelligence from actual salon data.
 */

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  revealUp,
  fadeIn,
  stagger,
  staggerItem,
  DUR,
  EASE_OUT,
} from "../../SpectraInvestorExperience/visuals/demo/motion";
import { INV } from "../../SpectraInvestorExperience/tokens";
import { GOLD } from "../copy";
import previewData from "../../../data/color-intelligence-preview-data.json";

const CREAM = "#FBF6EF";
const CREAM_SOFT = "rgba(251,246,239,0.72)";
const CREAM_FAINT = "rgba(251,246,239,0.42)";

const GoldPill: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-2 mb-10">
    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: GOLD }} />
    <span className="text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
      {children}
    </span>
  </div>
);

const DataBadge: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div
    className="rounded-2xl p-5 flex flex-col gap-1"
    style={{
      background: "rgba(255,255,255,0.055)",
      border: "1px solid rgba(255,255,255,0.10)",
    }}
  >
    <span className="text-3xl sm:text-4xl font-light tabular-nums" style={{ color: GOLD }}>
      {value}
    </span>
    <span className="text-[12px] font-light leading-snug" style={{ color: CREAM_SOFT }}>
      {label}
    </span>
  </div>
);

/* ─── Slide 6: Real Data From Active Salons ─── */
export const RealDataFromSalonsSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;
  const t = previewData.totals;

  const stats = [
    { value: t.formulas.toLocaleString(), label: "individual formulas" },
    { value: t.productUsages.toLocaleString(), label: "product / color usages" },
    { value: t.uniqueClients.toLocaleString(), label: "unique clients served" },
    { value: t.uniqueShades.toString(), label: "distinct color shades" },
    { value: t.uniqueSeries.toString(), label: "product series tracked" },
    { value: t.uniqueBrands.toString(), label: "professional brands" },
  ];

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: "#0C0A08" }}
      aria-label="Real data from active salons"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(60% 65% at 50% 50%, rgba(193,154,99,0.09), transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible">
          <GoldPill>Layer 2 · Real Data</GoldPill>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:gap-16 mb-10">
          <motion.div
            variants={rm ? fadeIn : revealUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.06 }}
            className="flex-1"
          >
            <h2
              className="font-light leading-[1.06] tracking-[-0.02em] mb-4"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: CREAM }}
            >
              From 6 active salons in Israel.
            </h2>
            <p className="text-base font-light leading-relaxed" style={{ color: CREAM_SOFT }}>
              Based on real salon activity — not surveys, not samples, not shipping data.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: DUR.slow, delay: rm ? 0 : 0.55 }}
            className="mt-6 lg:mt-0 rounded-2xl px-5 py-4"
            style={{
              background: `rgba(193,154,99,0.10)`,
              border: `1px solid rgba(193,154,99,0.25)`,
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-1" style={{ color: GOLD }}>
              Data source
            </p>
            <p className="text-[13px] font-light leading-snug" style={{ color: CREAM_SOFT }}>
              Point-of-use capture · Color Bar workflow · 2024–2025
            </p>
          </motion.div>
        </div>

        <motion.div
          variants={rm ? fadeIn : stagger}
          initial="hidden"
          animate="visible"
          transition={{ delay: rm ? 0 : 0.45 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={rm ? fadeIn : staggerItem}>
              <DataBadge value={s.value} label={s.label} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Slide 7: What Colors Are Salons Actually Using? ─── */
export const ColorFamiliesSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;
  const families = previewData.topFamilies;
  const temps = previewData.topTemperatures;

  const familyColors: Record<string, string> = {
    "Brown / dark blonde": "#8B6B3D",
    "Blonde": "#D4B483",
    "Blonde / lightening": "#E8D5A3",
    "Fashion / corrective tone": "#C97B84",
    "Bond support": "#7A9EB5",
    "Dark brown / black": "#3D2B1F",
  };

  const tempColors: Record<string, string> = {
    Neutral: "#B8A898",
    Cool: "#A3B5C8",
    Unknown: "#5A5A5A",
    Warm: "#C49A5A",
    Warm_alt: "#D4935A",
  };

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: "#0E0B09" }}
      aria-label="Color families distribution"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(55% 60% at 18% 48%, rgba(193,154,99,0.07), transparent 68%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible">
          <GoldPill>Layer 2 · Color Families</GoldPill>
        </motion.div>

        <motion.h2
          variants={rm ? fadeIn : revealUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.06 }}
          className="font-light leading-[1.06] tracking-[-0.02em] mb-3"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.6rem)", color: CREAM }}
        >
          What colors are salons actually using?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rm ? 0 : 0.28 }}
          className="text-base font-light mb-10"
          style={{ color: CREAM_FAINT }}
        >
          By shade family and temperature — across 49,108 product usages.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Shade families */}
          <motion.div
            variants={rm ? fadeIn : stagger}
            initial="hidden"
            animate="visible"
            transition={{ delay: rm ? 0 : 0.42 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-5" style={{ color: GOLD }}>
              By Family
            </p>
            <div className="space-y-3">
              {families.map((f) => (
                <motion.div key={f.name} variants={rm ? fadeIn : staggerItem}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          background: familyColors[f.name] ?? "#8B8B7A",
                          boxShadow: `0 0 6px ${(familyColors[f.name] ?? "#8B8B7A")}88`,
                        }}
                      />
                      <span className="text-sm font-light" style={{ color: CREAM_SOFT }}>
                        {f.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: CREAM }}>
                      {f.pct}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${f.pct}%` }}
                      transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: familyColors[f.name] ?? "#8B8B7A" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Temperature */}
          <motion.div
            variants={rm ? fadeIn : stagger}
            initial="hidden"
            animate="visible"
            transition={{ delay: rm ? 0 : 0.62 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-5" style={{ color: GOLD }}>
              By Temperature
            </p>
            <div className="space-y-3">
              {temps.filter((t) => t.name !== "Unknown").map((t) => (
                <motion.div key={t.name} variants={rm ? fadeIn : staggerItem}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: tempColors[t.name] ?? "#8B8B7A" }}
                      />
                      <span className="text-sm font-light" style={{ color: CREAM_SOFT }}>
                        {t.name}
                      </span>
                    </div>
                    <span className="text-sm font-semibold tabular-nums" style={{ color: CREAM }}>
                      {t.pct}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${t.pct}%` }}
                      transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: tempColors[t.name] ?? "#8B8B7A" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, delay: rm ? 0 : 1.3 }}
              className="mt-8 rounded-xl p-4"
              style={{ background: "rgba(163,181,200,0.09)", border: "1px solid rgba(163,181,200,0.18)" }}
            >
              <p className="text-[13px] font-light leading-relaxed" style={{ color: CREAM_SOFT }}>
                <span className="font-semibold" style={{ color: CREAM }}>35% cool-toned</span> — reflecting strong
                salon demand for ash, pearl, and blue-based color corrections.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ─── Slide 8: Most Used Shades ─── */
export const MostUsedShadesSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;
  const topShades = previewData.topShades
    .filter((s) => !["Bond support", "Blonde / lightening"].includes(s.family))
    .slice(0, 6);

  const familyColor: Record<string, string> = {
    "Brown / dark blonde": "#9B7B4D",
    "Blonde": "#D4B483",
    "Fashion / corrective tone": "#C97B84",
    "Dark brown / black": "#5A3D2E",
  };

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: "#0C0A08" }}
      aria-label="Most used color shades"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(50% 55% at 80% 45%, rgba(193,154,99,0.07), transparent 68%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible">
          <GoldPill>Layer 2 · Most Used Shades</GoldPill>
        </motion.div>

        <motion.h2
          variants={rm ? fadeIn : revealUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.06 }}
          className="font-light leading-[1.06] tracking-[-0.02em] mb-2"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.6rem)", color: CREAM }}
        >
          The most-used color shades — ranked by actual usage.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rm ? 0 : 0.3 }}
          className="text-base font-light mb-10"
          style={{ color: CREAM_FAINT }}
        >
          Measured in grams applied across all services and stylists.
        </motion.p>

        <motion.div
          variants={rm ? fadeIn : stagger}
          initial="hidden"
          animate="visible"
          transition={{ delay: rm ? 0 : 0.42 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {topShades.map((shade, i) => {
            const color = familyColor[shade.family] ?? "#9B8B7A";
            return (
              <motion.div
                key={shade.series + shade.shade}
                variants={rm ? fadeIn : staggerItem}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.055)",
                  border: `1px solid ${i === 0 ? "rgba(193,154,99,0.3)" : "rgba(255,255,255,0.09)"}`,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: color, boxShadow: `0 0 7px ${color}88` }}
                    />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD }}>
                      {shade.series}
                    </span>
                  </div>
                  <span className="text-[10px] font-light tabular-nums" style={{ color: CREAM_FAINT }}>
                    #{i + 1}
                  </span>
                </div>

                <div className="text-2xl font-light mb-1" style={{ color: CREAM }}>
                  {shade.shade}
                </div>
                <div className="text-[11px] font-light mb-3 leading-snug" style={{ color: CREAM_FAINT }}>
                  {shade.brand === "L'OREAL PROFESSIONNEL" ? "L'Oréal Professionnel" : shade.brand}
                </div>

                <p className="text-[12px] font-light leading-snug mb-4 italic" style={{ color: CREAM_SOFT }}>
                  {shade.humanDescription}
                </p>

                <div className="flex gap-3 text-[12px]">
                  <div>
                    <span className="font-semibold tabular-nums" style={{ color: CREAM }}>
                      {shade.usageCount.toLocaleString()}
                    </span>
                    <span className="ml-1 font-light" style={{ color: CREAM_FAINT }}>
                      uses
                    </span>
                  </div>
                  <div className="w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <div>
                    <span className="font-semibold tabular-nums" style={{ color: CREAM }}>
                      {Math.round(shade.totalGrams / 1000).toLocaleString()}kg
                    </span>
                    <span className="ml-1 font-light" style={{ color: CREAM_FAINT }}>
                      applied
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Slide 9: Shade Usage By Service ─── */
export const ShadeByServiceSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;

  const services = [
    {
      name: "Root Color",
      key: "Root color",
      desc: "The workhorse service — 5 shades dominate 72% of root coverage",
      color: "#9B7B4D",
    },
    {
      name: "Toner for Highlights",
      key: "Toner for highlights",
      desc: "Cool ash and pearl tones — Dia Light 10.12 leads by a wide margin",
      color: "#A3B5C8",
    },
    {
      name: "Balayage / Ombré",
      key: "Ombre/Balyage",
      desc: "Lighteners with bond support — JUL + Olaplex combo dominant",
      color: "#D4B483",
    },
    {
      name: "Color Lengths",
      key: "Color lengths",
      desc: "Gloss and toner products — refreshing and color-correcting",
      color: "#C97B84",
    },
  ];

  const serviceShades = previewData.serviceShades as Record<string, { name: string; value: number }[]>;

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: "#0E0B09" }}
      aria-label="Shade usage by service"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(50% 55% at 15% 52%, rgba(193,154,99,0.06), transparent 68%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible">
          <GoldPill>Layer 2 · Shade by Service</GoldPill>
        </motion.div>

        <motion.h2
          variants={rm ? fadeIn : revealUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.06 }}
          className="font-light leading-[1.06] tracking-[-0.02em] mb-2"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.6rem)", color: CREAM }}
        >
          What shades are used for which services?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rm ? 0 : 0.3 }}
          className="text-base font-light mb-10"
          style={{ color: CREAM_FAINT }}
        >
          Each service type has a distinct product fingerprint.
        </motion.p>

        <motion.div
          variants={rm ? fadeIn : stagger}
          initial="hidden"
          animate="visible"
          transition={{ delay: rm ? 0 : 0.42 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {services.map((svc) => {
            const shades = serviceShades[svc.key] ?? [];
            return (
              <motion.div
                key={svc.key}
                variants={rm ? fadeIn : staggerItem}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.055)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: svc.color }}
                  />
                  <span className="text-sm font-semibold" style={{ color: CREAM }}>
                    {svc.name}
                  </span>
                </div>
                <p className="text-[11px] font-light mb-4 leading-snug" style={{ color: CREAM_FAINT }}>
                  {svc.desc}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {shades.slice(0, 5).map((s) => (
                    <div
                      key={s.name}
                      className="rounded-full px-2.5 py-1 flex items-center gap-1.5"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <span className="text-[11px] font-medium" style={{ color: CREAM_SOFT }}>
                        {s.name}
                      </span>
                      <span className="text-[10px] font-light" style={{ color: CREAM_FAINT }}>
                        ×{s.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

/* ─── Slide 10: Formula Mixing Intelligence ─── */
export const FormulaMixingIntelligenceSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;
  const t = previewData.totals;

  const pairs = previewData.topBrandPairs.slice(0, 6);

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: "#0C0A08" }}
      aria-label="Formula mixing intelligence"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(55% 60% at 60% 48%, rgba(193,154,99,0.07), transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible">
          <GoldPill>Layer 2 · Formula Mixing</GoldPill>
        </motion.div>

        <div className="flex flex-col lg:flex-row lg:gap-16">
          <div className="flex-1">
            <motion.h2
              variants={rm ? fadeIn : revealUp}
              initial="hidden"
              animate="visible"
              transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.06 }}
              className="font-light leading-[1.06] tracking-[-0.02em] mb-4"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.6rem)", color: CREAM }}
            >
              Stylists mix brands. No one tracks this.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: rm ? 0 : 0.3 }}
              className="text-base font-light mb-8 leading-relaxed max-w-[440px]"
              style={{ color: CREAM_SOFT }}
            >
              {t.multiBrandPct}% of all formulas combine products from multiple brands in a single service.
              This cross-brand mixing behavior is invisible to every manufacturer — except Spectra.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, delay: rm ? 0 : 0.55 }}
              className="inline-flex items-center gap-3 rounded-2xl px-5 py-4"
              style={{
                background: "rgba(193,154,99,0.10)",
                border: "1px solid rgba(193,154,99,0.25)",
              }}
            >
              <span className="text-3xl font-light tabular-nums" style={{ color: GOLD }}>
                {t.multiBrandFormulas.toLocaleString()}
              </span>
              <span className="text-[13px] font-light" style={{ color: CREAM_SOFT }}>
                multi-brand
                <br />
                formulas captured
              </span>
            </motion.div>
          </div>

          {/* Cross-brand pairs */}
          <motion.div
            variants={rm ? fadeIn : stagger}
            initial="hidden"
            animate="visible"
            transition={{ delay: rm ? 0 : 0.6 }}
            className="mt-10 lg:mt-0 flex-1 space-y-2"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: GOLD }}>
              Most common cross-brand combinations
            </p>
            {pairs.map((p) => (
              <motion.div
                key={p.name}
                variants={rm ? fadeIn : staggerItem}
                className="flex items-center justify-between py-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <span className="text-sm font-light" style={{ color: CREAM_SOFT }}>
                  {p.name}
                </span>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${Math.round((p.value / pairs[0].value) * 80)}px`,
                      background: `linear-gradient(90deg, ${GOLD}, rgba(193,154,99,0.35))`,
                      minWidth: "16px",
                    }}
                  />
                  <span className="text-sm font-semibold tabular-nums w-12 text-right" style={{ color: CREAM }}>
                    {p.value.toLocaleString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ─── Slide 11: Blonde Intelligence ─── */
export const BlondeIntelligenceSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;

  const blondeShades = previewData.topShades
    .filter(
      (s) =>
        s.family === "Blonde" ||
        (s.temperature === "Cool" && s.family === "Brown / dark blonde" && s.shade.startsWith("8")),
    )
    .slice(0, 5);

  const toners = previewData.serviceShades["Toner for highlights"] ?? [];

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: "#0A0C10" }}
      aria-label="Blonde intelligence"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(60% 65% at 55% 45%, rgba(163,181,200,0.10), transparent 68%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible">
          <GoldPill>Layer 2 · Blonde Intelligence</GoldPill>
        </motion.div>

        <motion.h2
          variants={rm ? fadeIn : revealUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.06 }}
          className="font-light leading-[1.06] tracking-[-0.02em] mb-3"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.6rem)", color: CREAM }}
        >
          Blonde is a market segment, not a shade.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rm ? 0 : 0.3 }}
          className="text-base font-light mb-10"
          style={{ color: CREAM_FAINT }}
        >
          20% of all formulas are blonde — driven by lightening, toning, and cool-ash demand.
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Blonde shades */}
          <motion.div
            variants={rm ? fadeIn : stagger}
            initial="hidden"
            animate="visible"
            transition={{ delay: rm ? 0 : 0.4 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: GOLD }}>
              Most used blonde shades
            </p>
            {blondeShades.map((s) => (
              <motion.div
                key={s.series + s.shade}
                variants={rm ? fadeIn : staggerItem}
                className="flex items-center justify-between py-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div>
                  <span className="text-sm font-semibold" style={{ color: CREAM }}>
                    {s.shade}
                  </span>
                  <span className="text-[11px] font-light ml-2" style={{ color: CREAM_FAINT }}>
                    {s.series}
                  </span>
                  <p className="text-[11px] font-light mt-0.5 leading-snug" style={{ color: "rgba(163,181,200,0.6)" }}>
                    {s.temperature} · {s.humanDescription?.split("—")[0]?.trim()}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums ml-4 flex-shrink-0" style={{ color: CREAM }}>
                  {s.usageCount.toLocaleString()} uses
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Toner patterns */}
          <motion.div
            variants={rm ? fadeIn : stagger}
            initial="hidden"
            animate="visible"
            transition={{ delay: rm ? 0 : 0.6 }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] mb-4" style={{ color: GOLD }}>
              Toner patterns after highlights
            </p>
            {toners.slice(0, 5).map((t) => (
              <motion.div
                key={t.name}
                variants={rm ? fadeIn : staggerItem}
                className="flex items-center justify-between py-3 border-b"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: "#A3B5C8" }}
                  />
                  <span className="text-sm font-light" style={{ color: CREAM_SOFT }}>
                    Dia Light <span className="font-semibold" style={{ color: CREAM }}>{t.name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <div
                    className="h-0.5 rounded-full"
                    style={{
                      width: `${Math.round((t.value / toners[0].value) * 60)}px`,
                      background: "rgba(163,181,200,0.5)",
                      minWidth: "8px",
                    }}
                  />
                  <span className="text-sm font-semibold tabular-nums" style={{ color: CREAM }}>
                    {t.value}
                  </span>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.slow, delay: rm ? 0 : 1.3 }}
              className="mt-6 rounded-xl p-4"
              style={{ background: "rgba(163,181,200,0.08)", border: "1px solid rgba(163,181,200,0.18)" }}
            >
              <p className="text-[12px] font-light leading-relaxed" style={{ color: CREAM_SOFT }}>
                Dia Light 10.12 and 10.13 account for{" "}
                <span className="font-semibold" style={{ color: "#A3B5C8" }}>
                  {Math.round(((toners[0]?.value ?? 0) + (toners[1]?.value ?? 0)) /
                    toners.slice(0, 5).reduce((s, t) => s + t.value, 0) * 100)}
                  %
                </span>{" "}
                of all post-highlight toners — a clear market signal for cool-ash finish demand.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/* ─── Slide 12: Dictionary Drilldown ─── */
export const DictionaryDrilldownSlide: React.FC = () => {
  const rm = useReducedMotion() ?? false;

  const path = [
    { step: "Category", value: "Blonde", color: "#D4B483" },
    { step: "Temperature", value: "Cool", color: "#A3B5C8" },
    { step: "Brand", value: "L'Oréal Professionnel", color: GOLD },
    { step: "Series", value: "Dia Light", color: GOLD },
    { step: "Shade", value: "10.12", color: CREAM },
    { step: "Usage", value: "604 formulas", color: "#8BC49A" },
    { step: "Service", value: "Toner for Highlights", color: "#C97B84" },
    { step: "Salons", value: "6 active salons", color: CREAM_SOFT },
  ];

  const details = {
    level: "Level 10",
    family: "Blonde",
    temperature: "Cool",
    reflection: "Ash + Iridescent",
    human: "Icy platinum blonde toner — pearl/iridescent finish",
    usageCount: 604,
    formulaCount: 582,
    topService: "Toner for highlights",
    companionShades: ["10.13", "9.13", "GLOSS CLEAR 250ml", "9.11"],
    dot: "#E8E4FF",
  };

  return (
    <section
      className="relative w-full h-full flex flex-col justify-center overflow-hidden"
      style={{ background: "#0E0B09" }}
      aria-label="Dictionary drilldown"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(45% 50% at 75% 45%, rgba(163,181,200,0.08), transparent 65%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 py-20">
        <motion.div variants={rm ? fadeIn : revealUp} initial="hidden" animate="visible">
          <GoldPill>Layer 2 · Traceability</GoldPill>
        </motion.div>

        <motion.h2
          variants={rm ? fadeIn : revealUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: DUR.enter, ease: EASE_OUT, delay: rm ? 0 : 0.06 }}
          className="font-light leading-[1.06] tracking-[-0.02em] mb-2"
          style={{ fontSize: "clamp(1.8rem, 4vw, 3.2rem)", color: CREAM }}
        >
          Every insight traces back to a specific shade.
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: rm ? 0 : 0.28 }}
          className="text-base font-light mb-10"
          style={{ color: CREAM_FAINT }}
        >
          From market signal to service to stylist — the full chain is captured.
        </motion.p>

        <div className="flex flex-col lg:flex-row lg:gap-10">
          {/* Drilldown chain */}
          <motion.div
            variants={rm ? fadeIn : stagger}
            initial="hidden"
            animate="visible"
            transition={{ delay: rm ? 0 : 0.4 }}
            className="flex-1"
          >
            <div className="flex flex-col gap-0">
              {path.map((p, i) => (
                <motion.div key={p.step} variants={rm ? fadeIn : staggerItem} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                      style={{ background: p.color, boxShadow: `0 0 6px ${p.color}66` }}
                    />
                    {i < path.length - 1 && (
                      <div className="w-px flex-1 mt-1 mb-1" style={{ background: "rgba(255,255,255,0.08)", minHeight: "16px" }} />
                    )}
                  </div>
                  <div className="pb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: p.color }}>
                      {p.step}
                    </span>
                    <span className="ml-2 text-sm font-light" style={{ color: CREAM_SOFT }}>
                      {p.value}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Shade detail card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: DUR.slow, ease: EASE_OUT, delay: rm ? 0 : 0.9 }}
            className="mt-8 lg:mt-0 w-full lg:w-72 rounded-2xl p-5 flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(163,181,200,0.25)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: details.dot, boxShadow: `0 0 8px ${details.dot}88` }}
              />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD }}>
                Dia Light · {details.level}
              </span>
            </div>

            <div className="text-4xl font-light mb-3" style={{ color: CREAM }}>
              10.12
            </div>

            <div className="space-y-1.5 mb-4">
              {[
                { k: "Family", v: details.family },
                { k: "Temp", v: details.temperature },
                { k: "Reflect", v: details.reflection },
              ].map((r) => (
                <div key={r.k} className="flex gap-2 text-[12px]">
                  <span className="w-[52px] flex-shrink-0 font-medium" style={{ color: CREAM_FAINT }}>
                    {r.k}
                  </span>
                  <span className="font-light" style={{ color: CREAM_SOFT }}>
                    {r.v}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] font-light italic mb-4 leading-snug" style={{ color: CREAM_SOFT }}>
              {details.human}
            </p>

            <div className="flex gap-3 text-[12px] mb-4">
              <div>
                <span className="font-semibold tabular-nums" style={{ color: CREAM }}>
                  {details.usageCount}
                </span>
                <span className="ml-1" style={{ color: CREAM_FAINT }}>
                  uses
                </span>
              </div>
              <div className="w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div>
                <span className="font-semibold tabular-nums" style={{ color: CREAM }}>
                  {details.formulaCount}
                </span>
                <span className="ml-1" style={{ color: CREAM_FAINT }}>
                  formulas
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1.5" style={{ color: CREAM_FAINT }}>
                Often mixed with
              </p>
              <div className="flex flex-wrap gap-1">
                {details.companionShades.map((c) => (
                  <span
                    key={c}
                    className="rounded-full px-2 py-0.5 text-[10px]"
                    style={{ background: "rgba(163,181,200,0.10)", color: "#A3B5C8", border: "1px solid rgba(163,181,200,0.2)" }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
