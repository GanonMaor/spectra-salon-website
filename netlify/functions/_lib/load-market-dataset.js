/**
 * load-market-dataset.js
 * ---------------------------------------------------------------
 * Shared helper for Netlify functions that need the latest
 * market-intelligence dataset (Market Insights, HairGPT, etc.).
 *
 * Order of preference:
 *   1. Latest committed snapshot in `usage_snapshots`
 *      (populated by usage-import on every successful commit).
 *   2. Bundled `src/data/market-intelligence.json` (last build).
 *
 * Always returns the same shape as the bundled JSON.
 */

const { createClient, hasDatabaseUrl } = require("../_db");

let bundledDataset;
function getBundledDataset() {
  if (!bundledDataset) {
    // Lazy require so a failure to read the JSON doesn't crash
    // import-time. The JSON ships with the deployment so it's
    // expected to always be present.
    bundledDataset = require("../../../src/data/market-intelligence.json");
  }
  return bundledDataset;
}

async function loadLatestSnapshot() {
  if (!hasDatabaseUrl()) return null;
  const client = createClient();
  try {
    await client.connect();
    const res = await client.query(
      `SELECT payload, generated_at FROM usage_snapshots
        WHERE dataset_key = 'market-intelligence' AND is_current = true
        ORDER BY id DESC LIMIT 1`,
    );
    if (res.rows.length === 0) return null;
    return {
      dataset: res.rows[0].payload,
      generatedAt: res.rows[0].generated_at,
      source: "live-snapshot",
    };
  } catch (e) {
    console.warn("load-market-dataset: live snapshot unavailable", e.message);
    return null;
  } finally {
    try {
      await client.end();
    } catch (_) {}
  }
}

/**
 * Resolve the freshest available market dataset.
 * Always returns `{ dataset, source, generatedAt }`.
 */
async function loadMarketDataset() {
  const live = await loadLatestSnapshot();
  if (live && live.dataset && live.dataset.summary) {
    return live;
  }
  const bundled = getBundledDataset();
  return {
    dataset: bundled,
    generatedAt: bundled._generated || "",
    source: "bundled-json",
  };
}

module.exports = { loadMarketDataset, loadLatestSnapshot, getBundledDataset };
