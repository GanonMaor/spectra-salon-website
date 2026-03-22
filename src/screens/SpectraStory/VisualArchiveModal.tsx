import React, { useEffect } from "react";
import type { VisualArchiveAsset } from "../../data/milestones";
import { useSiteColors } from "../../contexts/SiteTheme";

const ASSET_TYPE_LABELS: Record<string, string> = {
  sketch: "סקיצה",
  drawing: "ציור",
  scan: "סריקה",
  render: "הדמיה",
  "reference-image": "תמונת הקשר",
  diagram: "דיאגרמה",
};

interface VisualArchiveModalProps {
  asset: VisualArchiveAsset | null;
  onClose: () => void;
}

export const VisualArchiveModal: React.FC<VisualArchiveModalProps> = ({
  asset,
  onClose,
}) => {
  const c = useSiteColors();

  useEffect(() => {
    if (!asset) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [asset, onClose]);

  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        dir="rtl"
        className="relative w-full max-w-3xl mx-4 rounded-xl shadow-2xl overflow-hidden"
        style={{
          background: c.bg.page,
          border: `1px solid ${c.border.medium}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 z-10 p-2 rounded-lg transition-colors"
          style={{
            background: c.bg.card,
            color: c.text.secondary,
          }}
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Image */}
        <div className="w-full max-h-[60vh] overflow-hidden">
          <img
            src={asset.src}
            alt={asset.title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Details */}
        <div className="p-6 space-y-2">
          {/* Type + period row */}
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-md"
              style={{
                background: c.bg.cardHover,
                color: c.text.muted,
              }}
            >
              {ASSET_TYPE_LABELS[asset.assetType] || asset.assetType}
            </span>
            {asset.periodLabel && (
              <span className="text-xs" style={{ color: c.text.muted }}>
                {asset.periodLabel}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold" style={{ color: c.text.primary }}>
            {asset.title}
          </h3>
          {asset.caption && (
            <p className="text-sm leading-relaxed" style={{ color: c.text.secondary }}>
              {asset.caption}
            </p>
          )}
          {asset.note && (
            <p className="text-xs italic" style={{ color: c.text.dimmed }}>
              {asset.note}
            </p>
          )}
          {asset.attribution && (
            <p className="text-xs" style={{ color: c.text.muted }}>
              {asset.attribution}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
