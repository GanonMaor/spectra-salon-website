import React from "react";
import type { Milestone } from "../../data/milestones";
import { useSiteColors } from "../../contexts/SiteTheme";
import { PersonRow } from "./PersonRow";

const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  "קונספט":     { bg: "rgba(99,180,140,0.12)",  text: "rgba(99,200,150,0.90)",  border: "rgba(99,180,140,0.22)"  },
  "השקעה":      { bg: "rgba(234,183,118,0.12)", text: "rgba(234,183,118,0.90)", border: "rgba(234,183,118,0.22)" },
  "שותפות":     { bg: "rgba(147,180,234,0.12)", text: "rgba(150,185,240,0.90)", border: "rgba(147,180,234,0.22)" },
  "משפטי":      { bg: "rgba(200,130,120,0.12)", text: "rgba(210,140,130,0.90)", border: "rgba(200,130,120,0.22)" },
  "צוות":       { bg: "rgba(170,150,220,0.12)", text: "rgba(175,155,225,0.90)", border: "rgba(170,150,220,0.22)" },
  "פיתוח עסקי": { bg: "rgba(120,200,200,0.12)", text: "rgba(120,210,210,0.90)", border: "rgba(120,200,200,0.22)" },
};

const DEFAULT_BADGE = { bg: "rgba(180,140,80,0.12)", text: "rgba(180,140,80,0.90)", border: "rgba(180,140,80,0.22)" };

interface MilestoneCardProps {
  milestone: Milestone;
  isDark: boolean;
  isExpanded: boolean;
  hasExpandableContent: boolean;
  onToggle: () => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  isDark,
  isExpanded,
  hasExpandableContent,
  onToggle,
}) => {
  const c = useSiteColors();
  const badge = BADGE_STYLES[milestone.milestoneType] ?? DEFAULT_BADGE;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        background: isDark
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.78)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.09)"
          : "1px solid rgba(0,0,0,0.08)",
        boxShadow: isDark
          ? "0 4px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.06)"
          : "0 4px 20px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.90)",
      }}
    >
      <div className="p-4 sm:p-5 space-y-3">
        {/* Badge + title row */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <span
              className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md tracking-wide"
              style={{
                background: badge.bg,
                color: badge.text,
                border: `1px solid ${badge.border}`,
              }}
            >
              {milestone.milestoneType}
            </span>
            <h3
              className="text-base sm:text-lg font-bold leading-snug"
              style={{ color: c.text.primary }}
            >
              {milestone.title}
            </h3>
          </div>
        </div>

        {/* People row */}
        {milestone.people.length > 0 && (
          <div
            className="rounded-xl px-3 py-2"
            style={{
              background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
              border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <PersonRow people={milestone.people} />
          </div>
        )}

        {/* Summary bullets */}
        {milestone.summaryBullets.length > 0 && (
          <ul className="space-y-1.5">
            {milestone.summaryBullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="mt-[7px] w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: isDark ? "rgba(234,183,118,0.40)" : "rgba(180,130,60,0.50)",
                  }}
                />
                <span
                  className="text-sm leading-relaxed"
                  style={{ color: c.text.secondary }}
                >
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Outcome line */}
        {milestone.outcome && (
          <div
            className="flex items-start gap-2 rounded-xl px-3 py-2.5"
            style={{
              background: isDark ? "rgba(234,183,118,0.06)" : "rgba(180,130,60,0.06)",
              border: isDark ? "1px solid rgba(234,183,118,0.12)" : "1px solid rgba(180,130,60,0.14)",
            }}
          >
            <span
              className="text-[11px] font-semibold shrink-0 mt-0.5"
              style={{ color: isDark ? "rgba(234,183,118,0.65)" : "rgba(140,90,20,0.75)" }}
            >
              תוצאה:
            </span>
            <span
              className="text-sm leading-relaxed"
              style={{ color: isDark ? "rgba(234,183,118,0.85)" : "rgba(120,80,20,0.90)" }}
            >
              {milestone.outcome}
            </span>
          </div>
        )}

        {/* Expand/collapse toggle for archive/story/docs */}
        {hasExpandableContent && (
          <button
            onClick={onToggle}
            className="flex items-center gap-1.5 text-xs font-medium mt-1 min-h-[36px] transition-opacity active:opacity-60 hover:opacity-80"
            style={{ color: c.text.muted }}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{isExpanded ? "הסתר פרטים" : "פרטים נוספים"}</span>
          </button>
        )}
      </div>
    </div>
  );
};
