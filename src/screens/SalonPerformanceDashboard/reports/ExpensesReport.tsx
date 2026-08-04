import React from "react";
import { Receipt } from "lucide-react";
import { IncompleteState } from "./ReportShared";
import { DateRange } from "../analyticsDateRange";
import type { LiveAnalytics } from "../liveAnalyticsAdapter";
import { useCrmT } from "../../SalonCRM/i18n/CrmLocale";

/**
 * Expenses report.
 *
 * The pilot has no expenses module yet, so there is no real source of
 * truth for operating costs. Synthesising expenses from a percentage of
 * revenue would be misleading, so the report shows an honest incomplete
 * state until real expense records exist.
 */
const ExpensesReport: React.FC<{ dateRange: DateRange; isDark: boolean; analytics: LiveAnalytics }> = ({ isDark, analytics }) => {
  void analytics;
  const t = useCrmT();
  return (
    <IncompleteState
      isDark={isDark}
      title={t.analytics.report.expensesUnavailableTitle}
      description={t.analytics.report.expensesUnavailableDescription}
      icon={<Receipt className={`h-5 w-5 ${isDark ? "text-white/50" : "text-black/45"}`} />}
    />
  );
};

export default ExpensesReport;
