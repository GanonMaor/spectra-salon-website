import React from "react";
import type { Milestone } from "../../data/milestones";
import { useSiteColors } from "../../contexts/SiteTheme";

interface MilestonePreviewProps {
  milestone: Milestone;
  isExpanded: boolean;
  onToggle: () => void;
}

export const MilestonePreview: React.FC<MilestonePreviewProps> = ({
  milestone,
  isExpanded,
  onToggle,
}) => {
  const c = useSiteColors();

  return (
    <button
      onClick={onToggle}
      className="w-full text-right group transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {/* Milestone type badge */}
          <span
            className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md mb-2"
            style={{
              background: c.bg.cardHover,
              color: c.text.muted,
              border: `1px solid ${c.border.subtle}`,
            }}
          >
            {milestone.milestoneType}
          </span>
          <p
            className="text-lg sm:text-xl font-semibold leading-snug"
            style={{ color: c.text.primary }}
          >
            {milestone.title}
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: c.text.muted }}
          >
            {milestone.subtitle}
          </p>
        </div>

        {/* Expand chevron */}
        <div
          className="shrink-0 mt-1 p-1 rounded-md transition-colors"
          style={{ color: c.text.muted }}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </button>
  );
};
