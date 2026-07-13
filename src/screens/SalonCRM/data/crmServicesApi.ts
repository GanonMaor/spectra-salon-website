import { canCallSalonRuntimeApi, getSalonScopeKey, handleSalonAuthFailure, salonAuthHeaders } from "./salonSession";
import type { ServiceCategoryId } from "./crmTypes";
import type { CatalogCategory, CatalogService, ServiceDepartment } from "../schedule/catalogTypes";

const FUNCTION_BASE = "/.netlify/functions/crm-services";
const CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;
const serviceCatalogCache = new Map<string, { fetchedAt: number; value?: CrmServicesCatalog; pending?: Promise<CrmServicesCatalog> }>();

export interface CrmServicesCatalog {
  departments: ServiceDepartment[];
  categories: CatalogCategory[];
  services: CatalogService[];
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
  status?: "active" | "archived";
  defaultStages?: CatalogService["defaultStages"];
  linkedServiceIds?: string[];
  allowClientTimingOverrides?: boolean;
  canOverlapDuringProcessing?: boolean;
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
  const cacheKey = getSalonScopeKey();
  const cached = serviceCatalogCache.get(cacheKey);
  if (cached?.value && Date.now() - cached.fetchedAt < CATALOG_CACHE_TTL_MS) {
    return Promise.resolve(cached.value);
  }
  if (cached?.pending) return cached.pending;

  const pending = request<CrmServicesCatalog>("")
    .then((value) => {
      serviceCatalogCache.set(cacheKey, { value, fetchedAt: Date.now() });
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

export function updateCrmDepartment(id: string, patch: Partial<ServiceDepartment>) {
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

export function updateCrmCategory(id: string, patch: Partial<CatalogCategory>) {
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
