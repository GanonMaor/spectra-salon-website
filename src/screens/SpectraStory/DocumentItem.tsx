import React from "react";
import type { FormalDocument, DocumentAccessState } from "../../data/milestones";
import { useSiteColors } from "../../contexts/SiteTheme";

const ACCESS_LABELS: Record<DocumentAccessState, string> = {
  restricted: "מוגבל",
  "metadata-only": "מטא-דאטה בלבד",
  "available-soon": "זמין בקרוב",
};

interface DocumentItemProps {
  document: FormalDocument;
}

export const DocumentItem: React.FC<DocumentItemProps> = ({ document: doc }) => {
  const c = useSiteColors();

  return (
    <div
      className="rounded-lg px-4 py-3 transition-all duration-200 space-y-2"
      style={{
        background: c.bg.card,
        border: `1px solid ${c.border.subtle}`,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Document icon */}
          <div
            className="shrink-0 w-8 h-8 rounded-md flex items-center justify-center"
            style={{ background: c.bg.cardHover }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: c.text.muted }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <div className="min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: c.text.primary }}
            >
              {doc.title}
            </p>
            <p className="text-xs" style={{ color: c.text.muted }}>
              {doc.documentType} · {doc.dateLabel}
            </p>
          </div>
        </div>

        {/* Access state badge */}
        <span
          className="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full mr-3"
          style={{
            background: c.bg.cardHover,
            color: c.text.muted,
            border: `1px solid ${c.border.subtle}`,
          }}
        >
          {ACCESS_LABELS[doc.accessState]}
        </span>
      </div>

      {/* Summary */}
      {doc.summary && (
        <p
          className="text-xs leading-relaxed pr-11"
          style={{ color: c.text.dimmed }}
        >
          {doc.summary}
        </p>
      )}

      {/* Visibility note */}
      {doc.visibilityNote && (
        <p
          className="text-[11px] italic pr-11"
          style={{ color: c.text.faint }}
        >
          {doc.visibilityNote}
        </p>
      )}
    </div>
  );
};
