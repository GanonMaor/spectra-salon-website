import React from "react";
import type { Milestone } from "../../data/milestones";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { MilestoneCard } from "./MilestoneCard";
import { MilestoneExpanded } from "./MilestoneExpanded";

interface TimelineItemProps {
  milestone: Milestone;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  milestone,
  index,
  isExpanded,
  onToggle,
}) => {
  const { isDark } = useSiteTheme();

  const isRightSide = index % 2 === 0;
  const dotColor = isDark ? "rgba(234,183,118,0.55)" : "rgba(180,130,60,0.60)";

  const hasExpandableContent =
    milestone.visualArchiveAssets.length > 0 ||
    milestone.formalDocuments.length > 0;

  return (
    <div className="relative mb-4 sm:mb-5 lg:mb-6">
      {/* Mobile layout (single column) */}
      <div className="flex gap-3 md:hidden">
        {/* Spine */}
        <div className="flex flex-col items-center shrink-0 pt-1.5">
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{
              background: dotColor,
              outline: `2px solid ${isDark ? "#0c0d13" : "#f5f3ef"}`,
              outlineOffset: "1px",
            }}
          />
          <div
            className="w-px flex-1 mt-1.5"
            style={{
              background: isDark
                ? "linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0.02))"
                : "linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.03))",
            }}
          />
        </div>

        {/* Card */}
        <div className="flex-1 min-w-0 pb-1">
          {milestone.date && <DateLabel date={milestone.date} isDark={isDark} />}
          <ShortTitle text={milestone.shortTitle} isDark={isDark} />
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

      {/* Desktop layout (alternating) */}
      <div className="hidden md:flex items-start gap-0">
        {isRightSide ? (
          <>
            <div className="flex-1 pl-5 min-w-0">
              {milestone.date && <DateLabel date={milestone.date} isDark={isDark} />}
              <ShortTitle text={milestone.shortTitle} isDark={isDark} />
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
            <SpineColumn dotColor={dotColor} isDark={isDark} />
            <div className="flex-1" />
          </>
        ) : (
          <>
            <div className="flex-1" />
            <SpineColumn dotColor={dotColor} isDark={isDark} />
            <div className="flex-1 pr-5 min-w-0">
              {milestone.date && <DateLabel date={milestone.date} isDark={isDark} />}
              <ShortTitle text={milestone.shortTitle} isDark={isDark} />
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

function ShortTitle({ text, isDark }: { text: string; isDark: boolean }) {
  if (!text) return null;
  return (
    <p
      className="text-base sm:text-lg font-semibold leading-snug tracking-tight mb-1.5"
      style={{
        color: isDark ? "rgba(255,255,255,0.80)" : "rgba(30,30,30,0.85)",
      }}
    >
      {text}
    </p>
  );
}

function DateLabel({ date, isDark }: { date: string; isDark: boolean }) {
  return (
    <p
      className="text-sm sm:text-base font-bold leading-none tracking-tight mb-1.5"
      style={{
        color: isDark ? "rgba(234,183,118,0.65)" : "rgba(140,90,20,0.70)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {date}
    </p>
  );
}

function SpineColumn({ dotColor, isDark }: { dotColor: string; isDark: boolean }) {
  return (
    <div className="flex flex-col items-center w-10 shrink-0">
      <div
        className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 z-10"
        style={{
          background: dotColor,
          outline: `2px solid ${isDark ? "#0c0d13" : "#f5f3ef"}`,
          outlineOffset: "1px",
        }}
      />
      <div
        className="w-px flex-1 mt-1.5"
        style={{
          background: isDark
            ? "linear-gradient(to bottom, rgba(255,255,255,0.07), rgba(255,255,255,0.02))"
            : "linear-gradient(to bottom, rgba(0,0,0,0.08), rgba(0,0,0,0.03))",
          minHeight: "24px",
        }}
      />
    </div>
  );
}
