import { canCallSalonRuntimeApi, handleSalonAuthFailure, salonAuthHeaders } from "./salonSession";
import type { Salon } from "./crmTypes";

const FUNCTION_BASE = "/.netlify/functions/crm-salons";

export interface UpdateSalonProfileInput {
  name?: string;
  businessName?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  timezone?: string;
  currency?: Salon["currency"];
  onboardingStatus?: Salon["onboardingStatus"];
  onboardingCurrentStep?: string | null;
}

async function request<T>(init?: RequestInit): Promise<T> {
  if (!canCallSalonRuntimeApi()) {
    throw new Error("Salon session is required before calling crm-salons.");
  }
  const res = await fetch(FUNCTION_BASE, {
    ...init,
    headers: salonAuthHeaders(init?.body ? { "Content-Type": "application/json" } : undefined),
  });
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(text.trim().startsWith("<")
      ? "Netlify Functions are not available on this local URL. Open the app through Netlify Dev."
      : `crm-salons returned non-JSON response: ${res.status} ${res.statusText}`);
  }
  if (!res.ok) {
    handleSalonAuthFailure(res.status);
    const payload = (await res.json().catch(() => null)) as { error?: unknown } | null;
    const detail = typeof payload?.error === "string" ? payload.error : JSON.stringify(payload?.error ?? res.statusText);
    throw new Error(`crm-salons ${res.status}: ${detail}`);
  }
  return (await res.json()) as T;
}

export function getSalonProfile() {
  return request<{ salon: Salon }>();
}

export function updateSalonProfile(input: UpdateSalonProfileInput) {
  return request<{ salon: Salon }>({
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
