import React from "react";
import { CB } from "../colorBarTokens";
import { QuietBand, Sheet } from "../ColorBarPatterns";
import { FINAL_PLATFORM, FINAL_SALON_AI } from "../finalCopy";
import {
  Caption,
  Chapter,
  Display,
  Figure,
  Kicker,
  Lede,
  Movement,
  Reveal,
  Rule,
  Spread,
  TermList,
  t as text,
} from "../EditorialPrimitives";
import type { ArchivedChapterProps } from "./types";

const ARCHIVED_MEDIA = {
  salonAiPhone: "/investor/media/salon-ai-phone.jpg",
  shelves: "/investor/media/shelves.jpg",
} as const;

/** Archived editorial transition that preceded the canonical beat-07 diagram. */
export const SalonAiBridge: React.FC<ArchivedChapterProps> = ({ lang }) => (
  <QuietBand lang={lang} label={text(FINAL_SALON_AI.bridge, lang)} size="chapter">
    {text(FINAL_SALON_AI.bridge, lang)}
  </QuietBand>
);

/** Archived signal-to-action Salon AI chapter, retained for future restoration. */
export const ActionMovement: React.FC<ArchivedChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter label={text(FINAL_SALON_AI.support, lang)} tone="paper" rhythm="feature">
    <Spread>
      <Reveal reducedMotion={reducedMotion}>
        <Movement number="03" title={FINAL_PLATFORM.movements.action} lang={lang} />
        <div className="mt-7 grid gap-10 lg:grid-cols-[0.55fr_0.45fr] lg:items-center lg:gap-12">
          <div>
            <Kicker>{text(FINAL_SALON_AI.kicker, lang)}</Kicker>
            <Display lang={lang} size="cover" className="mt-4">
              {text(FINAL_SALON_AI.title, lang)}
            </Display>
            <Lede className="mt-7 max-w-[34rem]">{text(FINAL_SALON_AI.support, lang)}</Lede>
            <Rule className="mt-9" />
            <TermList items={FINAL_SALON_AI.contextTerms} lang={lang} className="mt-5" />
            <dl className="mt-6">
              {FINAL_SALON_AI.examples.map((example) => (
                <div
                  key={example.signal.en}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t py-3.5"
                  style={{ borderColor: CB.line }}
                >
                  <dt className="text-[0.95rem]" style={{ color: CB.muted }}>
                    {text(example.signal, lang)}
                  </dt>
                  <dd className="flex items-baseline gap-3 text-[0.95rem] font-medium" style={{ color: CB.ink }}>
                    <span aria-hidden="true" style={{ color: CB.copper }}>
                      {lang === "he" ? "←" : "→"}
                    </span>
                    {text(example.action, lang)}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 border-t pt-5" style={{ borderColor: CB.line }}>
              <TermList items={FINAL_SALON_AI.agents} lang={lang} />
              <Caption className="mt-3">{text(FINAL_SALON_AI.agentsSupport, lang)}</Caption>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[19rem] sm:max-w-[23rem] lg:max-w-[26rem]">
            <Figure caption={text(FINAL_SALON_AI.caption, lang)}>
              <Sheet>
                <div className="overflow-hidden rounded-[15px]" style={{ backgroundColor: CB.well }}>
                  <img
                    src={ARCHIVED_MEDIA.salonAiPhone}
                    alt={lang === "he" ? "כיוון עיצובי לאפליקציית Salon AI בנייד" : "Designed Salon AI mobile application direction"}
                    loading="lazy"
                    className="block h-auto w-full"
                  />
                </div>
              </Sheet>
            </Figure>
            <Sheet className="mt-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-[15px]" style={{ backgroundColor: CB.well }}>
                <img
                  src={ARCHIVED_MEDIA.shelves}
                  alt={lang === "he" ? "מדפי המוצרים בסלון" : "The salon product shelves"}
                  className="h-full w-full object-cover object-center"
                  loading="lazy"
                />
              </div>
            </Sheet>
          </div>
        </div>
      </Reveal>
    </Spread>
  </Chapter>
);
