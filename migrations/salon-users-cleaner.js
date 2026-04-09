"use strict";

const DEFAULT_TREND = "-";
const DEFAULT_DATE = "-";

const INVALID_LOCATION_VALUES = new Set([
  "",
  "-",
  "mistake",
  "sent",
  "opposite",
  "ios",
  "android",
  "unknown",
]);

const STATE_ALIASES = {
  israel: "ISRAEL",
  il: "ISRAEL",
  england: "UK",
  "united kingdom": "UK",
  uk: "UK",
  "great britain": "UK",
  gb: "UK",
  usa: "USA",
  us: "USA",
  "united states": "USA",
  portugal: "PORTUGAL",
  belarus: "BELARUS",
  italy: "ITALY",
  japan: "JAPAN",
  ireland: "IRELAND",
  irland: "IRELAND",
  canada: "CANADA",
  greece: "GREECE",
  netherlands: "NETHERLANDS",
  australia: "AUSTRALIA",
};

const CITY_ALIASES = {
  "new-york": "New York",
  "new jersy": "New Jersey",
  "san diago": "San Diego",
  rannana: "Raanana",
  "reshon lezion": "Rishon Lezion",
  "new jersy ": "New Jersey",
  natanya: "Netanya",
  hertzelia: "Herzliya",
  "scottsdale az": "Scottsdale",
  "weston fl": "Weston",
};

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizePhone(value) {
  return normalizeWhitespace(value).replace(/[^\d]/g, "");
}

function normalizeTrend(value) {
  const normalized = normalizeWhitespace(value);
  return normalized || DEFAULT_TREND;
}

function normalizeVersion(value) {
  const digits = normalizeWhitespace(value).match(/\d+/g);
  return digits ? digits.join("") : "";
}

function normalizeLinks(value) {
  const normalized = normalizeWhitespace(value);
  if (!normalized || normalized === DEFAULT_TREND) return "";
  return normalized.replace(/^@+/, "");
}

function normalizeRelativeDate(value) {
  const normalized = normalizeWhitespace(value);
  if (!normalized || normalized === DEFAULT_TREND) return DEFAULT_DATE;
  if (/^just now$/i.test(normalized)) return "Just now";

  const match = normalized.match(/^(\d+)\s+(minute|minutes|hour|hours|day|days|month|months|year|years)\s+ago$/i);
  if (!match) return normalized;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase().replace(/s$/, "");
  const suffix = amount === 1 ? unit : `${unit}s`;
  return `${amount} ${suffix} ago`;
}

function relativeDateRank(value) {
  const normalized = normalizeRelativeDate(value);
  if (normalized === DEFAULT_DATE) return null;
  if (normalized === "Just now") return 0;

  const match = normalized.match(/^(\d+)\s+(minute|minutes|hour|hours|day|days|month|months|year|years)\s+ago$/i);
  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase().replace(/s$/, "");

  if (unit === "minute") return amount / 1440;
  if (unit === "hour") return amount / 24;
  if (unit === "day") return amount;
  if (unit === "month") return amount * 30;
  if (unit === "year") return amount * 365;
  return null;
}

function normalizeState(value) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";

  const lower = normalized.toLowerCase();
  if (INVALID_LOCATION_VALUES.has(lower)) return "";

  return STATE_ALIASES[lower] || normalized.toUpperCase();
}

function toTitleCase(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      if (/^[A-Z]{2,}$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(" ");
}

function normalizeCity(value) {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return "";

  const lower = normalized.toLowerCase();
  if (INVALID_LOCATION_VALUES.has(lower)) return "";

  if (CITY_ALIASES[lower]) return CITY_ALIASES[lower];
  if (/^[A-Z]{2,5}$/.test(normalized)) return normalized.toUpperCase();
  return toTitleCase(normalized.replace(/-/g, " "));
}

function normalizeName(value) {
  return normalizeWhitespace(value);
}

function normalizeRecord(record) {
  return {
    salon_name: normalizeName(record.salon_name),
    phone_number: normalizePhone(record.phone_number),
    profiles: Number.isFinite(Number(record.profiles)) ? Math.max(0, Number(record.profiles)) : 0,
    first_mix_date: normalizeRelativeDate(record.first_mix_date),
    last_mix_date: normalizeRelativeDate(record.last_mix_date),
    monthly_trend: normalizeTrend(record.monthly_trend),
    version: normalizeVersion(record.version),
    state: normalizeState(record.state),
    city: normalizeCity(record.city),
    links: normalizeLinks(record.links),
    summit: normalizeLinks(record.summit),
    instagram: normalizeLinks(record.instagram),
  };
}

function infoScore(record) {
  return [
    record.salon_name,
    record.phone_number,
    record.first_mix_date !== DEFAULT_DATE ? record.first_mix_date : "",
    record.last_mix_date !== DEFAULT_DATE ? record.last_mix_date : "",
    record.version,
    record.state,
    record.city,
    record.links,
    record.summit,
    record.instagram,
  ].filter(Boolean).length + record.profiles;
}

function choosePreferredString(current, incoming) {
  if (!current) return incoming || "";
  if (!incoming) return current || "";
  return incoming.length > current.length ? incoming : current;
}

function chooseVersion(current, incoming) {
  if (!current) return incoming || "";
  if (!incoming) return current || "";
  return Number(incoming) >= Number(current) ? incoming : current;
}

function chooseFirstMix(current, incoming) {
  const currentRank = relativeDateRank(current);
  const incomingRank = relativeDateRank(incoming);
  if (currentRank === null) return incoming || DEFAULT_DATE;
  if (incomingRank === null) return current || DEFAULT_DATE;
  return incomingRank > currentRank ? incoming : current;
}

function chooseLastMix(current, incoming) {
  const currentRank = relativeDateRank(current);
  const incomingRank = relativeDateRank(incoming);
  if (currentRank === null) return incoming || DEFAULT_DATE;
  if (incomingRank === null) return current || DEFAULT_DATE;
  return incomingRank < currentRank ? incoming : current;
}

function mergeRecords(current, incoming) {
  const preferred = infoScore(incoming) > infoScore(current) ? { ...incoming } : { ...current };
  const other = preferred === incoming ? current : incoming;

  return {
    salon_name: choosePreferredString(preferred.salon_name, other.salon_name),
    phone_number: preferred.phone_number || other.phone_number,
    profiles: Math.max(preferred.profiles || 0, other.profiles || 0),
    first_mix_date: chooseFirstMix(preferred.first_mix_date, other.first_mix_date),
    last_mix_date: chooseLastMix(preferred.last_mix_date, other.last_mix_date),
    monthly_trend: preferred.monthly_trend !== DEFAULT_TREND ? preferred.monthly_trend : other.monthly_trend,
    version: chooseVersion(preferred.version, other.version),
    state: preferred.state || other.state,
    city: preferred.city || other.city,
    links: preferred.links || other.links,
    summit: preferred.summit || other.summit,
    instagram: preferred.instagram || other.instagram,
  };
}

function buildDedupKey(record) {
  if (record.phone_number) return `phone:${record.phone_number}`;
  return `name:${record.salon_name.toLowerCase()}`;
}

function cleanSalonUsers(rawRecords) {
  const report = {
    rawCount: rawRecords.length,
    normalizedPhones: 0,
    normalizedStates: 0,
    normalizedCities: 0,
    removedDuplicates: 0,
    droppedRecords: 0,
    duplicateKeys: [],
  };

  const deduped = new Map();

  for (const rawRecord of rawRecords) {
    const normalized = normalizeRecord(rawRecord);
    if (!normalized.salon_name && !normalized.phone_number) {
      report.droppedRecords += 1;
      continue;
    }

    if (normalizeWhitespace(rawRecord.phone_number) !== normalized.phone_number) report.normalizedPhones += 1;
    if (normalizeWhitespace(rawRecord.state) !== normalized.state) report.normalizedStates += 1;
    if (normalizeWhitespace(rawRecord.city) !== normalized.city) report.normalizedCities += 1;

    const key = buildDedupKey(normalized);
    if (!deduped.has(key)) {
      deduped.set(key, normalized);
      continue;
    }

    report.removedDuplicates += 1;
    if (!report.duplicateKeys.includes(key)) report.duplicateKeys.push(key);
    deduped.set(key, mergeRecords(deduped.get(key), normalized));
  }

  return {
    cleanedUsers: [...deduped.values()].sort((a, b) => a.salon_name.localeCompare(b.salon_name)),
    report,
  };
}

module.exports = {
  cleanSalonUsers,
  normalizeCity,
  normalizePhone,
  normalizeRelativeDate,
  normalizeState,
};
