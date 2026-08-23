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
  t as text,
} from "./EditorialPrimitives";
import {
  CapitalExpansionSection,
  CoreTeamSection,
  IndustryDataLayerVisualSection,
  SalonOperatingPictureSection,
  SixSalonEvidenceSection,
} from "./ExternalInvestorIntelligenceSections";
import { ClientAppSpread } from "./ClientAppSpread";
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
    className="investor-print-block relative overflow-hidden bg-[#17110d] px-5 pb-12 pt-24 text-[#fbf6ef] sm:px-8 sm:pb-16 sm:pt-28"
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
        <p className="text-end text-[10px] font-semibold uppercase leading-tight tracking-[0.2em] text-[#fbf6ef]/45">
          {text(FINAL_META.date, lang)}
          <span aria-hidden="true" className="mx-2 text-[#d9b981]/40">
            ·
          </span>
          {text(FINAL_META.edition, lang)}
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
      <Dateline items={HERO_PROOF_METRICS} lang={lang} dark size="lg" className="mt-5" />
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

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Display lang={lang} size="chapter" dark>
              {text(FINAL_ADOPTION.title, lang)}
            </Display>
            <Body dark className="mt-3 max-w-[30rem]">
              {text(FINAL_ADOPTION.body, lang)}
            </Body>
          </div>
          <Kicker dark className="sm:pb-2">
            {text(FINAL_ADOPTION.strip, lang)}
          </Kicker>
        </div>

        <div className="mt-6">
          <InvestorHeroCustomerProof lang={lang} reducedMotion={reducedMotion} dark />
        </div>
        <Caption dark className="mt-3">
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

        <div dir="ltr" className="mt-8 grid grid-cols-[3fr_4fr_2fr_3fr] border-t border-white/12">
          {[
            { name: lang === "he" ? "התחלה" : "Application", minutes: "45m", released: false },
            { name: lang === "he" ? "זמן עיבוד" : "Processing", minutes: "60m", released: true },
            { name: lang === "he" ? "השלב הבא" : "Next step", minutes: "30m", released: false },
            { name: lang === "he" ? "סיום" : "Finish", minutes: "45m", released: false },
          ].map((stage) => (
            <div key={stage.name} className="min-w-0 border-s border-white/12 py-4 pe-3 ps-3 first:ps-0">
              <p
                className={`truncate text-[11px] font-semibold uppercase tracking-[0.12em] ${
                  stage.released ? "text-[#9fc9a8]" : "text-[#fbf6ef]/55"
                }`}
              >
                {stage.name}
              </p>
              <p className="mt-1.5 text-[11px] tabular-nums text-[#fbf6ef]/35">{stage.minutes}</p>
              <p
                className={`mt-3 text-[10px] font-light leading-4 ${
                  stage.released ? "text-[#9fc9a8]/80" : "text-[#fbf6ef]/30"
                }`}
              >
                {stage.released
                  ? lang === "he"
                    ? "קיבולת משוחררת"
                    : "Capacity released"
                  : lang === "he"
                    ? "איש מקצוע עסוק"
                    : "Stylist busy"}
              </p>
            </div>
          ))}
        </div>
        <Caption dark className="mt-4">
          {text(FINAL_BOOKING.caption, lang)}
        </Caption>
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

        <div className="mt-7 grid gap-10 lg:grid-cols-[0.62fr_0.38fr] lg:gap-16">
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
            <TermList items={FINAL_SALON_AI.flow} lang={lang} dark className="mt-5 !text-[#d9b981]" />

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
            className="mx-auto w-full max-w-[16rem] sm:max-w-[19rem] lg:max-w-[20rem]"
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

          <div
            dir="ltr"
            className="mt-8 flex flex-wrap items-baseline gap-x-8 gap-y-6 border-y border-[#2b221b]/12 py-7"
          >
            <div>
              <p
                style={{ fontFamily: displayFamily(lang) }}
                className="text-[clamp(3rem,8vw,5.5rem)] leading-none tabular-nums tracking-[-0.03em] text-[#2b221b]"
              >
                {FINAL_SAAS.spend}
              </p>
              <p
                dir={lang === "he" ? "rtl" : "ltr"}
                className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2b221b]/45"
              >
                {text(FINAL_GTM.spendLabel, lang)}
              </p>
            </div>
            <span aria-hidden="true" className="pb-10 text-[1.6rem] text-[#b1844d]/50">
              →
            </span>
            <div>
              <p
                style={{ fontFamily: displayFamily(lang) }}
                className="text-[clamp(3rem,8vw,5.5rem)] leading-none tabular-nums tracking-[-0.03em] text-[#8c6537]"
              >
                {FINAL_SAAS.customers}
              </p>
              <p
                dir={lang === "he" ? "rtl" : "ltr"}
                className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#2b221b]/45"
              >
                {text(FINAL_GTM.outcomeLabel, lang)}
              </p>
            </div>
          </div>
          <Dateline items={FINAL_SAAS.funnel} lang={lang} className="mt-6" />
          <Caption className="mt-4">{text(FINAL_GTM.caption, lang)}</Caption>

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
  }, []);

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
          @page { margin: 0; }
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
        <ClientAppSpread {...chapter} />
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
