/**
 * CRM selectors — pure, memoizable, UI-agnostic.
 *
 * Selectors take the normalized CRM state and derive the view models
 * consumed by hooks. They never mutate state, never call hooks, and never
 * depend on UI primitives. The same selector output is reused across
 * every screen so Home, Schedule, Customers, Inventory, Staff and
 * Analytics see the identical truth.
 */

import type {
  AnalyticsSnapshot,
  Appointment,
  Brand,
  CRMNormalizedState,
  Customer,
  DateRange,
  InventoryItem,
  MixSession,
  ProductLine,
  Product,
  ProductUsage,
  ReweighOutcome,
  Service,
  ServiceCategory,
  ServiceCategoryId,
  StaffMember,
  Visit,
  VisitService,
  VisitServiceStatus,
} from "./crmTypes";

// ── Generic helpers ───────────────────────────────────────────────

export function values<T>(map: Record<string, T>): T[] {
  return Object.values(map);
}

function toDateOnly(iso: string): string {
  return iso.length >= 10 ? iso.slice(0, 10) : iso;
}

function isWithinRange(timestamp: string, range: DateRange): boolean {
  const ts = new Date(timestamp).getTime();
  const from = new Date(range.from.length === 10 ? `${range.from}T00:00:00.000Z` : range.from).getTime();
  const to = new Date(range.to.length === 10 ? `${range.to}T23:59:59.999Z` : range.to).getTime();
  return ts >= from && ts <= to;
}

// ── Salon / staff / customers ────────────────────────────────────

export function selectCurrentSalon(state: CRMNormalizedState) {
  return state.salonsById[state.currentSalonId];
}

export function selectStaff(state: CRMNormalizedState): StaffMember[] {
  return values(state.staffById);
}

export function selectStaffById(state: CRMNormalizedState, id: string): StaffMember | undefined {
  return state.staffById[id];
}

export function selectCustomers(state: CRMNormalizedState): Customer[] {
  return values(state.customersById);
}

export function selectCustomerById(state: CRMNormalizedState, id: string): Customer | undefined {
  return state.customersById[id];
}

// ── Service catalog ──────────────────────────────────────────────

export function selectServices(state: CRMNormalizedState): Service[] {
  return values(state.servicesById);
}

export function selectServiceCategories(state: CRMNormalizedState): ServiceCategory[] {
  return values(state.serviceCategoriesById);
}

export function selectServiceCategoryById(
  state: CRMNormalizedState,
  id: ServiceCategoryId,
): ServiceCategory | undefined {
  return state.serviceCategoriesById[id];
}

// ── Appointments ─────────────────────────────────────────────────

export function selectAllAppointments(state: CRMNormalizedState): Appointment[] {
  return values(state.appointmentsById);
}

export function selectAppointmentById(
  state: CRMNormalizedState,
  id: string,
): Appointment | undefined {
  return state.appointmentsById[id];
}

export interface AppointmentsByDateOptions {
  date: string; // ISO date (YYYY-MM-DD) or full ISO timestamp
  staffMemberId?: string | null;
  customerId?: string | null;
  excludeStatuses?: Appointment["status"][];
}

export function selectAppointmentsByDate(
  state: CRMNormalizedState,
  opts: AppointmentsByDateOptions,
): Appointment[] {
  const day = toDateOnly(opts.date);
  const exclude = new Set(opts.excludeStatuses ?? []);
  return selectAllAppointments(state).filter((a) => {
    if (toDateOnly(a.startTime) !== day) return false;
    if (opts.staffMemberId && a.staffMemberId !== opts.staffMemberId) return false;
    if (opts.customerId && a.customerId !== opts.customerId) return false;
    if (exclude.has(a.status)) return false;
    return true;
  });
}

export function selectAppointmentsInRange(
  state: CRMNormalizedState,
  range: DateRange,
  filter?: { staffMemberId?: string | null; status?: Appointment["status"][] },
): Appointment[] {
  const allowed = filter?.status ? new Set(filter.status) : null;
  return selectAllAppointments(state).filter((a) => {
    if (!isWithinRange(a.startTime, range)) return false;
    if (filter?.staffMemberId && a.staffMemberId !== filter.staffMemberId) return false;
    if (allowed && !allowed.has(a.status)) return false;
    return true;
  });
}

export interface AppointmentWithCustomer extends Appointment {
  customer?: Customer;
  staff?: StaffMember;
  category?: ServiceCategory;
}

export function selectAppointmentsWithCustomers(
  state: CRMNormalizedState,
  filter?: AppointmentsByDateOptions,
): AppointmentWithCustomer[] {
  const list = filter
    ? selectAppointmentsByDate(state, filter)
    : selectAllAppointments(state);
  return list.map((a) => ({
    ...a,
    customer: a.customerId ? state.customersById[a.customerId] : undefined,
    staff: state.staffById[a.staffMemberId],
    category: state.serviceCategoriesById[a.serviceCategoryId],
  }));
}

// ── Visits ───────────────────────────────────────────────────────

export function selectAllVisits(state: CRMNormalizedState): Visit[] {
  return values(state.visitsById);
}

export function selectVisitsByDate(
  state: CRMNormalizedState,
  date: string,
): Visit[] {
  const day = toDateOnly(date);
  return selectAllVisits(state).filter((v) => toDateOnly(v.startedAt) === day);
}

export function selectActiveVisits(state: CRMNormalizedState): Visit[] {
  return selectAllVisits(state).filter((v) => v.status === "active");
}

// ── Live clients (visit + customer + active services) ─────────────

export interface LiveServiceVm {
  id: string;
  serviceId: string;
  service?: Service;
  category?: ServiceCategory;
  status: VisitServiceStatus;
  startedAt?: string;
  elapsedMs: number;
  staff: StaffMember[];
  hasOpenMix: boolean;
  mixSessionId?: string;
}

export interface LiveClientVm {
  id: string;
  visitId: string;
  customerId: string;
  customer?: Customer;
  arrivalIso: string;
  isVip: boolean;
  services: LiveServiceVm[];
}

export function selectLiveClients(
  state: CRMNormalizedState,
  reference: number = Date.now(),
): LiveClientVm[] {
  const visits = selectActiveVisits(state);
  const visitServices = values(state.visitServicesById);
  const mixSessions = values(state.mixSessionsById);

  return visits.map((visit) => {
    const services = visitServices
      .filter((vs) => vs.visitId === visit.id)
      .map<LiveServiceVm>((vs) => {
        const startTs = vs.startedAt ? new Date(vs.startedAt).getTime() : reference;
        const openMix = mixSessions.find(
          (m) => m.visitServiceId === vs.id && m.status !== "complete" && m.status !== "discarded",
        );
        const staff = vs.assignedStaffIds
          .map((id) => state.staffById[id])
          .filter(Boolean) as StaffMember[];
        const service = state.servicesById[vs.serviceId];
        return {
          id: vs.id,
          serviceId: vs.serviceId,
          service,
          category: service ? state.serviceCategoriesById[service.categoryId] : undefined,
          status: vs.status,
          startedAt: vs.startedAt,
          elapsedMs: Math.max(0, reference - startTs),
          staff,
          hasOpenMix: Boolean(openMix),
          mixSessionId: openMix?.id,
        };
      });

    const customer = state.customersById[visit.customerId];
    return {
      id: visit.id,
      visitId: visit.id,
      customerId: visit.customerId,
      customer,
      arrivalIso: visit.startedAt,
      isVip: customer?.isVip ?? false,
      services,
    };
  });
}

export function selectLiveClientsWithServices(
  state: CRMNormalizedState,
): LiveClientVm[] {
  return selectLiveClients(state);
}

// ── Customer aggregates ──────────────────────────────────────────

export interface CustomerStats {
  customerId: string;
  totalVisits: number;
  totalSpentCents: number;
  lastVisitIso?: string;
  firstVisitIso?: string;
  isVip: boolean;
}

export function selectCustomerVisitStats(
  state: CRMNormalizedState,
): Record<string, CustomerStats> {
  const stats: Record<string, CustomerStats> = {};

  for (const customer of values(state.customersById)) {
    stats[customer.id] = {
      customerId: customer.id,
      totalVisits: 0,
      totalSpentCents: 0,
      isVip: customer.isVip,
    };
  }

  // Count completed appointments as historical visits to keep the demo
  // populated even though the in-memory `visits` table only tracks live
  // visits.
  for (const appt of selectAllAppointments(state)) {
    if (!appt.customerId) continue;
    const stat = stats[appt.customerId];
    if (!stat) continue;
    if (appt.status === "completed") {
      stat.totalVisits += 1;
      const service = appt.serviceId ? state.servicesById[appt.serviceId] : undefined;
      if (service) stat.totalSpentCents += service.defaultPriceCents;
      if (!stat.lastVisitIso || appt.endTime > stat.lastVisitIso) {
        stat.lastVisitIso = appt.endTime;
      }
      if (!stat.firstVisitIso || appt.startTime < stat.firstVisitIso) {
        stat.firstVisitIso = appt.startTime;
      }
    }
  }

  for (const visit of selectAllVisits(state)) {
    const stat = stats[visit.customerId];
    if (!stat) continue;
    stat.totalVisits += 1;
    stat.totalSpentCents += visit.totalRevenueCents;
    if (!stat.lastVisitIso || visit.startedAt > stat.lastVisitIso) {
      stat.lastVisitIso = visit.startedAt;
    }
    if (!stat.firstVisitIso || visit.startedAt < stat.firstVisitIso) {
      stat.firstVisitIso = visit.startedAt;
    }
  }

  return stats;
}

export function selectCustomerLifetimeValue(
  state: CRMNormalizedState,
  customerId: string,
): { totalCents: number; visits: number; lastVisitIso?: string } {
  const stats = selectCustomerVisitStats(state)[customerId];
  if (!stats) return { totalCents: 0, visits: 0 };
  return {
    totalCents: stats.totalSpentCents,
    visits: stats.totalVisits,
    lastVisitIso: stats.lastVisitIso,
  };
}

export function selectCustomerVisits(
  state: CRMNormalizedState,
  customerId: string,
): Array<{
  id: string;
  visitDateIso: string;
  serviceName?: string;
  serviceCategoryId?: ServiceCategoryId;
  staffName?: string;
  durationMinutes?: number;
  priceCents?: number;
  notes?: string;
  isCompleted: boolean;
}> {
  const result: Array<ReturnType<typeof toEntry> | null> = [];

  function toEntry(
    id: string,
    iso: string,
    serviceName: string | undefined,
    categoryId: ServiceCategoryId | undefined,
    staffId: string | undefined,
    durationMinutes: number | undefined,
    priceCents: number | undefined,
    notes: string | undefined,
    isCompleted: boolean,
  ) {
    return {
      id,
      visitDateIso: iso,
      serviceName,
      serviceCategoryId: categoryId,
      staffName: staffId ? state.staffById[staffId]?.name : undefined,
      durationMinutes,
      priceCents,
      notes,
      isCompleted,
    };
  }

  for (const appt of selectAllAppointments(state)) {
    if (appt.customerId !== customerId) continue;
    const service = appt.serviceId ? state.servicesById[appt.serviceId] : undefined;
    const durationMin = Math.round(
      (new Date(appt.endTime).getTime() - new Date(appt.startTime).getTime()) / 60000,
    );
    result.push(
      toEntry(
        appt.id,
        appt.startTime,
        appt.serviceName,
        appt.serviceCategoryId,
        appt.staffMemberId,
        durationMin,
        service?.defaultPriceCents,
        appt.notes,
        appt.status === "completed",
      ),
    );
  }

  return result
    .filter((x): x is ReturnType<typeof toEntry> => x !== null)
    .sort((a, b) => (a.visitDateIso < b.visitDateIso ? 1 : -1));
}

export function selectCustomerSearch(
  state: CRMNormalizedState,
  query: string,
  limit: number = 50,
): Customer[] {
  const q = query.trim().toLowerCase();
  const all = selectCustomers(state);
  if (!q) return all.slice(0, limit);
  return all
    .filter((c) =>
      `${c.firstName} ${c.lastName ?? ""} ${c.phone ?? ""} ${c.email ?? ""}`
        .toLowerCase()
        .includes(q),
    )
    .slice(0, limit);
}

// ── Inventory ────────────────────────────────────────────────────

export function selectBrands(state: CRMNormalizedState): Brand[] {
  return values(state.brandsById).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function selectProductLines(state: CRMNormalizedState): ProductLine[] {
  return values(state.productLinesById).sort((a, b) => a.sortOrder - b.sortOrder);
}

export function selectProducts(state: CRMNormalizedState): Product[] {
  return values(state.productsById);
}

export function selectInventoryItems(state: CRMNormalizedState): InventoryItem[] {
  return values(state.inventoryById);
}

export interface InventoryByBrand {
  brand: Brand;
  lines: Array<{
    line: ProductLine;
    items: Array<{
      inventory: InventoryItem;
      product: Product;
    }>;
  }>;
}

export function selectInventoryByBrand(state: CRMNormalizedState): InventoryByBrand[] {
  const brands = selectBrands(state);
  const lines = selectProductLines(state);
  const inventory = selectInventoryItems(state);

  return brands.map((brand) => ({
    brand,
    lines: lines
      .filter((line) => line.brandId === brand.id)
      .map((line) => ({
        line,
        items: inventory
          .map((inv) => {
            const product = state.productsById[inv.productId];
            if (!product || product.brandId !== brand.id) return null;
            if (product.productLineId !== line.id) return null;
            return { inventory: inv, product };
          })
          .filter(Boolean) as Array<{ inventory: InventoryItem; product: Product }>,
      })),
  }));
}

export interface InventoryJoin {
  inventory: InventoryItem;
  product: Product;
  brand?: Brand;
  line?: ProductLine;
}

/**
 * Pre-joined inventory rows. Adapters at the view boundary should
 * consume these instead of doing the brand/line/product lookups
 * themselves.
 */
export function selectInventoryRows(state: CRMNormalizedState): InventoryJoin[] {
  const out: InventoryJoin[] = [];
  for (const inv of selectInventoryItems(state)) {
    const product = state.productsById[inv.productId];
    if (!product) continue;
    const brand = state.brandsById[product.brandId];
    const line = state.productLinesById[product.productLineId];
    out.push({ inventory: inv, product, brand, line });
  }
  return out;
}

export function selectLowStockItems(
  state: CRMNormalizedState,
): Array<{ inventory: InventoryItem; product: Product }> {
  const products = state.productsById;
  return selectInventoryItems(state)
    .filter((inv) => inv.unitsInStock <= inv.minStock)
    .map((inv) => ({ inventory: inv, product: products[inv.productId] }))
    .filter((x): x is { inventory: InventoryItem; product: Product } => Boolean(x.product));
}

export function selectInventoryHealthScore(state: CRMNormalizedState): number {
  const items = selectInventoryItems(state);
  if (items.length === 0) return 100;
  const lowCount = items.filter((i) => i.unitsInStock <= i.minStock).length;
  return Math.round(((items.length - lowCount) / items.length) * 100);
}

// ── Mix sessions / product usage / reweigh ───────────────────────

export function selectMixSessions(state: CRMNormalizedState): MixSession[] {
  return values(state.mixSessionsById);
}

export function selectProductUsage(state: CRMNormalizedState): ProductUsage[] {
  return values(state.productUsageById);
}

export function selectReweighOutcomes(state: CRMNormalizedState): ReweighOutcome[] {
  return values(state.reweighOutcomesById);
}

export function selectMixUsagePerVisit(
  state: CRMNormalizedState,
): Record<string, { grams: number; costUsd: number }> {
  const out: Record<string, { grams: number; costUsd: number }> = {};
  const visitServices = values(state.visitServicesById);
  const mixById = state.mixSessionsById;
  for (const usage of selectProductUsage(state)) {
    const mix = mixById[usage.mixSessionId];
    if (!mix) continue;
    const vs = visitServices.find((v) => v.id === mix.visitServiceId);
    if (!vs) continue;
    const bucket = out[vs.visitId] ?? { grams: 0, costUsd: 0 };
    bucket.grams += usage.grams;
    bucket.costUsd += usage.costAtUseUsd;
    out[vs.visitId] = bucket;
  }
  return out;
}

export function selectReweighEfficiency(state: CRMNormalizedState): {
  totalMixes: number;
  reweighedMixes: number;
  reweighPct: number;
  savingsUsd: number;
  wasteUsd: number;
} {
  const mixes = selectMixSessions(state);
  const outcomes = selectReweighOutcomes(state);
  const reweighedIds = new Set(outcomes.map((o) => o.mixSessionId));
  const savingsUsd = outcomes
    .filter((o) => o.outcome === "saving")
    .reduce((s, o) => s + o.varianceValueUsd, 0);
  const wasteUsd = outcomes
    .filter((o) => o.outcome === "waste")
    .reduce((s, o) => s + o.varianceValueUsd, 0);
  return {
    totalMixes: mixes.length,
    reweighedMixes: reweighedIds.size,
    reweighPct: mixes.length === 0 ? 0 : Math.round((reweighedIds.size / mixes.length) * 100),
    savingsUsd,
    wasteUsd,
  };
}

// ── Analytics aggregates ─────────────────────────────────────────

export function selectAnalyticsSnapshots(state: CRMNormalizedState): AnalyticsSnapshot[] {
  return values(state.analyticsSnapshotsById);
}

export function selectPrimaryAnalytics(state: CRMNormalizedState): AnalyticsSnapshot | undefined {
  return selectAnalyticsSnapshots(state)[0];
}

export interface AnalyticsRangeSummary {
  label: string;
  totalAppointments: number;
  totalRevenueCents: number;
  totalProductCostCents: number;
  totalProductUsageGrams: number;
  totalServices: number;
  servicesByCategory: Record<ServiceCategoryId, number>;
  productUsageByCategory: Record<ServiceCategoryId, number>;
  staffAppointments: Record<string, number>;
  daysCount: number;
  reweighSavingsCents: number;
  roundDownSavingsCents: number;
  extraChargeRevenueCents: number;
  reweighSavedGrams: number;
  roundDownSavedGrams: number;
  reweighMixes: number;
  totalMixes: number;
  reweighPct: number;
  monthlyRows: ReturnType<typeof toMonthlyRow>[];
  optimizationDailyRows: AnalyticsSnapshot["daily"];
}

function toMonthlyRow(r: AnalyticsSnapshot["monthly"][number]) {
  return r;
}

function emptyCategoryMap(): Record<ServiceCategoryId, number> {
  return {
    color: 0,
    highlights: 0,
    toner: 0,
    straightening: 0,
    cut: 0,
    treatment: 0,
    other: 0,
  };
}

export function selectAnalyticsRange(
  state: CRMNormalizedState,
  range: DateRange,
): AnalyticsRangeSummary {
  const snap = selectPrimaryAnalytics(state);
  if (!snap) {
    return {
      label: "",
      totalAppointments: 0,
      totalRevenueCents: 0,
      totalProductCostCents: 0,
      totalProductUsageGrams: 0,
      totalServices: 0,
      servicesByCategory: emptyCategoryMap(),
      productUsageByCategory: emptyCategoryMap(),
      staffAppointments: {},
      daysCount: 0,
      reweighSavingsCents: 0,
      roundDownSavingsCents: 0,
      extraChargeRevenueCents: 0,
      reweighSavedGrams: 0,
      roundDownSavedGrams: 0,
      reweighMixes: 0,
      totalMixes: 0,
      reweighPct: 0,
      monthlyRows: [],
      optimizationDailyRows: [],
    };
  }

  const fromDate = toDateOnly(range.from);
  const toDate = toDateOnly(range.to);

  const monthly = snap.monthly.filter((row) => {
    const monthEnd = nextMonthIso(row.monthStart);
    return row.monthStart <= toDate && monthEnd >= fromDate;
  });
  const daily = snap.daily.filter((row) => row.date >= fromDate && row.date <= toDate);

  const servicesByCategory = emptyCategoryMap();
  const productUsageByCategory = emptyCategoryMap();
  const staffAppointments: Record<string, number> = {};
  let totalAppointments = 0;
  let totalRevenueCents = 0;
  let totalProductCostCents = 0;
  let totalProductUsageGrams = 0;
  let totalServices = 0;

  for (const row of monthly) {
    totalAppointments += row.totalAppointments;
    totalRevenueCents += row.totalRevenueCents;
    totalProductCostCents += row.totalProductCostCents;
    totalProductUsageGrams += row.totalProductUsageGrams;
    totalServices += row.totalServices;
    for (const cat of Object.keys(row.servicesByCategory) as ServiceCategoryId[]) {
      servicesByCategory[cat] += row.servicesByCategory[cat] ?? 0;
      productUsageByCategory[cat] += row.productUsageByCategory[cat] ?? 0;
    }
    for (const [staffId, count] of Object.entries(row.staffAppointments)) {
      staffAppointments[staffId] = (staffAppointments[staffId] ?? 0) + count;
    }
  }

  let reweighSavingsCents = 0;
  let roundDownSavingsCents = 0;
  let extraChargeRevenueCents = 0;
  let reweighSavedGrams = 0;
  let roundDownSavedGrams = 0;
  let reweighMixes = 0;
  let totalMixes = 0;

  for (const row of daily) {
    reweighSavingsCents += row.reweighSavingsCents;
    roundDownSavingsCents += row.roundDownSavingsCents;
    extraChargeRevenueCents += row.extraChargeRevenueCents;
    reweighSavedGrams += row.reweighSavedGrams;
    roundDownSavedGrams += row.roundDownSavedGrams;
    reweighMixes += row.reweighMixes;
    totalMixes += row.totalMixes;
  }

  return {
    label: monthly.length === 12 ? "Last 12 months" : `${monthly.length} month${monthly.length !== 1 ? "s" : ""}`,
    totalAppointments,
    totalRevenueCents,
    totalProductCostCents,
    totalProductUsageGrams,
    totalServices,
    servicesByCategory,
    productUsageByCategory,
    staffAppointments,
    daysCount: daily.length,
    reweighSavingsCents,
    roundDownSavingsCents,
    extraChargeRevenueCents,
    reweighSavedGrams,
    roundDownSavedGrams,
    reweighMixes,
    totalMixes,
    reweighPct: totalMixes === 0 ? 0 : Math.round((reweighMixes / totalMixes) * 100),
    monthlyRows: monthly.map(toMonthlyRow),
    optimizationDailyRows: daily,
  };
}

function nextMonthIso(monthStart: string): string {
  const d = new Date(monthStart + (monthStart.length === 10 ? "T00:00:00.000Z" : ""));
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString().slice(0, 10);
}

// ── Revenue / staff performance ──────────────────────────────────

export function selectRevenuePerService(state: CRMNormalizedState): Array<{
  service: Service;
  category: ServiceCategory | undefined;
  totalPerformed: number;
  totalRevenueCents: number;
  totalMaterialCostCents: number;
}> {
  const services = selectServices(state);
  const counts = new Map<string, number>();
  for (const appt of selectAllAppointments(state)) {
    if (appt.status !== "completed" && appt.status !== "in-progress") continue;
    if (!appt.serviceId) continue;
    counts.set(appt.serviceId, (counts.get(appt.serviceId) ?? 0) + 1);
  }
  return services.map((s) => {
    const totalPerformed = counts.get(s.id) ?? 0;
    return {
      service: s,
      category: state.serviceCategoriesById[s.categoryId],
      totalPerformed,
      totalRevenueCents: totalPerformed * s.defaultPriceCents,
      totalMaterialCostCents: totalPerformed * s.defaultMaterialCostCents,
    };
  });
}

export interface StaffPerformanceVm {
  staff: StaffMember;
  appointments: number;
  completed: number;
  inProgress: number;
  upcoming: number;
  revenueCents: number;
  utilizationPct: number;
  rating: number;
}

export function selectStaffPerformance(
  state: CRMNormalizedState,
  range?: DateRange,
): StaffPerformanceVm[] {
  const staff = selectStaff(state);
  const appts = range
    ? selectAppointmentsInRange(state, range)
    : selectAllAppointments(state);

  const totalSlotsPerDay = 9; // 9–18 = 9 working hours per stylist per day
  const dayCount = computeUniqueDates(appts);

  return staff.map((member) => {
    const owned = appts.filter((a) => a.staffMemberId === member.id);
    const completed = owned.filter((a) => a.status === "completed");
    const inProgress = owned.filter((a) => a.status === "in-progress");
    const upcoming = owned.filter((a) => a.status === "confirmed");
    const revenueCents = owned
      .filter((a) => a.status === "completed" || a.status === "in-progress")
      .reduce((sum, a) => {
        const svc = a.serviceId ? state.servicesById[a.serviceId] : undefined;
        return sum + (svc?.defaultPriceCents ?? 0);
      }, 0);
    const ownedHours = owned.reduce((sum, a) => {
      return sum + (new Date(a.endTime).getTime() - new Date(a.startTime).getTime()) / 3600000;
    }, 0);
    const denom = Math.max(1, dayCount * totalSlotsPerDay);
    const utilizationPct = Math.min(100, Math.round((ownedHours / denom) * 100));
    return {
      staff: member,
      appointments: owned.length,
      completed: completed.length,
      inProgress: inProgress.length,
      upcoming: upcoming.length,
      revenueCents,
      utilizationPct,
      rating: member.rating,
    };
  });
}

function computeUniqueDates(appts: Appointment[]): number {
  const set = new Set<string>();
  for (const a of appts) set.add(toDateOnly(a.startTime));
  return Math.max(1, set.size);
}

// ── System state ─────────────────────────────────────────────────

export function selectSystemState(state: CRMNormalizedState) {
  return state.systemState;
}

export function selectComingSoonFeature(state: CRMNormalizedState, key: string): boolean {
  return Boolean(state.systemState.comingSoonFeatures[key]);
}

export function selectMarketplaceBanners(state: CRMNormalizedState) {
  return state.systemState.marketplace;
}

// ── AI insights (data-derived passive intelligence) ───────────────

export type AIInsightType = "inventory" | "performance" | "revenue" | "mix";
export type AIInsightSeverity = "low" | "medium" | "high";

export interface AIInsightCta {
  label: string;
  actionKey: string;
  payload?: Record<string, unknown>;
}

/**
 * Canonical insight produced from the normalized CRM state.
 *
 * Severity is collapsed to a tri-level scale (low/medium/high) so the
 * UI carousel and Alice can both reason about urgency consistently.
 * `type` is the product taxonomy used for context-aware prioritization
 * on the Home dashboard.
 */
export interface AIInsight {
  id: string;
  type: AIInsightType;
  severity: AIInsightSeverity;
  title: string;
  description: string;
  ctaPrimary?: AIInsightCta;
  ctaSecondary?: AIInsightCta;
}

const MAX_INSIGHTS = 6;

const SEVERITY_RANK: Record<AIInsightSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const TYPE_TIE_BREAK: Record<AIInsightType, number> = {
  inventory: 0,
  mix: 1,
  performance: 2,
  revenue: 3,
};

/**
 * Generate up to 6 canonical insights from the current CRM state.
 *
 * The selector ranks candidates by severity then by type priority so
 * the order is deterministic, but final display ordering happens in
 * the Home-facing prioritization helper.
 */
export function selectAIInsights(state: CRMNormalizedState): AIInsight[] {
  const candidates: AIInsight[] = [];

  // ── Inventory ────────────────────────────────────────────────
  for (const item of selectLowStockItems(state)) {
    const stock = item.inventory.unitsInStock;
    const min = item.inventory.minStock;
    const severity: AIInsightSeverity = stock === 0
      ? "high"
      : stock <= Math.max(1, Math.floor(min / 2))
        ? "high"
        : "medium";
    const productLabel = item.product.displayName ?? item.product.shadeCode;
    candidates.push({
      id: `low-stock-${item.inventory.id}`,
      type: "inventory",
      severity,
      title: stock === 0
        ? `Out of stock — ${productLabel}`
        : `Low stock — ${productLabel}`,
      description: stock === 0
        ? `0 units left. Reorder before the next color appointment.`
        : `${stock} units left (min ${min}). At current pace this runs out soon.`,
      ctaPrimary: {
        label: "Reorder",
        actionKey: "inventory.reorder",
        payload: { inventoryId: item.inventory.id },
      },
      ctaSecondary: {
        label: "View inventory",
        actionKey: "inventory.viewLowStock",
      },
    });
  }

  // Inventory health — if many items are healthy but a few are low,
  // surface the score as a low-severity heads-up.
  const healthScore = selectInventoryHealthScore(state);
  if (healthScore < 70 && candidates.every((c) => c.type !== "inventory")) {
    candidates.push({
      id: "inventory-health-low",
      type: "inventory",
      severity: healthScore < 40 ? "high" : "medium",
      title: `Inventory health is ${healthScore}%`,
      description: `Several items are at or below the minimum stock level.`,
      ctaPrimary: { label: "Open inventory", actionKey: "inventory.viewLowStock" },
    });
  }

  // ── Mix / reweigh ────────────────────────────────────────────
  const reweigh = selectReweighEfficiency(state);
  if (reweigh.totalMixes >= 4 && reweigh.reweighPct < 40) {
    const projectedSavings = Math.max(0, reweigh.savingsUsd * 2);
    candidates.push({
      id: "reweigh-low",
      type: "mix",
      severity: reweigh.reweighPct < 20 ? "medium" : "low",
      title: "Reweigh adoption is low",
      description: `Only ${reweigh.reweighPct}% of mixes are being reweighed. Projected savings: ~$${projectedSavings.toFixed(2)}/week if doubled.`,
      ctaPrimary: { label: "See savings", actionKey: "mix.view" },
    });
  }
  if (reweigh.wasteUsd > 0 && reweigh.wasteUsd > reweigh.savingsUsd) {
    candidates.push({
      id: "mix-waste-high",
      type: "mix",
      severity: reweigh.wasteUsd > reweigh.savingsUsd * 2 ? "high" : "medium",
      title: "Mix waste is outpacing savings",
      description: `~$${reweigh.wasteUsd.toFixed(2)} wasted vs $${reweigh.savingsUsd.toFixed(2)} saved. Tighten reweigh on color services.`,
      ctaPrimary: { label: "Review mixes", actionKey: "mix.view" },
    });
  }

  // ── Performance ──────────────────────────────────────────────
  const perf = selectStaffPerformance(state);
  if (perf.length > 0) {
    const sorted = [...perf].sort((a, b) => b.utilizationPct - a.utilizationPct);
    const top = sorted[0];
    if (top && top.utilizationPct > 70) {
      candidates.push({
        id: `top-performer-${top.staff.id}`,
        type: "performance",
        severity: "low",
        title: `${top.staff.name} is your top performer this week`,
        description: `${top.utilizationPct}% utilization across ${top.appointments} appointments.`,
        ctaPrimary: { label: "View staff", actionKey: "staff.view" },
      });
    }
    const lowest = sorted[sorted.length - 1];
    if (lowest && lowest.utilizationPct < 30 && lowest.staff.id !== top?.staff.id) {
      candidates.push({
        id: `low-utilization-${lowest.staff.id}`,
        type: "performance",
        severity: "medium",
        title: `${lowest.staff.name} has open capacity`,
        description: `Only ${lowest.utilizationPct}% utilized. Surface them in the next AI rebooking pass.`,
        ctaPrimary: { label: "Open schedule", actionKey: "schedule.optimize" },
        ctaSecondary: { label: "View staff", actionKey: "performance.view" },
      });
    }
  }

  // ── Revenue (idle services as opportunity) ──────────────────
  const revenuePerService = selectRevenuePerService(state);
  const idleServices = revenuePerService.filter((r) => r.totalPerformed === 0);
  if (idleServices.length > 0) {
    const first = idleServices[0];
    const extra = idleServices.length > 1 ? ` and ${idleServices.length - 1} other${idleServices.length > 2 ? "s" : ""}` : "";
    candidates.push({
      id: `idle-services-${first.service.id}`,
      type: "revenue",
      severity: "low",
      title: `Untapped service: ${first.service.name}`,
      description: `${first.service.name}${extra} hasn't been booked this period. Consider promoting it.`,
      ctaPrimary: { label: "Open analytics", actionKey: "analytics.view" },
    });
  }

  // ── Rank and trim ───────────────────────────────────────────
  candidates.sort((a, b) => {
    const sev = SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
    if (sev !== 0) return sev;
    const tie = TYPE_TIE_BREAK[a.type] - TYPE_TIE_BREAK[b.type];
    if (tie !== 0) return tie;
    return a.id.localeCompare(b.id);
  });

  return candidates.slice(0, MAX_INSIGHTS);
}
