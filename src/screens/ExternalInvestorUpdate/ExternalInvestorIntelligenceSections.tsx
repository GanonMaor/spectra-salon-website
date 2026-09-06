import React from "react";
import { PROOF as GLOBAL_USAGE_PROOF } from "../SpectraProductVision/dataMoat";
import { ChartReveal, chartEase } from "./AnimatedFigures";
import { Sheet } from "./ColorBarPatterns";
import { CB, colorBarSans } from "./colorBarTokens";
import { FINAL_RAISE, type UpdateLang } from "./finalCopy";
import { NETWORK_ACCUMULATION_SERIES } from "./intelligenceData";
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
  PullQuote,
  Reveal,
  Rule,
  Spread,
  TermList,
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
  const peak = cumulative[cumulative.length - 1] ?? 556000;
  const points = cumulative
    .map((value, index) => {
      const x = (index / (NETWORK_ACCUMULATION_SERIES.length - 1)) * 100;
      const y = 98 - (value / peak) * 92;
      return `${x},${y}`;
    })
    .join(" ");

  // Proof metrics are stated once in beat 04; this chapter adds only time depth.
  const scale = [
    { value: String(GLOBAL_USAGE_PROOF.monthsOfHistory), label: loc("Months of history", "חודשי היסטוריה") },
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
                  className="flex items-baseline justify-between gap-6 border-b py-3.5"
                  style={{ borderColor: row.spectra ? CB.lineStrong : CB.line }}
                >
                  <dt
                    className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{ color: row.spectra ? CB.copperDeep : CB.muted }}
                  >
                    {text(row.source, lang)}
                  </dt>
                  <dd
                    style={
                      row.spectra
                        ? { fontFamily: colorBarSans(lang), color: CB.ink }
                        : { color: CB.muted }
                    }
                    className={
                      row.spectra
                        ? "text-end text-[1.25rem] font-semibold leading-tight tracking-[-0.03em] sm:text-[1.5rem]"
                        : "text-end text-[0.95rem]"
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
                style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                className={`text-[clamp(3.4rem,9vw,6.5rem)] font-semibold leading-[0.9] tabular-nums tracking-[-0.05em] ${figureAlign(lang)}`}
              >
                556K+
              </p>
              <p
                className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.2em]"
                style={{ color: CB.copperDeep }}
              >
                {text(DATA_COPY.eventsLabel, lang)}
              </p>
            </div>

            {/* Dense series, so it gets the one white sheet in this chapter. */}
            <Figure caption={text(DATA_COPY.chartCaption, lang)}>
              <Sheet>
                <div className="px-2 pb-2 pt-3 sm:px-3">
                  <ChartReveal
                    reducedMotion={reducedMotion}
                    className="relative h-36 border-b border-[rgba(92,72,42,0.14)] sm:h-44"
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
                          <polygon points={`${points} 100,100 0,100`} fill={CB.copper} fillOpacity="0.1" />
                          <polyline
                            points={points}
                            fill="none"
                            stroke={CB.copper}
                            strokeWidth="1.25"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      </div>
                    )}
                  </ChartReveal>
                  <div
                    dir="ltr"
                    className="relative mt-2 h-4 text-[11px] tabular-nums"
                    style={{ color: CB.muted }}
                  >
                    <span className="absolute left-0">Jan 2023</span>
                    <span className="absolute left-[58.5%] -translate-x-1/2">Jan 2025</span>
                    <span className="absolute right-0">Jun 2026</span>
                  </div>
                </div>
              </Sheet>
            </Figure>
          </div>

          <Dateline items={scale} lang={lang} className="mt-10" />

          <PullQuote lang={lang} size="feature" className="mt-11">
            {text(DATA_COPY.pull, lang)}
          </PullQuote>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
            <TermList items={COMPOUNDING} lang={lang} />
            <p
              style={{ fontFamily: colorBarSans(lang), color: CB.copperDeep }}
              className="text-[1.35rem] font-semibold tracking-[-0.03em] sm:text-[1.6rem]"
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

/** Four weights, stepped from copper: hairline columns ordered, not colour-coded. */
const USE_OF_FUNDS_RULE = [
  CB.copper,
  "rgba(163,125,56,0.70)",
  "rgba(163,125,56,0.45)",
  "rgba(163,125,56,0.22)",
] as const;

export const CapitalExpansionSection: React.FC<SectionProps> = ({ lang, reducedMotion }) => (
  <section id="raise" aria-label={lang === "he" ? "גיוס הון" : "Capital raise"}>
    <Chapter label={text(FINAL_RAISE.title, lang)} tone="paper" rhythm="feature" chapterStart>
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <ChapterMark number="12" title={{ en: "Raise", he: "Raise" }} lang={lang} />
          <Kicker>{text(FINAL_RAISE.kicker, lang)}</Kicker>

          {/* Large $1M figure + chapter title */}
          <div className="mt-6 grid gap-x-12 gap-y-5 lg:grid-cols-[0.34fr_0.66fr] lg:items-end">
            <p
              dir="ltr"
              style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
              className={`text-[clamp(4rem,11vw,8rem)] font-semibold leading-[0.86] tabular-nums tracking-[-0.055em] ${figureAlign(lang)}`}
            >
              {FINAL_RAISE.amount.en}
            </p>
            <Display lang={lang} size="chapter" className="max-w-[24ch]">
              {text(FINAL_RAISE.title, lang)}
            </Display>
          </div>

          <Body className="mt-6 max-w-[41rem]">{text(FINAL_RAISE.body, lang)}</Body>

          {/* Four-column allocation — exact from slide 12 */}
          <Kicker className="mt-8">{text(FINAL_RAISE.useLabel, lang)}</Kicker>
          <ChartReveal reducedMotion={reducedMotion} className="mt-5">
            {(active) => (
              <div
                className="grid grid-cols-2 border-y lg:grid-cols-4"
                style={{ borderColor: CB.lineStrong }}
              >
                {FINAL_RAISE.allocation.map((col, index) => (
                  <div
                    key={col.title.en}
                    className="relative border-b py-7 last:border-b-0 even:border-s lg:border-b-0 lg:border-e lg:border-s-0 lg:px-5 lg:first:ps-0 lg:last:border-e-0 lg:last:pe-0"
                    style={{ borderColor: CB.line }}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute start-0 top-0 h-[2px]"
                      style={{
                        width: active ? "100%" : "0%",
                        background: USE_OF_FUNDS_RULE[index],
                        transition: reducedMotion
                          ? "none"
                          : `width 1.4s ${chartEase} ${index * 90}ms`,
                      }}
                    />
                    <div className="flex items-baseline justify-between gap-3 px-4 lg:px-0">
                      <Kicker>{text(col.title, lang)}</Kicker>
                      <span
                        dir="ltr"
                        style={{ fontFamily: colorBarSans(lang), color: USE_OF_FUNDS_RULE[index] }}
                        className="text-[1.9rem] font-semibold leading-none tabular-nums tracking-[-0.04em]"
                      >
                        {col.pct}
                      </span>
                    </div>
                    <p
                      style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                      className="mt-5 max-w-[16ch] px-4 text-[1.2rem] font-semibold leading-[1.25] tracking-[-0.025em] sm:text-[1.35rem] lg:px-0"
                    >
                      {text(col.body, lang)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ChartReveal>
          <Caption className="mt-3 max-w-[40rem]">
            {text(FINAL_RAISE.allocationCaveat, lang)}
          </Caption>

          {/* Milestones strip */}
          <div
            className="mt-7 grid gap-x-10 gap-y-3 border-y py-5 sm:grid-cols-[auto_1fr] sm:items-baseline"
            style={{ borderColor: CB.line }}
          >
            <Kicker>{text(FINAL_RAISE.milestonesLabel, lang)}</Kicker>
            <TermList items={FINAL_RAISE.milestones} lang={lang} />
          </div>

        </Reveal>
      </Spread>
    </Chapter>
  </section>
);
