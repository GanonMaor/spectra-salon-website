import React from "react";
import MarketplaceCard from "./MarketplaceCard";
import { LAYOUT } from "../homeDashboardTokens";
import type { MarketplaceBanner } from "../homeDashboardData";

interface MarketplaceSectionProps {
  banners: MarketplaceBanner[];
  onSelect?: (banner: MarketplaceBanner) => void;
}

/**
 * Horizontal row of marketplace banners. On narrow widths we keep a
 * horizontal scroll instead of stacking, to preserve the boutique strip
 * aesthetic from the reference.
 */
const MarketplaceSection: React.FC<MarketplaceSectionProps> = ({ banners, onSelect }) => {
  return (
    <section aria-label="Marketplace and Education">
      <div
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 -mx-3 sm:-mx-4 lg:-mx-8 xl:mx-0 px-3 sm:px-4 lg:px-8 xl:px-0 xl:overflow-visible snap-x snap-mandatory scroll-px-4"
        style={{ scrollbarWidth: "none" }}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={`snap-start flex-shrink-0 ${LAYOUT.marketplaceItemWidth} xl:min-w-0`}
          >
            <MarketplaceCard banner={banner} onSelect={() => onSelect?.(banner)} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default MarketplaceSection;
