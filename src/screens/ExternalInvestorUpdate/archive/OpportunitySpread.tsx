import React from "react";
import { CB, colorBarSans } from "../colorBarTokens";
import { FINAL_CHAPTERS, FINAL_INDUSTRY } from "../finalCopy";
import {
  Body,
  Caption,
  Chapter,
  ChapterMark,
  Display,
  Kicker,
  Reveal,
  Rule,
  Spread,
  t as text,
} from "../EditorialPrimitives";
import type { ArchivedChapterProps } from "./types";

/**
 * Archived Color Bar opportunity chapter.
 * Superseded by the canonical Market and Landscape chapters.
 */
export const OpportunitySpread: React.FC<ArchivedChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter id="opportunity" label={text(FINAL_INDUSTRY.title, lang)} tone="warm" rhythm="feature" chapterStart>
    <Spread>
      <Reveal reducedMotion={reducedMotion}>
        <ChapterMark {...FINAL_CHAPTERS.opportunity} lang={lang} />
        <Display lang={lang} size="feature" className="mt-8 max-w-[30ch]">
          {text(FINAL_INDUSTRY.title, lang)}
        </Display>
        <p
          style={{ fontFamily: colorBarSans(lang), color: CB.copperDeep }}
          className="mt-8 text-[clamp(1.35rem,3vw,2.1rem)] font-semibold tracking-[-0.035em]"
        >
          {text(FINAL_INDUSTRY.scale, lang)}
        </p>
        <Rule strong className="mt-7" />
        <div className="grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="border-b py-7 lg:border-b-0 lg:pe-10" style={{ borderColor: CB.line }}>
            <Kicker>{text(FINAL_INDUSTRY.salons, lang)}</Kicker>
            <Body className="mt-4 max-w-[24rem]">{text(FINAL_INDUSTRY.salonsOffer, lang)}</Body>
          </div>
          <div className="flex items-center py-7 lg:border-x lg:px-10" style={{ borderColor: CB.line }}>
            <p
              style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
              className="max-w-[16ch] text-[1.25rem] font-semibold leading-tight tracking-[-0.03em] sm:text-[1.5rem]"
            >
              {text(FINAL_INDUSTRY.center, lang)}
            </p>
          </div>
          <div className="border-t py-7 lg:border-t-0 lg:ps-10" style={{ borderColor: CB.line }}>
            <Kicker>{text(FINAL_INDUSTRY.industry, lang)}</Kicker>
            <Body className="mt-4 max-w-[24rem]">{text(FINAL_INDUSTRY.industryActors, lang)}</Body>
          </div>
        </div>
        <Rule strong />
        <Body className="mt-8 max-w-[41rem]">{text(FINAL_INDUSTRY.support, lang)}</Body>
        <Caption className="mt-4">{text(FINAL_INDUSTRY.caveat, lang)}</Caption>
      </Reveal>
    </Spread>
  </Chapter>
);
