import React from "react";
import { PROOF as GLOBAL_USAGE_PROOF } from "../SpectraProductVision/dataMoat";
import { ChartReveal, chartEase } from "./AnimatedFigures";
import { FINAL_RAISE, type UpdateLang } from "./finalCopy";
import { NETWORK_ACCUMULATION_SERIES } from "./intelligenceData";
import {
  Body,
  Caption,
  Chapter,
  Dateline,
  Display,
  Figure,
  Kicker,
  Lede,
  PullQuote,
  Reveal,
  Rule,
  Spread,
  TermList,
  displayFamily,
  figureAlign,
  loc,
  t as text,
} from "./EditorialPrimitives";

type SectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

/* -------------------------------------------- Chapter 03 evidence: data layer */

const DATA_COPY = {
  headline: loc("What was actually done.", "מה נעשה בפועל."),
  lede: loc(
    "Industry data usually starts when a product is shipped, sold or booked. Spectra starts one level deeper, inside the service itself.",
    "דאטה בתעשייה מתחיל בדרך כלל כשמוצר נשלח, נמכר או נקבע ביומן. Spectra מתחילה שכבה אחת עמוק יותר, בתוך השירות עצמו.",
  ),
  eventsLabel: loc("Real service events", "אירועי שירות אמיתיים"),
  chartCaption: loc(
    "Cumulative measured service events across the Spectra network, January 2023 to June 2026.",
    "אירועי שירות מצטברים שנמדדו ברשת ספקטרה, מינואר 2023 עד יוני 2026.",
  ),
  pull: loc("Software can be rebuilt. History has to be earned.", "אפשר לבנות תוכנה מחדש. היסטוריה צריך להרוויח."),
  compoundClose: loc("The asset compounds.", "הנכס מצטבר."),
} as const;

const VANTAGE_ROWS = [
  { source: loc("Manufacturer / distributor", "יצרן / מפיץ"), sees: loc("What shipped", "מה נשלח"), spectra: false },
  { source: loc("POS", "קופה"), sees: loc("What sold", "מה נמכר"), spectra: false },
  { source: loc("Booking", "יומן"), sees: loc("What was scheduled", "מה נקבע"), spectra: false },
  { source: loc("Spectra", "Spectra"), sees: loc("What was actually done", "מה נעשה בפועל"), spectra: true },
] as const;

const COMPOUNDING = [
  loc("More salons", "עוד סלונים"),
  loc("More services", "עוד שירותים"),
  loc("More context", "עוד הקשר"),
  loc("More time", "עוד זמן"),
] as const;

export const IndustryDataLayerVisualSection: React.FC<SectionProps> = ({ lang, reducedMotion }) => {
  const cumulative = NETWORK_ACCUMULATION_SERIES.reduce<number[]>((totals, item) => {
    totals.push((totals[totals.length - 1] ?? 0) + item[1]);
    return totals;
  }, []);
  const peak = cumulative[cumulative.length - 1] ?? GLOBAL_USAGE_PROOF.services;
  const points = cumulative
    .map((value, index) => {
      const x = (index / (NETWORK_ACCUMULATION_SERIES.length - 1)) * 100;
      const y = 98 - (value / peak) * 92;
      return `${x},${y}`;
    })
    .join(" ");

  // Grams live on the cover dateline; this chapter adds history, visits and breadth.
  const scale = [
    { value: String(GLOBAL_USAGE_PROOF.monthsOfHistory), label: loc("Months of history", "חודשי היסטוריה") },
    {
      value: `${Math.floor(GLOBAL_USAGE_PROOF.visits / 1000)}K+`,
      label: loc("Client visits", "ביקורי לקוחות"),
    },
    { value: String(GLOBAL_USAGE_PROOF.brands), label: loc("Brands observed", "מותגים שנצפו") },
  ];

  return (
    <Chapter label={text(DATA_COPY.headline, lang)} tone="paper" rhythm="feature">
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <div className="grid gap-x-14 gap-y-8 lg:grid-cols-[0.46fr_0.54fr]">
            <div>
              <Display lang={lang} size="feature" className="max-w-[13ch]">
                {text(DATA_COPY.headline, lang)}
              </Display>
              <Lede className="mt-7 max-w-[30rem]">{text(DATA_COPY.lede, lang)}</Lede>
            </div>

            <dl className="lg:pt-3">
              <Rule strong />
              {VANTAGE_ROWS.map((row) => (
                <div
                  key={row.source.en}
                  className={`flex items-baseline justify-between gap-6 border-b py-3.5 ${
                    row.spectra ? "border-[#2b221b]/25" : "border-[#2b221b]/10"
                  }`}
                >
                  <dt
                    className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      row.spectra ? "text-[#8c6537]" : "text-[#2b221b]/40"
                    }`}
                  >
                    {text(row.source, lang)}
                  </dt>
                  <dd
                    style={row.spectra ? { fontFamily: displayFamily(lang) } : undefined}
                    className={
                      row.spectra
                        ? "text-end text-[1.25rem] leading-tight text-[#2b221b] sm:text-[1.5rem]"
                        : "text-end text-[0.95rem] font-light text-[#2b221b]/60"
                    }
                  >
                    {text(row.sees, lang)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-12 grid gap-x-14 gap-y-8 lg:grid-cols-[0.36fr_0.64fr] lg:items-end">
            <div>
              <p
                dir="ltr"
                style={{ fontFamily: displayFamily(lang) }}
                className={`text-[clamp(3.4rem,9vw,6.5rem)] leading-[0.9] tabular-nums tracking-[-0.03em] text-[#2b221b] ${figureAlign(lang)}`}
              >
                {`${Math.floor(GLOBAL_USAGE_PROOF.services / 1000)}K+`}
              </p>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8c6537]">
                {text(DATA_COPY.eventsLabel, lang)}
              </p>
            </div>

            <Figure caption={text(DATA_COPY.chartCaption, lang)}>
              <ChartReveal
                reducedMotion={reducedMotion}
                className="relative h-36 border-b border-[#2b221b]/25 sm:h-44"
              >
                {(active) => (
                  <div
                    dir="ltr"
                    role="img"
                    aria-label={
                      lang === "he"
                        ? "אירועי שירות מצטברים מינואר 2023 עד יוני 2026"
                        : "Cumulative measured service events from January 2023 to June 2026"
                    }
                    className="absolute inset-0"
                    style={{
                      clipPath: active ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
                      transition: reducedMotion ? undefined : `clip-path 2.4s ${chartEase}`,
                    }}
                  >
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <polygon points={`${points} 100,100 0,100`} fill="#b1844d" fillOpacity="0.08" />
                      <polyline
                        points={points}
                        fill="none"
                        stroke="#b1844d"
                        strokeWidth="1.25"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                )}
              </ChartReveal>
              <div dir="ltr" className="relative mt-2 h-4 text-[11px] tabular-nums text-[#2b221b]/38">
                <span className="absolute left-0">Jan 2023</span>
                <span className="absolute left-[58.5%] -translate-x-1/2">Jan 2025</span>
                <span className="absolute right-0">Jun 2026</span>
              </div>
            </Figure>
          </div>

          <Dateline items={scale} lang={lang} className="mt-10" />

          <PullQuote lang={lang} size="feature" className="mt-11">
            {text(DATA_COPY.pull, lang)}
          </PullQuote>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
            <TermList items={COMPOUNDING} lang={lang} />
            <p
              style={{ fontFamily: displayFamily(lang) }}
              className="text-[1.35rem] italic text-[#8c6537] sm:text-[1.6rem]"
            >
              {text(DATA_COPY.compoundClose, lang)}
            </p>
          </div>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export { SixSalonEvidenceLightSection as SixSalonEvidenceSection } from "./SixSalonEvidenceLightSection";

export { SalonOsProductProofSection as SalonOperatingPictureSection } from "./SalonOsProductProofSection";

export { FounderLedTeamSection as CoreTeamSection } from "./FounderLedTeamSection";

/* ------------------------------------------------- Chapter 06 close: the ask */

export const CapitalExpansionSection: React.FC<SectionProps> = ({ lang, reducedMotion }) => (
  <Chapter label={text(FINAL_RAISE.title, lang)} tone="paper" rhythm="feature">
    <Spread>
      <Reveal reducedMotion={reducedMotion}>
        <Kicker>{text(FINAL_RAISE.kicker, lang)}</Kicker>

        <div className="mt-6 grid gap-x-12 gap-y-5 lg:grid-cols-[0.34fr_0.66fr] lg:items-end">
          <p
            dir="ltr"
            style={{ fontFamily: displayFamily(lang) }}
            className={`text-[clamp(4rem,11vw,8rem)] leading-[0.86] tabular-nums tracking-[-0.035em] text-[#2b221b] ${figureAlign(lang)}`}
          >
            {FINAL_RAISE.amount.en}
          </p>
          <Display lang={lang} size="chapter" className="max-w-[24ch]">
            {text(FINAL_RAISE.title, lang)}
          </Display>
        </div>

        <Body className="mt-6 max-w-[41rem]">{text(FINAL_RAISE.body, lang)}</Body>

        <div className="mt-8 grid gap-x-12 gap-y-3 border-y border-[#2b221b]/16 py-6 lg:grid-cols-[0.28fr_0.72fr] lg:items-baseline">
          <Kicker>{text(FINAL_RAISE.askLabel, lang)}</Kicker>
          <p
            style={{ fontFamily: displayFamily(lang) }}
            className="max-w-[34ch] text-[1.45rem] leading-[1.18] text-[#8c6537] sm:text-[1.9rem]"
          >
            {text(FINAL_RAISE.askLine, lang)}
          </p>
        </div>

        <Kicker className="mt-8">{text(FINAL_RAISE.useLabel, lang)}</Kicker>
        <div className="mt-5 grid border-y border-[#2b221b]/16 sm:grid-cols-3">
          {FINAL_RAISE.columns.map((column, index) => (
            <div
              key={column.title.en}
              className="relative border-b border-[#2b221b]/12 py-7 sm:min-h-[12rem] sm:border-b-0 sm:border-e sm:px-6 sm:first:ps-0 sm:last:border-e-0 sm:last:pe-0"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-[3px]"
                style={{ background: ["#2b221b", "#78583e", "#b1844d"][index] }}
              />
              <div className="flex items-baseline justify-between gap-4">
                <Kicker>{text(column.title, lang)}</Kicker>
                <span
                  dir="ltr"
                  style={{ fontFamily: displayFamily(lang) }}
                  className="text-[2.2rem] leading-none tabular-nums text-[#2b221b]/14"
                >
                  0{index + 1}
                </span>
              </div>
              <p
                style={{ fontFamily: displayFamily(lang) }}
                className="mt-7 max-w-[18ch] text-[1.35rem] leading-[1.15] text-[#2b221b] sm:text-[1.55rem]"
              >
                {text(column.body, lang)}
              </p>
            </div>
          ))}
        </div>

        <PullQuote lang={lang} className="mt-8">
          {text(FINAL_RAISE.pull, lang)}
        </PullQuote>

        <Rule className="mt-9" />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
          <Kicker>{text(FINAL_RAISE.context.label, lang)}</Kicker>
          <p className="text-[0.95rem] font-light text-[#2b221b]/62">{text(FINAL_RAISE.context.lead, lang)}</p>
        </div>

        <figure className="mt-6">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <p
              dir="ltr"
              style={{ fontFamily: displayFamily(lang) }}
              className="text-[1.5rem] leading-none tabular-nums text-[#2b221b] sm:text-[1.85rem]"
            >
              {FINAL_RAISE.context.raisedValue}
            </p>
            <Kicker>{text(FINAL_RAISE.context.raisedLabel, lang)}</Kicker>
          </div>

          <div dir="ltr" className="mt-6 grid border-y border-[#2b221b]/16 sm:grid-cols-[1fr_auto_1fr_auto_1fr]">
            {FINAL_RAISE.context.steps.map((step, index) => (
              <React.Fragment key={step.label.en}>
                {index > 0 && (
                  <div className="flex items-center justify-center border-y border-[#2b221b]/8 py-2 text-[1.5rem] text-[#b1844d]/55 sm:border-y-0 sm:px-4">
                    {lang === "he" ? "←" : "→"}
                  </div>
                )}
                <div
                  dir={lang === "he" ? "rtl" : "ltr"}
                  className={`px-5 py-7 sm:min-h-[10rem] ${
                    index === FINAL_RAISE.context.steps.length - 1 ? "bg-[#b1844d]/[0.09]" : ""
                  }`}
                >
                  <p
                    dir="ltr"
                    style={{ fontFamily: displayFamily(lang) }}
                    className={`text-[clamp(2rem,4.2vw,3.4rem)] leading-none tabular-nums tracking-[-0.035em] ${figureAlign(
                      lang,
                    )} ${index === FINAL_RAISE.context.steps.length - 1 ? "text-[#8c6537]" : "text-[#2b221b]"}`}
                  >
                    {step.value}
                  </p>
                  <p className="mt-4 max-w-[18ch] text-[9px] font-semibold uppercase leading-4 tracking-[0.14em] text-[#2b221b]/48">
                    {text(step.label, lang)}
                  </p>
                </div>
              </React.Fragment>
            ))}
          </div>

          <Body className="mt-5 max-w-[46rem]">{text(FINAL_RAISE.context.note, lang)}</Body>
          <Caption className="mt-3 max-w-[40rem]">{text(FINAL_RAISE.context.caption, lang)}</Caption>
        </figure>

        <div className="mt-8 bg-[#2b221b] px-6 py-7 text-[#fbf6ef] sm:px-8 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-[0.24fr_auto_0.76fr] lg:items-center">
            <Kicker dark>{text(FINAL_RAISE.nextStep.label, lang)}</Kicker>
            <span
              aria-hidden="true"
              className="hidden text-[2rem] text-[#d9b981]/55 lg:block"
            >
              {lang === "he" ? "←" : "→"}
            </span>
            <div>
              <p
                style={{ fontFamily: displayFamily(lang) }}
                className="text-[clamp(2rem,4.7vw,4rem)] leading-[0.95] tracking-[-0.025em] text-[#d9b981]"
              >
                {text(FINAL_RAISE.nextStep.value, lang)}
              </p>
              <p className="mt-4 max-w-[42rem] text-[0.95rem] font-light leading-6 text-[#fbf6ef]/62">
                {text(FINAL_RAISE.nextStep.body, lang)}
              </p>
            </div>
          </div>
        </div>

        <Caption className="mt-5 max-w-[52rem] !text-[10px] !text-[#2b221b]/32">
          {text(FINAL_RAISE.footnote, lang)}
        </Caption>
      </Reveal>
    </Spread>
  </Chapter>
);
