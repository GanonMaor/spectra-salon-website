import React from "react";
import { ShoppingBag } from "lucide-react";
import { IncompleteState } from "./ReportShared";
import { DateRange } from "../analyticsDateRange";
import type { LiveAnalytics } from "../liveAnalyticsAdapter";
import { useCrmT } from "../../SalonCRM/i18n/CrmLocale";

/**
 * Retail sales report.
 *
 * There is no live source of truth for retail product sales yet — that
 * arrives with Checkout / POS. Rather than fabricate a sales mix from a
 * percentage of service revenue, the report shows an honest incomplete
 * state until confirmed checkout records exist.
 */
const SalesReport: React.FC<{ dateRange: DateRange; isDark: boolean; analytics: LiveAnalytics }> = ({ isDark, analytics }) => {
  void analytics;
  const t = useCrmT();
  return (
    <IncompleteState
      isDark={isDark}
      title={t.analytics.report.salesUnavailableTitle}
      description={t.analytics.report.salesUnavailableDescription}
      icon={<ShoppingBag className={`h-5 w-5 ${isDark ? "text-white/50" : "text-black/45"}`} />}
    />
  );
};

export default SalesReport;
