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
import { canCallSalonRuntimeApi, handleSalonAuthFailure } from "./salonSession";
import type {
  AnalyticsPayload,
  Appointment,
  Brand,
  CreateAppointmentInput,
  CreateCustomerInput,
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
  Service,
  ServiceCategory,
  ServiceCategoryId,
  StaffMember,
  UpdateAppointmentInput,
  UpdateCustomerInput,
  UpdateInventoryInput,
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
  persistedStatePolicy?: "merge-all" | "exclude-inventory";

  /** GET /crm/snapshot — load every entity at once for cold-boot. */
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
  deleteAppointment(id: string): Promise<{ id: string }>;

  /** POST /crm/customers */
  createCustomer(input: CreateCustomerInput): Promise<Customer>;

  /** PATCH /crm/customers/:id */
  updateCustomer(id: string, input: UpdateCustomerInput): Promise<Customer>;

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

  async deleteAppointment(): Promise<{ id: string }> {
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

export interface SalonProductsCRMRepositoryOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  fallbackRepository?: CRMRepository;
  /** Builds auth headers (bearer only — never a salon id). */
  authHeaders?: () => Record<string, string>;
}

export class SalonProductsCRMRepository implements CRMRepository {
  persistedStatePolicy: CRMRepository["persistedStatePolicy"] = "exclude-inventory";

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
    const snapshot = await this.fallbackRepository.loadSnapshot();
    try {
      const [inventory, servicesResp] = await Promise.all([
        this.getInventory(),
        this.requestFunction<CrmServicesApiResponse>("crm-services", "").catch((err: unknown) => {
          console.warn("[CRMRepository] crm-services unavailable; keeping seed services", err);
          return null;
        }),
      ]);
      const inventoryIds = new Set(inventory.inventoryItems.map((item) => item.id));
      const productIds = new Set(inventory.products.map((product) => product.id));
      const servicesCatalog = servicesResp ? mapCrmServices(servicesResp, snapshot) : null;
      return {
        ...snapshot,
        salonId: servicesResp?.salonId ?? snapshot.salonId,
        brands: inventory.brands,
        productLines: inventory.productLines,
        products: inventory.products,
        inventoryItems: inventory.inventoryItems,
        serviceCategories: servicesCatalog?.serviceCategories ?? snapshot.serviceCategories,
        services: servicesCatalog?.services ?? snapshot.services,
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
      salonId: DEFAULT_CRM_SEED.salonId,
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

export function createSalonProductsCRMRepository(
  opts: SalonProductsCRMRepositoryOptions = {},
): CRMRepository {
  return new SalonProductsCRMRepository(opts);
}

// ── HTTP adapter scaffold ─────────────────────────────────────────

export interface ApiCRMRepositoryOptions {
  /** Base URL for the Spectra mobile/backend API, e.g. `https://api.spectra.com`. */
  baseUrl: string;
  /** Bearer token for the salon-scoped session. */
  token: string;
  /** Optional fetch override for tests / SSR. */
  fetchImpl?: typeof fetch;
}

/**
 * HTTP-backed repository scaffold.
 *
 * Mirrors the routes called out in the architecture plan (`GET /crm/...`,
 * `POST /crm/appointments`, `PATCH /crm/inventory/:id`, etc.). This class is
 * intentionally thin: each method does a single fetch and returns the parsed
 * payload typed against `CRMRepository`. The `CRMDataProvider` accepts any
 * `CRMRepository` so swapping from `seedCRMRepository` to an instance of
 * this class is a one-line change once the backend is live.
 *
 * Until then, `loadSnapshot()` is the only path screens hit at cold-boot;
 * mutations continue to flow through `crmActions` against the in-memory
 * normalized state. When the API is wired, the provider will dispatch
 * action effects to the repository as well.
 */
export class ApiCRMRepository implements CRMRepository {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ApiCRMRepositoryOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.token = options.token;
    this.fetchImpl = options.fetchImpl ?? fetch;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await this.fetchImpl(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${this.token}`,
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`[CRMRepository] ${res.status} ${res.statusText} ${text}`);
    }
    return (await res.json()) as T;
  }

  loadSnapshot() { return this.request<CRMDataSnapshot>("/crm/snapshot"); }
  getSalon() { return this.request<Salon>("/crm/salon"); }
  getCustomers(p?: CRMListParams) { return this.request<Customer[]>(`/crm/customers${queryString(p)}`); }
  getCustomer(id: string) { return this.request<Customer | null>(`/crm/customers/${id}`); }
  getAppointments(p?: CRMDateParams) { return this.request<Appointment[]>(`/crm/appointments${queryString(p)}`); }
  getStaff() { return this.request<StaffMember[]>("/crm/staff"); }
  getInventory(p?: CRMInventoryParams) { return this.request<InventoryPayload>(`/crm/inventory${queryString(p)}`); }
  getAnalytics(p?: CRMDateParams) { return this.request<AnalyticsPayload>(`/crm/analytics${queryString(p)}`); }
  getLiveVisits(p?: CRMDateParams) { return this.request<Visit[]>(`/spectra/live-visits${queryString(p)}`); }
  getProductUsage(p?: CRMDateParams) { return this.request<ProductUsage[]>(`/spectra/product-usage${queryString(p)}`); }
  getMixSessions(p?: CRMDateParams) { return this.request<MixSession[]>(`/spectra/mix-sessions${queryString(p)}`); }

  createAppointment(input: CreateAppointmentInput) {
    return this.request<Appointment>("/crm/appointments", { method: "POST", body: JSON.stringify(input) });
  }
  updateAppointment(id: string, input: UpdateAppointmentInput) {
    return this.request<Appointment>(`/crm/appointments/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  }
  deleteAppointment(id: string) {
    return this.request<{ id: string }>(`/crm/appointments/${id}`, { method: "DELETE" });
  }
  createCustomer(input: CreateCustomerInput) {
    return this.request<Customer>("/crm/customers", { method: "POST", body: JSON.stringify(input) });
  }
  updateCustomer(id: string, input: UpdateCustomerInput) {
    return this.request<Customer>(`/crm/customers/${id}`, { method: "PATCH", body: JSON.stringify(input) });
  }
  updateInventory(input: UpdateInventoryInput) {
    return this.request<InventoryItem>(`/crm/inventory/${input.inventoryItemId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  }
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
 * Convenience factory used by the future bootstrap path. The provider
 * still imports `seedCRMRepository` by default so swapping is intentional.
 */
export function createApiCRMRepository(opts: ApiCRMRepositoryOptions): CRMRepository {
  return new ApiCRMRepository(opts);
}
