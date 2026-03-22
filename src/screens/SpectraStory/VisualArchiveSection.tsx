import React, { useState } from "react";
import type { VisualArchiveAsset } from "../../data/milestones";
import { useSiteColors } from "../../contexts/SiteTheme";
import { VisualArchiveCard } from "./VisualArchiveCard";
import { VisualArchiveModal } from "./VisualArchiveModal";

interface VisualArchiveSectionProps {
  assets: VisualArchiveAsset[];
}

export const VisualArchiveSection: React.FC<VisualArchiveSectionProps> = ({
  assets,
}) => {
  const c = useSiteColors();
  const [selectedAsset, setSelectedAsset] = useState<VisualArchiveAsset | null>(null);

  if (assets.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4
        className="text-xs font-semibold tracking-widest"
        style={{ color: c.text.muted }}
      >
        ארכיון ויזואלי
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <VisualArchiveCard
            key={asset.id}
            asset={asset}
            onClick={() => setSelectedAsset(asset)}
          />
        ))}
      </div>

      <VisualArchiveModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />
    </div>
  );
};
