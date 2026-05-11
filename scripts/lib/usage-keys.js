/**
 * usage-keys.js
 * ---------------------------------------------------------------
 * Shared helpers for month/year handling across the usage-report
 * pipeline (scripts + Netlify functions). Keep these in sync with
 * `report-discovery.js`.
 */

const { MONTH_ORDER, MONTH_ALIASES } = require("../report-discovery");

const SHORT_MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseNum(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? parseFloat(v.replace(/,/g, "")) : Number(v);
  return Number.isNaN(n) ? 0 : n;
}

function round2(v) {
  return Math.round(v * 100) / 100;
}

function canonicalMonthName(monthRaw) {
  if (!monthRaw) return "";
  const lower = String(monthRaw).toLowerCase().trim();
  return MONTH_ALIASES[lower] || lower;
}

function monthLabel(monthCanonical, year) {
  if (!monthCanonical) return "";
  const m =
    monthCanonical.charAt(0).toUpperCase() +
    monthCanonical.slice(1, 3).toLowerCase();
  return `${m} ${year}`;
}

function shortMonthLabel(year, monthNumber) {
  if (!monthNumber || monthNumber < 1 || monthNumber > 12) return "";
  return `${SHORT_MONTH_NAMES[monthNumber - 1]} ${year}`;
}

function sortableIndex(monthCanonical, year) {
  if (!monthCanonical || !year) return 0;
  const lower = monthCanonical.toLowerCase();
  let idx = MONTH_ORDER.indexOf(lower);
  if (idx < 0) {
    idx = MONTH_ORDER.findIndex(
      (m) => m.startsWith(lower) || lower.startsWith(m),
    );
  }
  return year * 100 + (idx >= 0 ? idx : 0);
}

function monthNumber(monthCanonical) {
  if (!monthCanonical) return 0;
  const idx = MONTH_ORDER.indexOf(monthCanonical.toLowerCase());
  return idx >= 0 ? idx + 1 : 0;
}

function sortMonthLabels(labels) {
  return [...labels].sort((a, b) => {
    const [mA, yA] = a.split(" ");
    const [mB, yB] = b.split(" ");
    const yearDiff = Number(yA) - Number(yB);
    if (yearDiff !== 0) return yearDiff;
    const idxA = MONTH_ORDER.findIndex((m) =>
      m.startsWith((mA || "").toLowerCase()),
    );
    const idxB = MONTH_ORDER.findIndex((m) =>
      m.startsWith((mB || "").toLowerCase()),
    );
    return idxA - idxB;
  });
}

module.exports = {
  SHORT_MONTH_NAMES,
  parseNum,
  round2,
  canonicalMonthName,
  monthLabel,
  shortMonthLabel,
  sortableIndex,
  monthNumber,
  sortMonthLabels,
};
