import React from "react";
import { crmTranslations, type CrmLang } from "../SalonCRM/i18n/translations";
import { displayServiceName } from "../SalonCRM/schedule/scheduleDisplayNames";
import { CATEGORY_COLORS } from "../SalonPerformanceDashboard/reports/ReportShared";
import { FINAL_PLATFORM, FINAL_SALON_OS, type UpdateLang } from "./finalCopy";
import { SALON_OS_PROOF } from "./salonOsProofSnapshot";
import {
  Caption,
  Chapter,
  Display,
  Kicker,
  Movement,
  PullQuote,
  Reveal,
  Rule,
  Spread,
  displayFamily,
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
              <Caption className="!text-[#8c6537]">{scopeNote(lang, proof.periodMonths)}</Caption>
              <Caption className="mt-2">{text(COPY.environment, lang)}</Caption>
            </div>
          </div>

          <Rule strong className="mt-9" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4">
            {economics.map((item) => (
              <div
                key={item.label}
                className="border-b border-[#2b221b]/10 py-6 lg:border-b-0 lg:pe-5 lg:[&:not(:first-child)]:border-s lg:[&:not(:first-child)]:border-[#2b221b]/10 lg:[&:not(:first-child)]:ps-5"
              >
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2b221b]/45">
                  {item.label}
                  {item.tag && <span className="font-medium normal-case tracking-normal text-[#8c6537]">{item.tag}</span>}
                </p>
                <p
                  dir="ltr"
                  style={{ fontFamily: displayFamily(lang) }}
                  className={`mt-4 text-[clamp(1.7rem,3.2vw,2.45rem)] leading-none tabular-nums tracking-[-0.03em] text-[#2b221b] ${figureAlign(lang)}`}
                >
                  {item.value}
                </p>
                <Caption className="mt-3">{item.note}</Caption>
              </div>
            ))}
          </div>
          <Rule strong />

          <div className="mt-11 grid gap-x-14 gap-y-10 lg:grid-cols-[0.44fr_0.56fr]">
            <div>
              <Kicker>{r.revenueByCategory}</Kicker>
              <div dir="ltr" className="mt-7 flex items-end gap-2 sm:gap-4">
                {proof.revenueByCategory.map((item) => (
                  <div key={item.key} className="min-w-0 flex-1">
                    <p
                      dir="ltr"
                      className="text-[11px] font-semibold tabular-nums leading-none text-[#2b221b]/62"
                    >
                      {fc(item.revenue)}
                    </p>
                    <div
                      className="mt-3"
                      style={{
                        height: `${Math.max(8, (item.revenue / Math.max(1, maxCategoryRevenue)) * 130)}px`,
                        background: CATEGORY_COLORS[item.key] || "#64748B",
                      }}
                    />
                    <p
                      dir={lang === "he" ? "rtl" : "ltr"}
                      className="mt-3 border-t border-[#2b221b]/12 pt-2.5 text-[10px] font-semibold uppercase leading-4 tracking-normal text-[#2b221b]/55 sm:tracking-[0.06em]"
                    >
                      {categoryLabel(item.key, lang)}
                    </p>
                  </div>
                ))}
              </div>
              <Caption className="mt-4">{r.estimated}</Caption>
            </div>

            <div>
              <Kicker>{r.allServices}</Kicker>
              <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[18rem] text-start">
                <thead>
                  <tr className="border-b border-[#2b221b]/25">
                    <th className="pb-2.5 text-start text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2b221b]/45">
                      {r.service}
                    </th>
                    <th className="pb-2.5 text-end text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2b221b]/45">
                      {r.revenue}
                    </th>
                    <th className="hidden pb-2.5 text-end text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2b221b]/45 sm:table-cell">
                      {r.averagePriceShort}
                    </th>
                    <th className="pb-2.5 text-end text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8c6537]">
                      {text(COPY.materialCol, lang)}
                    </th>
                    <th className="hidden pb-2.5 text-end text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2b221b]/45 sm:table-cell">
                      {r.duration}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {proof.serviceRows.map((service) => (
                    <tr key={service.id} className="border-b border-[#2b221b]/10">
                      <td className="py-3.5 pe-3 text-[0.95rem] font-light text-[#2b221b]">
                        <span className="flex items-center gap-2.5">
                          <span
                            aria-hidden="true"
                            className="h-3.5 w-1 shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[service.category] || "#64748B" }}
                          />
                          {displayServiceName(service.name, lang === "he")}
                        </span>
                      </td>
                      <td dir="ltr" className="py-3.5 text-end text-[0.95rem] tabular-nums text-[#2b221b]/70">
                        {fc(service.revenue)}
                      </td>
                      <td dir="ltr" className="hidden py-3.5 text-end text-[0.95rem] tabular-nums text-[#2b221b]/70 sm:table-cell">
                        {fc(service.avgPrice)}
                      </td>
                      <td dir="ltr" className="py-3.5 text-end text-[0.95rem] tabular-nums text-[#8c6537]">
                        {fc(service.avgMaterialCost)}
                      </td>
                      <td className="hidden py-3.5 text-end text-[0.95rem] tabular-nums text-[#2b221b]/70 sm:table-cell">
                        {service.avgDuration} {lang === "he" ? "דק׳" : "min"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
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
