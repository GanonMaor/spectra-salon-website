/**
 * gtm-shared.js
 * Helpers shared by the GTM research build stages:
 *   build-customer-facts.js → build-acquisition-attribution.js → build-gtm-research.js
 *
 * Everything here is pure so the stages stay deterministic and testable.
 */

"use strict";

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.resolve(__dirname, "..", "..", "src", "data");
const GTM_CONFIG_DIR = path.join(DATA_DIR, "gtm");
const GENERATED_DIR = path.join(DATA_DIR, "generated");

const MONTH_RE = /^(0[1-9]|1[0-2])\/(\d{4})$/;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

/** "MM/YYYY" → absolute month number, so windows can be compared with < and >. */
function monthToNumber(label) {
  if (!label || !MONTH_RE.test(label)) return null;
  const [month, year] = label.split("/").map(Number);
  return year * 12 + month;
}

function hasHebrew(value) {
  return /[\u0590-\u05FF]/.test(String(value || ""));
}

/**
 * Collapse a salon name to a comparable key. Summit, the admin snapshot and the
 * usage exports all spell the same salon slightly differently.
 */
function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/["'’‘״׳.,&()[\]\-_/\\\s]/g, "")
    .replace(/(בעמ|ltd|llc|inc)/g, "")
    .trim();
}

function nameWords(value) {
  return normalizeName(value).match(/[\u0590-\u05FF\w]{3,}/g) || [];
}

/**
 * Dialling-code inference, mirroring the Admin Dashboard so both surfaces agree
 * on where a salon sits. country-resolver.js only recognises Israeli numbers, and
 * most overseas rows carry a phone but no country.
 */
function inferCountryFromPhone(phone) {
  const clean = String(phone || "").replace(/[\s\-()+]/g, "");
  if (!clean) return "";
  if (/^05\d{8}$/.test(clean) || /^0[2-9]\d{7,8}$/.test(clean)) return "ISRAEL";
  if (/^972\d{9,10}$/.test(clean)) return "ISRAEL";
  if (/^07\d{9,10}$/.test(clean) || /^447\d{9}$/.test(clean)) return "UK";
  if (/^351\d{9}$/.test(clean) || (/^9[12356]\d{7}$/.test(clean) && clean.length === 9)) return "PORTUGAL";
  if (/^39\d{9,10}$/.test(clean) || /^393\d{9}$/.test(clean)) return "ITALY";
  if (/^81\d{9,10}$/.test(clean)) return "JAPAN";
  if (/^30\d{10}$/.test(clean) || /^003\d{11,12}$/.test(clean)) return "GREECE";
  if (/^375\d{9}$/.test(clean)) return "BELARUS";
  if (/^79\d{9}$/.test(clean)) return "RUSSIA";
  if (/^61\d{9}$/.test(clean) || (/^41\d{7}$/.test(clean) && clean.length === 9)) return "AUSTRALIA";
  if (/^31\d{9}$/.test(clean) || (/^6\d{8}$/.test(clean) && clean.length === 9)) return "NETHERLANDS";
  if (/^353\d{7,9}$/.test(clean) || /^08\d{8}$/.test(clean)) return "IRELAND";
  if (clean.length === 10 && /^[2-9]\d{9}$/.test(clean)) return "USA";
  if (clean.length === 11 && clean.startsWith("1")) return "USA";
  return "";
}

/**
 * Build a lookup that tolerates the spelling drift between systems, using the
 * same three tiers the Admin Dashboard uses: exact, containment, word overlap.
 */
function buildNameIndex(rows, nameKey) {
  const exact = new Map();
  const entries = [];
  for (const row of rows) {
    const key = normalizeName(row[nameKey]);
    if (!key) continue;
    if (!exact.has(key)) exact.set(key, row);
    entries.push({ key, words: nameWords(row[nameKey]), row });
  }
  return { exact, entries };
}

function matchName(index, name) {
  const key = normalizeName(name);
  if (!key) return null;
  if (index.exact.has(key)) return index.exact.get(key);

  for (const entry of index.entries) {
    if (entry.key.length < 5 || key.length < 5) continue;
    if (key.includes(entry.key) || entry.key.includes(key)) return entry.row;
  }

  const words = nameWords(name);
  if (words.length >= 2) {
    for (const entry of index.entries) {
      const shared = words.filter((word) => entry.words.includes(word));
      if (shared.length >= 2) return entry.row;
    }
  }
  return null;
}

/**
 * Manual overrides are keyed by Summit id because several real customers share a
 * display name; the name key is only a fallback for accounts with no id.
 */
function indexOverrides(overrides) {
  const bySumitId = new Map();
  const byName = new Map();
  for (const override of overrides) {
    if (override.sumitId != null) {
      bySumitId.set(Number(override.sumitId), override);
    } else {
      byName.set(normalizeName(override.name), override);
    }
  }
  return {
    lookup(customer) {
      if (customer.sumitId != null && bySumitId.has(Number(customer.sumitId))) {
        return bySumitId.get(Number(customer.sumitId));
      }
      return byName.get(normalizeName(customer.name)) || null;
    },
  };
}

const CONFIDENCE_ORDER = { high: 3, medium: 2, low: 1, unknown: 0 };

function lowerConfidence(a, b) {
  return CONFIDENCE_ORDER[a] <= CONFIDENCE_ORDER[b] ? a : b;
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) || 0) * factor) / factor;
}

/** Share as a 0–1 ratio, guarding the empty-denominator case. */
function ratio(numerator, denominator) {
  if (!denominator) return null;
  return round(numerator / denominator, 4);
}

module.exports = {
  DATA_DIR,
  GTM_CONFIG_DIR,
  GENERATED_DIR,
  MONTH_RE,
  readJson,
  writeJson,
  monthToNumber,
  hasHebrew,
  normalizeName,
  nameWords,
  inferCountryFromPhone,
  buildNameIndex,
  matchName,
  indexOverrides,
  lowerConfidence,
  round,
  ratio,
};
