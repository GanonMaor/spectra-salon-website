import React from "react";
import type { FormalDocument } from "../../data/milestones";
import { useSiteColors } from "../../contexts/SiteTheme";
import { DocumentItem } from "./DocumentItem";

interface DocumentsSectionProps {
  documents: FormalDocument[];
}

export const DocumentsSection: React.FC<DocumentsSectionProps> = ({
  documents,
}) => {
  const c = useSiteColors();

  if (documents.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4
        className="text-xs font-semibold tracking-widest"
        style={{ color: c.text.muted }}
      >
        מסמכים
      </h4>

      <div className="space-y-2">
        {documents.map((doc) => (
          <DocumentItem key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
};
