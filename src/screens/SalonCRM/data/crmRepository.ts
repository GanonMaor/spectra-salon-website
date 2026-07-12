/**
 * Repository boundary for the CRM.
 *
 * The CRMDataProvider is the only consumer of `CRMRepository`. Screens never
 * call this layer directly. Today the repository is backed by a static seed
 * snapshot but the contract is shaped to align 1:1 with the future Spectra
 * mobile/backend HTTP endpoints documented in the CRM data architecture
 * plan.
 */

import { buildCRMSeedSnapshot, DEFAULT_CRM_SEED } from "./crmSeedData";
import { CRMDomainError, type CRMError } from "./crmContracts";
import {
  canCallSalonRuntimeApi,
  getSalonLoginState,
  getSalonSessionToken,
  handleSalonAuthFailure,
  salonAuthHeaders,
} from "./salonSession";
import type {
  AnalyticsPayload,
  Appointment,
  AppointmentSegment,
  AppointmentStatus,
  Brand,
  CreateAppointmentInput,
  CreateCustomerInput,
  CreateStaffInput,
  CRMDataSnapshot,
  CRMDateParams,
  CRMInventoryParams,
  CRMListParams,
  Customer,
  InventoryItem,
  InventoryPayload,
  MixSession,
  Product,
  ProductLine,
  ProductUsage,
  Salon,
  SalonWorkingHours,
  SegmentType,
  Service,
  ServiceCategory,
  ServiceCategoryId,
  StaffMember,
  UpdateAppointmentInput,
  UpdateCustomerInput,
  UpdateInventoryInput,
  UpdateStaffInput,
  Visit,
} from "./crmTypes";

/** Convert any thrown value from a repository call into a `CRMError`. */
export function toCRMRepositoryError(err: unknown): CRMError {
  if (err instanceof CRMDomainError) return err.toCRMError();
  const message = err instanceof Error ? err.message : String(err);
  return {
    code: "REPOSITORY_ERROR",
    message,
    details: { name: err instanceof Error ? err.name : undefined },
  };
}

export interface CRMRepository {
  /**
   * Controls how CRMDataProvider overlays browser-persisted state onto a fresh
   * snapshot. Live inventory sources should keep inventory authoritative so old
   * local seed edits do not reappear beside DB rows.
   */
  persistedStatePolicy?: "merge-all" | "exclude-inventory" | "none";

  /**
   * Whether this repository has live write support (POST/PATCH/DELETE to the
   * real API). When false, write methods throw and callers fall back to
   * local in-memory mutations (seed / demo mode). When true, all customer
   * and staff mutations must call the API first and dispatch only after a
   * successful server response.
   */
  supportsLiveWrites?: boolean;

  /** Load every connected live entity at once for cold-boot. */
  loadSnapshot(): Promise<CRMDataSnapshot>;

  /** GET /crm/salon */
  getSalon(): Promise<Salon>;

  /** GET /crm/customers */
  getCustomers(params?: CRMListParams): Promise<Customer[]>;

  /** GET /crm/customers/:id */
  getCustomer(id: string): Promise<Customer | null>;

  /** GET /crm/appointments */
  getAppointments(params?: CRMDateParams): Promise<Appointment[]>;

  /** GET /crm/staff */
  getStaff(): Promise<StaffMember[]>;

  /** GET /crm/inventory */
  getInventory(params?: CRMInventoryParams): Promise<InventoryPayload>;

  /** GET /crm/analytics */
  getAnalytics(params?: CRMDateParams): Promise<AnalyticsPayload>;

  /** GET /spectra/live-visits */
  getLiveVisits(params?: CRMDateParams): Promise<Visit[]>;

  /** GET /spectra/product-usage */
  getProductUsage(params?: CRMDateParams): Promise<ProductUsage[]>;

  /** GET /spectra/mix-sessions */
  getMixSessions(params?: CRMDateParams): Promise<MixSession[]>;

  /** POST /crm/appointments */
  createAppointment(input: CreateAppointmentInput): Promise<Appointment>;

  /** PATCH /crm/appointments/:id */
  updateAppointment(
    id: string,
    input: UpdateAppointmentInput,
  ): Promise<Appointment>;

  /** DELETE /crm/appointments/:id */
  deleteAppointment(id: string): Promise<Appointment>;

  /** POST /crm/customers */
  createCustomer(input: CreateCustomerInput): Promise<Customer>;

  /** PATCH /crm/customers/:id */
  updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer>;

  /** DELETE /crm/customers/:id */
  archiveCustomer(id: string): Promise<Customer | { id: string }>;

  /** POST /crm/staff */
  createStaff(input: CreateStaffInput): Promise<StaffMember>;

  /** PATCH /crm/staff/:id */
  updateStaff(id: string, input: UpdateStaffInput): Promise<StaffMember>;

  /** DELETE /crm/staff/:id */
  archiveStaff(id: string): Promise<StaffMember | { id: string }>;

  /** PATCH /crm/inventory/:id */
  updateInventory(input: UpdateInventoryInput): Promise<InventoryItem>;
}

// ── Seed-backed repository ────────────────────────────────────────

/**
 * The default repository serves the static seed snapshot and rejects writes
 * because the simulated mutations live in `crmActions.ts`. When a real API
 * adapter is wired in later, the write methods will dispatch HTTP calls.
 */
class SeedCRMRepository implements CRMRepository {
  private snapshot: CRMDataSnapshot = DEFAULT_CRM_SEED;

  async loadSnapshot(): Promise<CRMDataSnapshot> {
    // Re-anchor to the current week each cold-boot so seed appointments stay
    // valid relative to the user's "today".
    this.snapshot = buildCRMSeedSnapshot(new Date());
    return this.snapshot;
  }

  async getSalon(): Promise<Salon> {
    return this.snapshot.salons[0];
  }

  async getCustomers(params?: CRMListParams): Promise<Customer[]> {
    let list = this.snapshot.customers;
    if (params?.query) {
      const q = params.query.toLowerCase();
      list = list.filter((c) =>
        `${c.firstName} ${c.lastName ?? ""} ${c.phone ?? ""} ${c.email ?? ""}`
          .toLowerCase()
          .includes(q),
      );
    }
    if (params?.status) {
      list = list.filter((c) => c.status === params.status);
    }
    if (params?.tag) {
      list = list.filter((c) => c.tags.includes(params.tag!));
    }
    return list;
  }

  async getCustomer(id: string): Promise<Customer | null> {
    return this.snapshot.customers.find((c) => c.id === id) ?? null;
  }

  async getAppointments(): Promise<Appointment[]> {
    return this.snapshot.appointments;
  }

  async getStaff(): Promise<StaffMember[]> {
    return this.snapshot.staff;
  }

  async getInventory(): Promise<InventoryPayload> {
    return {
      brands: this.snapshot.brands,
      productLines: this.snapshot.productLines,
      products: this.snapshot.products,
      inventoryItems: this.snapshot.inventoryItems,
    };
  }

  async getAnalytics(): Promise<AnalyticsPayload> {
    return { snapshots: this.snapshot.analyticsSnapshots };
  }

  async getLiveVisits(): Promise<Visit[]> {
    return this.snapshot.visits.filter((v) => v.status === "active");
  }

  async getProductUsage(): Promise<ProductUsage[]> {
    return this.snapshot.productUsage;
  }

  async getMixSessions(): Promise<MixSession[]> {
    return this.snapshot.mixSessions;
  }

  async createAppointment(): Promise<Appointment> {
    throw new Error(
      "[CRMRepository] Writes are routed through crmActions in the seed adapter.",
    );
  }

  async updateAppointment(): Promise<Appointment> {
    throw new Error(
      "[CRMRepository] Writes are routed through crmActions in the seed adapter.",
    );
  }

  async deleteAppointment(): Promise<Appointment> {
    throw new Error(
      "[CRMRepository] Writes are routed through crmActions in the seed adapter.",
    );
  }

  async createCustomer(): Promise<Customer> {
    throw new Error(
      "[CRMRepository] Writes are routed through crmActions in the seed adapter.",
    );
  }

  async updateCustomer(): Promise<Customer> {
    throw new Error(
      "[CRMRepository] Writes are routed through crmActions in the seed adapter.",
    );
  }

  async archiveCustomer(): Promise<Customer> {
    throw new Error(
      "[CRMRepository] Writes are routed through crmActions in the seed adapter.",
    );
  }

  async createStaff(): Promise<StaffMember> {
    throw new Error(
      "[CRMRepository] Writes are routed through crmActions in the seed adapter.",
    );
  }

  async updateStaff(): Promise<StaffMember> {
    throw new Error(
      "[CRMRepository] Writes are routed through crmActions in the seed adapter.",
    );
  }

  async archiveStaff(): Promise<StaffMember> {
    throw new Error(
      "[CRMRepository] Writes are routed through crmActions in the seed adapter.",
    );
  }

  async updateInventory(): Promise<InventoryItem> {
    throw new Error(
      "[CRMRepository] Writes are routed through crmActions in the seed adapter.",
    );
  }
}

export const seedCRMRepository: CRMRepository = new SeedCRMRepository();

// ── Netlify inventory adapter ──────────────────────────────────────

interface NetlifyBrandRow {
  id: string;
  name: string;
  slug: string;
  sort_order?: number;
}

interface NetlifyProductLineRow {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  sort_order?: number;
}

interface NetlifyInventoryProductRow {
  id: string;
  salon_id?: string;
  brand_id: string;
  product_line_id: string;
  shade_code: string;
  display_name?: string | null;
  level?: number | null;
  size_grams?: number | string | null;
  barcode?: string | null;
  is_visible?: boolean;
  cost_usd?: number | string | null;
  selling_price_usd?: number | string | null;
  margin_pct?: number | string | null;
  min_stock?: number | string | null;
  units_in_stock?: number | string | null;
  status?: string;
  brand_name?: string;
  brand_slug?: string;
  line_name?: string;
  line_slug?: string;
  updated_at?: string;
}

interface NetlifyInventoryListResponse {
  items?: NetlifyInventoryProductRow[];
}

interface NetlifyInventoryFiltersResponse {
  brands?: NetlifyBrandRow[];
  lines?: NetlifyProductLineRow[];
}

export interface NetlifyInventoryCRMRepositoryOptions {
  /** Absolute or relative origin. Empty string uses the current Netlify origin. */
  baseUrl?: string;
  salonId?: string;
  fetchImpl?: typeof fetch;
  fallbackRepository?: CRMRepository;
}

function defaultFetch(): typeof fetch {
  return ((input: RequestInfo | URL, init?: RequestInit) => fetch(input, init)) as typeof fetch;
}

/**
 * @deprecated LEGACY — pilot/production MUST use `createLiveCRMRepository()`.
 *
 * Reads from the legacy `/.netlify/functions/inventory` endpoint which targets
 * the old single-tenant `inventory_products` table and is NOT salon-scoped.
 * This class is never instantiated in the pilot runtime; it exists solely for
 * historical reference. Do NOT pass this to `CRMDataProvider` in any live,
 * pilot, or production context.
 */
export class NetlifyInventoryCRMRepository implements CRMRepository {
  persistedStatePolicy: CRMRepository["persistedStatePolicy"] = "exclude-inventory";

  private readonly baseUrl: string;
  private readonly salonId?: string;
  private readonly fetchImpl: typeof fetch;
  private readonly fallbackRepository: CRMRepository;

  constructor(options: NetlifyInventoryCRMRepositoryOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
    this.salonId = options.salonId;
    this.fetchImpl = options.fetchImpl ?? defaultFetch();
    this.fallbackRepository = options.fallbackRepository ?? seedCRMRepository;
  }

  async loadSnapshot(): Promise<CRMDataSnapshot> {
    const snapshot = await this.fallbackRepository.loadSnapshot();
    try {
      const inventory = await this.getInventory();
      const inventoryIds = new Set(inventory.inventoryItems.map((item) => item.id));
      const productIds = new Set(inventory.products.map((product) => product.id));
      return {
        ...snapshot,
        brands: inventory.brands,
        productLines: inventory.productLines,
        products: inventory.products,
        inventoryItems: inventory.inventoryItems,
        productUsage: snapshot.productUsage.filter(
          (usage) => inventoryIds.has(usage.inventoryItemId) && productIds.has(usage.productId),
        ),
      };
    } catch (err) {
      console.warn("[CRMRepository] live inventory unavailable; falling back to seed inventory", err);
      return snapshot;
    }
  }

  async getInventory(): Promise<InventoryPayload> {
    const [filters, list] = await Promise.all([
      this.request<NetlifyInventoryFiltersResponse>("/filters"),
      this.request<NetlifyInventoryListResponse>(""),
    ]);
    return mapNetlifyInventory(filters, list);
  }

  getSalon() { return this.fallbackRepository.getSalon(); }
  getCustomers(params?: CRMListParams) { return this.fallbackRepository.getCustomers(params); }
  getCustomer(id: string) { return this.fallbackRepository.getCustomer(id); }
  getAppointments(params?: CRMDateParams) { return this.fallbackRepository.getAppointments(params); }
  getStaff() { return this.fallbackRepository.getStaff(); }
  getAnalytics(params?: CRMDateParams) { return this.fallbackRepository.getAnalytics(params); }
  getLiveVisits(params?: CRMDateParams) { return this.fallbackRepository.getLiveVisits(params); }
  getProductUsage(params?: CRMDateParams) { return this.fallbackRepository.getProductUsage(params); }
  getMixSessions(params?: CRMDateParams) { return this.fallbackRepository.getMixSessions(params); }
  createAppointment(input: CreateAppointmentInput) { return this.fallbackRepository.createAppointment(input); }
  updateAppointment(id: string, input: UpdateAppointmentInput) { return this.fallbackRepository.updateAppointment(id, input); }
  deleteAppointment(id: string) { return this.fallbackRepository.deleteAppointment(id); }
  createCustomer(input: CreateCustomerInput) { return this.fallbackRepository.createCustomer(input); }
  updateCustomer(id: string, input: UpdateCustomerInput) { return this.fallbackRepository.updateCustomer(id, input); }
  archiveCustomer(id: string) { return this.fallbackRepository.archiveCustomer(id); }
  createStaff(input: CreateStaffInput) { return this.fallbackRepository.createStaff(input); }
  updateStaff(id: string, input: UpdateStaffInput) { return this.fallbackRepository.updateStaff(id, input); }
  archiveStaff(id: string) { return this.fallbackRepository.archiveStaff(id); }
  updateInventory(input: UpdateInventoryInput) { return this.fallbackRepository.updateInventory(input); }

  private async request<T>(path: string): Promise<T> {
    const headers: Record<string, string> = { Accept: "application/json" };
    const res = await this.fetchImpl(`${this.baseUrl}/.netlify/functions/inventory${path}`, {
      headers,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`[InventoryRepository] ${res.status} ${res.statusText} ${text}`);
    }
    return (await res.json()) as T;
  }
}

function mapNetlifyInventory(
  filters: NetlifyInventoryFiltersResponse,
  list: NetlifyInventoryListResponse,
): InventoryPayload {
  const rows = (list.items ?? []).filter((row) => row.status !== "inactive");
  const brandRows = new Map<string, NetlifyBrandRow>();
  for (const brand of filters.brands ?? []) brandRows.set(brand.id, brand);
  for (const row of rows) {
    if (!brandRows.has(row.brand_id)) {
      brandRows.set(row.brand_id, {
        id: row.brand_id,
        name: row.brand_name ?? row.brand_id,
        slug: row.brand_slug ?? row.brand_id,
      });
    }
  }

  const lineRows = new Map<string, NetlifyProductLineRow>();
  for (const line of filters.lines ?? []) lineRows.set(line.id, line);
  for (const row of rows) {
    if (!lineRows.has(row.product_line_id)) {
      lineRows.set(row.product_line_id, {
        id: row.product_line_id,
        brand_id: row.brand_id,
        name: row.line_name ?? row.product_line_id,
        slug: row.line_slug ?? row.product_line_id,
      });
    }
  }

  const brands: Brand[] = Array.from(brandRows.values())
    .map((brand, index) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      sortOrder: brand.sort_order ?? index + 1,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const productLines: ProductLine[] = Array.from(lineRows.values())
    .map((line, index) => ({
      id: line.id,
      brandId: line.brand_id,
      name: line.name,
      slug: line.slug,
      sortOrder: line.sort_order ?? index + 1,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const products: Product[] = rows.map((row) => ({
    id: productIdForInventoryRow(row.id),
    brandId: row.brand_id,
    productLineId: row.product_line_id,
    shadeCode: row.shade_code,
    displayName: row.display_name ?? undefined,
    level: row.level ?? undefined,
    sizeGrams: numberValue(row.size_grams, 50),
    serviceCategoryId: inferServiceCategory(row),
  }));

  const inventoryItems: InventoryItem[] = rows.map((row) => ({
    id: row.id,
    salonId: row.salon_id ?? DEFAULT_CRM_SEED.salonId,
    productId: productIdForInventoryRow(row.id),
    unitsInStock: numberValue(row.units_in_stock, 0),
    minStock: numberValue(row.min_stock, 0),
    costUsd: numberValue(row.cost_usd, 0),
    sellingPriceUsd: numberValue(row.selling_price_usd, 0),
    marginPct: numberValue(row.margin_pct, 0),
    barcode: row.barcode ?? null,
    isVisible: row.is_visible ?? true,
    updatedAt: row.updated_at ?? new Date().toISOString(),
  }));

  return { brands, productLines, products, inventoryItems };
}

function productIdForInventoryRow(inventoryId: string): string {
  return `product-${inventoryId}`;
}

function numberValue(value: number | string | null | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function inferServiceCategory(row: NetlifyInventoryProductRow): ServiceCategoryId {
  const text = `${row.shade_code} ${row.display_name ?? ""} ${row.line_name ?? ""} ${row.line_slug ?? ""}`.toLowerCase();
  if (/(bleach|developer|highlight|blond|הבהר)/.test(text)) return "highlights";
  if (/(shampoo|mask|masque|olaplex|k18|treatment|שמפו|מסכה|טיפול)/.test(text)) return "treatment";
  if (/(keratin|straight|החלק)/.test(text)) return "straightening";
  return "color";
}

/**
 * @deprecated LEGACY — pilot/production MUST use `createLiveCRMRepository()`.
 * See `NetlifyInventoryCRMRepository` for the full deprecation notice.
 */
export function createNetlifyInventoryCRMRepository(
  opts: NetlifyInventoryCRMRepositoryOptions = {},
): CRMRepository {
  return new NetlifyInventoryCRMRepository(opts);
}

// ── Salon-scoped products adapter (authenticated, multi-tenant) ────
//
// Reads from the salon-scoped /salon-products API where salon_id is derived
// from the authenticated session on the server. This is the multi-tenant
// runtime replacement for the legacy inventory adapter above: it only ever
// returns the salon's enabled brands and its own inventory records.

interface SalonInventoryApiRow {
  id: string;
  product_id: string;
  units_in_stock: number | string;
  min_stock: number | string;
  cost_amount: number | string | null;
  sell_price_amount: number | string | null;
  is_visible: boolean;
  is_favorite: boolean;
  local_barcode_override: string | null;
  local_display_name: string | null;
  canonical_name: string;
  primary_product_type: string | null;
  package_size_value: number | string | null;
  brand_id: string | null;
  product_line_id: string | null;
  brand_name: string | null;
  product_line_name: string | null;
}

interface SalonEnabledBrandApiRow {
  id: string;
  name: string;
}

interface SalonEnabledProductLineApiRow {
  id: string;
  brand_id: string;
  name: string;
}

interface CrmServicesApiCategory {
  id: string;
  crmCategoryId: ServiceCategoryId;
  name: string;
  accentColor: string;
}

interface CrmServicesApiService {
  id: string;
  crmCategoryId: ServiceCategoryId;
  name: string;
  defaultDurationMinutes: number;
  defaultPriceCents: number;
  defaultMaterialCostCents: number;
}

interface CrmServicesApiResponse {
  salonId?: string;
  categories?: CrmServicesApiCategory[];
  services?: CrmServicesApiService[];
}

function emptyLiveSnapshot(): CRMDataSnapshot {
  const loginState = getSalonLoginState();
  const salonId = loginState?.salonId || DEFAULT_CRM_SEED.salonId;
  const activeDate = new Date().toISOString().slice(0, 10);
  return {
    salonId,
    salons: [{
      id: salonId,
      name: "My Salon",
      slug: salonId,
      timezone: "Asia/Jerusalem",
      currency: "ILS",
      status: "active",
      onboardingStatus: "completed",
      workingHours: [],
    }],
    staff: [],
    customers: [],
    serviceCategories: [],
    services: [],
    appointments: [],
    visits: [],
    visitServices: [],
    brands: [],
    productLines: [],
    products: [],
    inventoryItems: [],
    mixSessions: [],
    productUsage: [],
    reweighOutcomes: [],
    analyticsSnapshots: [],
    systemState: {
      activeDate,
      bluetooth: { connected: false, deviceLabel: "" },
      notifications: { unreadCount: 0, hasUrgent: false },
      comingSoonFeatures: {},
      marketplace: [],
    },
  };
}

export interface SalonProductsCRMRepositoryOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  fallbackRepository?: CRMRepository;
  /** Builds auth headers (bearer only — never a salon id). */
  authHeaders?: () => Record<string, string>;
}

/**
 * @deprecated Superseded by `ApiCRMRepository` (via `createLiveCRMRepository()`).
 *
 * This class was an intermediate multi-tenant adapter. Pilot/production MUST use
 * `createLiveCRMRepository()` which returns a full `ApiCRMRepository` with live
 * writes, proper error handling, and the complete salon-scoped inventory contract.
 */
export class SalonProductsCRMRepository implements CRMRepository {
  persistedStatePolicy: CRMRepository["persistedStatePolicy"] = "none";

  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly fallbackRepository: CRMRepository;
  private readonly authHeaders: () => Record<string, string>;

  constructor(options: SalonProductsCRMRepositoryOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
    this.fetchImpl = options.fetchImpl ?? defaultFetch();
    this.fallbackRepository = options.fallbackRepository ?? seedCRMRepository;
    this.authHeaders = options.authHeaders ?? (() => ({ Accept: "application/json" }));
  }

  async loadSnapshot(): Promise<CRMDataSnapshot> {
    const snapshot = emptyLiveSnapshot();
    try {
      const [inventory, servicesResp] = await Promise.all([
        this.getInventory(),
        this.requestFunction<CrmServicesApiResponse>("crm-services", "").catch((err: unknown) => {
          console.warn("[CRMRepository] crm-services unavailable; returning empty live services", err);
          return null;
        }),
      ]);
      const inventoryIds = new Set(inventory.inventoryItems.map((item) => item.id));
      const productIds = new Set(inventory.products.map((product) => product.id));
      const servicesCatalog = servicesResp ? mapCrmServices(servicesResp, snapshot) ?? {
        serviceCategories: [],
        services: [],
      } : {
        serviceCategories: [],
        services: [],
      };
      return {
        ...snapshot,
        salonId: servicesResp?.salonId ?? snapshot.salonId,
        brands: inventory.brands,
        productLines: inventory.productLines,
        products: inventory.products,
        inventoryItems: inventory.inventoryItems,
        serviceCategories: servicesCatalog.serviceCategories,
        services: servicesCatalog.services,
        productUsage: snapshot.productUsage.filter(
          (usage) => inventoryIds.has(usage.inventoryItemId) && productIds.has(usage.productId),
        ),
      };
    } catch (err) {
      console.warn("[CRMRepository] salon-products unavailable; returning empty live inventory", err);
      return {
        ...snapshot,
        brands: [],
        productLines: [],
        products: [],
        inventoryItems: [],
        productUsage: [],
      };
    }
  }

  async getInventory(): Promise<InventoryPayload> {
    const [brandsResp, listResp, enabledLinesResp] = await Promise.all([
      this.request<{ brands?: SalonEnabledBrandApiRow[] }>("/brands/enabled"),
      this.request<{ items?: SalonInventoryApiRow[] }>("/inventory"),
      this.request<{ productLines?: SalonEnabledProductLineApiRow[] }>("/product-lines/enabled"),
    ]);
    return mapSalonProducts(brandsResp.brands ?? [], listResp.items ?? [], enabledLinesResp.productLines ?? []);
  }

  async getSalon() { return emptyLiveSnapshot().salons[0]; }
  async getCustomers(params?: CRMListParams) { return []; }
  async getCustomer(id: string) { return null; }
  async getAppointments(params?: CRMDateParams) { return []; }
  async getStaff() { return []; }
  getAnalytics(params?: CRMDateParams) { return this.fallbackRepository.getAnalytics(params); }
  getLiveVisits(params?: CRMDateParams) { return this.fallbackRepository.getLiveVisits(params); }
  getProductUsage(params?: CRMDateParams) { return this.fallbackRepository.getProductUsage(params); }
  getMixSessions(params?: CRMDateParams) { return this.fallbackRepository.getMixSessions(params); }
  createAppointment(input: CreateAppointmentInput) { return this.fallbackRepository.createAppointment(input); }
  updateAppointment(id: string, input: UpdateAppointmentInput) { return this.fallbackRepository.updateAppointment(id, input); }
  deleteAppointment(id: string) { return this.fallbackRepository.deleteAppointment(id); }
  createCustomer(input: CreateCustomerInput) { return this.fallbackRepository.createCustomer(input); }
  updateCustomer(id: string, input: UpdateCustomerInput) { return this.fallbackRepository.updateCustomer(id, input); }
  archiveCustomer(id: string) { return this.fallbackRepository.archiveCustomer(id); }
  createStaff(input: CreateStaffInput) { return this.fallbackRepository.createStaff(input); }
  updateStaff(id: string, input: UpdateStaffInput) { return this.fallbackRepository.updateStaff(id, input); }
  archiveStaff(id: string) { return this.fallbackRepository.archiveStaff(id); }
  updateInventory(input: UpdateInventoryInput) { return this.fallbackRepository.updateInventory(input); }

  private async request<T>(path: string): Promise<T> {
    if (!canCallSalonRuntimeApi()) {
      throw new Error("Salon session is required before calling salon-products.");
    }
    const res = await this.fetchImpl(`${this.baseUrl}/.netlify/functions/salon-products${path}`, {
      headers: this.authHeaders(),
    });
    if (!res.ok) {
      handleSalonAuthFailure(res.status);
      const text = await res.text().catch(() => "");
      throw new Error(`[SalonProductsRepository] ${res.status} ${res.statusText} ${text}`);
    }
    return (await res.json()) as T;
  }

  private async requestFunction<T>(functionName: string, path: string): Promise<T> {
    if (!canCallSalonRuntimeApi()) {
      throw new Error(`Salon session is required before calling ${functionName}.`);
    }
    const res = await this.fetchImpl(`${this.baseUrl}/.netlify/functions/${functionName}${path}`, {
      headers: this.authHeaders(),
    });
    if (!res.ok) {
      handleSalonAuthFailure(res.status);
      const text = await res.text().catch(() => "");
      throw new Error(`[${functionName}] ${res.status} ${res.statusText} ${text}`);
    }
    return (await res.json()) as T;
  }

}

function slugify(value: string): string {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "unknown";
}

function inferSalonServiceCategory(row: SalonInventoryApiRow): ServiceCategoryId {
  const text = `${row.primary_product_type ?? ""} ${row.canonical_name} ${row.product_line_name ?? ""}`.toLowerCase();
  if (/(bleach|developer|oxidant|highlight|blond|הבהר)/.test(text)) return "highlights";
  if (/(shampoo|mask|masque|olaplex|k18|treatment|conditioner|שמפו|מסכה|טיפול)/.test(text)) return "treatment";
  if (/(keratin|straight|החלק)/.test(text)) return "straightening";
  return "color";
}

const SERVICE_CATEGORY_IDS: ServiceCategoryId[] = ["color", "highlights", "toner", "straightening", "cut", "treatment", "other"];

function asServiceCategoryId(value: unknown): ServiceCategoryId {
  return SERVICE_CATEGORY_IDS.includes(value as ServiceCategoryId) ? value as ServiceCategoryId : "other";
}

function mapCrmServices(
  response: CrmServicesApiResponse,
  fallback: CRMDataSnapshot,
): { serviceCategories: ServiceCategory[]; services: Service[] } | null {
  const apiServices = response.services ?? [];
  const apiCategories = response.categories ?? [];
  if (apiServices.length === 0 && apiCategories.length === 0) return null;

  const categoryMap = new Map<ServiceCategoryId, ServiceCategory>();
  for (const category of apiCategories) {
    const id = asServiceCategoryId(category.crmCategoryId);
    if (!categoryMap.has(id)) {
      categoryMap.set(id, {
        id,
        name: category.name || fallback.serviceCategories.find((c) => c.id === id)?.name || id,
        accentColor: category.accentColor || fallback.serviceCategories.find((c) => c.id === id)?.accentColor || "#D7897F",
      });
    }
  }
  for (const category of fallback.serviceCategories) {
    if (!categoryMap.has(category.id)) categoryMap.set(category.id, category);
  }

  const services: Service[] = apiServices.map((service) => ({
    id: service.id,
    salonId: response.salonId ?? fallback.salonId,
    categoryId: asServiceCategoryId(service.crmCategoryId),
    name: service.name,
    defaultDurationMinutes: Number(service.defaultDurationMinutes) || 60,
    defaultPriceCents: Number(service.defaultPriceCents) || 0,
    defaultMaterialCostCents: Number(service.defaultMaterialCostCents) || 0,
  }));

  return {
    serviceCategories: Array.from(categoryMap.values()),
    services,
  };
}

function mapSalonProducts(
  enabledBrands: SalonEnabledBrandApiRow[],
  rows: SalonInventoryApiRow[],
  enabledLines: SalonEnabledProductLineApiRow[] = [],
  overrideSalonId?: string,
): InventoryPayload {
  const brandMap = new Map<string, Brand>();
  enabledBrands.forEach((b, index) => {
    brandMap.set(b.id, { id: b.id, name: b.name, slug: slugify(b.name), sortOrder: index + 1 });
  });
  // Include any brand referenced by inventory even if not in enabled list.
  for (const row of rows) {
    if (row.brand_id && !brandMap.has(row.brand_id)) {
      const name = row.brand_name ?? row.brand_id;
      brandMap.set(row.brand_id, { id: row.brand_id, name, slug: slugify(name), sortOrder: brandMap.size + 1 });
    }
  }

  const lineMap = new Map<string, ProductLine>();
  enabledLines.forEach((line, index) => {
    lineMap.set(line.id, {
      id: line.id,
      brandId: line.brand_id,
      name: line.name,
      slug: slugify(line.name),
      sortOrder: index + 1,
    });
  });
  for (const row of rows) {
    if (row.product_line_id && !lineMap.has(row.product_line_id)) {
      const name = row.product_line_name ?? row.product_line_id;
      lineMap.set(row.product_line_id, {
        id: row.product_line_id,
        brandId: row.brand_id ?? "",
        name,
        slug: slugify(name),
        sortOrder: lineMap.size + 1,
      });
    }
  }

  const products: Product[] = rows.map((row) => ({
    id: row.product_id,
    brandId: row.brand_id ?? "",
    productLineId: row.product_line_id ?? "",
    shadeCode: row.local_display_name ?? row.canonical_name,
    displayName: row.local_display_name ?? row.canonical_name,
    level: undefined,
    sizeGrams: numberValue(row.package_size_value, 50),
    serviceCategoryId: inferSalonServiceCategory(row),
  }));

  const inventoryItems: InventoryItem[] = rows.map((row) => {
    const cost = numberValue(row.cost_amount, 0);
    const sell = numberValue(row.sell_price_amount, 0);
    const marginPct = sell > 0 ? ((sell - cost) / sell) * 100 : 0;
    return {
      id: row.id,
      salonId: overrideSalonId ?? DEFAULT_CRM_SEED.salonId,
      productId: row.product_id,
      unitsInStock: numberValue(row.units_in_stock, 0),
      minStock: numberValue(row.min_stock, 0),
      costUsd: cost,
      sellingPriceUsd: sell,
      marginPct,
      barcode: row.local_barcode_override ?? null,
      isVisible: row.is_visible ?? true,
      updatedAt: new Date().toISOString(),
    };
  });

  return {
    brands: Array.from(brandMap.values()),
    productLines: Array.from(lineMap.values()),
    products,
    inventoryItems,
  };
}

/**
 * @deprecated Superseded by `createLiveCRMRepository()`.
 * See `SalonProductsCRMRepository` for the full deprecation notice.
 */
export function createSalonProductsCRMRepository(
  opts: SalonProductsCRMRepositoryOptions = {},
): CRMRepository {
  return new SalonProductsCRMRepository(opts);
}

// ── Live Netlify API adapter ───────────────────────────────────────

export interface ApiCRMRepositoryOptions {
  /** Base URL for the Spectra mobile/backend API. Defaults to same origin (`""`). */
  baseUrl?: string;
  /**
   * Static bearer token. Only use for tests / server-side calls where the
   * token is known at construction time. Prefer `authHeaders` for all
   * browser module-level singletons so the current token is read at request
   * time and stale tokens after logout/login are never sent.
   */
  token?: string;
  /**
   * Lazy auth headers factory — called at request time. When provided,
   * `token` is ignored. Use `() => salonAuthHeaders()` for the live runtime
   * so the repository always carries the current session token.
   */
  authHeaders?: () => Record<string, string>;
  /** Optional fetch override for tests / SSR. */
  fetchImpl?: typeof fetch;
}

interface ApiErrorEnvelope {
  ok?: false;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  } | string;
}

interface ApiSuccessEnvelope<T> {
  ok: true;
  data: T;
  meta?: Record<string, unknown>;
}

interface ApiCRMRepositoryHttpErrorOptions {
  status: number;
  statusText: string;
  code?: string;
  bodyText?: string;
}

class ApiCRMRepositoryHttpError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly code?: string;
  readonly bodyText?: string;

  constructor(options: ApiCRMRepositoryHttpErrorOptions) {
    super(`[CRMRepository] ${options.status} ${options.statusText}${options.code ? ` ${options.code}` : ""}`);
    this.name = "ApiCRMRepositoryHttpError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.code = options.code;
    this.bodyText = options.bodyText;
  }
}

type ApiObject = Record<string, unknown>;

/**
 * HTTP-backed live repository for the pilot CRM runtime.
 *
 * This adapter treats the Netlify CRM functions as the sole live source of
 * truth. `crm-bootstrap` is the canonical read model; until that function
 * returns every collection, the repository fills missing live domains from the
 * Phase 4 endpoints and keeps not-yet-connected modules empty instead of
 * merging seed data.
 */
export class ApiCRMRepository implements CRMRepository {
  /**
   * Live API calls must never merge stale browser-cached business state.
   * The repository is the single source of truth; each loadSnapshot() call
   * fetches authoritative data from the DB.
   */
  persistedStatePolicy: CRMRepository["persistedStatePolicy"] = "none";
  supportsLiveWrites = true as const;

  private readonly baseUrl: string;
  private readonly token: string | undefined;
  private readonly authHeadersFn: (() => Record<string, string>) | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ApiCRMRepositoryOptions) {
    this.baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
    this.token = options.token;
    this.authHeadersFn = options.authHeaders;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private buildAuthHeaders(): Record<string, string> {
    if (this.authHeadersFn) return sanitizeAuthHeaders(this.authHeadersFn());
    const token = this.token ?? getSalonSessionToken();
    return sanitizeAuthHeaders({
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    if (!canCallSalonRuntimeApi()) {
      throw new Error("[CRMRepository] Salon session required before calling CRM API.");
    }
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...this.buildAuthHeaders(),
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      handleSalonAuthFailure(res.status);
      const text = await res.text().catch(() => "");
      let code: string | undefined;
      try {
        const parsed = JSON.parse(text) as ApiErrorEnvelope;
        if (parsed && typeof parsed === "object") {
          code = typeof parsed.error === "object" ? parsed.error?.code : undefined;
        }
      } catch {
        /* ignore non-JSON error body */
      }
      throw new ApiCRMRepositoryHttpError({
        status: res.status,
        statusText: res.statusText,
        code,
        bodyText: text,
      });
    }
    if (res.status === 204) return undefined as T;
    const body = await res.json().catch(() => undefined);
    return unwrapApiPayload<T>(body);
  }

  private functionPath(name: string, path = ""): string {
    return `/.netlify/functions/${name}${path}`;
  }

  private async requestFunction<T>(
    functionName: string,
    path = "",
    init?: RequestInit,
  ): Promise<T> {
    return this.request<T>(this.functionPath(functionName, path), init);
  }

  async loadSnapshot(): Promise<CRMDataSnapshot> {
    const bootstrap = await this.requestFunction<ApiObject>("crm-bootstrap");
    const bootstrapSnapshot = extractBootstrapSnapshot(bootstrap);
    const salonId = resolveLiveSalonId(bootstrap, bootstrapSnapshot);
    const salon = mapLiveSalon(
      firstObject(bootstrapSnapshot?.salons) ?? objectValue(bootstrap.salon),
      salonId,
    );

    const [customers, staff, appointments, inventory, servicesCatalog] = await Promise.all([
      bootstrapSnapshot?.customers
        ? Promise.resolve(mapLiveCustomers(bootstrapSnapshot.customers))
        : this.getCustomers({ status: "all", limit: 200 }).catch((err: unknown) => this.emptyArrayWhenSetupUnavailable<Customer>(err)),
      bootstrapSnapshot?.staff
        ? Promise.resolve(mapLiveStaff(bootstrapSnapshot.staff, salonId))
        : this.getStaff().catch((err: unknown) => this.emptyArrayWhenSetupUnavailable<StaffMember>(err)),
      bootstrapSnapshot?.appointments
        ? Promise.resolve(mapLiveAppointments(bootstrapSnapshot.appointments, salonId))
        : this.getAppointments().catch((err: unknown) => this.emptyArrayWhenSetupUnavailable<Appointment>(err)),
      hasInventoryPayload(bootstrapSnapshot)
        ? Promise.resolve(mapLiveInventoryPayload(bootstrapSnapshot, salonId))
        : this.getInventory().catch((err: unknown) => this.emptyInventoryWhenSetupUnavailable(err)),
      extractServicesCatalog(bootstrap, salonId)
        ?? this.getServicesCatalog().catch((err: unknown) => this.emptyServicesWhenSetupUnavailable(err)),
    ]);

    return {
      salonId,
      salons: [salon],
      staff,
      customers,
      serviceCategories: servicesCatalog.serviceCategories,
      services: servicesCatalog.services,
      appointments,
      visits: [],
      visitServices: [],
      brands: inventory.brands,
      productLines: inventory.productLines,
      products: inventory.products,
      inventoryItems: inventory.inventoryItems,
      mixSessions: [],
      productUsage: [],
      reweighOutcomes: [],
      analyticsSnapshots: [],
      systemState: minimalLiveSystemState(bootstrapSnapshot?.systemState),
    };
  }

  async getSalon(): Promise<Salon> {
    const bootstrap = await this.requestFunction<ApiObject>("crm-bootstrap");
    const bootstrapSnapshot = extractBootstrapSnapshot(bootstrap);
    return mapLiveSalon(
      firstObject(bootstrapSnapshot?.salons) ?? objectValue(bootstrap.salon),
      resolveLiveSalonId(bootstrap, bootstrapSnapshot),
    );
  }

  async getCustomers(p?: CRMListParams): Promise<Customer[]> {
    const payload = await this.requestFunction<unknown>("salon-customers", customerQueryString(p));
    return mapLiveCustomers(arrayPayload(payload, "customers"));
  }

  async getCustomer(id: string): Promise<Customer | null> {
    try {
      const payload = await this.requestFunction<unknown>("salon-customers", `/${encodeURIComponent(id)}`);
      const customer = objectPayload(payload, "customer");
      return customer ? mapLiveCustomer(customer) : null;
    } catch (err) {
      if (err instanceof ApiCRMRepositoryHttpError && err.status === 404) return null;
      throw err;
    }
  }

  async getAppointments(p?: CRMDateParams): Promise<Appointment[]> {
    const payload = await this.requestFunction<unknown>("salon-appointments", queryString(p));
    const salonId = stringValue(objectValue(payload)?.salonId) ?? getLiveLoginSalonId();
    return mapLiveAppointments(arrayPayload(payload, "appointments"), salonId);
  }

  async getStaff(): Promise<StaffMember[]> {
    const payload = await this.requestFunction<unknown>("salon-staff", "?status=all");
    const salonId = stringValue(objectValue(payload)?.salonId) ?? getLiveLoginSalonId();
    return mapLiveStaff(arrayPayload(payload, "staff"), salonId);
  }

  async getInventory(p?: CRMInventoryParams): Promise<InventoryPayload> {
    const inventoryQuery = inventoryQueryString(p);
    const [brandsResp, listResp, enabledLinesResp] = await Promise.all([
      this.requestFunction<unknown>("salon-products", "/brands/enabled"),
      this.requestFunction<unknown>("salon-products", `/inventory${inventoryQuery}`),
      this.requestFunction<unknown>("salon-products", "/product-lines/enabled"),
    ]);
    const salonId = stringValue(objectValue(listResp)?.salonId) ?? getLiveLoginSalonId();
    return mapSalonProducts(
      arrayPayload(brandsResp, "brands") as SalonEnabledBrandApiRow[],
      arrayPayload(listResp, "items") as SalonInventoryApiRow[],
      arrayPayload(enabledLinesResp, "productLines") as SalonEnabledProductLineApiRow[],
      salonId,
    );
  }

  async getAnalytics(): Promise<AnalyticsPayload> {
    return { snapshots: [] };
  }

  async getLiveVisits(): Promise<Visit[]> {
    return [];
  }

  async getProductUsage(): Promise<ProductUsage[]> {
    return [];
  }

  async getMixSessions(): Promise<MixSession[]> {
    return [];
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    const payload = await this.requestFunction<unknown>("salon-appointments", "", {
      method: "POST",
      body: JSON.stringify(sanitizeTenantScopedPayload(input)),
    });
    const salonId = stringValue(objectValue(payload)?.salonId) ?? getLiveLoginSalonId();
    return mapLiveAppointment(objectPayload(payload, "appointment") ?? payload, salonId);
  }

  async updateAppointment(id: string, input: UpdateAppointmentInput): Promise<Appointment> {
    const payload = await this.requestFunction<unknown>("salon-appointments", `/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(sanitizeTenantScopedPayload(input)),
    });
    const salonId = stringValue(objectValue(payload)?.salonId) ?? getLiveLoginSalonId();
    return mapLiveAppointment(objectPayload(payload, "appointment") ?? payload, salonId);
  }

  async deleteAppointment(id: string): Promise<Appointment> {
    const payload = await this.requestFunction<unknown>("salon-appointments", `/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const salonId = stringValue(objectValue(payload)?.salonId) ?? getLiveLoginSalonId();
    return mapLiveAppointment(objectPayload(payload, "appointment") ?? payload, salonId);
  }

  async createCustomer(input: CreateCustomerInput): Promise<Customer> {
    const payload = await this.requestFunction<unknown>("salon-customers", "", {
      method: "POST",
      body: JSON.stringify(sanitizeTenantScopedPayload(input)),
    });
    return mapLiveCustomer(objectPayload(payload, "customer") ?? payload);
  }

  async updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const payload = await this.requestFunction<unknown>("salon-customers", `/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(sanitizeTenantScopedPayload(input)),
    });
    return mapLiveCustomer(objectPayload(payload, "customer") ?? payload);
  }

  async archiveCustomer(id: string): Promise<Customer | { id: string }> {
    const payload = await this.requestFunction<unknown>("salon-customers", `/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const customer = objectPayload(payload, "customer");
    return customer ? mapLiveCustomer(customer) : { id };
  }

  async createStaff(input: CreateStaffInput): Promise<StaffMember> {
    const payload = await this.requestFunction<unknown>("salon-staff", "", {
      method: "POST",
      body: JSON.stringify(sanitizeTenantScopedPayload(input)),
    });
    const salonId = stringValue(objectValue(payload)?.salonId) ?? getLiveLoginSalonId();
    return mapLiveStaffMember(objectPayload(payload, "staff") ?? objectPayload(payload, "staffMember") ?? payload, salonId);
  }

  async updateStaff(id: string, input: UpdateStaffInput): Promise<StaffMember> {
    const payload = await this.requestFunction<unknown>("salon-staff", `/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(sanitizeTenantScopedPayload(input)),
    });
    const salonId = stringValue(objectValue(payload)?.salonId) ?? getLiveLoginSalonId();
    return mapLiveStaffMember(objectPayload(payload, "staff") ?? objectPayload(payload, "staffMember") ?? payload, salonId);
  }

  async archiveStaff(id: string): Promise<StaffMember | { id: string }> {
    const payload = await this.requestFunction<unknown>("salon-staff", `/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const salonId = stringValue(objectValue(payload)?.salonId) ?? getLiveLoginSalonId();
    const staff = objectPayload(payload, "staff") ?? objectPayload(payload, "staffMember");
    return staff ? mapLiveStaffMember(staff, salonId) : { id };
  }

  async updateInventory(input: UpdateInventoryInput): Promise<InventoryItem> {
    const payload = await this.requestFunction<unknown>("salon-products", `/inventory/${encodeURIComponent(input.inventoryItemId)}`, {
      method: "PATCH",
      body: JSON.stringify(toSalonProductsInventoryPatch(input)),
    });
    return mapLiveInventoryItem(
      objectPayload(payload, "item") ?? payload,
      stringValue(objectValue(payload)?.salonId) ?? getLiveLoginSalonId(),
    );
  }

  private async getServicesCatalog(): Promise<{ serviceCategories: ServiceCategory[]; services: Service[] }> {
    const payload = await this.requestFunction<unknown>("crm-services");
    const obj = objectValue(payload);
    const salonId = stringValue(obj?.salonId) ?? getLiveLoginSalonId();
    return mapLiveServicesCatalog(obj, salonId);
  }

  private emptyArrayWhenSetupUnavailable<T>(err: unknown): T[] {
    if (isSetupUnavailableError(err)) return [];
    throw err;
  }

  private emptyInventoryWhenSetupUnavailable(err: unknown): InventoryPayload {
    if (isSetupUnavailableError(err)) return emptyInventoryPayload();
    throw err;
  }

  private emptyServicesWhenSetupUnavailable(err: unknown): { serviceCategories: ServiceCategory[]; services: Service[] } {
    if (isSetupUnavailableError(err)) return { serviceCategories: [], services: [] };
    throw err;
  }
}

function unwrapApiPayload<T>(body: unknown): T {
  if (body && typeof body === "object" && "ok" in body) {
    const envelope = body as ApiSuccessEnvelope<T> | ApiErrorEnvelope;
    if (envelope.ok === false) {
      const error = envelope.error;
      const message = typeof error === "object" ? error?.message : error;
      throw new Error(message || "[CRMRepository] API request failed.");
    }
    if (envelope.ok === true) return envelope.data;
  }
  const errorEnvelope = body as ApiErrorEnvelope | undefined;
  if (errorEnvelope?.error) {
    const error = errorEnvelope.error;
    const message = typeof error === "object" ? error.message : error;
    throw new Error(message || "[CRMRepository] API request failed.");
  }
  return body as T;
}

function objectValue(value: unknown): ApiObject | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as ApiObject
    : undefined;
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function numberOrFallback(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function booleanOrFallback(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function firstObject(value: unknown): ApiObject | undefined {
  return Array.isArray(value) ? objectValue(value[0]) : undefined;
}

function arrayPayload(value: unknown, key: string): unknown[] {
  if (Array.isArray(value)) return value;
  const obj = objectValue(value);
  const nested = obj?.[key];
  return Array.isArray(nested) ? nested : [];
}

function objectPayload(value: unknown, key: string): ApiObject | undefined {
  if (Array.isArray(value)) return undefined;
  const obj = objectValue(value);
  return objectValue(obj?.[key]) ?? obj;
}

function extractBootstrapSnapshot(bootstrap: ApiObject): Partial<CRMDataSnapshot> | undefined {
  const nested = objectValue(bootstrap.snapshot);
  if (nested) return nested as Partial<CRMDataSnapshot>;
  if (
    Array.isArray(bootstrap.customers)
    || Array.isArray(bootstrap.staff)
    || Array.isArray(bootstrap.appointments)
    || Array.isArray(bootstrap.services)
    || Array.isArray(bootstrap.inventoryItems)
  ) {
    return bootstrap as Partial<CRMDataSnapshot>;
  }
  return undefined;
}

function resolveLiveSalonId(bootstrap: ApiObject, snapshot?: Partial<CRMDataSnapshot>): string {
  return stringValue(snapshot?.salonId)
    ?? stringValue(bootstrap.salonId)
    ?? stringValue(objectValue(bootstrap.identity)?.salonId)
    ?? getLiveLoginSalonId();
}

function getLiveLoginSalonId(): string {
  return getSalonLoginState()?.salonId || "live-salon";
}

function minimalLiveSystemState(value?: unknown): CRMDataSnapshot["systemState"] {
  const state = objectValue(value);
  const activeDate = stringValue(state?.activeDate) ?? new Date().toISOString().slice(0, 10);
  const marketplace = state?.marketplace;
  return {
    activeDate,
    bluetooth: objectValue(state?.bluetooth) as CRMDataSnapshot["systemState"]["bluetooth"] | undefined
      ?? { connected: false, deviceLabel: "" },
    notifications: objectValue(state?.notifications) as CRMDataSnapshot["systemState"]["notifications"] | undefined
      ?? { unreadCount: 0, hasUrgent: false },
    comingSoonFeatures: (objectValue(state?.comingSoonFeatures) as Record<string, boolean> | undefined) ?? {},
    marketplace: Array.isArray(marketplace)
      ? marketplace as CRMDataSnapshot["systemState"]["marketplace"]
      : [],
  };
}

function mapLiveSalon(value: unknown, salonId: string): Salon {
  const row = objectValue(value);
  return {
    id: stringValue(row?.id) ?? salonId,
    name: stringValue(row?.name) ?? "My Salon",
    businessName: stringValue(row?.businessName ?? row?.business_name),
    slug: stringValue(row?.slug) ?? slugify(salonId),
    timezone: stringValue(row?.timezone) ?? "Asia/Jerusalem",
    currency: asCurrency(row?.currency),
    phone: stringValue(row?.phone),
    email: stringValue(row?.email),
    address: stringValue(row?.address),
    city: stringValue(row?.city),
    status: row?.status === "inactive" ? "inactive" : "active",
    onboardingStatus: row?.onboardingStatus === "incomplete" || row?.onboarding_status === "incomplete"
      ? "incomplete"
      : "completed",
    onboardingCurrentStep: stringValue(row?.onboardingCurrentStep ?? row?.onboarding_current_step),
    onboardingCompletedAt: stringValue(row?.onboardingCompletedAt ?? row?.onboarding_completed_at),
    onboardingUpdatedAt: stringValue(row?.onboardingUpdatedAt ?? row?.onboarding_updated_at),
    workingHours: mapWorkingHours(row?.workingHours ?? row?.working_hours),
  };
}

function asCurrency(value: unknown): Salon["currency"] {
  return value === "USD" || value === "EUR" || value === "ILS" ? value : "ILS";
}

function mapWorkingHours(value: unknown): SalonWorkingHours[] {
  if (!Array.isArray(value)) return [];
  return value.reduce<SalonWorkingHours[]>((hours, item) => {
    const row = objectValue(item);
    if (!row) return hours;
    hours.push({
      dayOfWeek: numberOrFallback(row.dayOfWeek ?? row.day_of_week, 0),
      startHour: numberOrFallback(row.startHour ?? row.start_hour, 9),
      endHour: numberOrFallback(row.endHour ?? row.end_hour, 18),
      breakStart: optionalNumber(row.breakStart ?? row.break_start),
      breakEnd: optionalNumber(row.breakEnd ?? row.break_end),
    });
    return hours;
  }, []);
}

function optionalNumber(value: unknown): number | undefined {
  const n = numberOrFallback(value, NaN);
  return Number.isFinite(n) ? n : undefined;
}

function mapLiveCustomers(value: unknown): Customer[] {
  return Array.isArray(value) ? value.map(mapLiveCustomer) : [];
}

function mapLiveCustomer(value: unknown): Customer {
  const row = objectValue(value) ?? {};
  return {
    id: stringValue(row.id) ?? "",
    salonId: stringValue(row.salonId ?? row.salon_id) ?? getLiveLoginSalonId(),
    firstName: stringValue(row.firstName ?? row.first_name) ?? "",
    lastName: stringValue(row.lastName ?? row.last_name),
    phone: stringValue(row.phone),
    email: stringValue(row.email),
    notes: stringValue(row.notes),
    tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
    avatarUrl: stringValue(row.avatarUrl ?? row.avatar_url),
    status: asCustomerStatus(row.status),
    isVip: booleanOrFallback(row.isVip ?? row.is_vip, false),
    createdAt: stringValue(row.createdAt ?? row.created_at) ?? new Date().toISOString(),
    updatedAt: stringValue(row.updatedAt ?? row.updated_at) ?? new Date().toISOString(),
  };
}

function asCustomerStatus(value: unknown): Customer["status"] {
  return value === "inactive" || value === "archived" ? value : "active";
}

function mapLiveStaff(value: unknown, fallbackSalonId: string): StaffMember[] {
  return Array.isArray(value) ? value.map((staff) => mapLiveStaffMember(staff, fallbackSalonId)) : [];
}

function mapLiveStaffMember(value: unknown, fallbackSalonId: string): StaffMember {
  const row = objectValue(value) ?? {};
  return {
    id: stringValue(row.id) ?? "",
    salonId: stringValue(row.salonId ?? row.salon_id) ?? fallbackSalonId,
    name: stringValue(row.name) ?? "",
    role: stringValue(row.role) ?? "Stylist",
    roleId: stringValue(row.roleId ?? row.role_id),
    departmentIds: stringArray(row.departmentIds ?? row.department_ids),
    serviceIds: stringArray(row.serviceIds ?? row.service_ids),
    servicePriceOverrides: (objectValue(row.servicePriceOverrides ?? row.service_price_overrides) as Record<string, number> | undefined) ?? {},
    color: stringValue(row.color) ?? "#D7897F",
    avatarUrl: stringValue(row.avatarUrl ?? row.avatar_url),
    email: stringValue(row.email),
    phone: stringValue(row.phone),
    status: row.status === "inactive" ? "inactive" : "active",
    rating: numberOrFallback(row.rating, 0),
    workingHours: mapWorkingHours(row.workingHours ?? row.working_hours),
  };
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function mapLiveAppointments(value: unknown, fallbackSalonId: string): Appointment[] {
  return Array.isArray(value) ? value.map((appointment) => mapLiveAppointment(appointment, fallbackSalonId)) : [];
}

function mapLiveAppointment(value: unknown, fallbackSalonId: string): Appointment {
  const row = objectValue(value) ?? {};
  const id = stringValue(row.id) ?? "";
  return {
    id,
    salonId: stringValue(row.salonId ?? row.salon_id) ?? fallbackSalonId,
    staffMemberId: stringValue(row.staffMemberId ?? row.staff_member_id) ?? "",
    customerId: stringValue(row.customerId ?? row.customer_id),
    customerName: stringValue(row.customerName ?? row.customer_name) ?? "",
    serviceId: stringValue(row.serviceId ?? row.service_id),
    serviceName: stringValue(row.serviceName ?? row.service_name) ?? "",
    serviceCategoryId: asServiceCategoryId(row.serviceCategoryId ?? row.service_category_id),
    startTime: stringValue(row.startTime ?? row.start_time) ?? new Date().toISOString(),
    endTime: stringValue(row.endTime ?? row.end_time) ?? new Date().toISOString(),
    status: asAppointmentStatus(row.status),
    notes: stringValue(row.notes),
    visitId: stringValue(row.visitId ?? row.visit_id),
    groupId: stringValue(row.groupId ?? row.group_id),
    segments: mapLiveAppointmentSegments(row.segments, id),
  };
}

function asAppointmentStatus(value: unknown): AppointmentStatus {
  return value === "in-progress" || value === "completed" || value === "cancelled" || value === "no-show"
    ? value
    : "confirmed";
}

function mapLiveAppointmentSegments(value: unknown, appointmentId: string): AppointmentSegment[] {
  if (!Array.isArray(value)) return [];
  return value.map((segment, index) => {
    const row = objectValue(segment) ?? {};
    return {
      id: stringValue(row.id) ?? `${appointmentId}-segment-${index}`,
      appointmentId: stringValue(row.appointmentId ?? row.appointment_id) ?? appointmentId,
      staffMemberId: stringValue(row.staffMemberId ?? row.staff_member_id),
      resourceId: stringValue(row.resourceId ?? row.resource_id),
      serviceId: stringValue(row.serviceId ?? row.service_id),
      serviceName: stringValue(row.serviceName ?? row.service_name),
      serviceCategoryId: asServiceCategoryId(row.serviceCategoryId ?? row.service_category_id),
      segmentType: asSegmentType(row.segmentType ?? row.segment_type),
      label: stringValue(row.label) ?? "",
      startTime: stringValue(row.startTime ?? row.start_time) ?? new Date().toISOString(),
      endTime: stringValue(row.endTime ?? row.end_time) ?? new Date().toISOString(),
      sortOrder: numberOrFallback(row.sortOrder ?? row.sort_order, index),
      productGrams: optionalNumber(row.productGrams ?? row.product_grams),
      notes: stringValue(row.notes),
    };
  });
}

function asSegmentType(value: unknown): SegmentType {
  return value === "apply"
    || value === "wait"
    || value === "wash"
    || value === "dry"
    || value === "checkin"
    || value === "checkout"
    ? value
    : "service";
}

function extractServicesCatalog(
  bootstrap: ApiObject,
  salonId: string,
): { serviceCategories: ServiceCategory[]; services: Service[] } | null {
  const fromSnapshot = extractBootstrapSnapshot(bootstrap);
  if (fromSnapshot && (Array.isArray(fromSnapshot.serviceCategories) || Array.isArray(fromSnapshot.services))) {
    return {
      serviceCategories: mapLiveServiceCategories(fromSnapshot.serviceCategories),
      services: mapLiveServices(fromSnapshot.services, salonId),
    };
  }
  const catalog = objectValue(bootstrap.servicesCatalog);
  return catalog ? mapLiveServicesCatalog({ ...catalog, salonId }, salonId) : null;
}

function mapLiveServicesCatalog(
  payload: ApiObject | undefined,
  fallbackSalonId: string,
): { serviceCategories: ServiceCategory[]; services: Service[] } {
  const salonId = stringValue(payload?.salonId) ?? fallbackSalonId;
  return {
    serviceCategories: mapLiveServiceCategories(payload?.categories ?? payload?.serviceCategories),
    services: mapLiveServices(payload?.services, salonId),
  };
}

function mapLiveServiceCategories(value: unknown): ServiceCategory[] {
  if (!Array.isArray(value)) return [];
  const categoryMap = new Map<ServiceCategoryId, ServiceCategory>();
  value.forEach((item) => {
    const row = objectValue(item);
    if (!row || row.status === "inactive" || row.status === "archived") return;
    const id = asServiceCategoryId(row.crmCategoryId ?? row.crm_category_id ?? row.id);
    if (!categoryMap.has(id)) {
      categoryMap.set(id, {
        id,
        name: stringValue(row.name) ?? id,
        accentColor: stringValue(row.accentColor ?? row.accent_color) ?? "#D7897F",
      });
    }
  });
  return Array.from(categoryMap.values());
}

function mapLiveServices(value: unknown, salonId: string): Service[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = objectValue(item) ?? {};
    return {
      id: stringValue(row.id) ?? "",
      salonId: stringValue(row.salonId ?? row.salon_id) ?? salonId,
      categoryId: asServiceCategoryId(row.crmCategoryId ?? row.crm_category_id ?? row.categoryId ?? row.category_id),
      name: stringValue(row.name) ?? "",
      defaultDurationMinutes: numberOrFallback(row.defaultDurationMinutes ?? row.default_duration_minutes, 60),
      defaultPriceCents: numberOrFallback(row.defaultPriceCents ?? row.default_price_cents, 0),
      defaultMaterialCostCents: numberOrFallback(row.defaultMaterialCostCents ?? row.default_material_cost_cents, 0),
    };
  }).filter((service) => service.id && service.name);
}

function hasInventoryPayload(snapshot?: Partial<CRMDataSnapshot>): boolean {
  return Boolean(snapshot && (
    Array.isArray(snapshot.brands)
    || Array.isArray(snapshot.productLines)
    || Array.isArray(snapshot.products)
    || Array.isArray(snapshot.inventoryItems)
  ));
}

function mapLiveInventoryPayload(snapshot: Partial<CRMDataSnapshot> | undefined, fallbackSalonId: string): InventoryPayload {
  const brands = snapshot?.brands;
  const productLines = snapshot?.productLines;
  const products = snapshot?.products;
  const inventoryItems = snapshot?.inventoryItems;
  return {
    brands: Array.isArray(brands) ? brands : [],
    productLines: Array.isArray(productLines) ? productLines : [],
    products: Array.isArray(products)
      ? products.map((product) => ({
        ...product,
        serviceCategoryId: asServiceCategoryId(product.serviceCategoryId),
      }))
      : [],
    inventoryItems: Array.isArray(inventoryItems)
      ? inventoryItems.map((item) => ({
        ...item,
        salonId: item.salonId || fallbackSalonId,
      }))
      : [],
  };
}

function emptyInventoryPayload(): InventoryPayload {
  return { brands: [], productLines: [], products: [], inventoryItems: [] };
}

function mapLiveInventoryItem(value: unknown, fallbackSalonId: string): InventoryItem {
  const row = objectValue(value) ?? {};
  const cost = numberOrFallback(row.costUsd ?? row.cost_amount, 0);
  const sell = numberOrFallback(row.sellingPriceUsd ?? row.sell_price_amount, 0);
  return {
    id: stringValue(row.id) ?? "",
    salonId: stringValue(row.salonId ?? row.salon_id) ?? fallbackSalonId,
    productId: stringValue(row.productId ?? row.product_id) ?? "",
    unitsInStock: numberOrFallback(row.unitsInStock ?? row.units_in_stock, 0),
    minStock: numberOrFallback(row.minStock ?? row.min_stock, 0),
    costUsd: cost,
    sellingPriceUsd: sell,
    marginPct: numberOrFallback(row.marginPct ?? row.margin_pct, sell > 0 ? ((sell - cost) / sell) * 100 : 0),
    barcode: stringValue(row.barcode ?? row.local_barcode_override) ?? null,
    isVisible: booleanOrFallback(row.isVisible ?? row.is_visible, true),
    updatedAt: stringValue(row.updatedAt ?? row.updated_at) ?? new Date().toISOString(),
  };
}

function toSalonProductsInventoryPatch(input: UpdateInventoryInput): ApiObject {
  return sanitizeTenantScopedPayload({
    unitsInStock: input.unitsInStock,
    minStock: input.minStock,
    costAmount: input.costUsd,
    sellPriceAmount: input.sellingPriceUsd,
    localBarcodeOverride: input.barcode,
    isVisible: input.isVisible,
  });
}

function sanitizeAuthHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const normalized = key.toLowerCase();
    if (normalized === "x-salon-id" || normalized === "salonid" || normalized === "salon_id") continue;
    sanitized[key] = value;
  }
  return sanitized;
}

function sanitizeTenantScopedPayload(input: object): ApiObject {
  const payload: ApiObject = {};
  for (const [key, value] of Object.entries(input)) {
    if (key === "salonId" || key === "salon_id" || value === undefined) continue;
    if (Array.isArray(value)) {
      payload[key] = value.map((item) => objectValue(item) ? sanitizeTenantScopedPayload(item as ApiObject) : item);
    } else if (objectValue(value)) {
      payload[key] = sanitizeTenantScopedPayload(value as ApiObject);
    } else {
      payload[key] = value;
    }
  }
  return payload;
}

function isSetupUnavailableError(err: unknown): boolean {
  if (!(err instanceof ApiCRMRepositoryHttpError)) return false;
  return err.status === 404
    || err.status === 503
    || err.code === "SCHEMA_NOT_READY"
    || err.code === "SCHEMA_UNAVAILABLE"
    || err.code === "DATABASE_NOT_CONFIGURED"
    || err.code === "DATABASE_UNAVAILABLE";
}

function customerQueryString(params?: CRMListParams): string {
  if (!params) return "";
  const { query, ...rest } = params;
  return queryString({ ...rest, q: query });
}

function inventoryQueryString(params?: CRMInventoryParams): string {
  if (!params) return "";
  return queryString({
    brandId: params.brandId,
    productLineId: params.productLineId,
    q: params.query,
    lowStock: params.stockFilter === "low-stock" ? "true" : undefined,
    page: params.page,
    limit: params.limit,
  });
}

function queryString(params?: object): string {
  if (!params) return "";
  const entries = Object.entries(params as Record<string, unknown>).filter(
    ([, v]) => v !== undefined && v !== null,
  );
  if (entries.length === 0) return "";
  const usp = new URLSearchParams();
  for (const [k, v] of entries) usp.append(k, String(v));
  return `?${usp.toString()}`;
}

/**
 * Convenience factory for tests and server-side code where the token is
 * known at call time.
 */
export function createApiCRMRepository(opts: ApiCRMRepositoryOptions): CRMRepository {
  return new ApiCRMRepository(opts);
}

/**
 * Production/pilot live repository.
 *
 * Creates an `ApiCRMRepository` wired to the same-origin Netlify backend with
 * lazily-evaluated auth headers so the current session token is always used at
 * request time. This is the repository that `SalonCRMPage` should mount for
 * all production and pilot runtime — no seed data, no localStorage business
 * state merge.
 *
 * `baseUrl` defaults to `""` (same origin). Override only in server-side or
 * cross-origin test environments.
 */
export function createLiveCRMRepository(baseUrl = ""): CRMRepository {
  return new ApiCRMRepository({
    baseUrl,
    authHeaders: () => salonAuthHeaders(),
  });
}
