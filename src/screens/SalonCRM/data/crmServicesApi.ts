import {
  canCallSalonRuntimeApi,
  getSalonScopeKey,
  handleSalonAuthFailure,
  registerSalonCacheCleaner,
  salonAuthHeaders,
} from "./salonSession";
import type { ServiceCategoryId } from "./crmTypes";
import type { CatalogCategory, CatalogService, SalonResource, ServiceDepartment } from "../schedule/catalogTypes";

const FUNCTION_BASE = "/.netlify/functions/crm-services";
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;
const serviceCatalogCache = new Map<string, { fetchedAt: number; value?: CrmServicesCatalog; pending?: Promise<CrmServicesCatalog> }>();

// Drop every scoped catalog entry on logout / auth failure so a new session
// can never read the previous tenant's cached catalog from this module.
registerSalonCacheCleaner(() => serviceCatalogCache.clear());

export interface CrmServicesCatalog {
  departments: ServiceDepartment[];
  categories: CatalogCategory[];
  services: CatalogService[];
  resources?: SalonResource[];
}

/** Explicit action to unblock archiving an entity with active dependents. */
export interface ArchiveActions {
  cascade?: boolean;
  reassignDepartmentId?: string;
  reassignCategoryId?: string;
  reassignResourceId?: string;
  force?: boolean;
}

interface ServiceInput {
  id?: string;
  categoryId?: string;
  crmCategoryId?: ServiceCategoryId;
  name?: string;
  defaultDurationMinutes?: number;
  defaultPriceCents?: number;
  defaultMaterialCostCents?: number;
  accentColor?: string;
  sortOrder?: number;
  status?: "active" | "inactive" | "archived";
  defaultStages?: CatalogService["defaultStages"];
  linkedServiceIds?: string[];
  resourceRequirements?: CatalogService["resourceRequirements"];
  allowClientTimingOverrides?: boolean;
  canOverlapDuringProcessing?: boolean;
}

interface ResourceInput {
  id?: string;
  departmentId?: string | null;
  type?: SalonResource["type"];
  name?: string;
  capacity?: number;
  isExclusive?: boolean;
  holdingSegmentTypes?: SalonResource["holdingSegmentTypes"];
  sortOrder?: number;
  status?: "active" | "inactive" | "archived";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!canCallSalonRuntimeApi()) {
    throw new Error("Salon session is required before calling crm-services.");
  }
  if (init?.method && init.method !== "GET") {
    serviceCatalogCache.delete(getSalonScopeKey());
  }

  const res = await fetch(`${FUNCTION_BASE}${path}`, {
    ...init,
    headers: salonAuthHeaders(init?.body ? { "Content-Type": "application/json" } : undefined),
  });
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(text.trim().startsWith("<")
      ? "Netlify Functions are not available on this local URL. Open the app through Netlify Dev."
      : `crm-services returned non-JSON response: ${res.status} ${res.statusText}`);
  }
  if (!res.ok) {
    handleSalonAuthFailure(res.status);
    const payload = (await res.json().catch(() => null)) as { error?: unknown } | null;
    const detail = typeof payload?.error === "string" ? payload.error : JSON.stringify(payload?.error ?? res.statusText);
    throw new Error(`crm-services ${res.status}: ${detail}`);
  }
  return (await res.json()) as T;
}

export function listCrmServicesCatalog() {
  // Capture the scope at request start. The cache is keyed by scope and writes
  // are guarded so a response fetched under one salon/user can never land in
  // the cache after the session has switched to another.
  const cacheKey = getSalonScopeKey();
  const cached = serviceCatalogCache.get(cacheKey);
  if (cached?.value && Date.now() - cached.fetchedAt < CATALOG_CACHE_TTL_MS) {
    return Promise.resolve(cached.value);
  }
  if (cached?.pending) return cached.pending;

  const pending = request<CrmServicesCatalog>("")
    .then((value) => {
      // Only cache when the active scope still matches the one we started with.
      if (getSalonScopeKey() === cacheKey) {
        serviceCatalogCache.set(cacheKey, { value, fetchedAt: Date.now() });
      } else {
        serviceCatalogCache.delete(cacheKey);
      }
      return value;
    })
    .catch((error) => {
      serviceCatalogCache.delete(cacheKey);
      throw error;
    });
  serviceCatalogCache.set(cacheKey, { fetchedAt: cached?.fetchedAt ?? 0, value: cached?.value, pending });
  return pending;
}

export function invalidateCrmServicesCatalog(): void {
  serviceCatalogCache.delete(getSalonScopeKey());
}

export function createCrmDepartment(input: Partial<ServiceDepartment> & { name: string }) {
  return request<{ department: ServiceDepartment }>("/departments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCrmDepartment(id: string, patch: Partial<ServiceDepartment> & ArchiveActions) {
  return request<{ department: ServiceDepartment }>(`/departments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function createCrmCategory(input: Partial<CatalogCategory> & {
  departmentId: string;
  crmCategoryId: ServiceCategoryId;
  name: string;
  accentColor: string;
}) {
  return request<{ category: CatalogCategory }>("/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCrmCategory(id: string, patch: Partial<CatalogCategory> & ArchiveActions) {
  return request<{ category: CatalogCategory }>(`/categories/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function createCrmService(input: ServiceInput & { id: string; categoryId: string; name: string }) {
  return request<{ service: CatalogService }>("/services", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCrmService(id: string, patch: ServiceInput) {
  return request<{ service: CatalogService }>(`/services/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export function createCrmResource(input: ResourceInput & { name: string }) {
  return request<{ resource: SalonResource }>("/resources", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateCrmResource(id: string, patch: ResourceInput & ArchiveActions) {
  return request<{ resource: SalonResource }>(`/resources/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
