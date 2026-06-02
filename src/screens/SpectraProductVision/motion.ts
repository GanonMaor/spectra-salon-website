/**
 * Shared motion tokens for the Spectra Product & Vision page.
 *
 * Phase 1 scope: simple opacity + transform reveals only.
 * Heavy scroll-scrubbing / particle systems are deferred to Phase 2
 * (see investor-assets/MOTION_PLAN.md).
 */
import type { Variants, Transition } from "framer-motion";

/** Apple-style gentle ease-out. */
export const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1];

export const DURATION = {
  micro: 0.25,
  enter: 0.7,
  slow: 1.0,
} as const;

/** Standard "rise + fade" reveal for a block on enter. */
export const reveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.enter, ease: EASE_OUT },
  },
};

/** Container that staggers its children's reveals. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

/** Child item used inside a staggerContainer. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.enter, ease: EASE_OUT },
  },
};

/** Reduced-motion variant: fade only, no movement. */
export const fadeOnly: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "linear" } },
};

/** Shared viewport config so reveals fire once, slightly before fully in view. */
export const VIEWPORT_ONCE = { once: true, margin: "-12% 0px -12% 0px" } as const;

/**
 * Pick the appropriate variants depending on reduced-motion preference.
 * In Phase 1 we keep this trivial; Phase 2 can expand per-section.
 */
export function pickReveal(reduced: boolean): Variants {
  return reduced ? fadeOnly : reveal;
}

export function pickItem(reduced: boolean): Variants {
  return reduced ? fadeOnly : staggerItem;
}
