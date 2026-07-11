/**
 * Schedule catalog provider.
 *
 * Holds the in-memory, editable service catalog used by the booking flow and
 * the schedule settings tab: departments, categories, services, default
 * stages, linked services, resources, and client-specific timing overrides.
 *
 * It seeds once from the tenant-scoped services API so departments,
 * categories, and services reflect the live DB exactly. Appointments are still
 * created through the real CRM actions, so this provider never mutates the
 * shared normalized state.
 */

import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { ServiceCategoryId } from "../data/crmTypes";
import { useCrmT } from "../i18n/CrmLocale";
import {
  createCrmCategory,
  createCrmDepartment,
  createCrmService,
  listCrmServicesCatalog,
  updateCrmCategory,
  updateCrmDepartment,
  updateCrmService,
} from "../data/crmServicesApi";
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
  return {
    ...INITIAL_STATE,
    departments: [],
  };
}

// ── Actions ────────────────────────────────────────────────────────

type CatalogAction =
  | { type: "SEED_CATALOG"; categories: CatalogCategory[]; services: CatalogService[]; departments?: ServiceDepartment[] }
  | { type: "DEPT_CREATE"; id?: string; name: string; description?: string; calendarColor?: string }
  | { type: "DEPT_UPDATE"; id: string; patch: Partial<ServiceDepartment> }
  | { type: "DEPT_ARCHIVE"; id: string }
  | { type: "CATEGORY_CREATE"; id?: string; departmentId: string; name: string; accentColor: string; crmCategoryId: ServiceCategoryId }
  | { type: "CATEGORY_UPDATE"; id: string; patch: Partial<CatalogCategory> }
  | { type: "CATEGORY_ARCHIVE"; id: string }
  | { type: "SERVICE_CREATE"; service: CatalogService }
  | { type: "SERVICE_UPDATE"; id: string; patch: Partial<CatalogService> }
  | { type: "SERVICE_ARCHIVE"; id: string }
  | { type: "RESOURCE_CREATE"; resource: Omit<SalonResource, "id" | "sortOrder"> }
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
        departments: action.departments != null ? action.departments : state.departments,
        categories: action.categories,
        services: action.services,
      };

    case "DEPT_CREATE":
      return {
        ...state,
        departments: [
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
        ],
      };
    case "DEPT_UPDATE":
      return { ...state, departments: state.departments.map((d) => (d.id === action.id ? { ...d, ...action.patch } : d)) };
    case "DEPT_ARCHIVE":
      return { ...state, departments: state.departments.map((d) => (d.id === action.id ? { ...d, status: "archived" } : d)) };

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
        resources: [...state.resources, { ...action.resource, id: nextCatalogId("res"), sortOrder: state.resources.length }],
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

export interface ScheduleCatalogApi {
  state: ScheduleCatalogState;
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

  // Prefer the tenant-scoped services API as the source of truth. Always
  // dispatch SEED_CATALOG when the API responds — even if the catalog is empty
  // — so the live DB (not hardcoded seed data) is the authoritative source.
  // An empty DB correctly produces an empty-state UI for a new salon.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (!canCallSalonRuntimeApi()) return;
    let cancelled = false;
    listCrmServicesCatalog()
      .then((catalog) => {
        if (cancelled || seededRef.current) return;
        persistedDepartmentIdsRef.current = new Set(catalog.departments.map((department) => department.id));
        persistedCategoryIdsRef.current = new Set(catalog.categories.map((category) => category.id));
        dispatch({
          type: "SEED_CATALOG",
          departments: catalog.departments,
          categories: catalog.categories,
          services: catalog.services,
        });
        seededRef.current = true;
      })
      .catch((err) => {
        console.warn("[ScheduleCatalogProvider] tenant services API unavailable", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const api = useMemo<ScheduleCatalogApi>(() => ({
    state,
    createDepartment: (name, description, calendarColor) => {
      const id = nextCatalogId("dept");
      dispatch({ type: "DEPT_CREATE", id, name, description, calendarColor });
      void createCrmDepartment({ id, name, calendarLabel: name, calendarColor, bookingMode: "singleBlock", isCalendarEnabled: true, sortOrder: state.departments.length })
        .then(() => {
          persistedDepartmentIdsRef.current.add(id);
        })
        .catch((err) => console.warn("[ScheduleCatalogProvider] createDepartment failed", err));
    },
    updateDepartment: (id, patch) => {
      dispatch({ type: "DEPT_UPDATE", id, patch });
      void updateCrmDepartment(id, patch).catch((err) => console.warn("[ScheduleCatalogProvider] updateDepartment failed", err));
    },
    archiveDepartment: (id) => {
      dispatch({ type: "DEPT_ARCHIVE", id });
      void updateCrmDepartment(id, { status: "archived" }).catch((err) => console.warn("[ScheduleCatalogProvider] archiveDepartment failed", err));
    },
    createCategory: (input) => {
      const id = nextCatalogId("cat");
      dispatch({ type: "CATEGORY_CREATE", id, ...input });
      void ensurePersistedDepartment(input.departmentId)
        .then(() => createCrmCategory({ id, ...input, sortOrder: state.categories.length, status: "active" }))
        .then(() => {
          persistedCategoryIdsRef.current.add(id);
        })
        .catch((err) => console.warn("[ScheduleCatalogProvider] createCategory failed", err));
    },
    updateCategory: (id, patch) => {
      dispatch({ type: "CATEGORY_UPDATE", id, patch });
      void updateCrmCategory(id, patch).catch((err) => console.warn("[ScheduleCatalogProvider] updateCategory failed", err));
    },
    archiveCategory: (id) => {
      dispatch({ type: "CATEGORY_ARCHIVE", id });
      void updateCrmCategory(id, { status: "archived" }).catch((err) => console.warn("[ScheduleCatalogProvider] archiveCategory failed", err));
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
        .catch((err) => console.warn("[ScheduleCatalogProvider] createService failed", err));
    },
    updateService: (id, patch) => {
      dispatch({ type: "SERVICE_UPDATE", id, patch });
      void updateCrmService(id, patch).catch((err) => console.warn("[ScheduleCatalogProvider] updateService failed", err));
    },
    archiveService: (id) => {
      dispatch({ type: "SERVICE_ARCHIVE", id });
      void updateCrmService(id, { status: "archived" }).catch((err) => console.warn("[ScheduleCatalogProvider] archiveService failed", err));
    },
    createResource: (input) => dispatch({ type: "RESOURCE_CREATE", resource: input }),
    updateResource: (id, patch) => dispatch({ type: "RESOURCE_UPDATE", id, patch }),
    archiveResource: (id) => dispatch({ type: "RESOURCE_ARCHIVE", id }),
    saveTimingOverride: (override) => dispatch({ type: "TIMING_SAVE", override }),
    deleteTimingOverride: (customerId, serviceId) => dispatch({ type: "TIMING_DELETE", customerId, serviceId }),
    newStageId: () => nextCatalogId("stage"),
  }), [state, stageLabels]);

  return <ScheduleCatalogContext.Provider value={api}>{children}</ScheduleCatalogContext.Provider>;
};

export function useScheduleCatalog(): ScheduleCatalogApi {
  const ctx = useContext(ScheduleCatalogContext);
  if (!ctx) throw new Error("useScheduleCatalog must be used within ScheduleCatalogProvider");
  return ctx;
}

export const CatalogStatusValues: CatalogStatus[] = ["active", "archived"];
