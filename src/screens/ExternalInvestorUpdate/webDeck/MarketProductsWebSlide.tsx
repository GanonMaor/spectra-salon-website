import React from "react";
import {
  MARKET_GOLD,
  MARKET_GOLD_HOT,
  MARKET_SUPPLIER_PHOTO,
  MarketFieldSlide,
  type MarketFieldSpec,
} from "./MarketFieldSystem";

const SPEC: MarketFieldSpec = {
  id: "web-deck-market-products",
  className: "web-deck-market-products",
  image: MARKET_SUPPLIER_PHOTO,
  imagePosition: "center 42%",
  accent: MARKET_GOLD,
  accentHot: MARKET_GOLD_HOT,
  kicker: { en: "Brands & suppliers", he: "מותגים וספקים" },
  hero: "$128.6B",
  heroLabel: {
    en: "Salon-grade beauty & personal care products · 2025",
    he: "מוצרי יופי וטיפוח מקצועיים לסלונים · 2025",
  },
  forecastValue: "$222.3B",
  forecastWhen: { en: "by 2033", he: "עד 2033" },
  cagr: "7.1% CAGR",
  nested: "$54.2B",
  nestedLabel: { en: "Hair care products", he: "מוצרי טיפוח לשיער" },
  share: { en: "42.1% of the broader market", he: "42.1% מהשוק הרחב" },
  sharePercent: 42.1,
  footnote: {
    en: "Independent salons are the largest salon-type segment: 41.8%.",
    he: "סלונים עצמאיים הם פלח הסלונים הגדול ביותר: 41.8%.",
  },
  index: { en: "03 — The market", he: "03 — השוק" },
  leaders: true,
};

export const MarketProductsWebSlide: React.FC<{ lang: "en" | "he" }> = ({ lang }) => (
  <MarketFieldSlide lang={lang} spec={SPEC} />
);
