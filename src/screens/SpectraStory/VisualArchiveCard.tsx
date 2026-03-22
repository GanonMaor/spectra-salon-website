import React from "react";
import type { VisualArchiveAsset } from "../../data/milestones";
import { useSiteColors } from "../../contexts/SiteTheme";

const ASSET_TYPE_LABELS: Record<string, string> = {
  sketch: "סקיצה",
  drawing: "ציור",
  scan: "סריקה",
  render: "הדמיה",
  "reference-image": "הקשר",
  diagram: "דיאגרמה",
};

interface VisualArchiveCardProps {
  asset: VisualArchiveAsset;
  onClick: () => void;
}

export const VisualArchiveCard: React.FC<VisualArchiveCardProps> = ({
  asset,
  onClick,
}) => {
  const c = useSiteColors();

  return (
    <button
      onClick={onClick}
      className="text-right rounded-xl overflow-hidden transition-all duration-300 group w-full"
      style={{
        background: c.bg.card,
        border: `1px solid ${c.border.card}`,
      }}
    >
      <div className="aspect-[4/3] overflow-hidden relative">
        <img
          src={asset.thumbnailSrc || asset.src}
          alt={asset.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {/* Asset type badge */}
        <span
          className="absolute top-2 right-2 text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-md"
          style={{
            background: c.bg.overlay,
            color: "rgba(255,255,255,0.85)",
          }}
        >
          {ASSET_TYPE_LABELS[asset.assetType] || asset.assetType}
        </span>
      </div>
      <div className="p-3 space-y-1">
        <p
          className="text-sm font-medium leading-snug"
          style={{ color: c.text.primary }}
        >
          {asset.title}
        </p>
        {asset.periodLabel && (
          <p className="text-xs" style={{ color: c.text.muted }}>
            {asset.periodLabel}
          </p>
        )}
        {asset.note && (
          <p
            className="text-xs italic leading-snug"
            style={{ color: c.text.dimmed }}
          >
            {asset.note}
          </p>
        )}
      </div>
    </button>
  );
};
