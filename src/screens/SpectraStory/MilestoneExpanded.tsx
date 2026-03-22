import React from "react";
import type { Milestone } from "../../data/milestones";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { VisualArchiveSection } from "./VisualArchiveSection";
import { DocumentsSection } from "./DocumentsSection";

interface MilestoneExpandedProps {
  milestone: Milestone;
}

export const MilestoneExpanded: React.FC<MilestoneExpandedProps> = ({
  milestone,
}) => {
  const { isDark } = useSiteTheme();

  const hasArchive = milestone.visualArchiveAssets.length > 0;
  const hasDocs = milestone.formalDocuments.length > 0;

  if (!hasArchive && !hasDocs) return null;

  return (
    <div
      className="mt-1.5 rounded-xl overflow-hidden"
      style={{
        background: isDark
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.55)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.06)"
          : "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <div className="p-3 sm:p-4 space-y-4">
        {hasArchive && <VisualArchiveSection assets={milestone.visualArchiveAssets} />}
        {hasDocs && <DocumentsSection documents={milestone.formalDocuments} />}
      </div>
    </div>
  );
};
