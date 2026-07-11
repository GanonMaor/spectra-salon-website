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
  ServiceStageDefinition,
} from "./catalogTypes";
import { generateDefaultStages, buildStageLabelSet, type StageLabelSet } from "./serviceCatalogUtils";
import { defaultServiceColor } from "./scheduleDesign";

let catalogCounter = 0;
function nextCatalogId(prefix: string): string {
  catalogCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${catalogCounter}`;
}

const HAIR_DEPT_ID = "dept-hair";
const COSMETICS_DEPT_ID = "dept-cosmetics";
const SPA_DEPT_ID = "dept-spa";

const SEED_DEPARTMENTS: ServiceDepartment[] = [
  { id: HAIR_DEPT_ID, name: "Hair Studio", calendarLabel: "יומן שיער", calendarTone: "hair", calendarColor: "#D7897F", bookingMode: "process", isCalendarEnabled: true, description: "Cut, color, styling, and treatments", sortOrder: 0, status: "active" },
  { id: COSMETICS_DEPT_ID, name: "Beauty Clinic", calendarLabel: "יומן קוסמטיקה", calendarTone: "cosmetics", calendarColor: "#F9B95C", bookingMode: "singleBlock", isCalendarEnabled: true, description: "Makeup, brows, lashes, and skincare", sortOrder: 1, status: "active" },
  { id: SPA_DEPT_ID, name: "Spa", calendarLabel: "יומן ספא", calendarTone: "spa", calendarColor: "#B8C6D9", bookingMode: "singleBlock", isCalendarEnabled: false, description: "Massage, body treatments, and nails", sortOrder: 2, status: "archived" },
];

function singleStageService(id: string, label: string, durationMinutes: number): ServiceStageDefinition[] {
  return [{
    id: `${id}-stage`,
    label,
    segmentType: "service",
    durationMinutes,
    isActiveStaffTime: true,
    sortOrder: 0,
  }];
}

const COSMETICS_CATEGORIES: CatalogCategory[] = [
  { id: "cat-cos-facial", departmentId: COSMETICS_DEPT_ID, crmCategoryId: "treatment", name: "Facials", accentColor: "#A9C8BE", sortOrder: 0, status: "active" },
  { id: "cat-cos-brows", departmentId: COSMETICS_DEPT_ID, crmCategoryId: "other", name: "Brows", accentColor: "#D8BFA6", sortOrder: 1, status: "active" },
  { id: "cat-cos-lashes", departmentId: COSMETICS_DEPT_ID, crmCategoryId: "other", name: "Lashes", accentColor: "#B8C6D9", sortOrder: 2, status: "active" },
  { id: "cat-cos-makeup", departmentId: COSMETICS_DEPT_ID, crmCategoryId: "other", name: "Makeup", accentColor: "#E6B7B0", sortOrder: 3, status: "active" },
];

const COSMETICS_SERVICES: CatalogService[] = [
  { id: "cos-facial-classic", categoryId: "cat-cos-facial", crmCategoryId: "treatment", name: "Classic Facial", defaultDurationMinutes: 60, defaultPriceCents: 28000, defaultMaterialCostCents: 3500, accentColor: "#A9C8BE", sortOrder: 0, status: "active", defaultStages: singleStageService("cos-facial-classic", "Classic Facial", 60), linkedServiceIds: [], allowClientTimingOverrides: false, canOverlapDuringProcessing: false },
  { id: "cos-facial-glow", categoryId: "cat-cos-facial", crmCategoryId: "treatment", name: "Glow Facial", defaultDurationMinutes: 45, defaultPriceCents: 22000, defaultMaterialCostCents: 2800, accentColor: "#A9C8BE", sortOrder: 1, status: "active", defaultStages: singleStageService("cos-facial-glow", "Glow Facial", 45), linkedServiceIds: [], allowClientTimingOverrides: false, canOverlapDuringProcessing: false },
  { id: "cos-brow-shape", categoryId: "cat-cos-brows", crmCategoryId: "other", name: "Brow Shaping", defaultDurationMinutes: 30, defaultPriceCents: 9000, defaultMaterialCostCents: 400, accentColor: "#D8BFA6", sortOrder: 2, status: "active", defaultStages: singleStageService("cos-brow-shape", "Brow Shaping", 30), linkedServiceIds: [], allowClientTimingOverrides: false, canOverlapDuringProcessing: false },
  { id: "cos-brow-tint", categoryId: "cat-cos-brows", crmCategoryId: "other", name: "Brow Tint", defaultDurationMinutes: 25, defaultPriceCents: 8000, defaultMaterialCostCents: 500, accentColor: "#D8BFA6", sortOrder: 3, status: "active", defaultStages: singleStageService("cos-brow-tint", "Brow Tint", 25), linkedServiceIds: [], allowClientTimingOverrides: false, canOverlapDuringProcessing: false },
  { id: "cos-lash-lift", categoryId: "cat-cos-lashes", crmCategoryId: "other", name: "Lash Lift", defaultDurationMinutes: 50, defaultPriceCents: 18000, defaultMaterialCostCents: 1800, accentColor: "#B8C6D9", sortOrder: 4, status: "active", defaultStages: singleStageService("cos-lash-lift", "Lash Lift", 50), linkedServiceIds: [], allowClientTimingOverrides: false, canOverlapDuringProcessing: false },
  { id: "cos-makeup-evening", categoryId: "cat-cos-makeup", crmCategoryId: "other", name: "Evening Makeup", defaultDurationMinutes: 60, defaultPriceCents: 26000, defaultMaterialCostCents: 2600, accentColor: "#E6B7B0", sortOrder: 5, status: "active", defaultStages: singleStageService("cos-makeup-evening", "Evening Makeup", 60), linkedServiceIds: [], allowClientTimingOverrides: false, canOverlapDuringProcessing: false },
];

const WASH_CATEGORIES: CatalogCategory[] = [
  { id: "cat-hair-wash", departmentId: HAIR_DEPT_ID, crmCategoryId: "treatment", name: "Wash & Treatments", accentColor: "#96C7B3", sortOrder: 90, status: "active" },
];

function washService(id: string, name: string, durationMinutes: number, priceCents: number, sortOrder: number, accentColor = "#96C7B3"): CatalogService {
  return {
    id,
    categoryId: "cat-hair-wash",
    crmCategoryId: "treatment",
    name,
    defaultDurationMinutes: durationMinutes,
    defaultPriceCents: priceCents,
    defaultMaterialCostCents: Math.round(priceCents * 0.18),
    accentColor,
    sortOrder,
    status: "active",
    defaultStages: [{
      id: `${id}-stage`,
      label: "Wash",
      segmentType: "wash",
      durationMinutes,
      isActiveStaffTime: true,
      requiredResourceType: "wash-station",
      sortOrder: 0,
    }],
    linkedServiceIds: [],
    allowClientTimingOverrides: true,
    canOverlapDuringProcessing: false,
  };
}

const WASH_SERVICES: CatalogService[] = [
  washService("wash-color", "Color Wash", 15, 5000, 90, "#D7897F"),
  washService("wash-highlights", "Highlights Wash", 20, 6000, 91, "#F9B95C"),
  washService("wash-scalp", "Scalp Ampoule Care", 25, 12000, 92, "#96C7B3"),
  washService("wash-repair-ampoule", "Repair Ampoule Wash", 25, 14000, 93, "#A9C8BE"),
  washService("wash-hydration-ampoule", "Hydration & Shine Ampoule", 20, 12000, 94, "#B8C6D9"),
  washService("wash-keratin-hyaluronic", "Keratin Hyaluronic Treatment", 30, 16000, 95, "#D8BFA6"),
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
  stageLabels: StageLabelSet,
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
    accentColor: defaultServiceColor(s.categoryId),
    sortOrder: i,
    status: "active",
    defaultStages: generateDefaultStages(s.categoryId, s.defaultDurationMinutes, nextCatalogId, stageLabels),
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

  return {
    categories: [...categories, ...WASH_CATEGORIES, ...COSMETICS_CATEGORIES],
    services: [...services, ...WASH_SERVICES, ...COSMETICS_SERVICES],
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
      return {
        ...state,
        departments: action.departments && action.departments.length > 0 ? action.departments : state.departments,
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
  const crmCategories = useServiceCategories();
  const crmServices = useServices();
  const t = useCrmT();
  const stageLabels = useMemo(() => buildStageLabelSet(t), [t]);

  const [state, dispatch] = useReducer(catalogReducer, INITIAL_STATE);

  // Prefer the tenant-scoped services API as the source of truth. If the
  // backend has not been populated yet, we fall back to the CRM snapshot below
  // so the current booking UI remains usable during the domain migration.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current) return;
    if (!canCallSalonRuntimeApi()) return;
    let cancelled = false;
    listCrmServicesCatalog()
      .then((catalog) => {
        if (cancelled || seededRef.current) return;
        if (catalog.departments.length > 0 || catalog.categories.length > 0 || catalog.services.length > 0) {
          dispatch({
            type: "SEED_CATALOG",
            departments: catalog.departments,
            categories: catalog.categories,
            services: catalog.services,
          });
          seededRef.current = true;
        }
      })
      .catch((err) => {
        console.warn("[ScheduleCatalogProvider] tenant services API unavailable; falling back to CRM snapshot", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fallback seed from CRM data. The CRM provider hydrates asynchronously and
  // exposes an empty/placeholder catalog on the first render, so we wait until
  // real categories and services are present before seeding.
  useEffect(() => {
    if (seededRef.current) return;
    const cats = crmCategories.filter(Boolean);
    const svcs = crmServices.filter(Boolean);
    if (cats.length === 0 || svcs.length === 0) return;
    const { categories, services } = buildCatalogFromCrm(cats, svcs, stageLabels);
    dispatch({ type: "SEED_CATALOG", categories, services });
    seededRef.current = true;
  }, [crmCategories, crmServices, stageLabels]);

  const api = useMemo<ScheduleCatalogApi>(() => ({
    state,
    createDepartment: (name, description, calendarColor) => {
      const id = nextCatalogId("dept");
      dispatch({ type: "DEPT_CREATE", id, name, description, calendarColor });
      void createCrmDepartment({ id, name, calendarLabel: name, calendarColor, bookingMode: "singleBlock", isCalendarEnabled: true, sortOrder: state.departments.length })
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
      void createCrmCategory({ id, ...input, sortOrder: state.categories.length, status: "active" })
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
      void createCrmService(service).catch((err) => console.warn("[ScheduleCatalogProvider] createService failed", err));
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
