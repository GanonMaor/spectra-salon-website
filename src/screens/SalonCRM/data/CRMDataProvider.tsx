/**
 * CRMDataProvider — single state owner for the entire CRM.
 *
 * Loads the seed snapshot through the repository once at mount, normalizes
 * it into stable ID maps, and exposes:
 *   - the raw normalized state (for selector consumption via hooks)
 *   - the bound dispatch function used by `crmActions`
 *
 * Screens never read or write state directly. They go through the hooks
 * exposed in `crmHooks.ts`, which call selectors against the state from
 * this provider. The contract is shaped so the seed adapter can be
 * swapped for a real HTTP repository without any UI changes.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { CRMRepository } from "./crmRepository";
import { seedCRMRepository, toCRMRepositoryError } from "./crmRepository";
import type { CRMError } from "./crmContracts";
import { crmReducer, type CRMAction } from "./crmActions";
import { warnInvalidCRMState } from "./crmStateValidation";
import { getCRMStrictMode } from "./crmStrictMode";
import type {
  CRMDataSnapshot,
  CRMNormalizedState,
  ServiceCategoryId,
} from "./crmTypes";
import { getSalonScopeKey } from "./salonSession";

// Legacy global key (pre multi-tenant). We proactively clear it so old,
// tenant-agnostic CRM state can never leak into a scoped session.
const LEGACY_GLOBAL_CACHE_KEY = "spectra.crm.normalizedState.v1";

// Client-side CRM cache is a temporary cache ONLY, never the source of truth,
// and is namespaced per salon/user so one tenant can never read another's
// cached state from the same browser.
function scopedCacheKey(): string {
  return `spectra.crm.cache.v1.${getSalonScopeKey()}`;
}

/** Remove the current session's scoped CRM cache (used on logout). */
export function clearScopedCRMCache(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(scopedCacheKey());
    window.localStorage.removeItem(LEGACY_GLOBAL_CACHE_KEY);
  } catch {
    /* ignore storage failures */
  }
}

// ── Normalization ─────────────────────────────────────────────────

function indexBy<T extends { id: string | number }>(
  list: T[],
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const item of list) out[String(item.id)] = item;
  return out;
}

function indexCategoriesBy<T extends { id: ServiceCategoryId }>(
  list: T[],
): Record<ServiceCategoryId, T> {
  const out = {
    color: undefined as unknown as T,
    highlights: undefined as unknown as T,
    toner: undefined as unknown as T,
    straightening: undefined as unknown as T,
    cut: undefined as unknown as T,
    treatment: undefined as unknown as T,
    other: undefined as unknown as T,
  } as Record<ServiceCategoryId, T>;
  for (const item of list) out[item.id] = item;
  return out;
}

export function normalizeSnapshot(
  snapshot: CRMDataSnapshot,
): CRMNormalizedState {
  return {
    currentSalonId: snapshot.salonId,
    salonsById: indexBy(snapshot.salons),
    customersById: indexBy(snapshot.customers),
    staffById: indexBy(snapshot.staff),
    serviceCategoriesById: indexCategoriesBy(snapshot.serviceCategories),
    servicesById: indexBy(snapshot.services),
    appointmentsById: indexBy(snapshot.appointments),
    visitsById: indexBy(snapshot.visits),
    visitServicesById: indexBy(snapshot.visitServices),
    brandsById: indexBy(snapshot.brands),
    productLinesById: indexBy(snapshot.productLines),
    productsById: indexBy(snapshot.products),
    inventoryById: indexBy(snapshot.inventoryItems),
    mixSessionsById: indexBy(snapshot.mixSessions),
    productUsageById: indexBy(snapshot.productUsage),
    reweighOutcomesById: indexBy(snapshot.reweighOutcomes),
    analyticsSnapshotsById: indexBy(snapshot.analyticsSnapshots),
    systemState: snapshot.systemState,
    version: 1,
    lastUpdatedAt: new Date().toISOString(),
  };
}

// ── Context ───────────────────────────────────────────────────────

interface CRMDataContextValue {
  state: CRMNormalizedState | null;
  dispatch: React.Dispatch<CRMAction>;
  /**
   * Mutable ref pointing at the freshest state. Action helpers in
   * `crmHooks` read from this so they always validate against the
   * post-dispatch snapshot (React's reducer does not surface the new
   * state synchronously).
   */
  stateRef: React.MutableRefObject<CRMNormalizedState>;
  /**
   * The repository instance used for live API mutations. Exposed so
   * `useCRMActions` can call create/update/delete on the same transport
   * that loaded the snapshot — no separate fetch configuration needed.
   */
  repository: CRMRepository;
  loading: boolean;
  error: string | null;
  /** Structured error from the last failed hydrate, if any. */
  errorDetail: CRMError | null;
  hydrated: boolean;
  reload: () => Promise<void>;
}

const CRMDataContext = createContext<CRMDataContextValue | null>(null);

const EMPTY_STATE: CRMNormalizedState = {
  currentSalonId: "",
  salonsById: {},
  customersById: {},
  staffById: {},
  serviceCategoriesById: indexCategoriesBy([]),
  servicesById: {},
  appointmentsById: {},
  visitsById: {},
  visitServicesById: {},
  brandsById: {},
  productLinesById: {},
  productsById: {},
  inventoryById: {},
  mixSessionsById: {},
  productUsageById: {},
  reweighOutcomesById: {},
  analyticsSnapshotsById: {},
  systemState: {
    activeDate: new Date().toISOString().slice(0, 10),
    bluetooth: { connected: false, deviceLabel: "" },
    notifications: { unreadCount: 0, hasUrgent: false },
    comingSoonFeatures: {},
    marketplace: [],
  },
  version: 0,
  lastUpdatedAt: new Date(0).toISOString(),
};

function readPersistedCRMState(): CRMNormalizedState | null {
  if (typeof window === "undefined") return null;
  try {
    // Drop the legacy tenant-agnostic cache if it lingers from an older build.
    window.localStorage.removeItem(LEGACY_GLOBAL_CACHE_KEY);
    const raw = window.localStorage.getItem(scopedCacheKey());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CRMNormalizedState;
    if (!parsed || typeof parsed !== "object" || !parsed.currentSalonId) return null;
    return parsed;
  } catch (err) {
    console.warn("[CRMDataProvider] failed to read persisted CRM state", err);
    return null;
  }
}

function persistCRMState(state: CRMNormalizedState): void {
  if (typeof window === "undefined" || !state.currentSalonId) return;
  try {
    window.localStorage.setItem(
      scopedCacheKey(),
      JSON.stringify({ ...state, lastUpdatedAt: new Date().toISOString() }),
    );
  } catch (err) {
    console.warn("[CRMDataProvider] failed to persist CRM state", err);
  }
}

function mergePersistedWithSeed(
  persisted: CRMNormalizedState,
  seed: CRMNormalizedState,
): CRMNormalizedState {
  return {
    ...seed,
    ...persisted,
    salonsById: { ...seed.salonsById, ...persisted.salonsById },
    customersById: { ...seed.customersById, ...persisted.customersById },
    staffById: { ...seed.staffById, ...persisted.staffById },
    serviceCategoriesById: { ...seed.serviceCategoriesById, ...persisted.serviceCategoriesById },
    servicesById: { ...seed.servicesById, ...persisted.servicesById },
    appointmentsById: { ...seed.appointmentsById, ...persisted.appointmentsById },
    visitsById: { ...seed.visitsById, ...persisted.visitsById },
    visitServicesById: { ...seed.visitServicesById, ...persisted.visitServicesById },
    brandsById: { ...seed.brandsById, ...persisted.brandsById },
    productLinesById: { ...seed.productLinesById, ...persisted.productLinesById },
    productsById: { ...seed.productsById, ...persisted.productsById },
    inventoryById: { ...seed.inventoryById, ...persisted.inventoryById },
    mixSessionsById: { ...seed.mixSessionsById, ...persisted.mixSessionsById },
    productUsageById: { ...seed.productUsageById, ...persisted.productUsageById },
    reweighOutcomesById: { ...seed.reweighOutcomesById, ...persisted.reweighOutcomesById },
    systemState: {
      ...seed.systemState,
      ...persisted.systemState,
      marketplace: persisted.systemState.marketplace?.length
        ? persisted.systemState.marketplace
        : seed.systemState.marketplace,
    },
    lastUpdatedAt: new Date().toISOString(),
  };
}

function mergePersistedWithoutInventory(
  persisted: CRMNormalizedState,
  seed: CRMNormalizedState,
): CRMNormalizedState {
  const merged = mergePersistedWithSeed(persisted, seed);
  return {
    ...merged,
    brandsById: seed.brandsById,
    productLinesById: seed.productLinesById,
    productsById: seed.productsById,
    inventoryById: seed.inventoryById,
    productUsageById: seed.productUsageById,
  };
}

// ── Provider ──────────────────────────────────────────────────────

interface CRMDataProviderProps {
  children: React.ReactNode;
  repository?: CRMRepository;
}

export const CRMDataProvider: React.FC<CRMDataProviderProps> = ({
  children,
  repository = seedCRMRepository,
}) => {
  const [state, dispatch] = useReducer(crmReducer, EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<CRMError | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef<CRMNormalizedState>(state);

  // Keep the ref in lockstep with the rendered state so action
  // helpers always see the latest snapshot synchronously.
  stateRef.current = state;

  useEffect(() => {
    const isDevRuntime = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);
    if (repository === seedCRMRepository && !isDevRuntime) {
      console.error("[CRMDataProvider] SeedCRMRepository is active outside development runtime.");
    }
  }, [repository]);

  const hydrate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    try {
      const snapshot = await repository.loadSnapshot();
      const snapshotNormalized = normalizeSnapshot(snapshot);
      const persisted = repository.persistedStatePolicy === "none" ? null : readPersistedCRMState();
      const normalized = persisted
        ? repository.persistedStatePolicy === "exclude-inventory"
          ? mergePersistedWithoutInventory(persisted, snapshotNormalized)
          : mergePersistedWithSeed(persisted, snapshotNormalized)
        : snapshotNormalized;
      // Validate hydration payload before broadcasting it. In strict
      // mode this throws; in production it logs warnings and
      // proceeds so end-users do not see a broken screen for a single
      // dirty record.
      const report = warnInvalidCRMState(normalized, "hydrate");
      if (!report.ok && getCRMStrictMode().throwOnInvalidState) {
        // warnInvalidCRMState already threw in strict mode; this
        // branch is defensive in case the strict flag changed
        // mid-hydrate.
        throw new Error(`[CRMDataProvider] invalid hydration snapshot`);
      }
      dispatch({ type: "HYDRATE", payload: normalized });
      stateRef.current = normalized;
      setHydrated(true);
    } catch (err) {
      const repoError = toCRMRepositoryError(err);
      console.error("[CRMDataProvider] failed to hydrate:", repoError);
      setError(repoError.message);
      setErrorDetail(repoError);
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrate, hydrated]);

  useEffect(() => {
    // Never persist normalized business state for live/API repositories: the DB
    // is the source of truth and localStorage must not silently restore stale
    // business records on the next hard-refresh or login.
    if (repository.persistedStatePolicy === "none") return;
    if (!hydrated || !state.currentSalonId) return;
    persistCRMState(state);
  }, [state, hydrated, repository]);

  const value = useMemo<CRMDataContextValue>(
    () => ({
      state,
      dispatch,
      repository,
      stateRef,
      loading,
      error,
      errorDetail,
      hydrated,
      reload: hydrate,
    }),
    [state, repository, loading, error, errorDetail, hydrate, hydrated],
  );

  return (
    <CRMDataContext.Provider value={value}>{children}</CRMDataContext.Provider>
  );
};

// ── Internal accessor ─────────────────────────────────────────────

export function useCRMContext(): CRMDataContextValue {
  const ctx = useContext(CRMDataContext);
  if (!ctx) {
    throw new Error(
      "[CRM] useCRMContext must be used inside <CRMDataProvider>. Wrap your screen in SalonCRMPage.",
    );
  }
  return ctx;
}

export function useCRMState(): CRMNormalizedState {
  return useCRMContext().state ?? EMPTY_STATE;
}
