import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  BrowserFrame,
  CalendarGrid,
  LiveClientsVertical,
} from "../NewNarrativeSalonAIFirst/sections/liveDemoDraft/BookingSchedulingIntelligenceDraftSlide";
import { SpectraOrb } from "../../components/SpectraOrb";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";
import {
  FINAL_BOOKING,
  FINAL_BUSINESS_MODEL,
  FINAL_CHAPTERS,
  FINAL_CLOSE,
  FINAL_COLOR_WEDGE,
  FINAL_COVER_EVIDENCE,
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
  splitCoverEvidence,
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
  figureAlign,
  t as text,
} from "./EditorialPrimitives";
import { CB, CB_SEMANTIC, colorBarSans } from "./colorBarTokens";
import { QuietBand, Sheet } from "./ColorBarPatterns";
import {
  CapitalExpansionSection,
  CoreTeamSection,
  SalonOperatingPictureSection,
} from "./ExternalInvestorIntelligenceSections";
import { DataEvidenceStorySection } from "./DataEvidenceStorySection";
import { ClientAppImageSpread } from "./ClientAppImageSpread";
import { ActCurtain, ActInterstitial, ActLabel } from "./ActTransitions";
import { CanonicalProofSection } from "./CanonicalProofSection";
import { CanonicalGtmSection, CanonicalModelSection } from "./CanonicalCommercialSections";
import { CanonicalDataSection } from "./CanonicalDataSection";
import { CanonicalPlatformSection } from "./CanonicalPlatformSection";
import { CanonicalSalonAiSection } from "./CanonicalSalonAiSection";
import { CanonicalTeamSection } from "./CanonicalTeamSection";
import { CanonicalWedgeSection } from "./CanonicalWedgeSection";
import {
  CanonicalLandscapeSection,
  CanonicalMarketSection,
  CanonicalOptionalitySection,
} from "./CanonicalNarrativeSections";
import { ExternalInvestorWebDeck } from "./ExternalInvestorWebDeck";
import { WEB_DECK_FRAME_WIDTH } from "./WebDeckPrimitives";
import { OwnerCommandSpread } from "./OwnerCommandSpread";

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
  colorRoom: "/investor-vision/hero/salon-color-room.jpg",
} as const;

const FOUNDER_IMAGE = "/team/maor-elad-spectra.jpg";
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

type ChapterProps = { lang: UpdateLang; reducedMotion: boolean };

const LanguageToggle: React.FC<{
  lang: UpdateLang;
  setLang: (lang: UpdateLang) => void;
}> = ({ lang, setLang }) => (
  <div
    dir="ltr"
    className="inline-flex items-center"
    role="group"
    aria-label={lang === "he" ? "החלפת שפה" : "Change language"}
  >
    {(["en", "he"] as UpdateLang[]).map((option, index) => (
      <React.Fragment key={option}>
        {index > 0 && (
          <span aria-hidden="true" className="text-[10px]" style={{ color: CB.faint }}>
            /
          </span>
        )}
        {/* Reads as plain type; the 44px hit area comes from the padding. */}
        <button
          type="button"
          aria-pressed={lang === option}
          onClick={() => setLang(option)}
          className="min-h-11 rounded-[6px] ps-2 pe-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition last:pe-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A37D38]"
          style={{ color: lang === option ? CB.ink : CB.faint }}
        >
          {option === "en" ? "EN" : "עברית"}
        </button>
      </React.Fragment>
    ))}
  </div>
);

/* ── Unified Investor Header ──────────────────────────────────────────────── */

/**
 * The single <header> on this page. Two visual states driven by `compact`:
 *
 * compact=false (top of page)
 *   One row with the brand at left and metadata controls at right
 *
 * compact=true (scrolled past cover)
 *   Metadata controls fade out
 *   Scroll progress bar appears directly beneath the header
 *
 * `data-testid="salon-ai-lockup"` marks the one canonical lockup so Playwright
 * can assert zero duplicates across both scroll states.
 */
const InvestorHeader: React.FC<{
  lang: UpdateLang;
  setLang: (lang: UpdateLang) => void;
  compact: boolean;
  progress: number;
  reducedMotion: boolean;
}> = ({ lang, setLang, compact, progress, reducedMotion }) => {
  const dur = reducedMotion ? "0ms" : "300ms";
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)]"
      style={{ backgroundColor: CB.bg }}
    >
      <div className="border-b" style={{ borderColor: CB.line }}>
        <div className="investor-header-inner mx-auto">
          <div
            dir="ltr"
            className="flex items-center justify-between gap-4 transition-[height]"
            style={{ height: compact ? "3rem" : "3.5rem", transitionDuration: dur }}
          >
            <div
              data-testid="salon-ai-lockup"
              className="flex shrink-0 items-center whitespace-nowrap"
            >
              <div className="flex items-center gap-[7px] sm:gap-2">
                <SpectraOrb
                  className="h-[27px] w-[27px] shrink-0 sm:h-[29px] sm:w-[29px]"
                  reducedMotion={reducedMotion}
                />
                <span
                  className="text-[1.18rem] font-semibold leading-none tracking-[-0.04em] sm:text-[1.28rem]"
                  style={{ color: CB.ink }}
                >
                  SALON AI
                </span>
              </div>
              <span
                className="ms-1.5 pt-px text-[0.58rem] font-normal lowercase tracking-[0.08em] sm:ms-2 sm:text-[0.62rem]"
                style={{ color: CB.faint }}
              >
                by spectra ci
              </span>
            </div>

            <div
              className="flex items-center gap-2 transition-opacity sm:gap-4"
              style={{
                opacity: compact ? 0 : 1,
                transitionDuration: dur,
                pointerEvents: compact ? "none" : "auto",
              }}
              aria-hidden={compact || undefined}
            >
              <p
                className="hidden whitespace-nowrap text-end text-[9px] font-semibold uppercase tracking-[0.14em] sm:block"
                style={{ color: CB.copperDeep }}
              >
                {text(FINAL_META.date, lang)}
                <span aria-hidden="true" className="mx-2 text-[#7A7368]">·</span>
                {text(FINAL_META.edition, lang)}
              </p>
              <span aria-hidden="true" className="hidden h-3 w-px bg-[#D8D2C8] sm:block" />
              <LanguageToggle lang={lang} setLang={setLang} />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll progress bar – spans full viewport width below compact header */}
      <div
        className="h-[2px] w-full"
        aria-hidden="true"
        style={{
          opacity: compact ? 1 : 0,
          transition: reducedMotion ? "none" : `opacity ${dur} ease`,
        }}
      >
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            backgroundColor: CB.copper,
            transition: reducedMotion ? "none" : "width 75ms linear",
          }}
        />
      </div>
    </header>
  );
};

/* ---------------------------------------------------------------- Chapter 01 */

const ColorBarCoverConcept: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <section
    id="top"
    aria-labelledby="cover-heading"
    style={{ paddingLeft: "var(--iu-gutter, 1.5rem)", paddingRight: "var(--iu-gutter, 1.5rem)" }}
    className="investor-print-block relative overflow-hidden bg-[#FBFAF7] pb-16 pt-[4.75rem] text-[#1C1914] sm:pb-20 sm:pt-[5rem] lg:flex lg:min-h-[min(100dvh,67.5rem)] lg:flex-col lg:pb-[72px] lg:pt-[5rem]"
  >
    <motion.div
      className="mx-auto flex w-full max-w-[75rem] flex-col lg:flex-1"
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.75, ease }}
    >
      <div className="grid flex-1 gap-10 py-10 xl:grid-cols-[0.56fr_0.44fr] xl:items-center xl:gap-10">
        <div>
          <h1
            id="cover-heading"
            className="max-w-[18ch] text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.055em] sm:text-[3rem] md:text-[3.45rem] lg:text-[3.65rem] xl:text-[3.9rem]"
            style={{ color: CB.ink }}
          >
            {lang === "he" ? (
              <>
                <span className="block">אם מכונית יכולה <span style={{ color: CB.copperDeep }}>לנהוג בעצמה</span>,</span>
                <span className="block">למה שסלון לא יוכל</span>
                <span className="block"><span style={{ color: CB.copperDeep }}>לנהל את עצמו</span>?</span>
              </>
            ) : (
              <>
                <span className="block">If a car can <span style={{ color: CB.copperDeep }}>drive itself</span>,</span>
                <span className="block">why can’t a salon</span>
                <span className="block"><span style={{ color: CB.copperDeep }}>run itself</span>?</span>
              </>
            )}
          </h1>
        </div>

        <div className="relative isolate">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-8 -z-10 rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, rgba(163,125,56,0.2) 0%, rgba(163,125,56,0.07) 42%, transparent 72%)",
            }}
            animate={reducedMotion ? undefined : { opacity: [0.55, 0.85, 0.55], scale: [0.98, 1.03, 0.98] }}
            transition={reducedMotion ? undefined : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <Sheet className="relative z-10 border-[rgba(163,125,56,0.14)] shadow-[0_24px_70px_rgba(81,56,28,0.14)]">
            <figure>
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-[15px]"
                style={{ backgroundColor: CB.well }}
              >
                <img
                  src={FOUNDER_IMAGE}
                  alt={text(FINAL_HERO.founderAlt, lang)}
                  className="h-full w-full object-cover object-center"
                  loading="eager"
                  decoding="async"
                  // React 18 does not map the camelCase prop; the cover image is the LCP.
                  {...{ fetchpriority: "high" }}
                  width={840}
                  height={630}
                />
              </div>
              <figcaption className="flex items-center justify-between gap-4 px-2 pb-1 pt-3">
                <span className="text-[11px] font-semibold" style={{ color: CB.ink }}>
                  {text(FINAL_HERO.coverLine, lang)}
                </span>
              </figcaption>
            </figure>
          </Sheet>
        </div>
      </div>
    </motion.div>
  </section>
);

const FoundationEvidenceSection: React.FC<ChapterProps> = ({ lang, reducedMotion }) => {
  return (
    <section
      id="foundation"
      aria-label={text(FINAL_COVER_EVIDENCE.close, lang)}
      className="investor-print-block relative flex min-h-screen items-center overflow-hidden bg-[#FBFAF7] px-[6.25%] py-[5.5%] text-[#1C1914]"
    >
      <motion.div
        className="mx-auto flex w-full max-w-[105rem] flex-col justify-between gap-10 lg:gap-12"
        initial={reducedMotion ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.18 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.8, ease }}
      >
        <div className="grid gap-8 lg:grid-cols-[0.68fr_0.32fr] lg:items-end lg:gap-16">
          <p
            className="max-w-[38ch] text-[1.8rem] font-normal leading-[1.28] tracking-[-0.028em] sm:text-[2.15rem] lg:text-[2.55rem]"
            style={{ color: CB.ink }}
          >
            {splitCoverEvidence(text(FINAL_COVER_EVIDENCE.opening, lang)).map((part, partIndex) =>
              FINAL_COVER_EVIDENCE.highlights.some((value) => value === part) ? (
                <span key={`${part}-${partIndex}`} dir="ltr" style={{ color: CB.copperDeep }}>
                  {part}
                </span>
              ) : (
                <React.Fragment key={`copy-${partIndex}`}>{part}</React.Fragment>
              ),
            )}
          </p>

          <figure className="hidden overflow-hidden border-s ps-5 sm:block" style={{ borderColor: CB.lineStrong }}>
            <img
              src="/investor-vision/hero/salon-color-room.jpg"
              alt=""
              aria-hidden="true"
              className="h-36 w-full object-cover grayscale-[25%] lg:h-40"
              style={{ objectPosition: "70% 56%" }}
            />
          </figure>
        </div>

        <dl className="grid grid-cols-2 border-y sm:grid-cols-4" style={{ borderColor: CB.lineStrong }}>
          {FINAL_COVER_EVIDENCE.kpis.map((metric, index) => (
            <div
              key={metric.value}
              className={`min-w-0 px-4 py-7 sm:px-6 lg:px-8 lg:py-8 ${
                index % 2 ? "border-s" : ""
              } ${index >= 2 ? "border-t sm:border-t-0" : ""} ${
                index > 0 ? "sm:border-s" : "sm:border-s-0"
              }`}
              style={{ borderColor: CB.line }}
            >
              <dd
                dir="ltr"
                className="text-[clamp(2.7rem,5.5vw,5.2rem)] font-medium leading-none tracking-[-0.055em]"
                style={{ color: CB.copperDeep }}
              >
                {metric.value}
              </dd>
              <dt
                className="mt-4 max-w-[17rem] text-[0.78rem] font-normal uppercase leading-[1.45] tracking-[0.11em] sm:text-[0.84rem]"
                style={{ color: CB.muted }}
              >
                {text(metric.label, lang)}
              </dt>
            </div>
          ))}
        </dl>

        <motion.p
          className="max-w-[84rem] text-[2.2rem] font-medium leading-[1.08] tracking-[-0.048em] sm:text-[3rem] lg:text-[4rem]"
          initial={reducedMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.8, delay: reducedMotion ? 0 : 0.2, ease }}
        >
          {text(FINAL_COVER_EVIDENCE.close, lang)
            .split(/(Salon AI)/)
            .map((part, index) =>
              part === "Salon AI" ? (
                <span key={`${part}-${index}`} dir="ltr" style={{ color: CB.copperDeep }}>
                  {part}
                </span>
              ) : (
                <React.Fragment key={`close-${index}`}>{part}</React.Fragment>
              ),
            )}
        </motion.p>
      </motion.div>
    </section>
  );
};

const OpeningArticle: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter id="origin" label={text(FINAL_LEDE.title, lang)} tone="paper" rhythm="feature" chapterStart>
    <Spread>
      <Reveal reducedMotion={reducedMotion}>
        <ChapterMark number="01" title={{ en: "Thesis", he: "Thesis" }} lang={lang} />

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
  <Chapter label={text(FINAL_COLOR_WEDGE.title, lang)} tone="paper" rhythm="feature" chapterStart>
    <Spread>
      <Reveal reducedMotion={reducedMotion}>
        <ChapterMark number="03" title={{ en: "Wedge", he: "Wedge" }} lang={lang} />

        <div className="mt-9 grid gap-10 lg:grid-cols-[0.44fr_0.56fr] lg:items-center lg:gap-14">
          <div>
            <Display lang={lang} size="feature" className="max-w-[15ch]">
              {text(FINAL_COLOR_WEDGE.title, lang)}
            </Display>
            <p
              style={{ fontFamily: colorBarSans(lang), color: CB.copperDeep }}
              className="mt-6 text-[1.15rem] font-semibold tracking-[-0.02em] sm:text-[1.35rem]"
            >
              {text(FINAL_COLOR_WEDGE.cadence, lang)}
            </p>
            <Body className="mt-5 max-w-[32rem]">{text(FINAL_COLOR_WEDGE.wedge, lang)}</Body>
          </div>

          {/* The system itself, uncropped on paper. */}
          <Figure caption={text(FINAL_COLOR_WEDGE.caption, lang)}>
            <Sheet>
              <div
                className="flex items-center justify-center overflow-hidden rounded-[15px] px-4 py-5"
                style={{ backgroundColor: CB.well }}
              >
                <img
                  src={MEDIA.colorBarComposition}
                  alt={text(FINAL_HERO.visualAlt, lang)}
                  className="mx-auto max-h-[20rem] w-full object-contain"
                  loading="lazy"
                />
              </div>
            </Sheet>
          </Figure>
        </div>

        <Rule className="mt-10" />
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
          <TermList items={FINAL_COLOR_WEDGE.terms} lang={lang} />
          <Body className="sm:text-end">{text(FINAL_COLOR_WEDGE.close, lang)}</Body>
        </div>

        {/* The room the system lives in, as photography rather than a scrim. */}
        <Sheet className="mt-10">
          <div
            className="relative w-full overflow-hidden rounded-[15px]"
            style={{ aspectRatio: "16 / 6", backgroundColor: CB.well }}
          >
            <img
              src={MEDIA.colorBar}
              alt={
                lang === "he"
                  ? "עמדת הצבע בסלון בזמן עבודה"
                  : "The salon color bar during service"
              }
              className="h-full w-full object-cover object-center"
              loading="lazy"
            />
          </div>
        </Sheet>

        <PullQuote lang={lang} size="feature" className="mt-12 max-w-[46rem]">
          {text(FINAL_COLOR_WEDGE.pull, lang)}
        </PullQuote>

      </Reveal>
    </Spread>
  </Chapter>
);

/* ---------------------------------------------------------------- Chapter 03 */

const TurningPoint: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter label={text(FINAL_REVELATION.title, lang)} tone="warm" rhythm="pause">
    <Spread width="page">
      <Reveal reducedMotion={reducedMotion}>
        <div className="grid gap-10 lg:grid-cols-[0.58fr_0.42fr] lg:items-center lg:gap-14">
          <div>
            <Display lang={lang} size="cover" className="max-w-[24ch]">
              {text(FINAL_REVELATION.title, lang)}
            </Display>
            <Lede className="mt-8 max-w-[38rem]">{text(FINAL_REVELATION.body, lang)}</Lede>
            <Rule className="mt-9" />
            <TermList items={FINAL_REVELATION.signals} lang={lang} className="mt-5" />
          </div>

          <Sheet>
            <div
              className="relative w-full overflow-hidden rounded-[15px]"
              style={{ aspectRatio: "4 / 5", backgroundColor: CB.well }}
            >
              <img
                src={MEDIA.reception}
                alt={lang === "he" ? "דלפק הקבלה בסלון" : "The salon reception desk"}
                className="h-full w-full object-cover object-center"
                loading="lazy"
              />
            </div>
          </Sheet>
        </div>
      </Reveal>
    </Spread>
  </Chapter>
);

/* ---------------------------------------------------------------- Chapter 05 */

const DecisionSpread: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter label={text(FINAL_DECISION.close, lang)} tone="paper" rhythm="feature" chapterStart>
    <Spread className="relative">
      <Reveal reducedMotion={reducedMotion}>
        <ChapterMark number="06" title={{ en: "Platform", he: "Platform" }} lang={lang} />

        <div className="mt-9 grid gap-x-14 gap-y-5 lg:grid-cols-[0.52fr_0.48fr] lg:items-end">
          <Display lang={lang} size="feature" className="max-w-[24ch]">
            {text(FINAL_PROBLEM.title, lang)}
          </Display>
          <div className="max-w-[32rem]">
            <Lede>{text(FINAL_PROBLEM.intro, lang)}</Lede>
            <Body className="mt-4">{text(FINAL_PROBLEM.systems, lang)}</Body>
          </div>
        </div>

        <Rule className="mt-10" />

        <div className="mt-9 max-w-[46rem]">
          <Display lang={lang} size="feature">
            {text(FINAL_DECISION.title, lang)}
          </Display>
          <Body className="mt-5 max-w-[34rem]">{text(FINAL_DECISION.body, lang)}</Body>
        </div>

        <span aria-hidden="true" className="mt-11 block h-px w-12" style={{ backgroundColor: CB.copper }} />
        <p
          style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
          className="mt-6 max-w-[28ch] text-[clamp(2rem,5vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.045em]"
        >
          {text(FINAL_DECISION.close, lang)}
        </p>

        <Rule className="mt-16" />
        <div className="mt-12 grid gap-x-14 gap-y-6 lg:grid-cols-[0.4fr_0.6fr] lg:items-baseline">
          <div>
            <Kicker>{text(FINAL_PLATFORM.intro, lang)}</Kicker>
            <Movement number="01" title={FINAL_PLATFORM.movements.capacity} lang={lang} className="mt-4" />
          </div>
          <div>
            <Display lang={lang} size="feature" className="max-w-[22ch]">
              {text(FINAL_BOOKING.title, lang)}
            </Display>
            <Body className="mt-5 max-w-[32rem]">{text(FINAL_BOOKING.support, lang)}</Body>
          </div>
        </div>

        {/* The live calendar, presented as a product capture on paper. */}
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.7, ease, delay: reducedMotion ? 0 : 0.1 }}
          className="mt-9"
        >
          <Sheet>
            <div
              className="relative hidden overflow-hidden rounded-[15px] xl:block"
              style={{ height: "clamp(380px, 44vh, 470px)", backgroundColor: CB.well }}
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
            </div>

            <div
              className="relative h-[280px] overflow-hidden rounded-[15px] sm:h-[380px] md:h-[430px] lg:h-[490px] xl:hidden"
              style={{ backgroundColor: CB.well }}
            >
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
          </Sheet>
        </motion.div>

        {/* Where the hour goes, and the one column that comes back. */}
        <div
          dir="ltr"
          className="mt-10 grid grid-cols-2 border-y sm:grid-cols-[3fr_4fr_2fr_3fr]"
          style={{ borderColor: CB.line }}
        >
          {[
            { name: lang === "he" ? "התחלה" : "Application", minutes: "45m", released: false },
            { name: lang === "he" ? "זמן עיבוד" : "Processing", minutes: "60m", released: true },
            { name: lang === "he" ? "השלב הבא" : "Next step", minutes: "30m", released: false },
            { name: lang === "he" ? "סיום" : "Finish", minutes: "45m", released: false },
          ].map((stage, index) => (
            <div
              key={stage.name}
              dir={lang === "he" ? "rtl" : "ltr"}
              className={`relative min-w-0 px-3 py-4 ${index % 2 === 1 ? "border-s" : ""} ${
                index >= 2 ? "border-t sm:border-t-0" : ""
              } sm:border-s sm:first:border-s-0`}
              style={{
                borderColor: CB.line,
                backgroundColor: stage.released ? CB_SEMANTIC.successSoft : "transparent",
              }}
            >
              {stage.released && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ backgroundColor: CB_SEMANTIC.success }}
                />
              )}
              <p
                className="truncate text-[11px] font-semibold uppercase tracking-[0.12em]"
                style={{ color: stage.released ? CB_SEMANTIC.success : CB.muted }}
              >
                {stage.name}
              </p>
              <p
                className={`mt-1.5 tabular-nums ${
                  stage.released ? "text-[1.15rem] font-semibold" : "text-[11px]"
                }`}
                style={{ color: stage.released ? CB_SEMANTIC.success : CB.muted }}
              >
                {stage.minutes}
              </p>
              <p
                dir={lang === "he" ? "rtl" : "ltr"}
                className={`mt-3 leading-4 ${stage.released ? "text-[12px] font-semibold" : "text-[10px]"}`}
                style={{ color: stage.released ? CB_SEMANTIC.success : CB.muted }}
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
          className="grid gap-4 border-b px-5 py-5 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:px-6"
          style={{ borderColor: CB.line, backgroundColor: CB_SEMANTIC.successSoft }}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border text-[1.25rem]"
            style={{ borderColor: `${CB_SEMANTIC.success}59`, color: CB_SEMANTIC.success }}
          >
            +
          </div>
          <div>
            <p
              style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
              className="text-[1.2rem] font-semibold leading-tight tracking-[-0.03em] sm:text-[1.5rem]"
            >
              {lang === "he"
                ? "בזמן העיבוד, הספר יכול לקבל לקוחה נוספת."
                : "During processing, the stylist can take another client."}
            </p>
            <p
              className="mt-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em]"
              style={{ color: CB_SEMANTIC.success }}
            >
              {lang === "he" ? "60 דקות של קיבולת אמיתית שהתפנתה" : "60 minutes of real capacity released"}
            </p>
          </div>
          <span
            aria-hidden="true"
            className="hidden text-[1.7rem] sm:block"
            style={{ color: `${CB_SEMANTIC.success}8c` }}
          >
            {lang === "he" ? "←" : "→"}
          </span>
        </div>
        <Caption className="mt-4">{text(FINAL_BOOKING.caption, lang)}</Caption>
      </Reveal>
    </Spread>
  </Chapter>
);

/**
 * An editorial pause, not a section. It carries the reader from the operating
 * picture into the Salon AI chapter with a single held line.
 */
const SalonAiBridge: React.FC<ChapterProps> = ({ lang }) => (
  <QuietBand lang={lang} label={text(FINAL_SALON_AI.bridge, lang)} size="chapter">
    {text(FINAL_SALON_AI.bridge, lang)}
  </QuietBand>
);

const ActionMovement: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
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

            {/* Signal on the left, the action it triggers on the right. */}
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
                  <dd
                    className="flex items-baseline gap-3 text-[0.95rem] font-medium"
                    style={{ color: CB.ink }}
                  >
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
              </Sheet>
            </Figure>

            {/* The stockroom the agents are reasoning about. */}
            <Sheet className="mt-5">
              <div
                className="relative w-full overflow-hidden rounded-[15px]"
                style={{ aspectRatio: "16 / 9", backgroundColor: CB.well }}
              >
                <img
                  src={MEDIA.shelves}
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
                  <span
                    aria-hidden="true"
                    className="mb-2 h-px flex-1"
                    style={{ backgroundColor: CB.line }}
                  />
                  <span aria-hidden="true" className="mb-0.5 text-[1.4rem]" style={{ color: CB.copper }}>
                    {lang === "he" ? "←" : "→"}
                  </span>
                </div>

                {/* Proportional bars on paper: the shape is the argument. */}
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

/** The close mirrors the cover: same lockup, same cream, the ask set largest. */
const ClosingPage: React.FC<ChapterProps> = ({ lang, reducedMotion }) => (
  <Chapter label={text(FINAL_CLOSE.title, lang)} tone="warm" rhythm="pause" chapterStart>
    <Spread width="page">
      <Reveal reducedMotion={reducedMotion}>
        <div dir="ltr" className="flex items-center gap-3 sm:gap-3.5">
          <SpectraOrb className="h-[26px] w-[26px] sm:h-[30px] sm:w-[30px]" reducedMotion={reducedMotion} />
          <p
            style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
            className="whitespace-nowrap text-[1.55rem] font-semibold leading-none tracking-[-0.055em] sm:text-[1.8rem]"
          >
            Salon AI
          </p>
        </div>

        <Kicker className="mt-10">{text(FINAL_CLOSE.kicker, lang)}</Kicker>
        <Display lang={lang} size="cover" className="mt-6 max-w-[18ch]">
          {text(FINAL_CLOSE.title, lang)}
        </Display>
        <Lede className="mt-8 max-w-[38rem]">{text(FINAL_CLOSE.body, lang)}</Lede>

        <span aria-hidden="true" className="mt-11 block h-px w-12" style={{ backgroundColor: CB.copper }} />
        <p
          style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
          className="mt-6 max-w-[24ch] text-[clamp(1.9rem,4.4vw,3.1rem)] font-semibold leading-[1.08] tracking-[-0.045em]"
        >
          {text(FINAL_CLOSE.ask, lang)}
        </p>

        <Rule className="mt-12" />
        <div className="mt-6 text-[0.95rem]" style={{ color: CB.muted }}>
          <p>{text(FINAL_CLOSE.signoff, lang)}</p>
          <p
            style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
            className="mt-3 text-xl font-semibold tracking-[-0.03em] sm:text-2xl"
          >
            {text(FINAL_CLOSE.names, lang)}
          </p>
          <Kicker className="mt-3">{text(FINAL_CLOSE.role, lang)}</Kicker>
        </div>
      </Reveal>
    </Spread>
  </Chapter>
);

/* ---------------------------------------------------------------------- Page */

export const ExternalInvestorUpdatePage: React.FC = () => {
  const pdfExport = usePdfExportMode();
  const reducedMotion = Boolean(useReducedMotion()) || pdfExport;
  const [lang, setLang] = useState<UpdateLang>(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("lang") === "he"
      ? "he"
      : "en",
  );
  const [progress, setProgress] = useState(0);
  const [pastCover, setPastCover] = useState(false);
  const desktopDeck = true;
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
          @page { size: 20in 11.25in; margin: 0; }
          @media print {
            html, body { width: auto; }
            .investor-presentation-root {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            [data-pdf-slide] { break-inside: avoid; page-break-inside: avoid; }
          }
        `}</style>
        <ExternalInvestorWebDeck lang={lang} reducedMotion />
      </div>
    );
  }

  return (
    <div
      dir={dir}
      className="investor-update-page min-h-[100dvh] overflow-x-clip bg-[#FBFAF7] text-[#1C1914]"
      style={{ fontFamily: colorBarSans(lang) }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        html {
          scroll-behavior: ${reducedMotion ? "auto" : "smooth"};
          /* Anchors have to clear the compact running header. */
          scroll-padding-top: 4.5rem;
        }
        body { background: #FBFAF7; }
        /* ── Horizontal safe gutters ──────────────────────────────────────────
           --iu-gutter is the single source of truth for horizontal spacing.
           It grows with viewport width and never drops below a minimum that
           keeps text and media off the raw viewport edge.

           For scrolling content: body (critical.css) already applies
           env(safe-area-inset-left/right) as body padding, so we do NOT
           repeat it here — that would double-count the notch inset.
           The fixed header is outside the body padding context. On mobile it
           uses --iu-gutter; on the 16:9 web deck it matches the slide frame
           so the lockup and edition sit on the white card edges.            */
        .investor-update-page {
          --iu-gutter: 1.25rem; /* 20 px — minimum at 320 px */
        }
        @media (min-width: 390px) {
          .investor-update-page { --iu-gutter: 1.5rem; } /* 24 px */
        }
        @media (min-width: 640px) {
          .investor-update-page { --iu-gutter: 2rem; }   /* 32 px */
        }
        .investor-header-inner {
          width: 100%;
          padding-inline: max(env(safe-area-inset-left, 0px), var(--iu-gutter, 1.5rem));
        }
        @media (min-width: 1024px) {
          .investor-header-inner {
            width: var(--investor-slide-width, ${WEB_DECK_FRAME_WIDTH});
            padding-inline: 0;
          }
        }
        /* Sections inherit --iu-gutter; each section applies it as
           padding-left / padding-right via its own style prop (see Chapter,
           QuietBand, cover section, CanonicalThesisSection).                */
        ::selection { background: rgba(163,125,56,0.18); color: #1C1914; }
        .investor-update-page [class~="text-[8px]"],
        .investor-update-page [class~="text-[9px]"] { font-size: 10px !important; }
        @media print {
          @page { size: 1920px 1080px; margin: 0; }
          .investor-update-page { background: #FBFAF7 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
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

      {/* Single unified header — InvestorHeader owns the only <header> in the DOM */}
      <InvestorHeader
        lang={lang}
        setLang={setLang}
        compact={pastCover}
        progress={progress}
        reducedMotion={reducedMotion}
      />

      {desktopDeck ? (
        <ExternalInvestorWebDeck lang={lang} reducedMotion={reducedMotion} />
      ) : (
      <main>
        {/* 01 Thesis */}
        <ColorBarCoverConcept {...chapter} />
        <FoundationEvidenceSection {...chapter} />

        {/* 02 Market */}
        <CanonicalMarketSection {...chapter} />

        {/* 03 Wedge */}
        <CanonicalWedgeSection {...chapter} />

        {/* 04 Proof */}
        <ActLabel act={2} {...chapter} id="act-proof" />
        <CanonicalProofSection {...chapter} />

        {/* 05 GTM */}
        <CanonicalGtmSection {...chapter} />

        {/* 06 Platform */}
        <ActLabel act={3} {...chapter} id="act-platform" />
        <CanonicalPlatformSection {...chapter} />
        <SalonOperatingPictureSection {...chapter} />
        <OwnerCommandSpread {...chapter} />
        <ClientAppImageSpread {...chapter} />

        {/* 07 Salon AI */}
        <ActCurtain act={3} {...chapter} id="act-salon-ai" />
        <CanonicalSalonAiSection {...chapter} />

        {/* 08 Data */}
        <ActInterstitial act={4} {...chapter} id="act-business" />
        <CanonicalDataSection {...chapter} />
        <DataEvidenceStorySection {...chapter} />

        {/* 09 Model */}
        <CanonicalModelSection {...chapter} />

        {/* 10 Landscape */}
        <CanonicalLandscapeSection {...chapter} />

        {/* 11 Team */}
        <CanonicalTeamSection {...chapter} />

        {/* 12 Raise */}
        <CapitalExpansionSection {...chapter} />

        {/* 13 Optionality */}
        <CanonicalOptionalitySection {...chapter} />
      </main>
      )}
    </div>
  );
};

export default ExternalInvestorUpdatePage;
