import React from "react";
import {
  MARKET_CORAL,
  MARKET_CORAL_HOT,
  MARKET_SALON_PHOTO,
  MarketFieldSlide,
  type MarketFieldSpec,
} from "./MarketFieldSystem";

const SPEC: MarketFieldSpec = {
  id: "web-deck-market-salon",
  className: "web-deck-market-salon",
  image: MARKET_SALON_PHOTO,
  imagePosition: "48% 42%",
  accent: MARKET_CORAL,
  accentHot: MARKET_CORAL_HOT,
  kicker: { en: "The salon economy", he: "כלכלת הסלון" },
  hero: "$264.9B",
  heroLabel: { en: "Global salon services · 2025", he: "שירותי סלון בעולם · 2025" },
  forecastValue: "$522.6B",
  forecastWhen: { en: "by 2034", he: "עד 2034" },
  cagr: "7.9% CAGR",
  nested: "$203.8B",
  nestedLabel: { en: "Salon hair services", he: "שירותי שיער בסלונים" },
  share: { en: "77% of the broader market", he: "77% מהשוק הרחב" },
  sharePercent: 77,
  footnote: {
    en: "Hair color is the fastest-growing service category.",
    he: "צבע שיער הוא קטגוריית השירות הצומחת ביותר.",
  },
  index: { en: "02 — The market", he: "02 — השוק" },
};

export const MarketSalonWebSlide: React.FC<{ lang: "en" | "he" }> = ({ lang }) => (
  <MarketFieldSlide lang={lang} spec={SPEC} />
);
