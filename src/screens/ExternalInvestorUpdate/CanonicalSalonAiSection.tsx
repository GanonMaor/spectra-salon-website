/**
 * CanonicalSalonAiSection — canonical beat 07, Salon AI.
 *
 * Cinematic act finale: full-bleed dark stage backed by salon photography with
 * a calibrated scrim, a subtle deterministic NetworkConstellation texture, and
 * the SpectraOrb as a living intelligence core. Six capabilities converge into
 * the orb along curved SVG paths, each carrying a small animated signal dot
 * that travels inward (stopped under reduced motion). A large act-ending bridge
 * statement closes the section using FINAL_SALON_AI.bridge.
 *
 * Data source: `CANONICAL_BY_ID["salon-ai"]` for the diagram;
 * `FINAL_SALON_AI.bridge` for the closing statement;
 * `FINAL_SALON_AI.status` for the development-stage caveat.
 *
 * Bilingual EN / HE, RTL, reduced-motion safe.
 *
 * Layout:
 *   320-430 px — cinematic vertical core, readable sequential capability list,
 *               large bridge statement.
 *   Desktop    — full-width dark stage, convergence composition with curved
 *               paths, 270px intelligence core, act-ending bridge.
 */

import React, { useId } from "react";
import { motion } from "framer-motion";
import { SpectraOrb } from "../../components/SpectraOrb";
import { NetworkConstellation } from "../SpectraInvestorExperience/visuals/NetworkConstellation";
import { CANONICAL_BY_ID } from "./canonicalNarrative";
import { CB_INK, colorBarSans, inkGold } from "./colorBarTokens";
import {
  Caption,
  Chapter,
  Display,
  EASE,
  Kicker,
  Lede,
  Reveal,
  Rule,
  Spread,
  loc,
  t as text,
} from "./EditorialPrimitives";
import { FINAL_SALON_AI, type UpdateLang } from "./finalCopy";

/* ── Data ──────────────────────────────────────────────────────── */

const STEP = CANONICAL_BY_ID["salon-ai"];

const CAVEAT = loc(
  "Capabilities shown are in design and development. Sequencing, scope and interfaces may change.",
  "היכולות המוצגות בתכנון ופיתוח. סדר, היקף וממשקים עשויים להשתנות.",
);

const LEFT_FACTS = STEP.facts.slice(0, 3);
const RIGHT_FACTS = STEP.facts.slice(3, 6);

/* ── Cinematic palette ────────────────────────────────────────── */

const DA = {
  bg: CB_INK.bg,
  ink: CB_INK.ink,
  muted: CB_INK.muted,
  accent: CB_INK.gold,
  line: CB_INK.line,
  spoke: inkGold(0.42),
} as const;

const SALON_BG = "/investor-vision/salon-ai-live-demo/backup-command-center-bg.png";

/** Theatrical vignette: darker at top/bottom edges, image breathes at centre. */
const SCRIM =
  "linear-gradient(180deg," +
  "rgba(26,22,19,0.92) 0%," +
  "rgba(26,22,19,0.80) 28%," +
  "rgba(26,22,19,0.72) 50%," +
  "rgba(26,22,19,0.81) 72%," +
  "rgba(26,22,19,0.94) 100%)";

/* ── CSS keyframes ────────────────────────────────────────────── */

const CORE_KEYFRAMES = [
  "@keyframes saiBloom{0%,100%{opacity:.4;transform:scale(.93)}50%{opacity:.82;transform:scale(1.08)}}",
  "@keyframes saiRing1{0%,100%{opacity:.32;transform:scale(.96)}50%{opacity:.68;transform:scale(1.04)}}",
  "@keyframes saiRing2{0%,100%{opacity:.18;transform:scale(.97)}50%{opacity:.42;transform:scale(1.03)}}",
  "@keyframes saiRing3{0%,100%{opacity:.08;transform:scale(.99)}50%{opacity:.20;transform:scale(1.02)}}",
  "@keyframes saiDot{0%{offset-distance:0%}100%{offset-distance:100%}}",
].join("\n");

/* ── Types ─────────────────────────────────────────────────────── */

type SectionProps = { lang: UpdateLang; reducedMotion: boolean };

/* ── Internal pieces ──────────────────────────────────────────── */

const DarkChapterMark: React.FC = () => (
  <div className="flex items-center gap-4">
    <span
      className="text-[1.35rem] font-semibold leading-none tabular-nums tracking-[-0.04em]"
      style={{ color: DA.accent }}
    >
      {STEP.serial}
    </span>
    <span aria-hidden="true" className="h-px w-11" style={{ backgroundColor: DA.spoke }} />
    <span
      className="text-[10px] font-extrabold uppercase leading-none tracking-[0.16em]"
      style={{ color: DA.accent }}
    >
      {STEP.chapter}
    </span>
  </div>
);

/**
 * The living intelligence core: SpectraOrb at the centre, three concentric
 * rings expanding outward, and a pulsing radial bloom behind everything.
 * Reduced-motion renders every layer at its mid-cycle opacity with no animation.
 */
const IntelligenceCore: React.FC<{
  size: number;
  reducedMotion: boolean;
  className?: string;
}> = ({ size, reducedMotion, className = "" }) => {
  const wrap = Math.round(size * 1.85);
  const rc = "pointer-events-none absolute rounded-full border";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: wrap, height: wrap }}
    >
      {/* Radial bloom */}
      <span
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle,rgba(201,150,62,0.22) 0%,rgba(201,150,62,0.08) 40%,transparent 72%)",
          animation: reducedMotion ? "none" : "saiBloom 5.2s ease-in-out infinite",
          opacity: reducedMotion ? 0.6 : undefined,
        }}
      />
      {/* Ring 3: outermost, desktop only */}
      <span
        className={`${rc} hidden sm:block`}
        style={{
          inset: "2%",
          borderColor: "rgba(201,150,62,0.10)",
          animation: reducedMotion ? "none" : "saiRing3 7.2s ease-in-out infinite",
          opacity: reducedMotion ? 0.14 : undefined,
        }}
      />
      {/* Ring 2 */}
      <span
        className={rc}
        style={{
          inset: "10%",
          borderColor: "rgba(201,150,62,0.18)",
          animation: reducedMotion ? "none" : "saiRing2 6s ease-in-out infinite",
          opacity: reducedMotion ? 0.3 : undefined,
        }}
      />
      {/* Ring 1: closest to orb */}
      <span
        className={rc}
        style={{
          inset: "18%",
          borderColor: "rgba(201,150,62,0.26)",
          animation: reducedMotion ? "none" : "saiRing1 4.8s ease-in-out infinite",
          opacity: reducedMotion ? 0.5 : undefined,
        }}
      />
      <SpectraOrb size={size} reducedMotion={reducedMotion} />
    </span>
  );
};

/** Hub label: Salon AI title + intelligence-layer detail, centred. */
const HubLabel: React.FC<{ lang: UpdateLang; className?: string }> = ({
  lang,
  className = "",
}) => {
  const hub = STEP.hub;
  if (!hub) return null;
  return (
    <div className={`text-center ${className}`}>
      <p
        style={{ fontFamily: colorBarSans(lang), color: DA.ink }}
        className="text-[1.1rem] font-semibold tracking-[-0.03em] sm:text-[1.25rem]"
      >
        {text(hub.term, lang)}
      </p>
      {hub.detail && (
        <p className="mt-1 text-[0.6875rem] sm:text-xs" style={{ color: DA.muted }}>
          {text(hub.detail, lang)}
        </p>
      )}
    </div>
  );
};

/* ── Convergence composition ──────────────────────────────────── */

/**
 * Radial layout geometry: six capabilities placed around the orb on desktop.
 * Each capability gets a position (relative to center of the SVG viewport)
 * and a cubic Bezier control point set for its curved path toward the center.
 *
 * The top/bottom pairs arc inward, the middle pair sweeps horizontally. All
 * six end at the orb edge (not the geometric centre) so the curves visually
 * "pour into" the ring.
 */
const SVG_W = 1040;
const SVG_H = 640;
const CX = SVG_W / 2;
const CY = SVG_H / 2;

type ConvergenceNode = {
  x: number;
  y: number;
  align: "end" | "start";
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
};

const NODES_LTR: ConvergenceNode[] = [
  // Left column: top, mid, bottom
  { x: 70,  y: 105, align: "end",   cp1x: 190, cp1y: 105, cp2x: 340, cp2y: CY - 60 },
  { x: 40,  y: CY,  align: "end",   cp1x: 180, cp1y: CY,  cp2x: 320, cp2y: CY },
  { x: 70,  y: 535, align: "end",   cp1x: 190, cp1y: 535, cp2x: 340, cp2y: CY + 60 },
  // Right column: top, mid, bottom
  { x: 970, y: 105, align: "start", cp1x: 850, cp1y: 105, cp2x: 700, cp2y: CY - 60 },
  { x: 1000,y: CY,  align: "start", cp1x: 860, cp1y: CY,  cp2x: 720, cp2y: CY },
  { x: 970, y: 535, align: "start", cp1x: 850, cp1y: 535, cp2x: 700, cp2y: CY + 60 },
];

const mirrorNode = (n: ConvergenceNode): ConvergenceNode => ({
  x: SVG_W - n.x,
  y: n.y,
  align: n.align === "end" ? "start" : "end",
  cp1x: SVG_W - n.cp1x,
  cp1y: n.cp1y,
  cp2x: SVG_W - n.cp2x,
  cp2y: n.cp2y,
});

/**
 * ConvergenceDiagram: the orb-as-diagram composition.
 * Six curved SVG Bezier paths converge into the central orb, each carrying
 * a small animated signal dot. The paths use a gradient stroke that fades
 * from the origin dot toward the orb edge, so they feel like radial signal
 * flow rather than diagrammatic connectors.
 */
const ConvergenceDiagram: React.FC<{
  lang: UpdateLang;
  reducedMotion: boolean;
}> = ({ lang, reducedMotion }) => {
  const isRtl = lang === "he";
  const uid = useId().replace(/:/g, "");
  const facts = [...LEFT_FACTS, ...RIGHT_FACTS];
  const nodes = isRtl ? NODES_LTR.map(mirrorNode) : NODES_LTR;

  return (
    <div className="relative mx-auto" style={{ maxWidth: SVG_W }}>
      {/* SVG convergence paths layer */}
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
        style={{ zIndex: 1 }}
      >
        <defs>
          <radialGradient id={`${uid}-glow`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(201,150,62,0.22)" />
            <stop offset="60%" stopColor="rgba(201,150,62,0.06)" />
            <stop offset="100%" stopColor="rgba(201,150,62,0)" />
          </radialGradient>
          {nodes.map((node, i) => {
            const isLeft = node.align === "end";
            return (
              <linearGradient
                key={i}
                id={`${uid}-grad-${i}`}
                x1={isLeft ? "0%" : "100%"}
                y1="0%"
                x2={isLeft ? "100%" : "0%"}
                y2="0%"
              >
                <stop offset="0%" stopColor="rgba(201,150,62,0.45)" />
                <stop offset="70%" stopColor="rgba(201,150,62,0.18)" />
                <stop offset="100%" stopColor="rgba(201,150,62,0.06)" />
              </linearGradient>
            );
          })}
        </defs>

        {/* Soft glow behind the center convergence zone */}
        <circle cx={CX} cy={CY} r={200} fill={`url(#${uid}-glow)`} />

        {nodes.map((node, i) => {
          const pathD = `M ${node.x} ${node.y} C ${node.cp1x} ${node.cp1y}, ${node.cp2x} ${node.cp2y}, ${CX} ${CY}`;
          const delay = i * 0.6;

          return (
            <g key={i}>
              {/* The convergence curve: solid stroke with gradient */}
              <path
                d={pathD}
                fill="none"
                stroke={`url(#${uid}-grad-${i})`}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              {/* Faint dashed echo for depth */}
              <path
                d={pathD}
                fill="none"
                stroke="rgba(201,150,62,0.08)"
                strokeWidth={0.5}
                strokeDasharray="3 8"
              />
              {/* Animated signal dot traveling along the path */}
              {!reducedMotion && (
                <circle
                  r={3}
                  fill={DA.accent}
                  opacity={0.9}
                  style={{
                    offsetPath: `path('${pathD}')`,
                    offsetRotate: "0deg",
                    animation: `saiDot ${3.6 + i * 0.15}s ease-in-out ${delay}s infinite`,
                  }}
                />
              )}
              {/* Origin dot */}
              <circle
                cx={node.x}
                cy={node.y}
                r={3.5}
                fill="rgba(201,150,62,0.65)"
              />
              <circle
                cx={node.x}
                cy={node.y}
                r={6}
                fill="none"
                stroke="rgba(201,150,62,0.18)"
                strokeWidth={0.8}
              />
            </g>
          );
        })}
      </svg>

      {/* Capability text labels positioned absolutely over the SVG */}
      <div
        className="relative"
        style={{ height: 0, paddingBottom: `${(SVG_H / SVG_W) * 100}%` }}
      >
        {facts.map((fact, i) => {
          const node = nodes[i];
          const leftPct = (node.x / SVG_W) * 100;
          const topPct = (node.y / SVG_H) * 100;

          return (
            <div
              key={fact.term.en}
              className="absolute"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: `translate(${node.align === "end" ? "-100%" : "0"}, -50%)`,
                zIndex: 2,
                maxWidth: "16rem",
                padding: node.align === "end" ? "0 20px 0 0" : "0 0 0 20px",
              }}
            >
              <p
                className="text-[0.8125rem] font-semibold leading-tight tracking-[-0.01em] sm:text-[0.9375rem]"
                style={{
                  color: DA.ink,
                  textAlign: node.align,
                }}
              >
                {text(fact.term, lang)}
              </p>
              {fact.detail && (
                <p
                  className="mt-0.5 text-[0.6875rem] leading-[1.55] sm:text-xs"
                  style={{
                    color: DA.muted,
                    textAlign: node.align,
                  }}
                >
                  {text(fact.detail, lang)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Central orb positioned over the SVG center */}
      <div
        className="pointer-events-none absolute"
        style={{
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 3,
        }}
      >
        <IntelligenceCore size={270} reducedMotion={reducedMotion} />
      </div>
    </div>
  );
};

/* ── Framer Motion variants ───────────────────────────────────── */

const ORB_V = {
  hidden: { opacity: 0, scale: 0.72 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.9, ease: EASE } },
};

/* ── Bridge statement ─────────────────────────────────────────── */

const BridgeStatement: React.FC<{
  lang: UpdateLang;
  reducedMotion: boolean;
}> = ({ lang, reducedMotion }) => (
  <Reveal reducedMotion={reducedMotion} delay={0.3}>
    <div className="mt-20 sm:mt-28 lg:mt-36 text-center">
      <span
        aria-hidden="true"
        className="mx-auto block h-px w-16 sm:w-24"
        style={{ backgroundColor: DA.accent }}
      />
      <p
        style={{
          fontFamily: colorBarSans(lang),
          color: DA.ink,
        }}
        className="mx-auto mt-8 max-w-[26ch] text-[clamp(1.55rem,4.6vw,2.6rem)] font-semibold leading-[1.08] tracking-[-0.04em] sm:mt-10"
      >
        {text(FINAL_SALON_AI.bridge, lang)}
      </p>
      <p
        className="mx-auto mt-5 text-[10px] font-extrabold uppercase tracking-[0.16em] sm:mt-7"
        style={{ color: "rgba(201,150,62,0.60)" }}
      >
        {text(FINAL_SALON_AI.status, lang)}
      </p>
    </div>
  </Reveal>
);

/* ── Main section ─────────────────────────────────────────────── */

export const CanonicalSalonAiSection: React.FC<SectionProps> = ({
  lang,
  reducedMotion,
}) => {
  const isRtl = lang === "he";

  return (
    <Chapter
      id="salon-ai"
      label={text(STEP.headline, lang)}
      tone="paper"
      rhythm="pause"
      chapterStart
      className="border-y !bg-[#1A1613] !py-28 overflow-hidden sm:!py-40 lg:!py-48"
    >
      {/* Keyframe animations */}
      <style>{CORE_KEYFRAMES}</style>

      {/* Salon background photograph */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `url('${SALON_BG}')`,
          backgroundSize: "cover",
          backgroundPosition: "center 40%",
        }}
      />

      {/* Calibrated dark scrim */}
      <div className="pointer-events-none absolute inset-0" style={{ background: SCRIM }} />

      {/* Subtle constellation texture (hidden on small screens) */}
      <NetworkConstellation
        dark
        count={24}
        className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-30 sm:block"
      />

      <Spread className="relative z-10">
        {/* ── Headline ────────────────────────────────────── */}
        <Reveal reducedMotion={reducedMotion}>
          <DarkChapterMark />

          <Display
            lang={lang}
            size="cover"
            className="mt-12 max-w-[18ch] !text-[#EAE3D8] lg:mt-14"
          >
            {text(STEP.headline, lang)}
          </Display>
          <Lede className="mt-10 max-w-[36rem] !text-[#A99B85] lg:mt-12">
            {text(STEP.support, lang)}
          </Lede>
        </Reveal>

        {/* ── Desktop: convergence composition ────────────── */}
        <motion.div
          className="mt-16 hidden lg:mt-24 lg:block"
          dir={isRtl ? "rtl" : "ltr"}
          initial={reducedMotion ? false : "hidden"}
          whileInView={reducedMotion ? undefined : "visible"}
          viewport={{ once: true, amount: 0.12 }}
        >
          <motion.div variants={reducedMotion ? undefined : ORB_V}>
            <ConvergenceDiagram lang={lang} reducedMotion={reducedMotion} />
          </motion.div>

          <Reveal reducedMotion={reducedMotion} delay={0.5}>
            <HubLabel lang={lang} className="mt-7" />
          </Reveal>
        </motion.div>

        {/* ── Mobile: orb on top, ruled list below ────────── */}
        <Reveal
          reducedMotion={reducedMotion}
          delay={0.05}
          className="mt-12 lg:hidden"
        >
          <div className="flex flex-col items-center">
            <IntelligenceCore size={120} reducedMotion={reducedMotion} />
            <HubLabel lang={lang} className="mt-4" />
            <span
              aria-hidden="true"
              className="mt-5 block h-9 w-px"
              style={{ backgroundColor: DA.accent }}
            />
          </div>

          <Rule strong className="!bg-[rgba(245,238,225,0.2)]" />
          <dl aria-label={isRtl ? "יכולות Salon AI" : "Salon AI capabilities"}>
            {STEP.facts.map((fact, i) => (
              <motion.div
                key={fact.term.en}
                className="border-b py-4"
                style={{ borderColor: DA.line }}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: reducedMotion ? 0.15 : 0.5,
                  ease: EASE,
                  delay: reducedMotion ? 0 : i * 0.08,
                }}
              >
                <dt
                  className="text-[0.8125rem] font-semibold tracking-[-0.01em]"
                  style={{ color: DA.ink }}
                >
                  {text(fact.term, lang)}
                </dt>
                {fact.detail && (
                  <dd
                    className="mt-1 text-xs leading-[1.55]"
                    style={{ color: DA.muted }}
                  >
                    {text(fact.detail, lang)}
                  </dd>
                )}
              </motion.div>
            ))}
          </dl>
        </Reveal>

        {/* ── Bridge statement (act-ending) ───────────────── */}
        <BridgeStatement lang={lang} reducedMotion={reducedMotion} />

        {/* ── Caveat ──────────────────────────────────────── */}
        <Reveal reducedMotion={reducedMotion} delay={0.08}>
          <Rule className="mt-10 !bg-[rgba(245,238,225,0.10)]" />
          <Caption className="mt-6 max-w-[44rem] !text-[#A99B85]">
            {text(CAVEAT, lang)}
          </Caption>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default CanonicalSalonAiSection;
