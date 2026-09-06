import React from "react";
import { motion } from "framer-motion";
import { CANONICAL_BY_ID } from "./canonicalNarrative";
import { CB, colorBarSans } from "./colorBarTokens";
import type { Localized, UpdateLang } from "./finalCopy";
import {
  Chapter,
  ChapterMark,
  Display,
  Lede,
  PullQuote,
  Reveal,
  Spread,
  TermList,
  t as text,
} from "./EditorialPrimitives";

/**
 * Canonical beat 08 — Data.
 *
 * Hub-and-spoke diagram: a central "Live industry data" hub with elegant
 * connectors to five audience nodes. Desktop renders the diagram spatially;
 * mobile falls back to a clean stacked ruled list. All copy is drawn from
 * `CANONICAL_BY_ID.data` — nothing is rounded, re-scaled or invented.
 *
 * Color Bar light visual language: cream paper, brown-black ink, one copper
 * accent, hairlines instead of boxes. No dark blocks, gradients, glass, cards
 * or new assets.
 */

type CanonicalDataSectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const step = CANONICAL_BY_ID.data;

const chapterTitle = (chapter: string): Localized => ({ en: chapter, he: chapter });

/** Act IV: cooler analytical surface and heavier ledger rules. */
const ACT_IV = {
  chalk: "#F8F6F1",
  ledger: "rgba(92,72,42,0.22)",
} as const;

/** 2 px ruled line for Act IV analytical scaffolding. */
const LedgerRule: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`h-[2px] w-full ${className}`}
    style={{ backgroundColor: ACT_IV.ledger }}
  />
);

/* ------------------------------------------------------------------ Hub SVG */

/**
 * Five audience positions around a central hub. Each position defines the
 * node placement and the connector line from the hub edge to the node.
 * Coordinates are percentages of the containing box.
 */
const AUDIENCE_POSITIONS = [
  { cx: 8, cy: 6, lx: 30, ly: 22 },
  { cx: 82, cy: 2, lx: 70, ly: 20 },
  { cx: 2, cy: 52, lx: 28, ly: 48 },
  { cx: 85, cy: 58, lx: 72, ly: 52 },
  { cx: 12, cy: 88, lx: 34, ly: 70 },
] as const;

/**
 * Desktop hub-and-spoke diagram. Central hub label with hairline connectors
 * to five audience nodes arranged around it. Pure CSS/SVG — no images.
 */
const HubDiagram: React.FC<{ lang: UpdateLang; reducedMotion: boolean }> = ({ lang, reducedMotion }) => {
  const facts = step.facts;

  return (
    <div
      className="relative hidden min-h-[480px] overflow-x-clip lg:block xl:min-h-[520px]"
      role="img"
      aria-label={
        lang === "he"
          ? "תרשים חמישה קהלים סביב מרכז Live industry data"
          : "Diagram of five audiences around a central Live industry data hub"
      }
    >
      {/* Connector lines — drawn first so they sit behind nodes */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {AUDIENCE_POSITIONS.map((pos, i) => (
          <motion.line
            key={i}
            x1="50"
            y1="46"
            x2={pos.lx}
            y2={pos.ly}
            stroke={CB.copper}
            strokeOpacity="0.35"
            strokeWidth="0.3"
            vectorEffect="non-scaling-stroke"
            initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : i * 0.08 }}
          />
        ))}
      </svg>

      {/* Central hub */}
      <div
        className="absolute left-1/2 top-[44%] z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center"
      >
        <span
          aria-hidden="true"
          className="mb-4 block h-px w-10"
          style={{ backgroundColor: CB.copper }}
        />
        <p
          dir="ltr"
          style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
          className="whitespace-nowrap text-center text-[1.35rem] font-semibold leading-[1.15] tracking-[-0.03em] xl:text-[1.55rem]"
        >
          {text(step.hub.term, lang)}
        </p>
        <span
          aria-hidden="true"
          className="mt-4 block h-px w-10"
          style={{ backgroundColor: CB.copper }}
        />
      </div>

      {/* Audience nodes */}
      {facts.map((fact, i) => {
        const pos = AUDIENCE_POSITIONS[i];
        return (
          <div
            key={fact.term.en}
            className="absolute w-[200px] xl:w-[220px]"
            style={{ left: `${pos.cx}%`, top: `${pos.cy}%` }}
          >
            <p
              className="text-[11px] font-extrabold uppercase tracking-[0.14em]"
              style={{ color: CB.copperDeep }}
            >
              {text(fact.term, lang)}
            </p>
            <p
              className="mt-1.5 text-[12px] leading-[1.55]"
              style={{ color: CB.muted }}
            >
              {text(fact.detail!, lang)}
            </p>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Mobile audience list. Clean ruled rows — one per audience — replacing the
 * spatial diagram that needs desktop width.
 */
const AudienceList: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const facts = step.facts;

  return (
    <dl className="lg:hidden">
      <LedgerRule />
      {facts.map((fact, index) => (
        <div
          key={fact.term.en}
          className="grid gap-x-8 gap-y-1 py-3.5 sm:grid-cols-[minmax(0,0.38fr)_minmax(0,1fr)] sm:items-baseline"
          style={index > 0 ? { borderTop: `1px solid ${ACT_IV.ledger}` } : undefined}
        >
          <dt
            className="text-[11px] font-extrabold uppercase tracking-[0.14em]"
            style={{ color: CB.copperDeep }}
          >
            {text(fact.term, lang)}
          </dt>
          <dd
            className="text-[13px] leading-[1.6] sm:text-[14px]"
            style={{ color: CB.muted }}
          >
            {text(fact.detail!, lang)}
          </dd>
        </div>
      ))}
    </dl>
  );
};

/* ------------------------------------------------------------------ Section */

export const CanonicalDataSection: React.FC<CanonicalDataSectionProps> = ({
  lang,
  reducedMotion,
}) => (
  <Chapter
    id="data"
    label={text(step.headline, lang)}
    tone="paper"
    rhythm="feature"
    chapterStart
    style={{ backgroundColor: ACT_IV.chalk }}
  >
    <Spread>
      <Reveal reducedMotion={reducedMotion}>
        <ChapterMark
          number={step.serial}
          title={chapterTitle(step.chapter)}
          lang={lang}
        />

        <div className="mt-9 grid gap-x-16 gap-y-8 lg:mt-11 lg:grid-cols-[0.46fr_0.54fr] lg:items-start">
          {/* Headline + support */}
          <div>
            <Display lang={lang} size="chapter" className="max-w-[17ch]">
              {text(step.headline, lang)}
            </Display>
            <Lede className="mt-7 max-w-[30rem]">
              {text(step.support, lang)}
            </Lede>
          </div>

          {/* Hub label — visible on desktop as part of the text column grid,
              the full diagram occupies the next row. On mobile, shown inline. */}
          <div className="flex flex-col items-start gap-4 lg:items-center lg:justify-center lg:pt-6">
            <span
              aria-hidden="true"
              className="block h-px w-10"
              style={{ backgroundColor: CB.copper }}
            />
            <p
              dir="ltr"
              style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
              className="text-[1.25rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[1.4rem] lg:hidden"
            >
              {text(step.hub.term, lang)}
            </p>
          </div>
        </div>
      </Reveal>

      {/* Desktop: spatial hub-and-spoke diagram */}
      <Reveal reducedMotion={reducedMotion} delay={0.05} className="mt-8 lg:mt-12">
        <HubDiagram lang={lang} reducedMotion={reducedMotion} />

        {/* Mobile: ruled stacked list */}
        <AudienceList lang={lang} />
      </Reveal>

      {/* Terms strip: Aggregated · Permissioned · Privacy-first */}
      <Reveal reducedMotion={reducedMotion} delay={0.08} className="mt-8 lg:mt-10">
        <LedgerRule />
        <TermList items={step.terms} lang={lang} className="py-4" />
      </Reveal>

      {/* Closing statement */}
      <Reveal reducedMotion={reducedMotion} delay={0.1}>
        <PullQuote lang={lang} className="mt-6 max-w-[44rem]">
          {text(step.statement, lang)}
        </PullQuote>
      </Reveal>
    </Spread>
  </Chapter>
);

export default CanonicalDataSection;
