import React, { useState } from "react";
import { LayoutDashboard, Users, Package, Scissors, CalendarDays } from "lucide-react";
import DashboardReport from "./reports/DashboardReport";
import StaffPerformanceReport from "./reports/StaffPerformanceReport";
import ProductUsageReport from "./reports/ProductUsageReport";
import ServicesReport from "./reports/ServicesReport";
import { DateRange, DatePreset, getDefaultRange, rangeFromPreset } from "./reports/AnalyticsMockData";

// ── Analytics tab definitions ───────────────────────────────────────

type AnalyticsTab = "dashboard" | "staffPerformance" | "services" | "productUsage";

const ANALYTICS_TABS: { id: AnalyticsTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: "dashboard",        label: "Dashboard",         icon: LayoutDashboard },
  { id: "staffPerformance", label: "Staff Performance", icon: Users },
  { id: "services",         label: "Services",          icon: Scissors },
  { id: "productUsage",     label: "Product Usage",     icon: Package },
];

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week",  label: "Week" },
  { id: "month", label: "Month" },
  { id: "year",  label: "Year" },
  { id: "custom", label: "Custom" },
];

function toInputDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ── Main Component ──────────────────────────────────────────────────

const SalonPerformanceDashboard: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
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

  const content = (
    <div className={embedded ? "w-full" : "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12"}>
      {/* ── Tab Bar + Date Selector ──────────────────── */}
      <div
        className="rounded-2xl sm:rounded-3xl border border-white/[0.12] bg-black/[0.30] backdrop-blur-xl px-2 sm:px-4 py-2 mb-4 sm:mb-6"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.04)" }}
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
                    ? "bg-white/[0.14] text-white shadow-sm"
                    : "text-white/45 hover:text-white/70 hover:bg-white/[0.06]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <CalendarDays className="w-3.5 h-3.5 text-white/30 hidden sm:block" />
            {DATE_PRESETS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handlePreset(id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap ${
                  dateRange.preset === id
                    ? "bg-white/[0.14] text-white"
                    : "text-white/35 hover:text-white/60 hover:bg-white/[0.06]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom date inputs */}
        {dateRange.preset === "custom" && (
          <div className="flex items-center gap-2 pt-2 pb-1 border-t border-white/[0.06] mt-2">
            <span className="text-[10px] text-white/30 font-medium">From</span>
            <input
              type="date"
              value={toInputDate(dateRange.from)}
              onChange={handleCustomFrom}
              className="bg-white/[0.08] border border-white/[0.10] text-white text-[11px] rounded-lg px-2 py-1.5 outline-none focus:border-white/[0.25] transition-colors [color-scheme:dark]"
            />
            <span className="text-[10px] text-white/30 font-medium">To</span>
            <input
              type="date"
              value={toInputDate(dateRange.to)}
              onChange={handleCustomTo}
              className="bg-white/[0.08] border border-white/[0.10] text-white text-[11px] rounded-lg px-2 py-1.5 outline-none focus:border-white/[0.25] transition-colors [color-scheme:dark]"
            />
          </div>
        )}
      </div>

      {/* ── Tab Content ────────────────────────────────── */}
      {activeTab === "dashboard" && <DashboardReport dateRange={dateRange} />}
      {activeTab === "staffPerformance" && <StaffPerformanceReport dateRange={dateRange} />}
      {activeTab === "services" && <ServicesReport dateRange={dateRange} />}
      {activeTab === "productUsage" && <ProductUsageReport dateRange={dateRange} />}
    </div>
  );

  if (embedded) return content;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat will-change-transform"
        style={{ backgroundImage: "url('/salooon0000.jpg')" }}
      />
      <div className="fixed inset-0 z-[1] bg-black/60 backdrop-blur-[2px]" />
      <div className="fixed inset-0 z-[1] bg-gradient-to-b from-black/28 via-black/8 to-black/45" />
      <main className="relative z-10 min-h-screen">{content}</main>
    </div>
  );
};

export default SalonPerformanceDashboard;
