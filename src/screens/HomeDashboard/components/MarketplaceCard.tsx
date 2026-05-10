import React from "react";
import { ArrowRight } from "lucide-react";
import { useCrmLocale } from "../../SalonCRM/i18n/CrmLocale";
import {
  LAYOUT,
  MARKETPLACE_BANNER,
  SHADOW_SOFT,
} from "../homeDashboardTokens";
import type { MarketplaceBanner } from "../homeDashboardData";

interface MarketplaceCardProps {
  banner: MarketplaceBanner;
  onSelect?: () => void;
}

/**
 * Promotional banner card. Visual style mimics the brand-rich cards from
 * the reference (ACCESS, Serie Expert, Metal Detox) using gradient
 * backgrounds — no external imagery is loaded so the static page is
 * always self-contained.
 */
const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ banner, onSelect }) => {
  const palette = MARKETPLACE_BANNER[banner.variant];
  const { isRTL } = useCrmLocale();

  return (
    <article
      className={`relative w-full ${LAYOUT.marketplaceCardHeight} ${LAYOUT.cardRadius} overflow-hidden ${SHADOW_SOFT} group`}
      style={{
        background: palette.bg,
        color: palette.text,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative z-10 h-full p-5 sm:p-6 flex flex-col justify-between">
        <div className="space-y-2">
          {banner.eyebrow && (
            <span
              className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-md"
              style={{
                color: palette.eyebrow,
                background: palette.accent,
              }}
            >
              {banner.eyebrow}
            </span>
          )}
          {banner.brandLine && (
            <p
              className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.32em] opacity-80"
              style={{ color: palette.text }}
            >
              {banner.brandLine}
            </p>
          )}
          <h3
            className="text-[20px] sm:text-[22px] lg:text-[24px] font-semibold leading-tight tracking-tight"
            style={{ color: palette.text }}
          >
            {banner.title}
          </h3>
          {banner.subtitle && (
            <p
              className="text-[13px] sm:text-[14px] leading-snug max-w-[26ch]"
              style={{ color: palette.text, opacity: 0.78 }}
            >
              {banner.subtitle}
            </p>
          )}
        </div>

        <div className={`flex ${isRTL ? "justify-start" : "justify-start"}`}>
          <button
            type="button"
            aria-label={banner.ctaLabel}
            title={banner.ctaLabel}
            onClick={onSelect}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "#1A1A1A",
            }}
          >
            <ArrowRight
              className="w-[18px] h-[18px]"
              style={{ transform: isRTL ? "scaleX(-1)" : undefined }}
            />
          </button>
        </div>
      </div>
    </article>
  );
};

export default MarketplaceCard;
