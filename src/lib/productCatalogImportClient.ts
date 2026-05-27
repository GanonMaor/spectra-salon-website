import type {
  CatalogDbSnapshotMeta,
  CatalogDbSnapshotResponse,
  CatalogDbSnapshotSaveResponse,
  CatalogEnrichRequest,
  CatalogEnrichResponse,
  CatalogExportRequest,
  CatalogExportResponse,
  CatalogImportOptions,
  CatalogPreviewResponse,
  CatalogUploadFile,
} from "./types/productCatalogImport";

// Re-use the same access code mechanism as the usage-import surface
// so admins only need one code.
export const CATALOG_IMPORT_ACCESS_CODE =
  ((import.meta as any).env?.VITE_USAGE_IMPORT_ACCESS_CODE as string) ||
  "070315";

const FN_BASE = "/.netlify/functions/product-catalog-import";
const DEV_FALLBACKS = (import.meta as any).env?.DEV
  ? ["http://localhost:8888/.netlify/functions/product-catalog-import"]
  : [];

function buildEndpoints(suffix: string): string[] {
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
          "X-Access-Code": CATALOG_IMPORT_ACCESS_CODE,
          ...(init.headers || {}),
        },
      });
      if (res.status === 503) {
        lastError = new Error("Catalog import service unavailable");
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
        throw new Error(
          payload?.error || `HTTP ${res.status}: ${suffix}`,
        );
      }
      return payload as T;
    } catch (e: any) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError || new Error("Network error");
}

export async function previewCatalogImport(args: {
  files: File[];
  dbExport?: File | null;
  options?: CatalogImportOptions;
}): Promise<CatalogPreviewResponse> {
  const uploads: CatalogUploadFile[] = await Promise.all(
    args.files.map(async (f) => ({
      name: f.name,
      size: f.size,
      content: await fileToBase64(f),
      role: "catalog",
    })),
  );
  if (args.dbExport) {
    uploads.push({
      name: args.dbExport.name,
      size: args.dbExport.size,
      content: await fileToBase64(args.dbExport),
      role: "db-export",
    });
  }
  return call<CatalogPreviewResponse>("/preview", {
    method: "POST",
    body: JSON.stringify({
      files: uploads,
      options: args.options || {},
    }),
  });
}

export async function enrichCatalogRows(
  args: CatalogEnrichRequest,
): Promise<CatalogEnrichResponse> {
  return call<CatalogEnrichResponse>("/enrich", {
    method: "POST",
    body: JSON.stringify(args),
  });
}

export async function exportCatalogWorkbook(
  args: CatalogExportRequest,
): Promise<CatalogExportResponse> {
  return call<CatalogExportResponse>("/export", {
    method: "POST",
    body: JSON.stringify(args),
  });
}

/** Persist the latest DB export so future preview calls can reuse it. */
export async function saveCatalogDbSnapshot(
  file: File,
): Promise<CatalogDbSnapshotSaveResponse> {
  const payload = {
    file: {
      name: file.name,
      size: file.size,
      content: await fileToBase64(file),
    },
  };
  return call<CatalogDbSnapshotSaveResponse>("/db-snapshot", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/** Read the metadata of the currently-stored DB snapshot. */
export async function getCatalogDbSnapshot(): Promise<CatalogDbSnapshotResponse> {
  return call<CatalogDbSnapshotResponse>("/db-snapshot", {
    method: "GET",
  });
}

/** Drop the persisted DB snapshot. */
export async function clearCatalogDbSnapshot(): Promise<{ cleared: boolean }> {
  return call<{ cleared: boolean }>("/db-snapshot", {
    method: "DELETE",
  });
}

export type { CatalogDbSnapshotMeta };

export function fileToBase64(file: File): Promise<string> {
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

export function downloadBase64File(
  base64: string,
  filename: string,
  mime = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
): void {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
