import type {
  ImportCommitResponse,
  ImportListResponse,
  ImportPreviewResponse,
  ImportRecord,
  SnapshotResponse,
} from "./types/usageImport";

// Matches netlify/functions/usage-import.js ACCESS_CODE default.
// In production this should be supplied via env / Vite secret.
export const USAGE_IMPORT_ACCESS_CODE =
  ((import.meta as any).env?.VITE_USAGE_IMPORT_ACCESS_CODE as string) ||
  "070315";

const FN_BASE = "/.netlify/functions/usage-import";
const DEV_FALLBACKS = (import.meta as any).env?.DEV
  ? ["http://localhost:8888/.netlify/functions/usage-import"]
  : [];

function buildEndpoints(suffix: string) {
  return [FN_BASE + suffix, ...DEV_FALLBACKS.map((p) => p + suffix)];
}

async function call<T>(
  suffix: string,
  init: RequestInit & { ignore404?: boolean } = {},
): Promise<T> {
  const endpoints = buildEndpoints(suffix);
  let lastError: Error | null = null;
  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "X-Access-Code": USAGE_IMPORT_ACCESS_CODE,
          ...(init.headers || {}),
        },
      });
      if (res.status === 503) {
        lastError = new Error("Database not configured");
        continue;
      }
      const text = await res.text();
      let payload: any = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = { error: text };
      }
      if (!res.ok) {
        throw new Error(payload?.error || `HTTP ${res.status}`);
      }
      return payload as T;
    } catch (e: any) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError || new Error("Network error");
}

export async function previewUsageImport(args: {
  file: File;
  month?: string;
  year?: number;
  multiMonth?: boolean;
}): Promise<ImportPreviewResponse> {
  const base64 = await fileToBase64(args.file);
  return call<ImportPreviewResponse>("/preview", {
    method: "POST",
    body: JSON.stringify({
      file: base64,
      month: args.month,
      year: args.year,
      multiMonth: args.multiMonth,
    }),
  });
}

export async function commitUsageImport(args: {
  file: File;
  month: string;
  year: number;
  multiMonth?: boolean;
  force?: boolean;
  createdBy?: string;
  notes?: string;
}): Promise<ImportCommitResponse> {
  const base64 = await fileToBase64(args.file);
  return call<ImportCommitResponse>("/imports", {
    method: "POST",
    body: JSON.stringify({
      file: base64,
      filename: args.file.name,
      month: args.month,
      year: args.year,
      multiMonth: args.multiMonth,
      force: args.force,
      created_by: args.createdBy,
      notes: args.notes,
    }),
  });
}

export async function listUsageImports(): Promise<ImportRecord[]> {
  const res = await call<ImportListResponse>("/imports", { method: "GET" });
  return res.imports;
}

export async function deleteUsageImport(id: number): Promise<void> {
  await call<{ deleted: number }>(`/imports/${id}`, { method: "DELETE" });
}

export async function fetchSnapshot(opts: {
  includePhone?: boolean;
} = {}): Promise<SnapshotResponse> {
  const suffix = opts.includePhone ? "/snapshot?include=phone" : "/snapshot";
  return call<SnapshotResponse>(suffix, { method: "GET" });
}

export async function rebuildSnapshot(): Promise<{ snapshot: SnapshotResponse }> {
  return call<{ snapshot: SnapshotResponse }>("/rebuild", { method: "POST" });
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
      // strip data URL prefix
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error("File read error"));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
