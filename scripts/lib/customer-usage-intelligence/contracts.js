"use strict";

const INSIGHT_ENGINE_VERSION = "1.0.0";
const SERVICE_CLASSIFIER_VERSION = "1.0.0";

const SUPPORT = Object.freeze({
  SUPPORTED: "supported",
  PARTIAL: "partially_supported",
  NOT_SUPPORTED: "not_supported",
});

const FACT_LEVELS = Object.freeze({
  USAGE_ROW: "usage_row",
  FORMULA_COMPONENT: "formula_component",
  FORMULA: "formula",
  SERVICE_STAGE: "service_stage",
  SERVICE: "service",
  CLIENT_VISIT: "client_visit",
  CLIENT_TIMELINE_EVENT: "client_timeline_event",
});

const INSIGHT_TYPES = Object.freeze([
  "most_used_color_families",
  "top_shades_by_usage",
  "shades_by_service_type",
  "brand_share_of_bowl",
  "cross_brand_mixing",
  "product_line_adoption",
  "formula_complexity",
  "developer_behavior",
  "client_shade_journey",
  "trends_over_time",
]);

function makeId(prefix, seed) {
  const crypto = require("crypto");
  const digest = crypto.createHash("sha1").update(String(seed)).digest("hex").slice(0, 16);
  return `${prefix}-${digest}`;
}

function normalizeText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s\u0590-\u05FF.%/+-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stableLabel(prefix, seed, width = 3) {
  const crypto = require("crypto");
  const n = parseInt(crypto.createHash("sha1").update(String(seed || prefix)).digest("hex").slice(0, 8), 16);
  const value = String((n % Math.pow(10, width)) + 1).padStart(width, "0");
  return `${prefix} ${value}`;
}

function stableAnonymousClient(seed) {
  const crypto = require("crypto");
  const n = parseInt(crypto.createHash("sha1").update(String(seed || "client")).digest("hex").slice(0, 10), 16);
  return `Anonymous Client ${String((n % 999999) + 1).padStart(6, "0")}`;
}

module.exports = {
  FACT_LEVELS,
  INSIGHT_ENGINE_VERSION,
  INSIGHT_TYPES,
  SERVICE_CLASSIFIER_VERSION,
  SUPPORT,
  makeId,
  normalizeText,
  stableAnonymousClient,
  stableLabel,
};
