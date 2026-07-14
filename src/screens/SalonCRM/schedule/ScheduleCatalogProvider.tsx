/**
 * Schedule catalog provider.
 *
 * Holds the in-memory, editable service catalog used by the booking flow and
 * the schedule settings tab: departments, categories, services, default
 * stages, linked services, resources, and client-specific timing overrides.
 *
 * In live runtime mode the authoritative first source is the shell's already
 * fetched `bootstrap.catalog` (from `CRMDataProvider`) — the provider never
 * fires a duplicate cold-boot fetch and never renders a generic fallback
 * calendar while that catalog is pending or unavailable. Its loading/error
 * status mirrors the shell bootstrap lifecycle so the schedule shows a stable
 * skeleton, a retryable error, or a truthful empty state instead of a
 * hardcoded `dept-hair` calendar. An explicit refresh (via `reload`) re-reads
 * the catalog, but only after the shell bootstrap has succeeded.
 *
 * In local/demo mode (no runtime session) it keeps usable seed defaults.
 * Appointments are still created through the real CRM actions, so this provider
 * never mutates the shared normalized state.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { ServiceCategoryId } from "../data/crmTypes";
import { useCrmT } from "../i18n/CrmLocale";
import {
  createCrmCategory,
  createCrmDepartment,
  createCrmResource,
  createCrmService,
  invalidateCrmServicesCatalog,
  listCrmServicesCatalog,
  updateCrmCategory,
  updateCrmDepartment,
  updateCrmResource,
  updateCrmService,
} from "../data/crmServicesApi";
import { useCRMContextOptional } from "../data/CRMDataProvider";
import { canCallSalonRuntimeApi } from "../data/salonSession";
import type {
  CatalogCategory,
  CatalogService,
  CatalogStatus,
  ClientServiceTimingOverride,
  SalonResource,
  ScheduleCatalogState,
  ServiceDepartment,
} from "./catalogTypes";
import { generateDefaultStages, buildStageLabelSet } from "./serviceCatalogUtils";
import { defaultServiceColor } from "./scheduleDesign";

let catalogCounter = 0;
function nextCatalogId(prefix: string): string {
  catalogCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${catalogCounter}`;
}

function sortDepartments(departments: ServiceDepartment[]): ServiceDepartment[] {
  return [...departments].sort((a, b) =>
    (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name),
  );
}

const SEED_RESOURCES: SalonResource[] = [
  { id: "res-chair-1", type: "chair",          name: "Chair 1",       status: "active", sortOrder: 0 },
  { id: "res-chair-2", type: "chair",          name: "Chair 2",       status: "active", sortOrder: 1 },
  { id: "res-chair-3", type: "chair",          name: "Chair 3",       status: "active", sortOrder: 2 },
  { id: "res-chair-4", type: "chair",          name: "Chair 4",       status: "active", sortOrder: 3 },
  { id: "res-wash-1",  type: "wash-station",   name: "Wash Station 1", status: "active", sortOrder: 4 },
  { id: "res-wash-2",  type: "wash-station",   name: "Wash Station 2", status: "active", sortOrder: 5 },
  { id: "res-color-1", type: "color-station",  name: "Color Bar",      status: "active", sortOrder: 6 },
  { id: "res-room-1",  type: "treatment-room", name: "Treatment Room", status: "active", sortOrder: 7 },
];

const INITIAL_STATE: ScheduleCatalogState = {
  departments: [],
  categories: [],
  services: [],
  resources: SEED_RESOURCES,
  timingOverrides: [],
};

function buildInitialState(): ScheduleCatalogState {
  // In live runtime mode the DB is the source of truth: start with NO resources
  // so the eight seed chairs/stations never flash before — or persist instead
  // of — the real catalog. The `SEED_CATALOG` reducer then applies exactly what
  // the API returns, including a truthful empty set that replaces any prior
  // resources (no stale retention). Only local/demo mode (no runtime session,
  // nothing to fetch) keeps the usable seed defaults; `SEED_CATALOG` is never
  // dispatched there, so those explicit demo seeds are preserved.
  const resources = canCallSalonRuntimeApi() ? [] : SEED_RESOURCES;
  return {
    ...INITIAL_STATE,
    departments: [],
    resources,
  };
}

// ── Actions ────────────────────────────────────────────────────────

type CatalogAction =
  | { type: "SEED_CATALOG"; categories: CatalogCategory[]; services: CatalogService[]; departments?: ServiceDepartment[]; resources?: SalonResource[] }
  | { type: "DEPT_CREATE"; id?: string; name: string; description?: string; calendarColor?: string }
  | { type: "DEPT_UPDATE"; id: string; patch: Partial<ServiceDepartment> }
  | { type: "DEPT_ARCHIVE"; id: string }
  | { type: "CATEGORY_CREATE"; id?: string; departmentId: string; name: string; accentColor: string; crmCategoryId: ServiceCategoryId }
  | { type: "CATEGORY_UPDATE"; id: string; patch: Partial<CatalogCategory> }
  | { type: "CATEGORY_ARCHIVE"; id: string }
  | { type: "SERVICE_CREATE"; service: CatalogService }
  | { type: "SERVICE_UPDATE"; id: string; patch: Partial<CatalogService> }
  | { type: "SERVICE_ARCHIVE"; id: string }
  | { type: "RESOURCE_CREATE"; id?: string; resource: Omit<SalonResource, "id" | "sortOrder"> }
  | { type: "RESOURCE_UPDATE"; id: string; patch: Partial<SalonResource> }
  | { type: "RESOURCE_ARCHIVE"; id: string }
  | { type: "TIMING_SAVE"; override: ClientServiceTimingOverride }
  | { type: "TIMING_DELETE"; customerId: string; serviceId: string };

function catalogReducer(state: ScheduleCatalogState, action: CatalogAction): ScheduleCatalogState {
  switch (action.type) {
    case "SEED_CATALOG":
      // Use action.departments when explicitly provided (including empty array
      // from a live DB that has no departments yet). Undefined means the
      // fallback path did not supply departments; keep existing state.
      return {
        ...state,
        departments: action.departments != null ? sortDepartments(action.departments) : state.departments,
        categories: action.categories,
        services: action.services,
        // An authoritative resources array (from a live bootstrap or an explicit
        // refresh) always replaces prior state — including an authoritative
        // EMPTY array, so a salon whose resources were removed never retains
        // stale rows. Only `undefined` (a fallback path that did not supply
        // resources) keeps the existing state, which is what preserves the
        // local demo seeds: in demo mode `SEED_CATALOG` is never dispatched, so
        // the seeded resources from `buildInitialState` remain untouched.
        resources: action.resources != null ? action.resources : state.resources,
      };

    case "DEPT_CREATE":
      return {
        ...state,
        departments: sortDepartments([
          ...state.departments,
          {
            id: action.id ?? nextCatalogId("dept"),
            name: action.name,
            calendarLabel: action.name,
            calendarColor: action.calendarColor ?? "#F9B95C",
            bookingMode: "singleBlock",
            isCalendarEnabled: true,
            description: action.description,
            sortOrder: state.departments.length,
            status: "active",
          },
        ]),
      };
    case "DEPT_UPDATE":
      return {
        ...state,
        departments: sortDepartments(state.departments.map((d) => (d.id === action.id ? { ...d, ...action.patch } : d))),
      };
    case "DEPT_ARCHIVE":
      return {
        ...state,
        departments: sortDepartments(state.departments.map((d) => (d.id === action.id ? { ...d, status: "archived" } : d))),
      };

    case "CATEGORY_CREATE":
      return {
        ...state,
        categories: [
          ...state.categories,
          {
            id: action.id ?? nextCatalogId("cat"),
            departmentId: action.departmentId,
            crmCategoryId: action.crmCategoryId,
            name: action.name,
            accentColor: action.accentColor,
            sortOrder: state.categories.length,
            status: "active",
          },
        ],
      };
    case "CATEGORY_UPDATE":
      return { ...state, categories: state.categories.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)) };
    case "CATEGORY_ARCHIVE":
      return { ...state, categories: state.categories.map((c) => (c.id === action.id ? { ...c, status: "archived" } : c)) };

    case "SERVICE_CREATE":
      return { ...state, services: [...state.services, action.service] };
    case "SERVICE_UPDATE":
      return { ...state, services: state.services.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)) };
    case "SERVICE_ARCHIVE":
      return { ...state, services: state.services.map((s) => (s.id === action.id ? { ...s, status: "archived" } : s)) };

    case "RESOURCE_CREATE":
      return {
        ...state,
        resources: [...state.resources, { ...action.resource, id: action.id ?? nextCatalogId("res"), sortOrder: state.resources.length }],
      };
    case "RESOURCE_UPDATE":
      return { ...state, resources: state.resources.map((r) => (r.id === action.id ? { ...r, ...action.patch } : r)) };
    case "RESOURCE_ARCHIVE":
      return { ...state, resources: state.resources.map((r) => (r.id === action.id ? { ...r, status: "archived" } : r)) };

    case "TIMING_SAVE": {
      const others = state.timingOverrides.filter(
        (o) => !(o.customerId === action.override.customerId && o.serviceId === action.override.serviceId),
      );
      return { ...state, timingOverrides: [...others, action.override] };
    }
    case "TIMING_DELETE":
      return {
        ...state,
        timingOverrides: state.timingOverrides.filter(
          (o) => !(o.customerId === action.customerId && o.serviceId === action.serviceId),
        ),
      };

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────

/**
 * Load / write status for the catalog. The section UI uses this to show a
 * spinner while the live catalog is loading, an error + retry affordance if the
 * initial fetch failed (instead of a misleading empty state), and a dismissible
 * banner when an optimistic write could not be persisted.
 */
export interface ScheduleCatalogStatus {
  /**
   * True while the authoritative catalog is not yet available — i.e. the shell
   * bootstrap is still pending in live mode, or an explicit refresh is in
   * flight. The schedule shows a stable skeleton while this is true.
   */
  loading: boolean;
  /**
   * Set when the authoritative catalog is unavailable: the shell bootstrap
   * failed / is unauthorized, or an explicit refresh failed. Retry via
   * `reload`. Never mixed with a truthful empty state.
   */
  loadError: string | null;
  /** Set when an optimistic write could not be persisted to the API. */
  writeError: string | null;
  /**
   * True only when the authoritative catalog is live-backed (runtime session).
   * Consumers use this to decide whether an empty catalog is a truthful
   * "nothing configured yet" state (live) or the seeded local/demo defaults.
   */
  live: boolean;
}

export interface ScheduleCatalogApi {
  state: ScheduleCatalogState;
  status: ScheduleCatalogStatus;
  /** Re-fetch the live catalog (used by the error-state retry button). */
  reload: () => void;
  /** Dismiss the current write-failure banner. */
  clearWriteError: () => void;
  createDepartment: (name: string, description?: string, calendarColor?: string) => void;
  updateDepartment: (id: string, patch: Partial<ServiceDepartment>) => void;
  archiveDepartment: (id: string) => void;
  createCategory: (input: { departmentId: string; name: string; accentColor: string; crmCategoryId: ServiceCategoryId }) => void;
  updateCategory: (id: string, patch: Partial<CatalogCategory>) => void;
  archiveCategory: (id: string) => void;
  createService: (input: {
    categoryId: string;
    crmCategoryId: ServiceCategoryId;
    name: string;
    defaultDurationMinutes: number;
    defaultPriceCents: number;
    defaultMaterialCostCents?: number;
    accentColor?: string;
  }) => void;
  updateService: (id: string, patch: Partial<CatalogService>) => void;
  archiveService: (id: string) => void;
  createResource: (input: Omit<SalonResource, "id" | "sortOrder">) => void;
  updateResource: (id: string, patch: Partial<SalonResource>) => void;
  archiveResource: (id: string) => void;
  saveTimingOverride: (override: ClientServiceTimingOverride) => void;
  deleteTimingOverride: (customerId: string, serviceId: string) => void;
  newStageId: () => string;
}

const ScheduleCatalogContext = createContext<ScheduleCatalogApi | null>(null);

export const ScheduleCatalogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const t = useCrmT();
  const stageLabels = useMemo(() => buildStageLabelSet(t), [t]);

  const [state, dispatch] = useReducer(catalogReducer, undefined, buildInitialState);
  const persistedDepartmentIdsRef = useRef(new Set<string>());
  const persistedCategoryIdsRef = useRef(new Set<string>());

  // The authoritative catalog source in live mode is the shell bootstrap that
  // already ran in CRMDataProvider — never a duplicate cold-boot fetch here.
  const crm = useCRMContextOptional();
  const isLive = canCallSalonRuntimeApi();

  const [writeError, setWriteError] = useState<string | null>(null);
  const clearWriteError = useCallback(() => setWriteError(null), []);

  // Explicit refresh (post-shell-success) state. Cold boot never sets these.
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  // The bootstrap fingerprint whose catalog we have already applied. Re-seeds
  // whenever the session identity changes (login / logout / tenant switch).
  const [seededFingerprint, setSeededFingerprint] = useState<string | null>(null);

  // Report an optimistic-write failure to the UI. The local state already
  // reflects the change, but it may not have persisted — surface a clear,
  // actionable message instead of only logging to the console.
  const reportWriteError = useCallback((context: string, err: unknown) => {
    console.warn(`[ScheduleCatalogProvider] ${context} failed`, err);
    const detail = err instanceof Error ? err.message : String(err);
    setWriteError(
      `Couldn't save catalog changes (${context}). They're shown here but may not have been saved${detail ? ` — ${detail}` : ""}. Reload to confirm.`,
    );
  }, []);

  // ── Authoritative catalog wiring ─────────────────────────────────
  //
  // Live mode: consume the shell's bootstrap.catalog exactly once per session
  // identity. This is the SAME payload the sidebar already built its navigation
  // from, so the schedule never fires a duplicate cold-boot fetch and never
  // races the shell. A refresh generation guards a late explicit refresh.
  const bootstrap = crm?.bootstrap ?? null;
  const bootstrapStatus = crm?.bootstrapStatus ?? "idle";
  const bootstrapFingerprint = bootstrap?.identity.fingerprint ?? null;
  const refreshGenerationRef = useRef(0);

  const applyCatalog = useCallback(
    (catalog: { departments: ServiceDepartment[]; categories: CatalogCategory[]; services: CatalogService[]; resources: SalonResource[] }) => {
      persistedDepartmentIdsRef.current = new Set(catalog.departments.map((department) => department.id));
      persistedCategoryIdsRef.current = new Set(catalog.categories.map((category) => category.id));
      dispatch({
        type: "SEED_CATALOG",
        departments: catalog.departments,
        categories: catalog.categories,
        services: catalog.services,
        resources: catalog.resources,
      });
    },
    [],
  );

  useEffect(() => {
    if (!isLive) return;
    if (bootstrapStatus !== "success" || !bootstrap || bootstrapFingerprint == null) return;
    if (seededFingerprint === bootstrapFingerprint) return;
    applyCatalog(bootstrap.catalog);
    setSeededFingerprint(bootstrapFingerprint);
    // A stale explicit refresh must not overwrite a freshly-seeded catalog.
    refreshGenerationRef.current += 1;
    setRefreshLoading(false);
    setRefreshError(null);
  }, [isLive, bootstrap, bootstrapStatus, bootstrapFingerprint, seededFingerprint, applyCatalog]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("spectra:crm-departments-changed", {
      detail: { departments: sortDepartments(state.departments) },
    }));
  }, [state.departments]);

  const ensurePersistedDepartment = async (departmentId: string) => {
    if (persistedDepartmentIdsRef.current.has(departmentId)) return;
    const department = state.departments.find((item) => item.id === departmentId);
    if (!department) return;
    try {
      await createCrmDepartment({
        id: department.id,
        name: department.name,
        calendarLabel: department.calendarLabel ?? department.name,
        calendarColor: department.calendarColor,
        bookingMode: department.bookingMode,
        isCalendarEnabled: department.isCalendarEnabled,
        sortOrder: department.sortOrder,
        status: department.status,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("duplicate key")) throw err;
    }
    persistedDepartmentIdsRef.current.add(departmentId);
  };

  const ensurePersistedCategory = async (categoryId: string) => {
    if (persistedCategoryIdsRef.current.has(categoryId)) return;
    const category = state.categories.find((item) => item.id === categoryId);
    if (!category) return;
    await ensurePersistedDepartment(category.departmentId);
    try {
      await createCrmCategory({
        id: category.id,
        departmentId: category.departmentId,
        crmCategoryId: category.crmCategoryId ?? "other",
        name: category.name,
        accentColor: category.accentColor,
        sortOrder: category.sortOrder,
        status: category.status,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!message.includes("duplicate key")) throw err;
    }
    persistedCategoryIdsRef.current.add(categoryId);
  };

  const reload = useCallback(() => {
    if (!isLive) return;
    // Before the shell has a trusted snapshot, the authoritative refresh is to
    // re-run the shell bootstrap; the seed effect re-applies the fresh catalog.
    if (bootstrapStatus !== "success") {
      setSeededFingerprint(null);
      setRefreshError(null);
      void crm?.reload();
      return;
    }
    // After shell success, do a targeted catalog refresh (e.g. from the error
    // retry or a write-failure banner) without a full CRM cold boot.
    const generation = refreshGenerationRef.current + 1;
    refreshGenerationRef.current = generation;
    setRefreshLoading(true);
    setRefreshError(null);
    invalidateCrmServicesCatalog();
    listCrmServicesCatalog()
      .then((catalog) => {
        if (generation !== refreshGenerationRef.current) return;
        applyCatalog({
          departments: catalog.departments,
          categories: catalog.categories,
          services: catalog.services,
          resources: catalog.resources ?? [],
        });
        setRefreshLoading(false);
      })
      .catch((err) => {
        if (generation !== refreshGenerationRef.current) return;
        console.warn("[ScheduleCatalogProvider] explicit catalog refresh failed", err);
        setRefreshError(err instanceof Error ? err.message : String(err));
        setRefreshLoading(false);
      });
  }, [isLive, bootstrapStatus, crm, applyCatalog]);

  // Derived readiness that mirrors the shell bootstrap lifecycle in live mode.
  // Local/demo mode has nothing to load, so it is always resolved.
  const bootstrapError = isLive
    && (bootstrapStatus === "error" || bootstrapStatus === "unauthorized")
    ? (crm?.error ?? "We couldn't load your salon catalog.")
    : null;
  const catalogSeeded = !isLive
    || (bootstrapFingerprint != null && seededFingerprint === bootstrapFingerprint);
  const loading = isLive
    ? refreshLoading || (!catalogSeeded && bootstrapError == null)
    : false;
  const loadError = isLive ? (refreshError ?? bootstrapError) : null;

  const api = useMemo<ScheduleCatalogApi>(() => ({
    state,
    status: { loading, loadError, writeError, live: isLive },
    reload,
    clearWriteError,
    createDepartment: (name, description, calendarColor) => {
      const id = nextCatalogId("dept");
      dispatch({ type: "DEPT_CREATE", id, name, description, calendarColor });
      void createCrmDepartment({ id, name, calendarLabel: name, calendarColor, bookingMode: "singleBlock", isCalendarEnabled: true, sortOrder: state.departments.length })
        .then(() => {
          persistedDepartmentIdsRef.current.add(id);
        })
        .catch((err) => reportWriteError("create department", err));
    },
    updateDepartment: (id, patch) => {
      dispatch({ type: "DEPT_UPDATE", id, patch });
      void updateCrmDepartment(id, patch).catch((err) => reportWriteError("update department", err));
    },
    archiveDepartment: (id) => {
      dispatch({ type: "DEPT_ARCHIVE", id });
      void updateCrmDepartment(id, { status: "archived" }).catch((err) => reportWriteError("archive department", err));
    },
    createCategory: (input) => {
      const id = nextCatalogId("cat");
      dispatch({ type: "CATEGORY_CREATE", id, ...input });
      void ensurePersistedDepartment(input.departmentId)
        .then(() => createCrmCategory({ id, ...input, sortOrder: state.categories.length, status: "active" }))
        .then(() => {
          persistedCategoryIdsRef.current.add(id);
        })
        .catch((err) => reportWriteError("create category", err));
    },
    updateCategory: (id, patch) => {
      dispatch({ type: "CATEGORY_UPDATE", id, patch });
      void updateCrmCategory(id, patch).catch((err) => reportWriteError("update category", err));
    },
    archiveCategory: (id) => {
      dispatch({ type: "CATEGORY_ARCHIVE", id });
      void updateCrmCategory(id, { status: "archived" }).catch((err) => reportWriteError("archive category", err));
    },
    createService: (input) => {
      const service: CatalogService = {
        id: nextCatalogId("svc"),
        categoryId: input.categoryId,
        crmCategoryId: input.crmCategoryId,
        name: input.name,
        defaultDurationMinutes: input.defaultDurationMinutes,
        defaultPriceCents: input.defaultPriceCents,
        defaultMaterialCostCents: input.defaultMaterialCostCents ?? 0,
        accentColor: input.accentColor ?? defaultServiceColor(input.crmCategoryId),
        sortOrder: state.services.length,
        status: "active",
        defaultStages: generateDefaultStages(input.crmCategoryId, input.defaultDurationMinutes, nextCatalogId, stageLabels),
        linkedServiceIds: [],
        allowClientTimingOverrides: true,
        canOverlapDuringProcessing: true,
      };
      dispatch({ type: "SERVICE_CREATE", service });
      void ensurePersistedCategory(service.categoryId)
        .then(() => createCrmService(service))
        .catch((err) => reportWriteError("create service", err));
    },
    updateService: (id, patch) => {
      dispatch({ type: "SERVICE_UPDATE", id, patch });
      void updateCrmService(id, patch).catch((err) => reportWriteError("update service", err));
    },
    archiveService: (id) => {
      dispatch({ type: "SERVICE_ARCHIVE", id });
      void updateCrmService(id, { status: "archived" }).catch((err) => reportWriteError("archive service", err));
    },
    createResource: (input) => {
      const id = nextCatalogId("res");
      dispatch({ type: "RESOURCE_CREATE", id, resource: input });
      void createCrmResource({ id, ...input }).catch((err) => reportWriteError("create resource", err));
    },
    updateResource: (id, patch) => {
      dispatch({ type: "RESOURCE_UPDATE", id, patch });
      void updateCrmResource(id, patch).catch((err) => reportWriteError("update resource", err));
    },
    archiveResource: (id) => {
      dispatch({ type: "RESOURCE_ARCHIVE", id });
      void updateCrmResource(id, { status: "archived" }).catch((err) => reportWriteError("archive resource", err));
    },
    saveTimingOverride: (override) => dispatch({ type: "TIMING_SAVE", override }),
    deleteTimingOverride: (customerId, serviceId) => dispatch({ type: "TIMING_DELETE", customerId, serviceId }),
    newStageId: () => nextCatalogId("stage"),
  }), [state, stageLabels, loading, loadError, writeError, isLive, reload, clearWriteError, reportWriteError]);

  return <ScheduleCatalogContext.Provider value={api}>{children}</ScheduleCatalogContext.Provider>;
};

export function useScheduleCatalog(): ScheduleCatalogApi {
  const ctx = useContext(ScheduleCatalogContext);
  if (!ctx) throw new Error("useScheduleCatalog must be used within ScheduleCatalogProvider");
  return ctx;
}

export const CatalogStatusValues: CatalogStatus[] = ["active", "archived"];
