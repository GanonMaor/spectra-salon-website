import React from "react";
import { CB, colorBarSans } from "../colorBarTokens";
import { FINAL_BUSINESS_MODEL, FINAL_GTM, FINAL_SAAS } from "../finalCopy";
import {
  Body,
  Caption,
  Chapter,
  Dateline,
  Display,
  Kicker,
  Reveal,
  Rule,
  Spread,
  figureAlign,
  t as text,
} from "../EditorialPrimitives";
import type { ArchivedChapterProps } from "./types";

/**
 * Archived Color Bar commercial chapter.
 * Superseded by the canonical GTM and Model chapters.
 */
export const CommercialProof: React.FC<ArchivedChapterProps> = ({ lang, reducedMotion }) => {
  const stages = [
    { value: "$960", label: "Color Intelligence" },
    { value: "$2,060", label: "Booking · CRM · POS" },
    { value: "$3,060", label: "Salon OS" },
    { value: "$4,860", label: "Salon AI" },
  ];

  return (
    <Chapter label={text(FINAL_GTM.title, lang)} tone="warm" rhythm="feature">
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <Kicker>{text(FINAL_GTM.kicker, lang)}</Kicker>
          <Display lang={lang} size="feature" className="mt-4 max-w-[22ch]">
            {text(FINAL_GTM.title, lang)}
          </Display>

          <figure className="mt-9 border-y py-8 sm:py-10" style={{ borderColor: CB.lineStrong }}>
            <div className="grid gap-10 lg:grid-cols-[0.72fr_0.28fr] lg:items-stretch lg:gap-12">
              <div>
                <div className="mb-7 flex items-end justify-between gap-5">
                  <div>
                    <p
                      dir="ltr"
                      style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                      className="text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-none tabular-nums tracking-[-0.05em]"
                    >
                      {FINAL_SAAS.spend}
                    </p>
                    <Kicker className="mt-2.5">{text(FINAL_GTM.spendLabel, lang)}</Kicker>
                  </div>
                  <span aria-hidden="true" className="mb-2 h-px flex-1" style={{ backgroundColor: CB.line }} />
                  <span aria-hidden="true" className="mb-0.5 text-[1.4rem]" style={{ color: CB.copper }}>
                    {lang === "he" ? "←" : "→"}
                  </span>
                </div>

                <div dir="ltr" className="space-y-2.5">
                  {FINAL_SAAS.funnel.slice(0, 3).map((stage, index) => {
                    const widths = ["100%", "67%", "46%"];
                    const fills = [
                      "rgba(163,125,56,0.26)",
                      "rgba(163,125,56,0.16)",
                      "rgba(163,125,56,0.09)",
                    ];
                    const conversions = ["", "20.4%", "31.9%"];

                    return (
                      <div key={stage.value} className="relative">
                        {index > 0 && (
                          <span
                            className="absolute -top-[0.7rem] end-0 text-[9px] font-semibold uppercase tracking-[0.12em]"
                            style={{ color: CB.muted }}
                          >
                            {conversions[index]}
                          </span>
                        )}
                        <div
                          className="flex min-h-[4.4rem] items-center justify-between gap-5 rounded-e-[14px] border-s-[3px] px-4 sm:px-5"
                          style={{
                            width: widths[index],
                            background: fills[index],
                            borderColor: CB.copper,
                          }}
                        >
                          <span
                            style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                            className="text-[clamp(1.6rem,3.4vw,2.6rem)] font-semibold leading-none tabular-nums tracking-[-0.045em]"
                          >
                            {stage.value}
                          </span>
                          <span
                            dir={lang === "he" ? "rtl" : "ltr"}
                            className="text-end text-[9px] font-extrabold uppercase tracking-[0.14em] sm:text-[10px]"
                            style={{ color: CB.copperDeep }}
                          >
                            {text(stage.label, lang)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                className="flex flex-col justify-between border-t pt-6 lg:border-s lg:border-t-0 lg:ps-9 lg:pt-0"
                style={{ borderColor: CB.line }}
              >
                <Kicker>{text(FINAL_SAAS.funnel[3].label, lang)}</Kicker>
                <div className="mt-7 lg:mt-auto">
                  <p
                    dir="ltr"
                    style={{ fontFamily: colorBarSans(lang), color: CB.copperDeep }}
                    className={`text-[clamp(3rem,6.4vw,5rem)] font-semibold leading-[0.86] tabular-nums tracking-[-0.055em] ${figureAlign(lang)}`}
                  >
                    {FINAL_SAAS.funnel[3].value}
                  </p>
                  <p
                    dir={lang === "he" ? "rtl" : "ltr"}
                    className="mt-5 text-[11px] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: CB.muted }}
                  >
                    {FINAL_SAAS.customers} {text(FINAL_GTM.outcomeLabel, lang)}
                  </p>
                </div>
              </div>
            </div>
            <figcaption>
              <Caption className="mt-6">{text(FINAL_GTM.caption, lang)}</Caption>
            </figcaption>
          </figure>

          <Rule className="mt-8" />
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:gap-10">
            <Kicker className="shrink-0 sm:pt-1.5">{text(FINAL_SAAS.unitLabel, lang)}</Kicker>
            <div>
              <Dateline items={FINAL_SAAS.unit} lang={lang} />
              <Caption className="mt-3">{text(FINAL_SAAS.unitCaveat, lang)}</Caption>
            </div>
          </div>

          <Rule className="mt-11" />
          <Display lang={lang} size="chapter" className="mt-8 max-w-[24ch]">
            {text(FINAL_BUSINESS_MODEL.title, lang)}
          </Display>
          <div dir="ltr" className="mt-7 flex flex-wrap items-baseline gap-x-4 gap-y-5 sm:gap-x-6">
            {stages.map((item, index) => (
              <React.Fragment key={item.label}>
                {index > 0 && (
                  <span aria-hidden="true" className="text-[1.1rem]" style={{ color: CB.copper }}>
                    →
                  </span>
                )}
                <div>
                  <p
                    style={{
                      fontFamily: colorBarSans(lang),
                      color: index === stages.length - 1 ? CB.copperDeep : CB.ink,
                    }}
                    className="text-[1.5rem] font-semibold leading-none tabular-nums tracking-[-0.04em] sm:text-[2.1rem]"
                  >
                    {item.value}
                  </p>
                  <p
                    className="mt-2.5 text-[10px] font-semibold uppercase leading-4 tracking-[0.1em]"
                    style={{ color: CB.muted }}
                  >
                    {item.label}
                  </p>
                </div>
              </React.Fragment>
            ))}
          </div>
          <Body className="mt-8">{text(FINAL_BUSINESS_MODEL.line, lang)}</Body>
          <Caption className="mt-3">{text(FINAL_BUSINESS_MODEL.caveat, lang)}</Caption>
        </Reveal>
      </Spread>
    </Chapter>
  );
};
