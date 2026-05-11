import React from "react";
import { ChevronRight } from "lucide-react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import { useCrmLocale, useCrmT } from "../../SalonCRM/i18n/CrmLocale";
import MarketplaceCard from "./MarketplaceCard";
import {
  LAYOUT,
  textInteractive,
  textPrimary,
  textSecondary,
} from "../homeDashboardTokens";
import type { MarketplaceBanner } from "../homeDashboardData";

interface MarketplaceSectionProps {
  banners: MarketplaceBanner[];
  onSelect?: (banner: MarketplaceBanner) => void;
  onSeeAll?: () => void;
}

/**
 * Horizontal row of marketplace banners. On narrow widths we keep a
 * horizontal scroll instead of stacking, to preserve the boutique strip
 * aesthetic from the reference.
 */
const MarketplaceSection: React.FC<MarketplaceSectionProps> = ({ banners, onSelect, onSeeAll }) => {
  const { isDark } = useSiteTheme();
  const { isRTL } = useCrmLocale();
  const t = useCrmT();

  return (
    <section aria-label={t.home.marketplace} className="space-y-4 sm:space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.16em] ${textSecondary({ isDark })}`}>
            {t.home.marketplace}
          </p>
          <h2 className={`mt-1 text-[20px] font-semibold tracking-tight sm:text-[22px] ${textPrimary({ isDark })}`}>
            {t.home.marketplaceSubtitle}
          </h2>
        </div>
        <button
          type="button"
          onClick={onSeeAll}
          className={`hidden items-center gap-1 text-[12px] font-semibold sm:inline-flex ${textInteractive({ isDark })}`}
        >
          <span>{t.home.seeAll}</span>
          <ChevronRight
            className="h-4 w-4"
            style={{ transform: isRTL ? "scaleX(-1)" : undefined }}
          />
        </button>
      </div>

      <div
        className="flex gap-4 overflow-x-auto pb-2 -mx-3 sm:-mx-4 lg:-mx-8 xl:mx-0 px-3 sm:px-4 lg:px-8 xl:px-0 xl:overflow-visible snap-x snap-mandatory scroll-px-4"
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
