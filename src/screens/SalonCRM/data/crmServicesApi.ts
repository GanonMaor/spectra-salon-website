import { salonAuthHeaders } from "./salonSession";
import type { ServiceCategoryId } from "./crmTypes";
import type { CatalogCategory, CatalogService, ServiceDepartment } from "../schedule/catalogTypes";

const FUNCTION_BASE = "/.netlify/functions/crm-services";

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
    const payload = (await res.json().catch(() => null)) as { error?: unknown } | null;
    const detail = typeof payload?.error === "string" ? payload.error : JSON.stringify(payload?.error ?? res.statusText);
    throw new Error(`crm-services ${res.status}: ${detail}`);
  }
  return (await res.json()) as T;
}

export function listCrmServicesCatalog() {
  return request<CrmServicesCatalog>("");
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
