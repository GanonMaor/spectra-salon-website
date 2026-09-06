import React from "react";
import { InvestorHeroCustomerProof } from "./InvestorHeroCustomerProof";
import { CANONICAL_BY_ID } from "./canonicalNarrative";
import { CB, colorBarSans } from "./colorBarTokens";
import type { UpdateLang } from "./finalCopy";
import { Caption, Chapter, Kicker, Reveal, Rule, Spread, loc, t as text } from "./EditorialPrimitives";

export type CanonicalProofSectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const COPY = {
  label: loc("Proof of real usage", "הוכחת שימוש אמיתי"),
  railCaption: loc(
    "Spectra in daily use, filmed and published by salon professionals.",
    "Spectra בשימוש יומיומי, כפי שצולם ופורסם בידי אנשי מקצוע בסלונים.",
  ),
} as const;

const STEP = CANONICAL_BY_ID.proof;

export const CanonicalProofSection: React.FC<CanonicalProofSectionProps> = ({
  lang,
  reducedMotion,
}) => (
  <Chapter
    id="proof"
    label={text(COPY.label, lang)}
    tone="paper"
    rhythm="feature"
    chapterStart
  >
    <div dir={lang === "he" ? "rtl" : "ltr"}>
      <Spread width="page">
        <Reveal reducedMotion={reducedMotion}>
          <Kicker>{STEP.serial} / {STEP.chapter}</Kicker>

          <h2
            style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
            className="mt-7 max-w-[17ch] text-pretty text-[clamp(2.3rem,6.7vw,5.25rem)] font-semibold leading-[0.98] tracking-[-0.055em]"
          >
            {text(STEP.headline, lang)}
          </h2>

          <p
            className="mt-7 max-w-[43rem] text-[1.05rem] leading-[1.65] sm:text-[1.2rem]"
            style={{ color: CB.muted }}
          >
            {text(STEP.support, lang)}
          </p>

          <Rule strong className="mt-12 sm:mt-16" />
          <dl className="grid sm:grid-cols-2 lg:grid-cols-3">
            {STEP.metrics.map((metric, index) => (
              <div
                key={metric.value}
                className={[
                  "min-w-0 border-b py-7 sm:px-7 sm:py-9",
                  index % 2 === 1 ? "sm:border-s" : "",
                  index % 2 === 0 ? "sm:pe-7" : "",
                  index % 3 !== 0 ? "lg:border-s" : "lg:border-s-0 lg:ps-0",
                  index >= 3 ? "lg:border-b-0" : "",
                ].join(" ")}
                style={{ borderColor: CB.lineStrong }}
              >
                <dd
                  dir="ltr"
                  style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                  className={`text-[clamp(2.25rem,5vw,4.4rem)] font-semibold leading-[0.9] tabular-nums tracking-[-0.06em] ${
                    lang === "he" ? "text-right" : "text-left"
                  }`}
                >
                  {metric.value}
                </dd>
                <dt
                  className="mt-4 text-[10px] font-extrabold uppercase tracking-[0.15em]"
                  style={{ color: CB.copperDeep }}
                >
                  {text(metric.label, lang)}
                </dt>
                {"detail" in metric && metric.detail && (
                  <dd className="mt-2 max-w-[25rem] text-[12px] leading-[1.55]" style={{ color: CB.muted }}>
                    {text(metric.detail, lang)}
                  </dd>
                )}
              </div>
            ))}
          </dl>

          <div className="mt-12 grid gap-x-12 gap-y-5 lg:grid-cols-[0.34fr_0.66fr] lg:items-start">
            <span aria-hidden="true" className="mt-2 block h-px w-12" style={{ backgroundColor: CB.copper }} />
            <p
              style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
              className="max-w-[30ch] text-pretty text-[clamp(1.45rem,3.4vw,2.45rem)] font-semibold leading-[1.13] tracking-[-0.04em]"
            >
              {text(STEP.statement, lang)}
            </p>
          </div>

          <Rule strong className="mt-12 sm:mt-16" />
          <div className="mt-8">
            <InvestorHeroCustomerProof lang={lang} reducedMotion={reducedMotion} />
          </div>
          <Caption className="mt-4">{text(COPY.railCaption, lang)}</Caption>
        </Reveal>
      </Spread>
    </div>
  </Chapter>
);

export default CanonicalProofSection;
