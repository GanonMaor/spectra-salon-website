#!/usr/bin/env node
/**
 * build-customer-facts.js
 * Stage 1 of the GTM research pipeline.
 *
 * Turns Summit billing plus every local source that knows where a salon is into
 * one normalized fact per paying customer. No channel attribution happens here —
 * that is stage 2 — so this file stays a statement of what we can observe.
 *
 * Run: node scripts/build-customer-facts.js
 * Out: src/data/generated/customer-facts.json
 */

"use strict";

const path = require("path");
const {
  DATA_DIR,
  GTM_CONFIG_DIR,
  GENERATED_DIR,
  readJson,
  writeJson,
  monthToNumber,
  hasHebrew,
  buildNameIndex,
  matchName,
  indexOverrides,
  inferCountryFromPhone,
  round,
} = require("./lib/gtm-shared");

const BILLING_PATH = path.join(DATA_DIR, "summit-billing.json");
const ADMIN_SNAPSHOT_PATH = path.join(DATA_DIR, "admin-current-users-snapshot.json");
const USAGE_REPORTS_PATH = path.join(DATA_DIR, "usage-reports.json");
const CUSTOMER_IDS_PATH = path.resolve(__dirname, "..", "docs", "customer-ids.json");
const CHANNELS_PATH = path.join(GTM_CONFIG_DIR, "channels.json");
const OVERRIDES_PATH = path.join(GTM_CONFIG_DIR, "manual-overrides.json");
const OUTPUT_PATH = path.join(GENERATED_DIR, "customer-facts.json");

// A customer needs three observed months before retention says anything useful.
const MIN_MONTHS_TO_JUDGE_RETENTION = 3;

function normalizeCountry(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const upper = trimmed.toUpperCase();
  if (upper === "UNKNOWN" || upper === "MISTAKE") return "";
  if (upper === "ENGLAND" || upper === "GREAT BRITAIN" || upper === "GB") return "UK";
  if (upper === "IRLAND") return "IRELAND";
  if (upper === "TENNESSE" || upper === "TENNESSEE") return "USA";
  if (upper === "IL") return "ISRAEL";
  return upper;
}

/**
 * Country comes from whichever local source knows it, best first. Phone-derived
 * and name-derived answers are deliberately marked lower confidence so the
 * dashboard can show how much of the geography split is reconstructed.
 */
function buildRegionResolver({ adminSnapshot, customerIds, usageSalons }) {
  const adminIndex = buildNameIndex(adminSnapshot, "salon_name");
  const idsIndex = buildNameIndex(customerIds, "displayName");
  const salonsIndex = buildNameIndex(
    usageSalons.filter((salon) => salon.displayName),
    "displayName",
  );

  return function resolveRegion(customer, override) {
    if (override && override.region) {
      return {
        region: normalizeCountry(override.region),
        regionSource: "manual",
        regionConfidence: "high",
      };
    }

    const adminRow = matchName(adminIndex, customer.name);
    const idsRow = matchName(idsIndex, customer.name);
    const salonRow = matchName(salonsIndex, customer.name);

    // Explicit country fields first — a human typed those.
    const explicitSources = [
      { value: adminRow?.state, source: "crm_admin_state" },
      { value: idsRow?.country, source: "crm_usage_country" },
      { value: salonRow?.country, source: "usage_salons" },
    ];
    for (const { value, source } of explicitSources) {
      const country = normalizeCountry(value);
      if (country) return { region: country, regionSource: source, regionConfidence: "high" };
    }

    // Then dialling codes, which are reliable but not stated by the customer.
    const phoneSources = [
      { value: adminRow?.phone_number, source: "crm_admin_phone" },
      { value: idsRow?.phone, source: "crm_usage_phone" },
    ];
    for (const { value, source } of phoneSources) {
      const country = normalizeCountry(inferCountryFromPhone(value));
      if (country) return { region: country, regionSource: source, regionConfidence: "medium" };
    }

    if (hasHebrew(customer.name)) {
      return { region: "ISRAEL", regionSource: "inferred_name", regionConfidence: "low" };
    }

    return { region: "UNKNOWN", regionSource: "unresolved", regionConfidence: "unknown" };
  };
}

/**
 * Israel versus international survives even when the exact country does not:
 * Israeli salons bill under Hebrew names and overseas salons never do.
 */
function resolveRegionGroup(customer, region, regionConfidence) {
  if (region && region !== "UNKNOWN") {
    return {
      regionGroup: region === "ISRAEL" ? "IL" : "INTL",
      regionGroupConfidence: regionConfidence === "unknown" ? "medium" : regionConfidence,
    };
  }
  return {
    regionGroup: hasHebrew(customer.name) ? "IL" : "INTL",
    regionGroupConfidence: "medium",
  };
}

function main() {
  const billing = readJson(BILLING_PATH);
  const channelsConfig = readJson(CHANNELS_PATH);
  const overridesConfig = readJson(OVERRIDES_PATH);
  const adminSnapshot = Object.values(readJson(ADMIN_SNAPSHOT_PATH)).filter(
    (row) => row && typeof row === "object",
  );
  const customerIds = readJson(CUSTOMER_IDS_PATH).customers || [];
  const usageSalons = readJson(USAGE_REPORTS_PATH).salons || [];

  const overrides = indexOverrides(overridesConfig.overrides || []);
  const resolveRegionFor = buildRegionResolver({ adminSnapshot, customerIds, usageSalons });

  const months = billing.months;
  const latestMonth = months[months.length - 1];
  const latestMonthNumber = monthToNumber(latestMonth);

  // Summit's own convention: a payment in either of the two most recent columns
  // still counts as current, which absorbs partial and off-cycle billing months.
  const recentMonths = months.slice(-2);
  const recentMonthSet = new Set(recentMonths);

  const facts = [];
  for (const customer of billing.customers) {
    const payments = {};
    let lifetimeRevenueIls = 0;
    let paidMonths = 0;
    let refundMonths = 0;
    let firstPaidMonth = null;
    let lastPaidMonth = null;
    let paidRecently = false;
    let maxMonthlyPaymentIls = 0;

    months.forEach((month, index) => {
      const amount = round(customer.monthly[index]);
      if (amount === 0) return;
      payments[month] = amount;
      lifetimeRevenueIls += amount;
      if (amount > 0) {
        paidMonths += 1;
        if (!firstPaidMonth) firstPaidMonth = month;
        lastPaidMonth = month;
        if (amount > maxMonthlyPaymentIls) maxMonthlyPaymentIls = amount;
        if (recentMonthSet.has(month)) paidRecently = true;
      } else {
        refundMonths += 1;
      }
    });

    lifetimeRevenueIls = round(lifetimeRevenueIls);

    const override = overrides.lookup(customer);
    const customerType = override?.customerType || "salon";

    const firstPaidNumber = monthToNumber(firstPaidMonth);
    const monthsSinceFirstPaid =
      firstPaidNumber == null ? null : latestMonthNumber - firstPaidNumber + 1;

    let billingStatus;
    if (!firstPaidMonth || lifetimeRevenueIls <= 0) billingStatus = "unknown";
    else if (paidRecently) billingStatus = "paid_recently";
    else if (paidMonths === 1) billingStatus = "one_time";
    else billingStatus = "no_recent_payment";

    let researchStatus;
    if (billingStatus === "unknown") {
      researchStatus = "never_paid";
    } else if (paidRecently) {
      researchStatus = "active";
    } else if (monthsSinceFirstPaid != null && monthsSinceFirstPaid < MIN_MONTHS_TO_JUDGE_RETENTION) {
      researchStatus = "too_early_to_tell";
    } else {
      researchStatus = "churned";
    }
    const statusOverride =
      override?.status === "active" || override?.status === "churned"
        ? override.status
        : null;
    if (statusOverride) researchStatus = statusOverride;

    const hasManualRecurringAmount =
      override != null &&
      Object.prototype.hasOwnProperty.call(override, "monthlyRecurringIls");
    const monthlyRecurringIls = hasManualRecurringAmount
      ? override.monthlyRecurringIls
      : customer.typicalMonthly > 0
        ? customer.typicalMonthly
        : null;

    const { region, regionSource, regionConfidence } = resolveRegionFor(customer, override);
    const { regionGroup, regionGroupConfidence } = resolveRegionGroup(
      customer,
      region,
      regionConfidence,
    );

    facts.push({
      customerId: customer.sumitId != null ? String(customer.sumitId) : null,
      name: customer.name,
      customerType,
      region,
      regionSource,
      regionConfidence,
      regionGroup,
      regionGroupConfidence,
      firstPaidMonth,
      lastPaidMonth,
      monthsSinceFirstPaid,
      paidMonths,
      refundMonths,
      lifetimeRevenueIls,
      maxMonthlyPaymentIls,
      billingStatus,
      researchStatus,
      statusSource: statusOverride ? "manual" : "billing",
      monthlyRecurringIls,
      payments,
    });
  }

  const output = {
    _generated: new Date().toISOString(),
    _source: "summit-billing.json + admin-current-users-snapshot.json + docs/customer-ids.json + usage-reports.json",
    _stage: "1/3 customer facts",
    fxIlsPerUsd: channelsConfig.fxIlsPerUsd,
    months,
    latestMonth,
    recentMonths,
    minMonthsToJudgeRetention: MIN_MONTHS_TO_JUDGE_RETENTION,
    totalCustomers: facts.length,
    customers: facts,
  };

  writeJson(OUTPUT_PATH, output);

  const paying = facts.filter((f) => f.lifetimeRevenueIls > 0);
  const salons = paying.filter((f) => f.customerType === "salon");
  const byStatus = {};
  const bySource = {};
  for (const fact of paying) {
    byStatus[fact.researchStatus] = (byStatus[fact.researchStatus] || 0) + 1;
    bySource[fact.regionSource] = (bySource[fact.regionSource] || 0) + 1;
  }

  console.log(`Stage 1 → ${path.relative(process.cwd(), OUTPUT_PATH)}`);
  console.log(`  Months:                ${months[0]} → ${latestMonth} (${months.length})`);
  console.log(`  Customers:             ${facts.length} (${paying.length} paying, ${salons.length} salons)`);
  console.log(`  Total revenue:         ₪${Math.round(paying.reduce((s, f) => s + f.lifetimeRevenueIls, 0)).toLocaleString()}`);
  console.log(`  Research status:       ${JSON.stringify(byStatus)}`);
  console.log(`  Region sources:        ${JSON.stringify(bySource)}`);
  const resolvedRegion = paying.filter((f) => f.region !== "UNKNOWN").length;
  console.log(`  Country resolved:      ${resolvedRegion}/${paying.length} (${((resolvedRegion / paying.length) * 100).toFixed(1)}%)`);
}

main();
