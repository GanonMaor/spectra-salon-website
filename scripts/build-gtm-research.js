#!/usr/bin/env node
/**
 * build-gtm-research.js
 * Stage 3 of the GTM research pipeline — the only place GTM maths happens.
 *
 * Everything the dashboard shows is computed here, so the React layer never has
 * to decide what "retention" or "CAC" means. The headline choice is that channels
 * are compared at a fixed number of months since a customer's first payment, not
 * on lifetime revenue: door-to-door started two years before Meta and would win
 * any lifetime comparison purely by being older.
 *
 * Run: node scripts/build-gtm-research.js
 * Out: src/data/generated/gtm-research.json
 */

"use strict";

const path = require("path");
const {
  GTM_CONFIG_DIR,
  GENERATED_DIR,
  readJson,
  writeJson,
  monthToNumber,
  round,
  ratio,
} = require("./lib/gtm-shared");

const ATTRIBUTION_PATH = path.join(GENERATED_DIR, "customer-attribution.json");
const CHANNELS_PATH = path.join(GTM_CONFIG_DIR, "channels.json");
const CAMPAIGNS_PATH = path.join(GTM_CONFIG_DIR, "campaigns.json");
const COSTS_PATH = path.join(GTM_CONFIG_DIR, "campaign-costs.json");
const TEMPLATES_PATH = path.join(GTM_CONFIG_DIR, "insights-templates.json");
const OUTPUT_PATH = path.join(GENERATED_DIR, "gtm-research.json");

// Fixed comparison points. A channel only counts toward a milestone once its
// customers have had that many months to prove themselves.
const MILESTONES = [3, 6, 12];
// Below this a retention percentage is noise, so highlights skip the channel.
const MIN_COHORT_FOR_HIGHLIGHT = 10;

function formatMonthLabel(month) {
  if (!month) return "";
  const [m, y] = month.split("/");
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${names[Number(m) - 1]} ${y}`;
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * Per-customer payment curve indexed from that customer's own first payment, so
 * cohorts starting in different calendar months line up for comparison.
 */
function buildPaymentCurve(customer, monthIndex) {
  const firstIndex = monthIndex.get(customer.firstPaidMonth);
  if (firstIndex == null) return null;
  const curve = [];
  for (const [month, amount] of Object.entries(customer.payments)) {
    const offset = monthIndex.get(month) - firstIndex;
    if (offset < 0) continue;
    curve[offset] = (curve[offset] || 0) + amount;
  }
  return { firstIndex, curve };
}

/**
 * Milestone metrics for one set of customers.
 *   retention  — share still paying at or beyond month N
 *   revenue    — average revenue collected during the first N months
 * Both only count customers old enough to have reached month N.
 */
function milestoneMetrics(customers, latestIndex) {
  const result = {};
  for (const milestone of MILESTONES) {
    const eligible = customers.filter(
      (customer) => latestIndex - customer.firstIndex + 1 >= milestone,
    );
    const retained = eligible.filter((customer) =>
      customer.curve.some((amount, offset) => offset >= milestone - 1 && amount > 0),
    );
    const revenues = eligible.map((customer) =>
      sum(customer.curve.slice(0, milestone).filter(Boolean)),
    );
    result[`m${milestone}`] = {
      eligibleCustomers: eligible.length,
      retainedCustomers: retained.length,
      retention: ratio(retained.length, eligible.length),
      revenuePerCustomerIls: eligible.length ? round(sum(revenues) / eligible.length) : null,
    };
  }
  return result;
}

/** Average cumulative revenue per customer, month by month since first payment. */
function cumulativeRevenueCurve(customers, latestIndex, maxMonths = 24) {
  const curve = [];
  for (let month = 1; month <= maxMonths; month += 1) {
    const eligible = customers.filter(
      (customer) => latestIndex - customer.firstIndex + 1 >= month,
    );
    if (!eligible.length) break;
    const revenues = eligible.map((customer) =>
      sum(customer.curve.slice(0, month).filter(Boolean)),
    );
    curve.push({
      month,
      eligibleCustomers: eligible.length,
      cumulativeRevenuePerCustomerIls: round(sum(revenues) / eligible.length),
    });
  }
  return curve;
}

function paybackMonths(curve, cacIls) {
  if (!cacIls || cacIls <= 0) return null;
  const hit = curve.find((point) => point.cumulativeRevenuePerCustomerIls >= cacIls);
  return hit ? hit.month : null;
}

function main() {
  const attribution = readJson(ATTRIBUTION_PATH);
  const channelsConfig = readJson(CHANNELS_PATH);
  const campaignsConfig = readJson(CAMPAIGNS_PATH);
  const costsConfig = readJson(COSTS_PATH);
  const templatesConfig = readJson(TEMPLATES_PATH);

  const fx = channelsConfig.fxIlsPerUsd;
  const months = attribution.months;
  const monthIndex = new Map(months.map((month, index) => [month, index]));
  const latestIndex = months.length - 1;
  const toUsd = (ils) => (ils == null ? null : round(ils / fx));

  const campaignsById = new Map((campaignsConfig.campaigns || []).map((c) => [c.id, c]));
  const costByCampaign = new Map((costsConfig.costs || []).map((c) => [c.campaign, c]));

  const allPaying = attribution.customers.filter(
    (customer) => customer.lifetimeRevenueIls > 0 && customer.customerType !== "internal",
  );
  const salonCustomers = allPaying.filter((customer) => customer.inSalonCohort);
  // Brands and distributors are a different kind of counterparty; salons we simply
  // failed to attribute are neither, and belong in the data-quality story instead.
  const nonSalonCustomers = allPaying.filter((customer) => customer.customerType !== "salon");
  const unattributedSalons = allPaying.filter(
    (customer) => customer.customerType === "salon" && !customer.inSalonCohort,
  );

  // Attach each salon customer's own payment curve once, then reuse everywhere.
  const enriched = salonCustomers
    .map((customer) => {
      const curveData = buildPaymentCurve(customer, monthIndex);
      return curveData ? { ...customer, ...curveData } : null;
    })
    .filter(Boolean);

  // ── Per-channel metrics ────────────────────────────────────────────────
  const channels = [];
  for (const channelConfig of channelsConfig.channels) {
    if (channelConfig.id === "unknown") continue;
    const members = enriched.filter(
      (customer) => customer.acquisitionChannel === channelConfig.id,
    );
    if (!members.length && channelConfig.excludeFromSalonKpis) continue;

    // A channel can be real history with nothing attributed yet, because the
    // customer list is still being reconstructed by hand.
    const awaitingManualList =
      !members.length &&
      (campaignsConfig.campaigns || []).some(
        (campaign) => campaign.channel === channelConfig.id && campaign.requiresManualList,
      );

    const active = members.filter((c) => c.researchStatus === "active");
    const churned = members.filter((c) => c.researchStatus === "churned");
    const tooEarly = members.filter((c) => c.researchStatus === "too_early_to_tell");
    const lifetimeRevenueIls = round(sum(members.map((c) => c.lifetimeRevenueIls)));
    const activeWithKnownRecurring = active.filter(
      (c) => typeof c.monthlyRecurringIls === "number" && c.monthlyRecurringIls >= 0,
    );
    const currentMrrIls = round(
      sum(activeWithKnownRecurring.map((c) => c.monthlyRecurringIls)),
    );

    // CAC uses only the campaigns whose spend we actually know, and only the
    // customers those campaigns produced, so a partially-costed channel is not
    // silently flattered.
    const channelCampaignIds = (campaignsConfig.campaigns || [])
      .filter((campaign) => campaign.channel === channelConfig.id)
      .map((campaign) => campaign.id);
    const costedCampaignIds = channelCampaignIds.filter((id) => {
      const cost = costByCampaign.get(id);
      return cost && cost.spendUsd != null;
    });
    const costedMembers = members.filter((c) => costedCampaignIds.includes(c.campaign));
    const spendUsd = round(
      sum(costedCampaignIds.map((id) => costByCampaign.get(id).spendUsd)),
    );
    const spendIls = round(spendUsd * fx);
    const hasSpendData = costedCampaignIds.length > 0 && costedMembers.length > 0;
    const spendIsEstimate = costedCampaignIds.some(
      (id) => costByCampaign.get(id).isEstimate,
    );
    const cacIls = hasSpendData ? round(spendIls / costedMembers.length) : null;

    const milestones = milestoneMetrics(members, latestIndex);
    const revenueCurve = cumulativeRevenueCurve(members, latestIndex);
    const m12Revenue = milestones.m12.revenuePerCustomerIls;

    const confidence = { high: 0, medium: 0, low: 0, unknown: 0 };
    for (const member of members) confidence[member.confidence] += 1;

    const firstPaidMonths = members
      .map((c) => c.firstPaidMonth)
      .sort((a, b) => monthToNumber(a) - monthToNumber(b));

    channels.push({
      id: channelConfig.id,
      order: channelConfig.order,
      label: channelConfig.label,
      labelHe: channelConfig.labelHe,
      description: channelConfig.description,
      descriptionHe: channelConfig.descriptionHe,
      color: channelConfig.color,
      motion: channelConfig.motion,
      scalable: channelConfig.scalable,
      excludeFromSalonKpis: !!channelConfig.excludeFromSalonKpis,
      awaitingManualList,
      campaigns: channelCampaignIds.map((id) => {
        const campaign = campaignsById.get(id);
        const cost = costByCampaign.get(id);
        return {
          id,
          label: campaign.label,
          labelHe: campaign.labelHe,
          windowFrom: campaign.windowFrom,
          windowTo: campaign.windowTo,
          requiresManualList: !!campaign.requiresManualList,
          paidCustomers: members.filter((c) => c.campaign === id).length,
          spendUsd: cost ? cost.spendUsd : null,
          spendIsEstimate: cost ? !!cost.isEstimate : null,
          spendBasis: cost ? cost.basis : null,
          spendNotes: cost ? cost.notes || null : null,
        };
      }),
      paidCustomers: members.length,
      active: active.length,
      churned: churned.length,
      tooEarly: tooEarly.length,
      activeShare: ratio(active.length, members.length),
      firstPaidMonth: firstPaidMonths[0] || null,
      lastPaidMonth: firstPaidMonths[firstPaidMonths.length - 1] || null,
      lifetimeRevenueIls,
      lifetimeRevenueUsd: toUsd(lifetimeRevenueIls),
      revenuePerCustomerLifetimeIls: members.length
        ? round(lifetimeRevenueIls / members.length)
        : null,
      currentMrrIls,
      currentArrIls: round(currentMrrIls * 12),
      arrCoveredActiveCustomers: activeWithKnownRecurring.length,
      milestones,
      revenueCurve,
      hasSpendData,
      spendIsEstimate: hasSpendData ? spendIsEstimate : null,
      spendUsd: hasSpendData ? spendUsd : null,
      spendIls: hasSpendData ? spendIls : null,
      costedCustomers: hasSpendData ? costedMembers.length : null,
      cacIls,
      cacUsd: toUsd(cacIls),
      paybackMonths: paybackMonths(revenueCurve, cacIls),
      revenuePerCac: cacIls && m12Revenue ? round(m12Revenue / cacIls, 2) : null,
      confidenceBreakdown: confidence,
      regionBreakdown: members.reduce((acc, member) => {
        acc[member.region] = (acc[member.region] || 0) + 1;
        return acc;
      }, {}),
    });
  }
  channels.sort((a, b) => a.order - b.order);

  // Compact per-customer rows for the editable Marketing Admin drill-down.
  // Payment curves stay out of the browser payload; the UI only needs display
  // facts and a pre-computed recurring estimate.
  const channelCustomers = Object.fromEntries(
    channels.map((channel) => [
      channel.id,
      enriched
        .filter((customer) => customer.acquisitionChannel === channel.id)
        .map((customer) => ({
          customerId: customer.customerId,
          name: customer.name,
          region: customer.region,
          firstPaidMonth: customer.firstPaidMonth,
          lastPaidMonth: customer.lastPaidMonth,
          lifetimeRevenueIls: customer.lifetimeRevenueIls,
          status: customer.researchStatus,
          statusSource: customer.statusSource || "billing",
          monthlyRecurringIls: customer.monthlyRecurringIls,
        }))
        .sort((a, b) => {
          if (a.status !== b.status) return a.status === "active" ? -1 : 1;
          return a.name.localeCompare(b.name);
        }),
    ]),
  );

  // ── Monthly cohorts per channel ────────────────────────────────────────
  const cohorts = {};
  for (const channel of channels) {
    const members = enriched.filter((c) => c.acquisitionChannel === channel.id);
    const byMonth = new Map();
    for (const member of members) {
      if (!byMonth.has(member.firstPaidMonth)) byMonth.set(member.firstPaidMonth, []);
      byMonth.get(member.firstPaidMonth).push(member);
    }
    cohorts[channel.id] = [...byMonth.entries()]
      .sort((a, b) => monthToNumber(a[0]) - monthToNumber(b[0]))
      .map(([month, group]) => {
        const milestones = milestoneMetrics(group, latestIndex);
        return {
          month,
          monthLabel: formatMonthLabel(month),
          newPaidCustomers: group.length,
          activeNow: group.filter((c) => c.researchStatus === "active").length,
          lifetimeRevenueIls: round(sum(group.map((c) => c.lifetimeRevenueIls))),
          m3Retention: milestones.m3.retention,
          m6Retention: milestones.m6.retention,
          m12Retention: milestones.m12.retention,
          revenuePerCustomerM6Ils: milestones.m6.revenuePerCustomerIls,
          revenuePerCustomerM12Ils: milestones.m12.revenuePerCustomerIls,
        };
      });
  }

  // ── Geography, kept as its own axis rather than folded into channels ────
  const regionOrder = [...new Set(enriched.map((c) => c.region))].sort((a, b) => {
    if (a === "UNKNOWN") return 1;
    if (b === "UNKNOWN") return -1;
    return (
      enriched.filter((c) => c.region === b).length -
      enriched.filter((c) => c.region === a).length
    );
  });

  const geography = {
    groups: ["IL", "INTL"].map((group) => {
      const members = enriched.filter((c) => c.regionGroup === group);
      const milestones = milestoneMetrics(members, latestIndex);
      return {
        id: group,
        label: group === "IL" ? "Israel" : "International",
        labelHe: group === "IL" ? "ישראל" : "חו״ל",
        paidCustomers: members.length,
        active: members.filter((c) => c.researchStatus === "active").length,
        lifetimeRevenueIls: round(sum(members.map((c) => c.lifetimeRevenueIls))),
        m6Retention: milestones.m6.retention,
        revenuePerCustomerM12Ils: milestones.m12.revenuePerCustomerIls,
        channels: channels
          .map((channel) => ({
            channelId: channel.id,
            paidCustomers: members.filter((c) => c.acquisitionChannel === channel.id).length,
          }))
          .filter((row) => row.paidCustomers > 0),
      };
    }),
    countries: regionOrder.map((region) => {
      const members = enriched.filter((c) => c.region === region);
      const milestones = milestoneMetrics(members, latestIndex);
      return {
        region,
        confirmed: region !== "UNKNOWN",
        paidCustomers: members.length,
        active: members.filter((c) => c.researchStatus === "active").length,
        lifetimeRevenueIls: round(sum(members.map((c) => c.lifetimeRevenueIls))),
        m6Retention: milestones.m6.retention,
        revenuePerCustomerM12Ils: milestones.m12.revenuePerCustomerIls,
        channels: channels
          .map((channel) => ({
            channelId: channel.id,
            paidCustomers: members.filter((c) => c.acquisitionChannel === channel.id).length,
          }))
          .filter((row) => row.paidCustomers > 0),
      };
    }),
  };

  // ── Monthly acquisition series for the timeline ─────────────────────────
  const monthlyAcquisition = months
    .map((month) => {
      const group = enriched.filter((c) => c.firstPaidMonth === month);
      return {
        month,
        monthLabel: formatMonthLabel(month),
        il: group.filter((c) => c.regionGroup === "IL").length,
        intl: group.filter((c) => c.regionGroup === "INTL").length,
        total: group.length,
        byChannel: channels.reduce((acc, channel) => {
          const count = group.filter((c) => c.acquisitionChannel === channel.id).length;
          if (count) acc[channel.id] = count;
          return acc;
        }, {}),
      };
    })
    .filter((point) => point.total > 0);

  // ── Highlights: the four questions the page has to answer ───────────────
  const comparable = channels.filter(
    (channel) => !channel.excludeFromSalonKpis && channel.paidCustomers >= MIN_COHORT_FOR_HIGHLIGHT,
  );
  const withM6 = comparable.filter((channel) => channel.milestones.m6.retention != null);
  const withCac = comparable.filter((channel) => channel.cacIls != null && channel.cacIls > 0);

  const bestRetention = withM6.slice().sort(
    (a, b) => b.milestones.m6.retention - a.milestones.m6.retention,
  )[0];
  const worstRetention = withM6.slice().sort(
    (a, b) => a.milestones.m6.retention - b.milestones.m6.retention,
  )[0];
  const lowestCac = withCac.slice().sort((a, b) => a.cacIls - b.cacIls)[0];
  const bestScalable = comparable
    .filter((channel) => channel.scalable)
    .slice()
    .sort((a, b) => b.paidCustomers - a.paidCustomers)[0];
  const highestVolume = comparable.slice().sort((a, b) => b.paidCustomers - a.paidCustomers)[0];

  const highlights = {
    highestVolume: highestVolume ? highestVolume.id : null,
    bestScalable: bestScalable ? bestScalable.id : null,
    bestRetention: bestRetention ? bestRetention.id : null,
    worstRetention: worstRetention ? worstRetention.id : null,
    lowestCac: lowestCac ? lowestCac.id : null,
    minCohortForHighlight: MIN_COHORT_FOR_HIGHLIGHT,
  };

  // ── Data quality ───────────────────────────────────────────────────────
  const confidenceTotals = { high: 0, medium: 0, low: 0, unknown: 0 };
  for (const customer of allPaying) confidenceTotals[customer.confidence] += 1;

  // "Confirmed" has to mean a source told us the country. Deriving Israel from a
  // Hebrew salon name is a good guess, not a confirmation, so it is counted apart.
  const INFERRED_REGION_SOURCES = new Set(["inferred_name", "unresolved"]);
  const regionConfirmed = allPaying.filter(
    (c) => !INFERRED_REGION_SOURCES.has(c.regionSource),
  ).length;
  const regionInferred = allPaying.filter((c) => c.regionSource === "inferred_name").length;
  const regionUnknown = allPaying.filter((c) => c.regionSource === "unresolved").length;

  const reviewByIssue = {};
  for (const item of attribution.reviewQueue) {
    if (!reviewByIssue[item.issue]) reviewByIssue[item.issue] = [];
    reviewByIssue[item.issue].push(item);
  }

  const gaps = [];
  const manualListCampaigns = (campaignsConfig.campaigns || []).filter((c) => c.requiresManualList);
  for (const campaign of manualListCampaigns) {
    const candidates = reviewByIssue.possible_schwarzkopf || [];
    gaps.push({
      id: `manual_list_${campaign.id}`,
      severity: "open",
      title: `${campaign.label} customer list is incomplete`,
      titleHe: `רשימת הלקוחות של ${campaign.labelHe} חסרה`,
      detail: `${candidates.length} Israeli salons bought equipment inside the ${campaign.windowFrom}–${campaign.windowTo} window. Until they are listed they are counted under founder-led sales.`,
      detailHe: `${candidates.length} מספרות בישראל רכשו ציוד בחלון ${campaign.windowFrom}–${campaign.windowTo}. עד שהן ירשמו הן נספרות תחת מכירה ישירה.`,
      affectedCustomers: candidates.length,
    });
  }
  const missingSpend = (costsConfig.costs || []).filter((cost) => cost.spendUsd == null);
  if (missingSpend.length) {
    gaps.push({
      id: "missing_spend",
      severity: "open",
      title: "Acquisition spend missing for some campaigns",
      titleHe: "חסרה הוצאת רכישה לחלק מהקמפיינים",
      detail: `${missingSpend.map((c) => campaignsById.get(c.campaign)?.label || c.campaign).join(", ")} have no spend recorded, so their cost per customer shows as unknown rather than zero.`,
      detailHe: `ל-${missingSpend.map((c) => campaignsById.get(c.campaign)?.labelHe || c.campaign).join(", ")} לא נרשמה הוצאה, ולכן העלות ללקוח מוצגת כלא ידועה ולא כאפס.`,
      affectedCustomers: null,
    });
  }
  const estimatedSpend = (costsConfig.costs || []).filter(
    (cost) => cost.spendUsd != null && cost.isEstimate && cost.spendUsd > 0,
  );
  if (estimatedSpend.length) {
    gaps.push({
      id: "estimated_spend",
      severity: "caution",
      title: "Meta spend is reconstructed, not invoiced",
      titleHe: "הוצאת מטא משוחזרת, לא מחושבנית",
      detail: `Spend for ${estimatedSpend.map((c) => campaignsById.get(c.campaign)?.label || c.campaign).join(", ")} is estimated from the $20–30 daily budget. Replace it with Meta Ads figures before quoting CAC externally.`,
      detailHe: `ההוצאה עבור ${estimatedSpend.map((c) => campaignsById.get(c.campaign)?.labelHe || c.campaign).join(", ")} מוערכת לפי תקציב יומי של 20–30 דולר. יש להחליף בנתוני מטא לפני ציטוט CAC חיצוני.`,
      affectedCustomers: null,
    });
  }
  gaps.push({
    id: "no_lead_funnel",
    severity: "scope",
    title: "Leads and trials are not connected",
    titleHe: "לידים וניסיונות לא מחוברים",
    detail: "Every figure here counts customers who paid. Conversion rate per channel needs CRM lead data, which is not wired into this pipeline yet.",
    detailHe: "כל נתון כאן מונה לקוחות ששילמו. שיעור המרה לפי ערוץ דורש נתוני לידים מה-CRM, שעדיין לא מחוברים לתהליך הזה.",
    affectedCustomers: null,
  });

  const dataQuality = {
    attribution: {
      counts: confidenceTotals,
      total: allPaying.length,
      highMediumShare: ratio(
        confidenceTotals.high + confidenceTotals.medium,
        allPaying.length,
      ),
    },
    region: {
      confirmed: regionConfirmed,
      inferred: regionInferred,
      unknown: regionUnknown,
      total: allPaying.length,
      confirmedShare: ratio(regionConfirmed, allPaying.length),
      inferredShare: ratio(regionInferred, allPaying.length),
      unknownShare: ratio(regionUnknown, allPaying.length),
      sources: allPaying.reduce((acc, customer) => {
        acc[customer.regionSource] = (acc[customer.regionSource] || 0) + 1;
        return acc;
      }, {}),
    },
    reviewQueue: attribution.reviewQueue
      .slice()
      .sort((a, b) => b.lifetimeRevenueIls - a.lifetimeRevenueIls),
    reviewCounts: Object.fromEntries(
      Object.entries(reviewByIssue).map(([issue, items]) => [issue, items.length]),
    ),
    gaps,
  };

  // ── Strategic revenue: real money, but not a salon acquisition cohort ───
  const strategicRevenue = nonSalonCustomers.map((customer) => ({
    id: customer.customerId || customer.name,
    label: customer.name,
    kind: customer.customerType,
    channelId: customer.acquisitionChannel,
    region: customer.region,
    firstPaidMonth: customer.firstPaidMonth,
    lastPaidMonth: customer.lastPaidMonth,
    revenueIls: customer.lifetimeRevenueIls,
    revenueUsd: toUsd(customer.lifetimeRevenueIls),
    note: customer.attributionReason,
    inSummitBilling: true,
  }));
  for (const stream of costsConfig.strategicRevenue || []) {
    const fromNumber = monthToNumber(stream.fromMonth);
    const toNumber = monthToNumber(stream.toMonth);
    const monthCount = fromNumber != null && toNumber != null ? toNumber - fromNumber + 1 : 0;
    const revenueIls = round(stream.monthlyIls * monthCount);
    strategicRevenue.push({
      id: stream.id,
      label: stream.label,
      labelHe: stream.labelHe,
      kind: "brand",
      channelId: null,
      region: null,
      firstPaidMonth: stream.fromMonth,
      lastPaidMonth: stream.toMonth,
      revenueIls,
      revenueUsd: toUsd(revenueIls),
      note: stream.description,
      noteHe: stream.descriptionHe,
      inSummitBilling: !!stream.inSummitBilling,
    });
  }
  strategicRevenue.sort((a, b) => b.revenueIls - a.revenueIls);

  // ── Totals ─────────────────────────────────────────────────────────────
  const salonRevenueIls = round(sum(enriched.map((c) => c.lifetimeRevenueIls)));
  const strategicRevenueIls = round(sum(strategicRevenue.map((s) => s.revenueIls)));
  const unattributedRevenueIls = round(sum(unattributedSalons.map((c) => c.lifetimeRevenueIls)));
  const totalRevenueIls = round(salonRevenueIls + strategicRevenueIls + unattributedRevenueIls);
  const totals = {
    paidCustomers: allPaying.length,
    salonCustomers: enriched.length,
    active: enriched.filter((c) => c.researchStatus === "active").length,
    churned: enriched.filter((c) => c.researchStatus === "churned").length,
    tooEarly: enriched.filter((c) => c.researchStatus === "too_early_to_tell").length,
    salonRevenueIls,
    salonRevenueUsd: toUsd(salonRevenueIls),
    strategicRevenueIls,
    strategicRevenueUsd: toUsd(strategicRevenueIls),
    unattributedCustomers: unattributedSalons.length,
    unattributedRevenueIls,
    totalRevenueIls,
    totalRevenueUsd: toUsd(totalRevenueIls),
  };
  totals.activeShare = ratio(totals.active, totals.salonCustomers);

  // ── Insights: the config owns the wording, this owns the numbers ────────
  const templates = new Map(templatesConfig.templates.map((t) => [t.id, t]));
  const byId = new Map(channels.map((channel) => [channel.id, channel]));
  const pct = (value) => (value == null ? null : `${round(value * 100, 1)}%`);
  const ils = (value) => (value == null ? null : `₪${Math.round(value).toLocaleString("en-US")}`);

  const insightInputs = [];
  if (highestVolume) {
    insightInputs.push({
      id: "highest_volume_channel",
      channelId: highestVolume.id,
      tokens: {
        channel: highestVolume.label,
        channelHe: highestVolume.labelHe,
        paidCustomers: highestVolume.paidCustomers,
        totalPaid: totals.salonCustomers,
        activeShare: pct(highestVolume.activeShare),
      },
    });
  }
  if (bestRetention) {
    const comparison = withM6
      .slice()
      .sort((a, b) => b.milestones.m6.retention - a.milestones.m6.retention)
      .find((channel) => channel.id !== bestRetention.id);
    insightInputs.push({
      id: "best_retention_channel",
      channelId: bestRetention.id,
      tokens: {
        channel: bestRetention.label,
        channelHe: bestRetention.labelHe,
        m6Retention: pct(bestRetention.milestones.m6.retention),
        comparisonChannel: comparison ? comparison.label : null,
        comparisonM6: comparison ? pct(comparison.milestones.m6.retention) : null,
      },
    });
  }
  if (worstRetention && bestRetention && worstRetention.id !== bestRetention.id) {
    insightInputs.push({
      id: "weakest_retention_channel",
      channelId: worstRetention.id,
      tokens: {
        channel: worstRetention.label,
        channelHe: worstRetention.labelHe,
        m6Retention: pct(worstRetention.milestones.m6.retention),
        minCohort: MIN_COHORT_FOR_HIGHLIGHT,
      },
    });
  }
  if (lowestCac) {
    insightInputs.push({
      id: "lowest_cac_channel",
      channelId: lowestCac.id,
      tokens: {
        channel: lowestCac.label,
        channelHe: lowestCac.labelHe,
        cac: ils(lowestCac.cacIls),
      },
    });
  }
  if (bestScalable && bestScalable.cacIls) {
    insightInputs.push({
      id: "paid_media_scalability",
      channelId: bestScalable.id,
      tokens: {
        channel: bestScalable.label,
        channelHe: bestScalable.labelHe,
        paidCustomers: bestScalable.costedCustomers,
        spend: ils(bestScalable.spendIls),
        cac: ils(bestScalable.cacIls),
        revenuePerCac: bestScalable.revenuePerCac ? `${bestScalable.revenuePerCac}x` : null,
      },
    });
  }
  const founderLed = byId.get("door_to_door");
  if (founderLed && founderLed.milestones.m12.revenuePerCustomerIls) {
    insightInputs.push({
      id: "founder_led_not_scalable",
      channelId: founderLed.id,
      tokens: {
        channel: founderLed.label,
        channelHe: founderLed.labelHe,
        revenuePerCustomer: ils(founderLed.milestones.m12.revenuePerCustomerIls),
      },
    });
  }
  const referrals = byId.get("word_of_mouth");
  if (referrals && referrals.paidCustomers) {
    insightInputs.push({
      id: "referral_efficiency",
      channelId: referrals.id,
      tokens: { paidCustomers: referrals.paidCustomers },
    });
  }
  insightInputs.push({
    id: "attribution_coverage",
    channelId: null,
    tokens: {
      highMedium: pct(dataQuality.attribution.highMediumShare),
      lowUnknown: pct(1 - dataQuality.attribution.highMediumShare),
    },
  });
  insightInputs.push({
    id: "region_coverage",
    channelId: null,
    tokens: {
      resolvedShare: pct(dataQuality.region.confirmedShare),
      inferredShare: pct(dataQuality.region.inferredShare),
      unknownShare: pct(dataQuality.region.unknownShare),
    },
  });
  insightInputs.push({ id: "no_lead_funnel", channelId: null, tokens: {} });

  const fill = (text, tokens) => {
    let filled = text;
    let complete = true;
    filled = filled.replace(/\{(\w+)\}/g, (_, key) => {
      const value = tokens[key] ?? tokens[`${key}He`];
      if (value == null || value === "") {
        complete = false;
        return "";
      }
      return String(value);
    });
    return complete ? filled : null;
  };

  const insights = [];
  for (const input of insightInputs) {
    const template = templates.get(input.id);
    if (!template) continue;
    const text = fill(template.text, input.tokens);
    const heTokens = { ...input.tokens };
    if (heTokens.channelHe) heTokens.channel = heTokens.channelHe;
    const textHe = fill(template.textHe, heTokens);
    if (!text) continue;
    insights.push({
      id: template.id,
      kind: template.kind,
      title: template.title,
      titleHe: template.titleHe,
      text,
      textHe: textHe || null,
      channelId: input.channelId,
    });
  }

  // ── Timeline ───────────────────────────────────────────────────────────
  const timeline = channels
    .filter((channel) => channel.paidCustomers > 0 || channel.awaitingManualList)
    .map((channel) => {
      // A motion with nothing attributed yet still belongs in the history; fall
      // back to its campaign window so the period is not blank.
      const campaignWindows = (campaignsConfig.campaigns || []).filter(
        (campaign) => campaign.channel === channel.id,
      );
      const from = channel.firstPaidMonth || campaignWindows[0]?.windowFrom || null;
      const to =
        channel.lastPaidMonth ||
        campaignWindows[campaignWindows.length - 1]?.windowTo ||
        campaignWindows[0]?.windowFrom ||
        null;
      return {
        channelId: channel.id,
        label: channel.label,
        labelHe: channel.labelHe,
        color: channel.color,
        scalable: channel.scalable,
        periodLabel:
          from === to
            ? formatMonthLabel(from)
            : `${formatMonthLabel(from)} – ${formatMonthLabel(to)}`,
        firstPaidMonth: from,
        lastPaidMonth: to,
        paidCustomers: channel.paidCustomers,
        active: channel.active,
        lifetimeRevenueIls: channel.lifetimeRevenueIls,
        excludeFromSalonKpis: channel.excludeFromSalonKpis,
        awaitingManualList: channel.awaitingManualList,
      };
    })
    .sort((a, b) => monthToNumber(a.firstPaidMonth) - monthToNumber(b.firstPaidMonth));

  const output = {
    _generated: new Date().toISOString(),
    _stage: "3/3 research dataset",
    _source: "customer-attribution.json + src/data/gtm/*.json",
    fxIlsPerUsd: fx,
    milestones: MILESTONES,
    reportingWindow: {
      firstMonth: months[0],
      latestMonth: attribution.latestMonth,
      recentMonths: attribution.recentMonths,
      minMonthsToJudgeRetention: attribution.minMonthsToJudgeRetention,
    },
    totals,
    highlights,
    timeline,
    channels,
    channelCustomers,
    cohorts,
    geography,
    monthlyAcquisition,
    strategicRevenue,
    dataQuality,
    insights,
  };

  writeJson(OUTPUT_PATH, output);

  console.log(`Stage 3 → ${path.relative(process.cwd(), OUTPUT_PATH)}`);
  console.log(`  Salon customers:       ${totals.salonCustomers} (${totals.active} active, ${totals.churned} churned, ${totals.tooEarly} too early)`);
  console.log(`  Salon revenue:         ₪${Math.round(totals.salonRevenueIls).toLocaleString()} ($${Math.round(totals.salonRevenueUsd).toLocaleString()})`);
  console.log(`  Strategic revenue:     ₪${Math.round(totals.strategicRevenueIls).toLocaleString()}`);
  console.log(`  Attribution coverage:  ${pct(dataQuality.attribution.highMediumShare)} high+medium`);
  console.log(`  Country confirmed:     ${pct(dataQuality.region.confirmedShare)}`);
  console.log("");
  console.log("  Channel                 Paid  Active   M3      M6      M12     Rev/cust M12   CAC");
  for (const channel of channels) {
    const m = channel.milestones;
    console.log(
      `  ${channel.label.padEnd(22)} ${String(channel.paidCustomers).padStart(4)}  ${String(channel.active).padStart(6)}  ` +
        `${(pct(m.m3.retention) || "-").padStart(6)}  ${(pct(m.m6.retention) || "-").padStart(6)}  ${(pct(m.m12.retention) || "-").padStart(6)}  ` +
        `${(ils(m.m12.revenuePerCustomerIls) || "-").padStart(13)}   ${(ils(channel.cacIls) || "-")}`,
    );
  }
  console.log("");
  console.log(`  Highlights: ${JSON.stringify(highlights)}`);
  console.log(`  Insights generated: ${insights.length}`);
}

main();
