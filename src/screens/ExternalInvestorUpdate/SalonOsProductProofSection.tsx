import React from "react";
import { crmTranslations, type CrmLang } from "../SalonCRM/i18n/translations";
import { displayServiceName } from "../SalonCRM/schedule/scheduleDisplayNames";
import { FINAL_PLATFORM, FINAL_SALON_OS, type UpdateLang } from "./finalCopy";
import { CB, CB_SERVICE, colorBarSans } from "./colorBarTokens";
import { BarTrack, Sheet } from "./ColorBarPatterns";
import { SALON_OS_PROOF } from "./salonOsProofSnapshot";
import {
  Caption,
  Chapter,
  Display,
  Kicker,
  Movement,
  PullQuote,
  Reveal,
  Spread,
  figureAlign,
  loc,
  t as text,
} from "./EditorialPrimitives";

const COPY = {
  environment: loc(
    "Real Salon OS product, current pilot and development environment. All figures in USD.",
    "מוצר Salon OS אמיתי, סביבת פיילוט ופיתוח נוכחית. כל הסכומים בדולרים.",
  ),
  revenueNote: loc(
    "Estimated from completed appointments in this salon.",
    "הערכה מתורים שהושלמו בסלון הזה.",
  ),
  materials: loc("Period material cost", "עלות חומרים לתקופה"),
  opex: loc("Operating expenses", "הוצאות תפעול"),
  opexNote: loc(
    "Estimated operating layer: rent, payroll, utilities and overhead.",
    "שכבת תפעול משוערת: שכירות, שכר, חשבונות ותקורה.",
  ),
  materialCol: loc("Avg material", "חומר ממוצע"),
  materialTableNote: loc(
    "Material averages per service. A visit can include more than one service, so the period material cost above is built from an average per completed visit.",
    "ממוצעי חומרים לשירות. ביקור יכול לכלול יותר משירות אחד, ולכן עלות החומרים לתקופה שלמעלה מבוססת על ממוצע לביקור שהושלם.",
  ),
  profitNote: loc(
    "Revenue minus materials minus operating expenses.",
    "הכנסות פחות חומרים פחות הוצאות תפעול.",
  ),
} as const;

const CHART_LABEL = {
  Color: loc("Color", "צבע"),
  Highlights: loc("Highlights", "גוונים"),
  Toner: loc("Toner", "טונר"),
  Straightening: loc("Straighten", "החלקה"),
  Treatment: loc("Treatment", "טיפול"),
} as const;

/**
 * Treatment categories are the one place the Color Bar palette admits hue,
 * because the hue is the data. The CRM dashboard's `CATEGORY_COLORS` is shared
 * across the product and runs cold (purple, cyan, slate), so the story keeps
 * its own map: the four `CB_SERVICE` treatments, then copper and warm neutrals
 * for everything outside them.
 */
const CATEGORY_TONE: Record<string, string> = {
  Color: CB_SERVICE.color.base,
  Highlights: CB_SERVICE.highlights.base,
  Toner: CB_SERVICE.toner.base,
  Straightening: CB_SERVICE.straightening.base,
  Treatment: CB.copper,
  Cut: CB.muted,
  Other: CB.faint,
  Others: CB.faint,
};

const categoryTone = (category: string) => CATEGORY_TONE[category] ?? CB.faint;

const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

type SectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const categoryLabel = (category: string, lang: UpdateLang) => {
  const key = category as keyof typeof CHART_LABEL;
  return CHART_LABEL[key] ? text(CHART_LABEL[key], lang) : category;
};

/**
 * The strip is one pilot salon's own P&L. Spelling that out here, next to the
 * numbers, is what stops the revenue line reading as Spectra's revenue.
 */
const scopeNote = (lang: UpdateLang, months: number) =>
  lang === "he"
    ? `סלון פיילוט אחד, ${months} חודשים של הכלכלה התפעולית שלו, ולא הכנסות של Spectra.`
    : `One pilot salon, ${months} months of its own operating economics, not Spectra revenue.`;

const periodTag = (lang: UpdateLang, months: number, estimated: string) =>
  lang === "he" ? `${months} חודשים · ${estimated}` : `${months} months · ${estimated.toLowerCase()}`;

const materialDerivation = (lang: UpdateLang, avgPerVisit: number, visits: number) =>
  lang === "he"
    ? `${formatUsd(avgPerVisit)} חומר ממוצע לביקור שהושלם × ${visits.toLocaleString("en-US")} ביקורים.`
    : `${formatUsd(avgPerVisit)} average material per completed visit × ${visits.toLocaleString("en-US")} visits.`;

/** Shared column head for the All Services ledger. */
const HeadCell: React.FC<{
  children: React.ReactNode;
  align?: "start" | "end";
  accent?: boolean;
  className?: string;
}> = ({ children, align = "end", accent = false, className = "" }) => (
  <th
    className={`pb-3 text-[10px] font-extrabold uppercase tracking-[0.12em] ${
      align === "start" ? "text-start" : "text-end"
    } ${className}`}
    style={{ color: accent ? CB.copperDeep : CB.muted }}
  >
    {children}
  </th>
);

export const SalonOsProductProofSection: React.FC<SectionProps> = ({ lang, reducedMotion }) => {
  const crmLang: CrmLang = lang;
  const r = crmTranslations[crmLang].analytics.report;
  const fc = formatUsd;
  const proof = SALON_OS_PROOF;

  const maxCategoryRevenue = proof.revenueByCategory.reduce(
    (max, item) => Math.max(max, item.revenue),
    0,
  );

  const period = periodTag(lang, proof.periodMonths, r.estimated);

  const economics = [
    {
      label: r.bookedServiceValue,
      value: fc(proof.bookedServiceValue),
      note: text(COPY.revenueNote, lang),
      tag: period,
    },
    {
      label: text(COPY.materials, lang),
      value: fc(proof.estimatedMaterialCost),
      note: materialDerivation(lang, proof.avgMaterialCostPerVisit, proof.visitCount),
      tag: period,
    },
    { label: text(COPY.opex, lang), value: fc(proof.operatingOverhead), note: text(COPY.opexNote, lang), tag: period },
    { label: r.netProfit, value: fc(proof.netProfit), note: text(COPY.profitNote, lang), tag: r.financePilotBadge },
  ];

  return (
    <Chapter label={text(FINAL_SALON_OS.title, lang)} tone="paper" rhythm="feature">
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <Movement number="02" title={FINAL_PLATFORM.movements.economics} lang={lang} />

          <div className="mt-7 grid gap-x-14 gap-y-5 lg:grid-cols-[0.58fr_0.42fr] lg:items-end">
            <Display lang={lang} size="feature" className="max-w-[22ch]">
              {text(FINAL_SALON_OS.title, lang)}
            </Display>
            <div className="lg:pb-2">
              <Caption className="!text-[#82632A]">{scopeNote(lang, proof.periodMonths)}</Caption>
              <Caption className="mt-2">{text(COPY.environment, lang)}</Caption>
            </div>
          </div>

          {/* The pilot P&L, set as one ruled sheet rather than four tiles. */}
          <Sheet className="mt-9">
            <div className="grid px-2 py-1 sm:grid-cols-2 sm:px-3 lg:grid-cols-4">
              {economics.map((item) => (
                <div
                  key={item.label}
                  className="border-b border-[rgba(92,72,42,0.07)] py-6 last:border-b-0 lg:border-b-0 lg:pe-5 lg:[&:not(:first-child)]:border-s lg:[&:not(:first-child)]:border-[rgba(92,72,42,0.07)] lg:[&:not(:first-child)]:ps-5"
                >
                  <p
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[10px] font-extrabold uppercase tracking-[0.14em]"
                    style={{ color: CB.muted }}
                  >
                    {item.label}
                    {item.tag && (
                      <span
                        className="font-semibold normal-case tracking-[0.06em]"
                        style={{ color: CB.copperDeep }}
                      >
                        {item.tag}
                      </span>
                    )}
                  </p>
                  <p
                    dir="ltr"
                    style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
                    className={`mt-4 text-[clamp(1.7rem,3.2vw,2.45rem)] font-semibold leading-none tabular-nums tracking-[-0.045em] ${figureAlign(lang)}`}
                  >
                    {item.value}
                  </p>
                  <Caption className="mt-3">{item.note}</Caption>
                </div>
              ))}
            </div>
          </Sheet>

          <div className="mt-10 grid gap-x-14 gap-y-10 lg:grid-cols-[0.44fr_0.56fr]">
            <div className="min-w-0">
              <Kicker>{r.revenueByCategory}</Kicker>
              {/*
                Ruled rows rather than vertical columns: five stacked uppercase
                labels never clear their own column width in English at any of
                this grid's widths, and the horizontal read is the printed
                ledger this section is after.
              */}
              <Sheet className="mt-5">
                <div className="grid gap-5 px-2 py-4 sm:px-3 sm:py-5">
                  {proof.revenueByCategory.map((item) => (
                    <BarTrack
                      key={item.key}
                      label={categoryLabel(item.key, lang)}
                      value={fc(item.revenue)}
                      percent={(item.revenue / Math.max(1, maxCategoryRevenue)) * 100}
                      color={categoryTone(item.key)}
                    />
                  ))}
                </div>
              </Sheet>
              <Caption className="mt-4">{r.estimated}</Caption>
            </div>

            <div className="min-w-0">
              <Kicker>{r.allServices}</Kicker>
              <Sheet className="mt-5">
                <div className="overflow-x-auto px-2 py-3 sm:px-3">
                  <table className="w-full min-w-[17rem] text-start">
                    <thead>
                      <tr className="border-b" style={{ borderColor: CB.lineStrong }}>
                        <HeadCell align="start">{r.service}</HeadCell>
                        <HeadCell>{r.revenue}</HeadCell>
                        <HeadCell className="hidden sm:table-cell">{r.averagePriceShort}</HeadCell>
                        <HeadCell accent>{text(COPY.materialCol, lang)}</HeadCell>
                        <HeadCell className="hidden sm:table-cell">{r.duration}</HeadCell>
                      </tr>
                    </thead>
                    <tbody>
                      {proof.serviceRows.map((service) => (
                        <tr key={service.id} className="border-b last:border-b-0" style={{ borderColor: CB.line }}>
                          <td
                            className="py-3.5 pe-3 text-[0.95rem] font-medium tracking-[-0.01em]"
                            style={{ color: CB.ink }}
                          >
                            <span className="flex items-center gap-2.5">
                              <span
                                aria-hidden="true"
                                className="h-3.5 w-1 shrink-0"
                                style={{ backgroundColor: categoryTone(service.category) }}
                              />
                              {displayServiceName(service.name, lang === "he")}
                            </span>
                          </td>
                          <td
                            dir="ltr"
                            className="py-3.5 text-end text-[0.95rem] font-semibold tabular-nums tracking-[-0.02em]"
                            style={{ color: CB.ink }}
                          >
                            {fc(service.revenue)}
                          </td>
                          <td
                            dir="ltr"
                            className="hidden py-3.5 text-end text-[0.95rem] tabular-nums tracking-[-0.01em] sm:table-cell"
                            style={{ color: CB.muted }}
                          >
                            {fc(service.avgPrice)}
                          </td>
                          <td
                            dir="ltr"
                            className="py-3.5 text-end text-[0.95rem] font-semibold tabular-nums tracking-[-0.02em]"
                            style={{ color: CB.copperDeep }}
                          >
                            {fc(service.avgMaterialCost)}
                          </td>
                          <td
                            className="hidden py-3.5 text-end text-[0.95rem] tabular-nums sm:table-cell"
                            style={{ color: CB.muted }}
                          >
                            {service.avgDuration} {lang === "he" ? "דק׳" : "min"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Sheet>
              <Caption className="mt-4">{text(COPY.materialTableNote, lang)}</Caption>
            </div>
          </div>

          <PullQuote lang={lang} size="feature" className="mt-11">
            {text(FINAL_SALON_OS.pull, lang)}
          </PullQuote>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default SalonOsProductProofSection;
