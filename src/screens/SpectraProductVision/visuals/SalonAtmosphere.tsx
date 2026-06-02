import React from "react";
import { motion } from "framer-motion";
import { ATMOSPHERE } from "../tokens";

export type AtmosphereVariant =
  | "base"
  | "heroSalon"
  | "spotlights"
  | "stone"
  | "mirror"
  | "silhouettes"
  | "humans"
  | "products"
  | "global";

interface SalonAtmosphereProps {
  variant?: AtmosphereVariant;
  reducedMotion?: boolean;
  className?: string;
}

/**
 * Code-generated luxury-salon atmosphere — a warm, light decorative layer (no
 * image assets, no literal line-art). The page reads as a softly-lit premium
 * salon: warm wall-wash and ceiling spotlights, plaster/marble texture, and a
 * faint rose-gold "AI" overlay (thin curves + champagne nodes). Everything is
 * low alpha and blurred. Static under reduced motion.
 *
 * Mount via the Section `backdrop` prop (full-bleed, behind content).
 */
export const SalonAtmosphere: React.FC<SalonAtmosphereProps> = ({
  variant = "base",
  reducedMotion = false,
  className = "",
}) => {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {variant === "base" && <BaseLayer />}
      {variant === "heroSalon" && <SpotlightLayer reducedMotion={reducedMotion} />}
      {variant === "stone" && <StoneLayer />}
      {variant === "spotlights" && <SpotlightLayer reducedMotion={reducedMotion} />}
      {variant === "mirror" && <MirrorLayer />}
      {variant === "silhouettes" && <PresenceLayer />}
      {variant === "humans" && <PresenceLayer />}
      {variant === "products" && <ProductShelfLayer />}
      {variant === "global" && <GlobalBeautyNetworkLayer reducedMotion={reducedMotion} />}
    </div>
  );
};

/* --------------------------------------------------------------------------
 * Primitives
 * ------------------------------------------------------------------------ */

/** A soft, blurred light pool (warm/ivory to brighten, deep beige to ground). */
const Pool: React.FC<{
  x: string;
  y: string;
  size: string;
  color: string;
  blur?: number;
  opacity?: number;
}> = ({ x, y, size, color, blur = 120, opacity = 1 }) => (
  <div
    className="absolute rounded-full"
    style={{
      left: x,
      top: y,
      width: size,
      height: size,
      transform: "translate(-50%, -50%)",
      background: `radial-gradient(closest-side, ${color}, transparent 70%)`,
      filter: `blur(${blur}px)`,
      opacity,
    }}
  />
);

/** Fine plaster grain — desaturated noise, multiplied at low opacity. */
const Grain: React.FC = () => (
  <svg
    className="absolute inset-0 h-full w-full"
    style={{ opacity: 0.06, mixBlendMode: "multiply" }}
  >
    <filter id="atm-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#atm-grain)" />
  </svg>
);

/** Thin rose-gold "AI" curves — amorphous data lines, very soft. */
const AiCurves: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <svg
    className="absolute inset-0 h-full w-full"
    viewBox="0 0 100 100"
    preserveAspectRatio="none"
    style={{ opacity }}
  >
    <g fill="none" stroke={ATMOSPHERE.roseLine} strokeWidth={0.2}>
      <path d="M-2 70 C 20 60, 35 64, 52 54 S 86 44, 102 50" />
      <path d="M-2 80 C 24 74, 40 78, 60 66 S 90 58, 102 62" />
    </g>
  </svg>
);

/* --------------------------------------------------------------------------
 * Variants
 * ------------------------------------------------------------------------ */

/* Page-wide wash (fixed): warm top light, soft deeper-beige edges, plaster grain. */
const BaseLayer: React.FC = () => (
  <>
    <div
      className="absolute inset-0"
      style={{
        background: `radial-gradient(120% 80% at 50% -10%, ${ATMOSPHERE.spot} 0%, transparent 50%),
          radial-gradient(80% 60% at 85% 8%, ${ATMOSPHERE.spotRose} 0%, transparent 55%)`,
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(130% 120% at 50% 50%, transparent 60%, rgba(159,105,64,0.10) 100%)",
      }}
    />
    <Grain />
  </>
);

/* Warm overhead spotlights washing a wall. Key pool breathes slowly. */
const SpotlightLayer: React.FC<{ reducedMotion: boolean }> = ({ reducedMotion }) => (
  <div className="absolute inset-0">
    <Pool x="24%" y="0%" size="50vw" color={ATMOSPHERE.spot} opacity={0.9} />
    <Pool x="82%" y="-4%" size="42vw" color={ATMOSPHERE.spotRose} />
    <motion.div
      className="absolute left-1/2 top-[44%] rounded-full"
      style={{
        width: "46vw",
        height: "46vw",
        transform: "translate(-50%, -50%)",
        background: `radial-gradient(closest-side, ${ATMOSPHERE.spot}, transparent 70%)`,
        filter: "blur(100px)",
      }}
      animate={reducedMotion ? undefined : { opacity: [0.6, 0.95, 0.6] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
  </div>
);

/* Marble / plaster hint: a soft diagonal wash + grain. */
const StoneLayer: React.FC = () => (
  <div className="absolute inset-0">
    <div
      className="absolute inset-0"
      style={{
        background: `linear-gradient(120deg, ${ATMOSPHERE.wallSoft} 0%, transparent 42%, transparent 58%, ${ATMOSPHERE.wallWarm} 100%)`,
        opacity: 0.5,
      }}
    />
    <Grain />
  </div>
);

/* Mirror / glass sheen: a soft vertical highlight band + reflective edge. */
const MirrorLayer: React.FC = () => (
  <div className="absolute inset-0">
    <div
      className="absolute inset-y-0 left-[6%]"
      style={{
        width: "34%",
        background: `linear-gradient(106deg, transparent 0%, ${ATMOSPHERE.spot} 46%, transparent 72%)`,
        opacity: 0.7,
      }}
    />
    <Pool x="20%" y="34%" size="32vw" color={ATMOSPHERE.spotRose} opacity={0.7} />
  </div>
);

/* "Presence": soft warm pools in the lower third (people/stations in the room). */
const PresenceLayer: React.FC = () => (
  <div className="absolute inset-0">
    <Pool x="18%" y="82%" size="30vw" color={ATMOSPHERE.spotRose} opacity={0.7} />
    <Pool x="50%" y="88%" size="38vw" color={ATMOSPHERE.spot} opacity={0.8} />
    <Pool x="82%" y="82%" size="30vw" color={ATMOSPHERE.spotRose} opacity={0.7} />
  </div>
);

/* Lit product shelves: soft champagne light bands, centered low. */
const ProductShelfLayer: React.FC = () => (
  <div className="absolute inset-0">
    <Pool x="50%" y="84%" size="48vw" color={ATMOSPHERE.spot} opacity={0.7} />
    {[58, 70, 82].map((top) => (
      <div
        key={top}
        className="absolute inset-x-[16%]"
        style={{
          top: `${top}%`,
          height: 2,
          filter: "blur(2px)",
          background: `linear-gradient(90deg, transparent, ${ATMOSPHERE.champagneLine} 25%, ${ATMOSPHERE.champagneLine} 75%, transparent)`,
        }}
      />
    ))}
  </div>
);

/* Finale: a luxury beauty constellation — soft champagne nodes on rose-gold arcs. */
const GlobalBeautyNetworkLayer: React.FC<{ reducedMotion: boolean }> = ({
  reducedMotion,
}) => {
  const nodes = [
    [16, 44],
    [25, 52],
    [34, 39],
    [44, 47],
    [54, 35],
    [62, 52],
    [73, 42],
    [83, 50],
  ] as const;

  return (
    <div className="absolute inset-0">
      <Pool x="50%" y="72%" size="70vw" color={ATMOSPHERE.spotRose} opacity={0.8} />
      <AiCurves opacity={0.9} />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <g stroke={ATMOSPHERE.roseLine} strokeWidth={0.18} fill="none">
          {nodes.slice(0, -1).map((n, i) => (
            <path key={`${n[0]}-${i}`} d={`M${n[0]} ${n[1]} L${nodes[i + 1][0]} ${nodes[i + 1][1]}`} />
          ))}
        </g>
        {nodes.map((n, i) =>
          reducedMotion ? (
            <circle key={`${n[0]}-${n[1]}`} cx={n[0]} cy={n[1]} r={0.7} fill={ATMOSPHERE.node} />
          ) : (
            <motion.circle
              key={`${n[0]}-${n[1]}`}
              cx={n[0]}
              cy={n[1]}
              r={0.7}
              fill={ATMOSPHERE.node}
              animate={{ opacity: [0.3, 0.9, 0.3], r: [0.5, 1, 0.5] }}
              transition={{ duration: 2.6, delay: i * 0.2, repeat: Infinity, ease: "easeInOut" }}
            />
          ),
        )}
      </svg>
    </div>
  );
};
