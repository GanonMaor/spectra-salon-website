/**
 * marketDataset.ts
 * ---------------------------------------------------------------
 * Single source of truth for the market-intelligence dataset
 * consumed by /market-intelligence, /loreal-analytics, HairGPT,
 * Investor Flywheel etc.
 *
 * The bundled JSON keeps fast first paint working when there's no
 * network or no DB snapshot yet. As soon as the admin imports a
 * fresh month and the Netlify `/usage-import/snapshot` endpoint is
 * reachable, every consumer picks up the new dataset automatically.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import bundledJson from "../data/market-intelligence.json";
import { fetchSnapshot } from "./usageImportClient";
import type { SnapshotResponse } from "./types/usageImport";

// The bundled JSON keeps an identical shape to whatever the
// aggregator produces on the server. We use `any` so existing
// consumers keep working without a heavy type migration.
export const BUNDLED_DATASET = bundledJson as unknown as MarketDataset;

export type MarketDataset = {
  _generated?: string;
  _fileCount?: number;
  summary: Record<string, any>;
  monthlyTrends: any[];
  brandPerformance: any[];
  brandMonthly: any[];
  serviceBreakdown: any[];
  geographicDistribution: any[];
  salonSizeBenchmarks: any[];
  pricingTrends: any[];
  customerOverview: any[];
  monthlySnapshots: Record<string, any>;
  rawRows: any[];
  filterOptions: {
    months: string[];
    countries: string[];
    cities: string[];
    brands: string[];
    serviceTypes: string[];
  };
};

export interface LiveDatasetState {
  dataset: MarketDataset;
  isLive: boolean;
  generatedAt: string;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Returns the freshest available market dataset.
 *  - Synchronous default: the bundled JSON (so the page can render
 *    instantly with the data that shipped with the build).
 *  - As soon as the live snapshot loads, the dataset is swapped in.
 *
 * Pages that want to display "last updated" or skip live fetches
 * can read `isLive` / `generatedAt`.
 */
export function useLiveMarketDataset(): LiveDatasetState {
  const [dataset, setDataset] = useState<MarketDataset>(BUNDLED_DATASET);
  const [generatedAt, setGeneratedAt] = useState<string>(
    BUNDLED_DATASET._generated || "",
  );
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const load = useMemo(
    () => async () => {
      setLoading(true);
      setError(null);
      try {
        const snap: SnapshotResponse = await fetchSnapshot();
        if (!mountedRef.current) return;
        if (
          snap &&
          snap.dataset &&
          typeof (snap.dataset as any).summary === "object"
        ) {
          const live = snap.dataset as MarketDataset;
          const liveGenerated = live._generated || snap.generatedAt;
          const bundledGenerated = BUNDLED_DATASET._generated || "";
          if (!bundledGenerated || liveGenerated >= bundledGenerated) {
            setDataset(live);
            setGeneratedAt(liveGenerated);
            setIsLive(true);
          }
        }
      } catch (e: any) {
        if (!mountedRef.current) return;
        // Silent: bundled JSON keeps working.
        setError(e?.message || "Snapshot unavailable");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  return { dataset, isLive, generatedAt, loading, error, refresh: load };
}

/**
 * Derive Israel-only views used by the L'Oréal Analytics page from
 * any market dataset.
 */
const ISRAEL_KEYS = ["ISRAEL", "Israel"];
export function deriveIsraelViews(dataset: MarketDataset) {
  const rawRows = (dataset.rawRows || []).filter((r) =>
    ISRAEL_KEYS.includes(r.co),
  );
  const map: Record<string, number> = {};
  for (const r of rawRows) {
    if (!(r.mk in map) || r.si < map[r.mk]) map[r.mk] = r.si;
  }
  const availableMonths = Object.entries(map)
    .map(([label, si]) => ({ label, si }))
    .sort((a, b) => a.si - b.si);
  return { rawRows, availableMonths };
}
