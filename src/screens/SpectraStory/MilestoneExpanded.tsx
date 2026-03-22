import React from "react";
import type { Milestone } from "../../data/milestones";
import { useSiteColors, useSiteTheme } from "../../contexts/SiteTheme";
import { StorySection } from "./StorySection";
import { VisualArchiveSection } from "./VisualArchiveSection";
import { DocumentsSection } from "./DocumentsSection";

interface MilestoneExpandedProps {
  milestone: Milestone;
}

export const MilestoneExpanded: React.FC<MilestoneExpandedProps> = ({
  milestone,
}) => {
  const c = useSiteColors();
  const { isDark } = useSiteTheme();

  const hasStory = milestone.storyBlocks.length > 0;
  const hasArchive = milestone.visualArchiveAssets.length > 0;
  const hasDocs = milestone.formalDocuments.length > 0;

  if (!hasStory && !hasArchive && !hasDocs) return null;

  return (
    <div
      className="mt-2 rounded-2xl overflow-hidden"
      style={{
        background: isDark
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.60)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px solid rgba(0,0,0,0.06)",
        boxShadow: isDark
          ? "0 2px 16px rgba(0,0,0,0.30)"
          : "0 2px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div className="p-4 sm:p-5 space-y-6">
        {hasStory && <StorySection blocks={milestone.storyBlocks} />}
        {hasArchive && <VisualArchiveSection assets={milestone.visualArchiveAssets} />}
        {hasDocs && <DocumentsSection documents={milestone.formalDocuments} />}
      </div>
    </div>
  );
};
