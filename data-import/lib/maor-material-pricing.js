/**
 * Salon material-cost rates for Maor Ganon historical usage backfill.
 *
 * Rates (ILS):
 * - Developer / oxidant: ₪30 / liter → ₪0.03 / g (1g ≈ 1ml)
 * - Bleach / lightener (הבהרה): ₪100 / 400g → ₪0.25 / g
 * - Color cream (צבע): ≈ ₪25 / 60g → ₪0.4167 / g
 * - Straightening washes & treatments: ₪1200 / liter → ₪1.20 / g
 */

"use strict";

const DEVELOPER_ILS_PER_LITER = 30;
const BLEACH_ILS_PER_400G = 100;
const COLOR_ILS_PER_60G = 25;
const TREATMENT_ILS_PER_LITER = 1200;

const DEVELOPER_PER_GRAM = DEVELOPER_ILS_PER_LITER / 1000;
const BLEACH_PER_GRAM = BLEACH_ILS_PER_400G / 400;
const COLOR_PER_GRAM = COLOR_ILS_PER_60G / 60;
const TREATMENT_PER_GRAM = TREATMENT_ILS_PER_LITER / 1000;

function norm(value) {
  return String(value || "")
    .toUpperCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9א-ת]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function classifyMaterialKind({ brand, series, shade, serviceName, productType } = {}) {
  const hay = norm([brand, series, shade, productType].filter(Boolean).join(" "));
  const service = norm(serviceName);

  // Prefix matches: OXYDANT, DEVELOPERS, DIACTIVATOR, PRO OXIDE, etc.
  if (
    /\b(DEVELOP|OXYD|OXIDE|OXYCREM|DIACTIVAT|ACTIVATOR|WELLOXON|PRO OXIDE)/.test(hay)
    || /חמצן|מפתח/.test(hay)
  ) {
    return "developer";
  }

  const treatmentService =
    /\b(STRAIGHT|KERATIN|TREAT|SANCTION|BRAZILIAN|JAPANESE|LASIO|ORGANIC STRAIGHT)\b/.test(service)
    || /החלק|טיפול|שטיפ|קרטין/.test(service);

  // Organic base / SO Color / Nanoplex shade tubes are color creams — not liter treatments.
  // Nanoplex with codes like 7.11 / 6.00 is a color line used inside a mix.
  if (
    /\bORGANIC BASE COLOR\b/.test(hay)
    || /\bSO COLOR PRE BONDED\b/.test(hay)
    || (/\bNANOPLEX\b/.test(hay) && /\b\d+[.,]\d+\b/.test(hay))
  ) {
    return "color";
  }

  const treatmentProduct =
    /\b(KERATIN|TREATMENT|PERLA VERA|SMOOTH|STRAIGHT|LASIO|BOND PRO|PH ORGANIC|ORGANIC STRAIGHT)\b/.test(hay)
    || /טיפול|החלק|קרטין/.test(hay);

  if (treatmentService || treatmentProduct) {
    return "treatment";
  }

  // Lighteners / bleach powders (הבהרה) — not demi/permanent color creams.
  if (
    /\b(BLEACH|LIGHTEN|LIGHTNER|BLONDOR|DECOLOR|POWDER LIGHT|BLONDE EXPERT|MULTI BLONDES|PLATINUM|FREEHANDS|SMARTBOND POWDER|VARIO BLOND|BLONDME)\b/.test(hay)
    || /הבהר|אבקת הבהר/.test(hay)
  ) {
    return "bleach";
  }

  return "color";
}

function rateForKind(kind) {
  if (kind === "developer") return DEVELOPER_PER_GRAM;
  if (kind === "bleach") return BLEACH_PER_GRAM;
  if (kind === "treatment") return TREATMENT_PER_GRAM;
  return COLOR_PER_GRAM;
}

function estimateMaterialCostIls(grams, meta = {}) {
  const qty = Number(grams);
  if (!Number.isFinite(qty) || qty <= 0) return 0;
  const kind = classifyMaterialKind(meta);
  const cost = qty * rateForKind(kind);
  return Math.round(cost * 100) / 100;
}

module.exports = {
  DEVELOPER_ILS_PER_LITER,
  BLEACH_ILS_PER_400G,
  COLOR_ILS_PER_60G,
  TREATMENT_ILS_PER_LITER,
  DEVELOPER_PER_GRAM,
  BLEACH_PER_GRAM,
  COLOR_PER_GRAM,
  TREATMENT_PER_GRAM,
  classifyMaterialKind,
  rateForKind,
  estimateMaterialCostIls,
};
