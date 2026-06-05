import type { Variants, Transition } from "framer-motion";

/** Apple-style ease-out — feels premium and unhurried. */
export const EASE_OUT: Transition["ease"] = [0.22, 1, 0.36, 1];

export const DUR = {
  fast: 0.45,
  enter: 0.70,
  slow: 0.95,
} as const;

/** Standard "rise and fade" for a single block. */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.enter, ease: EASE_OUT } },
};

/** Fade-in only (used for reduced-motion). */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: "linear" } },
};

/** Scale + fade — for cards that appear to "float in". */
export const cardReveal: Variants = {
  hidden: { opacity: 0, scale: 0.88, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: DUR.enter, ease: EASE_OUT } },
};

/** Slide in from left. */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: DUR.enter, ease: EASE_OUT } },
};

/** Slide in from right. */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: DUR.enter, ease: EASE_OUT } },
};

/** Stagger container for groups of children. */
export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.10, delayChildren: 0.08 } },
};

/** Stagger item — used inside `stagger`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.enter, ease: EASE_OUT } },
};

/** Pick the correct reveal variant based on reduced-motion preference. */
export function pickReveal(reduced: boolean): Variants {
  return reduced ? fadeIn : revealUp;
}

export function pickCard(reduced: boolean): Variants {
  return reduced ? fadeIn : cardReveal;
}

export function pickStaggerItem(reduced: boolean): Variants {
  return reduced ? fadeIn : staggerItem;
}

/** Shared viewport config — fire once. */
export const VIEWPORT = { once: true } as const;
