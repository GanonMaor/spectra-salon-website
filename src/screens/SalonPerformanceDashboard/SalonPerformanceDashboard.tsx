import React, { useState } from "react";
import { LayoutDashboard, Users, Package, Scissors, CalendarDays } from "lucide-react";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useCrmT } from "../SalonCRM/i18n/CrmLocale";
import DashboardReport from "./reports/DashboardReport";
import StaffPerformanceReport from "./reports/StaffPerformanceReport";
import ProductUsageReport from "./reports/ProductUsageReport";
import ServicesReport from "./reports/ServicesReport";
import { DateRange, DatePreset, getDefaultRange, rangeFromPreset } from "./reports/AnalyticsMockData";

// ── Analytics tab definitions ───────────────────────────────────────

type AnalyticsTab = "dashboard" | "staffPerformance" | "services" | "productUsage";

// Note: ANALYTICS_TABS and DATE_PRESETS are built inside the component to use live translations.
// These static arrays remain only for type reference.
const ANALYTICS_TAB_IDS: AnalyticsTab[] = ["dashboard", "staffPerformance", "services", "productUsage"];
const DATE_PRESET_IDS: DatePreset[] = ["today", "week", "month", "year", "custom"];

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Main Component ──────────────────────────────────────────────────

const SalonPerformanceDashboard: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const { isDark } = useSiteTheme();
  const t = useCrmT();
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("dashboard");
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange);

  const handlePreset = (preset: DatePreset) => {
    if (preset === "custom") {
      setDateRange(prev => ({ ...prev, preset: "custom" }));
    } else {
      setDateRange(rangeFromPreset(preset));
    }
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
    { id: "staffPerformance", label: t.analytics.tabStaff,     icon: Users },
    { id: "services",         label: t.analytics.tabServices,  icon: Scissors },
    { id: "productUsage",     label: t.analytics.tabProducts,  icon: Package },
  ];

  const DATE_PRESETS: { id: DatePreset; label: string }[] = [
    { id: "today",  label: t.analytics.presetToday  },
    { id: "week",   label: t.analytics.presetWeek   },
    { id: "month",  label: t.analytics.presetMonth  },
    { id: "year",   label: t.analytics.presetYear   },
    { id: "custom", label: t.analytics.presetCustom },
  ];

  const content = (
    <div className={embedded ? "w-full" : "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12"}>
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
                    ? isDark
                      ? "bg-white/[0.14] text-white shadow-sm"
                      : "bg-black/[0.08] text-[#1A1A1A] shadow-sm"
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

        {/* Custom date inputs */}
        {dateRange.preset === "custom" && (
          <div className={`flex items-center gap-2 pt-2 pb-1 border-t mt-2 ${
            isDark ? "border-white/[0.06]" : "border-black/[0.06]"
          }`}>
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

      {/* ── Tab Content ────────────────────────────────── */}
      {activeTab === "dashboard" && <DashboardReport dateRange={dateRange} isDark={isDark} />}
      {activeTab === "staffPerformance" && <StaffPerformanceReport dateRange={dateRange} isDark={isDark} />}
      {activeTab === "services" && <ServicesReport dateRange={dateRange} isDark={isDark} />}
      {activeTab === "productUsage" && <ProductUsageReport dateRange={dateRange} isDark={isDark} />}
    </div>
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

export default SalonPerformanceDashboard;
