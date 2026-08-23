import React from "react";
import { crmTranslations, type CrmLang } from "../SalonCRM/i18n/translations";
import { displayServiceName } from "../SalonCRM/schedule/scheduleDisplayNames";
import {
  CATEGORY_COLORS,
  formatCrmCurrency,
} from "../SalonPerformanceDashboard/reports/ReportShared";
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
  loc,
  t as text,
} from "./EditorialPrimitives";

const COPY = {
  status: loc(
    "Real Salon OS product, current pilot and development environment.",
    "מוצר Salon OS אמיתי, סביבת פיילוט ופיתוח נוכחית.",
  ),
  overhead: loc(
    "Operating overhead is a pilot preview, shown only to keep net profit honest.",
    "הוצאות התפעול הן תצוגת פיילוט, ומוצגות רק כדי לשמור על יושרה ברווח הנקי.",
  ),
} as const;

type SectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const categoryLabel = (category: string, lang: CrmLang) => {
  const displayKey = category === "Cut" || category === "Other" ? "Others" : category;
  const labels = crmTranslations[lang].analytics.categories;
  return labels[displayKey as keyof typeof labels] ?? category;
};

export const SalonOsProductProofSection: React.FC<SectionProps> = ({ lang, reducedMotion }) => {
  const crmLang: CrmLang = lang;
  const r = crmTranslations[crmLang].analytics.report;
  const fc = (value: number) => formatCrmCurrency(value, crmLang);
  const proof = SALON_OS_PROOF;

  const maxCategoryRevenue = proof.revenueByCategory.reduce(
    (max, item) => Math.max(max, item.revenue),
    0,
  );

  const economics = [
    { label: r.bookedServiceValue, value: fc(proof.bookedServiceValue), note: r.estimatedFromCompleted, tag: r.estimated },
    { label: r.estimatedMaterialCost, value: fc(proof.estimatedMaterialCost), note: r.fromServiceDefaults, tag: undefined },
    proof.hasFinancePreview
      ? { label: r.netProfit, value: fc(proof.netProfit), note: r.netProfitPreview, tag: r.financePilotBadge }
      : { label: r.netProfit, value: "N/A", note: r.unavailableCheckoutExpenses, tag: undefined },
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
            <Caption className="lg:pb-2">{text(COPY.status, lang)}</Caption>
          </div>

          <Rule strong className="mt-9" />
          <div className="grid sm:grid-cols-3">
            {economics.map((item, index) => (
              <div
                key={item.label}
                className={`border-b border-[#2b221b]/10 py-6 sm:border-b-0 sm:pe-6 ${
                  index > 0 ? "sm:border-s sm:border-[#2b221b]/10 sm:ps-6" : ""
                }`}
              >
                <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2b221b]/45">
                  {item.label}
                  {item.tag && <span className="font-medium normal-case tracking-normal text-[#8c6537]">{item.tag}</span>}
                </p>
                <p
                  dir="ltr"
                  style={{ fontFamily: displayFamily(lang) }}
                  className="mt-4 text-[clamp(2rem,4.4vw,3rem)] leading-none tabular-nums tracking-[-0.03em] text-[#2b221b]"
                >
                  {item.value}
                </p>
                <Caption className="mt-3">{item.note}</Caption>
              </div>
            ))}
          </div>
          <Rule strong />
          {proof.hasFinancePreview && (
            <Caption className="mt-3">
              {text(COPY.overhead, lang)}
              <span dir="ltr" className="ms-1 tabular-nums">
                {fc(proof.operatingOverhead)}
              </span>
            </Caption>
          )}

          <div className="mt-11 grid gap-x-14 gap-y-10 lg:grid-cols-[0.44fr_0.56fr]">
            <div>
              <Kicker>{r.revenueByCategory}</Kicker>
              <div dir="ltr" className="mt-7 flex items-end gap-3 sm:gap-4">
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
                      className="mt-3 border-t border-[#2b221b]/12 pt-2.5 text-[10px] font-semibold uppercase leading-4 tracking-[0.08em] text-[#2b221b]/55"
                    >
                      {categoryLabel(item.key, crmLang)}
                    </p>
                  </div>
                ))}
              </div>
              <Caption className="mt-4">{r.estimated}</Caption>
            </div>

            <div>
              <Kicker>{r.allServices}</Kicker>
              <table className="mt-6 w-full text-start">
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
                      {r.material}
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
