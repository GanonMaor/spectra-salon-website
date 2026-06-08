import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { NetworkConstellation } from "../../SpectraInvestorExperience/visuals/NetworkConstellation";
import { revealUp, fadeIn, DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { SlideTheme, INK, LayerNumber } from "../theme";
import { LayerBadge } from "../visuals/LayerBadge";

type ScrimVariant = "center" | "left" | "veil" | "both" | "split-right";

const SCRIMS: Record<ScrimVariant, string> = {
  /** Used for centred/closing slides — image visible through the middle */
  center:
    "linear-gradient(180deg,rgba(12,9,7,0.42) 0%,rgba(12,9,7,0.28) 40%,rgba(12,9,7,0.58) 100%)",
  /** Text on the left, image breathes on the right */
  left:
    "linear-gradient(100deg,rgba(12,9,7,0.84) 0%,rgba(12,9,7,0.52) 50%,rgba(12,9,7,0.14) 100%)",
  /** Full-screen coverage — softer than before, image is visible */
  veil:
    "linear-gradient(180deg,rgba(12,9,7,0.72) 0%,rgba(12,9,7,0.58) 50%,rgba(12,9,7,0.74) 100%)",
  both:
    "linear-gradient(100deg,rgba(12,9,7,0.86) 0%,rgba(12,9,7,0.42) 45%,rgba(12,9,7,0.74) 100%)",
  /** Split layouts — text left, graphic right */
  "split-right":
    "linear-gradient(100deg,rgba(12,9,7,0.88) 0%,rgba(12,9,7,0.64) 40%,rgba(12,9,7,0.80) 58%,rgba(12,9,7,0.92) 100%)",
};

interface CinematicSlideProps {
  theme: SlideTheme;
  ariaLabel: string;
  scrim?: ScrimVariant;
  constellation?: boolean;
  align?: "center" | "left";
  /** Fit the content to the viewport height on desktop. Mobile remains scrollable. */
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
      className="relative w-full min-h-full overflow-y-auto overflow-x-hidden flex items-stretch lg:h-full lg:overflow-hidden lg:items-center"
      style={{ background: "#0F0B09" }}
      aria-label={ariaLabel}
    >
      {/* Background image + scrim */}
      <div
        className="absolute inset-0 z-0 bg-cover"
        style={{
          backgroundImage: `${SCRIMS[scrim]}, url('${theme.image}')`,
          backgroundPosition: "center 30%",
        }}
      />
      {/* Accent glow — wider and warmer for brighter feel */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            align === "center"
              ? `radial-gradient(70% 55% at 50% 58%, ${theme.glow}, transparent 74%)`
              : `radial-gradient(65% 65% at 16% 52%, ${theme.glow}, transparent 72%)`,
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
            ? "min-h-full flex flex-col justify-center py-20 lg:h-full lg:py-16 lg:overflow-hidden"
            : "py-20 lg:max-h-full lg:overflow-y-auto"
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
