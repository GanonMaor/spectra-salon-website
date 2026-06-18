import { USAGE_IMPORT_ACCESS_CODE } from "./usageImportClient";
import type {
  CreateUsageIntelligenceReportResponse,
  UsageIntelligencePreviewResponse,
  UsageReportListItem,
  UsageReportSnapshot,
} from "./types/customerUsageIntelligence";

const FN_BASE = "/.netlify/functions/customer-usage-intelligence";
const DEV_FALLBACKS = (import.meta as any).env?.DEV
  ? ["http://localhost:8888/.netlify/functions/customer-usage-intelligence"]
  : [];

function endpoints(suffix: string) {
  return [FN_BASE + suffix, ...DEV_FALLBACKS.map((base) => base + suffix)];
}

async function call<T>(suffix: string, init: RequestInit): Promise<T> {
  let lastError: Error | null = null;
  for (const url of endpoints(suffix)) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "X-Access-Code": USAGE_IMPORT_ACCESS_CODE,
          ...(init.headers || {}),
        },
      });
      const text = await res.text();
      const payload = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error(payload?.error || payload?.details || `HTTP ${res.status}`);
      return payload as T;
    } catch (err: any) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }
  throw lastError || new Error("Network error");
}

export async function previewUsageIntelligence(args: {
  file: File;
  organizationId?: string;
  customerAccountId?: string;
  salonId?: string;
}): Promise<UsageIntelligencePreviewResponse> {
  return call<UsageIntelligencePreviewResponse>("/preview", {
    method: "POST",
    body: JSON.stringify({
      file: await fileToBase64(args.file),
      filename: args.file.name,
      organizationId: args.organizationId,
      customerAccountId: args.customerAccountId,
      salonId: args.salonId,
    }),
  });
}

export async function createUsageIntelligenceReport(args: {
  file: File;
  organizationId?: string;
  customerAccountId?: string;
  salonId?: string;
  reportTitle?: string;
}): Promise<CreateUsageIntelligenceReportResponse> {
  return call<CreateUsageIntelligenceReportResponse>("/reports", {
    method: "POST",
    body: JSON.stringify({
      file: await fileToBase64(args.file),
      filename: args.file.name,
      organizationId: args.organizationId,
      customerAccountId: args.customerAccountId,
      salonId: args.salonId,
      reportTitle: args.reportTitle,
      createdBy: "admin",
    }),
  });
}

export async function listUsageIntelligenceReports(): Promise<UsageReportListItem[]> {
  const res = await call<{ reports: UsageReportListItem[] }>("/reports", { method: "GET" });
  return res.reports;
}

export async function getUsageIntelligenceReport(reportId: string): Promise<UsageReportSnapshot> {
  const res = await call<{ report: UsageReportSnapshot }>(`/reports/${encodeURIComponent(reportId)}`, { method: "GET" });
  return res.report;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error("File read error"));
    reader.readAsDataURL(file);
  });
}
