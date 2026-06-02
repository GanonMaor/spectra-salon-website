#!/usr/bin/env node
/**
 * process-summit-billing.js
 *
 * Parses a Summit billing pivot Excel into src/data/summit-billing.json.
 *
 * Primary source (auto-discovered):
 *   ~/Downloads/Pivot_144590355_1939088217_202605270256.xlsx
 * Fallback sources (legacy formats with separate id + total columns):
 *   ../sumit-all-times.xlsx, ../sumit-april26.xlsx
 *
 * The parser is column-shape agnostic: it identifies month columns by their
 * MM/YYYY label, treats every other column as optional metadata (name, id,
 * country, currency, total), and computes Summit-only billing KPIs per
 * customer plus an aggregate summary.
 *
 * Run: node scripts/process-summit-billing.js
 */
"use strict";

const fs   = require("fs");
const path = require("path");
const os   = require("os");
const XLSX = require("xlsx");

const HOME = os.homedir();

// Auto-discover the first available Summit workbook
const INPUTS = [
  path.join(HOME, "Downloads", "Pivot_144590355_1939088217_202605270256.xlsx"),
  path.resolve(__dirname, "..", "..", "sumit-all-times.xlsx"),
  path.resolve(__dirname, "..", "..", "sumit-april26.xlsx"),
];
const INPUT = INPUTS.find((f) => fs.existsSync(f));
if (!INPUT) {
  throw new Error(
    "No Summit billing file found. Expected one of:\n  " +
      INPUTS.join("\n  "),
  );
}

const OUTPUT = path.resolve(__dirname, "..", "src", "data", "summit-billing.json");

const wb   = XLSX.readFile(INPUT);
const ws   = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "" });

const header = (rows[0] || []).map((h) => String(h ?? "").trim());

// ── Identify month columns by MM/YYYY label and capture their row index ──
const MONTH_RE = /^(0[1-9]|1[0-2])\/(\d{4})$/;
const monthCols = [];
header.forEach((label, idx) => {
  if (MONTH_RE.test(label)) monthCols.push({ label, idx });
});
const months = monthCols.map((m) => m.label);
if (months.length === 0) {
  throw new Error(`No MM/YYYY columns found in ${path.basename(INPUT)} header: ${header.join(", ")}`);
}

// ── Optional metadata column discovery (Hebrew + English aliases) ──
const monthIndexSet = new Set(monthCols.map((m) => m.idx));
function findMetaIdx(predicate) {
  for (let i = 0; i < header.length; i++) {
    if (monthIndexSet.has(i)) continue;
    if (predicate(header[i] || "")) return i;
  }
  return -1;
}

const NAME_IDX     = 0;
const ID_IDX       = findMetaIdx((h) => /^(מזהה|customer\s*id|id)$/i.test(h.replace(/[/\s].+$/, "")) || /מזהה לקוח/i.test(h));
const COUNTRY_IDX  = findMetaIdx((h) => /^(country|state|ארץ|מדינה)$/i.test(h));
const CURRENCY_IDX = findMetaIdx((h) => /^(currency|מטבע)$/i.test(h));

// ── Numeric coercion that tolerates Summit's "1,234.56" + "-1,170.00" + empty cells ──
function parseNum(v) {
  if (v === "" || v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const cleaned = String(v).replace(/[,\s]/g, "").trim();
  if (cleaned === "" || cleaned === "-") return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

// ── Per-customer KPI helpers ──
const EQUIPMENT_THRESHOLD = 2000; // legacy classification heuristic

function firstPositiveIdx(monthly) {
  for (let i = 0; i < monthly.length; i++) if (monthly[i] > 0) return i;
  return -1;
}
function lastPositiveIdx(monthly) {
  for (let i = monthly.length - 1; i >= 0; i--) if (monthly[i] > 0) return i;
  return -1;
}
function typicalSubAmount(monthly) {
  const vals = monthly.filter((v) => v > 0 && v < EQUIPMENT_THRESHOLD).sort((a, b) => a - b);
  if (!vals.length) return 0;
  const mid = Math.floor(vals.length / 2);
  return vals.length % 2 === 0 ? (vals[mid - 1] + vals[mid]) / 2 : vals[mid];
}
function classifyPaymentType(monthly) {
  const largePayments  = monthly.filter((v) => v >= EQUIPMENT_THRESHOLD);
  const smallRecurring = monthly.filter((v) => v > 0 && v < EQUIPMENT_THRESHOLD);
  if (largePayments.length === 0 && smallRecurring.length === 0) return "never";
  if (largePayments.length > 0 && smallRecurring.length < 3) return "equipment";
  if (largePayments.length === 0) return "subscription";
  return "both";
}

// ── Active window: latest exported month + one-month sparse fallback ──
const monthCount   = months.length;
const LAST_IDX     = monthCount - 1;
const SECOND_IDX   = monthCount - 2;
const APR26_LBLIDX = months.indexOf("04/2026");
const MAR26_LBLIDX = months.indexOf("03/2026");
const FEB26_LBLIDX = months.indexOf("02/2026");
const JAN26_LBLIDX = months.indexOf("01/2026");

// Skip header row and Summit's footer "סה"כ" total row
const customers = rows
  .slice(1)
  .filter((r) => {
    const first = r && r[NAME_IDX] ? String(r[NAME_IDX]).trim() : "";
    return first !== "" && first !== "סה\"כ" && first !== "סה'כ" && !/^total$/i.test(first);
  })
  .map((r) => {
    const name     = String(r[NAME_IDX]).trim();
    const monthly  = monthCols.map(({ idx }) => parseNum(r[idx]));
    const ltv      = monthly.reduce((s, v) => s + v, 0);

    const paidMonths       = monthly.filter((v) => v > 0).length;
    const refundMonths     = monthly.filter((v) => v < 0).length;
    const positiveSum      = monthly.reduce((s, v) => s + (v > 0 ? v : 0), 0);
    const averagePaidMonth = paidMonths > 0 ? positiveSum / paidMonths : 0;
    const averageAllMonths = monthCount > 0 ? ltv / monthCount : 0;
    const maxMonthlyPayment = monthly.reduce((m, v) => (v > m ? v : m), 0);
    const lastMonthAmount   = monthly[LAST_IDX] ?? 0;

    const firstPaidIdx = firstPositiveIdx(monthly);
    const lastPaidIdx  = lastPositiveIdx(monthly);
    const firstPaidMonth = firstPaidIdx >= 0 ? months[firstPaidIdx] : null;
    const lastPaidMonth  = lastPaidIdx  >= 0 ? months[lastPaidIdx]  : null;

    const churnMonths = lastPaidIdx >= 0 ? LAST_IDX - lastPaidIdx : monthCount;

    let currentPaymentStreak = 0;
    for (let i = LAST_IDX; i >= 0; i--) {
      if (monthly[i] > 0) currentPaymentStreak++;
      else break;
    }
    let longestPaymentStreak = 0;
    let running = 0;
    for (let i = 0; i < monthly.length; i++) {
      if (monthly[i] > 0) {
        running++;
        if (running > longestPaymentStreak) longestPaymentStreak = running;
      } else {
        running = 0;
      }
    }

    const tenureMonths   = firstPaidIdx >= 0 ? lastPaidIdx - firstPaidIdx + 1 : 0;
    const retentionRate  = tenureMonths > 0 ? paidMonths / tenureMonths : 0;

    // Active: paid in the last month OR the second-to-last month (covers partial latest month)
    const recentPositive = monthly.slice(Math.max(0, LAST_IDX - 1)).some((v) => v > 0);
    const isActivePayer  = recentPositive;
    const churned        = ltv > 0 && !isActivePayer && churnMonths >= 3;
    const reactivated    = isActivePayer && firstPaidIdx >= 0 && lastPaidIdx >= 0 && (longestPaymentStreak - currentPaymentStreak) >= 2 && currentPaymentStreak <= 3;
    const newCustomer    = firstPaidIdx >= 0 && firstPaidIdx >= LAST_IDX - 1;

    // Legacy classification kept so the existing Billing sub-tabs keep working
    const paymentType    = classifyPaymentType(monthly);
    const equipmentTotal = monthly.filter((v) => v >= EQUIPMENT_THRESHOLD).reduce((s, v) => s + v, 0);
    const subscriptionTotal = ltv - equipmentTotal;

    const apr26 = APR26_LBLIDX >= 0 ? monthly[APR26_LBLIDX] : 0;
    const mar26 = MAR26_LBLIDX >= 0 ? monthly[MAR26_LBLIDX] : 0;
    const feb26 = FEB26_LBLIDX >= 0 ? monthly[FEB26_LBLIDX] : 0;
    const jan26 = JAN26_LBLIDX >= 0 ? monthly[JAN26_LBLIDX] : 0;

    const isActiveSubscriber = (apr26 > 0 || mar26 > 0) &&
      (paymentType === "subscription" || paymentType === "both");
    const stoppedSubscription = !isActiveSubscriber && ltv > 0 &&
      (paymentType === "subscription" || paymentType === "both");

    return {
      name,
      sumitId:               ID_IDX       >= 0 ? (r[ID_IDX] ? Number(r[ID_IDX]) || null : null) : null,
      country:               COUNTRY_IDX  >= 0 ? (String(r[COUNTRY_IDX]  ?? "").trim() || null) : null,
      currency:              CURRENCY_IDX >= 0 ? (String(r[CURRENCY_IDX] ?? "").trim() || "ILS") : "ILS",
      monthly,
      ltv,
      paidMonths,
      refundMonths,
      averagePaidMonth:      Math.round(averagePaidMonth * 100) / 100,
      averageAllMonths:      Math.round(averageAllMonths * 100) / 100,
      maxMonthlyPayment,
      lastMonthAmount,
      firstPaidMonth,
      lastPaidMonth,
      churnMonths,
      currentPaymentStreak,
      longestPaymentStreak,
      retentionRate:         Math.round(retentionRate * 1000) / 1000,
      isActivePayer,
      churned,
      reactivated,
      newCustomer,
      // ── Legacy / cross-tab compatible fields ──
      subscriptionTotal,
      equipmentTotal,
      apr26,
      mar26,
      feb26,
      jan26,
      activeMonths:          paidMonths,
      paymentType,
      typicalMonthly:        Math.round(typicalSubAmount(monthly)),
      isActiveSubscriber,
      stoppedSubscription,
      currentlyPaying:       apr26 > 0 || mar26 > 0,
    };
  });

// ── Aggregate KPI summary (Summit-only) ──
const paidCustomers       = customers.filter((c) => c.ltv > 0);
const paidCount           = paidCustomers.length;
const totalLTV            = paidCustomers.reduce((s, c) => s + c.ltv, 0);
const totalPositiveSum    = paidCustomers.reduce((s, c) => s + c.monthly.reduce((ss, v) => ss + (v > 0 ? v : 0), 0), 0);
const totalPaidMonthsSum  = paidCustomers.reduce((s, c) => s + c.paidMonths, 0);

const activePayerCount    = customers.filter((c) => c.isActivePayer).length;
const churnedCount        = customers.filter((c) => c.churned).length;
const newCustomerCount    = customers.filter((c) => c.newCustomer).length;
const reactivatedCount    = customers.filter((c) => c.reactivated).length;

// Latest 2 months vs the previous 2 months — used for revenue retention
function windowRevenue(startIdx, endIdx) {
  if (startIdx < 0 || endIdx < 0 || endIdx < startIdx) return 0;
  return paidCustomers.reduce((s, c) => {
    let sum = 0;
    for (let i = startIdx; i <= endIdx; i++) if (c.monthly[i] > 0) sum += c.monthly[i];
    return s + sum;
  }, 0);
}
const lastWindowStart  = Math.max(0, LAST_IDX - 1);
const lastWindowEnd    = LAST_IDX;
const prevWindowStart  = Math.max(0, LAST_IDX - 3);
const prevWindowEnd    = Math.max(0, LAST_IDX - 2);
const lastWindowRev    = windowRevenue(lastWindowStart, lastWindowEnd);
const prevWindowRev    = windowRevenue(prevWindowStart, prevWindowEnd);
const revenueRetention = prevWindowRev > 0 ? lastWindowRev / prevWindowRev : 0;

// Customer retention: paid in latest window AND paid in previous window
let bothWindows = 0;
let prevWindowCustomers = 0;
paidCustomers.forEach((c) => {
  const paidPrev = c.monthly.slice(prevWindowStart, prevWindowEnd + 1).some((v) => v > 0);
  const paidNow  = c.monthly.slice(lastWindowStart, lastWindowEnd + 1).some((v) => v > 0);
  if (paidPrev) prevWindowCustomers++;
  if (paidPrev && paidNow) bothWindows++;
});
const customerRetention = prevWindowCustomers > 0 ? bothWindows / prevWindowCustomers : 0;

const activeSubs  = customers.filter((c) => c.isActiveSubscriber).length;
const stopped     = customers.filter((c) => c.stoppedSubscription).length;
const equipOnly   = customers.filter((c) => c.paymentType === "equipment").length;
const never       = customers.filter((c) => c.paymentType === "never").length;
const withBoth    = customers.filter((c) => c.paymentType === "both").length;

const output = {
  _generated:   new Date().toISOString(),
  _source:      path.basename(INPUT),
  currency:     "ILS",
  months,
  monthCount,
  latestMonth:  months[LAST_IDX] || null,
  apr26Index:   APR26_LBLIDX,
  mar26Index:   MAR26_LBLIDX,
  summary: {
    // ── Summit-only customer KPIs ──
    paidCustomers:      paidCount,
    totalCustomers:     customers.length,
    totalLTV:           Math.round(totalLTV),
    averageLTV:         paidCount > 0 ? Math.round(totalLTV / paidCount) : 0,
    averagePaidMonth:   totalPaidMonthsSum > 0 ? Math.round(totalPositiveSum / totalPaidMonthsSum) : 0,
    averagePaidMonths:  paidCount > 0 ? Math.round((totalPaidMonthsSum / paidCount) * 10) / 10 : 0,
    activePayers:       activePayerCount,
    churnedCustomers:   churnedCount,
    newCustomers:       newCustomerCount,
    reactivatedCustomers: reactivatedCount,
    lastWindowRevenue:  Math.round(lastWindowRev),
    prevWindowRevenue:  Math.round(prevWindowRev),
    revenueRetention:   Math.round(revenueRetention * 1000) / 1000,
    customerRetention:  Math.round(customerRetention * 1000) / 1000,
    // ── Legacy fields preserved for the existing Billing sub-tabs ──
    total:               customers.length,
    activeSubscribers:   activeSubs,
    stoppedSubscription: stopped,
    equipmentOnly:       equipOnly,
    subscriptionAndEquip: withBoth,
    neverPaid:           never,
  },
  customers,
};

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), "utf8");
console.log(`Source: ${path.basename(INPUT)}`);
console.log(`Months: ${months[0]} → ${months[months.length - 1]} (${monthCount} columns)`);
console.log(`Written ${customers.length} Summit customers → ${OUTPUT}`);
console.log(`  Paid customers:          ${paidCount}`);
console.log(`  Total LTV:               ₪${Math.round(totalLTV).toLocaleString()}`);
console.log(`  Avg LTV per paid cust.:  ₪${paidCount > 0 ? Math.round(totalLTV / paidCount).toLocaleString() : 0}`);
console.log(`  Active payers (last 2):  ${activePayerCount}`);
console.log(`  Churned (>=3mo gap):     ${churnedCount}`);
console.log(`  New customers:           ${newCustomerCount}`);
console.log(`  Reactivated:             ${reactivatedCount}`);
console.log(`  Revenue retention:       ${(revenueRetention * 100).toFixed(1)}%`);
console.log(`  Customer retention:      ${(customerRetention * 100).toFixed(1)}%`);
console.log(`  Legacy active subs:      ${activeSubs}`);
console.log(`  Legacy stopped:          ${stopped}`);
console.log(`  Legacy equipment-only:   ${equipOnly}`);
console.log(`  Legacy never:            ${never}`);
