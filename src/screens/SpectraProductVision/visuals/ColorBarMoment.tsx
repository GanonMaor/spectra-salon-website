import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Glyph, type GlyphName } from "./Glyph";
import { BeautyIconFrame } from "../primitives/glass";
import { COLORS, SALON, TYPE } from "../tokens";
import { EASE_OUT } from "../motion";

export interface CaptureItem {
  label: string;
  glyph: GlyphName;
  value: string;
}

interface ColorBarMomentProps {
  captures: readonly CaptureItem[];
  reducedMotion?: boolean;
}

/** Count a grams readout up to `target` once the scene scrolls into view. */
function useGrams(target: number, reduced: boolean, active: boolean): number {
  const [v, setV] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced || !active) {
      setV(target);
      return;
    }
    const start = performance.now();
    const ms = 1100;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      setV(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, reduced, active]);
  return v;
}

/**
 * The Spectra "Color Bar moment": a code-generated micro-scene showing that the
 * instant a colorist mixes a formula on the connected scale, Spectra captures
 * the full operational picture. The capture chips light up in sequence; the
 * scale shows a live grams readout. Static under reduced motion.
 */
export const ColorBarMoment: React.FC<ColorBarMomentProps> = ({
  captures,
  reducedMotion = false,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px" });
  const grams = useGrams(42.6, reducedMotion, inView);

  return (
    <div ref={ref} className="w-full" style={{ maxWidth: 1080, margin: "0 auto" }}>
      {/* The scene: customer → bowl + brush → Spectra scale */}
      <div className="flex items-center justify-center gap-4 sm:gap-10 mb-12 flex-wrap">
        <SceneNode glyph="customer" caption="Client in the chair" />
        <Flow reducedMotion={reducedMotion} />
        <SceneNode glyph="stylist" caption="Colorist consults" />
        <Flow reducedMotion={reducedMotion} />
        <SceneNode glyph="bowl" caption="Formula mixed" accentGlyph="brush" />
        <Flow reducedMotion={reducedMotion} />
        <SceneNode glyph="bottle" caption="Products selected" accentGlyph="swatch" />
        <Flow reducedMotion={reducedMotion} />

        {/* Spectra scale device with live readout */}
        <motion.div
          className="spv-glass relative rounded-3xl px-8 py-7 flex flex-col items-center"
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.94 }}
          animate={inView ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          <span style={{ color: COLORS.gold }}>
            <Glyph name="scale" size={30} accent />
          </span>
          <span
            className="mt-2"
            style={{
              fontSize: "clamp(28px,4vw,44px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: COLORS.warmWhite,
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {grams.toFixed(1)}
            <span style={{ fontSize: "0.4em", color: COLORS.gold, marginLeft: 4 }}>g</span>
          </span>
          <span
            className="uppercase mt-1"
            style={{ fontSize: 10, letterSpacing: "0.16em", color: COLORS.textDim }}
          >
            Spectra measures
          </span>
        </motion.div>
      </div>

      <motion.div
        className="spv-glass-soft mb-8 rounded-full px-4 py-3 overflow-hidden"
        initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: EASE_OUT, delay: reducedMotion ? 0 : 0.25 }}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          {["Customer", "Stylist", "Formula", "Products", "Grams", "Cost", "Waste", "Profitability"].map((label, i) => (
            <React.Fragment key={label}>
              <span
                className="uppercase"
                style={{ fontSize: 10, letterSpacing: "0.12em", color: i >= 4 ? COLORS.gold : COLORS.textMuted }}
              >
                {label}
              </span>
              {i < 7 ? <span style={{ color: "rgba(185,104,82,0.5)" }}>→</span> : null}
            </React.Fragment>
          ))}
        </div>
      </motion.div>

      {/* What Spectra captures in that single moment */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {captures.map((c, i) => (
          <motion.div
            key={c.label}
            className="spv-glass-soft rounded-2xl px-4 py-4 flex flex-col gap-2"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: reducedMotion ? 0 : 0.3 + i * 0.12 }}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: COLORS.gold }}>
                <Glyph name={c.glyph} size={18} accent />
              </span>
              <span className="uppercase" style={{ fontSize: 10, letterSpacing: "0.12em", color: COLORS.textDim }}>
                {c.label}
              </span>
            </div>
            <span style={{ fontSize: TYPE.small, color: COLORS.warmWhite, fontWeight: 500 }}>{c.value}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const SceneNode: React.FC<{ glyph: GlyphName; caption: string; accentGlyph?: GlyphName }> = ({
  glyph,
  caption,
  accentGlyph,
}) => (
  <div className="flex flex-col items-center gap-2.5" style={{ width: 110 }}>
    <span className="relative">
      <BeautyIconFrame size={64} shape="round">
        <Glyph name={glyph} size={28} accent />
      </BeautyIconFrame>
      {accentGlyph ? (
        <span
          className="absolute -right-1 -bottom-1 flex items-center justify-center rounded-full"
          style={{
            width: 26,
            height: 26,
            color: SALON.copper,
            background: SALON.ivory,
            border: `1px solid ${SALON.borderRose}`,
            boxShadow: "0 4px 12px rgba(185,104,82,0.18)",
          }}
        >
          <Glyph name={accentGlyph} size={14} />
        </span>
      ) : null}
    </span>
    <span className="text-center" style={{ fontSize: 11, color: COLORS.textMuted }}>
      {caption}
    </span>
  </div>
);

const Flow: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <div className="relative hidden sm:block" style={{ width: 48, height: 2 }}>
    <div className="absolute inset-0" style={{ background: "rgba(213,154,134,0.35)" }} />
    {!reducedMotion && (
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 rounded-full"
        style={{ width: 6, height: 6, background: SALON.copper }}
        animate={{ left: ["-4px", "48px"], opacity: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    )}
  </div>
);
