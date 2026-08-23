import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BrowserFrame,
  CalendarGrid,
  LiveClientsVertical,
} from "../NewNarrativeSalonAIFirst/sections/liveDemoDraft/BookingSchedulingIntelligenceDraftSlide";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";
import {
  FINAL_ADOPTION,
  FINAL_BOOKING,
  FINAL_BUSINESS_MODEL,
  FINAL_CHAPTERS,
  FINAL_CLOSE,
  FINAL_COLOR_WEDGE,
  FINAL_DECISION,
  FINAL_GTM,
  FINAL_HERO,
  FINAL_INDUSTRY,
  FINAL_LEDE,
  FINAL_META,
  FINAL_PEOPLE,
  FINAL_PLATFORM,
  FINAL_PROBLEM,
  FINAL_REVELATION,
  FINAL_SAAS,
  FINAL_SALON_AI,
  FINAL_SALON_OS,
  type UpdateLang,
} from "./finalCopy";
import {
  Body,
  Caption,
  Chapter,
  ChapterMark,
  Dateline,
  Display,
  Figure,
  Kicker,
  Lede,
  Movement,
  PullQuote,
  Reveal,
  Rule,
  Spread,
  TermList,
  displayFamily,
  figureAlign,
  t as text,
} from "./EditorialPrimitives";
import {
  CapitalExpansionSection,
  CoreTeamSection,
  IndustryDataLayerVisualSection,
  SalonOperatingPictureSection,
  SixSalonEvidenceSection,
} from "./ExternalInvestorIntelligenceSections";
import { ClientAppImageSpread } from "./ClientAppImageSpread";
import { ExternalInvestorPresentation } from "./ExternalInvestorPresentation";
import { OwnerCommandSpread } from "./OwnerCommandSpread";
import { SLIDE } from "./PresentationSlide";
import { InvestorHeroCustomerProof } from "./InvestorHeroCustomerProof";
import { HERO_PROOF_METRICS } from "./InvestorHeroProofRail";

/**
 * Optimized copies of the shared investor-vision photography. The originals are
 * 1.4 MB PNGs, which made the printed story and the page itself far heavier
 * than the layout needs.
 */
const MEDIA = {
  reception: "/investor/media/reception.jpg",
  colorBar: "/investor/media/color-bar.jpg",
  shelves: "/investor/media/shelves.jpg",
  colorBarComposition: "/investor/media/colorbar-composition.png",
  salonAiPhone: "/investor/media/salon-ai-phone.jpg",
} as const;

const FOUNDER_IMAGE = "/team/maor-elad-spectra.jpg";
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Physical 16:9 page for the slide deck, identical to its pixel canvas. */
const PRESENTATION_PAGE = { width: SLIDE.pageWidthIn, height: SLIDE.pageHeightIn } as const;

type ChapterProps = { lang: UpdateLang; reducedMotion: boolean };

const LanguageToggle: React.FC<{
  lang: UpdateLang;
  setLang: (lang: UpdateLang) => void;
}> = ({ lang, setLang }) => (
  <div
    className="inline-flex border border-[#2b221b]/15"
    role="group"
    aria-label={lang === "he" ? "החלפת שפה" : "Change language"}
  >
    {(["en", "he"] as UpdateLang[]).map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={lang === option}
        onClick={() => setLang(option)}
        className={`min-h-9 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
          lang === option ? "bg-[#2b221b] text-[#fbf6ef]" : "text-[#2b221b]/50 hover:text-[#2b221b]"
        }`}
      >
        {option === "en" ? "EN" : "עברית"}
      </button>
    ))}
  </div>
);

/* ---------------------------------------------------------------- Chapter 01 */

const Cover: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <section
    id="top"
    aria-label={text(FINAL_HERO.title, lang)}
    className="investor-print-block relative overflow-hidden bg-[#17110d] px-5 pb-12 pt-[max(6rem,calc(env(safe-area-inset-top)+5.25rem))] text-[#fbf6ef] sm:px-8 sm:pb-16 sm:pt-28"
  >
    <div className="absolute inset-0 bg-[linear-gradient(150deg,#191210_0%,#231a13_54%,#0e0a07_100%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_72%_38%,rgba(217,185,129,0.10),transparent_70%)]" />

    <motion.div
      className="relative mx-auto max-w-[75rem]"
      initial={reducedMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.8, ease }}
    >
      <div className="flex items-baseline justify-between gap-6">
        <p
          dir="ltr"
          style={{ fontFamily: displayFamily(lang) }}
          className="text-[1.6rem] leading-none tracking-[0.14em] text-[#fbf6ef] sm:text-[2rem]"
        >
          SPECTRA
        </p>
        <p className="max-w-[14rem] text-end text-[10px] font-semibold uppercase leading-tight tracking-[0.18em] text-[#fbf6ef]/45 sm:max-w-none">
          <span className="sm:hidden">{text(FINAL_META.date, lang)}</span>
          <span className="hidden sm:inline">
            {text(FINAL_META.date, lang)}
            <span aria-hidden="true" className="mx-2 text-[#d9b981]/40">
              ·
            </span>
            {text(FINAL_META.edition, lang)}
          </span>
        </p>
      </div>
      <Rule dark strong className="mt-4" />

      <div className="mt-8 grid gap-8 lg:grid-cols-[0.53fr_0.47fr] lg:items-end lg:gap-12">
        <div>
          <p
            style={{ fontFamily: displayFamily(lang) }}
            className="text-lg italic text-[#d9b981] sm:text-xl"
          >
            {text(FINAL_HERO.coverLine, lang)}
          </p>
          <Kicker dark className="mt-2.5 !text-[#fbf6ef]/45">
            {text(FINAL_HERO.role, lang)}
          </Kicker>

          <Display as="h1" lang={lang} size="cover" dark className="mt-6 max-w-[22ch]">
            {text(FINAL_HERO.title, lang)}
          </Display>

          <Lede dark className="mt-6 max-w-[34rem]">
            {text(FINAL_HERO.statusLine, lang)}
          </Lede>
        </div>

        <figure className="border border-white/12">
          <div className="relative aspect-[3/2] overflow-hidden">
            <img
              src={FOUNDER_IMAGE}
              alt={text(FINAL_HERO.founderAlt, lang)}
              className="h-full w-full object-cover object-[50%_50%]"
              loading="eager"
            />
          </div>
        </figure>
      </div>

      <Rule dark className="mt-10" />
      <Kicker dark className="mt-5">
        {text(FINAL_HERO.proofLabel, lang)}
      </Kicker>
      <Dateline items={HERO_PROOF_METRICS} lang={lang} dark size="lg" animate className="mt-5" />
    </motion.div>
  </section>
);

const OpeningArticle: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter id="origin" label={text(FINAL_LEDE.title, lang)} tone="paper" rhythm="feature" chapterStart>
    <Spread>
      <Reveal reducedMotion={reducedMotion}>
        <ChapterMark {...FINAL_CHAPTERS.company} lang={lang} />

        <div className="mt-9 grid gap-x-14 gap-y-8 lg:grid-cols-[0.38fr_0.62fr]">
          <Display lang={lang} size="feature" className="max-w-[16ch]">
            {text(FINAL_LEDE.title, lang)}
          </Display>

          <div className="max-w-[41rem]">
            <Lede>{FINAL_LEDE.paragraphs[lang][0]}</Lede>
            {FINAL_LEDE.paragraphs[lang].slice(1).map((paragraph) => (
              <Body key={paragraph} className="mt-5">
                {paragraph}
              </Body>
            ))}
          </div>
        </div>

        <PullQuote lang={lang} className="mt-10 lg:ms-[38%]">
          {text(FINAL_LEDE.pull, lang)}
        </PullQuote>
      </Reveal>
    </Spread>
  </Chapter>
);

/* ---------------------------------------------------------------- Chapter 02 */

const ColorFeature: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter label={text(FINAL_COLOR_WEDGE.title, lang)} tone="ink" rhythm="feature" chapterStart className="overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-[0.28]"
      style={{ backgroundImage: `url('${MEDIA.colorBar}')` }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(9,6,4,0.94),rgba(9,6,4,0.7))]" />

    <Spread className="relative">
      <Reveal reducedMotion={reducedMotion}>
        <ChapterMark {...FINAL_CHAPTERS.built} lang={lang} dark />

        <div className="mt-8 grid gap-9 lg:grid-cols-[0.44fr_0.56fr] lg:items-center lg:gap-14">
          <div>
            <Display lang={lang} size="feature" dark className="max-w-[15ch]">
              {text(FINAL_COLOR_WEDGE.title, lang)}
            </Display>
            <p
              style={{ fontFamily: displayFamily(lang) }}
              className="mt-6 text-xl italic text-[#d9b981] sm:text-2xl"
            >
              {text(FINAL_COLOR_WEDGE.cadence, lang)}
            </p>
            <Body dark className="mt-5 max-w-[32rem]">
              {text(FINAL_COLOR_WEDGE.wedge, lang)}
            </Body>
          </div>

          <Figure dark caption={text(FINAL_COLOR_WEDGE.caption, lang)}>
            <img
              src={MEDIA.colorBarComposition}
              alt={text(FINAL_HERO.visualAlt, lang)}
              className="mx-auto max-h-[22rem] w-full object-contain"
              loading="lazy"
            />
          </Figure>
        </div>

        <Rule dark className="mt-9" />
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <TermList items={FINAL_COLOR_WEDGE.terms} lang={lang} dark />
          <Body dark className="sm:text-end">
            {text(FINAL_COLOR_WEDGE.close, lang)}
          </Body>
        </div>

        <PullQuote lang={lang} dark size="feature" className="mt-10 max-w-[46rem]">
          {text(FINAL_COLOR_WEDGE.pull, lang)}
        </PullQuote>

        <Rule dark strong className="mt-14" />
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Display lang={lang} size="feature" dark>
              {text(FINAL_ADOPTION.title, lang)}
            </Display>
            <Body dark className="mt-4 max-w-[32rem]">
              {text(FINAL_ADOPTION.body, lang)}
            </Body>
          </div>
          <Kicker dark className="sm:pb-2">
            {text(FINAL_ADOPTION.strip, lang)}
          </Kicker>
        </div>

        {/* The customers' own clips, at full editorial scale. */}
        <div className="mt-8">
          <InvestorHeroCustomerProof lang={lang} reducedMotion={reducedMotion} dark />
        </div>
        <Caption dark className="mt-4">
          {text(FINAL_ADOPTION.caption, lang)}
        </Caption>
      </Reveal>
    </Spread>
  </Chapter>
);

/* ---------------------------------------------------------------- Chapter 03 */

const TurningPoint: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter label={text(FINAL_REVELATION.title, lang)} tone="ink" rhythm="pause" chapterStart className="overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-[0.2]"
      style={{ backgroundImage: `url('${MEDIA.reception}')` }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,6,4,0.9),rgba(9,6,4,0.96))]" />

    <Spread width="page" className="relative">
      <Reveal reducedMotion={reducedMotion}>
        <ChapterMark {...FINAL_CHAPTERS.discovered} lang={lang} dark />
        <Display lang={lang} size="cover" dark className="mt-9 max-w-[26ch]">
          {text(FINAL_REVELATION.title, lang)}
        </Display>
        <Lede dark className="mt-8 max-w-[38rem]">
          {text(FINAL_REVELATION.body, lang)}
        </Lede>
        <Rule dark className="mt-9" />
        <TermList items={FINAL_REVELATION.signals} lang={lang} dark className="mt-5" />
      </Reveal>
    </Spread>
  </Chapter>
);

/* ---------------------------------------------------------------- Chapter 05 */

const DecisionSpread: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter label={text(FINAL_DECISION.close, lang)} tone="ink" rhythm="feature" chapterStart>
    <Spread className="relative">
      <Reveal reducedMotion={reducedMotion}>
        <ChapterMark {...FINAL_CHAPTERS.platform} lang={lang} dark />

        <div className="mt-8 grid gap-x-14 gap-y-5 lg:grid-cols-[0.52fr_0.48fr] lg:items-end">
          <Display lang={lang} size="feature" dark className="max-w-[24ch]">
            {text(FINAL_PROBLEM.title, lang)}
          </Display>
          <div className="max-w-[32rem]">
            <Lede dark>{text(FINAL_PROBLEM.intro, lang)}</Lede>
            <Body dark className="mt-4">
              {text(FINAL_PROBLEM.systems, lang)}
            </Body>
          </div>
        </div>

        <Rule dark className="mt-10" />

        <div className="mt-9 max-w-[46rem]">
          <Display lang={lang} size="feature" dark>
            {text(FINAL_DECISION.title, lang)}
          </Display>
          <Body dark className="mt-5 max-w-[34rem]">
            {text(FINAL_DECISION.body, lang)}
          </Body>
        </div>

        <p
          style={{ fontFamily: displayFamily(lang) }}
          className="mt-11 max-w-[30ch] text-[clamp(2.2rem,5.6vw,4.4rem)] font-normal leading-[1.04] tracking-[-0.02em] text-[#d9b981]"
        >
          {text(FINAL_DECISION.close, lang)}
        </p>

        <Rule dark className="mt-16" />
        <div className="mt-12 grid gap-x-14 gap-y-6 lg:grid-cols-[0.4fr_0.6fr] lg:items-baseline">
          <div>
            <Kicker dark>{text(FINAL_PLATFORM.intro, lang)}</Kicker>
            <Movement
              number="01"
              title={FINAL_PLATFORM.movements.capacity}
              lang={lang}
              dark
              className="mt-4"
            />
          </div>
          <div>
            <Display lang={lang} size="feature" dark className="max-w-[22ch]">
              {text(FINAL_BOOKING.title, lang)}
            </Display>
            <Body dark className="mt-5 max-w-[32rem]">
              {text(FINAL_BOOKING.support, lang)}
            </Body>
          </div>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.7, ease, delay: reducedMotion ? 0 : 0.1 }}
          className="relative mt-9 hidden overflow-hidden xl:block"
          style={{ height: "clamp(380px, 44vh, 470px)" }}
        >
          <div className="absolute inset-0 flex overflow-hidden" style={{ zIndex: 1 }}>
            <BrowserFrame>
              <CalendarGrid />
            </BrowserFrame>
          </div>
          <div
            className="absolute right-0 top-1/2"
            style={{ transform: "translateY(-50%) scale(0.7)", transformOrigin: "right center", zIndex: 3 }}
          >
            <LiveClientsVertical />
          </div>
        </motion.div>

        <div className="relative mt-9 h-[280px] overflow-hidden border border-white/10 sm:h-[380px] md:h-[430px] lg:h-[490px] xl:hidden">
          <div className="absolute left-1/2 top-4 h-[570px] w-[900px] origin-top -translate-x-1/2 scale-[0.31] min-[360px]:scale-[0.40] sm:scale-[0.62] md:scale-[0.78] lg:scale-100">
            <div className="absolute inset-0 flex overflow-hidden">
              <BrowserFrame>
                <CalendarGrid />
              </BrowserFrame>
            </div>
            <div
              className="absolute right-0 top-1/2"
              style={{ transform: "translateY(-50%) scale(0.82)", transformOrigin: "right center", zIndex: 3 }}
            >
              <LiveClientsVertical />
            </div>
          </div>
        </div>

        <div dir="ltr" className="mt-8 grid grid-cols-2 border-y border-white/12 sm:grid-cols-[3fr_4fr_2fr_3fr]">
          {[
            { name: lang === "he" ? "התחלה" : "Application", minutes: "45m", released: false },
            { name: lang === "he" ? "זמן עיבוד" : "Processing", minutes: "60m", released: true },
            { name: lang === "he" ? "השלב הבא" : "Next step", minutes: "30m", released: false },
            { name: lang === "he" ? "סיום" : "Finish", minutes: "45m", released: false },
          ].map((stage, index) => (
            <div
              key={stage.name}
              dir={lang === "he" ? "rtl" : "ltr"}
              className={`relative min-w-0 border-white/12 px-3 py-4 ${
                stage.released ? "bg-[#9fc9a8]/14" : "bg-black/10"
              } ${index % 2 === 1 ? "border-s" : ""} ${
                index >= 2 ? "border-t sm:border-t-0" : ""
              } sm:border-s sm:first:border-s-0`}
            >
              {stage.released && (
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-[#9fc9a8]" />
              )}
              <p
                className={`truncate text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  stage.released ? "text-[#b9e2c1]" : "text-[#fbf6ef]/48"
                }`}
              >
                {stage.name}
              </p>
              <p
                className={`mt-1.5 tabular-nums ${
                  stage.released
                    ? "text-[1.15rem] font-semibold text-[#b9e2c1]"
                    : "text-[11px] text-[#fbf6ef]/30"
                }`}
              >
                {stage.minutes}
              </p>
              <p
                dir={lang === "he" ? "rtl" : "ltr"}
                className={`mt-3 font-light leading-4 ${
                  stage.released
                    ? "text-[12px] font-semibold text-[#b9e2c1]"
                    : "text-[9px] text-[#fbf6ef]/26"
                }`}
              >
                {stage.released
                  ? lang === "he"
                    ? "הספר פנוי"
                    : "Stylist free"
                  : lang === "he"
                    ? "עם הלקוחה"
                    : "With client"}
              </p>
            </div>
          ))}
        </div>
        <div
          dir={lang === "he" ? "rtl" : "ltr"}
          className="grid gap-4 border-b border-[#9fc9a8]/35 bg-[#9fc9a8]/10 px-5 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#9fc9a8]/45 text-[1.25rem] font-light text-[#b9e2c1]">
            +
          </div>
          <div>
            <p
              style={{ fontFamily: displayFamily(lang) }}
              className="text-[1.3rem] leading-tight text-[#d9f0de] sm:text-[1.6rem]"
            >
              {lang === "he" ? "בזמן העיבוד, הספר יכול לקבל לקוחה נוספת." : "During processing, the stylist can take another client."}
            </p>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9fc9a8]/70">
              {lang === "he" ? "60 דקות של קיבולת אמיתית שהתפנתה" : "60 minutes of real capacity released"}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="hidden text-[1.7rem] text-[#9fc9a8]/55 sm:block"
          >
            {lang === "he" ? "←" : "→"}
          </span>
        </div>
        <Caption dark className="mt-4">
          {text(FINAL_BOOKING.caption, lang)}
        </Caption>
      </Reveal>
    </Spread>
  </Chapter>
);

/**
 * An editorial pause, not a section. It carries the reader from the operating
 * picture into the Salon AI chapter with a single line on black.
 */
const SalonAiBridge: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter label={text(FINAL_SALON_AI.bridge, lang)} tone="ink" rhythm="pause">
    <Spread width="page">
      <Reveal reducedMotion={reducedMotion}>
        <p
          style={{ fontFamily: displayFamily(lang) }}
          className="mx-auto max-w-[32ch] text-center text-[clamp(1.45rem,3.4vw,2.5rem)] italic leading-[1.26] text-[#d9b981]"
        >
          {text(FINAL_SALON_AI.bridge, lang)}
        </p>
      </Reveal>
    </Spread>
  </Chapter>
);

const ActionMovement: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter label={text(FINAL_SALON_AI.support, lang)} tone="ink" rhythm="feature" className="overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-[0.22]"
      style={{ backgroundImage: `url('${MEDIA.shelves}')` }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(9,6,4,0.95),rgba(9,6,4,0.74))]" />

    <Spread className="relative">
      <Reveal reducedMotion={reducedMotion}>
        <Movement number="03" title={FINAL_PLATFORM.movements.action} lang={lang} dark />

        <div className="mt-7 grid gap-10 lg:grid-cols-[0.55fr_0.45fr] lg:items-center lg:gap-12">
          <div>
            <Kicker dark className="!tracking-[0.18em]">
              {text(FINAL_SALON_AI.kicker, lang)}
            </Kicker>
            <Display lang={lang} size="cover" dark className="mt-4">
              {text(FINAL_SALON_AI.title, lang)}
            </Display>
            <Lede dark className="mt-7 max-w-[34rem]">
              {text(FINAL_SALON_AI.support, lang)}
            </Lede>

            <Rule dark className="mt-9" />
            <TermList items={FINAL_SALON_AI.contextTerms} lang={lang} dark className="mt-5 !text-[#d9b981]" />

            <dl className="mt-6">
              {FINAL_SALON_AI.examples.map((example) => (
                <div
                  key={example.signal.en}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-white/10 py-3.5"
                >
                  <dt className="text-[0.95rem] font-light text-[#fbf6ef]/52">{text(example.signal, lang)}</dt>
                  <dd className="flex items-baseline gap-3 text-[0.95rem] font-light text-[#fbf6ef]/85">
                    <span aria-hidden="true" className="text-[#d9b981]/45">
                      {lang === "he" ? "←" : "→"}
                    </span>
                    {text(example.action, lang)}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 border-t border-white/10 pt-5">
              <TermList items={FINAL_SALON_AI.agents} lang={lang} dark />
              <Caption dark className="mt-3">
                {text(FINAL_SALON_AI.agentsSupport, lang)}
              </Caption>
            </div>
          </div>

          <Figure
            dark
            caption={text(FINAL_SALON_AI.caption, lang)}
            className="mx-auto w-full max-w-[19rem] sm:max-w-[23rem] lg:max-w-[26rem]"
          >
            <div className="border border-white/12">
              <img
                src={MEDIA.salonAiPhone}
                alt={
                  lang === "he"
                    ? "כיוון עיצובי לאפליקציית Salon AI בנייד"
                    : "Designed Salon AI mobile application direction"
                }
                loading="lazy"
                draggable={false}
                className="block h-auto w-full"
              />
            </div>
          </Figure>
        </div>
      </Reveal>
    </Spread>
  </Chapter>
);

/* ---------------------------------------------------------------- Chapter 06 */

const OpportunitySpread: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter id="opportunity" label={text(FINAL_INDUSTRY.title, lang)} tone="warm" rhythm="feature" chapterStart>
    <Spread>
      <Reveal reducedMotion={reducedMotion}>
        <ChapterMark {...FINAL_CHAPTERS.opportunity} lang={lang} />

        <Display lang={lang} size="feature" className="mt-8 max-w-[30ch]">
          {text(FINAL_INDUSTRY.title, lang)}
        </Display>

        <p
          style={{ fontFamily: displayFamily(lang) }}
          className="mt-8 text-[clamp(1.6rem,3.4vw,2.6rem)] italic text-[#8c6537]"
        >
          {text(FINAL_INDUSTRY.scale, lang)}
        </p>

        <Rule strong className="mt-7" />
        <div className="grid lg:grid-cols-[1fr_auto_1fr]">
          <div className="border-b border-[#2b221b]/12 py-7 lg:border-b-0 lg:pe-10">
            <Kicker>{text(FINAL_INDUSTRY.salons, lang)}</Kicker>
            <Body className="mt-4 max-w-[24rem]">{text(FINAL_INDUSTRY.salonsOffer, lang)}</Body>
          </div>

          <div className="flex items-center border-[#2b221b]/12 py-7 lg:border-x lg:px-10">
            <p
              style={{ fontFamily: displayFamily(lang) }}
              className="max-w-[16ch] text-[1.35rem] leading-tight text-[#2b221b] sm:text-[1.6rem]"
            >
              {text(FINAL_INDUSTRY.center, lang)}
            </p>
          </div>

          <div className="border-t border-[#2b221b]/12 py-7 lg:border-t-0 lg:ps-10">
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

const CommercialProof: React.FC<ChapterProps> = ({ lang, reducedMotion }) => {
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

          <figure className="mt-9 border-y border-[#2b221b]/14 py-8 sm:py-10">
            <div className="grid gap-10 lg:grid-cols-[0.72fr_0.28fr] lg:items-stretch lg:gap-12">
              <div>
                <div className="mb-7 flex items-end justify-between gap-5">
                  <div>
                    <p
                      dir="ltr"
                      style={{ fontFamily: displayFamily(lang) }}
                      className="text-[clamp(2.4rem,5vw,4.3rem)] leading-none tabular-nums tracking-[-0.035em] text-[#2b221b]"
                    >
                      {FINAL_SAAS.spend}
                    </p>
                    <Kicker className="mt-2.5">{text(FINAL_GTM.spendLabel, lang)}</Kicker>
                  </div>
                  <span
                    aria-hidden="true"
                    className="mb-2 h-px flex-1 bg-[linear-gradient(90deg,rgba(140,101,55,0.12),rgba(140,101,55,0.58))]"
                  />
                  <span aria-hidden="true" className="mb-0.5 text-[1.4rem] text-[#8c6537]/65">
                    {lang === "he" ? "←" : "→"}
                  </span>
                </div>

                <div dir="ltr" className="space-y-2.5">
                  {FINAL_SAAS.funnel.slice(0, 3).map((stage, index) => {
                    const widths = ["100%", "67%", "46%"];
                    const fills = ["#2b221b", "#78583e", "#b1844d"];
                    const conversions = ["", "20.4%", "31.9%"];

                    return (
                      <div key={stage.value} className="relative">
                        {index > 0 && (
                          <span className="absolute -top-[0.7rem] end-0 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#2b221b]/35">
                            {conversions[index]}
                          </span>
                        )}
                        <div
                          className="flex min-h-[4.4rem] items-center justify-between gap-5 px-4 text-[#fbf6ef] sm:px-5"
                          style={{ width: widths[index], background: fills[index] }}
                        >
                          <span
                            style={{ fontFamily: displayFamily(lang) }}
                            className="text-[clamp(1.75rem,3.6vw,3rem)] leading-none tabular-nums tracking-[-0.025em]"
                          >
                            {stage.value}
                          </span>
                          <span
                            dir={lang === "he" ? "rtl" : "ltr"}
                            className="text-end text-[9px] font-semibold uppercase tracking-[0.15em] text-[#fbf6ef]/68 sm:text-[10px]"
                          >
                            {text(stage.label, lang)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col justify-between border-t border-[#2b221b]/12 pt-6 lg:border-s lg:border-t-0 lg:ps-9 lg:pt-0">
                <Kicker>{text(FINAL_SAAS.funnel[3].label, lang)}</Kicker>
                <div className="mt-7 lg:mt-auto">
                  <p
                    dir="ltr"
                    style={{ fontFamily: displayFamily(lang) }}
                    className={`text-[clamp(3.2rem,7vw,5.8rem)] leading-[0.82] tabular-nums tracking-[-0.045em] text-[#8c6537] ${figureAlign(lang)}`}
                  >
                    {FINAL_SAAS.funnel[3].value}
                  </p>
                  <p
                    dir={lang === "he" ? "rtl" : "ltr"}
                    className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2b221b]/48"
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
                  <span aria-hidden="true" className="text-[1.1rem] text-[#b1844d]/45">
                    →
                  </span>
                )}
                <div>
                  <p
                    style={{ fontFamily: displayFamily(lang) }}
                    className={`text-[1.5rem] tabular-nums leading-none tracking-[-0.02em] sm:text-[2.1rem] ${
                      index === stages.length - 1 ? "text-[#8c6537]" : "text-[#2b221b]"
                    }`}
                  >
                    {item.value}
                  </p>
                  <p className="mt-2.5 text-[10px] font-semibold uppercase leading-4 tracking-[0.1em] text-[#2b221b]/48">
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

const ClosingPage: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter label={text(FINAL_CLOSE.title, lang)} tone="ink" rhythm="pause" chapterStart className="overflow-hidden">
    <div
      className="absolute inset-0 bg-cover bg-center opacity-[0.24]"
      style={{ backgroundImage: `url('${MEDIA.reception}')` }}
    />
    <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(9,6,4,0.94),rgba(9,6,4,0.8))]" />

    <Spread width="page" className="relative">
      <Reveal reducedMotion={reducedMotion}>
        <Kicker dark>{text(FINAL_CLOSE.kicker, lang)}</Kicker>
        <Display lang={lang} size="cover" dark className="mt-6 max-w-[18ch]">
          {text(FINAL_CLOSE.title, lang)}
        </Display>
        <Lede dark className="mt-8 max-w-[38rem]">
          {text(FINAL_CLOSE.body, lang)}
        </Lede>
        <p
          style={{ fontFamily: displayFamily(lang) }}
          className="mt-10 max-w-[24ch] text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[1.08] text-[#d9b981]"
        >
          {text(FINAL_CLOSE.ask, lang)}
        </p>

        <Rule dark className="mt-12" />
        <div className="mt-6 text-[0.95rem] font-light text-[#fbf6ef]/45">
          <p>{text(FINAL_CLOSE.signoff, lang)}</p>
          <p
            style={{ fontFamily: displayFamily(lang) }}
            className="mt-3 text-xl text-[#fbf6ef] sm:text-2xl"
          >
            {text(FINAL_CLOSE.names, lang)}
          </p>
          <Kicker dark className="mt-3 !text-[#fbf6ef]/40">
            {text(FINAL_CLOSE.role, lang)}
          </Kicker>
        </div>
      </Reveal>
    </Spread>
  </Chapter>
);

/* ---------------------------------------------------------------------- Page */

export const ExternalInvestorUpdatePage: React.FC = () => {
  const pdfExport = usePdfExportMode();
  const reducedMotion = Boolean(useReducedMotion()) || pdfExport;
  const [lang, setLang] = useState<UpdateLang>("en");
  const [progress, setProgress] = useState(0);
  const [pastCover, setPastCover] = useState(false);
  const dir = lang === "he" ? "rtl" : "ltr";
  const chapter = { lang, reducedMotion };

  useEffect(() => {
    const previousTitle = document.title;
    const previousLang = document.documentElement.lang;
    const previousDir = document.documentElement.dir;
    document.title = FINAL_META.title;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLang;
      document.documentElement.dir = previousDir;
    };
  }, [dir, lang]);

  useEffect(() => {
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    const previousContent = robots?.content;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";
    return () => {
      if (created) robots?.remove();
      else if (robots && previousContent !== undefined) robots.content = previousContent;
    };
  }, []);

  useEffect(() => {
    if (pdfExport) return;
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
      // The wordmark belongs to the cover; the running head takes over past it.
      setPastCover(window.scrollY > 420);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pdfExport]);

  /**
   * The PDF is a designed slide deck, not this page printed. It renders its own
   * fixed 16:9 canvases with no running header, progress rail or web chrome.
   */
  if (pdfExport) {
    return (
      <div
        dir={dir}
        data-pdf-export="1"
        className="investor-presentation-root"
        style={{
          background: "#f5efe7",
          color: "#2b221b",
          fontFamily:
            lang === "he"
              ? '"Assistant", "Noto Sans Hebrew", Arial, sans-serif'
              : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Frank+Ruhl+Libre:wght@400;500&display=swap');
          html, body { background: #f5efe7; margin: 0; }
          .investor-presentation-root * { animation: none !important; transition: none !important; }
          @page { size: ${PRESENTATION_PAGE.width}in ${PRESENTATION_PAGE.height}in; margin: 0; }
          @media print {
            html, body { width: auto; }
            .investor-presentation-root {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            [data-pdf-slide] { break-inside: avoid; page-break-inside: avoid; }
          }
        `}</style>
        <ExternalInvestorPresentation lang={lang} />
      </div>
    );
  }

  return (
    <div
      dir={dir}
      className="investor-update-page min-h-[100dvh] overflow-x-clip bg-[#f5efe7] text-[#2b221b]"
      style={{
        fontFamily:
          lang === "he"
            ? '"Assistant", "Noto Sans Hebrew", Arial, sans-serif'
            : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Frank+Ruhl+Libre:wght@400;500&display=swap');
        html { scroll-behavior: ${reducedMotion ? "auto" : "smooth"}; }
        body { background: #f5efe7; }
        ::selection { background: rgba(193,154,99,0.25); color: #2b221b; }
        .investor-update-page [class~="text-[8px]"],
        .investor-update-page [class~="text-[9px]"] { font-size: 11px !important; }
        @media print {
          @page { size: 1920px 1080px; margin: 0; }
          .investor-update-page { background: #f5efe7 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .investor-update-page > header { display: none !important; }
          .investor-update-page * { animation: none !important; transition: none !important; }
          .investor-chapter-start { break-before: page; }
          .investor-print-block h1,
          .investor-print-block h2,
          .investor-print-block h3 { break-after: avoid-page; }
          .investor-print-block p { orphans: 3; widows: 3; }
          .investor-print-block figure,
          .investor-print-block table,
          .investor-print-block blockquote,
          .investor-print-block dl,
          .investor-print-block ol,
          .investor-print-block ul { break-inside: avoid-page; }
        }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#2b221b]/10 bg-[#f5efe7]/95 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[75rem] items-center justify-between gap-4 px-5 sm:h-16 sm:px-8">
          <a
            href="#top"
            aria-label="Spectra"
            style={{ fontFamily: displayFamily(lang) }}
            className={`whitespace-nowrap text-base tracking-[0.16em] text-[#2b221b] transition-opacity duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c19a63] sm:text-lg ${
              pastCover ? "opacity-100" : "opacity-0"
            }`}
          >
            SPECTRA
          </a>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2b221b]/40 sm:block">
              {text(FINAL_META.date, lang)}
            </span>
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
        </div>
        <div className="h-px bg-[#2b221b]/5">
          <div className="h-full bg-[#b1844d]" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main>
        {/* 01 The Company */}
        <Cover {...chapter} />
        <OpeningArticle {...chapter} />

        {/* 02 What We Built */}
        <ColorFeature {...chapter} />

        {/* 03 What We Discovered */}
        <TurningPoint {...chapter} />
        <IndustryDataLayerVisualSection {...chapter} />

        {/* 04 What The Data Can See */}
        <SixSalonEvidenceSection {...chapter} />

        {/* 05 The Platform */}
        <DecisionSpread {...chapter} />
        <SalonOperatingPictureSection {...chapter} />
        <OwnerCommandSpread {...chapter} />
        <ClientAppImageSpread {...chapter} />
        <SalonAiBridge {...chapter} />
        <ActionMovement {...chapter} />

        {/* 06 The Bigger Opportunity */}
        <OpportunitySpread {...chapter} />
        <CoreTeamSection {...chapter} />
        <CommercialProof {...chapter} />
        <CapitalExpansionSection {...chapter} />
        <ClosingPage {...chapter} />
      </main>
    </div>
  );
};

export default ExternalInvestorUpdatePage;
