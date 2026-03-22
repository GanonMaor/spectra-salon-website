import React from "react";
import type { Milestone } from "../../data/milestones";
import { useSiteColors, useSiteTheme } from "../../contexts/SiteTheme";
import { MilestoneCard } from "./MilestoneCard";
import { MilestoneExpanded } from "./MilestoneExpanded";

interface TimelineItemProps {
  milestone: Milestone;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const MILESTONE_TYPE_COLORS: Record<string, string> = {
  "קונספט":      "rgba(99,  180, 140, 0.75)",
  "השקעה":       "rgba(234, 183, 118, 0.80)",
  "שותפות":      "rgba(147, 180, 234, 0.75)",
  "משפטי":       "rgba(200, 130, 120, 0.75)",
  "צוות":        "rgba(170, 150, 220, 0.75)",
  "פיתוח עסקי":  "rgba(120, 200, 200, 0.75)",
};

export const TimelineItem: React.FC<TimelineItemProps> = ({
  milestone,
  index,
  isExpanded,
  onToggle,
}) => {
  const c = useSiteColors();
  const { isDark } = useSiteTheme();

  // In RTL, index 0 card appears on the RIGHT (start) side
  // Using flex: first child = right, last child = left in RTL flex-row
  const isRightSide = index % 2 === 0;

  const dotColor = MILESTONE_TYPE_COLORS[milestone.milestoneType] ?? "rgba(180,140,80,0.70)";

  const hasExpandableContent =
    milestone.storyBlocks.length > 0 ||
    milestone.visualArchiveAssets.length > 0 ||
    milestone.formalDocuments.length > 0;

  return (
    <div className="relative mb-6 sm:mb-8 lg:mb-10">
      {/* ── Mobile layout (single column) ── */}
      <div className="flex gap-4 md:hidden">
        {/* Spine column */}
        <div className="flex flex-col items-center shrink-0 pt-2">
          {/* Dot */}
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              background: dotColor,
              boxShadow: `0 0 8px ${dotColor}`,
              outline: `2px solid ${isDark ? "#0c0d13" : "#f5f3ef"}`,
              outlineOffset: "2px",
            }}
          />
          {/* Line */}
          <div
            className="w-px flex-1 mt-2"
            style={{
              background: isDark
                ? "linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0.03))"
                : "linear-gradient(to bottom, rgba(0,0,0,0.10), rgba(0,0,0,0.04))",
            }}
          />
        </div>

        {/* Card */}
        <div className="flex-1 min-w-0 pb-2">
          <DateLabel date={milestone.date} isDark={isDark} />
          <MilestoneCard
            milestone={milestone}
            isDark={isDark}
            isExpanded={isExpanded}
            hasExpandableContent={hasExpandableContent}
            onToggle={onToggle}
          />
          {isExpanded && hasExpandableContent && (
            <MilestoneExpanded milestone={milestone} />
          )}
        </div>
      </div>

      {/* ── Desktop layout (alternating two-column) ── */}
      <div className="hidden md:flex items-start gap-0">
        {isRightSide ? (
          <>
            {/* Right side card (first in RTL flex = visual right) */}
            <div className="flex-1 pl-6 min-w-0">
              <DateLabel date={milestone.date} isDark={isDark} />
              <MilestoneCard
                milestone={milestone}
                isDark={isDark}
                isExpanded={isExpanded}
                hasExpandableContent={hasExpandableContent}
                onToggle={onToggle}
              />
              {isExpanded && hasExpandableContent && (
                <MilestoneExpanded milestone={milestone} />
              )}
            </div>

            {/* Center dot column */}
            <SpineColumn dotColor={dotColor} isDark={isDark} />

            {/* Left side — empty spacer */}
            <div className="flex-1" />
          </>
        ) : (
          <>
            {/* Right side — empty spacer */}
            <div className="flex-1" />

            {/* Center dot column */}
            <SpineColumn dotColor={dotColor} isDark={isDark} />

            {/* Left side card (last in RTL flex = visual left) */}
            <div className="flex-1 pr-6 min-w-0">
              <DateLabel date={milestone.date} isDark={isDark} />
              <MilestoneCard
                milestone={milestone}
                isDark={isDark}
                isExpanded={isExpanded}
                hasExpandableContent={hasExpandableContent}
                onToggle={onToggle}
              />
              {isExpanded && hasExpandableContent && (
                <MilestoneExpanded milestone={milestone} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ── Sub-components ── */

function DateLabel({ date, isDark }: { date: string; isDark: boolean }) {
  return (
    <p
      className="text-xl sm:text-2xl font-bold leading-none tracking-tight mb-2"
      style={{
        color: isDark ? "rgba(234,183,118,0.75)" : "rgba(140,90,20,0.80)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {date}
    </p>
  );
}

function SpineColumn({
  dotColor,
  isDark,
}: {
  dotColor: string;
  isDark: boolean;
}) {
  return (
    <div className="flex flex-col items-center w-12 shrink-0">
      {/* Dot */}
      <div
        className="w-3 h-3 rounded-full mt-1.5 shrink-0 z-10"
        style={{
          background: dotColor,
          boxShadow: `0 0 10px ${dotColor}, 0 0 20px ${dotColor}40`,
          outline: `2px solid ${isDark ? "#0c0d13" : "#f5f3ef"}`,
          outlineOffset: "2px",
        }}
      />
      {/* Vertical line */}
      <div
        className="w-px flex-1 mt-2"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(255,255,255,0.03))"
            : "linear-gradient(to bottom, rgba(0,0,0,0.12), rgba(0,0,0,0.04))",
          minHeight: "40px",
        }}
      />
    </div>
  );
}
