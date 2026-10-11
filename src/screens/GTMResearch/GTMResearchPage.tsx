import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Banknote,
  BarChart3,
  ChevronLeft,
  Globe,
  Moon,
  ShieldCheck,
  Sun,
  Users,
} from "lucide-react";
import { SiteThemeProvider, useSiteTheme } from "../../contexts/SiteTheme";
import dataset from "../../data/generated/gtm-research.json";
import { CohortDeepDive } from "./CohortDeepDive";
import { DataQualityPanel } from "./DataQualityPanel";
import { EditableChannelTable } from "./EditableChannelTable";
import { GeographyPanel } from "./GeographyPanel";
import { InsightsPanel } from "./InsightsPanel";
import { StrategicRevenue } from "./StrategicRevenue";
import { buildAdminTokens } from "./theme";
import type { GtmResearchDataset } from "./types";
import { ils, KpiCard, num, pct, usd } from "./ui";

const data = dataset as unknown as GtmResearchDataset;

type GtmTab = "channels" | "cohorts" | "geography" | "quality";

const TABS: { id: GtmTab; label: string; icon: typeof BarChart3 }[] = [
  { id: "channels", label: "Channels", icon: BarChart3 },
  { id: "cohorts", label: "Cohorts", icon: Users },
  { id: "geography", label: "Geography", icon: Globe },
  { id: "quality", label: "Data Quality", icon: ShieldCheck },
];

const GTMResearchInner: React.FC = () => {
  const { isDark, toggleTheme } = useSiteTheme();
  const at = buildAdminTokens(isDark);
  const [tab, setTab] = useState<GtmTab>("channels");
  const [cohortChannel, setCohortChannel] = useState<string>(
    data.highlights.highestVolume || data.channels[0]?.id || "",
  );
  const [correctedActiveTotal, setCorrectedActiveTotal] = useState<number | null>(null);

  const { totals, reportingWindow, dataQuality } = data;
  const generated = new Date(data._generated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={`min-h-[100dvh] ${at.page}`}>
      <div className={`sticky top-0 z-40 ${at.sticky} backdrop-blur-xl border-b ${at.stickyBorder}`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className={`flex-shrink-0 transition ${at.textFaint} hover:${at.textMuted}`}>
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className={`text-lg font-semibold flex items-center gap-2 ${at.textPrimary}`}>
                <BarChart3 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                GTM Research
              </h1>
              <p className={`text-xs ${at.textFaint}`}>Paid customer acquisition &amp; channel economics</p>
            </div>
          </div>

          <div className={`flex items-center gap-1 ${at.tabWrap} rounded-xl p-1 border overflow-x-auto`}>
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  tab === id ? at.tabActive : at.tabInactive
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${at.toggleBtn}`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs ${at.freshnessBg}`}>
          <span className={`inline-block w-2 h-2 rounded-full ${at.freshnessDot} animate-pulse`} />
          <span className={at.textSec}>
            Billing through {reportingWindow.latestMonth} · {num(totals.salonCustomers)} paying salons · all
            amounts ILS ex VAT
          </span>
          <span className={`ml-auto ${at.textFaint}`}>{generated}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard at={at} label="Paying salons" value={num(totals.salonCustomers)} sublabel="paid customers" icon={Users} />
          <KpiCard
            at={at}
            label="Still active"
            value={num(correctedActiveTotal ?? totals.active)}
            sublabel={
              correctedActiveTotal == null
                ? pct(totals.activeShare)
                : pct(correctedActiveTotal / totals.salonCustomers)
            }
            icon={Activity}
          />
          <KpiCard
            at={at}
            label="Salon revenue"
            value={ils(totals.salonRevenueIls)}
            sublabel={usd(totals.salonRevenueUsd)}
            icon={Banknote}
          />
          <KpiCard
            at={at}
            label="Attribution confidence"
            value={pct(dataQuality.attribution.highMediumShare, 1)}
            sublabel="high or rule-based"
            icon={ShieldCheck}
          />
        </div>

        {tab === "channels" && (
          <div className="space-y-4">
            <EditableChannelTable
              data={data}
              at={at}
              onActiveTotalChange={setCorrectedActiveTotal}
            />
            <InsightsPanel insights={data.insights} at={at} />
          </div>
        )}

        {tab === "cohorts" && (
          <CohortDeepDive
            channels={data.channels}
            cohorts={data.cohorts}
            monthlyAcquisition={data.monthlyAcquisition}
            activeChannelId={cohortChannel}
            onSelectChannel={setCohortChannel}
            at={at}
            isDark={isDark}
          />
        )}

        {tab === "geography" && (
          <GeographyPanel
            groups={data.geography.groups}
            countries={data.geography.countries}
            channels={data.channels}
            at={at}
          />
        )}

        {tab === "quality" && (
          <div className="space-y-4">
            <DataQualityPanel data={data} at={at} />
            <StrategicRevenue
              streams={data.strategicRevenue}
              totalIls={totals.strategicRevenueIls}
              at={at}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default function GTMResearchPage() {
  return (
    <SiteThemeProvider>
      <GTMResearchInner />
    </SiteThemeProvider>
  );
}
