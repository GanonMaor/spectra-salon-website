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
  currency: "ILS" | "USD" | "EUR";
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
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
  name: string;
  role: string;
  roleId?: string;
  departmentIds?: string[];
  serviceIds?: string[];
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
  rating: number;
  /** Working hours for the day-of-week (0=Sun … 6=Sat). */
  workingHours: SalonWorkingHours[];
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
  departmentIds?: string[];
  serviceIds?: string[];
  servicePriceOverrides?: Record<string, number>;
  workingHours?: SalonWorkingHours[];
  color?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  status?: StaffMember["status"];
}

export interface UpdateStaffInput {
  name?: string;
  role?: string;
  roleId?: string;
  departmentIds?: string[];
  serviceIds?: string[];
  servicePriceOverrides?: Record<string, number>;
  workingHours?: SalonWorkingHours[];
  color?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  status?: StaffMember["status"];
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
