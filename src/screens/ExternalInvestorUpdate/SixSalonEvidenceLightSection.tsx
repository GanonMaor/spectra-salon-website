import React from "react";
import { FINAL_CHAPTERS, type UpdateLang } from "./finalCopy";
import { SIX_SALON_SAMPLE } from "./intelligenceData";
import {
  Body,
  Caption,
  Chapter,
  ChapterMark,
  Dateline,
  Display,
  Kicker,
  Reveal,
  Rule,
  Spread,
  displayFamily,
  figureAlign,
  loc,
  t as text,
} from "./EditorialPrimitives";

export type SixSalonEvidenceLightSectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const COPY = {
  kicker: loc("A small query. Six salons.", "שאילתה קטנה. שישה סלונים."),
  lead: loc("of the color material consumed was Brunette.", "מחומרי הצבע שנצרכו היו חום."),
  mixNote: loc(
    "Share of color material consumed, excluding developers and lighteners.",
    "חלקם של חומרי הצבע שנצרכו, ללא חמצנים וחומרי הבהרה.",
  ),
  shadeTitle: loc("Top consumed shades", "הגוונים הנצרכים ביותר"),
  shadeNote: loc(
    "Measured by product actually consumed in services, not product purchased.",
    "נמדד לפי מוצר שנצרך בפועל בשירותים, לא לפי מוצר שנרכש.",
  ),
  changeLead: loc("of clients changed colour direction.", "מהלקוחות שינו כיוון צבע."),
  changeNote: loc(
    `${SIX_SALON_SAMPLE.journeyClients} journeys across ${SIX_SALON_SAMPLE.clientCount} clients, measured as a change in formula, depth or tone.`,
    `${SIX_SALON_SAMPLE.journeyClients} מסעות צבע מתוך ${SIX_SALON_SAMPLE.clientCount} לקוחות, שנמדדו כשינוי בפורמולה, בעומק או בטון.`,
  ),
  audience: loc("One data layer. Two markets.", "שכבת דאטה אחת. שני שווקים."),
  forSalons: loc("For salons", "לסלונים"),
  forSalonsBody: loc(
    "Business intelligence: material cost, service economics, capacity and client retention.",
    "אינטליגנציה עסקית: עלות חומר, כלכלת שירות, קיבולת ושימור לקוחות.",
  ),
  forIndustry: loc("For the industry", "לתעשייה"),
  forIndustryBody: loc(
    "Product, demand and portfolio intelligence for manufacturers and distributors.",
    "אינטליגנציית מוצר, ביקוש ופורטפוליו ליצרנים ולמפיצים.",
  ),
  caveat: loc(
    "Decision-support this data can enable as coverage grows. These are not products represented as live today.",
    "יישומי תמיכה בהחלטות שהדאטה הזה יכול לאפשר ככל שהכיסוי גדל. אלה אינם מוצרים שמוצגים כפעילים כיום.",
  ),
} as const;

const KPI_UNITS = [
  loc("Salons", "סלונים"),
  loc("Services", "שירותים"),
  loc("Clients", "לקוחות"),
  loc("Material", "חומר"),
] as const;

const kpis = SIX_SALON_SAMPLE.totals.map((metric, index) => ({
  value: index === 0 ? metric.value.replace(/\s*salons$/i, "") : metric.value,
  label: KPI_UNITS[index],
}));

const topShades = SIX_SALON_SAMPLE.products.slice(0, 5);
const maxShadeKg = topShades[0].kg;
const brunette = SIX_SALON_SAMPLE.families[0];

export const SixSalonEvidenceLightSection: React.FC<SixSalonEvidenceLightSectionProps> = ({
  lang,
  reducedMotion,
}) => {
  const mixLabel = SIX_SALON_SAMPLE.families
    .map((family) => `${lang === "he" ? family.he : family.name}: ${family.value}%`)
    .join(", ");

  return (
    <Chapter
      id="six-salon-evidence"
      label={lang === "he" ? "מה הדאטה רואה" : "What the data can see"}
      tone="warm"
      rhythm="feature"
      chapterStart
    >
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <ChapterMark {...FINAL_CHAPTERS.data} lang={lang} />
          <Kicker className="mt-7 !text-[#2b221b]/45">{text(COPY.kicker, lang)}</Kicker>

          <div className="mt-5 grid gap-x-12 gap-y-5 lg:grid-cols-[0.34fr_0.66fr] lg:items-baseline">
            <p
              dir="ltr"
              style={{ fontFamily: displayFamily(lang) }}
              className={`text-[clamp(4rem,11vw,7.5rem)] leading-[0.86] tabular-nums tracking-[-0.03em] text-[#7b5036] ${figureAlign(lang)}`}
            >
              {brunette.value}%
            </p>
            <Display lang={lang} size="feature" className="max-w-[22ch]">
              {text(COPY.lead, lang)}
            </Display>
          </div>

          <div dir="ltr" className="mt-8 flex h-2.5 overflow-hidden" role="img" aria-label={mixLabel}>
            {SIX_SALON_SAMPLE.families.map((family) => (
              <div
                key={family.name}
                className="min-w-0"
                style={{ width: `${family.value}%`, background: family.color }}
                title={`${lang === "he" ? family.he : family.name}: ${family.value}%`}
              />
            ))}
          </div>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2b221b]/52">
            {SIX_SALON_SAMPLE.families.map((family) => (
              <span key={family.name} className="inline-flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0"
                  style={{ background: family.color }}
                />
                {lang === "he" ? family.he : family.name}
                <span dir="ltr" className="tabular-nums text-[#2b221b]/72">
                  {family.value}%
                </span>
              </span>
            ))}
          </p>
          <Caption className="mt-3">{text(COPY.mixNote, lang)}</Caption>

          <Rule strong className="mt-9" />
          <Dateline items={kpis} lang={lang} className="mt-5" />
          <Caption className="mt-3">{text(SIX_SALON_SAMPLE.caveat, lang)}</Caption>

          <div className="mt-10 grid gap-x-14 gap-y-9 lg:grid-cols-[0.62fr_0.38fr]">
            <div>
              <Kicker>{text(COPY.shadeTitle, lang)}</Kicker>
              <ol className="mt-5">
                {topShades.map((product) => (
                  <li
                    key={product.name}
                    dir="ltr"
                    className="flex flex-col gap-1.5 border-t border-[#2b221b]/12 py-3 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2b221b]/72 sm:w-[8.5rem] sm:shrink-0">
                      {product.name}
                    </span>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div
                        role="progressbar"
                        aria-label={`${product.name}: ${product.kg.toFixed(1)} kg`}
                        aria-valuemin={0}
                        aria-valuemax={maxShadeKg}
                        aria-valuenow={product.kg}
                        aria-valuetext={`${product.kg.toFixed(1)} kg`}
                        className="h-7 min-w-0 flex-1 bg-[#2b221b]/[0.06]"
                      >
                        <div
                          className="h-full"
                          style={{
                            width: `${(product.kg / maxShadeKg) * 100}%`,
                            background: product.tone,
                          }}
                        />
                      </div>
                      <span className="w-[4.25rem] shrink-0 text-end text-[0.95rem] tabular-nums text-[#2b221b]">
                        {product.kg.toFixed(1)} kg
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
              <Rule className="!bg-[#2b221b]/12" />
              <Caption className="mt-3">{text(COPY.shadeNote, lang)}</Caption>
            </div>

            <div className="lg:border-s lg:border-[#2b221b]/12 lg:ps-12">
              <p
                dir="ltr"
                style={{ fontFamily: displayFamily(lang) }}
                className={`text-[clamp(2.6rem,6vw,4rem)] leading-none tabular-nums tracking-[-0.03em] text-[#b1844d] ${figureAlign(lang)}`}
              >
                {SIX_SALON_SAMPLE.journeyShare}
              </p>
              <p className="mt-4 max-w-[18rem] text-[1.05rem] font-light leading-7 text-[#2b221b] sm:text-[1.15rem]">
                {text(COPY.changeLead, lang)}
              </p>
              <Caption className="mt-3 max-w-[20rem]">{text(COPY.changeNote, lang)}</Caption>
            </div>
          </div>

          <Rule strong className="mt-11" />
          <div className="grid gap-x-12 sm:grid-cols-[auto_1fr_1fr]">
            <p
              style={{ fontFamily: displayFamily(lang) }}
              className="border-b border-[#2b221b]/10 py-6 text-[1.25rem] leading-tight text-[#2b221b] sm:me-10 sm:max-w-[11ch] sm:border-b-0 sm:text-[1.45rem]"
            >
              {text(COPY.audience, lang)}
            </p>
            <div className="border-b border-[#2b221b]/10 py-6 sm:border-b-0 sm:pe-8">
              <Kicker>{text(COPY.forSalons, lang)}</Kicker>
              <Body className="mt-3">{text(COPY.forSalonsBody, lang)}</Body>
            </div>
            <div className="py-6 sm:ps-8 sm:border-s sm:border-[#2b221b]/10">
              <Kicker>{text(COPY.forIndustry, lang)}</Kicker>
              <Body className="mt-3">{text(COPY.forIndustryBody, lang)}</Body>
            </div>
          </div>
          <Rule strong />
          <Caption className="mt-4 max-w-[46rem]">{text(COPY.caveat, lang)}</Caption>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default SixSalonEvidenceLightSection;
