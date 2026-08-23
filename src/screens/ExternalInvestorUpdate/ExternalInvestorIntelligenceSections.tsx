import React from "react";
import { PROOF as GLOBAL_USAGE_PROOF } from "../SpectraProductVision/dataMoat";
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
                className="text-[clamp(3.4rem,9vw,6.5rem)] leading-[0.9] tabular-nums tracking-[-0.03em] text-[#2b221b]"
              >
                {`${Math.floor(GLOBAL_USAGE_PROOF.services / 1000)}K+`}
              </p>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8c6537]">
                {text(DATA_COPY.eventsLabel, lang)}
              </p>
            </div>

            <Figure caption={text(DATA_COPY.chartCaption, lang)}>
              <div
                dir="ltr"
                role="img"
                aria-label={
                  lang === "he"
                    ? "אירועי שירות מצטברים מינואר 2023 עד יוני 2026"
                    : "Cumulative measured service events from January 2023 to June 2026"
                }
                className="relative h-36 border-b border-[#2b221b]/25 sm:h-44"
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

        <div className="mt-7 grid gap-x-12 gap-y-6 lg:grid-cols-[0.34fr_0.66fr] lg:items-end">
          <p
            dir="ltr"
            style={{ fontFamily: displayFamily(lang) }}
            className="text-[clamp(4rem,11vw,8rem)] leading-[0.86] tabular-nums tracking-[-0.035em] text-[#2b221b]"
          >
            {FINAL_RAISE.amount.en}
          </p>
          <Display lang={lang} size="chapter" className="max-w-[24ch]">
            {text(FINAL_RAISE.title, lang)}
          </Display>
        </div>

        <Body className="mt-8 max-w-[41rem]">{text(FINAL_RAISE.body, lang)}</Body>

        <Rule strong className="mt-10" />
        <div className="grid sm:grid-cols-3">
          {FINAL_RAISE.columns.map((column) => (
            <div
              key={column.title.en}
              className="border-b border-[#2b221b]/10 py-6 sm:border-b-0 sm:border-e sm:border-[#2b221b]/10 sm:pe-6 sm:ps-6 sm:first:ps-0 sm:last:border-e-0 sm:last:pe-0"
            >
              <Kicker>{text(column.title, lang)}</Kicker>
              <p className="mt-4 text-[1.05rem] font-light leading-7 text-[#2b221b] sm:text-[1.15rem]">
                {text(column.body, lang)}
              </p>
            </div>
          ))}
        </div>
        <Rule strong />

        <div className="mt-10 grid gap-x-12 gap-y-8 lg:grid-cols-2">
          {[FINAL_RAISE.now, FINAL_RAISE.next].map((stage, index) => (
            <div key={stage.label.en} className={index === 1 ? "lg:border-s lg:border-[#2b221b]/12 lg:ps-12" : ""}>
              <Kicker className={index === 1 ? "!text-[#2b221b]/40" : ""}>{text(stage.label, lang)}</Kicker>
              <p
                style={{ fontFamily: displayFamily(lang) }}
                className={`mt-4 text-[1.5rem] leading-tight sm:text-[1.85rem] ${
                  index === 1 ? "text-[#2b221b]/70" : "text-[#2b221b]"
                }`}
              >
                {text(stage.value, lang)}
              </p>
              <Body className="mt-4 max-w-[26rem]">{text(stage.body, lang)}</Body>
            </div>
          ))}
        </div>

        <PullQuote lang={lang} className="mt-11">
          {text(FINAL_RAISE.pull, lang)}
        </PullQuote>

        <Caption className="mt-6 max-w-[52rem] !text-[#2b221b]/38">{text(FINAL_RAISE.footnote, lang)}</Caption>
      </Reveal>
    </Spread>
  </Chapter>
);
