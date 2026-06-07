import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NetworkConstellation } from "../../SpectraInvestorExperience/visuals/NetworkConstellation";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { SlideTheme, INK, LayerNumber } from "../theme";
import { LayerBadge } from "../visuals/LayerBadge";

type ScrimVariant = "center" | "left" | "veil" | "both" | "split-right";

const SCRIMS: Record<ScrimVariant, string> = {
  center:
    "linear-gradient(180deg,rgba(15,11,9,0.60) 0%,rgba(15,11,9,0.48) 45%,rgba(15,11,9,0.84) 100%)",
  left:
    "linear-gradient(100deg,rgba(15,11,9,0.93) 0%,rgba(15,11,9,0.70) 50%,rgba(15,11,9,0.30) 100%)",
  veil:
    "linear-gradient(180deg,rgba(13,10,8,0.90) 0%,rgba(13,10,8,0.82) 50%,rgba(13,10,8,0.92) 100%)",
  both:
    "linear-gradient(100deg,rgba(13,10,8,0.94) 0%,rgba(13,10,8,0.58) 45%,rgba(13,10,8,0.86) 100%)",
  /** Split layouts — text left, dense graphic right; keeps the right column legible. */
  "split-right":
    "linear-gradient(100deg,rgba(13,10,8,0.94) 0%,rgba(13,10,8,0.80) 40%,rgba(13,10,8,0.93) 58%,rgba(13,10,8,0.97) 100%)",
};

interface CinematicSlideProps {
  theme: SlideTheme;
  ariaLabel: string;
  scrim?: ScrimVariant;
  constellation?: boolean;
  align?: "center" | "left";
  /** fit the content to the viewport height with no vertical scroll */
  fit?: boolean;
  /** Node rendered absolutely on the right side of the section — bleeds past the content div */
  bleedRight?: React.ReactNode;
  children: React.ReactNode;
}

/** Full-bleed premium image slide with dark scrim, accent glow, and optional constellation. */
export const CinematicSlide: React.FC<CinematicSlideProps> = ({
  theme,
  ariaLabel,
  scrim = "left",
  constellation = true,
  align = "left",
  fit = false,
  bleedRight,
  children,
}) => {
  return (
    <section
      className="relative w-full h-full overflow-hidden flex items-center"
      style={{ background: "#0F0B09" }}
      aria-label={ariaLabel}
    >
      {/* Background image + scrim */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `${SCRIMS[scrim]}, url('${theme.image}')` }}
      />
      {/* Accent glow */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            align === "center"
              ? `radial-gradient(60% 50% at 50% 60%, ${theme.glow}, transparent 70%)`
              : `radial-gradient(55% 60% at 18% 50%, ${theme.glow}, transparent 70%)`,
        }}
      />
      {constellation && (
        <NetworkConstellation dark count={28} className="absolute inset-0 z-[1] w-full h-full opacity-50" />
      )}

      {/* bleedRight — phone/visual anchored to section, clips at screen bottom */}
      {bleedRight && (
        <div
          className="absolute right-0 bottom-0 z-[5] items-start justify-end pointer-events-none hidden lg:flex"
          style={{ top: "50px" }}
        >
          {bleedRight}
        </div>
      )}

      {/* Content */}
      <div
        className={`relative z-10 w-full max-w-7xl mx-auto px-8 sm:px-12 lg:px-20 ${
          fit
            ? "h-full flex flex-col justify-center py-16 overflow-hidden"
            : "max-h-full overflow-y-auto py-20"
        } ${align === "center" ? "text-center" : ""}`}
      >
        {children}
      </div>
    </section>
  );
};

interface SlideHeadingProps {
  theme: SlideTheme;
  eyebrow: string;
  children: React.ReactNode;
  size?: "hero" | "h1" | "h2";
  align?: "center" | "left";
  className?: string;
  /** when set, shows the layer locator badge above the eyebrow */
  layer?: LayerNumber;
}

const HEAD_SIZES: Record<NonNullable<SlideHeadingProps["size"]>, string> = {
  hero: "text-5xl sm:text-6xl lg:text-7xl",
  h1: "text-4xl sm:text-5xl lg:text-6xl",
  h2: "text-3xl sm:text-4xl lg:text-5xl",
};

/** Eyebrow + headline pair with accent color and gentle reveal. */
export const SlideHeading: React.FC<SlideHeadingProps> = ({
  theme,
  eyebrow,
  children,
  size = "h1",
  align = "left",
  className = "",
  layer,
}) => {
  const reduced = useReducedMotion() ?? false;
  const reveal = reduced ? fadeIn : revealUp;

  return (
    <div className={className}>
      {layer && (
        <div className={`mb-4 ${align === "center" ? "flex justify-center" : ""}`}>
          <LayerBadge layer={layer} />
        </div>
      )}
      <motion.div
        variants={reveal}
        initial="hidden"
        animate="visible"
        transition={{ duration: DUR.fast, ease: EASE_OUT }}
        className={`flex items-center gap-2 mb-5 ${align === "center" ? "justify-center" : ""}`}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
        <span
          className="text-[11px] font-semibold uppercase"
          style={{ color: theme.accent, letterSpacing: "0.26em" }}
        >
          {eyebrow}
        </span>
      </motion.div>
      <motion.h2
        variants={reveal}
        initial="hidden"
        animate="visible"
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.08 }}
        className={`font-light leading-[1.04] tracking-[-0.02em] ${HEAD_SIZES[size]}`}
        style={{ color: INK.strong, textShadow: "0 2px 26px rgba(0,0,0,0.5)" }}
      >
        {children}
      </motion.h2>
    </div>
  );
};
