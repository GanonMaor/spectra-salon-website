/**
 * CanonicalWedgeSection.tsx
 *
 * Beat 03 — Wedge
 *
 * All copy and every number come directly from `CANONICAL_BY_ID.wedge` in
 * `canonicalNarrative.ts`. No legacy `finalCopy` is imported. The two Color
 * Bar photographs serve as editorial evidence of the product, not decoration:
 *
 *   colorbar-composition.png  — Color Intelligence interface in the color room
 *   color-bar.jpg             — the physical space where measurement happens
 *
 * Layout (desktop / mobile both responsive, RTL-safe):
 *  1. ChapterMark → Display headline + Lede support (start) /
 *                   colorbar-composition in a Sheet (end)
 *  2. 30M+ BigFigure anchored to the headline column, ruled off
 *  3. color-bar.jpg panorama strip (16 ∶ 6)
 *  4. Four canonical facts in a ruled 2 × 2 grid (logical border / padding)
 *
 * Accessibility: section aria-label, figure/figcaption, dl/dt/dd, descriptive
 * alt text in both languages, lazy + async images.
 * Reduced motion: Reveal delegates to framer-motion with initial={false}.
 */

import React from "react";
import { CANONICAL_BY_ID } from "./canonicalNarrative";
import { CB } from "./colorBarTokens";
import type { Localized, UpdateLang } from "./finalCopy";
import {
  BigFigure,
  Body,
  Chapter,
  ChapterMark,
  Display,
  Figure,
  Kicker,
  Lede,
  Reveal,
  Rule,
  Spread,
  t as text,
} from "./EditorialPrimitives";
import { Sheet } from "./ColorBarPatterns";

/** Chapter titles are set in Latin caps on both language slides. */
const chapterTitle = (chapter: string): Localized => ({ en: chapter, he: chapter });

export type CanonicalWedgeSectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

/**
 * Canonical beat 03 — Wedge.
 *
 * Implements `Chapter id='wedge'`, `chapterStart`, `ChapterMark 03`, the exact
 * bilingual headline / support / 30M+ metric / four facts from the manifest.
 * The canonical wedge step carries no `statement` or `caveat` field; those
 * slots are intentionally absent rather than silently empty.
 */
export const CanonicalWedgeSection: React.FC<CanonicalWedgeSectionProps> = ({
  lang,
  reducedMotion,
}) => {
  const step = CANONICAL_BY_ID.wedge;
  // Exactly one metric in the canonical wedge: 30M+ grams.
  const metric = step.metrics[0];

  return (
    <Chapter
      id={step.id}
      label={text(step.headline, lang)}
      tone="paper"
      rhythm="feature"
      chapterStart
    >
      <Spread>
        {/* ── 1. ChapterMark + headline / support / 30M + composition ── */}
        <Reveal reducedMotion={reducedMotion}>
          <ChapterMark
            number={step.serial}
            title={chapterTitle(step.chapter)}
            lang={lang}
          />

          {/*
           * Two-column grid on lg+: headline + support + 30M figure (start);
           * Color Intelligence composition photo (end). Columns flip in RTL
           * because the document-level `dir` is managed by the page.
           */}
          <div className="mt-9 grid gap-10 lg:mt-11 lg:grid-cols-[0.54fr_0.46fr] lg:items-start lg:gap-14">
            {/* Start column ─────────────────────────────────────────────── */}
            <div>
              <Display lang={lang} size="feature" className="max-w-[16ch]">
                {text(step.headline, lang)}
              </Display>

              <Lede className="mt-7 max-w-[30rem]">
                {text(step.support, lang)}
              </Lede>

              {/* 30M+ — ruled below the support text, not in a tile. */}
              <div
                className="mt-10 border-t pt-8"
                style={{ borderColor: CB.line }}
              >
                <BigFigure
                  value={metric.value}
                  lang={lang}
                  label={text(metric.label, lang)}
                />
              </div>
            </div>

            {/* End column: Color Intelligence composition ─────────────── */}
            <Figure
              caption={
                lang === "he"
                  ? "Color Intelligence. כל ערבוב הופך לאירוע נתונים"
                  : "Color Intelligence. Every mix becomes a data event"
              }
            >
              <Sheet>
                <div
                  className="flex items-center justify-center overflow-hidden rounded-[15px] px-4 py-5"
                  style={{ backgroundColor: CB.well }}
                >
                  <img
                    src="/investor/media/colorbar-composition.png"
                    alt={
                      lang === "he"
                        ? "ממשק Color Intelligence מציג מדידת ערבוב צבע בזמן אמת"
                        : "Color Intelligence interface showing a real-time color mix measurement"
                    }
                    width={640}
                    height={480}
                    className="mx-auto max-h-[22rem] w-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </Sheet>
            </Figure>
          </div>
        </Reveal>

        {/* ── 2. Panoramic color-bar photo strip ── */}
        <Reveal reducedMotion={reducedMotion} delay={0.04} className="mt-10">
          <Sheet>
            <div
              className="relative w-full overflow-hidden rounded-[15px]"
              style={{ aspectRatio: "16 / 6", backgroundColor: CB.well }}
            >
              <img
                src="/investor/media/color-bar.jpg"
                alt={
                  lang === "he"
                    ? "עמדת הצבע בסלון. כאן מתבצעת המדידה."
                    : "The salon color bar. This is where measurement happens."
                }
                className="h-full w-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Sheet>
        </Reveal>

        {/* ── 3. Four canonical outcome facts ── */}
        <Reveal reducedMotion={reducedMotion} delay={0.08} className="mt-12 lg:mt-14">
          <Rule />
          {/*
           * Logical border-end / padding-end / padding-start: auto-flips
           * in RTL so the divider and indent track the reading direction.
           */}
          <dl
            className="grid sm:grid-cols-2"
            aria-label={
              lang === "he" ? "ארבעה תוצאות מרכזיות" : "Four key outcomes"
            }
          >
            {step.facts.map((fact, index) => (
              <div
                key={fact.term.en}
                className={[
                  "border-b py-8",
                  index % 2 === 0 ? "sm:border-e sm:pe-8" : "sm:ps-8",
                ].join(" ")}
                style={{ borderColor: CB.line }}
              >
                <dt>
                  <Kicker>{text(fact.term, lang)}</Kicker>
                </dt>
                {fact.detail != null && (
                  <dd>
                    <Body className="mt-3">{text(fact.detail, lang)}</Body>
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </Reveal>

        {/*
         * `statement` and `caveat` are absent from the canonical wedge step.
         * These optional CanonicalStep fields are intentionally not rendered
         * here; inserting placeholder text would contradict the manifest.
         */}
      </Spread>
    </Chapter>
  );
};
