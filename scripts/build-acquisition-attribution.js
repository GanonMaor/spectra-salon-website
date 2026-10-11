#!/usr/bin/env node
/**
 * build-acquisition-attribution.js
 * Stage 2 of the GTM research pipeline.
 *
 * Decides how each paying customer was won and, just as importantly, records how
 * much we actually know about that decision. Channel, campaign and region stay
 * separate fields so the dashboard can ask "does Meta work better in the US than
 * in Europe" without the taxonomy standing in the way.
 *
 * Run: node scripts/build-acquisition-attribution.js
 * Out: src/data/generated/customer-attribution.json
 */

"use strict";

const path = require("path");
const {
  GTM_CONFIG_DIR,
  GENERATED_DIR,
  readJson,
  writeJson,
  monthToNumber,
  indexOverrides,
} = require("./lib/gtm-shared");

const FACTS_PATH = path.join(GENERATED_DIR, "customer-facts.json");
const CHANNELS_PATH = path.join(GTM_CONFIG_DIR, "channels.json");
const CAMPAIGNS_PATH = path.join(GTM_CONFIG_DIR, "campaigns.json");
const OVERRIDES_PATH = path.join(GTM_CONFIG_DIR, "manual-overrides.json");
const OUTPUT_PATH = path.join(GENERATED_DIR, "customer-attribution.json");

function prepareCampaigns(campaigns) {
  return campaigns.map((campaign) => ({
    ...campaign,
    regionGroup: campaign.regionGroupScope || "ANY",
    fromNumber: monthToNumber(campaign.windowFrom),
    toNumber: campaign.windowTo ? monthToNumber(campaign.windowTo) : Infinity,
    windowLength:
      (campaign.windowTo ? monthToNumber(campaign.windowTo) : Infinity) -
      monthToNumber(campaign.windowFrom),
  }));
}

/**
 * Pick the campaign whose window contains the first payment. Where windows
 * overlap the narrower one wins, because a specific push beats a standing motion.
 */
function findCampaign(campaigns, { firstPaidNumber, regionGroup }) {
  const candidates = campaigns.filter((campaign) => {
    if (campaign.requiresManualList) return false;
    if (campaign.regionGroup !== "ANY" && campaign.regionGroup !== regionGroup) return false;
    return firstPaidNumber >= campaign.fromNumber && firstPaidNumber <= campaign.toNumber;
  });
  if (!candidates.length) return null;
  return candidates.sort((a, b) => a.windowLength - b.windowLength)[0];
}

function main() {
  const facts = readJson(FACTS_PATH);
  const channelsConfig = readJson(CHANNELS_PATH);
  const campaignsConfig = readJson(CAMPAIGNS_PATH);
  const overridesConfig = readJson(OVERRIDES_PATH);

  const overrides = indexOverrides(overridesConfig.overrides || []);
  const campaigns = prepareCampaigns(campaignsConfig.campaigns || []);
  const campaignsById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  const knownChannels = new Set((channelsConfig.channels || []).map((channel) => channel.id));
  const equipmentThreshold = channelsConfig.equipmentPaymentThresholdIls;

  // Windows we know a channel ran in but cannot yet attribute customer by customer.
  const manualListCampaigns = campaigns.filter((campaign) => campaign.requiresManualList);

  const attributed = [];
  const reviewQueue = [];

  for (const fact of facts.customers) {
    const override = overrides.lookup({ sumitId: fact.customerId, name: fact.name });
    const firstPaidNumber = monthToNumber(fact.firstPaidMonth);

    let channel = null;
    let campaign = null;
    let assignmentSource = "unresolved";
    let confidence = "unknown";
    let attributionReason = "";

    if (fact.customerType === "internal") {
      channel = "unknown";
      campaign = null;
      assignmentSource = "manual";
      confidence = "high";
      attributionReason = override?.reason || "Internal or test account, excluded from GTM analysis";
    } else if (override && override.channel) {
      channel = override.channel;
      campaign = override.campaign || null;
      assignmentSource = "manual";
      confidence = "high";
      attributionReason = override.reason || "Manual assignment";
    } else if (fact.lifetimeRevenueIls <= 0 || firstPaidNumber == null) {
      channel = "unknown";
      assignmentSource = "unresolved";
      confidence = "unknown";
      attributionReason = "No completed payment to attribute";
    } else {
      const matched = findCampaign(campaigns, {
        firstPaidNumber,
        regionGroup: fact.regionGroup,
      });
      if (matched) {
        channel = matched.channel;
        campaign = matched.id;
        assignmentSource = "rule";
        confidence = "medium";
        attributionReason = `First payment ${fact.firstPaidMonth} falls in ${matched.label} (${matched.windowFrom}–${matched.windowTo || "open"})`;
      } else {
        channel = "unknown";
        assignmentSource = "unresolved";
        confidence = "unknown";
        attributionReason = `First payment ${fact.firstPaidMonth} sits outside every known campaign window for ${fact.regionGroup}`;
      }
    }

    if (!knownChannels.has(channel)) {
      throw new Error(
        `Customer "${fact.name}" was assigned unknown channel "${channel}". Add it to channels.json.`,
      );
    }
    if (campaign && !campaignsById.has(campaign)) {
      throw new Error(
        `Customer "${fact.name}" references unknown campaign "${campaign}". Add it to campaigns.json.`,
      );
    }

    // A brand or distributor is a different kind of counterparty, not a salon
    // cohort, so carry that through rather than letting it skew retention.
    const inSalonCohort =
      fact.customerType === "salon" && fact.lifetimeRevenueIls > 0 && channel !== "unknown";

    const record = {
      ...fact,
      acquisitionChannel: channel,
      campaign,
      assignmentSource,
      confidence,
      attributionReason,
      inSalonCohort,
    };
    attributed.push(record);

    if (fact.customerType === "internal") continue;

    if (channel === "unknown" && fact.lifetimeRevenueIls > 0) {
      reviewQueue.push({
        customerId: fact.customerId,
        name: fact.name,
        firstPaidMonth: fact.firstPaidMonth,
        lifetimeRevenueIls: fact.lifetimeRevenueIls,
        issue: "no_channel",
        detail: attributionReason,
      });
    }

    // Henkel bought equipment on behalf of salons we have not listed yet, so any
    // Israeli equipment purchase inside that window is a candidate.
    if (assignmentSource === "rule" && fact.regionGroup === "IL") {
      const inManualWindow = manualListCampaigns.find(
        (candidate) =>
          candidate.regionGroup !== "INTL" &&
          firstPaidNumber >= candidate.fromNumber &&
          firstPaidNumber <= candidate.toNumber,
      );
      if (inManualWindow && fact.maxMonthlyPaymentIls >= equipmentThreshold) {
        reviewQueue.push({
          customerId: fact.customerId,
          name: fact.name,
          firstPaidMonth: fact.firstPaidMonth,
          lifetimeRevenueIls: fact.lifetimeRevenueIls,
          issue: "possible_schwarzkopf",
          detail: `Israeli equipment purchase of ₪${Math.round(fact.maxMonthlyPaymentIls).toLocaleString()} inside the ${inManualWindow.label} window — confirm whether Henkel funded it`,
        });
      }
    }

    if (fact.region === "UNKNOWN") {
      reviewQueue.push({
        customerId: fact.customerId,
        name: fact.name,
        firstPaidMonth: fact.firstPaidMonth,
        lifetimeRevenueIls: fact.lifetimeRevenueIls,
        issue: "no_country",
        detail: "No country in CRM, admin snapshot or dialling code — counted as international only",
      });
    }
  }

  const output = {
    _generated: new Date().toISOString(),
    _stage: "2/3 attribution",
    fxIlsPerUsd: facts.fxIlsPerUsd,
    months: facts.months,
    latestMonth: facts.latestMonth,
    recentMonths: facts.recentMonths,
    minMonthsToJudgeRetention: facts.minMonthsToJudgeRetention,
    totalCustomers: attributed.length,
    customers: attributed,
    reviewQueue,
  };

  writeJson(OUTPUT_PATH, output);

  const paying = attributed.filter((c) => c.lifetimeRevenueIls > 0 && c.customerType !== "internal");
  const byChannel = {};
  const byConfidence = {};
  const bySource = {};
  for (const customer of paying) {
    byChannel[customer.acquisitionChannel] = (byChannel[customer.acquisitionChannel] || 0) + 1;
    byConfidence[customer.confidence] = (byConfidence[customer.confidence] || 0) + 1;
    bySource[customer.assignmentSource] = (bySource[customer.assignmentSource] || 0) + 1;
  }
  const issues = {};
  for (const item of reviewQueue) issues[item.issue] = (issues[item.issue] || 0) + 1;

  console.log(`Stage 2 → ${path.relative(process.cwd(), OUTPUT_PATH)}`);
  console.log(`  Paying customers:      ${paying.length}`);
  console.log(`  By channel:            ${JSON.stringify(byChannel)}`);
  console.log(`  By assignment source:  ${JSON.stringify(bySource)}`);
  console.log(`  By confidence:         ${JSON.stringify(byConfidence)}`);
  console.log(`  Review queue:          ${JSON.stringify(issues)}`);
}

main();
