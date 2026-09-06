import React, { memo, useEffect, useRef, useState } from "react";

/**
 * The living Spectra AI orb, ported from the Color Bar app's React Native mark
 * (`SPECTRA_LIVE_AI_ORB.md`). No image asset: the sphere is generated at
 * runtime from a deterministic golden-angle particle field, so it always draws
 * the same recognisable texture.
 *
 * Web adaptation: the grains are painted on one canvas instead of one animated
 * view per grain, which keeps a lockup-sized orb cheap. The disc, glaze, bloom
 * and the two rings stay in the DOM so their hairlines stay crisp, and the box
 * is sized by CSS so the orb never re-lays out the text it sits beside.
 */

/** Identity constants. These are fixed by the source mark — do not tune them. */
const SAMPLES = 41;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const RADIUS_RATIO = 0.414;
const FIELD_TILT = (-12 * Math.PI) / 180;
const SPIN_DURATION = 11000;
const BREATH_DURATION = 4800;
const REFERENCE_SIZE = 58;
const DISC_COLOR = "#070605";
const CHAMPAGNE = ["#FFF7E9", "#F1DCB8", "#E8CFA6", "#D4B07A"];
const ACCENTS = ["#D8A9B6", "#B3A6CC", "#E8B27A"];

type Particle = {
  sizeUnit: number;
  color: string;
  offsetYUnit: number;
  translateXUnit: number[];
  scale: number[];
  opacity: number[];
};

function noise(index: number) {
  const value = Math.sin(index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/** Accents intentionally win only about 11% of the draws. */
function grainColor(index: number) {
  const value = noise(index);
  if (value < 0.11) return ACCENTS[Math.floor(noise(index + 7) * ACCENTS.length) % ACCENTS.length];
  return CHAMPAGNE[Math.floor(noise(index + 31) * CHAMPAGNE.length) % CHAMPAGNE.length];
}

function clumpAt(theta: number, yUnit: number) {
  return 0.5 + 0.4 * Math.sin(theta * 2 + yUnit * 3.4) + 0.18 * Math.sin(yUnit * 5.1 - theta);
}

/**
 * Precomputes one shell of the sphere. Each grain carries 41 samples of its
 * horizontal travel, scale and opacity across a full turn; squared depth is
 * what makes the rear of the sphere fall away.
 */
function buildShell(count: number, shell: number, direction: number, seed: number) {
  const particles: Particle[] = [];

  for (let index = 0; index < count; index += 1) {
    const yUnit = 1 - (index / (count - 1)) * 2;
    const ringRadius = Math.sqrt(Math.max(0, 1 - yUnit * yUnit));
    const theta = index * GOLDEN_ANGLE + seed;
    const clump = clumpAt(theta, yUnit);
    if (noise(index * 1.7 + seed) > 0.3 + 0.7 * clump) continue;

    const gain = (0.55 + 0.45 * clump) * (shell < 1 ? 0.72 : 1);
    const shimmerPhase = noise(index + 11) * Math.PI * 2;
    const translateXUnit: number[] = [];
    const scale: number[] = [];
    const opacity: number[] = [];

    for (let sample = 0; sample < SAMPLES; sample += 1) {
      const progress = sample / (SAMPLES - 1);
      const angle = theta + direction * 2 * Math.PI * progress;
      const depth = (Math.sin(angle) + 1) / 2;
      const shimmer = 0.78 + 0.22 * Math.sin(shimmerPhase + 5 * angle);
      translateXUnit.push(shell * ringRadius * Math.cos(angle));
      scale.push(0.3 + 0.85 * depth);
      opacity.push((0.04 + 0.94 * depth * depth) * gain * shimmer);
    }

    particles.push({
      sizeUnit: (0.9 + 0.9 * ringRadius) * (0.85 + 0.3 * clump) * (shell < 1 ? 0.8 : 1),
      color: grainColor(index + seed),
      offsetYUnit: shell * yUnit,
      translateXUnit,
      scale,
      opacity,
    });
  }

  return particles;
}

const cloudCache = new Map<number, Particle[]>();

/** The inner shell counter-rotates at 62% radius, which reads as volume. */
function cloudFor(size: number) {
  const outer = Math.min(380, Math.max(155, Math.round(size * 2.7)));
  const cached = cloudCache.get(outer);
  if (cached) return cached;

  const cloud = [...buildShell(outer, 1, 1, 0), ...buildShell(Math.round(outer * 0.38), 0.62, -1, 4.7)];
  cloudCache.set(outer, cloud);
  return cloud;
}

function sampleAt(track: number[], index: number, blend: number) {
  const start = track[index];
  return start + (track[index + 1] - start) * blend;
}

function paint(
  context: CanvasRenderingContext2D,
  particles: Particle[],
  size: number,
  ratio: number,
  spin: number,
) {
  const radius = size * RADIUS_RATIO;
  const dotScale = Math.pow(size / REFERENCE_SIZE, 0.45);
  const position = spin * (SAMPLES - 1);
  const index = Math.min(SAMPLES - 2, Math.floor(position));
  const blend = position - index;

  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, size, size);
  context.translate(size / 2, size / 2);
  context.rotate(FIELD_TILT);

  particles.forEach((particle) => {
    const alpha = sampleAt(particle.opacity, index, blend);
    const dot = particle.sizeUnit * dotScale * sampleAt(particle.scale, index, blend);
    if (alpha < 0.012 || dot < 0.06) return;

    context.globalAlpha = alpha > 1 ? 1 : alpha;
    context.fillStyle = particle.color;
    context.beginPath();
    context.arc(
      sampleAt(particle.translateXUnit, index, blend) * radius,
      particle.offsetYUnit * radius,
      dot / 2,
      0,
      Math.PI * 2,
    );
    context.fill();
  });

  context.globalAlpha = 1;
  context.setTransform(1, 0, 0, 1, 0, 0);
}

export type SpectraOrbProps = {
  /** Box size in px. Omit it and size the orb with `className` for responsive lockups. */
  size?: number;
  className?: string;
  /** Forces the static orb even when the OS has no reduced-motion preference. */
  reducedMotion?: boolean;
};

export const SpectraOrb: React.FC<SpectraOrbProps> = memo(function SpectraOrb({
  size,
  className = "",
  reducedMotion = false,
}) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bloomRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const still = reducedMotion || systemReducedMotion;

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (event: MediaQueryListEvent) => setSystemReducedMotion(event.matches);
    setSystemReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let particles: Particle[] = [];
    let box = 0;
    let ratio = 1;
    let frame = 0;

    const draw = (time: number) => {
      if (box <= 0) return;

      const spin = still ? 0 : (time % SPIN_DURATION) / SPIN_DURATION;
      const breath = still
        ? 0.5
        : 0.5 - 0.5 * Math.cos((2 * Math.PI * (time % BREATH_DURATION)) / BREATH_DURATION);

      paint(context, particles, box, ratio, spin);

      if (bloomRef.current) {
        bloomRef.current.style.opacity = `${0.6 + 0.4 * breath}`;
        bloomRef.current.style.transform = `scale(${0.95 + 0.1 * breath})`;
      }
      if (ringRef.current) ringRef.current.style.opacity = `${0.5 + 0.45 * breath}`;
    };

    const loop = (time: number) => {
      draw(time);
      frame = window.requestAnimationFrame(loop);
    };

    const start = () => {
      if (frame || still) return;
      frame = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      if (!frame) return;
      window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const measure = () => {
      const nextBox = Math.round(host.getBoundingClientRect().width);
      const nextRatio = Math.min(window.devicePixelRatio || 1, 3);
      if (nextBox === box && nextRatio === ratio) return;

      box = nextBox;
      ratio = nextRatio;
      if (box <= 0) return;

      canvas.width = Math.round(box * ratio);
      canvas.height = Math.round(box * ratio);
      particles = cloudFor(box);
      draw(window.performance.now());
    };

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (resizeObserver) resizeObserver.observe(host);
    else window.addEventListener("resize", measure);

    // A page-long story scrolls the mark far out of view; only spin what is seen.
    const viewObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            (entries) => {
              if (entries[entries.length - 1]?.isIntersecting) start();
              else stop();
            },
            { rootMargin: "128px" },
          );

    measure();
    if (viewObserver) viewObserver.observe(host);
    else start();

    return () => {
      stop();
      resizeObserver?.disconnect();
      viewObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener("resize", measure);
    };
  }, [size, still]);

  return (
    <span
      ref={hostRef}
      aria-hidden="true"
      style={size === undefined ? undefined : { width: size, height: size }}
      className={`relative inline-block shrink-0 align-middle ${className}`}
    >
      <span
        ref={bloomRef}
        className="pointer-events-none absolute -inset-[12%] rounded-full bg-[rgba(226,194,142,0.12)]"
        style={{ opacity: 0.6, transform: "scale(0.95)" }}
      />
      <span
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{ backgroundColor: DISC_COLOR }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(149deg, rgba(255,240,215,0.10) 0%, rgba(255,240,215,0.02) 50%, transparent 100%)",
          }}
        />
      </span>
      <span
        ref={ringRef}
        className="pointer-events-none absolute inset-0 rounded-full border border-[rgba(246,234,210,0.9)]"
        style={{ opacity: 0.5 }}
      />
      <span className="pointer-events-none absolute -inset-[2px] rounded-full border border-[rgba(212,176,122,0.22)]" />
    </span>
  );
});

export default SpectraOrb;
