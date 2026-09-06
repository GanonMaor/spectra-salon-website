import React from "react";
import { motion } from "framer-motion";
import { CANONICAL_BY_ID, type CanonicalGroup } from "./canonicalNarrative";
import { CB, colorBarSans } from "./colorBarTokens";
import type { Localized, UpdateLang } from "./finalCopy";
import {
  Body,
  Caption,
  Chapter,
  ChapterMark,
  Display,
  Lede,
  Movement,
  PullQuote,
  Reveal,
  Rule,
  Spread,
  figureAlign,
  t as text,
} from "./EditorialPrimitives";

/**
 * Three chapters of the canonical narrative (`canonicalNarrative.ts`) drawn in
 * the Color Bar language: market scale, the competitive landscape and strategic
 * optionality.
 *
 * These slides are the ones that invite card grids and logo walls, so they are
 * deliberately built the other way — proportional rules, ruled layers and
 * whitespace, with every figure sitting on the cream page rather than inside a
 * panel. All copy and every number comes from the manifest, and each chapter
 * renders its caveats and sources alongside the claims they qualify.
 */

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

type CanonicalSectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

/** Chapter titles are set in Latin on both language slides. */
const chapterTitle = (chapter: string): Localized => ({ en: chapter, he: chapter });

/**
 * Latin runs are forced `ltr` so brand names read correctly, which would also
 * pin them to the left of a Hebrew page. This pushes them back to the reading
 * edge without disturbing the order inside the run.
 */
const inlineStart = (lang: UpdateLang) => (lang === "he" ? "justify-end" : "justify-start");

const slug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Named third parties. Brand names stay `ltr` in Hebrew, and the interpuncts
 * are decoration — the list keeps its own semantics for assistive tech.
 */
const Members: React.FC<{
  items: readonly string[];
  labelledBy: string;
  lang: UpdateLang;
  className?: string;
}> = ({ items, labelledBy, lang, className = "" }) => (
  <ul
    dir="ltr"
    aria-labelledby={labelledBy}
    className={`flex flex-wrap items-baseline gap-x-3 gap-y-2 ${inlineStart(lang)} ${className}`}
  >
    {items.map((item, index) => (
      <li
        key={item}
        className="flex items-baseline gap-3 text-[13px] font-semibold tracking-[-0.01em] sm:text-[14px]"
        style={{ color: CB.ink }}
      >
        {index > 0 && (
          <span aria-hidden="true" className="text-[#A37D38]/45">
            ·
          </span>
        )}
        {item}
      </li>
    ))}
  </ul>
);

/** Caveat then source note, in that order, closing a chapter. */
const Provenance: React.FC<{
  caveat?: Localized;
  sources?: string;
  lang: UpdateLang;
  className?: string;
}> = ({ caveat, sources, lang, className = "" }) => (
  <div className={className}>
    <Rule />
    {caveat && <Caption className="mt-5 max-w-[44rem]">{text(caveat, lang)}</Caption>}
    {sources && (
      <Caption className="mt-2 max-w-[44rem]">
        <span dir="ltr">{sources}</span>
      </Caption>
    )}
  </div>
);

/* ------------------------------------------------------------------ 02 Market */

/**
 * The three layers are drawn to scale rather than tiled, so the eye reads
 * $636B / $285B / $219B as one measured comparison. Type size and rule length
 * both track the figures, and the overlap caveat rides directly underneath so
 * the layers can never be mistaken for an additive TAM.
 */
const MARKET_FIGURE_SIZE = [
  "text-[clamp(2.9rem,8.4vw,4.75rem)]",
  "text-[clamp(2.35rem,6.4vw,3.5rem)]",
  "text-[clamp(2.1rem,5.6vw,3rem)]",
] as const;

export const CanonicalMarketSection: React.FC<CanonicalSectionProps> = ({ lang, reducedMotion }) => {
  const step = CANONICAL_BY_ID.market;
  const largest = Math.max(...step.metrics.map((metric) => metric.weight));

  return (
    <Chapter id="market" label={text(step.headline, lang)} tone="paper" rhythm="feature" chapterStart>
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <ChapterMark number={step.serial} title={chapterTitle(step.chapter)} lang={lang} />

          <div className="mt-9 grid gap-x-16 gap-y-11 lg:mt-11 lg:grid-cols-[0.44fr_0.56fr]">
            <div>
              <Display lang={lang} size="feature" className="max-w-[17ch]">
                {text(step.headline, lang)}
              </Display>
              <Lede className="mt-7 max-w-[28rem]">{text(step.support, lang)}</Lede>
            </div>

            <dl className="relative">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden items-center justify-center lg:flex"
              >
                {[410, 300, 205].map((size, index) => (
                  <motion.span
                    key={size}
                    className="absolute rounded-full border"
                    style={{
                      width: size,
                      height: size,
                      borderColor: `rgba(163,125,56,${0.11 + index * 0.035})`,
                      boxShadow: index === 2 ? "0 0 55px rgba(163,125,56,0.08)" : undefined,
                    }}
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.92 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{ duration: reducedMotion ? 0 : 0.9, delay: reducedMotion ? 0 : index * 0.1 }}
                  />
                ))}
              </div>
              {step.metrics.map((metric, index) => (
                <div
                  key={metric.value}
                  className={`relative z-10 flex flex-col gap-3.5 py-8 first:pt-0 last:pb-0 ${index === 0 ? "" : "border-t"}`}
                  style={index === 0 ? undefined : { borderColor: CB.line }}
                >
                  <dd
                    dir="ltr"
                    style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                    className={`order-1 font-semibold leading-none tracking-[-0.05em] tabular-nums ${
                      MARKET_FIGURE_SIZE[index]
                    } ${figureAlign(lang)}`}
                  >
                    {metric.value}
                  </dd>
                  <dt
                    className="order-2 text-[11px] font-semibold uppercase leading-[1.5] tracking-[0.14em]"
                    style={{ color: CB.muted }}
                  >
                    {text(metric.label, lang)}
                  </dt>
                  {/* Length is the figure, so the rule carries no extra claim. */}
                  <div
                    aria-hidden="true"
                    className="order-3 h-[2px] w-full"
                    style={{ backgroundColor: CB.well }}
                  >
                    <div
                      className="h-full"
                      style={{
                        width: `${((metric.weight / largest) * 100).toFixed(1)}%`,
                        backgroundColor: CB.copper,
                      }}
                    />
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal reducedMotion={reducedMotion} delay={0.05}>
          <PullQuote lang={lang} className="mt-14 max-w-[44rem] lg:mt-16">
            {text(step.statement, lang)}
          </PullQuote>

          <Provenance caveat={step.caveat} sources={step.sources} lang={lang} className="mt-14" />
        </Reveal>
      </Spread>
    </Chapter>
  );
};

/* --------------------------------------------------------------- 10 Landscape */

/**
 * The landscape is a stack of layers, not a matrix: each competitor set gets
 * one ruled band, and Spectra's band is the only one that reaches across all
 * three levels — physical usage, the operating system, the execution layer.
 */
export const CanonicalLandscapeSection: React.FC<CanonicalSectionProps> = ({ lang, reducedMotion }) => {
  const step = CANONICAL_BY_ID.landscape;
  // Widened: only the first set carries a descriptive line on the slide.
  const groups: readonly CanonicalGroup[] = step.groups;

  return (
    <Chapter id="landscape" label={text(step.headline, lang)} tone="paper" rhythm="feature" chapterStart style={{ backgroundColor: ACT_IV.chalk }}>
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <ChapterMark number={step.serial} title={chapterTitle(step.chapter)} lang={lang} />

          <div className="mt-9 grid gap-x-16 gap-y-8 lg:mt-11 lg:grid-cols-[0.46fr_0.54fr] lg:items-end">
            <Display lang={lang} size="chapter" className="max-w-[16ch]">
              {text(step.headline, lang)}
            </Display>
            <Lede className="max-w-[32rem]">{text(step.support, lang)}</Lede>
          </div>
        </Reveal>

        <Reveal reducedMotion={reducedMotion} delay={0.05} className="mt-10 lg:mt-12">
          <LedgerRule />
          {groups.map((group) => {
            const labelId = `landscape-${slug(group.label.en)}`;
            return (
              <div
                key={group.label.en}
                className="grid gap-x-12 gap-y-3.5 border-b py-6 sm:grid-cols-[minmax(0,0.34fr)_minmax(0,1fr)] sm:items-baseline"
                style={{ borderColor: ACT_IV.ledger }}
              >
                <div>
                  <p
                    id={labelId}
                    className="text-[11px] font-extrabold uppercase leading-[1.4] tracking-[0.16em]"
                    style={{ color: CB.muted }}
                  >
                    {text(group.label, lang)}
                  </p>
                  {group.detail && <Caption className="mt-2.5">{text(group.detail, lang)}</Caption>}
                </div>
                <Members items={group.members} labelledBy={labelId} lang={lang} />
              </div>
            );
          })}

          {/* The one band that is stacked rather than listed. */}
          <div className="border-b-2 py-7" style={{ borderColor: ACT_IV.ledger }}>
            <div className="grid gap-x-12 gap-y-5 sm:grid-cols-[minmax(0,0.34fr)_minmax(0,1fr)]">
              <p
                id="landscape-spectra"
                className="text-[11px] font-extrabold uppercase leading-[1.4] tracking-[0.3em]"
                style={{ color: CB.copperDeep }}
              >
                Spectra
              </p>
              <ol dir="ltr" aria-labelledby="landscape-spectra">
                {step.stack.map((layer, index) => (
                  <li
                    key={layer}
                    className={`flex items-baseline gap-3 pt-2 first:pt-0 ${inlineStart(lang)}`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-2.5 shrink-0 text-[13px] font-extrabold"
                      style={{ color: CB.copper }}
                    >
                      {index === 0 ? "" : "+"}
                    </span>
                    <span
                      style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                      className="text-[1.1rem] font-semibold leading-[1.2] tracking-[-0.035em] sm:text-[1.35rem]"
                    >
                      {layer}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <Body className="mt-7 max-w-[38rem]">{text(step.note, lang)}</Body>
          </div>
        </Reveal>

        <Reveal reducedMotion={reducedMotion} delay={0.05}>
          <PullQuote lang={lang} className="mt-14 max-w-[44rem]">
            {text(step.statement, lang)}
          </PullQuote>

          <Provenance sources={step.sources} lang={lang} className="mt-14" />
        </Reveal>
      </Spread>
    </Chapter>
  );
};

/* ------------------------------------------------------------- 13 Optionality */

/**
 * The closing chapter. Three routes as ruled layers — independence first,
 * because that is the plan — and then the last line of the deck held on its
 * own, with the strategic-fit caveat immediately under it.
 */
export const CanonicalOptionalitySection: React.FC<CanonicalSectionProps> = ({ lang, reducedMotion }) => {
  const step = CANONICAL_BY_ID.optionality;

  return (
    <Chapter id="optionality" label={text(step.headline, lang)} tone="paper" rhythm="feature" chapterStart style={{ backgroundColor: ACT_IV.chalk }}>
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <ChapterMark number={step.serial} title={chapterTitle(step.chapter)} lang={lang} />

          <div className="mt-9 max-w-[46rem] lg:mt-11">
            <Display lang={lang} size="feature">
              {text(step.headline, lang)}
            </Display>
            <Lede className="mt-7 max-w-[33rem]">{text(step.support, lang)}</Lede>
          </div>
        </Reveal>

        <Reveal reducedMotion={reducedMotion} delay={0.05} className="mt-10 lg:mt-12">
          <LedgerRule />
          {step.groups.map((route) => {
            const labelId = `optionality-${slug(route.label.en)}`;
            return (
              <div
                key={route.serial}
                className="grid gap-x-12 gap-y-4 border-b py-7 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)]"
                style={{ borderColor: ACT_IV.ledger }}
              >
                <div>
                  <Movement number={route.serial} title={route.label} lang={lang} />
                  <Display
                    as="p"
                    lang={lang}
                    size="sub"
                    id={labelId}
                    className="mt-3.5 max-w-[20ch]"
                  >
                    {text(route.detail, lang)}
                  </Display>
                </div>
                <Members
                  items={route.members}
                  labelledBy={labelId}
                  lang={lang}
                  className="lg:pt-2.5"
                />
              </div>
            );
          })}
        </Reveal>

        <Reveal reducedMotion={reducedMotion} delay={0.05}>
          <PullQuote lang={lang} size="feature" align="center" className="mt-12 lg:mt-16">
            {text(step.statement, lang)}
          </PullQuote>

          <Caption className="mx-auto mt-9 max-w-[34rem] text-center">
            {text(step.caveat, lang)}
          </Caption>
        </Reveal>
      </Spread>
    </Chapter>
  );
};
