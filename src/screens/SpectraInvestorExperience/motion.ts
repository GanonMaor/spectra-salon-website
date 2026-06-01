/**
 * Shared Framer Motion tokens for the Spectra Investor Experience.
 *
 * Principles:
 *  – Apple-style: gentle ease-out, restrained amplitude.
 *  – Animate only transform + opacity.
 *  – Every section reveal fires once on enter (viewport), never loops.
 *  – Reduced-motion: fade only, no translate, no scale.
 */

import type { Variants, Transition } from "framer-motion";

/** Apple-style ease-out cubic bezier. */
export const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1];

/** Durations in seconds. */
export const DURATION = {
  micro: 0.22,
  enter: 0.65,
  slow: 0.95,
  verySlow: 1.3,
} as const;

/** Viewport config: fire once, slightly before fully visible. */
export const VIEWPORT_ONCE = {
  once: true,
  margin: "-10% 0px -10% 0px",
} as const;

/** Standard rise + fade reveal. */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.enter, ease: EASE_OUT },
  },
};

/** Fade only — for reduced-motion contexts. */
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: "linear" },
  },
};

/** Container that staggers children. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

/** Item inside a stagger container. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.enter, ease: EASE_OUT },
  },
};

/** Fade item — reduced-motion stagger child. */
export const fadeItem: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: "linear" },
  },
};

/** Slow, deliberate reveal for hero/vision sections. */
export const slowReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.verySlow, ease: EASE_OUT },
  },
};

/** Scale-in reveal for cards and visuals. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.enter, ease: EASE_OUT },
  },
};

/** Reduced-motion scale-in fallback. */
export const fadeScaleItem: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: "linear" },
  },
};

/**
 * Return the correct reveal variant based on reduced-motion preference.
 */
export function pickReveal(reduced: boolean): Variants {
  return reduced ? fadeOnly : reveal;
}

export function pickStaggerItem(reduced: boolean): Variants {
  return reduced ? fadeItem : staggerItem;
}

export function pickScaleIn(reduced: boolean): Variants {
  return reduced ? fadeScaleItem : scaleIn;
}
