"use strict";

const XLSX = require("xlsx");
const {
  FACT_LEVELS,
  makeId,
  normalizeText,
  stableAnonymousClient,
} = require("./contracts");

const COLUMN_ALIASES = {
  serviceDate: ["תאריך", "date", "service date"],
  serviceTime: ["זמן", "time", "service time"],
  clientName: ["לקוח", "client", "customer", "client name"],
  serviceName: ["שירות", "service", "treatment"],
  rawBrand: ["מותג", "brand", "manufacturer"],
  rawProductLine: ["סדרה", "series", "line", "product line"],
  rawProductValue: ["גוון", "shade", "product", "material"],
  quantityGrams: ["גרם", "grams", "weight", "g"],
  cost: ["עלות", "cost", "price"],
  rounded: ["מעגל", "rounded", "cycle"],
  reweigh: ["שקילה חוזרת", "reweigh"],
  profile: ["פרופיל", "profile", "staff", "stylist"],
};

function parseWorkbookBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer", cellDates: false, raw: true });
  return workbook;
}

function sheetRows(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true });
}

function normalizeDate(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  const serial = Number(s);
  if (Number.isFinite(serial) && serial > 40000 && serial < 70000) {
    return new Date((serial - 25569) * 86400 * 1000).toISOString().slice(0, 10);
  }
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (m) {
    const [, a, b, y] = m;
    const year = y.length === 2 ? (Number(y) > 50 ? `19${y}` : `20${y}`) : y;
    const candidate = new Date(`${year}-${a.padStart(2, "0")}-${b.padStart(2, "0")}`);
    if (!Number.isNaN(candidate.getTime())) return candidate.toISOString().slice(0, 10);
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return null;
}

function normalizeTime(raw) {
  if (raw == null || raw === "") return null;
  const s = String(raw).trim();
  const m = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  if (m[4]) {
    if (m[4].toUpperCase() === "PM" && h < 12) h += 12;
    if (m[4].toUpperCase() === "AM" && h === 12) h = 0;
  }
  return `${String(h).padStart(2, "0")}:${m[2]}:${m[3] || "00"}`;
}

function parseNumber(raw) {
  if (raw == null || raw === "") return null;
  const n = Number(String(raw).replace(/,/g, ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function findHeaderRow(rows) {
  let best = { idx: -1, score: 0 };
  rows.slice(0, 20).forEach((row, idx) => {
    const normalized = row.map((c) => normalizeText(c));
    let score = 0;
    for (const aliases of Object.values(COLUMN_ALIASES)) {
      if (aliases.some((a) => normalized.includes(normalizeText(a)))) score += 1;
    }
    if (score > best.score) best = { idx, score };
  });
  return best.score >= 4 ? best.idx : -1;
}

function columnMap(header) {
  const normalized = header.map((c) => normalizeText(c));
  const map = {};
  for (const [key, aliases] of Object.entries(COLUMN_ALIASES)) {
    const idx = normalized.findIndex((h) => aliases.some((a) => h === normalizeText(a) || h.includes(normalizeText(a))));
    if (idx >= 0) map[key] = idx;
  }
  return map;
}

function value(row, map, key) {
  return map[key] == null ? null : row[map[key]];
}

function rowKind(row, map) {
  if (!row || row.every((c) => c == null || c === "")) return "empty";
  const brand = value(row, map, "rawBrand");
  const line = value(row, map, "rawProductLine");
  const product = value(row, map, "rawProductValue");
  const service = value(row, map, "serviceName");
  const date = value(row, map, "serviceDate");
  if (!brand && !line && !product && (service || date)) return "service_summary";
  if (product || brand || line) return "formula_component";
  return "unknown";
}

function classifyService(serviceName, sheetName) {
  const s = normalizeText(`${serviceName || ""} ${sheetName || ""}`);
  if (/toner|gloss|טונר/.test(s)) return "toner";
  if (/highlight|balayage|foil|הבהר|גוונים/.test(s)) return "highlights";
  if (/root|grey|gray|שורש|לבן/.test(s)) return "root_or_grey_coverage";
  if (/correction|correct|תיקון/.test(s)) return "correction";
  if (/color|colour|צבע/.test(s)) return "color";
  return "other";
}

function buildFactsFromSheets(workbook, context, profile) {
  const facts = [];
  const warnings = [];
  const rowCounts = {};
  let accepted = 0;
  let rejected = 0;
  const dates = [];
  const clientKeys = new Set();
  const visitKeys = new Set();
  let eventOrdinal = 0;

  for (const sheetName of workbook.SheetNames) {
    const rows = sheetRows(workbook, sheetName);
    const headerIdx = findHeaderRow(rows);
    if (headerIdx < 0) continue;
    const map = columnMap(rows[headerIdx] || []);
    let currentEvent = null;
    const dataRows = rows.slice(headerIdx + 1);

    dataRows.forEach((row, offset) => {
      const sourceRowIndex = headerIdx + 1 + offset;
      const kind = rowKind(row, map);
      rowCounts[kind] = (rowCounts[kind] || 0) + 1;
      if (kind === "empty") return;

      if (kind === "service_summary") {
        eventOrdinal += 1;
        const eventSeed = `${context.uploadId}|${sheetName}|${sourceRowIndex}|${eventOrdinal}`;
        const date = normalizeDate(value(row, map, "serviceDate"));
        const time = normalizeTime(value(row, map, "serviceTime"));
        const profileName = normalizeText(value(row, map, "profile"));
        const clientName = normalizeText(value(row, map, "clientName"));
        const serviceName = String(value(row, map, "serviceName") || "").trim();
        const clientIdentityKey = `${profileName}|${clientName}`;
        const pseudoClient = clientName
          ? stableAnonymousClient(`${context.organizationId}|${context.customerAccountId}|${context.salonId}|${clientIdentityKey}`)
          : null;
        const serviceEventId = makeId("svc", eventSeed);
        const formulaId = makeId("formula", `${eventSeed}|formula`);
        const serviceStageId = makeId("stage", `${eventSeed}|${classifyService(serviceName, sheetName)}`);
        const clientVisitId = makeId("visit", `${context.salonId}|${date}|${time || ""}|${clientIdentityKey}`);

        currentEvent = {
          serviceEventId,
          formulaId,
          serviceStageId,
          clientVisitId,
          pseudoClient,
          clientIdentityKey,
          eventDate: date,
          eventTime: time,
          serviceName,
          serviceType: classifyService(serviceName, sheetName),
          profileName,
          summaryGrams: parseNumber(value(row, map, "quantityGrams")),
          summaryCost: parseNumber(value(row, map, "cost")),
          componentGrams: 0,
          componentCost: 0,
          components: [],
        };
        if (date) dates.push(date);
        if (clientName) clientKeys.add(clientIdentityKey);
        visitKeys.add(clientVisitId);
        accepted += 1;
        facts.push({
          id: makeId("fact", `${serviceEventId}|service`),
          factLevel: FACT_LEVELS.SERVICE,
          serviceEventId,
          formulaId,
          serviceStageId,
          clientVisitId,
          pseudonymousClientId: pseudoClient,
          eventDate: date,
          eventTime: time,
          serviceType: currentEvent.serviceType,
          payload: { serviceName, sheetName, summaryGrams: currentEvent.summaryGrams, summaryCost: currentEvent.summaryCost },
        });
        facts.push({
          id: makeId("fact", `${clientVisitId}|visit`),
          factLevel: FACT_LEVELS.CLIENT_VISIT,
          serviceEventId,
          clientVisitId,
          pseudonymousClientId: pseudoClient,
          eventDate: date,
          eventTime: time,
          serviceType: currentEvent.serviceType,
          payload: { identityMethod: "normalized_exact_name_within_same_profile", clientIdentityConfidence: clientName ? "medium" : "none" },
        });
        return;
      }

      if (kind !== "formula_component" || !currentEvent) {
        rejected += 1;
        warnings.push({ code: "UNATTACHED_COMPONENT", severity: "medium", message: "Formula component could not be attached to a service summary.", count: 1 });
        return;
      }

      const rawProductValue = String(value(row, map, "rawProductValue") || "").trim();
      const rawBrand = String(value(row, map, "rawBrand") || "").trim();
      const rawProductLine = String(value(row, map, "rawProductLine") || "").trim();
      const grams = parseNumber(value(row, map, "quantityGrams"));
      const cost = parseNumber(value(row, map, "cost"));
      const normalizedProductKey = normalizeText([rawBrand, rawProductLine, rawProductValue].filter(Boolean).join(" "));
      const idSeed = `${context.uploadId}|${sheetName}|${sourceRowIndex}|${normalizedProductKey}`;
      const fact = {
        id: makeId("fact", idSeed),
        factLevel: FACT_LEVELS.FORMULA_COMPONENT,
        sourceRowIndex,
        serviceEventId: currentEvent.serviceEventId,
        formulaId: currentEvent.formulaId,
        serviceStageId: currentEvent.serviceStageId,
        clientVisitId: currentEvent.clientVisitId,
        pseudonymousClientId: currentEvent.pseudoClient,
        eventDate: currentEvent.eventDate,
        eventTime: currentEvent.eventTime,
        serviceType: currentEvent.serviceType,
        rawBrand,
        rawProductLine,
        rawProductValue,
        normalizedProductKey,
        quantityGrams: grams,
        costValue: cost,
        resolutionStatus: "unresolved",
        confidence: "none",
        payload: {
          sheetName,
          serviceName: currentEvent.serviceName,
          rounded: value(row, map, "rounded"),
          reweigh: value(row, map, "reweigh"),
          parserProfileId: profile.profileId,
        },
      };
      currentEvent.componentGrams += grams || 0;
      currentEvent.componentCost += cost || 0;
      currentEvent.components.push(fact.id);
      accepted += 1;
      facts.push(fact);
    });
  }

  const serviceFacts = facts.filter((f) => f.factLevel === FACT_LEVELS.SERVICE);
  const formulaFacts = serviceFacts.map((svc) => ({
    ...svc,
    id: makeId("fact", `${svc.formulaId}|formula`),
    factLevel: FACT_LEVELS.FORMULA,
  }));
  const stageFacts = serviceFacts.map((svc) => ({
    ...svc,
    id: makeId("fact", `${svc.serviceStageId}|stage`),
    factLevel: FACT_LEVELS.SERVICE_STAGE,
  }));
  facts.push(...formulaFacts, ...stageFacts);

  return {
    facts,
    dataQuality: {
      parserProfileId: profile.profileId,
      rowCounts,
      warnings,
    },
    summary: {
      sourceRowCount: Object.values(rowCounts).reduce((a, b) => a + b, 0),
      acceptedRowCount: accepted,
      rejectedRowCount: rejected,
      dateRange: { start: dates.sort()[0] || null, end: dates.sort()[dates.length - 1] || null },
      serviceCount: serviceFacts.length,
      formulaCount: formulaFacts.length,
      visitCount: visitKeys.size,
      clientCount: clientKeys.size,
    },
  };
}

const serviceFormulaProfile = {
  profileId: "service_formula_workbook_v1",
  displayName: "Service Formula Workbook",
  priority: 10,
  detectWorkbook(workbook) {
    let bestScore = 0;
    for (const sheetName of workbook.SheetNames) {
      const rows = sheetRows(workbook, sheetName);
      const headerIdx = findHeaderRow(rows);
      if (headerIdx >= 0) {
        const map = columnMap(rows[headerIdx] || []);
        const score = ["serviceDate", "clientName", "serviceName", "rawProductValue", "quantityGrams"].filter((k) => map[k] != null).length;
        bestScore = Math.max(bestScore, score / 5);
      }
    }
    return { matched: bestScore >= 0.8, score: bestScore };
  },
  parse(workbook, context) {
    return buildFactsFromSheets(workbook, context, this);
  },
};

const syntheticRowsProfile = {
  profileId: "synthetic_normalized_rows_v1",
  displayName: "Synthetic Normalized Rows",
  priority: 20,
  detectWorkbook(workbook) {
    const first = workbook.SheetNames[0];
    if (!first) return { matched: false, score: 0 };
    const rows = sheetRows(workbook, first);
    const header = (rows[0] || []).map((c) => normalizeText(c));
    const required = ["event date", "client key", "service", "brand", "shade", "grams"];
    const score = required.filter((r) => header.includes(r)).length / required.length;
    return { matched: score >= 0.8, score };
  },
  parse(workbook, context) {
    const [sheetName] = workbook.SheetNames;
    const rows = sheetRows(workbook, sheetName);
    const header = (rows[0] || []).map((c) => normalizeText(c));
    const idx = (name) => header.indexOf(name);
    const facts = [];
    const clientKeys = new Set();
    const visitKeys = new Set();
    const dates = [];
    rows.slice(1).forEach((row, i) => {
      const sourceRowIndex = i + 1;
      const date = normalizeDate(row[idx("event date")]);
      const client = normalizeText(row[idx("client key")]);
      const service = String(row[idx("service")] || "").trim();
      const rawBrand = String(row[idx("brand")] || "").trim();
      const rawProductValue = String(row[idx("shade")] || "").trim();
      const serviceEventId = makeId("svc", `${context.uploadId}|synthetic|${sourceRowIndex}|${client}|${service}`);
      const formulaId = makeId("formula", `${serviceEventId}|formula`);
      const serviceStageId = makeId("stage", `${serviceEventId}|stage`);
      const clientVisitId = makeId("visit", `${context.salonId}|${date}|${client}`);
      const pseudoClient = stableAnonymousClient(`${context.salonId}|${client}`);
      if (date) dates.push(date);
      if (client) clientKeys.add(client);
      visitKeys.add(clientVisitId);
      facts.push({
        id: makeId("fact", `${serviceEventId}|service`),
        factLevel: FACT_LEVELS.SERVICE,
        serviceEventId,
        formulaId,
        serviceStageId,
        clientVisitId,
        pseudonymousClientId: pseudoClient,
        eventDate: date,
        eventTime: null,
        serviceType: classifyService(service, sheetName),
        payload: { serviceName: service, sheetName },
      });
      facts.push({
        id: makeId("fact", `${formulaId}|component|${sourceRowIndex}`),
        factLevel: FACT_LEVELS.FORMULA_COMPONENT,
        sourceRowIndex,
        serviceEventId,
        formulaId,
        serviceStageId,
        clientVisitId,
        pseudonymousClientId: pseudoClient,
        eventDate: date,
        eventTime: null,
        serviceType: classifyService(service, sheetName),
        rawBrand,
        rawProductLine: "",
        rawProductValue,
        normalizedProductKey: normalizeText(`${rawBrand} ${rawProductValue}`),
        quantityGrams: parseNumber(row[idx("grams")]),
        costValue: null,
        resolutionStatus: "unresolved",
        confidence: "none",
        payload: { parserProfileId: this.profileId, serviceName: service, sheetName },
      });
    });
    const services = facts.filter((f) => f.factLevel === FACT_LEVELS.SERVICE);
    facts.push(...services.map((svc) => ({ ...svc, id: makeId("fact", `${svc.formulaId}|formula`), factLevel: FACT_LEVELS.FORMULA })));
    facts.push(...services.map((svc) => ({ ...svc, id: makeId("fact", `${svc.serviceStageId}|stage`), factLevel: FACT_LEVELS.SERVICE_STAGE })));
    return {
      facts,
      dataQuality: { parserProfileId: this.profileId, rowCounts: { formula_component: rows.length - 1 }, warnings: [] },
      summary: {
        sourceRowCount: rows.length - 1,
        acceptedRowCount: rows.length - 1,
        rejectedRowCount: 0,
        dateRange: { start: dates.sort()[0] || null, end: dates.sort()[dates.length - 1] || null },
        serviceCount: services.length,
        formulaCount: services.length,
        visitCount: visitKeys.size,
        clientCount: clientKeys.size,
      },
    };
  },
};

const PROFILES = [serviceFormulaProfile, syntheticRowsProfile];

function detectProfile(workbook) {
  const detections = PROFILES.map((profile) => ({ profile, result: profile.detectWorkbook(workbook) }))
    .sort((a, b) => b.result.score - a.result.score || (b.profile.priority || 0) - (a.profile.priority || 0));
  const best = detections[0];
  if (!best || !best.result.matched) {
    throw new Error("No supported customer usage parser profile matched this workbook.");
  }
  return { profile: best.profile, detection: best.result };
}

function parseWithRegistry(buffer, context) {
  const workbook = Buffer.isBuffer(buffer) ? parseWorkbookBuffer(buffer) : buffer;
  const { profile, detection } = detectProfile(workbook);
  const parsed = profile.parse(workbook, context);
  return { ...parsed, parserProfileId: profile.profileId, parserProfileName: profile.displayName, detectionScore: detection.score };
}

module.exports = {
  PROFILES,
  parseWorkbookBuffer,
  parseWithRegistry,
};
