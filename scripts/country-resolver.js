/**
 * country-resolver.js
 * Shared helper for deriving country from phone number + State fallback.
 * Priority: Israeli phone prefix → normalized State → "Unknown"
 */

const ISRAEL_STATE_VARIANTS = new Set([
  "israel", "israel ", "ישראל", "il",
]);

const STATE_TO_COUNTRY = {
  england: "UK",
  "united kingdom": "UK",
  uk: "UK",
  "great britain": "UK",
  gb: "UK",
  usa: "USA",
  "united states": "USA",
  us: "USA",
  portugal: "PORTUGAL",
  belarus: "BELARUS",
  greece: "GREECE",
  italy: "ITALY",
  canada: "CANADA",
  irland: "IRELAND",
  ireland: "IRELAND",
  japan: "JAPAN",
  australia: "AUSTRALIA",
  netherlands: "NETHERLANDS",
  tennesse: "USA",
  tennessee: "USA",
  texas: "USA",
  california: "USA",
  florida: "USA",
  "new york": "USA",
};

function normalizePhone(raw) {
  if (raw == null) return "";
  return String(raw).replace(/[\s\-().+]/g, "").trim();
}

function isIsraeliPhone(phone) {
  if (!phone || phone.length < 7) return false;
  // +972 / 972 international prefix
  if (phone.startsWith("972") && phone.length >= 11 && phone.length <= 13) return true;
  // Local Israeli mobile: 05X (10 digits)
  if (/^05\d{8}$/.test(phone)) return true;
  // Local Israeli mobile: 07X (10 digits, e.g. 077, 072)
  if (/^07[2-9]\d{7}$/.test(phone)) return true;
  // Local landline: 02/03/04/08/09 (9-10 digits)
  if (/^0[23489]\d{7,8}$/.test(phone)) return true;
  // 1-800 / 1-700 style (less common for salons but valid)
  if (/^1[78]00\d{6,7}$/.test(phone)) return true;
  return false;
}

function normalizeState(raw) {
  if (!raw || raw === "null" || raw === "undefined") return "Unknown";
  const trimmed = String(raw).trim();
  if (!trimmed) return "Unknown";
  const lower = trimmed.toLowerCase();
  if (ISRAEL_STATE_VARIANTS.has(lower)) return "ISRAEL";
  if (STATE_TO_COUNTRY[lower]) return STATE_TO_COUNTRY[lower];
  return trimmed.toUpperCase();
}

/**
 * Resolve country for a row.
 * @param {{ phone?: string|number, state?: string }} opts
 * @returns {string} Normalized country string (e.g. "ISRAEL", "USA", "Unknown")
 */
function resolveCountry({ phone, state }) {
  const normalized = normalizePhone(phone);
  if (isIsraeliPhone(normalized)) return "ISRAEL";
  return normalizeState(state);
}

module.exports = { normalizePhone, isIsraeliPhone, normalizeState, resolveCountry };
