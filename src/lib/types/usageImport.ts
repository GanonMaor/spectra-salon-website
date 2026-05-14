// ── Usage Import API – Types ──────────────────────────────────────
// Shared between the AdminDashboard import panel and the
// /usage-import Netlify function.

export type WarningSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface ImportWarning {
  code: string;
  severity: WarningSeverity;
  message: string;
  sheet?: string;
  column?: string;
  expectedMonth?: string;
  expectedYear?: number;
  internalMonths?: string[];
  internalYears?: number[];
  foundMonths?: string[];
}

export interface ImportSummary {
  rowCount: number;
  uniqueUsers: number;
  uniqueBrands: number;
  monthLabels: string[];
  countries: string[];
  cities: string[];
  totals: {
    visits: number;
    services: number;
    cost: number;
    grams: number;
  };
  rowsWithPhone: number;
  employeesMissing: number;
}

export interface SheetPreview {
  sheetName: string;
  headerRow: number;
  headerCount: number;
  dataRows: number;
  internalYears: number[];
  internalMonths: string[];
}

export interface ImportPreviewResponse {
  canCommit: boolean;
  fileHash: string;
  fileSizeBytes: number;
  parsedRowCount: number;
  dedupedRowCount: number;
  hint: {
    month: string | null;
    year: number | null;
    monthLabel: string | null;
  };
  summary: ImportSummary;
  warnings: ImportWarning[];
  sheets: SheetPreview[];
  duplicatesRemoved: number;
  primaryMonth: string | null;
}

export interface ImportCommitRequest {
  file: string; // base64 encoded
  filename: string;
  month?: string;
  year?: number;
  multiMonth?: boolean;
  force?: boolean;
  created_by?: string;
  notes?: string;
}

export interface ImportSnapshotInfo {
  id: number;
  generatedAt: string;
  summary: Record<string, unknown>;
  sourceImportIds: number[];
  rowCount: number;
}

export interface ImportCommitResponse {
  importId: number;
  monthLabel: string;
  year: number;
  monthNumber: number;
  filename: string;
  fileHash: string;
  rowCount: number;
  warnings: ImportWarning[];
  summary: ImportSummary;
  snapshot: ImportSnapshotInfo | null;
}

export interface ImportRecord {
  id: number;
  month_label: string;
  year: number;
  month_number: number;
  sort_idx: number;
  filename: string;
  file_hash: string;
  file_size_bytes: number;
  status: "committed" | "superseded" | "failed";
  row_count: number;
  user_count: number;
  brand_count: number;
  warnings: ImportWarning[];
  summary: ImportSummary;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  superseded_at: string | null;
}

export interface ImportListResponse {
  imports: ImportRecord[];
}

export interface MarketIntelligenceSummary {
  totalRows: number;
  totalMonths: number;
  totalBrands: number;
  totalCustomers: number;
  totalVisits: number;
  totalServices: number;
  totalRevenue: number;
  totalGrams: number;
  dateRange: { from: string; to: string };
}

export interface SnapshotResponse {
  id: number;
  generatedAt: string;
  sourceImportIds: number[];
  summary: MarketIntelligenceSummary;
  dataset: Record<string, unknown>;
  phoneIndex?: Record<string, unknown>;
}
