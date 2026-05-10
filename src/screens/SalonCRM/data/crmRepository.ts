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
import type {
  AnalyticsPayload,
  Appointment,
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
  ProductUsage,
  Salon,
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
