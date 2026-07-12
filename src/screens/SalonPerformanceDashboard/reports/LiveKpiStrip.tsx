import React, { useMemo } from "react";
import { Activity, Boxes, Users, Sparkles } from "lucide-react";
import {
  useAnalyticsRange,
  useInventoryHealth,
  useLowStockItems,
  useReweighEfficiency,
  useStaffPerformance,
} from "../../SalonCRM/data/crmHooks";
import { useCrmLocale } from "../../SalonCRM/i18n/CrmLocale";
import type { DateRange as ReportDateRange } from "../analyticsDateRange";
import { formatCrmCurrency } from "./ReportShared";

interface LiveKpiStripProps {
  dateRange: ReportDateRange;
  isDark: boolean;
}

/**
 * Live KPI strip rendered above the demo report charts.
 *
 * Reads exclusively from the canonical CRM state via hooks. The numbers
 * here are guaranteed to mirror what Schedule, Inventory, Staff, AI
 * insights and the Home dashboard see — there is no separate data path.
 *
 * The report tabs below are driven by the same live CRM state through the
 * live analytics adapter, so this strip and the reports never diverge.
 */
const LiveKpiStrip: React.FC<LiveKpiStripProps> = ({ dateRange, isDark }) => {
  const { lang } = useCrmLocale();
  const fc = (v: number) => formatCrmCurrency(v, lang);
  const range = useMemo(
    () => ({
      from: dateRange.from.toISOString().slice(0, 10),
      to: dateRange.to.toISOString().slice(0, 10),
    }),
    [dateRange.from, dateRange.to],
  );
  const summary = useAnalyticsRange(range);
  const reweigh = useReweighEfficiency();
  const inventoryHealth = useInventoryHealth();
  const lowStock = useLowStockItems();
  const performance = useStaffPerformance(range);

  const topStaff = useMemo(
    () =>
      [...performance].sort((a, b) => b.revenueCents - a.revenueCents)[0] ??
      null,
    [performance],
  );

  const cardBase =
    "rounded-2xl border backdrop-blur-xl px-4 py-4 flex items-center gap-3";
  const cardBg = isDark
    ? "bg-black/[0.50] border-white/[0.10]"
    : "bg-white/[0.85] border-black/[0.06]";
  const txt = isDark ? "text-white" : "text-[#1A1A1A]";
  const muted = isDark ? "text-white/55" : "text-black/55";
  const sub = isDark ? "text-white/45" : "text-black/45";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <div className={`${cardBase} ${cardBg}`}>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
          <Activity className="w-5 h-5 text-emerald-500" />
        </div>
        <div className="min-w-0">
          <p
            className={`text-[10px] font-semibold uppercase tracking-wider ${muted}`}
          >
            Live appointments
          </p>
          <p className={`text-xl font-black tracking-tight ${txt}`}>
            {summary.totalAppointments}
          </p>
          <p className={`text-[10px] ${sub}`}>
            {summary.totalServices} services • {summary.daysCount} days
          </p>
        </div>
      </div>

      <div className={`${cardBase} ${cardBg}`}>
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-500" />
        </div>
        <div className="min-w-0">
          <p
            className={`text-[10px] font-semibold uppercase tracking-wider ${muted}`}
          >
            Reweigh adoption
          </p>
          <p className={`text-xl font-black tracking-tight ${txt}`}>
            {reweigh.reweighPct}%
          </p>
          <p className={`text-[10px] ${sub}`}>
            {fc(reweigh.savingsUsd)} savings ·{" "}
            {reweigh.reweighedMixes}/{reweigh.totalMixes} mixes
          </p>
        </div>
      </div>

      <div className={`${cardBase} ${cardBg}`}>
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
          <Boxes className="w-5 h-5 text-cyan-500" />
        </div>
        <div className="min-w-0">
          <p
            className={`text-[10px] font-semibold uppercase tracking-wider ${muted}`}
          >
            Inventory health
          </p>
          <p className={`text-xl font-black tracking-tight ${txt}`}>
            {inventoryHealth}%
          </p>
          <p className={`text-[10px] ${sub}`}>
            {lowStock.length} items below min stock
          </p>
        </div>
      </div>

      <div className={`${cardBase} ${cardBg}`}>
        <div className="w-10 h-10 rounded-xl bg-violet-500/15 flex items-center justify-center">
          <Users className="w-5 h-5 text-violet-500" />
        </div>
        <div className="min-w-0">
          <p
            className={`text-[10px] font-semibold uppercase tracking-wider ${muted}`}
          >
            Top performer
          </p>
          <p className={`text-xl font-black tracking-tight ${txt}`}>
            {topStaff?.staff.name.split(" ")[0] ?? "—"}
          </p>
          <p className={`text-[10px] ${sub}`}>
            {topStaff
              ? `${topStaff.utilizationPct}% utilization • ${topStaff.appointments} appts`
              : "No completed appointments yet"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveKpiStrip;
