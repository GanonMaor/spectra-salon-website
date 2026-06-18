"use strict";

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { normalizeText, makeId } = require("./lib/customer-usage-intelligence/contracts");

const ROOT = path.join(process.cwd(), "reports", "reports-for-paul");
const OUTPUT = path.join(process.cwd(), "src", "data", "paul-usage-findings.json");

// ── Hebrew transliteration ────────────────────────────────────────────────────

const KNOWN_NAMES = {
  "שחר מלכה": "Shachar Malka",
  "שירה ארז": "Shira Erez",
  "ליאת קמפ": "Liat Kamp",
  "רעיה טובול": "Raya Tubul",
  "אורית זילברמן": "Orit Zilberman",
  "אילנית יפצ": "Ilanit Yafetz",
  "אתי קואטו": "Eti Kuato",
  "נופר ויצמן": "Nofar Weitzman",
  "מירב גולן": "Merav Golan",
  "שרונה בן דור": "Sharona Ben-Dor",
  "זהבית רביבו": "Zahavit Ravivo",
  "תמי עשור": "Tami Ashor",
};

const HE_TO_EN = {
  "א": "", "ב": "b", "ג": "g", "ד": "d", "ה": "h",
  "ו": "v", "ז": "z", "ח": "ch", "ט": "t", "י": "y",
  "כ": "k", "ך": "k", "ל": "l", "מ": "m", "ם": "m",
  "נ": "n", "ן": "n", "ס": "s", "ע": "", "פ": "p",
  "ף": "f", "צ": "tz", "ץ": "tz", "ק": "k", "ר": "r",
  "ש": "sh", "ת": "t",
};

function hasHebrew(str) {
  return /[\u05D0-\u05EA]/.test(str);
}

function transliterateHebrew(str) {
  if (!str || !hasHebrew(str)) return str;
  const clean = String(str).trim().replace(/\s+/g, " ");
  if (KNOWN_NAMES[clean]) return KNOWN_NAMES[clean];
  const result = clean
    .split("")
    .map((char) => {
      if (char === " ") return " ";
      return HE_TO_EN[char] !== undefined ? HE_TO_EN[char] : char;
    })
    .join("");
  return result
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim()
    || clean;
}

const COLUMN_ALIASES = {
  serviceDate: ["date", "תאריך"],
  serviceTime: ["time", "זמן"],
  clientName: ["client", "customer", "לקוח"],
  serviceName: ["service", "שירות"],
  rawBrand: ["brand", "מותג"],
  rawProductLine: ["series", "line", "סדרה"],
  rawProductValue: ["shade", "product", "גוון"],
  quantityGrams: ["grams", "weight", "גרם"],
  cost: ["cost", "עלות"],
  profile: ["profile", "staff", "פרופיל"],
};

const FAMILY_ORDER = ["Blonde", "Brunette", "Copper", "Red", "Fashion", "Natural / Neutral", "Unresolved"];
const FAMILY_COLORS = {
  Blonde: "#d7b76f",
  Brunette: "#7b5036",
  Copper: "#c8733d",
  Red: "#a93e48",
  Fashion: "#9a6bd5",
  "Natural / Neutral": "#b9a895",
  Unresolved: "#9ca3af",
};

const COMPANY_RULES = [
  { company: "L'Oréal Groupe", re: /l.?oreal|redken|matrix|kerastase|pulpriot/i },
  { company: "Wella Company", re: /wella|koleston|color touch|illuminage|illumina/i },
  { company: "Henkel / Schwarzkopf", re: /schwarzkopf|igora|indola|blondme/i },
  { company: "Kao Salon", re: /goldwell|joico/i },
  { company: "Alfaparf Milano", re: /alfaparf/i },
  { company: "Davines Group", re: /davines/i },
  { company: "Olaplex", re: /olaplex/i },
];

function fmtBrand(value) {
  return String(value || "Unknown")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromFile(file) {
  const raw = path.basename(file, ".xlsx").replace(/\s+(2025|2026)$/u, "").trim();
  return transliterateHebrew(raw);
}

function normalizeHeader(value) {
  return normalizeText(value).replace(/\s+/g, " ");
}

function normalizeDate(raw) {
  if (raw == null || raw === "") return null;
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) return raw.toISOString().slice(0, 10);
  const serial = Number(raw);
  if (Number.isFinite(serial) && serial > 40000 && serial < 70000) {
    return new Date((serial - 25569) * 86400 * 1000).toISOString().slice(0, 10);
  }
  const s = String(raw).trim();
  const m = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (m) {
    let [, a, b, y] = m;
    const year = y.length === 2 ? (Number(y) > 50 ? `19${y}` : `20${y}`) : y;
    let month = Number(a);
    let day = Number(b);
    if (month > 12 && day <= 12) [month, day] = [day, month];
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const candidate = new Date(`${iso}T00:00:00Z`);
    if (!Number.isNaN(candidate.getTime())) return iso;
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
  if (raw == null || raw === "") return 0;
  const n = Number(String(raw).replace(/,/g, ".").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function findHeaderRow(rows) {
  let best = { index: -1, score: 0 };
  rows.slice(0, 20).forEach((row, index) => {
    const normalized = row.map(normalizeHeader);
    const score = Object.values(COLUMN_ALIASES).reduce((acc, aliases) => {
      return acc + (aliases.some((alias) => normalized.includes(normalizeHeader(alias))) ? 1 : 0);
    }, 0);
    if (score > best.score) best = { index, score };
  });
  return best.score >= 6 ? best.index : -1;
}

function columnMap(header) {
  const normalized = header.map(normalizeHeader);
  const map = {};
  Object.entries(COLUMN_ALIASES).forEach(([key, aliases]) => {
    const idx = normalized.findIndex((h) => aliases.some((alias) => h === normalizeHeader(alias)));
    if (idx >= 0) map[key] = idx;
  });
  return map;
}

function value(row, map, key) {
  return map[key] == null ? null : row[map[key]];
}

function classifyService(serviceName) {
  const s = normalizeText(serviceName);
  if (/toner|gloss|טונר/.test(s)) return "Toner";
  if (/highlight|balayage|foil|גוונים|הבהר|בליאז/.test(s)) return "Highlights / Balayage";
  if (/root|grey|gray|שורש|לבן/.test(s)) return "Root / Grey Coverage";
  if (/length|refresh|אורך/.test(s)) return "Color Lengths";
  if (/full|color|colour|צבע/.test(s)) return "Full Color";
  return "Other";
}

function classifyRole(row) {
  const raw = normalizeText(`${row.rawBrand} ${row.rawLine} ${row.rawShade}`);
  if (/developer|oxidant|oxydant|diactivator|activator|peroxide|חמצן|\b\d+\s*vol\b|\b\d+(\.\d+)?\s*%/.test(raw)) return "developer";
  if (/bleach|lightener|blondor|blondme|blond studio|platinium|powder|poudre|freelights|decolor|הבהרה/.test(raw)) return "lightener";
  if (/olaplex|smartbond|treatment|mask|shampoo|conditioner|care|repair|serum|metal dx|plex/.test(raw)) return "treatment_or_accessory";
  if (extractShadeCode(row.rawShade)) return "shade_color";
  return "other";
}

function extractShadeCode(raw) {
  const s = String(raw || "").trim().replace(",", ".");
  const match = s.match(/\b(\d{1,2})(?:[./](\d{1,3}))?\b/);
  if (!match) return null;
  const level = Number(match[1]);
  if (!Number.isFinite(level) || level < 1 || level > 12) return null;
  return match[2] ? `${level}.${match[2]}` : String(level);
}

function shadeLevel(code) {
  const m = String(code || "").match(/^(\d{1,2})/);
  const level = m ? Number(m[1]) : null;
  return Number.isFinite(level) ? level : null;
}

function toneDigits(code) {
  const m = String(code || "").match(/^[0-9]{1,2}\.([0-9]+)/);
  return m ? m[1] : "";
}

function toneDirection(code, rawShade) {
  const text = normalizeText(rawShade);
  const tone = toneDigits(code);
  if (/ash|irise|violet|blue|cool|cendre|pearl|matt/.test(text) || /[127]/.test(tone)) return "Cool";
  if (/gold|warm|beige|copper|red|mahogany|auburn|dor/.test(text) || /[34568]/.test(tone)) return "Warm";
  if (/natural|neutral|base/.test(text) || !tone || /^0+$/.test(tone)) return "Natural";
  return "Balanced";
}

function colorFamily(row) {
  if (row.role !== "shade_color") return null;
  const text = normalizeText(`${row.rawLine} ${row.rawShade}`);
  const code = row.shadeCode;
  const tone = toneDigits(code);
  if (/pink|violet|blue|green|purple|pastel|vivid|fashion/.test(text)) return "Fashion";
  if (/copper|cuivr/.test(text) || /4/.test(tone)) return "Copper";
  if (/red|rouge|mahogany|auburn/.test(text) || /[56]/.test(tone)) return "Red";
  if (/natural|neutral|clear|base/.test(text) && (!code || /^0+$/.test(tone))) return "Natural / Neutral";
  const level = shadeLevel(code);
  if (level != null && level >= 8) return "Blonde";
  if (level != null && level >= 1) return "Brunette";
  return "Unresolved";
}

function companyFor(row) {
  const haystack = `${row.rawBrand || ""} ${row.rawLine || ""}`;
  const match = COMPANY_RULES.find((rule) => rule.re.test(haystack));
  return match ? match.company : fmtBrand(row.rawBrand);
}

function cleanClientName(value) {
  const raw = String(value || "Unknown Client").replace(/\s+/g, " ").trim();
  return transliterateHebrew(raw);
}

function parseWorkbook(file) {
  const wb = XLSX.readFile(path.join(ROOT, file), { raw: true, cellDates: false });
  const sheetName = wb.SheetNames.includes("All") ? "All" : wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: null, raw: true });
  const headerIndex = findHeaderRow(rows);
  if (headerIndex < 0) throw new Error(`No supported header found in ${file}`);
  const map = columnMap(rows[headerIndex] || []);
  const salon = titleFromFile(file);
  const year = (file.match(/\b(2025|2026)\b/) || [null, "Unknown"])[1];
  const services = [];
  const components = [];
  let current = null;
  let ordinal = 0;

  rows.slice(headerIndex + 1).forEach((row, offset) => {
    const rawBrand = String(value(row, map, "rawBrand") || "").trim();
    const rawLine = String(value(row, map, "rawProductLine") || "").trim();
    const rawShade = String(value(row, map, "rawProductValue") || "").trim();
    const serviceName = String(value(row, map, "serviceName") || "").trim();
    const date = normalizeDate(value(row, map, "serviceDate"));
    const time = normalizeTime(value(row, map, "serviceTime"));
    const hasProduct = Boolean(rawBrand || rawLine || rawShade);

    if (!hasProduct && (serviceName || date)) {
      ordinal += 1;
      const clientName = cleanClientName(value(row, map, "clientName"));
      const serviceId = makeId("svc", `${file}|${sheetName}|${headerIndex + 1 + offset}|${ordinal}`);
      current = {
        serviceId,
        salon,
        year,
        date,
        time,
        clientName,
        clientKey: normalizeText(clientName),
        serviceName,
        serviceType: classifyService(serviceName),
        totalGrams: parseNumber(value(row, map, "quantityGrams")),
        totalCost: parseNumber(value(row, map, "cost")),
        components: [],
      };
      services.push(current);
      return;
    }

    if (!hasProduct || !current) return;
    const component = {
      id: makeId("cmp", `${current.serviceId}|${offset}|${rawBrand}|${rawLine}|${rawShade}`),
      serviceId: current.serviceId,
      salon,
      year,
      date: current.date,
      time: current.time,
      clientName: current.clientName,
      clientKey: current.clientKey,
      serviceName: current.serviceName,
      serviceType: current.serviceType,
      rawBrand: fmtBrand(rawBrand),
      rawLine: fmtBrand(rawLine),
      rawShade: String(rawShade || "Unknown").trim(),
      grams: parseNumber(value(row, map, "quantityGrams")),
      cost: parseNumber(value(row, map, "cost")),
    };
    component.role = classifyRole(component);
    component.shadeCode = extractShadeCode(component.rawShade);
    component.family = colorFamily(component);
    component.company = companyFor(component);
    component.toneDirection = toneDirection(component.shadeCode, component.rawShade);
    component.shadeKey = normalizeText([component.company, component.rawBrand, component.rawLine, component.shadeCode || component.rawShade].join("|"));
    current.components.push(component.id);
    components.push(component);
  });

  return { salon, year, sourceFile: file, services, components };
}

function addAgg(map, key, row, extra = {}) {
  if (!map.has(key)) {
    map.set(key, {
      ...extra,
      grams: 0,
      formulas: new Set(),
      services: new Set(),
      clients: new Set(),
      salons: new Set(),
      rows: 0,
    });
  }
  const item = map.get(key);
  item.grams += row.grams || 0;
  item.formulas.add(row.serviceId);
  item.services.add(row.serviceId);
  item.clients.add(`${row.salon}|${row.clientKey}`);
  item.salons.add(row.salon);
  item.rows += 1;
  return item;
}

function finalizeAgg(item) {
  return {
    ...item,
    grams: Math.round(item.grams * 10) / 10,
    formulas: item.formulas.size,
    services: item.services.size,
    clients: item.clients.size,
    salons: Array.from(item.salons).sort(),
  };
}

function dominantShadeEvent(service, componentById) {
  const shades = service.components.map((id) => componentById.get(id)).filter((row) => row && row.role === "shade_color" && row.family);
  if (!shades.length) return null;
  const byFamily = new Map();
  shades.forEach((row) => addAgg(byFamily, row.family, row, { family: row.family }));
  const familyAgg = Array.from(byFamily.values()).sort((a, b) => b.grams - a.grams)[0];
  const topShade = [...shades].sort((a, b) => (b.grams || 0) - (a.grams || 0))[0];
  return {
    date: service.date,
    time: service.time,
    serviceName: service.serviceName,
    serviceType: service.serviceType,
    family: familyAgg.family,
    familyGrams: Math.round(familyAgg.grams * 10) / 10,
    shadeCode: topShade.shadeCode || topShade.rawShade,
    shadeName: topShade.rawShade,
    brand: topShade.rawBrand,
    line: topShade.rawLine,
    company: topShade.company,
    level: shadeLevel(topShade.shadeCode),
    toneDirection: topShade.toneDirection,
  };
}

function significantChange(previous, next) {
  const levelDelta = previous.level != null && next.level != null ? Math.abs(next.level - previous.level) : 0;
  const familyChanged = previous.family && next.family && previous.family !== next.family;
  const toneChanged = previous.toneDirection && next.toneDirection && previous.toneDirection !== next.toneDirection;
  const relevantService = /color|toner|highlight|balayage|coverage|length/i.test(`${previous.serviceType} ${next.serviceType}`);
  if (!relevantService) return null;
  if (levelDelta >= 2 || familyChanged || (levelDelta >= 1 && toneChanged)) {
    const reasons = [];
    if (familyChanged) reasons.push(`${previous.family} to ${next.family}`);
    if (levelDelta >= 2) reasons.push(`${levelDelta} level shift`);
    if (toneChanged) reasons.push(`${previous.toneDirection} to ${next.toneDirection}`);
    return reasons.join(", ");
  }
  return null;
}

function buildDataset() {
  const files = fs.readdirSync(ROOT).filter((file) => file.endsWith(".xlsx")).sort((a, b) => a.localeCompare(b, "en"));
  const parsed = files.map(parseWorkbook);
  const services = parsed.flatMap((p) => p.services);
  const components = parsed.flatMap((p) => p.components);
  const shadeRows = components.filter((row) => row.role === "shade_color" && row.family);
  const componentById = new Map(components.map((row) => [row.id, row]));
  const totalShadeGrams = shadeRows.reduce((acc, row) => acc + row.grams, 0);

  const salonFamilies = new Map();
  const familySalons = new Map();
  const overallShades = new Map();
  const familyShades = new Map();

  shadeRows.forEach((row) => {
    addAgg(salonFamilies, `${row.salon}|${row.family}`, row, { salon: row.salon, family: row.family });
    addAgg(familySalons, `${row.family}|${row.salon}`, row, { family: row.family, salon: row.salon });
    addAgg(overallShades, row.shadeKey, row, {
      shadeCode: row.shadeCode || row.rawShade,
      shadeName: row.rawShade,
      brand: row.rawBrand,
      productLine: row.rawLine,
      company: row.company,
      family: row.family,
      toneDirection: row.toneDirection,
    });
    addAgg(familyShades, `${row.family}|${row.shadeKey}`, row, {
      family: row.family,
      shadeCode: row.shadeCode || row.rawShade,
      shadeName: row.rawShade,
      brand: row.rawBrand,
      productLine: row.rawLine,
      company: row.company,
      toneDirection: row.toneDirection,
    });
  });

  const familyTotals = FAMILY_ORDER.map((family) => {
    const rows = shadeRows.filter((row) => row.family === family);
    const grams = rows.reduce((acc, row) => acc + row.grams, 0);
    const salons = [...new Set(rows.map((row) => row.salon))].sort();
    return {
      family,
      color: FAMILY_COLORS[family],
      grams: Math.round(grams * 10) / 10,
      share: totalShadeGrams ? Math.round((grams / totalShadeGrams) * 1000) / 10 : 0,
      salons,
      salonCount: salons.length,
      services: new Set(rows.map((row) => row.serviceId)).size,
      clients: new Set(rows.map((row) => `${row.salon}|${row.clientKey}`)).size,
    };
  }).filter((row) => row.grams > 0);

  const salonFamilyMatrix = Array.from(salonFamilies.values()).map(finalizeAgg)
    .map((row) => ({ ...row, shareOfFamily: 0 }))
    .sort((a, b) => a.family.localeCompare(b.family) || b.grams - a.grams);
  const familyGrams = new Map(familyTotals.map((row) => [row.family, row.grams]));
  salonFamilyMatrix.forEach((row) => {
    row.shareOfFamily = familyGrams.get(row.family) ? Math.round((row.grams / familyGrams.get(row.family)) * 1000) / 10 : 0;
  });

  const top20Shades = Array.from(overallShades.values()).map(finalizeAgg)
    .sort((a, b) => b.grams - a.grams)
    .slice(0, 20)
    .map((row, index) => ({
      rank: index + 1,
      ...row,
      share: totalShadeGrams ? Math.round((row.grams / totalShadeGrams) * 1000) / 10 : 0,
    }));

  const top5ByFamily = FAMILY_ORDER.map((family) => ({
    family,
    color: FAMILY_COLORS[family],
    shades: Array.from(familyShades.values())
      .filter((row) => row.family === family)
      .map(finalizeAgg)
      .sort((a, b) => b.grams - a.grams)
      .slice(0, 5)
      .map((row, index) => ({
        rank: index + 1,
        ...row,
        shareOfFamily: familyGrams.get(family) ? Math.round((row.grams / familyGrams.get(family)) * 1000) / 10 : 0,
      })),
  })).filter((row) => row.shades.length);

  const events = services.map((service) => ({ service, dominant: dominantShadeEvent(service, componentById) }))
    .filter((event) => event.dominant && event.dominant.date);
  const byClient = new Map();
  events.forEach(({ service, dominant }) => {
    const key = `${service.salon}|${service.clientKey}`;
    if (!byClient.has(key)) byClient.set(key, { salon: service.salon, clientName: service.clientName, events: [] });
    byClient.get(key).events.push(dominant);
  });

  const shadeJourneys = [];
  byClient.forEach((client) => {
    client.events.sort((a, b) => `${a.date} ${a.time || ""}`.localeCompare(`${b.date} ${b.time || ""}`));
    const changes = [];
    for (let i = 1; i < client.events.length; i += 1) {
      const reason = significantChange(client.events[i - 1], client.events[i]);
      if (reason) {
        changes.push({ from: client.events[i - 1], to: client.events[i], reason });
      }
    }
    if (changes.length) {
      shadeJourneys.push({
        salon: client.salon,
        clientName: client.clientName,
        visitCount: client.events.length,
        changeCount: changes.length,
        firstVisit: client.events[0].date,
        lastVisit: client.events[client.events.length - 1].date,
        start: client.events[0],
        end: client.events[client.events.length - 1],
        changes,
      });
    }
  });
  shadeJourneys.sort((a, b) => b.changeCount - a.changeCount || b.visitCount - a.visitCount || a.salon.localeCompare(b.salon));

  const salonSummaries = parsed.reduce((acc, workbook) => {
    if (!acc[workbook.salon]) acc[workbook.salon] = { salon: workbook.salon, files: [], services: 0, clients: new Set(), shadeGrams: 0, years: new Set() };
    const summary = acc[workbook.salon];
    summary.files.push(workbook.sourceFile);
    summary.years.add(workbook.year);
    workbook.services.forEach((service) => summary.clients.add(service.clientKey));
    summary.services += workbook.services.length;
    summary.shadeGrams += workbook.components.filter((row) => row.role === "shade_color").reduce((sum, row) => sum + row.grams, 0);
    return acc;
  }, {});

  const salons = Object.values(salonSummaries).map((row) => ({
    salon: row.salon,
    files: row.files,
    years: Array.from(row.years).sort(),
    services: row.services,
    clients: row.clients.size,
    shadeGrams: Math.round(row.shadeGrams * 10) / 10,
  })).sort((a, b) => b.shadeGrams - a.shadeGrams);

  const developerRows = components.filter((row) => row.role === "developer");
  const lightenerRows = components.filter((row) => row.role === "lightener");

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      sourceFolder: "reports/reports-for-paul",
      workbookCount: files.length,
      salonCount: salons.length,
      note: "Built from each workbook's All sheet only to avoid duplicate salon sheets.",
      totals: {
        services: services.length,
        componentRows: components.length,
        shadeRows: shadeRows.length,
        shadeGrams: Math.round(totalShadeGrams * 10) / 10,
        developerRows: developerRows.length,
        lightenerRows: lightenerRows.length,
        clients: new Set(services.map((service) => `${service.salon}|${service.clientKey}`)).size,
      },
    },
    salons,
    familyTotals,
    salonFamilyMatrix,
    top20Shades,
    top5ByFamily,
    shadeJourneys,
  };
}

const dataset = buildDataset();
fs.writeFileSync(OUTPUT, `${JSON.stringify(dataset, null, 2)}\n`);
console.log(`Wrote ${OUTPUT}`);
console.log(JSON.stringify(dataset.metadata, null, 2));
