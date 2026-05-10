import React from "react";
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import { useAIInsights } from "../../SalonCRM/data/crmHooks";
import type { AIInsight } from "../../SalonCRM/data/crmSelectors";

interface AIInsightStripProps {
  onActionClick?: (insight: AIInsight) => void;
}

/**
 * Passive AI insights strip for the home dashboard.
 *
 * Insights are derived from the canonical CRM state by `selectAIInsights`
 * and surfaced here as small chips. The strip never holds its own data
 * — when a stylist updates inventory in the Inventory tab or completes
 * an appointment in Schedule, the next render of this strip reflects
 * the change immediately.
 */
const AIInsightStrip: React.FC<AIInsightStripProps> = ({ onActionClick }) => {
  const { isDark } = useSiteTheme();
  const insights = useAIInsights();

  if (insights.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="AI insights"
      className={`rounded-2xl sm:rounded-3xl border backdrop-blur-xl px-3 sm:px-5 py-3 ${
        isDark
          ? "border-white/[0.10] bg-black/[0.40]"
          : "border-black/[0.06] bg-white/[0.75]"
      }`}
      style={{
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 4px 24px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-violet-500" />
        </div>
        <p
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            isDark ? "text-white/55" : "text-black/55"
          }`}
        >
          Spectra AI insights
        </p>
      </div>
      <div
        className="flex gap-2 sm:gap-3 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {insights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            isDark={isDark}
            onActionClick={onActionClick}
          />
        ))}
      </div>
    </section>
  );
};

const InsightCard: React.FC<{
  insight: AIInsight;
  isDark: boolean;
  onActionClick?: (insight: AIInsight) => void;
}> = ({ insight, isDark, onActionClick }) => {
  const { Icon, accent } = severityVisuals(insight.severity);
  return (
    <div
      className={`flex-shrink-0 max-w-[280px] rounded-xl border px-3 py-2.5 ${
        isDark
          ? "border-white/[0.08] bg-white/[0.04]"
          : "border-black/[0.05] bg-black/[0.02]"
      }`}
    >
      <div className="flex items-start gap-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: accent.bg, color: accent.icon }}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0">
          <p
            className={`text-[12px] font-semibold leading-tight ${
              isDark ? "text-white" : "text-[#1A1A1A]"
            }`}
          >
            {insight.title}
          </p>
          <p
            className={`text-[11px] leading-snug mt-0.5 ${
              isDark ? "text-white/55" : "text-black/55"
            }`}
          >
            {insight.description}
          </p>
          {insight.cta && (
            <button
              type="button"
              onClick={() => onActionClick?.(insight)}
              className={`mt-2 text-[11px] font-semibold ${
                isDark ? "text-white/80 hover:text-white" : "text-black/70 hover:text-black"
              }`}
            >
              {insight.cta.label} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function severityVisuals(severity: AIInsight["severity"]) {
  switch (severity) {
    case "critical":
      return {
        Icon: AlertTriangle,
        accent: { bg: "rgba(239,68,68,0.14)", icon: "#EF4444" },
      };
    case "warning":
      return {
        Icon: AlertTriangle,
        accent: { bg: "rgba(251,191,36,0.18)", icon: "#F59E0B" },
      };
    case "opportunity":
      return {
        Icon: TrendingUp,
        accent: { bg: "rgba(16,185,129,0.16)", icon: "#10B981" },
      };
    case "info":
    default:
      return {
        Icon: Lightbulb,
        accent: { bg: "rgba(59,130,246,0.14)", icon: "#3B82F6" },
      };
  }
}

export default AIInsightStrip;
