import React, { useEffect, useMemo, useRef, useState } from "react";
import { LayoutDashboard, Users, Package, Scissors, CalendarDays, ShoppingBag, Receipt } from "lucide-react";
import { useCrmLocale, useCrmT } from "../SalonCRM/i18n/CrmLocale";
import { useAppointments } from "../SalonCRM/data/crmHooks";
import DashboardReport from "./reports/DashboardReport";
import StaffPerformanceReport from "./reports/StaffPerformanceReport";
import ProductUsageReport from "./reports/ProductUsageReport";
import ServicesReport from "./reports/ServicesReport";
import SalesReport from "./reports/SalesReport";
import ExpensesReport from "./reports/ExpensesReport";
import LiveKpiStrip from "./reports/LiveKpiStrip";
import {
  DateRange,
  DatePreset,
  getDefaultRange,
  hasActivityInRange,
  rangeFromPreset,
} from "./analyticsDateRange";
import { useLiveAnalytics } from "./liveAnalyticsAdapter";
import { CrmPageGate, CrmSkeleton } from "../SalonCRM/CrmPageGate";

// ── Analytics tab definitions ───────────────────────────────────────

type AnalyticsTab = "dashboard" | "staffPerformance" | "services" | "productUsage" | "sales" | "expenses";

// Note: ANALYTICS_TABS and DATE_PRESETS are built inside the component to use live translations.
// These static arrays remain only for type reference.
const ANALYTICS_TAB_IDS: AnalyticsTab[] = ["dashboard", "sales", "services", "staffPerformance", "productUsage", "expenses"];
const DATE_PRESET_IDS: DatePreset[] = ["today", "week", "month", "year", "all", "custom"];

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Main Component ──────────────────────────────────────────────────

const SalonPerformanceDashboard: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  // Reports use a dedicated dark surface so dense business data remains calm
  // and readable regardless of the shell's light/dark preference.
  const isDark = true;
  const t = useCrmT();
  const { lang } = useCrmLocale();
  const appointments = useAppointments();
  const visitTimestamps = useMemo(
    () => appointments.map((appointment) => appointment.startTime),
    [appointments],
  );
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("dashboard");
  const [dateRange, setDateRange] = useState<DateRange>(() => getDefaultRange());
  const historyDefaultAppliedRef = useRef(false);
  const analytics = useLiveAnalytics(dateRange);
  const showHistoryHint = useMemo(() => {
    if (visitTimestamps.length === 0) return false;
    if (dateRange.preset === "all" || dateRange.preset === "custom") return false;
    return !hasActivityInRange(visitTimestamps, dateRange);
  }, [visitTimestamps, dateRange]);

  // Year/month/week/day stay calendar-relative (YTD / MTD / …).
  // If the current year has no visits but the salon has older history
  // (common after import), land on "All" once so numbers are visible.
  useEffect(() => {
    if (historyDefaultAppliedRef.current) return;
    if (visitTimestamps.length === 0) return;
    setDateRange((prev) => {
      if (prev.preset !== "year") {
        historyDefaultAppliedRef.current = true;
        return prev;
      }
      if (hasActivityInRange(visitTimestamps, prev)) {
        historyDefaultAppliedRef.current = true;
        return prev;
      }
      historyDefaultAppliedRef.current = true;
      return rangeFromPreset("all", visitTimestamps);
    });
  }, [visitTimestamps]);

  const handlePreset = (preset: DatePreset) => {
    if (preset === "custom") {
      setDateRange(prev => ({ ...prev, preset: "custom" }));
      return;
    }
    setDateRange(rangeFromPreset(preset, visitTimestamps));
  };

  const handleCustomFrom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(e.target.value + "T00:00:00");
    if (!isNaN(d.getTime())) setDateRange(prev => ({ ...prev, from: d, preset: "custom" }));
  };

  const handleCustomTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = new Date(e.target.value + "T23:59:59");
    if (!isNaN(d.getTime())) setDateRange(prev => ({ ...prev, to: d, preset: "custom" }));
  };

  const ANALYTICS_TABS: { id: AnalyticsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "dashboard",        label: t.analytics.tabDashboard, icon: LayoutDashboard },
    { id: "sales",            label: t.analytics.tabSales,     icon: ShoppingBag },
    { id: "services",         label: t.analytics.tabServices,  icon: Scissors },
    { id: "staffPerformance", label: t.analytics.tabStaff,     icon: Users },
    { id: "productUsage",     label: t.analytics.tabProducts,  icon: Package },
    { id: "expenses",         label: t.analytics.tabExpenses,  icon: Receipt },
  ];

  const DATE_PRESETS: { id: DatePreset; label: string }[] = [
    { id: "today",  label: t.analytics.presetToday  },
    { id: "week",   label: t.analytics.presetWeek   },
    { id: "month",  label: t.analytics.presetMonth  },
    { id: "year",   label: t.analytics.presetYear   },
    { id: "all",    label: t.analytics.presetAll    },
    { id: "custom", label: t.analytics.presetCustom },
  ];

  const reportContent = (
    <div
      className={
        embedded
          ? "w-full rounded-[28px] border border-white/[0.08] bg-[#11131A] bg-[radial-gradient(ellipse_at_top_right,_rgba(71,85,105,0.20),_transparent_48%),radial-gradient(ellipse_at_bottom_left,_rgba(30,41,59,0.32),_transparent_54%)] px-3 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.24)] sm:px-5 sm:py-5 lg:px-6"
          : "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12"
      }
    >
      {/* ── Tab Bar + Date Selector ──────────────────── */}
      <div
        className={`rounded-2xl sm:rounded-3xl border backdrop-blur-xl px-2 sm:px-4 py-2 mb-4 sm:mb-6 ${
          isDark
            ? "border-white/[0.12] bg-black/[0.30]"
            : "border-black/[0.06] bg-white/[0.70]"
        }`}
        style={{ boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)"
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          {/* Report Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
            {ANALYTICS_TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-all whitespace-nowrap ${
                  activeTab === id
                    ? id === "dashboard"
                      ? "bg-gradient-to-r from-amber-500/25 to-emerald-500/20 text-white shadow-[0_0_20px_rgba(245,158,11,0.18)] ring-1 ring-amber-300/20"
                      : isDark
                        ? "bg-white/[0.14] text-white shadow-sm"
                        : "bg-black/[0.08] text-[#1A1A1A] shadow-sm"
                    : id === "dashboard"
                      ? isDark
                        ? "text-amber-200/75 hover:text-amber-100 hover:bg-amber-400/[0.08] ring-1 ring-amber-300/10"
                        : "text-amber-700 hover:text-amber-800 hover:bg-amber-100/60 ring-1 ring-amber-300/30"
                    : isDark
                      ? "text-white/45 hover:text-white/70 hover:bg-white/[0.06]"
                      : "text-black/55 hover:text-black/70 hover:bg-black/[0.04]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <CalendarDays className={`w-3.5 h-3.5 hidden sm:block ${isDark ? "text-white/50" : "text-black/50"}`} />
            {DATE_PRESETS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handlePreset(id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  dateRange.preset === id
                    ? isDark
                      ? "bg-white/[0.14] text-white"
                      : "bg-black/[0.08] text-[#1A1A1A]"
                    : isDark
                      ? "text-white/50 hover:text-white/60 hover:bg-white/[0.06]"
                      : "text-black/50 hover:text-black/60 hover:bg-black/[0.04]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Active range caption + custom inputs */}
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 pb-1 border-t mt-2 ${
          isDark ? "border-white/[0.06]" : "border-black/[0.06]"
        }`}>
          <p className={`text-[10px] font-medium ${isDark ? "text-white/45" : "text-black/50"}`}>
            {toInputDate(dateRange.from)} → {toInputDate(dateRange.to)}
            {dateRange.preset === "year" ? (lang === "he" ? " · מתחילת השנה עד היום" : " · year to date") : ""}
          </p>
          {dateRange.preset === "custom" && (
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-medium ${isDark ? "text-white/50" : "text-black/55"}`}>{t.analytics.dateFrom}</span>
              <input
                type="date"
                value={toInputDate(dateRange.from)}
                onChange={handleCustomFrom}
                className={`border text-[11px] rounded-lg px-2 py-1.5 outline-none transition-colors ${
                  isDark
                    ? "bg-white/[0.08] border-white/[0.10] text-white focus:border-white/[0.25] [color-scheme:dark]"
                    : "bg-black/[0.04] border-black/[0.10] text-[#1A1A1A] focus:border-black/[0.25]"
                }`}
              />
              <span className={`text-[10px] font-medium ${isDark ? "text-white/50" : "text-black/55"}`}>{t.analytics.dateTo}</span>
              <input
                type="date"
                value={toInputDate(dateRange.to)}
                onChange={handleCustomTo}
                className={`border text-[11px] rounded-lg px-2 py-1.5 outline-none transition-colors ${
                  isDark
                    ? "bg-white/[0.08] border-white/[0.10] text-white focus:border-white/[0.25] [color-scheme:dark]"
                    : "bg-black/[0.04] border-black/[0.10] text-[#1A1A1A] focus:border-black/[0.25]"
                }`}
              />
            </div>
          )}
        </div>
      </div>

      {showHistoryHint && (
        <div
          className={`mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl border px-4 py-3 ${
            isDark
              ? "border-amber-300/20 bg-amber-500/10 text-amber-100"
              : "border-amber-300/40 bg-amber-50 text-amber-900"
          }`}
        >
          <p className="text-[12px] font-medium">{t.analytics.emptyPeriodHint}</p>
          <button
            type="button"
            onClick={() => handlePreset("all")}
            className={`self-start rounded-lg px-3 py-1.5 text-[11px] font-bold ${
              isDark ? "bg-white/15 text-white hover:bg-white/20" : "bg-amber-200/80 text-amber-950 hover:bg-amber-200"
            }`}
          >
            {t.analytics.showAllHistory}
          </button>
        </div>
      )}

      {/* ── Live KPI strip (always tenant-scoped, never mocked) ─────── */}
      <div className="mb-4 sm:mb-6">
        <LiveKpiStrip dateRange={dateRange} isDark={isDark} />
      </div>

      {/* ── Tab Content ────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-4">
          <DashboardReport dateRange={dateRange} isDark={isDark} analytics={analytics} />
        </div>
      )}
      {activeTab === "staffPerformance" && <StaffPerformanceReport dateRange={dateRange} isDark={isDark} analytics={analytics} />}
      {activeTab === "services" && <ServicesReport dateRange={dateRange} isDark={isDark} analytics={analytics} />}
      {activeTab === "productUsage" && <ProductUsageReport dateRange={dateRange} isDark={isDark} analytics={analytics} />}
      {activeTab === "sales" && <SalesReport dateRange={dateRange} isDark={isDark} analytics={analytics} />}
      {activeTab === "expenses" && <ExpensesReport dateRange={dateRange} isDark={isDark} analytics={analytics} />}
    </div>
  );

  // Gate every metric surface on CRM readiness. Until the snapshot is truthfully
  // ready, we never paint false zeros, a 100% inventory-health score, or shaped
  // sparklines derived from an empty state — only a dimensionally-stable skeleton.
  const content = (
    <CrmPageGate isDark={isDark} skeleton={<AnalyticsSkeleton isDark={isDark} embedded={embedded} />}>
      {reportContent}
    </CrmPageGate>
  );

  if (embedded) return content;

  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{ backgroundImage: "url('/salooon0000.jpg')" }}
      />
      <div className={`fixed inset-0 z-[1] backdrop-blur-[2px] ${isDark ? "bg-black/60" : "bg-[#FAFAF8]/[0.82]"}`} />
      <div className={`fixed inset-0 z-[1] ${isDark ? "bg-gradient-to-b from-black/28 via-black/8 to-black/45" : "bg-gradient-to-b from-white/20 via-transparent to-white/30"}`} />
      <main className="relative z-10 min-h-[100dvh]">{content}</main>
    </div>
  );
};

/**
 * Analytics skeleton: tab bar, KPI strip, and report body placeholders sized to
 * match the ready dashboard so gating never shifts layout.
 */
const AnalyticsSkeleton: React.FC<{ isDark: boolean; embedded: boolean }> = ({ isDark, embedded }) => (
  <div aria-hidden="true" className={embedded ? "w-full" : "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12"}>
    <div className="mb-4 sm:mb-6">
      <CrmSkeleton isDark={isDark} className="h-[52px] w-full" rounded="rounded-2xl sm:rounded-3xl" />
    </div>
    <div className="mb-4 grid grid-cols-2 gap-3 sm:mb-6 sm:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <CrmSkeleton key={index} isDark={isDark} className="h-[92px] w-full" rounded="rounded-2xl" />
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <CrmSkeleton key={index} isDark={isDark} className="h-[220px] w-full" rounded="rounded-2xl" />
      ))}
    </div>
  </div>
);

export default SalonPerformanceDashboard;
