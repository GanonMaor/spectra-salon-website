import React from "react";
import type { Milestone } from "../../data/milestones";
import { useSiteColors } from "../../contexts/SiteTheme";

// Names to bold in subtitle text
const KNOWN_NAMES = [
  "מאור גנון",
  "דוד גנון",
  "עוזי עזר",
  "לוקאס",
  "מיכאל בן אבו",
  "דבורה בן אבו",
  "מיכאל ודבורה בן אבו",
  "אלעד גוטליב",
  "גיא זקס",
  "אלירן בינמן",
  "גיא זקס ואלירן בינמן",
  "נמרוד וורמן",
  "פרנק אבו",
  "ג׳ואן בן אמיתי",
  "דני מיכאלי",
];

function renderSubtitle(
  text: string,
  primaryColor: string,
  secondaryColor: string,
  accentColor: string,
): React.ReactNode {
  // Build a regex that matches any known name
  const escaped = KNOWN_NAMES.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "g");

  const parts = text.split(pattern);
  const nameSet = new Set(KNOWN_NAMES);

  return parts.map((part, i) =>
    nameSet.has(part) ? (
      <span key={i} className="font-semibold" style={{ color: primaryColor }}>
        {part}
      </span>
    ) : (
      <span key={i} style={{ color: secondaryColor }}>
        {part}
      </span>
    ),
  );
}

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
  const accentColor = isDark ? "rgba(234,183,118,0.80)" : "rgba(140,90,20,0.75)";

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: isDark
          ? "rgba(255,255,255,0.04)"
          : "rgba(255,255,255,0.72)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px solid rgba(0,0,0,0.07)",
        boxShadow: isDark
          ? "0 2px 12px rgba(0,0,0,0.30)"
          : "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <button
        onClick={hasExpandableContent ? onToggle : undefined}
        className="w-full text-right p-3 sm:p-4"
        style={{ cursor: hasExpandableContent ? "pointer" : "default" }}
      >
        <p
          className="text-xs font-semibold mb-1"
          style={{ color: accentColor }}
        >
          {milestone.title}
        </p>
        <p className="text-sm leading-relaxed">
          {renderSubtitle(
            milestone.subtitle,
            c.text.primary,
            c.text.secondary,
            accentColor,
          )}
        </p>

        {hasExpandableContent && (
          <div className="flex items-center gap-1 mt-2" style={{ color: c.text.muted }}>
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-[11px]">{isExpanded ? "הסתר" : "פרטים"}</span>
          </div>
        )}
      </button>
    </div>
  );
};
