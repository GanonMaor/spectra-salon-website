/**
 * Canonical CRM domain types.
 *
 * These shapes are the single source of truth for the entire Spectra CRM.
 * They are intentionally aligned with the future Spectra mobile/backend API
 * payloads: every persisted timestamp is an ISO 8601 string, every entity
 * carries an explicit `salonId` boundary, and relationships are expressed
 * by required foreign keys.
 *
 * Screens must never re-define these shapes. Selectors are responsible for
 * mapping them into UI-friendly view models.
 */

// ── Service catalog ────────────────────────────────────────────────

export type ServiceCategoryId =
  | "color"
  | "highlights"
  | "toner"
  | "straightening"
  | "cut"
  | "treatment"
  | "other";

export interface ServiceCategory {
  id: ServiceCategoryId;
  name: string;
  /** Hex token used for cards, dots, charts. */
  accentColor: string;
}

export interface Service {
  id: string;
  salonId: string;
  categoryId: ServiceCategoryId;
  name: string;
  defaultDurationMinutes: number;
  defaultPriceCents: number;
  defaultMaterialCostCents: number;
}

// ── Salon (tenant) ─────────────────────────────────────────────────

export interface Salon {
  id: string;
  name: string;
  businessName?: string;
  slug: string;
  timezone: string;
  currency: "ILS" | "USD" | "EUR" | "GBP" | "CAD" | "AUD";
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  description?: string;
  logoUrl?: string;
  whatsappPhone?: string;
  website?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  primaryContactName?: string;
  countryCode?: "IL" | "US" | "GB" | "FR" | "DE" | "CA" | "AU";
  region?: string;
  street?: string;
  streetNumber?: string;
  floor?: string;
  unit?: string;
  postalCode?: string;
  addressNotes?: string;
  latitude?: number;
  longitude?: number;
  locale?: string;
  defaultLanguage?: "he" | "en" | "fr" | "de";
  dateFormat?: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  timeFormat?: "12h" | "24h";
  weekStartsOn?: number;
  businessRegistrationNumber?: string;
  taxId?: string;
  businessType?: "sole_proprietor" | "licensed_business" | "limited_company" | "partnership" | "other";
  isTaxRegistered?: boolean;
  defaultTaxRate?: string;
  pricesIncludeTax?: boolean;
  invoicePrefix?: string;
  receiptPrefix?: string;
  status: "active" | "inactive";
  onboardingStatus: "incomplete" | "completed";
  onboardingCurrentStep?: string;
  onboardingCompletedAt?: string;
  onboardingUpdatedAt?: string;
  workingHours: SalonWorkingHours[];
}

export interface SalonWorkingHours {
  dayOfWeek: number; // 0=Sun … 6=Sat
  startHour: number;
  endHour: number;
  breakStart?: number;
  breakEnd?: number;
}

// ── Staff ──────────────────────────────────────────────────────────

export interface StaffMember {
  id: string;
  salonId: string;
  /**
   * Optional link to the login user (`CRMUser`) this staff member operates as.
   * Staff can exist without a user (e.g. an assistant who never logs in), and
   * a user can exist without staff (e.g. an accountant/owner off the calendar).
   * Unique per salon: a user maps to at most one staff member in a salon.
   */
  userId?: string;
  name: string;
  role: string;
  /**
   * Legacy single professional-role id. Superseded by `professionalRoleIds`
   * (multiple roles per staff member). Kept for backward compatibility with
   * seed data and the calendar's legacy wash-assistant heuristic.
   */
  roleId?: string;
  /**
   * Professional roles assigned to this staff member. A staff member may hold
   * several (e.g. "Colorist" + "Keratin Expert"). The role catalog defines the
   * allowed services, split-stage capabilities and default price/time; the
   * staff↔role assignment layer decides which role is primary per service.
   */
  professionalRoleIds?: string[];
  /**
   * Direct split-stage capabilities for this staff member, independent of any
   * professional role (e.g. a wash assistant that only performs `wash`). Used
   * by the calendar to place staff on the right sub-calendar. When empty, the
   * effective capabilities are derived from the assigned professional roles.
   */
  stageCapabilities?: SegmentType[];
  departmentIds?: string[];
  serviceIds?: string[];
  /**
   * Services this staff member is explicitly blocked from, regardless of any
   * professional-role permission. A manual block always wins over a role that
   * would otherwise allow the service (see `resolveServicePlan` precedence).
   */
  blockedServiceIds?: string[];
  /**
   * Per-service price overrides (cents), keyed by service id. Only services
   * with an explicit override differ from the service's `defaultPriceCents`;
   * any service id absent from this map falls back to the catalog default.
   */
  servicePriceOverrides?: Record<string, number>;
  /** Brand color used by the calendar grid and analytics charts. */
  color: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  status: "active" | "inactive";
  /**
   * Whether this staff member can be assigned appointments on the calendar.
   * Independent of `isActive`: an active member can be temporarily unbookable.
   */
  isBookable?: boolean;
  /**
   * Lifecycle flag. Archiving a staff member (isActive=false) never deletes
   * their appointments, services, or history.
   */
  isActive?: boolean;
  /** Employment window (ISO date, `YYYY-MM-DD`). */
  startDate?: string;
  endDate?: string;
  /** Display order used by the staff list and calendar columns. */
  sortOrder?: number;
  rating: number;
  /** Working hours for the day-of-week (0=Sun … 6=Sat). */
  workingHours: SalonWorkingHours[];
}

// ── Identity: login users & memberships ────────────────────────────
//
// These separate the three identity concepts the CRM tracks:
//   * `StaffMember` — who works in the salon and appears on the calendar.
//   * `CRMUser`     — who can log into the system.
//   * `Membership`  — which salon a user accesses and with which access role;
//                     it is the tenant + authority boundary.

export interface CRMUser {
  id: string;
  email?: string;
  displayName: string;
  phone?: string;
  avatarUrl?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface Membership {
  id: string;
  salonId: string;
  userId: string;
  /** Legacy coarse role kept for backward compatibility. */
  role: string;
  /**
   * Reference to the (future) access-role catalog. The RBAC permission matrix
   * is a later slice, so this is an opaque id today and may be undefined.
   */
  accessRoleId?: string;
  isDefault: boolean;
  createdAt: string;
}

// ── Professional roles & capabilities ──────────────────────────────
//
// A `ProfessionalRole` answers "what professional work can this person do?"
// (departments, allowed services, split-stage capabilities, default price/
// time). It is NOT an access role and grants no system permission. Staff link
// to professional roles through `StaffProfessionalRole` assignments; a staff
// member can hold several roles at once.

export type ProfessionalRoleStatus = "active" | "inactive" | "archived";

export interface ProfessionalRole {
  id: string;
  salonId: string;
  name: string;
  /** Departments this role operates within. */
  departmentIds: string[];
  /**
   * Services this role is allowed to perform. An empty list means the role
   * carries no explicit service allowlist (capability is then decided by the
   * staff member's own `serviceIds`).
   */
  allowedServiceIds: string[];
  /**
   * Split-stage capabilities this role can perform (e.g. `wash`, `apply`,
   * `wait`). Used by appointment assignment instead of hard-coded role ids.
   */
  stageCapabilities: SegmentType[];
  /** Default price (cents) applied when this role performs a service. */
  defaultPriceCents?: number;
  /** Default duration (minutes) applied when this role performs a service. */
  defaultDurationMinutes?: number;
  color?: string;
  icon?: string;
  sortOrder?: number;
  status: ProfessionalRoleStatus;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Join between a staff member and a professional role. Carries the per-staff
 * primacy signals that drive precedence when several roles allow the same
 * service.
 */
export interface StaffProfessionalRole {
  id: string;
  salonId: string;
  staffMemberId: string;
  professionalRoleId: string;
  /** Marks this as the staff member's default professional role. */
  isPrimary: boolean;
  /**
   * Services for which this role is explicitly the primary one for this staff
   * member. Resolves the "multiple roles allow the same service" ambiguity
   * before falling back to the role-level `isPrimary` flag.
   */
  primaryServiceIds?: string[];
  /** Per-service price overrides (cents) for this staff+role combination. */
  servicePriceOverrides?: Record<string, number>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProfessionalRoleInput {
  name: string;
  departmentIds?: string[];
  allowedServiceIds?: string[];
  stageCapabilities?: SegmentType[];
  defaultPriceCents?: number;
  defaultDurationMinutes?: number;
  color?: string;
  icon?: string;
  sortOrder?: number;
  status?: ProfessionalRoleStatus;
}

export interface UpdateProfessionalRoleInput {
  name?: string;
  departmentIds?: string[];
  allowedServiceIds?: string[];
  stageCapabilities?: SegmentType[];
  defaultPriceCents?: number | null;
  defaultDurationMinutes?: number | null;
  color?: string | null;
  icon?: string | null;
  sortOrder?: number;
  status?: ProfessionalRoleStatus;
}

// ── Customers ──────────────────────────────────────────────────────

export interface Customer {
  id: string;
  salonId: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags: string[];
  avatarUrl?: string;
  status: "active" | "inactive" | "archived";
  isVip: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Appointments ───────────────────────────────────────────────────

export type AppointmentStatus =
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show";

export type SegmentType =
  | "service"
  | "apply"
  | "wait"
  | "wash"
  | "dry"
  | "checkin"
  | "checkout";

export interface AppointmentSegment {
  id: string;
  appointmentId: string;
  staffMemberId?: string;
  resourceId?: string;
  serviceId?: string;
  serviceName?: string;
  serviceCategoryId?: ServiceCategoryId;
  segmentType: SegmentType;
  label: string;
  /** ISO 8601 timestamp. */
  startTime: string;
  /** ISO 8601 timestamp. */
  endTime: string;
  sortOrder: number;
  productGrams?: number;
  notes?: string;
}

export interface Appointment {
  id: string;
  salonId: string;
  staffMemberId: string;
  customerId?: string;
  /** Free-form fallback when a Customer record does not yet exist. */
  customerName: string;
  serviceId?: string;
  serviceName: string;
  serviceCategoryId: ServiceCategoryId;
  /** ISO 8601 timestamp. */
  startTime: string;
  /** ISO 8601 timestamp. */
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  visitId?: string;
  segments: AppointmentSegment[];
  /** Optional grouping key for split appointments. */
  groupId?: string;
}

// ── Visits ─────────────────────────────────────────────────────────

export type VisitStatus = "scheduled" | "active" | "completed" | "cancelled";

export interface Visit {
  id: string;
  salonId: string;
  customerId: string;
  /** Optional because walk-ins create visits without a prior appointment. */
  appointmentId?: string;
  /** Primary stylist assigned to the visit. */
  staffMemberId?: string;
  /** ISO 8601 timestamp. */
  startedAt: string;
  /** ISO 8601 timestamp. */
  endedAt?: string;
  status: VisitStatus;
  notes?: string;
  totalRevenueCents: number;
  totalMaterialCostCents: number;
}

export type VisitServiceStatus =
  | "scheduled"
  | "active"
  | "mix_in_progress"
  | "done"
  | "reweigh_pending";

export interface VisitService {
  id: string;
  visitId: string;
  serviceId: string;
  staffMemberId: string;
  /** Co-stylists assisting on the service. */
  assignedStaffIds: string[];
  /** ISO 8601 timestamp. */
  startedAt?: string;
  /** ISO 8601 timestamp. */
  endedAt?: string;
  status: VisitServiceStatus;
  priceCents: number;
  materialCostCents: number;
}

// ── Products & inventory ───────────────────────────────────────────

export interface Brand {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface ProductLine {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  brandId: string;
  productLineId: string;
  shadeCode: string;
  displayName?: string;
  level?: number;
  sizeGrams: number;
  /** Maps a product to a service category for analytics. */
  serviceCategoryId: ServiceCategoryId;
}

export interface InventoryItem {
  id: string;
  salonId: string;
  productId: string;
  unitsInStock: number;
  minStock: number;
  costUsd: number;
  sellingPriceUsd: number;
  marginPct: number;
  barcode?: string | null;
  isVisible: boolean;
  /** ISO 8601 timestamp. */
  updatedAt: string;
}

// ── Mix sessions, product usage, reweigh outcomes ──────────────────

export type MixSessionStatus =
  | "preparing"
  | "in_progress"
  | "complete"
  | "discarded";

export interface MixSession {
  id: string;
  visitServiceId: string;
  /** ISO 8601 timestamp. */
  startedAt: string;
  /** ISO 8601 timestamp. */
  endedAt?: string;
  expectedGrams: number;
  actualGrams?: number;
  status: MixSessionStatus;
}

export interface ProductUsage {
  id: string;
  mixSessionId: string;
  productId: string;
  inventoryItemId: string;
  grams: number;
  costAtUseUsd: number;
  /** ISO 8601 timestamp. */
  recordedAt: string;
  /**
   * Original import metadata preserved from historical mix exports.
   * These are the most reliable labels for display because they reflect
   * exactly what was recorded, independent of catalog product resolution.
   */
  sourceBrand?: string;
  sourceSeries?: string;
  sourceShade?: string;
  sourceServiceName?: string;
  /** Currency of `costAtUseUsd` for imported rows (e.g. "ILS"). */
  costCurrency?: string;
}

export type ReweighOutcomeType = "saving" | "extra-charge" | "waste";

export interface ReweighOutcome {
  id: string;
  mixSessionId: string;
  expectedGrams: number;
  actualGrams: number;
  varianceGrams: number;
  varianceValueUsd: number;
  outcome: ReweighOutcomeType;
  /** ISO 8601 timestamp. */
  recordedAt: string;
}

// ── Analytics (cached aggregates) ──────────────────────────────────

export interface MonthlyAnalyticsRow {
  /** Anchor date for the month (first of month, ISO date string). */
  monthStart: string;
  /** Display label (e.g. "Feb 2026"). Selectors keep this stable. */
  label: string;
  totalAppointments: number;
  totalRevenueCents: number;
  totalProductCostCents: number;
  totalProductUsageGrams: number;
  totalServices: number;
  /** Per service-category counts. */
  servicesByCategory: Record<ServiceCategoryId, number>;
  /** Per service-category usage grams. */
  productUsageByCategory: Record<ServiceCategoryId, number>;
  /** Per staff appointment counts (key = staffMemberId). */
  staffAppointments: Record<string, number>;
}

export interface DailyOptimizationRow {
  /** Anchor date (ISO date). */
  date: string;
  reweighSavingsCents: number;
  roundDownSavingsCents: number;
  extraChargeRevenueCents: number;
  reweighSavedGrams: number;
  roundDownSavedGrams: number;
  reweighMixes: number;
  totalMixes: number;
}

export interface AnalyticsSnapshot {
  id: string;
  salonId: string;
  /** ISO 8601 date. */
  periodStart: string;
  /** ISO 8601 date. */
  periodEnd: string;
  monthly: MonthlyAnalyticsRow[];
  daily: DailyOptimizationRow[];
}

// ── Operational system state ───────────────────────────────────────

export interface BluetoothScaleState {
  connected: boolean;
  deviceLabel: string;
  /** ISO 8601 timestamp of the last successful contact. */
  lastSeenAt?: string;
}

export interface NotificationsState {
  unreadCount: number;
  hasUrgent: boolean;
  /** ISO 8601 timestamp of the last unread item. */
  lastReceivedAt?: string;
}

export interface MarketplaceBanner {
  id: string;
  variant: "dark" | "rose" | "cream";
  eyebrow?: string;
  brandLine?: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
}

export interface CRMSystemState {
  /** ISO 8601 date used as the dashboard-wide active day. */
  activeDate: string;
  bluetooth: BluetoothScaleState;
  notifications: NotificationsState;
  /**
   * Coming-soon feature flags. Buttons that reference an unimplemented flow
   * read this map to decide between executing or showing a coming-soon hint.
   */
  comingSoonFeatures: Record<string, boolean>;
  marketplace: MarketplaceBanner[];
}

// ── Snapshot & normalized state ────────────────────────────────────

export interface CRMDataSnapshot {
  salonId: string;
  salons: Salon[];
  staff: StaffMember[];
  /**
   * Professional-role catalog for the salon (Phase B). Answers "what
   * professional work can a person do?" and grants no system access. Read-only
   * at cold-boot; the settings UI mutates it through the professional-roles API.
   */
  professionalRoles: ProfessionalRole[];
  /** Staff ↔ professional-role assignments carrying per-staff primacy signals. */
  staffProfessionalRoles: StaffProfessionalRole[];
  customers: Customer[];
  serviceCategories: ServiceCategory[];
  services: Service[];
  appointments: Appointment[];
  visits: Visit[];
  visitServices: VisitService[];
  brands: Brand[];
  productLines: ProductLine[];
  products: Product[];
  inventoryItems: InventoryItem[];
  mixSessions: MixSession[];
  productUsage: ProductUsage[];
  reweighOutcomes: ReweighOutcome[];
  analyticsSnapshots: AnalyticsSnapshot[];
  systemState: CRMSystemState;
}

export interface CRMNormalizedState {
  currentSalonId: string;
  salonsById: Record<string, Salon>;
  customersById: Record<string, Customer>;
  staffById: Record<string, StaffMember>;
  professionalRolesById: Record<string, ProfessionalRole>;
  staffProfessionalRolesById: Record<string, StaffProfessionalRole>;
  serviceCategoriesById: Record<ServiceCategoryId, ServiceCategory>;
  servicesById: Record<string, Service>;
  appointmentsById: Record<string, Appointment>;
  visitsById: Record<string, Visit>;
  visitServicesById: Record<string, VisitService>;
  brandsById: Record<string, Brand>;
  productLinesById: Record<string, ProductLine>;
  productsById: Record<string, Product>;
  inventoryById: Record<string, InventoryItem>;
  mixSessionsById: Record<string, MixSession>;
  productUsageById: Record<string, ProductUsage>;
  reweighOutcomesById: Record<string, ReweighOutcome>;
  analyticsSnapshotsById: Record<string, AnalyticsSnapshot>;
  systemState: CRMSystemState;
  /**
   * Monotonic version counter incremented on every successful state
   * mutation. Selectors can use this as a memoization key; replay,
   * action logs, and AI traces include the version before/after.
   */
  version: number;
  /** ISO 8601 timestamp of the last successful state mutation. */
  lastUpdatedAt: string;
}

// ── Selector parameter types ───────────────────────────────────────

export interface DateRange {
  /** ISO 8601 date or full timestamp. */
  from: string;
  /** ISO 8601 date or full timestamp. */
  to: string;
}

export interface AppointmentFilter {
  staffMemberId?: string | null;
  customerId?: string | null;
  status?: AppointmentStatus | AppointmentStatus[];
  serviceCategoryId?: ServiceCategoryId | ServiceCategoryId[];
}

export type StockFilter = "all" | "in-stock" | "low-stock";

export interface InventoryFilter {
  brandId?: string | null;
  productLineId?: string | null;
  stockFilter?: StockFilter;
  query?: string;
}

export interface CustomerFilter {
  status?: Customer["status"];
  tag?: string;
  query?: string;
}

// ── Repository params ──────────────────────────────────────────────

export interface CRMListParams {
  query?: string;
  status?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface CRMDateParams {
  from?: string;
  to?: string;
  staffMemberId?: string;
}

export interface CRMInventoryParams {
  brandId?: string;
  productLineId?: string;
  query?: string;
  stockFilter?: StockFilter;
  page?: number;
  limit?: number;
}

export interface InventoryPayload {
  brands: Brand[];
  productLines: ProductLine[];
  products: Product[];
  inventoryItems: InventoryItem[];
}

export interface AnalyticsPayload {
  snapshots: AnalyticsSnapshot[];
}

export interface ProfessionalRolesPayload {
  roles: ProfessionalRole[];
  assignments: StaffProfessionalRole[];
}

// ── Action input types ─────────────────────────────────────────────

export interface CreateAppointmentInput {
  staffMemberId: string;
  customerId?: string;
  customerName: string;
  serviceId?: string;
  serviceName: string;
  serviceCategoryId: ServiceCategoryId;
  startTime: string;
  endTime: string;
  notes?: string;
  status?: AppointmentStatus;
  segments?: Array<Omit<AppointmentSegment, "id" | "appointmentId">>;
}

export interface UpdateAppointmentInput {
  staffMemberId?: string;
  customerId?: string;
  customerName?: string;
  serviceId?: string;
  serviceName?: string;
  serviceCategoryId?: ServiceCategoryId;
  startTime?: string;
  endTime?: string;
  status?: AppointmentStatus;
  notes?: string;
  segments?: AppointmentSegment[];
  visitId?: string;
}

export interface CreateCustomerInput {
  firstName: string;
  lastName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags?: string[];
  isVip?: boolean;
}

export interface CreateStaffInput {
  name: string;
  role: string;
  roleId?: string;
  /** Optional link to an existing login user (unique per salon). */
  userId?: string;
  departmentIds?: string[];
  serviceIds?: string[];
  servicePriceOverrides?: Record<string, number>;
  workingHours?: SalonWorkingHours[];
  color?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  status?: StaffMember["status"];
  isBookable?: boolean;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  sortOrder?: number;
}

export interface UpdateStaffInput {
  name?: string;
  role?: string;
  roleId?: string;
  /** Set to link/relink a login user, or `null` to clear the link. */
  userId?: string | null;
  departmentIds?: string[];
  serviceIds?: string[];
  servicePriceOverrides?: Record<string, number>;
  workingHours?: SalonWorkingHours[];
  color?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  status?: StaffMember["status"];
  isBookable?: boolean;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  sortOrder?: number;
}

export interface UpdateCustomerInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  notes?: string;
  tags?: string[];
  status?: Customer["status"];
  isVip?: boolean;
}

export interface UpdateInventoryInput {
  inventoryItemId: string;
  unitsInStock?: number;
  minStock?: number;
  costUsd?: number;
  sellingPriceUsd?: number;
  marginPct?: number;
  barcode?: string | null;
  isVisible?: boolean;
}

export interface StartVisitInput {
  customerId: string;
  appointmentId?: string;
  staffMemberId?: string;
  notes?: string;
}

export interface AttachServiceToVisitInput {
  visitId: string;
  serviceId: string;
  staffMemberId: string;
  assignedStaffIds?: string[];
}

export interface SimulateMixInput {
  visitServiceId: string;
  expectedGrams?: number;
}

export interface SimulateProductUsageInput {
  mixSessionId: string;
  inventoryItemId: string;
  grams: number;
}

export interface SimulateReweighInput {
  mixSessionId: string;
  expectedGrams: number;
  actualGrams: number;
}
