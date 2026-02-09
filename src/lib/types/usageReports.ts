// ── Salon Performance Dashboard – Types ──────────────────────────────

/** Parameters sent to the /user-usage-report Netlify function */
export interface UsageReportParams {
  userId: string;
  startMonth?: string; // e.g. "2024-08"
  endMonth?: string;   // e.g. "2026-01"
  serviceCategory?: string;
}

/** Top-level KPI block */
export interface UsageKPIs {
  totalServices: number;
  totalMaterialCost: number;
  avgCostPerService: number;
  activeMonths: number;
  servicesPerMonth: number;
  totalGrams: number;
  avgGramsPerService: number;
}

/** One row in the Service Category breakdown table */
export interface CategoryBreakdown {
  category: string;
  services: number;
  totalCost: number;
  avgCostPerService: number;
  totalGrams: number;
  avgGramsPerService: number;
}

/** One row in the Brand breakdown table */
export interface BrandBreakdown {
  brand: string;
  services: number;
  totalCost: number;
  avgCostPerService: number;
  totalGrams: number;
  visits: number;
}

/** One data point in a monthly time-series */
export interface MonthlyDataPoint {
  label: string;       // e.g. "Jan 2026"
  year: number;
  monthNumber: number;
  totalServices: number;
  totalCost: number;
  avgCostPerService: number;
  totalGrams: number;
}

/** Salon meta information (from the report rows) */
export interface SalonMeta {
  userId: string;
  displayName: string | null;
  state: string | null;
  city: string | null;
  salonType: string | null;
  employees: number | null;
}

/** Complete response from /user-usage-report */
export interface UsageReportResponse {
  salon: SalonMeta;
  kpis: UsageKPIs;
  categoryBreakdown: CategoryBreakdown[];
  brandBreakdown: BrandBreakdown[];
  timeSeries: MonthlyDataPoint[];
  availableMonths: string[];   // all month labels across all files
  filteredMonthRange: {
    from: string;
    to: string;
  };
}
