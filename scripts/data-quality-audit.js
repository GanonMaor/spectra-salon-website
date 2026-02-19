#!/usr/bin/env node
/**
 * data-quality-audit.js
 * Comprehensive QA check across all users_susege_reports files.
 * Validates data sync, country derivation, anomalies, and consistency.
 *
 * Outputs: reports/users_susege_reports/data-quality-report.json
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { normalizePhone, isIsraeliPhone, resolveCountry } = require("./country-resolver");
const { discoverReportFiles, MONTH_ORDER, MONTH_ALIASES } = require("./report-discovery");

const REPORTS_DIR = path.resolve(__dirname, "..", "reports", "users_susege_reports");
const MARKET_JSON = path.resolve(__dirname, "..", "src", "data", "market-intelligence.json");
const USAGE_JSON = path.resolve(__dirname, "..", "src", "data", "usage-reports.json");
const OUTPUT = path.resolve(REPORTS_DIR, "data-quality-report.json");

function parseNum(v) {
  if (v == null || v === "") return 0;
  const n = typeof v === "string" ? parseFloat(v.replace(/,/g, "")) : Number(v);
  return isNaN(n) ? 0 : n;
}

function monthKey(month, year) {
  const m = month.charAt(0).toUpperCase() + month.slice(1, 3).toLowerCase();
  return `${m} ${year}`;
}

function sortableIdx(month, year) {
  const lower = month.toLowerCase();
  let idx = MONTH_ORDER.indexOf(lower);
  if (idx < 0) idx = MONTH_ORDER.findIndex((m) => m.startsWith(lower) || lower.startsWith(m));
  return year * 100 + (idx >= 0 ? idx : 0);
}

function main() {
  const discovered = discoverReportFiles(REPORTS_DIR);
  const files = discovered.map((d) => d.fileName);
  console.log(`\n=== Data Quality Audit ===`);
  console.log(`Files found: ${discovered.length} (recursive)\n`);

  const report = {
    _generated: new Date().toISOString(),
    filesAnalyzed: files.length,
    perFile: [],
    perMonth: {},
    countryClassification: {
      byPhone: 0,
      byState: 0,
      unknown: 0,
      phonePromotedToIsrael: 0,
      totalUsersWithPhone: 0,
      totalUsersWithoutPhone: 0,
    },
    anomalies: [],
    deduplication: { totalRawRows: 0, afterDedup: 0, duplicatesRemoved: 0 },
    userCountryMap: {},
  };

  // Parse all files and collect raw rows
  const allRawRows = [];

  for (const entry of discovered) {
    const file = entry.fileName;
    const filePath = entry.filePath;
    const wb = XLSX.readFile(filePath);

    const isConsolidated = entry.isMultiSheet;

    const fileReport = {
      fileName: file,
      isConsolidated,
      sheetCount: wb.SheetNames.length,
      sheets: [],
      totalRows: 0,
      hasPhoneColumn: false,
      phoneCount: 0,
      monthsCovered: [],
    };

    const sheetsToProcess = [];

    if (!entry.isMultiSheet && entry.hintMonth) {
      sheetsToProcess.push({ ws: wb.Sheets[wb.SheetNames[0]], sheetName: wb.SheetNames[0], hintMonth: entry.hintMonth, hintYear: entry.hintYear });
    } else {
      for (const sn of wb.SheetNames) {
        const ws = wb.Sheets[sn];
        const sm = sn.toLowerCase().match(/^([a-z]+)\s*(\d{4})$/);
        let hm = sm ? sm[1] : null;
        let hy = sm ? parseInt(sm[2], 10) : null;
        if (hm && MONTH_ALIASES[hm]) hm = MONTH_ALIASES[hm];
        sheetsToProcess.push({ ws, sheetName: sn, hintMonth: hm, hintYear: hy });
      }
    }

    for (const { ws, sheetName, hintMonth, hintYear } of sheetsToProcess) {
      const rawRows = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (!rawRows || rawRows.length < 2) {
        fileReport.sheets.push({ sheetName, rowCount: 0, headerRow: -1 });
        continue;
      }

      let headerIdx = 1;
      const row0Str = (rawRows[0] || []).map((v) => String(v).toLowerCase());
      if (row0Str.includes("userid") || row0Str.includes("year")) headerIdx = 0;

      const headers = rawRows[headerIdx];
      if (!headers) {
        fileReport.sheets.push({ sheetName, rowCount: 0, headerRow: headerIdx });
        continue;
      }

      const headerLower = headers.map((h) => (h || "").toString().toLowerCase());
      const get = (raw, name) => {
        const idx = headerLower.indexOf(name.toLowerCase());
        return idx >= 0 ? raw[idx] : null;
      };
      const hasPhone = headerLower.includes("phonenumber") || headerLower.includes("phone");
      if (hasPhone) fileReport.hasPhoneColumn = true;

      const dataRows = rawRows.slice(headerIdx + 1);
      let parsedCount = 0;
      let sheetPhones = 0;

      const internalYears = new Set();

      for (const raw of dataRows) {
        if (!raw || raw.length === 0) continue;
        const userId = (get(raw, "userId") || "").toString().trim();
        if (!userId) continue;

        const internalYear = parseNum(get(raw, "Year")) || 0;
        if (internalYear > 0) internalYears.add(internalYear);
        const year = hintYear || internalYear;
        const monthRaw = (hintMonth || get(raw, "Month") || "").toString().toLowerCase();
        const month = MONTH_ALIASES[monthRaw] || monthRaw;

        const phoneRaw = get(raw, "PhoneNumber") || get(raw, "Phone") || get(raw, "phone");
        const stateRaw = (get(raw, "State") || "").toString().trim();
        const country = resolveCountry({ phone: phoneRaw, state: stateRaw });
        const phone = normalizePhone(phoneRaw);

        const mk = monthKey(month, year);

        allRawRows.push({
          userId,
          brand: (get(raw, "Brand") || "Unknown").toString().trim(),
          mk,
          si: sortableIdx(month, year),
          country,
          phone,
          state: stateRaw,
          phoneUsed: phone.length > 0,
          phoneIsIsraeli: isIsraeliPhone(phone),
          totalServices: parseNum(get(raw, "Total services")),
          totalGrams: parseNum(get(raw, "Total grams")),
          totalCost: parseNum(get(raw, "Total cost")),
          sourceFile: file,
          sourceSheet: sheetName,
        });

        if (phone) sheetPhones++;
        parsedCount++;
      }

      if (hintYear && internalYears.size > 0 && !internalYears.has(hintYear)) {
        report.anomalies.push({
          type: "YEAR_MISMATCH",
          file,
          sheet: sheetName,
          fileNameYear: hintYear,
          internalYears: [...internalYears],
          severity: "CRITICAL",
          description: `File/sheet implies year ${hintYear} but internal data has Year=${[...internalYears].join(",")}. Data may be mislabeled copy!`,
        });
      }

      fileReport.sheets.push({
        sheetName,
        rowCount: parsedCount,
        headerRow: headerIdx,
        hasPhone,
        phoneCount: sheetPhones,
        expectedMonth: hintMonth ? monthKey(hintMonth, hintYear) : null,
      });
      fileReport.totalRows += parsedCount;
      fileReport.phoneCount += sheetPhones;
    }

    const monthsSet = new Set();
    for (const r of allRawRows.filter((r) => r.sourceFile === file)) monthsSet.add(r.mk);
    fileReport.monthsCovered = [...monthsSet].sort();

    if (!entry.isMultiSheet && entry.hintMonth) {
      const expectedMk = monthKey(entry.hintMonth, entry.hintYear);
      const internalMonths = [...monthsSet];
      if (internalMonths.length > 0 && !internalMonths.includes(expectedMk)) {
        report.anomalies.push({
          type: "MONTH_MISMATCH",
          file: path.relative(REPORTS_DIR, entry.filePath),
          expected: expectedMk,
          found: internalMonths,
          severity: "HIGH",
          description: `File name implies ${expectedMk} but internal data contains: ${internalMonths.join(", ")}`,
        });
      }
    }

    report.perFile.push(fileReport);
    console.log(`  ${path.relative(REPORTS_DIR, entry.filePath)}: ${fileReport.totalRows} rows, ${fileReport.sheets.length} sheet(s), phone: ${fileReport.hasPhoneColumn ? "YES" : "NO"}`);
  }

  // Deduplication analysis
  report.deduplication.totalRawRows = allRawRows.length;
  const seen = new Set();
  const dedupRows = [];
  for (const r of allRawRows) {
    const dk = `${r.userId}|${r.brand}|${r.mk}`;
    if (seen.has(dk)) continue;
    seen.add(dk);
    dedupRows.push(r);
  }
  report.deduplication.afterDedup = dedupRows.length;
  report.deduplication.duplicatesRemoved = allRawRows.length - dedupRows.length;
  console.log(`\nDeduplication: ${allRawRows.length} raw → ${dedupRows.length} unique (${report.deduplication.duplicatesRemoved} duplicates)`);

  // Per-month analysis
  const monthMap = {};
  for (const r of dedupRows) {
    if (!monthMap[r.mk]) {
      monthMap[r.mk] = {
        label: r.mk,
        sortIdx: r.si,
        rowCount: 0,
        uniqueUsers: new Set(),
        uniqueBrands: new Set(),
        totalServices: 0,
        totalGrams: 0,
        totalCost: 0,
        sourceFiles: new Set(),
        phoneCoverage: 0,
        countries: {},
      };
    }
    const m = monthMap[r.mk];
    m.rowCount++;
    m.uniqueUsers.add(r.userId);
    m.uniqueBrands.add(r.brand);
    m.totalServices += r.totalServices;
    m.totalGrams += r.totalGrams;
    m.totalCost += r.totalCost;
    m.sourceFiles.add(r.sourceFile);
    if (r.phoneUsed) m.phoneCoverage++;
    m.countries[r.country] = (m.countries[r.country] || 0) + 1;
  }

  const sortedMonths = Object.keys(monthMap).sort((a, b) => monthMap[a].sortIdx - monthMap[b].sortIdx);

  for (const mk of sortedMonths) {
    const m = monthMap[mk];
    report.perMonth[mk] = {
      label: mk,
      rowCount: m.rowCount,
      uniqueUsers: m.uniqueUsers.size,
      uniqueBrands: m.uniqueBrands.size,
      totalServices: Math.round(m.totalServices),
      totalGrams: Math.round(m.totalGrams * 100) / 100,
      totalCost: Math.round(m.totalCost * 100) / 100,
      sourceFiles: [...m.sourceFiles],
      phoneCoverageRatio: m.rowCount > 0 ? Math.round((m.phoneCoverage / m.rowCount) * 10000) / 100 : 0,
      countries: m.countries,
    };
  }

  // Anomaly: large row-count swings between consecutive months
  let prevMonth = null;
  for (const mk of sortedMonths) {
    const cur = monthMap[mk];
    if (prevMonth) {
      const prevUsers = prevMonth.uniqueUsers.size;
      const curUsers = cur.uniqueUsers.size;
      if (prevUsers > 0) {
        const changePct = ((curUsers - prevUsers) / prevUsers) * 100;
        if (Math.abs(changePct) > 50) {
          report.anomalies.push({
            type: "USER_COUNT_SPIKE",
            month: mk,
            previousMonth: prevMonth.label || "?",
            previousUsers: prevUsers,
            currentUsers: curUsers,
            changePct: Math.round(changePct * 10) / 10,
            severity: Math.abs(changePct) > 80 ? "HIGH" : "MEDIUM",
            description: `User count changed ${Math.round(changePct)}% from ${prevMonth.label} (${prevUsers}) to ${mk} (${curUsers})`,
          });
        }
      }
    }
    prevMonth = { ...cur, label: mk };
  }

  // Month continuity check
  if (sortedMonths.length > 1) {
    const firstSI = monthMap[sortedMonths[0]].sortIdx;
    const lastSI = monthMap[sortedMonths[sortedMonths.length - 1]].sortIdx;
    const firstYear = Math.floor(firstSI / 100);
    const firstMIdx = firstSI % 100;
    const lastYear = Math.floor(lastSI / 100);
    const lastMIdx = lastSI % 100;

    const expectedMonths = [];
    let y = firstYear, mi = firstMIdx;
    while (y * 100 + mi <= lastYear * 100 + lastMIdx) {
      const mName = MONTH_ORDER[mi];
      expectedMonths.push(monthKey(mName, y));
      mi++;
      if (mi >= 12) { mi = 0; y++; }
    }

    const missingMonths = expectedMonths.filter((em) => !monthMap[em]);
    if (missingMonths.length > 0) {
      report.anomalies.push({
        type: "MISSING_MONTHS",
        missing: missingMonths,
        severity: "HIGH",
        description: `Expected continuous range ${sortedMonths[0]} to ${sortedMonths[sortedMonths.length - 1]} but missing: ${missingMonths.join(", ")}`,
      });
    }
  }

  // Country classification summary
  const userPhoneMap = {};
  for (const r of dedupRows) {
    if (!userPhoneMap[r.userId]) {
      userPhoneMap[r.userId] = { phone: "", state: "", country: "Unknown", phoneIsIsraeli: false };
    }
    const u = userPhoneMap[r.userId];
    if (r.phone && !u.phone) {
      u.phone = r.phone;
      u.phoneIsIsraeli = r.phoneIsIsraeli;
    }
    if (r.state && u.state === "") u.state = r.state;
  }

  for (const [uid, u] of Object.entries(userPhoneMap)) {
    const country = resolveCountry({ phone: u.phone, state: u.state });
    u.country = country;
    report.userCountryMap[uid] = country;

    if (u.phone) {
      report.countryClassification.totalUsersWithPhone++;
      if (u.phoneIsIsraeli) {
        report.countryClassification.byPhone++;
        report.countryClassification.phonePromotedToIsrael++;
      } else {
        report.countryClassification.byState++;
      }
    } else {
      report.countryClassification.totalUsersWithoutPhone++;
      report.countryClassification.byState++;
    }
    if (country === "Unknown") report.countryClassification.unknown++;
  }

  // Country distribution
  const countryDist = {};
  for (const country of Object.values(report.userCountryMap)) {
    countryDist[country] = (countryDist[country] || 0) + 1;
  }
  report.countryClassification.distribution = countryDist;
  report.countryClassification.totalUniqueUsers = Object.keys(userPhoneMap).length;

  // Duplicate overlap analysis
  const overlapMap = {};
  for (const r of allRawRows) {
    const dk = `${r.userId}|${r.brand}|${r.mk}`;
    if (!overlapMap[dk]) overlapMap[dk] = [];
    overlapMap[dk].push(r.sourceFile);
  }
  const overlappingKeys = Object.entries(overlapMap).filter(([_, files]) => files.length > 1);
  const overlapByFilePair = {};
  for (const [key, srcFiles] of overlappingKeys) {
    const pair = [...new Set(srcFiles)].sort().join(" <> ");
    overlapByFilePair[pair] = (overlapByFilePair[pair] || 0) + 1;
  }
  report.deduplication.overlapByFilePair = overlapByFilePair;

  // Cross-check with existing JSON outputs
  report.jsonCrossCheck = {};
  if (fs.existsSync(MARKET_JSON)) {
    const mkt = JSON.parse(fs.readFileSync(MARKET_JSON, "utf-8"));
    const jsonMonths = (mkt.monthlyTrends || []).map((t) => t.label);
    const jsonRows = mkt.summary?.totalRows || 0;
    report.jsonCrossCheck.marketIntelligence = {
      months: jsonMonths.length,
      totalRows: jsonRows,
      monthRange: jsonMonths.length > 0 ? `${jsonMonths[0]} - ${jsonMonths[jsonMonths.length - 1]}` : "N/A",
      customersInJson: (mkt.customerOverview || []).length,
    };
  }
  if (fs.existsSync(USAGE_JSON)) {
    const usage = JSON.parse(fs.readFileSync(USAGE_JSON, "utf-8"));
    report.jsonCrossCheck.usageReports = {
      salonsInJson: (usage.salons || []).length,
      rowsInJson: (usage.rows || []).length,
      monthsInJson: (usage.availableMonths || []).length,
    };
  }

  // Print summary
  console.log(`\n=== Per-Month Summary ===`);
  for (const mk of sortedMonths) {
    const m = report.perMonth[mk];
    console.log(`  ${mk}: ${m.rowCount} rows, ${m.uniqueUsers} users, ${m.uniqueBrands} brands, phone: ${m.phoneCoverageRatio}%`);
  }

  console.log(`\n=== Country Classification ===`);
  console.log(`  Total unique users: ${report.countryClassification.totalUniqueUsers}`);
  console.log(`  Classified by phone: ${report.countryClassification.byPhone}`);
  console.log(`  Classified by state fallback: ${report.countryClassification.byState}`);
  console.log(`  Unknown: ${report.countryClassification.unknown}`);
  console.log(`  Phone promoted to ISRAEL: ${report.countryClassification.phonePromotedToIsrael}`);
  console.log(`  Distribution:`, JSON.stringify(countryDist));

  if (report.anomalies.length > 0) {
    console.log(`\n=== Anomalies (${report.anomalies.length}) ===`);
    for (const a of report.anomalies) {
      console.log(`  [${a.severity}] ${a.type}: ${a.description}`);
    }
  } else {
    console.log(`\n  No anomalies detected.`);
  }

  // Write report
  fs.writeFileSync(OUTPUT, JSON.stringify(report, null, 2), "utf-8");
  console.log(`\nQA report written to: ${OUTPUT}`);
}

main();
