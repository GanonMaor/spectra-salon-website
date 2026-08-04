"use strict";

/**
 * Owner-provided average list prices (ILS) for Maor Ganon historical mixes.
 * These are estimated migration prices — never confirmed checkout revenue.
 *
 * Billing rules (same client, same local day Asia/Jerusalem):
 * 1) Color-family is waived when any highlights service is present that day.
 * 2) Within each billing category, charge only the single highest list price
 *    once — never stack multiple services of the same category.
 */
const PRICE_LIST_VERSION = "maor-owner-avg-2026-08-04-v2";

/** @type {Record<string, number>} */
const SERVICE_LIST_PRICE_ILS = {
  "Full head highlights": 1000,
  "Root color": 250,
  "Without service": 250,
  "Toner for highlights": 200,
  "Organic straightening": 1200,
  "Half head highlights": 800,
  "Full head color": 300,
  "Keratin straightening": 1200,
  "Root highlights": 900,
  "Ombre/Balyage": 900,
  "Root lift": 180,
  "Color fix": 0,
  "Highlights fix": 0,
  "Russian hair": 300,
  "Japanese straightening": 1000,
  "Toner fix": 0,
  "Brazilian hair": 800,
  "Color lengths": 180,
  // Newer export labels (owner-aligned / nearest list peer)
  "Tint": 250,
  "Roots tint": 250,
  "T - section": 900,
  "T section": 900,
  "Balayage full head": 1000,
  "Color for extensions": 180,
  "TLV Sanction": 250,
  "Краска корень - צבע שורש": 250,
  "טיפול שיער דק": 0,
};

/** Alias → canonical price-list name */
const SERVICE_ALIASES = {
  "t section": "T section",
  "t - section": "T - section",
  "balayage full head": "Balayage full head",
  "roots tint": "Roots tint",
  "color for extensions": "Color for extensions",
};

const HIGHLIGHT_SERVICES = new Set([
  "Full head highlights",
  "Half head highlights",
  "Root highlights",
  "Ombre/Balyage",
  "Highlights fix",
  "Balayage full head",
  "T - section",
  "T section",
]);

/**
 * Color services that are not charged when the same client has highlights
 * on the same day. Material cost still counts as an expense/usage.
 */
const COLOR_WAIVED_WITH_HIGHLIGHTS = new Set([
  "Root color",
  "Full head color",
  "Color fix",
  "Color lengths",
  "Without service",
  "Root lift",
  "Tint",
  "Roots tint",
  "Color for extensions",
  "TLV Sanction",
  "Краска корень - צבע שורש",
]);

/** @typedef {"highlights"|"color"|"toner"|"straightening"|"treatment"|"other"} BillingCategory */

/**
 * @param {string} serviceName
 * @returns {BillingCategory}
 */
function billingCategoryForService(serviceName) {
  const canonical = canonicalServiceName(serviceName);
  if (HIGHLIGHT_SERVICES.has(canonical)) return "highlights";
  const n = String(canonical || "").toLowerCase();
  if (n.includes("toner") || n.includes("gloss")) return "toner";
  if (n.includes("keratin") || n.includes("treatment") || n.includes("טיפול")) return "treatment";
  if (n.includes("straight") || n.includes("smooth") || n.includes("brazilian") || n.includes("japanese") || n.includes("russian")) {
    return "straightening";
  }
  if (
    COLOR_WAIVED_WITH_HIGHLIGHTS.has(canonical) ||
    n.includes("color") ||
    n.includes("tint") ||
    n.includes("root") ||
    n.includes("dye") ||
    n.includes("צבע")
  ) {
    return "color";
  }
  return "other";
}

function canonicalServiceName(serviceName) {
  const raw = String(serviceName || "").trim();
  const alias = SERVICE_ALIASES[raw.toLowerCase()];
  return alias || raw;
}

function ilsToCents(ils) {
  return Math.round(Number(ils || 0) * 100);
}

function listPriceIls(serviceName) {
  const canonical = canonicalServiceName(serviceName);
  if (Object.prototype.hasOwnProperty.call(SERVICE_LIST_PRICE_ILS, canonical)) {
    return SERVICE_LIST_PRICE_ILS[canonical];
  }
  return 0;
}

function isHighlightService(serviceName) {
  return HIGHLIGHT_SERVICES.has(canonicalServiceName(serviceName));
}

function isColorWaivedWithHighlights(serviceName) {
  return COLOR_WAIVED_WITH_HIGHLIGHTS.has(canonicalServiceName(serviceName));
}

/**
 * Local calendar day key in Asia/Jerusalem for same-day bundling.
 * @param {Date|string} value
 */
function localDayKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "invalid";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * @param {Array<{ id: string, serviceName: string, customerId?: string|null, customerName?: string, startTime: Date|string }>} appointments
 */
function applyEstimatedPricing(appointments) {
  const groups = new Map();
  for (const appt of appointments) {
    const clientKey = appt.customerId || `name:${String(appt.customerName || "").trim().toLowerCase()}`;
    const key = `${clientKey}|${localDayKey(appt.startTime)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(appt);
  }

  const priced = [];
  for (const group of groups.values()) {
    const hasHighlights = group.some((appt) => isHighlightService(appt.serviceName));

    /** @type {Map<string, { id: string, listIls: number }>} */
    const maxByCategory = new Map();
    for (const appt of group) {
      const listIls = listPriceIls(appt.serviceName);
      const category = billingCategoryForService(appt.serviceName);
      const colorWaived = hasHighlights && isColorWaivedWithHighlights(appt.serviceName);
      if (colorWaived) continue;
      const prev = maxByCategory.get(category);
      if (!prev || listIls > prev.listIls) {
        maxByCategory.set(category, { id: appt.id, listIls });
      }
    }

    for (const appt of group) {
      const listIls = listPriceIls(appt.serviceName);
      const category = billingCategoryForService(appt.serviceName);
      const colorWaived = hasHighlights && isColorWaivedWithHighlights(appt.serviceName);
      const categoryWinner = maxByCategory.get(category);
      const isCategoryMax = Boolean(categoryWinner && categoryWinner.id === appt.id);
      const categoryCapped = !colorWaived && !isCategoryMax && listIls >= 0;

      let chargedIls = listIls;
      let reason = listIls === 0 ? "zero_list_price" : "owner_average_list_price";
      if (colorWaived) {
        chargedIls = 0;
        reason = "color_included_in_highlights_process";
      } else if (categoryCapped) {
        chargedIls = 0;
        reason = "same_day_category_max_only";
      }

      priced.push({
        id: appt.id,
        serviceName: appt.serviceName,
        listPriceCents: ilsToCents(listIls),
        estimatedRevenueCents: ilsToCents(chargedIls),
        revenueSource: "migration_estimate",
        pricingSource: PRICE_LIST_VERSION,
        pricingConfidence: "inferred",
        pricingSnapshot: {
          priceListVersion: PRICE_LIST_VERSION,
          serviceName: appt.serviceName,
          billingCategory: category,
          listPriceIls: listIls,
          chargedPriceIls: chargedIls,
          currency: "ILS",
          sameDayHighlightsBundle: hasHighlights,
          colorWaivedWithHighlights: colorWaived,
          sameDayCategoryMaxOnly: categoryCapped,
          categoryMaxServiceId: categoryWinner?.id || null,
          categoryMaxListPriceIls: categoryWinner?.listIls ?? null,
          reason,
        },
      });
    }
  }
  return priced;
}

module.exports = {
  PRICE_LIST_VERSION,
  SERVICE_LIST_PRICE_ILS,
  HIGHLIGHT_SERVICES,
  COLOR_WAIVED_WITH_HIGHLIGHTS,
  ilsToCents,
  listPriceIls,
  canonicalServiceName,
  billingCategoryForService,
  isHighlightService,
  isColorWaivedWithHighlights,
  localDayKey,
  applyEstimatedPricing,
};
