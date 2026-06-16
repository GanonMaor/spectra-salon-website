#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const SOURCE_DIR = path.resolve(__dirname, "../reports/pol-customer-usage/source-excels");
const RAW_OUTPUT_FILE = path.resolve(__dirname, "../reports/pol-customer-usage/pol-customer-usage.raw.json");
const SUMMARY_OUTPUT_FILE = path.resolve(__dirname, "../src/data/pol-customer-usage-summary.json");

const EXPECTED_HEADERS = [
  "Date",
  "Time",
  "Client",
  "Service",
  "Brand",
  "Series",
  "Shade",
  "Grams",
  "Cost",
  "Rounded",
  "Reweight",
  "Profile",
];

function cleanString(value) {
  return String(value ?? "").trim();
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const cleaned = String(value).replace(/[,\s]/g, "").trim();
  if (!cleaned || cleaned === "-") return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function parseDateParts(value) {
  const raw = cleanString(value);
  const match = raw.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/);
  if (!match) return { date: raw || null, year: null, month: null, day: null, monthKey: null };

  const [, mmRaw, ddRaw, yyRaw] = match;
  const year = yyRaw.length === 2 ? 2000 + Number(yyRaw) : Number(yyRaw);
  const month = Number(mmRaw);
  const day = Number(ddRaw);
  const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return {
    date,
    year,
    month,
    day,
    monthKey: `${year}-${String(month).padStart(2, "0")}`,
  };
}

function customerNameFromFile(fileName) {
  return fileName.replace(/\.xlsx$/i, "").replace(/\s+20\d{2}$/i, "").trim();
}

function yearFromFile(fileName) {
  const match = fileName.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : null;
}

function findHeaderRow(rows) {
  return rows.findIndex((row) => {
    const normalized = row.map(cleanString);
    return (
      normalized.includes("Time") &&
      normalized.includes("Client") &&
      normalized.includes("Service") &&
      normalized.includes("Brand") &&
      normalized.includes("Grams")
    );
  });
}

function buildColumnMap(headerRow) {
  const normalized = headerRow.map(cleanString);
  return EXPECTED_HEADERS.reduce((map, header, fallbackIndex) => {
    const index = normalized.indexOf(header);
    map[header] = index >= 0 ? index : fallbackIndex;
    return map;
  }, {});
}

function getCell(row, columnMap, header) {
  return row[columnMap[header]];
}

function readWorkbookRows(fileName) {
  const filePath = path.join(SOURCE_DIR, fileName);
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  const sheetName = workbook.SheetNames.includes("All") ? "All" : workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    raw: false,
    defval: "",
    blankrows: false,
  });
  const headerIndex = findHeaderRow(rows);

  if (headerIndex < 0) {
    throw new Error(`Could not find a usage header row in ${fileName}`);
  }

  const columnMap = buildColumnMap(rows[headerIndex]);
  const sourceCustomer = customerNameFromFile(fileName);
  const sourceYear = yearFromFile(fileName);

  return rows
    .slice(headerIndex + 1)
    .map((row, index) => {
      const dateParts = parseDateParts(getCell(row, columnMap, "Date"));
      const brand = cleanString(getCell(row, columnMap, "Brand"));
      const series = cleanString(getCell(row, columnMap, "Series"));
      const shade = cleanString(getCell(row, columnMap, "Shade"));

      return {
        id: `${fileName.replace(/\.xlsx$/i, "")}:${index + 1}`,
        sourceFile: fileName,
        sourceSheet: sheetName,
        sourceCustomer,
        sourceYear,
        profile: cleanString(getCell(row, columnMap, "Profile")) || sourceCustomer,
        date: dateParts.date,
        year: dateParts.year ?? sourceYear,
        month: dateParts.month,
        day: dateParts.day,
        monthKey: dateParts.monthKey,
        time: cleanString(getCell(row, columnMap, "Time")) || null,
        client: cleanString(getCell(row, columnMap, "Client")) || null,
        service: cleanString(getCell(row, columnMap, "Service")) || null,
        brand: brand || null,
        series: series || null,
        shade: shade || null,
        grams: parseNumber(getCell(row, columnMap, "Grams")),
        cost: parseNumber(getCell(row, columnMap, "Cost")),
        rounded: cleanString(getCell(row, columnMap, "Rounded")) || null,
        reweight: cleanString(getCell(row, columnMap, "Reweight")) || null,
        rowType: brand || series || shade ? "product_line" : "service_total",
      };
    })
    .filter((row) => row.date && row.service);
}

function createCounter() {
  return new Map();
}

function addCounter(counter, key, amount = 1) {
  if (!key) return;
  counter.set(key, (counter.get(key) ?? 0) + amount);
}

function topEntries(counter, limit = 12) {
  return [...counter.entries()]
    .map(([name, value]) => ({ name, value: round(value) }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function summarizeRows(rows, files) {
  const monthMap = new Map();
  const customerMap = new Map();
  const yearMap = new Map();
  const brandGrams = createCounter();
  const serviceCount = createCounter();
  const seriesGrams = createCounter();
  const shadeGrams = createCounter();
  const clients = new Set();
  const profiles = new Set();

  let totalGrams = 0;
  let totalCost = 0;
  let serviceCountTotal = 0;
  let productLineCount = 0;

  for (const row of rows) {
    if (row.client) clients.add(row.client);
    if (row.profile) profiles.add(row.profile);

    const isProductLine = row.rowType === "product_line";
    const gramsForMaterial = isProductLine ? row.grams : 0;
    const costForMaterial = isProductLine ? row.cost : 0;

    if (isProductLine) {
      productLineCount += 1;
      totalGrams += gramsForMaterial;
      totalCost += costForMaterial;
      addCounter(brandGrams, row.brand, gramsForMaterial);
      addCounter(seriesGrams, row.series, gramsForMaterial);
      addCounter(shadeGrams, row.shade, gramsForMaterial);
    } else {
      serviceCountTotal += 1;
      addCounter(serviceCount, row.service);
    }

    const monthKey = row.monthKey || "unknown";
    const customerKey = row.sourceCustomer;
    const yearKey = String(row.year ?? row.sourceYear ?? "unknown");

    for (const [map, key] of [
      [monthMap, monthKey],
      [customerMap, customerKey],
      [yearMap, yearKey],
    ]) {
      if (!map.has(key)) {
        map.set(key, {
          key,
          totalGrams: 0,
          totalCost: 0,
          services: 0,
          productLines: 0,
          clients: new Set(),
        });
      }

      const item = map.get(key);
      if (row.client) item.clients.add(row.client);
      if (isProductLine) {
        item.totalGrams += gramsForMaterial;
        item.totalCost += costForMaterial;
        item.productLines += 1;
      } else {
        item.services += 1;
      }
    }
  }

  function serializeGroup(item) {
    return {
      key: item.key,
      totalGrams: round(item.totalGrams),
      totalCost: round(item.totalCost),
      services: item.services,
      productLines: item.productLines,
      uniqueClients: item.clients.size,
      averageGramsPerService: item.services > 0 ? round(item.totalGrams / item.services) : 0,
      averageCostPerService: item.services > 0 ? round(item.totalCost / item.services) : 0,
    };
  }

  return {
    generatedAt: new Date().toISOString(),
    sourceDirectory: path.relative(path.resolve(__dirname, ".."), SOURCE_DIR),
    sourceFiles: files,
    totals: {
      files: files.length,
      rows: rows.length,
      serviceRows: serviceCountTotal,
      productRows: productLineCount,
      customers: customerMap.size,
      profiles: profiles.size,
      uniqueClients: clients.size,
      totalGrams: round(totalGrams),
      totalCost: round(totalCost),
      averageGramsPerService: serviceCountTotal > 0 ? round(totalGrams / serviceCountTotal) : 0,
      averageCostPerService: serviceCountTotal > 0 ? round(totalCost / serviceCountTotal) : 0,
    },
    byMonth: [...monthMap.values()].map(serializeGroup).sort((a, b) => a.key.localeCompare(b.key)),
    byCustomer: [...customerMap.values()].map(serializeGroup).sort((a, b) => b.totalGrams - a.totalGrams),
    byYear: [...yearMap.values()].map(serializeGroup).sort((a, b) => a.key.localeCompare(b.key)),
    topBrandsByGrams: topEntries(brandGrams),
    topSeriesByGrams: topEntries(seriesGrams),
    topShadesByGrams: topEntries(shadeGrams),
    topServicesByCount: topEntries(serviceCount),
  };
}

function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Source folder not found: ${SOURCE_DIR}`);
  }

  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((file) => file.toLowerCase().endsWith(".xlsx") && !file.startsWith("~$"))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    throw new Error(`No .xlsx files found in ${SOURCE_DIR}`);
  }

  const rows = files.flatMap(readWorkbookRows);
  const metadata = summarizeRows(rows, files);
  const fullOutput = { metadata, rows };
  const summaryOutput = {
    metadata,
    sampleRows: rows.slice(0, 200),
  };

  fs.mkdirSync(path.dirname(RAW_OUTPUT_FILE), { recursive: true });
  fs.mkdirSync(path.dirname(SUMMARY_OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(RAW_OUTPUT_FILE, `${JSON.stringify(fullOutput, null, 2)}\n`, "utf8");
  fs.writeFileSync(SUMMARY_OUTPUT_FILE, `${JSON.stringify(summaryOutput, null, 2)}\n`, "utf8");

  const rawSizeMb = (Buffer.byteLength(JSON.stringify(fullOutput)) / 1024 / 1024).toFixed(2);
  const summarySizeKb = (Buffer.byteLength(JSON.stringify(summaryOutput)) / 1024).toFixed(1);
  console.log(`Processed ${files.length} files`);
  console.log(`Wrote ${rows.length} rows to ${path.relative(process.cwd(), RAW_OUTPUT_FILE)} (${rawSizeMb} MB)`);
  console.log(`Wrote report summary to ${path.relative(process.cwd(), SUMMARY_OUTPUT_FILE)} (${summarySizeKb} KB)`);
  console.log(
    `Totals: ${metadata.totals.serviceRows} services, ${metadata.totals.productRows} product rows, ${metadata.totals.totalGrams}g`,
  );
}

main();
