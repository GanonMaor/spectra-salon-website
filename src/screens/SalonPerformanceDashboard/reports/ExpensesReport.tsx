import React from "react";
import { Receipt } from "lucide-react";
import { IncompleteState } from "./ReportShared";
import { DateRange } from "../analyticsDateRange";
import type { LiveAnalytics } from "../liveAnalyticsAdapter";

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
  return (
    <IncompleteState
      isDark={isDark}
      title="Expenses aren't tracked yet"
      description="Rent, payroll, utilities and other operating costs will appear here once the Expenses module is added. No expense figures are estimated from revenue."
      icon={<Receipt className={`h-5 w-5 ${isDark ? "text-white/50" : "text-black/45"}`} />}
    />
  );
};

export default ExpensesReport;
