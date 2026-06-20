/**
 * Schedule catalog provider.
 *
 * Holds the in-memory, editable service catalog used by the booking flow and
 * the schedule settings tab: departments, categories, services, default
 * stages, linked services, resources, and client-specific timing overrides.
 *
 * It seeds once from the real CRM service catalog (`useServices`,
 * `useServiceCategories`) so the initial experience matches production data,
 * then keeps edits locally. Appointments are still created through the real
 * CRM actions, so this provider never mutates the shared normalized state.
 */

import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import type { Service, ServiceCategory, ServiceCategoryId } from "../data/crmTypes";
import { useServices, useServiceCategories } from "../data/crmHooks";
import type {
  CatalogCategory,
  CatalogService,
  CatalogStatus,
  ClientServiceTimingOverride,
  SalonResource,
  ScheduleCatalogState,
  ServiceDepartment,
  ServiceStageDefinition,
} from "./catalogTypes";
import { generateDefaultStages } from "./serviceCatalogUtils";

let catalogCounter = 0;
function nextCatalogId(prefix: string): string {
  catalogCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${catalogCounter}`;
}

const HAIR_DEPT_ID = "dept-hair";

const SEED_DEPARTMENTS: ServiceDepartment[] = [
  { id: HAIR_DEPT_ID,    name: "Hair",       description: "Cut, color, styling, and treatments", sortOrder: 0, status: "active" },
  { id: "dept-cosmetics", name: "Cosmetics", description: "Makeup, brows, lashes, and skincare", sortOrder: 1, status: "active" },
  { id: "dept-spa",       name: "Spa",       description: "Massage, body treatments, and nails", sortOrder: 2, status: "active" },
];

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

const CATEGORY_COVER: Partial<Record<ServiceCategoryId, string>> = {
  color:         "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=200&fit=crop",
  highlights:    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop",
  toner:         "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=300&h=200&fit=crop",
  straightening: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=300&h=200&fit=crop",
  treatment:     "https://images.unsplash.com/photo-1562322140-8baeacacf3df?w=300&h=200&fit=crop",
  cut:           "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=300&h=200&fit=crop",
  other:         "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=300&h=200&fit=crop",
};

const INITIAL_STATE: ScheduleCatalogState = {
  departments: SEED_DEPARTMENTS,
  categories: [],
  services: [],
  resources: SEED_RESOURCES,
  timingOverrides: [],
};

/**
 * Build catalog categories/services from the real CRM catalog. The CRM
 * provider exposes an empty/placeholder catalog before hydration, so callers
 * must only invoke this once real data is present. Undefined entries are
 * filtered defensively (the CRM empty state pre-seeds category keys).
 */
function buildCatalogFromCrm(
  crmCategories: ServiceCategory[],
  crmServices: Service[],
): { categories: CatalogCategory[]; services: CatalogService[] } {
  const cats = crmCategories.filter(Boolean);
  const svcs = crmServices.filter(Boolean);

  const categories: CatalogCategory[] = cats.map((c, i) => ({
    id: `cat-${c.id}`,
    departmentId: HAIR_DEPT_ID,
    crmCategoryId: c.id,
    name: c.name,
    accentColor: c.accentColor,
    coverImageUrl: CATEGORY_COVER[c.id],
    sortOrder: i,
    status: "active",
  }));

  const services: CatalogService[] = svcs.map((s, i) => ({
    id: s.id,
    categoryId: `cat-${s.categoryId}`,
    crmCategoryId: s.categoryId,
    name: s.name,
    defaultDurationMinutes: s.defaultDurationMinutes,
    defaultPriceCents: s.defaultPriceCents,
    defaultMaterialCostCents: s.defaultMaterialCostCents,
    sortOrder: i,
    status: "active",
    defaultStages: generateDefaultStages(s.categoryId, s.defaultDurationMinutes, nextCatalogId),
    linkedServiceIds: [],
    allowClientTimingOverrides: true,
    canOverlapDuringProcessing: true,
  }));

  // Seed a few sensible linked-service relationships within Hair.
  const byCat = (cat: ServiceCategoryId) => services.filter((s) => s.crmCategoryId === cat).map((s) => s.id);
  const linkedForColorWork = [...byCat("toner"), ...byCat("treatment"), ...byCat("cut")];
  for (const svc of services) {
    if (svc.crmCategoryId === "highlights" || svc.crmCategoryId === "color") {
      svc.linkedServiceIds = linkedForColorWork.filter((id) => id !== svc.id);
    }
  }

  return { categories, services };
}

// ── Actions ────────────────────────────────────────────────────────

type CatalogAction =
  | { type: "SEED_CATALOG"; categories: CatalogCategory[]; services: CatalogService[] }
  | { type: "DEPT_CREATE"; name: string; description?: string }
  | { type: "DEPT_UPDATE"; id: string; patch: Partial<ServiceDepartment> }
  | { type: "DEPT_ARCHIVE"; id: string }
  | { type: "CATEGORY_CREATE"; departmentId: string; name: string; accentColor: string; crmCategoryId: ServiceCategoryId }
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
      return { ...state, categories: action.categories, services: action.services };

    case "DEPT_CREATE":
      return {
        ...state,
        departments: [
          ...state.departments,
          { id: nextCatalogId("dept"), name: action.name, description: action.description, sortOrder: state.departments.length, status: "active" },
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
            id: nextCatalogId("cat"),
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
  createDepartment: (name: string, description?: string) => void;
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
  const crmCategories = useServiceCategories();
  const crmServices = useServices();

  const [state, dispatch] = useReducer(catalogReducer, INITIAL_STATE);

  // Seed once from real CRM data. The CRM provider hydrates asynchronously
  // and exposes an empty/placeholder catalog on the first render, so we wait
  // until real categories and services are present before seeding. After the
  // initial seed, local catalog edits are preserved (CRM no longer overwrites).
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    const cats = crmCategories.filter(Boolean);
    const svcs = crmServices.filter(Boolean);
    if (cats.length === 0 || svcs.length === 0) return;
    const { categories, services } = buildCatalogFromCrm(cats, svcs);
    dispatch({ type: "SEED_CATALOG", categories, services });
    seededRef.current = true;
  }, [crmCategories, crmServices]);

  const api = useMemo<ScheduleCatalogApi>(() => ({
    state,
    createDepartment: (name, description) => dispatch({ type: "DEPT_CREATE", name, description }),
    updateDepartment: (id, patch) => dispatch({ type: "DEPT_UPDATE", id, patch }),
    archiveDepartment: (id) => dispatch({ type: "DEPT_ARCHIVE", id }),
    createCategory: (input) => dispatch({ type: "CATEGORY_CREATE", ...input }),
    updateCategory: (id, patch) => dispatch({ type: "CATEGORY_UPDATE", id, patch }),
    archiveCategory: (id) => dispatch({ type: "CATEGORY_ARCHIVE", id }),
    createService: (input) => {
      const service: CatalogService = {
        id: nextCatalogId("svc"),
        categoryId: input.categoryId,
        crmCategoryId: input.crmCategoryId,
        name: input.name,
        defaultDurationMinutes: input.defaultDurationMinutes,
        defaultPriceCents: input.defaultPriceCents,
        defaultMaterialCostCents: input.defaultMaterialCostCents ?? 0,
        sortOrder: state.services.length,
        status: "active",
        defaultStages: generateDefaultStages(input.crmCategoryId, input.defaultDurationMinutes, nextCatalogId),
        linkedServiceIds: [],
        allowClientTimingOverrides: true,
        canOverlapDuringProcessing: true,
      };
      dispatch({ type: "SERVICE_CREATE", service });
    },
    updateService: (id, patch) => dispatch({ type: "SERVICE_UPDATE", id, patch }),
    archiveService: (id) => dispatch({ type: "SERVICE_ARCHIVE", id }),
    createResource: (input) => dispatch({ type: "RESOURCE_CREATE", resource: input }),
    updateResource: (id, patch) => dispatch({ type: "RESOURCE_UPDATE", id, patch }),
    archiveResource: (id) => dispatch({ type: "RESOURCE_ARCHIVE", id }),
    saveTimingOverride: (override) => dispatch({ type: "TIMING_SAVE", override }),
    deleteTimingOverride: (customerId, serviceId) => dispatch({ type: "TIMING_DELETE", customerId, serviceId }),
    newStageId: () => nextCatalogId("stage"),
  }), [state]);

  return <ScheduleCatalogContext.Provider value={api}>{children}</ScheduleCatalogContext.Provider>;
};

export function useScheduleCatalog(): ScheduleCatalogApi {
  const ctx = useContext(ScheduleCatalogContext);
  if (!ctx) throw new Error("useScheduleCatalog must be used within ScheduleCatalogProvider");
  return ctx;
}

export const CatalogStatusValues: CatalogStatus[] = ["active", "archived"];
