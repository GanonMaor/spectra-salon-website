import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { SALON } from "../tokens";

/**
 * A thin gold scroll-progress rail on the right edge (desktop).
 * Hidden for reduced-motion users and on small screens.
 */
export const ProgressRail: React.FC<{ reducedMotion?: boolean }> = ({
  reducedMotion = false,
}) => {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    mass: 0.3,
  });

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden
      className="hidden lg:block fixed right-5 top-1/2 -translate-y-1/2 z-50"
      style={{ height: "40vh", width: 2 }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "rgba(120,80,60,0.14)" }}
      />
      <motion.div
        className="absolute left-0 top-0 w-full rounded-full origin-top"
        style={{
          height: "100%",
          scaleY,
          background: `linear-gradient(${SALON.roseSoft}, ${SALON.copper})`,
        }}
      />
    </div>
  );
};
