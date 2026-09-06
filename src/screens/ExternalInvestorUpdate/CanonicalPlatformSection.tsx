import React from "react";
import { CANONICAL_BY_ID } from "./canonicalNarrative";
import { CB, colorBarSans } from "./colorBarTokens";
import type { Localized, UpdateLang } from "./finalCopy";
import {
  Caption,
  Chapter,
  ChapterMark,
  Display,
  Lede,
  Reveal,
  Rule,
  Spread,
  figureAlign,
  t as text,
} from "./EditorialPrimitives";

export type CanonicalPlatformSectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const chapterTitle = (chapter: string): Localized => ({ en: chapter, he: chapter });

/**
 * Canonical beat 06. This is the platform chapter's thesis page; product
 * captures that follow it provide the subordinate proof.
 */
export const CanonicalPlatformSection: React.FC<CanonicalPlatformSectionProps> = ({
  lang,
  reducedMotion,
}) => {
  const step = CANONICAL_BY_ID.platform;
  const direction = lang === "he" ? "rtl" : "ltr";
  const maturityLabelId = "platform-maturity-label";

  return (
    <Chapter
      id="platform"
      label={text(step.headline, lang)}
      tone="paper"
      rhythm="feature"
      chapterStart
    >
      <div dir={direction}>
        <Spread width="page">
          <Reveal reducedMotion={reducedMotion}>
            <ChapterMark
              number={step.serial}
              title={chapterTitle(step.chapter)}
              lang={lang}
            />

            <div className="mt-9 grid gap-x-16 gap-y-8 lg:mt-11 lg:grid-cols-[minmax(0,0.62fr)_minmax(17rem,0.38fr)] lg:items-end">
              <h2
                style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                className="max-w-[20ch] text-pretty text-[clamp(2.65rem,7.7vw,6.6rem)] font-semibold leading-[0.92] tracking-[-0.065em]"
              >
                {text(step.headline, lang)}
              </h2>
              <Lede className="max-w-[34rem] lg:pb-2">{text(step.support, lang)}</Lede>
            </div>

            <Rule strong className="mt-12 sm:mt-16" />

            <div className="grid gap-y-12 lg:grid-cols-[minmax(0,0.62fr)_minmax(17rem,0.38fr)]">
              <section aria-label={text(step.headline, lang)} className="pt-8 lg:pe-12">
                <ol className="border-y" style={{ borderColor: CB.lineStrong }}>
                  {step.facts.map((layer, index) => (
                    <li
                      key={layer.term.en}
                      className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 py-6 sm:grid-cols-[3rem_minmax(0,0.52fr)_minmax(0,0.48fr)] sm:items-baseline sm:gap-x-7 sm:py-7"
                      style={index > 0 ? { borderTop: `1px solid ${CB.lineStrong}` } : undefined}
                    >
                      <span
                        dir="ltr"
                        aria-hidden="true"
                        className="text-[10px] font-extrabold tabular-nums tracking-[0.16em]"
                        style={{ color: CB.copperDeep }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3
                        style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                        className="text-[clamp(1.35rem,3vw,2.25rem)] font-semibold leading-[1.05] tracking-[-0.045em]"
                      >
                        <span dir="ltr" className="inline-block">
                          {text(layer.term, lang)}
                        </span>
                      </h3>
                      <p
                        className="col-start-2 mt-2 text-[0.95rem] leading-[1.6] sm:col-start-3 sm:mt-0"
                        style={{ color: index === step.facts.length - 1 ? CB.copperDeep : CB.muted }}
                      >
                        {text(layer.detail, lang)}
                      </p>
                    </li>
                  ))}
                </ol>
              </section>

              <aside
                aria-labelledby={maturityLabelId}
                className="border-t pt-8 lg:border-s lg:border-t-0 lg:ps-10"
                style={{ borderColor: CB.lineStrong }}
              >
                <p
                  id={maturityLabelId}
                  className="text-[10px] font-extrabold uppercase leading-[1.5] tracking-[0.16em]"
                  style={{ color: CB.copperDeep }}
                >
                  {text(step.metricsLabel, lang)}
                </p>

                <dl className="mt-6 border-y" style={{ borderColor: CB.lineStrong }}>
                  {step.metrics.map((metric, index) => (
                    <div
                      key={metric.label.en}
                      className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-5 py-5"
                      style={index > 0 ? { borderTop: `1px solid ${CB.line}` } : undefined}
                    >
                      <dd
                        dir="ltr"
                        style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                        className="text-[clamp(2rem,4.6vw,3.35rem)] font-semibold leading-none tabular-nums tracking-[-0.055em]"
                      >
                        {metric.value}
                      </dd>
                      <dt
                        className="text-[10px] font-semibold uppercase leading-[1.45] tracking-[0.12em]"
                        style={{ color: CB.muted }}
                      >
                        {text(metric.label, lang)}
                      </dt>
                    </div>
                  ))}
                </dl>

                <div className="mt-6">
                  <Caption>{text(step.caveat, lang)}</Caption>
                  <Caption className={`mt-2 ${figureAlign(lang)}`}>
                    <span dir="ltr" className="inline-block">
                      {step.sources}
                    </span>
                  </Caption>
                </div>
              </aside>
            </div>
          </Reveal>

          <Reveal reducedMotion={reducedMotion} delay={0.05}>
            <div
              className="mt-14 grid gap-x-10 gap-y-5 border-t pt-8 lg:mt-16 lg:grid-cols-[0.2fr_0.8fr]"
              style={{ borderColor: CB.lineStrong }}
            >
              <span
                aria-hidden="true"
                className="mt-2 block h-px w-12"
                style={{ backgroundColor: CB.copper }}
              />
              <Display lang={lang} as="p" size="feature" className="max-w-[27ch]">
                {text(step.statement, lang)}
              </Display>
            </div>
          </Reveal>
        </Spread>
      </div>
    </Chapter>
  );
};

export default CanonicalPlatformSection;
