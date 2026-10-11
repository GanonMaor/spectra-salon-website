import React, { useRef } from "react";
import { useMotionValue, useReducedMotion, useScroll, type MotionValue } from "framer-motion";
import { motion } from "framer-motion";
import { useDeckLayout, WEB_SLIDE } from "../../WebDeckPrimitives";

/**
 * Scroll choreography primitives for the web-deck narrative.
 *
 * Stability beats animation. Two mechanisms, both deliberately quiet:
 *  - `RevealGroup` / `RevealItem` — an opacity-only stagger-on-enter for
 *    ordinary slides (headline, then support, then the visual, then the
 *    footer). No y-offset, no scale, no springs — just a fade, once, near
 *    the top of the viewport.
 *  - `ScrollStage` — a pinned section for the handful of signature moments
 *    that genuinely benefit from a step-by-step build. Native
 *    `position: sticky` (the app shell's overflow no longer breaks it — see
 *    `AppShell` in src/index.tsx). The frame itself never transforms; only
 *    its *contents* fade in via the progress value handed to children.
 *
 * Both respect `prefers-reduced-motion`: reveals render at their settled
 * end-state with no animation, and pinned stages fall back to an ordinary
 * single-screen section. That is also exactly what the static Playwright
 * export captures (`reducedMotion: "reduce"`), so it always shows the true
 * finished composition.
 */

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

export const revealContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.02 } },
};

export const revealItem = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.65, ease: EASE } },
};

/** True under `prefers-reduced-motion: reduce` (also what Playwright's `reducedMotion: "reduce"` context option emulates). */
export const useQuiet = () => Boolean(useReducedMotion());

/** Stagger container. Renders as a plain node (no hidden state) when motion is reduced. */
export const RevealGroup: React.FC<{
  children: React.ReactNode;
  as?: "div" | "header";
  style?: React.CSSProperties;
  className?: string;
}> = ({ children, as = "div", style, className }) => {
  const quiet = useQuiet();
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      style={style}
      variants={revealContainer}
      initial={quiet ? false : "hidden"}
      whileInView={quiet ? undefined : "visible"}
      viewport={{ once: true, amount: 0.15 }}
    >
      {children}
    </Tag>
  );
};

/** One staggered item inside a `RevealGroup`. Opacity only. */
export const RevealItem: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <motion.div variants={revealItem} style={style}>
    {children}
  </motion.div>
);

/**
 * A pinned stage. Renders an outer spacer tall enough to give the sticky
 * inner frame room to run a build sequence, and hands the caller a 0→1
 * `MotionValue` tracking progress through that range. The frame itself is
 * never transformed or resized — only opacity inside it changes.
 *
 * Under reduced motion (and on the fluid/mobile layout, where pinning a
 * naturally-scrolling composition is neither necessary nor stable), it
 * collapses to an ordinary single-screen block and hands back a MotionValue
 * pinned at 1 (fully built), so consumers can use the same
 * `useTransform(progress, ...)` calls unconditionally.
 */
export const ScrollStage: React.FC<{
  /** Total stage height as a multiple of the frame height. 1.6-1.8 keeps stages to ~150-180vh of scroll. */
  heightVh?: number;
  children: (progress: MotionValue<number>) => React.ReactNode;
}> = ({ heightVh = 1.7, children }) => {
  const reduced = useQuiet();
  const { availableHeight, layout } = useDeckLayout();
  const quiet = reduced || layout === "fluid";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const settled = useMotionValue(1);
  const progress = quiet ? settled : scrollYProgress;

  // `useScroll`'s target ref must attach to a real node even when we don't use its
  // value, or framer-motion throws ("ref is defined but not hydrated"). So the ref
  // always lands on a rendered div; only the tall/pinned treatment is conditional.
  if (quiet) {
    return <div ref={ref}>{children(progress)}</div>;
  }

  return (
    <div ref={ref} data-scroll-stage="true" style={{ position: "relative", height: availableHeight * heightVh }}>
      <div
        style={{
          position: "sticky",
          top: WEB_SLIDE.headerHeight,
          height: availableHeight,
          overflow: "hidden",
        }}
      >
        {children(progress)}
      </div>
    </div>
  );
};
