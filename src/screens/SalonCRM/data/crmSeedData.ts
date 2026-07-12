/**
 * Centralized CRM seed data.
 *
 * This is the only file that owns operational mock data for the entire CRM.
 * Every entity is shaped exactly like a future Spectra mobile/backend API
 * payload (ISO timestamps, foreign keys, no Date objects).
 *
 * Screens never import from here directly: the repository hydrates the
 * provider, hooks expose state, selectors derive view models. Treat this
 * file as a fixture that mirrors the final REST/graph API contract.
 */

import type {
  AnalyticsSnapshot,
  Appointment,
  AppointmentStatus,
  Brand,
  CRMDataSnapshot,
  Customer,
  DailyOptimizationRow,
  InventoryItem,
  MarketplaceBanner,
  MixSession,
  MonthlyAnalyticsRow,
  Product,
  ProductLine,
  ProductUsage,
  ReweighOutcome,
  Salon,
  Service,
  ServiceCategory,
  ServiceCategoryId,
  StaffMember,
  Visit,
  VisitService,
  VisitServiceStatus,
} from "./crmTypes";

const SALON_ID = "salon-look";

// ── Salon ──────────────────────────────────────────────────────────

const SALON_HOURS = [0, 1, 2, 3, 4, 5].map((dow) => ({
  dayOfWeek: dow,
  startHour: 7,
  endHour: 24,
  breakStart: 13,
  breakEnd: 14,
}));

const SALONS: Salon[] = [
  {
    id: SALON_ID,
    name: "Salon Look",
    slug: "salon-look",
    timezone: "Asia/Jerusalem",
    currency: "ILS",
    phone: "+972-3-555-0102",
    email: "studio@salonlook.com",
    address: "Dizengoff 99",
    city: "Tel Aviv",
    status: "active",
    onboardingStatus: "completed",
    workingHours: SALON_HOURS,
  },
];

// ── Service categories ─────────────────────────────────────────────

const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "color",         name: "Color",         accentColor: "#D7897F" },
  { id: "highlights",    name: "Highlights",    accentColor: "#F9B95C" },
  { id: "toner",         name: "Toner",         accentColor: "#E8A6A0" },
  { id: "straightening", name: "Straightening", accentColor: "#6398A9" },
  { id: "treatment",     name: "Treatment",     accentColor: "#96C7B3" },
  { id: "cut",           name: "Cut",           accentColor: "#B8A7D9" },
  { id: "other",         name: "Other",         accentColor: "#B9CFA5" },
];

// ── Services catalog ───────────────────────────────────────────────

const SERVICES: Service[] = [
  { id: "sv1",  salonId: SALON_ID, categoryId: "color",         name: "Full Color",        defaultDurationMinutes: 90,  defaultPriceCents: 28000, defaultMaterialCostCents: 4200 },
  { id: "sv2",  salonId: SALON_ID, categoryId: "color",         name: "Root Touch-up",     defaultDurationMinutes: 60,  defaultPriceCents: 18000, defaultMaterialCostCents: 2800 },
  { id: "sv3",  salonId: SALON_ID, categoryId: "highlights",    name: "Balayage",          defaultDurationMinutes: 150, defaultPriceCents: 45000, defaultMaterialCostCents: 6500 },
  { id: "sv4",  salonId: SALON_ID, categoryId: "highlights",    name: "Full Highlights",   defaultDurationMinutes: 120, defaultPriceCents: 38000, defaultMaterialCostCents: 5800 },
  { id: "sv5",  salonId: SALON_ID, categoryId: "toner",         name: "Gloss Toner",       defaultDurationMinutes: 30,  defaultPriceCents: 12000, defaultMaterialCostCents: 2200 },
  { id: "sv6",  salonId: SALON_ID, categoryId: "toner",         name: "Corrective Toner",  defaultDurationMinutes: 45,  defaultPriceCents: 20000, defaultMaterialCostCents: 3500 },
  { id: "sv7",  salonId: SALON_ID, categoryId: "straightening", name: "Keratin Treatment", defaultDurationMinutes: 180, defaultPriceCents: 60000, defaultMaterialCostCents: 9500 },
  { id: "sv8",  salonId: SALON_ID, categoryId: "straightening", name: "Brazilian Blowout", defaultDurationMinutes: 150, defaultPriceCents: 50000, defaultMaterialCostCents: 8500 },
  { id: "sv9",  salonId: SALON_ID, categoryId: "treatment",     name: "Olaplex Treatment", defaultDurationMinutes: 30,  defaultPriceCents: 15000, defaultMaterialCostCents: 4500 },
  { id: "sv10", salonId: SALON_ID, categoryId: "treatment",     name: "Deep Conditioning", defaultDurationMinutes: 30,  defaultPriceCents: 10000, defaultMaterialCostCents: 1800 },
  { id: "sv11", salonId: SALON_ID, categoryId: "cut",           name: "Cut & Style",       defaultDurationMinutes: 60,  defaultPriceCents: 14000, defaultMaterialCostCents: 1000 },
  { id: "sv12", salonId: SALON_ID, categoryId: "toner",         name: "Highlights Rinse",  defaultDurationMinutes: 25,  defaultPriceCents: 8000,  defaultMaterialCostCents: 1200 },
  { id: "sv13", salonId: SALON_ID, categoryId: "toner",         name: "Length Toner",      defaultDurationMinutes: 30,  defaultPriceCents: 12000, defaultMaterialCostCents: 2200 },
  { id: "sv14", salonId: SALON_ID, categoryId: "cut",           name: "Women's Haircut",   defaultDurationMinutes: 45,  defaultPriceCents: 13000, defaultMaterialCostCents: 900 },
  { id: "sv15", salonId: SALON_ID, categoryId: "cut",           name: "Blow Dry & Styling", defaultDurationMinutes: 30, defaultPriceCents: 9000,  defaultMaterialCostCents: 700 },
];

// ── Staff ──────────────────────────────────────────────────────────

const STAFF: StaffMember[] = [
  { id: "e1", salonId: SALON_ID, name: "Noa Levi",       role: "Senior Stylist",    roleId: "role-hair-stylist", departmentIds: ["dept-hair"], serviceIds: ["sv1", "sv2", "sv3", "sv4", "sv5", "sv9", "sv11", "sv14", "sv15"], color: "#D7897F", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=96&q=80", status: "active", rating: 4.8, workingHours: SALON_HOURS },
  { id: "e2", salonId: SALON_ID, name: "Daniela Roth",   role: "Color Specialist",  roleId: "role-color-specialist", departmentIds: ["dept-hair"], serviceIds: ["sv1", "sv2", "sv3", "sv4", "sv5", "sv6", "sv12", "sv13"], color: "#F9B95C", avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=96&q=80", status: "active", rating: 4.6, workingHours: SALON_HOURS },
  { id: "e3", salonId: SALON_ID, name: "Maya Azulay",    role: "Hair Specialist",   roleId: "role-hair-stylist", departmentIds: ["dept-hair"], serviceIds: ["sv3", "sv4", "sv7", "sv8", "sv9", "sv10", "sv11", "sv14", "sv15"], color: "#6398A9", avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=96&q=80", status: "active", rating: 4.9, workingHours: SALON_HOURS },
  { id: "wash-1", salonId: SALON_ID, name: "Romi Wash",   role: "Shampoo Assistant", roleId: "role-shampoo-assistant", departmentIds: ["dept-hair"], serviceIds: [], color: "#96C7B3", avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=96&q=80", status: "active", rating: 4.8, workingHours: SALON_HOURS },
  { id: "wash-2", salonId: SALON_ID, name: "Lior Rinse",  role: "Shampoo Assistant", roleId: "role-shampoo-assistant", departmentIds: ["dept-hair"], serviceIds: [], color: "#6398A9", avatarUrl: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=96&q=80", status: "active", rating: 4.7, workingHours: SALON_HOURS },
  { id: "e4", salonId: SALON_ID, name: "Shira Ben Ari",  role: "Beauty Therapist",  roleId: "role-beauty-therapist", departmentIds: ["dept-cosmetics"], serviceIds: ["cos-facial-classic", "cos-facial-glow", "cos-brow-shape", "cos-brow-tint", "cos-lash-lift", "cos-makeup-evening"], color: "#96C7B3", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&q=80", status: "active", rating: 4.7, workingHours: SALON_HOURS },
];

// ── Customers ──────────────────────────────────────────────────────

interface SeedCustomerEntry {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  tags?: string[];
  isVip?: boolean;
  status?: Customer["status"];
}

const CUSTOMER_DEFINITIONS: SeedCustomerEntry[] = [
  // Up Next focus customers
  { id: "c-hannah-stein",    firstName: "Hannah",   lastName: "Stein",     phone: "+972-50-555-0011", tags: ["vip"], isVip: true },
  { id: "c-lisa-chen",       firstName: "Lisa",     lastName: "Chen",      phone: "+972-50-555-0012" },
  { id: "c-maya-levi",       firstName: "Maya",     lastName: "Levi",      phone: "+972-50-555-0013" },
  // Live focus customers
  { id: "c-michaela-stone",  firstName: "Michaela", lastName: "Stone",     phone: "+972-50-555-1001", tags: ["vip"], isVip: true },
  { id: "c-liyla-cavaliny",  firstName: "Liyla",    lastName: "Cavaliny",  phone: "+972-50-555-1002" },
  { id: "c-neta-gertiog",    firstName: "Neta",     lastName: "Gertiog",   phone: "+972-50-555-1003" },
  { id: "c-dr-sorbie",       firstName: "Dr.",      lastName: "Sorbie",    phone: "+972-50-555-1004" },
  { id: "c-live-noa-shalev",  firstName: "Noa",      lastName: "Shalev",    phone: "+972-50-555-2001", tags: ["vip"], isVip: true },
  { id: "c-live-dana-ron",    firstName: "Dana",     lastName: "Ron",       phone: "+972-50-555-2002" },
  { id: "c-live-yael-amir",   firstName: "Yael",     lastName: "Amir",      phone: "+972-50-555-2003" },
  // Schedule clients (drawn from calendarMockData)
  { id: "c-rachel-levi",     firstName: "Rachel",   lastName: "Levi" },
  { id: "c-shira-alon",      firstName: "Shira",    lastName: "Alon" },
  { id: "c-tom-hadad",       firstName: "Tom",      lastName: "Hadad" },
  { id: "c-dana-peretz",     firstName: "Dana",     lastName: "Peretz" },
  { id: "c-yael-mizrahi",    firstName: "Yael",     lastName: "Mizrahi" },
  { id: "c-orly-shapira",    firstName: "Orly",     lastName: "Shapira" },
  { id: "c-ron-elkayam",     firstName: "Ron",      lastName: "Elkayam" },
  { id: "c-sapir-cohen",     firstName: "Sapir",    lastName: "Cohen" },
  { id: "c-tamar-levy",      firstName: "Tamar",    lastName: "Levy" },
  { id: "c-hila-ben-david",  firstName: "Hila",     lastName: "Ben David" },
  { id: "c-noa-friedman",    firstName: "Noa",      lastName: "Friedman" },
  { id: "c-rina-katz",       firstName: "Rina",     lastName: "Katz" },
  { id: "c-efrat-dahan",     firstName: "Efrat",    lastName: "Dahan" },
  { id: "c-yossi-malka",     firstName: "Yossi",    lastName: "Malka" },
  { id: "c-gili-avraham",    firstName: "Gili",     lastName: "Avraham" },
  { id: "c-miri-azoulay",    firstName: "Miri",     lastName: "Azoulay" },
  { id: "c-orit-ben-shlomo", firstName: "Orit",     lastName: "Ben Shlomo" },
  { id: "c-amit-regev",      firstName: "Amit",     lastName: "Regev" },
  { id: "c-shani-gold",      firstName: "Shani",    lastName: "Gold" },
  { id: "c-roni-segal",      firstName: "Roni",     lastName: "Segal" },
  { id: "c-karen-stern",     firstName: "Karen",    lastName: "Stern" },
  { id: "c-dikla-mor",       firstName: "Dikla",    lastName: "Mor" },
  { id: "c-ayelet-bar",      firstName: "Ayelet",   lastName: "Bar" },
  { id: "c-zohar-stein",     firstName: "Zohar",    lastName: "Stein" },
  { id: "c-lee-chen",        firstName: "Lee",      lastName: "Chen" },
  { id: "c-romema-green",    firstName: "Romema",   lastName: "Green" },
  { id: "c-sivan-haim",      firstName: "Sivan",    lastName: "Haim" },
  { id: "c-adi-yosef",       firstName: "Adi",      lastName: "Yosef" },
  { id: "c-inbal-ozeri",     firstName: "Inbal",    lastName: "Ozeri" },
  { id: "c-meital-rosen",    firstName: "Meital",   lastName: "Rosen" },
  { id: "c-osnat-dvir",      firstName: "Osnat",    lastName: "Dvir" },
  { id: "c-tali-barak",      firstName: "Tali",     lastName: "Barak" },
  { id: "c-uri-levi",        firstName: "Uri",      lastName: "Levi" },
  { id: "c-anat-koren",      firstName: "Anat",     lastName: "Koren" },
  { id: "c-hadas-peled",     firstName: "Hadas",    lastName: "Peled" },
  { id: "c-noga-fine",       firstName: "Noga",     lastName: "Fine" },
  { id: "c-lior-shaked",     firstName: "Lior",     lastName: "Shaked" },
  { id: "c-ruth-nahum",      firstName: "Ruth",     lastName: "Nahum" },
  { id: "c-ella-margalit",   firstName: "Ella",     lastName: "Margalit" },
  { id: "c-sigal-weiss",     firstName: "Sigal",    lastName: "Weiss" },
  { id: "c-ben-tzvi",        firstName: "Ben",      lastName: "Tzvi" },
  { id: "c-shelly-amar",     firstName: "Shelly",   lastName: "Amar" },
  { id: "c-pnina-harel",     firstName: "Pnina",    lastName: "Harel",     tags: ["vip"], isVip: true },
  { id: "c-yaniv-dror",      firstName: "Yaniv",    lastName: "Dror" },
  { id: "c-tal-sasson",      firstName: "Tal",      lastName: "Sasson" },
  { id: "c-lilach-eden",     firstName: "Lilach",   lastName: "Eden" },
  { id: "c-yarden-paz",      firstName: "Yarden",   lastName: "Paz" },
  { id: "c-nirit-shoham",    firstName: "Nirit",    lastName: "Shoham",    tags: ["bridal"] },
  { id: "c-ahuva-klein",     firstName: "Ahuva",    lastName: "Klein" },
  { id: "c-dror-kaplan",     firstName: "Dror",     lastName: "Kaplan" },
  { id: "c-carmel-lux",      firstName: "Carmel",   lastName: "Lux" },
  { id: "c-liora-ben-ami",   firstName: "Liora",    lastName: "Ben Ami" },
  { id: "c-bat-el-nissim",   firstName: "Bat-El",   lastName: "Nissim" },
];

const CUSTOMERS_TIMESTAMP = "2025-09-01T08:00:00.000Z";

const CUSTOMERS: Customer[] = CUSTOMER_DEFINITIONS.map((c) => ({
  id: c.id,
  salonId: SALON_ID,
  firstName: c.firstName,
  lastName: c.lastName,
  phone: c.phone,
  email: c.email,
  notes: undefined,
  tags: c.tags ?? [],
  status: c.status ?? "active",
  isVip: c.isVip ?? false,
  createdAt: CUSTOMERS_TIMESTAMP,
  updatedAt: CUSTOMERS_TIMESTAMP,
}));

// ── Appointments (anchored to current week) ────────────────────────

interface SeedAppointment {
  id: string;
  staffMemberId: string;
  customerId: string;
  serviceName: string;
  serviceId: string;
  serviceCategoryId: ServiceCategoryId;
  /** 0=Sun … 5=Fri offset from start of current week. */
  dayOffset: number;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  status?: AppointmentStatus;
  notes?: string;
}

const APPOINTMENT_DEFINITIONS: SeedAppointment[] = [
  // Sunday
  { id: "a01", staffMemberId: "e1", customerId: "c-michaela-stone", serviceId: "sv2", serviceName: "Root Color",        serviceCategoryId: "color",         dayOffset: 0, startHour: 9,  startMinute: 0,  durationMinutes: 90,  status: "in-progress" },
  { id: "a02", staffMemberId: "e1", customerId: "c-rachel-levi",    serviceId: "sv3", serviceName: "Balayage",          serviceCategoryId: "highlights",    dayOffset: 0, startHour: 11, startMinute: 0,  durationMinutes: 150, status: "in-progress" },
  { id: "a03", staffMemberId: "e1", customerId: "c-shira-alon",     serviceId: "sv5", serviceName: "Toner Fix",         serviceCategoryId: "toner",         dayOffset: 0, startHour: 15, startMinute: 0,  durationMinutes: 45 },
  { id: "a04", staffMemberId: "e2", customerId: "c-tom-hadad",      serviceId: "sv11",serviceName: "Men's Cut",         serviceCategoryId: "cut",           dayOffset: 0, startHour: 9,  startMinute: 30, durationMinutes: 30 },
  { id: "a05", staffMemberId: "e2", customerId: "c-dana-peretz",    serviceId: "sv1", serviceName: "Full Head Color",   serviceCategoryId: "color",         dayOffset: 0, startHour: 10, startMinute: 30, durationMinutes: 120 },
  { id: "a06", staffMemberId: "e2", customerId: "c-yael-mizrahi",   serviceId: "sv9", serviceName: "Blow Dry + Style",  serviceCategoryId: "treatment",     dayOffset: 0, startHour: 14, startMinute: 0,  durationMinutes: 60,  status: "completed" },
  { id: "a07", staffMemberId: "e3", customerId: "c-liyla-cavaliny", serviceId: "sv4", serviceName: "Highlights Half",   serviceCategoryId: "highlights",    dayOffset: 0, startHour: 9,  startMinute: 0,  durationMinutes: 120, status: "in-progress" },
  { id: "a08", staffMemberId: "e3", customerId: "c-neta-gertiog",   serviceId: "sv5", serviceName: "Root Lift",         serviceCategoryId: "toner",         dayOffset: 0, startHour: 12, startMinute: 0,  durationMinutes: 60,  status: "in-progress" },
  { id: "a09", staffMemberId: "e3", customerId: "c-orly-shapira",   serviceId: "sv7", serviceName: "Keratin Treatment", serviceCategoryId: "straightening", dayOffset: 0, startHour: 14, startMinute: 0,  durationMinutes: 180, status: "in-progress" },
  { id: "a10", staffMemberId: "e4", customerId: "c-ron-elkayam",    serviceId: "sv11",serviceName: "Buzz Cut",          serviceCategoryId: "cut",           dayOffset: 0, startHour: 9,  startMinute: 0,  durationMinutes: 30,  status: "completed" },
  { id: "a11", staffMemberId: "e4", customerId: "c-sapir-cohen",    serviceId: "sv2", serviceName: "Color Fix",         serviceCategoryId: "color",         dayOffset: 0, startHour: 10, startMinute: 0,  durationMinutes: 90 },
  { id: "a12", staffMemberId: "e5", customerId: "c-tamar-levy",     serviceId: "sv7", serviceName: "Keratin",           serviceCategoryId: "straightening", dayOffset: 0, startHour: 9,  startMinute: 0,  durationMinutes: 180 },
  { id: "a13", staffMemberId: "e5", customerId: "c-hila-ben-david", serviceId: "sv5", serviceName: "Toner",             serviceCategoryId: "toner",         dayOffset: 0, startHour: 14, startMinute: 0,  durationMinutes: 45,  status: "cancelled" },

  // Monday
  { id: "a14", staffMemberId: "e1", customerId: "c-noa-friedman",   serviceId: "sv1", serviceName: "Full Head",         serviceCategoryId: "color",         dayOffset: 1, startHour: 9,  startMinute: 0,  durationMinutes: 120 },
  { id: "a15", staffMemberId: "e1", customerId: "c-rina-katz",      serviceId: "sv3", serviceName: "Balayage",          serviceCategoryId: "highlights",    dayOffset: 1, startHour: 12, startMinute: 0,  durationMinutes: 150 },
  { id: "a16", staffMemberId: "e1", customerId: "c-efrat-dahan",    serviceId: "sv5", serviceName: "Toner Refresh",     serviceCategoryId: "toner",         dayOffset: 1, startHour: 16, startMinute: 0,  durationMinutes: 45 },
  { id: "a17", staffMemberId: "e2", customerId: "c-yossi-malka",    serviceId: "sv11",serviceName: "Men's Fade",        serviceCategoryId: "cut",           dayOffset: 1, startHour: 9,  startMinute: 0,  durationMinutes: 45,  status: "completed" },
  { id: "a18", staffMemberId: "e2", customerId: "c-gili-avraham",   serviceId: "sv2", serviceName: "Color Roots",       serviceCategoryId: "color",         dayOffset: 1, startHour: 10, startMinute: 30, durationMinutes: 90 },
  { id: "a19", staffMemberId: "e3", customerId: "c-miri-azoulay",   serviceId: "sv4", serviceName: "Half Head Highlights", serviceCategoryId: "highlights", dayOffset: 1, startHour: 9,  startMinute: 0,  durationMinutes: 120, status: "in-progress" },
  { id: "a20", staffMemberId: "e3", customerId: "c-orit-ben-shlomo",serviceId: "sv9", serviceName: "Gloss Treatment",   serviceCategoryId: "treatment",     dayOffset: 1, startHour: 13, startMinute: 0,  durationMinutes: 60 },
  { id: "a21", staffMemberId: "e4", customerId: "c-amit-regev",     serviceId: "sv11",serviceName: "Style + Cut",       serviceCategoryId: "cut",           dayOffset: 1, startHour: 10, startMinute: 0,  durationMinutes: 60 },
  { id: "a22", staffMemberId: "e4", customerId: "c-shani-gold",     serviceId: "sv2", serviceName: "Root Touch Up",     serviceCategoryId: "color",         dayOffset: 1, startHour: 12, startMinute: 0,  durationMinutes: 90 },
  { id: "a23", staffMemberId: "e5", customerId: "c-roni-segal",     serviceId: "sv8", serviceName: "Brazilian Blowout", serviceCategoryId: "straightening", dayOffset: 1, startHour: 9,  startMinute: 0,  durationMinutes: 180 },
  { id: "a24", staffMemberId: "e5", customerId: "c-karen-stern",    serviceId: "sv5", serviceName: "Toner",             serviceCategoryId: "toner",         dayOffset: 1, startHour: 15, startMinute: 0,  durationMinutes: 45,  status: "no-show" },

  // Tuesday
  { id: "a25", staffMemberId: "e1", customerId: "c-dikla-mor",      serviceId: "sv3", serviceName: "Balayage Touch-up", serviceCategoryId: "highlights",    dayOffset: 2, startHour: 9,  startMinute: 30, durationMinutes: 120 },
  { id: "a26", staffMemberId: "e1", customerId: "c-ayelet-bar",     serviceId: "sv2", serviceName: "Color + Toner",     serviceCategoryId: "color",         dayOffset: 2, startHour: 12, startMinute: 30, durationMinutes: 120 },
  { id: "a27", staffMemberId: "e2", customerId: "c-zohar-stein",    serviceId: "sv11",serviceName: "Crew Cut",          serviceCategoryId: "cut",           dayOffset: 2, startHour: 9,  startMinute: 0,  durationMinutes: 30,  status: "completed" },
  { id: "a28", staffMemberId: "e2", customerId: "c-lee-chen",       serviceId: "sv1", serviceName: "Vivid Fashion Color", serviceCategoryId: "color",       dayOffset: 2, startHour: 10, startMinute: 0,  durationMinutes: 150, status: "in-progress" },
  { id: "a29", staffMemberId: "e3", customerId: "c-romema-green",   serviceId: "sv4", serviceName: "Full Head Highlights", serviceCategoryId: "highlights", dayOffset: 2, startHour: 9,  startMinute: 0,  durationMinutes: 180 },
  { id: "a30", staffMemberId: "e3", customerId: "c-sivan-haim",     serviceId: "sv9", serviceName: "Scalp Treatment",   serviceCategoryId: "treatment",     dayOffset: 2, startHour: 14, startMinute: 0,  durationMinutes: 60 },
  { id: "a31", staffMemberId: "e4", customerId: "c-adi-yosef",      serviceId: "sv11",serviceName: "Trim + Blow Dry",   serviceCategoryId: "cut",           dayOffset: 2, startHour: 11, startMinute: 0,  durationMinutes: 60 },
  { id: "a32", staffMemberId: "e5", customerId: "c-inbal-ozeri",    serviceId: "sv7", serviceName: "Straightening",     serviceCategoryId: "straightening", dayOffset: 2, startHour: 9,  startMinute: 0,  durationMinutes: 180 },
  { id: "a33", staffMemberId: "e5", customerId: "c-meital-rosen",   serviceId: "sv5", serviceName: "Toner Fix",         serviceCategoryId: "toner",         dayOffset: 2, startHour: 14, startMinute: 0,  durationMinutes: 45 },

  // Wednesday — anchor day for Up Next showcase
  { id: "a34", staffMemberId: "e1", customerId: "c-osnat-dvir",     serviceId: "sv3", serviceName: "Full Balayage",     serviceCategoryId: "highlights",    dayOffset: 3, startHour: 9,  startMinute: 0,  durationMinutes: 180 },
  { id: "a35", staffMemberId: "e1", customerId: "c-tali-barak",     serviceId: "sv5", serviceName: "Toner",             serviceCategoryId: "toner",         dayOffset: 3, startHour: 14, startMinute: 0,  durationMinutes: 45 },
  { id: "a36", staffMemberId: "e2", customerId: "c-uri-levi",       serviceId: "sv11",serviceName: "Fade + Design",     serviceCategoryId: "cut",           dayOffset: 3, startHour: 9,  startMinute: 0,  durationMinutes: 60,  status: "completed" },
  { id: "a37", staffMemberId: "e2", customerId: "c-anat-koren",     serviceId: "sv2", serviceName: "Roots + Gloss",     serviceCategoryId: "color",         dayOffset: 3, startHour: 10, startMinute: 30, durationMinutes: 120 },
  { id: "a38", staffMemberId: "e3", customerId: "c-hadas-peled",    serviceId: "sv4", serviceName: "Highlights",        serviceCategoryId: "highlights",    dayOffset: 3, startHour: 9,  startMinute: 0,  durationMinutes: 120, status: "in-progress" },
  { id: "a39", staffMemberId: "e3", customerId: "c-noga-fine",      serviceId: "sv10",serviceName: "Deep Conditioning", serviceCategoryId: "treatment",     dayOffset: 3, startHour: 12, startMinute: 0,  durationMinutes: 60 },
  { id: "a40", staffMemberId: "e4", customerId: "c-lior-shaked",    serviceId: "sv1", serviceName: "Color Correction",  serviceCategoryId: "color",         dayOffset: 3, startHour: 9,  startMinute: 0,  durationMinutes: 180 },
  { id: "a41", staffMemberId: "e5", customerId: "c-ruth-nahum",     serviceId: "sv7", serviceName: "Japanese Straightening", serviceCategoryId: "straightening", dayOffset: 3, startHour: 9, startMinute: 0, durationMinutes: 240 },

  // Up Next showcase appointments anchored to Wednesday afternoon
  { id: "a-up-001", staffMemberId: "e3", customerId: "c-hannah-stein", serviceId: "sv5", serviceName: "Toner",       serviceCategoryId: "toner",     dayOffset: 3, startHour: 10, startMinute: 0,  durationMinutes: 30, status: "confirmed", notes: "Up Next focus" },
  { id: "a-up-002", staffMemberId: "e1", customerId: "c-lisa-chen",    serviceId: "sv1", serviceName: "Color",       serviceCategoryId: "color",     dayOffset: 3, startHour: 11, startMinute: 30, durationMinutes: 90, status: "confirmed", notes: "Up Next focus" },
  { id: "a-up-003", staffMemberId: "e5", customerId: "c-maya-levi",    serviceId: "sv8", serviceName: "Straightener",serviceCategoryId: "straightening", dayOffset: 3, startHour: 13, startMinute: 30, durationMinutes: 120, status: "confirmed", notes: "Up Next focus" },

  // Thursday
  { id: "a42", staffMemberId: "e1", customerId: "c-ella-margalit",  serviceId: "sv3", serviceName: "Ombre",             serviceCategoryId: "highlights",    dayOffset: 4, startHour: 9,  startMinute: 0,  durationMinutes: 150 },
  { id: "a43", staffMemberId: "e1", customerId: "c-sigal-weiss",    serviceId: "sv2", serviceName: "Root Refresh",      serviceCategoryId: "color",         dayOffset: 4, startHour: 14, startMinute: 0,  durationMinutes: 90 },
  { id: "a44", staffMemberId: "e2", customerId: "c-ben-tzvi",       serviceId: "sv11",serviceName: "Classic Cut",       serviceCategoryId: "cut",           dayOffset: 4, startHour: 9,  startMinute: 30, durationMinutes: 45,  status: "completed" },
  { id: "a45", staffMemberId: "e2", customerId: "c-shelly-amar",    serviceId: "sv1", serviceName: "Creative Color",    serviceCategoryId: "color",         dayOffset: 4, startHour: 11, startMinute: 0,  durationMinutes: 120 },
  { id: "a46", staffMemberId: "e3", customerId: "c-pnina-harel",    serviceId: "sv4", serviceName: "Baby Lights",       serviceCategoryId: "highlights",    dayOffset: 4, startHour: 9,  startMinute: 0,  durationMinutes: 180, status: "in-progress", notes: "VIP client, extra care" },
  { id: "a47", staffMemberId: "e4", customerId: "c-yaniv-dror",     serviceId: "sv11",serviceName: "Quick Trim",        serviceCategoryId: "cut",           dayOffset: 4, startHour: 9,  startMinute: 0,  durationMinutes: 30 },
  { id: "a48", staffMemberId: "e4", customerId: "c-tal-sasson",     serviceId: "sv5", serviceName: "Toner + Style",     serviceCategoryId: "toner",         dayOffset: 4, startHour: 10, startMinute: 0,  durationMinutes: 75 },
  { id: "a49", staffMemberId: "e5", customerId: "c-lilach-eden",    serviceId: "sv7", serviceName: "Keratin Express",   serviceCategoryId: "straightening", dayOffset: 4, startHour: 9,  startMinute: 0,  durationMinutes: 120 },
  { id: "a50", staffMemberId: "e5", customerId: "c-yarden-paz",     serviceId: "sv7", serviceName: "Full Straightening",serviceCategoryId: "straightening", dayOffset: 4, startHour: 13, startMinute: 0,  durationMinutes: 180 },

  // Friday
  { id: "a51", staffMemberId: "e1", customerId: "c-nirit-shoham",   serviceId: "sv1", serviceName: "Bridal Color",      serviceCategoryId: "color",         dayOffset: 5, startHour: 9,  startMinute: 0,  durationMinutes: 120, notes: "Bride - wedding tomorrow" },
  { id: "a52", staffMemberId: "e1", customerId: "c-ahuva-klein",    serviceId: "sv5", serviceName: "Quick Toner",       serviceCategoryId: "toner",         dayOffset: 5, startHour: 12, startMinute: 0,  durationMinutes: 30 },
  { id: "a53", staffMemberId: "e2", customerId: "c-dror-kaplan",    serviceId: "sv11",serviceName: "Groom's Cut",       serviceCategoryId: "cut",           dayOffset: 5, startHour: 9,  startMinute: 0,  durationMinutes: 45 },
  { id: "a54", staffMemberId: "e3", customerId: "c-carmel-lux",     serviceId: "sv4", serviceName: "Highlight Touch-up",serviceCategoryId: "highlights",    dayOffset: 5, startHour: 9,  startMinute: 0,  durationMinutes: 90 },
  { id: "a55", staffMemberId: "e4", customerId: "c-liora-ben-ami",  serviceId: "sv2", serviceName: "Roots",             serviceCategoryId: "color",         dayOffset: 5, startHour: 9,  startMinute: 0,  durationMinutes: 60 },
  { id: "a56", staffMemberId: "e5", customerId: "c-bat-el-nissim",  serviceId: "sv7", serviceName: "Keratin",           serviceCategoryId: "straightening", dayOffset: 5, startHour: 9,  startMinute: 0,  durationMinutes: 150 },
];

// ── Date utilities used to anchor seed data to the current week ───

function startOfWeekDate(reference: Date): Date {
  const d = new Date(reference);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDaysToDate(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function buildAppointmentTimes(
  weekStart: Date,
  dayOffset: number,
  startHour: number,
  startMinute: number,
  durationMinutes: number,
): { startTime: string; endTime: string } {
  const day = addDaysToDate(weekStart, dayOffset);
  const start = new Date(day);
  start.setHours(startHour, startMinute, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + durationMinutes);
  return { startTime: start.toISOString(), endTime: end.toISOString() };
}

// ── Live state derivation ──────────────────────────────────────────

interface LiveServiceConfig {
  appointmentId: string;
  status: VisitServiceStatus;
  hasOpenMix: boolean;
  assignedStaffIds: string[];
  /** Optional fixed mix progress to seed product usage / reweigh outcomes. */
  mix?: {
    expectedGrams: number;
    actualGrams?: number;
    productId: string;
    inventoryItemId: string;
    grams: number;
    costAtUseUsd: number;
    reweighOutcome?: {
      varianceGrams: number;
      varianceValueUsd: number;
      type: ReweighOutcome["outcome"];
    };
  };
}

const LIVE_SERVICE_CONFIG: LiveServiceConfig[] = [
  {
    appointmentId: "a01",
    status: "mix_in_progress",
    hasOpenMix: true,
    assignedStaffIds: ["e1", "e3"],
    mix: {
      expectedGrams: 80,
      actualGrams: 78,
      productId: "p-majirel-l5",
      inventoryItemId: "inv-majirel-l5",
      grams: 35,
      costAtUseUsd: 1.6,
      reweighOutcome: { varianceGrams: -2, varianceValueUsd: 0.18, type: "saving" },
    },
  },
  {
    appointmentId: "a07",
    status: "active",
    hasOpenMix: false,
    assignedStaffIds: ["e3"],
  },
  {
    appointmentId: "a08",
    status: "reweigh_pending",
    hasOpenMix: true,
    assignedStaffIds: ["e3", "e1"],
    mix: {
      expectedGrams: 60,
      productId: "p-majirel-l6",
      inventoryItemId: "inv-majirel-l6",
      grams: 60,
      costAtUseUsd: 2.5,
    },
  },
  {
    appointmentId: "a09",
    status: "done",
    hasOpenMix: false,
    assignedStaffIds: ["e3", "e1"],
  },
  {
    appointmentId: "a02",
    status: "mix_in_progress",
    hasOpenMix: true,
    assignedStaffIds: ["e1"],
    mix: {
      expectedGrams: 120,
      actualGrams: 122,
      productId: "p-blond-studio",
      inventoryItemId: "inv-blond-studio",
      grams: 60,
      costAtUseUsd: 3.5,
      reweighOutcome: { varianceGrams: 2, varianceValueUsd: 0.22, type: "extra-charge" },
    },
  },
  {
    appointmentId: "a19",
    status: "active",
    hasOpenMix: false,
    assignedStaffIds: ["e3"],
  },
  {
    appointmentId: "a28",
    status: "active",
    hasOpenMix: false,
    assignedStaffIds: ["e2"],
  },
  {
    appointmentId: "a38",
    status: "mix_in_progress",
    hasOpenMix: true,
    assignedStaffIds: ["e3"],
    mix: {
      expectedGrams: 90,
      productId: "p-majirel-l7",
      inventoryItemId: "inv-majirel-l7",
      grams: 45,
      costAtUseUsd: 2.0,
    },
  },
  {
    appointmentId: "a46",
    status: "mix_in_progress",
    hasOpenMix: true,
    assignedStaffIds: ["e3"],
    mix: {
      expectedGrams: 110,
      productId: "p-blondor",
      inventoryItemId: "inv-blondor",
      grams: 55,
      costAtUseUsd: 2.9,
    },
  },
];

const LIVE_SERVICE_INDEX = new Map(
  LIVE_SERVICE_CONFIG.map((cfg) => [cfg.appointmentId, cfg]),
);

// ── Brands, product lines, products ────────────────────────────────

const BRANDS: Brand[] = [
  { id: "br-loreal",    name: "L'Oreal Pro", slug: "loreal-pro", sortOrder: 1 },
  { id: "br-wella",     name: "Wella",       slug: "wella",      sortOrder: 2 },
  { id: "br-redken",    name: "Redken",      slug: "redken",     sortOrder: 3 },
  { id: "br-schwarz",   name: "Schwarzkopf", slug: "schwarz",    sortOrder: 4 },
  { id: "br-olaplex",   name: "Olaplex",     slug: "olaplex",    sortOrder: 5 },
  { id: "br-k18",       name: "K18",         slug: "k18",        sortOrder: 6 },
  { id: "br-gk",        name: "Global Keratin", slug: "gk",      sortOrder: 7 },
];

const PRODUCT_LINES: ProductLine[] = [
  { id: "pl-majirel",       brandId: "br-loreal",  name: "Majirel",        slug: "majirel",       sortOrder: 1 },
  { id: "pl-dia-richesse",  brandId: "br-loreal",  name: "Dia Richesse",   slug: "dia-richesse",  sortOrder: 2 },
  { id: "pl-blond-studio",  brandId: "br-loreal",  name: "Blond Studio",   slug: "blond-studio",  sortOrder: 3 },
  { id: "pl-koleston",      brandId: "br-wella",   name: "Koleston Perfect", slug: "koleston",    sortOrder: 1 },
  { id: "pl-blondor",       brandId: "br-wella",   name: "Blondor",        slug: "blondor",       sortOrder: 2 },
  { id: "pl-color-touch",   brandId: "br-wella",   name: "Color Touch",    slug: "color-touch",   sortOrder: 3 },
  { id: "pl-shades-eq",     brandId: "br-redken",  name: "Shades EQ",      slug: "shades-eq",     sortOrder: 1 },
  { id: "pl-bonding",       brandId: "br-redken",  name: "Acidic Bonding", slug: "acidic",        sortOrder: 2 },
  { id: "pl-igora",         brandId: "br-schwarz", name: "Igora Royal",    slug: "igora",         sortOrder: 1 },
  { id: "pl-blondme",       brandId: "br-schwarz", name: "BlondMe",        slug: "blondme",       sortOrder: 2 },
  { id: "pl-olaplex",       brandId: "br-olaplex", name: "Olaplex System", slug: "olaplex",       sortOrder: 1 },
  { id: "pl-k18",           brandId: "br-k18",     name: "K18 Molecular",  slug: "k18-molecular", sortOrder: 1 },
  { id: "pl-gk",            brandId: "br-gk",      name: "GK Keratin",     slug: "gk-keratin",    sortOrder: 1 },
];

const PRODUCTS: Product[] = [
  { id: "p-majirel-l5",   brandId: "br-loreal", productLineId: "pl-majirel", shadeCode: "5",   displayName: "Light Brown",        level: 5,  sizeGrams: 50, serviceCategoryId: "color" },
  { id: "p-majirel-l6",   brandId: "br-loreal", productLineId: "pl-majirel", shadeCode: "6",   displayName: "Dark Blonde",        level: 6,  sizeGrams: 50, serviceCategoryId: "color" },
  { id: "p-majirel-l7",   brandId: "br-loreal", productLineId: "pl-majirel", shadeCode: "7",   displayName: "Blonde",             level: 7,  sizeGrams: 50, serviceCategoryId: "color" },
  { id: "p-majirel-l8",   brandId: "br-loreal", productLineId: "pl-majirel", shadeCode: "8",   displayName: "Light Blonde",       level: 8,  sizeGrams: 50, serviceCategoryId: "color" },
  { id: "p-majirel-l9",   brandId: "br-loreal", productLineId: "pl-majirel", shadeCode: "9",   displayName: "Very Light Blonde",  level: 9,  sizeGrams: 50, serviceCategoryId: "color" },
  { id: "p-majirel-l10",  brandId: "br-loreal", productLineId: "pl-majirel", shadeCode: "10",  displayName: "Lightest Blonde",    level: 10, sizeGrams: 50, serviceCategoryId: "color" },
  { id: "p-dia-l6",       brandId: "br-loreal", productLineId: "pl-dia-richesse", shadeCode: "6",   level: 6, sizeGrams: 50, serviceCategoryId: "toner" },
  { id: "p-dia-l9",       brandId: "br-loreal", productLineId: "pl-dia-richesse", shadeCode: "9",   level: 9, sizeGrams: 50, serviceCategoryId: "toner" },
  { id: "p-blond-studio", brandId: "br-loreal", productLineId: "pl-blond-studio", shadeCode: "Platinium",   sizeGrams: 500, serviceCategoryId: "highlights" },
  { id: "p-koleston-l5",  brandId: "br-wella",  productLineId: "pl-koleston",   shadeCode: "5/0", level: 5, sizeGrams: 60, serviceCategoryId: "color" },
  { id: "p-koleston-l7",  brandId: "br-wella",  productLineId: "pl-koleston",   shadeCode: "7/0", level: 7, sizeGrams: 60, serviceCategoryId: "color" },
  { id: "p-blondor",      brandId: "br-wella",  productLineId: "pl-blondor",    shadeCode: "Multi-blonde",  sizeGrams: 400, serviceCategoryId: "highlights" },
  { id: "p-color-touch",  brandId: "br-wella",  productLineId: "pl-color-touch",shadeCode: "5/0", level: 5, sizeGrams: 60, serviceCategoryId: "toner" },
  { id: "p-shades-eq-9v", brandId: "br-redken", productLineId: "pl-shades-eq",  shadeCode: "9V",  level: 9, sizeGrams: 60, serviceCategoryId: "toner" },
  { id: "p-shades-eq-7t", brandId: "br-redken", productLineId: "pl-shades-eq",  shadeCode: "7T",  level: 7, sizeGrams: 60, serviceCategoryId: "toner" },
  { id: "p-acidic-bond",  brandId: "br-redken", productLineId: "pl-bonding",    shadeCode: "Bonding",       sizeGrams: 250, serviceCategoryId: "treatment" },
  { id: "p-igora-l6",     brandId: "br-schwarz",productLineId: "pl-igora",      shadeCode: "6-0", level: 6, sizeGrams: 60, serviceCategoryId: "color" },
  { id: "p-igora-l8",     brandId: "br-schwarz",productLineId: "pl-igora",      shadeCode: "8-0", level: 8, sizeGrams: 60, serviceCategoryId: "color" },
  { id: "p-blondme",      brandId: "br-schwarz",productLineId: "pl-blondme",    shadeCode: "Premium 9+",    sizeGrams: 450, serviceCategoryId: "highlights" },
  { id: "p-olaplex-1",    brandId: "br-olaplex",productLineId: "pl-olaplex",    shadeCode: "No.1",          sizeGrams: 525, serviceCategoryId: "treatment" },
  { id: "p-olaplex-2",    brandId: "br-olaplex",productLineId: "pl-olaplex",    shadeCode: "No.2",          sizeGrams: 525, serviceCategoryId: "treatment" },
  { id: "p-k18-mask",     brandId: "br-k18",    productLineId: "pl-k18",        shadeCode: "Mask",          sizeGrams: 150, serviceCategoryId: "treatment" },
  { id: "p-gk-keratin",   brandId: "br-gk",     productLineId: "pl-gk",         shadeCode: "The Best",      sizeGrams: 1000, serviceCategoryId: "straightening" },
];

const INVENTORY_TIMESTAMP = "2026-05-09T08:00:00.000Z";

const INVENTORY_ITEMS: InventoryItem[] = [
  { id: "inv-majirel-l5",   salonId: SALON_ID, productId: "p-majirel-l5",   unitsInStock: 14, minStock: 6, costUsd: 7.20, sellingPriceUsd: 16.00, marginPct: 55, barcode: "8410741000115", isVisible: true, updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-majirel-l6",   salonId: SALON_ID, productId: "p-majirel-l6",   unitsInStock: 6,  minStock: 8, costUsd: 7.20, sellingPriceUsd: 16.00, marginPct: 55, barcode: "8410741000122", isVisible: true, updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-majirel-l7",   salonId: SALON_ID, productId: "p-majirel-l7",   unitsInStock: 3,  minStock: 6, costUsd: 7.20, sellingPriceUsd: 16.00, marginPct: 55, barcode: "8410741000139", isVisible: true, updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-majirel-l8",   salonId: SALON_ID, productId: "p-majirel-l8",   unitsInStock: 9,  minStock: 5, costUsd: 7.20, sellingPriceUsd: 16.00, marginPct: 55, barcode: "8410741000146", isVisible: true, updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-majirel-l9",   salonId: SALON_ID, productId: "p-majirel-l9",   unitsInStock: 12, minStock: 5, costUsd: 7.20, sellingPriceUsd: 16.00, marginPct: 55, barcode: "8410741000153", isVisible: true, updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-majirel-l10",  salonId: SALON_ID, productId: "p-majirel-l10",  unitsInStock: 4,  minStock: 4, costUsd: 7.20, sellingPriceUsd: 16.00, marginPct: 55, barcode: "8410741000160", isVisible: true, updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-dia-l6",       salonId: SALON_ID, productId: "p-dia-l6",       unitsInStock: 8,  minStock: 4, costUsd: 6.80, sellingPriceUsd: 14.00, marginPct: 51, barcode: null, isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-dia-l9",       salonId: SALON_ID, productId: "p-dia-l9",       unitsInStock: 5,  minStock: 4, costUsd: 6.80, sellingPriceUsd: 14.00, marginPct: 51, barcode: null, isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-blond-studio", salonId: SALON_ID, productId: "p-blond-studio", unitsInStock: 4,  minStock: 3, costUsd: 28.00,sellingPriceUsd: 65.00, marginPct: 56, barcode: "3474630014725", isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-koleston-l5",  salonId: SALON_ID, productId: "p-koleston-l5",  unitsInStock: 7,  minStock: 5, costUsd: 7.50, sellingPriceUsd: 17.00, marginPct: 56, barcode: "4015600121525", isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-koleston-l7",  salonId: SALON_ID, productId: "p-koleston-l7",  unitsInStock: 5,  minStock: 5, costUsd: 7.50, sellingPriceUsd: 17.00, marginPct: 56, barcode: "4015600121594", isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-blondor",      salonId: SALON_ID, productId: "p-blondor",      unitsInStock: 3,  minStock: 3, costUsd: 24.00,sellingPriceUsd: 55.00, marginPct: 56, barcode: "4015600002923", isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-color-touch",  salonId: SALON_ID, productId: "p-color-touch",  unitsInStock: 6,  minStock: 4, costUsd: 6.00, sellingPriceUsd: 14.00, marginPct: 57, barcode: null, isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-shades-eq-9v", salonId: SALON_ID, productId: "p-shades-eq-9v", unitsInStock: 4,  minStock: 4, costUsd: 9.00, sellingPriceUsd: 22.00, marginPct: 59, barcode: null, isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-shades-eq-7t", salonId: SALON_ID, productId: "p-shades-eq-7t", unitsInStock: 6,  minStock: 4, costUsd: 9.00, sellingPriceUsd: 22.00, marginPct: 59, barcode: null, isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-acidic-bond",  salonId: SALON_ID, productId: "p-acidic-bond",  unitsInStock: 5,  minStock: 3, costUsd: 14.00,sellingPriceUsd: 32.00, marginPct: 56, barcode: null, isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-igora-l6",     salonId: SALON_ID, productId: "p-igora-l6",     unitsInStock: 5,  minStock: 4, costUsd: 6.50, sellingPriceUsd: 14.00, marginPct: 54, barcode: null, isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-igora-l8",     salonId: SALON_ID, productId: "p-igora-l8",     unitsInStock: 3,  minStock: 3, costUsd: 6.50, sellingPriceUsd: 14.00, marginPct: 54, barcode: null, isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-blondme",      salonId: SALON_ID, productId: "p-blondme",      unitsInStock: 2,  minStock: 3, costUsd: 27.00,sellingPriceUsd: 60.00, marginPct: 55, barcode: null, isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-olaplex-1",    salonId: SALON_ID, productId: "p-olaplex-1",    unitsInStock: 4,  minStock: 2, costUsd: 38.00,sellingPriceUsd: 88.00, marginPct: 57, barcode: "896364002374", isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-olaplex-2",    salonId: SALON_ID, productId: "p-olaplex-2",    unitsInStock: 3,  minStock: 2, costUsd: 38.00,sellingPriceUsd: 88.00, marginPct: 57, barcode: "896364002381", isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-k18-mask",     salonId: SALON_ID, productId: "p-k18-mask",     unitsInStock: 2,  minStock: 2, costUsd: 32.00,sellingPriceUsd: 75.00, marginPct: 57, barcode: null, isVisible: true,  updatedAt: INVENTORY_TIMESTAMP },
  { id: "inv-gk-keratin",   salonId: SALON_ID, productId: "p-gk-keratin",   unitsInStock: 1,  minStock: 2, costUsd: 95.00,sellingPriceUsd: 220.00,marginPct: 57, barcode: null, isVisible: false, updatedAt: INVENTORY_TIMESTAMP },
];

// ── Marketplace banners ────────────────────────────────────────────

const MARKETPLACE: MarketplaceBanner[] = [
  { id: "mkt-access-loreal", variant: "dark",  brandLine: "ACCESS",            title: "L'Oréal Pro Hub", subtitle: "Education, formulas, and certifications", ctaLabel: "Open hub" },
  { id: "mkt-serie-expert",  variant: "rose",  eyebrow: "More performant",     title: "Serie Expert",    subtitle: "The hair tech pioneer",                   ctaLabel: "Explore line" },
  { id: "mkt-metal-detox",   variant: "cream", eyebrow: "Scientific discovery", title: "Metal Detox",    subtitle: "True-to-one, long lasting color",         ctaLabel: "Learn more" },
];

// ── Historical analytics aggregates ────────────────────────────────

const MONTH_ANCHORS: { monthStart: string; label: string }[] = [
  { monthStart: "2025-06-01", label: "Jun 2025" },
  { monthStart: "2025-07-01", label: "Jul 2025" },
  { monthStart: "2025-08-01", label: "Aug 2025" },
  { monthStart: "2025-09-01", label: "Sep 2025" },
  { monthStart: "2025-10-01", label: "Oct 2025" },
  { monthStart: "2025-11-01", label: "Nov 2025" },
  { monthStart: "2025-12-01", label: "Dec 2025" },
  { monthStart: "2026-01-01", label: "Jan 2026" },
  { monthStart: "2026-02-01", label: "Feb 2026" },
  { monthStart: "2026-03-01", label: "Mar 2026" },
  { monthStart: "2026-04-01", label: "Apr 2026" },
  { monthStart: "2026-05-01", label: "May 2026" },
];

const HISTORICAL_REVENUE_PER_VISIT_CENTS = 28000; // ~280 ILS per visit

const STAFF_MONTHLY_DEFINITIONS: Array<Record<string, number>> = [
  { e1: 17, e2: 13, e3: 11, e4: 9,  e5: 8 },
  { e1: 18, e2: 14, e3: 12, e4: 10, e5: 8 },
  { e1: 19, e2: 14, e3: 13, e4: 11, e5: 9 },
  { e1: 17, e2: 13, e3: 12, e4: 10, e5: 9 },
  { e1: 18, e2: 14, e3: 13, e4: 11, e5: 10 },
  { e1: 17, e2: 13, e3: 12, e4: 10, e5: 9 },
  { e1: 16, e2: 12, e3: 12, e4: 9,  e5: 9 },
  { e1: 17, e2: 13, e3: 13, e4: 10, e5: 10 },
  { e1: 17, e2: 14, e3: 13, e4: 11, e5: 10 },
  { e1: 18, e2: 14, e3: 14, e4: 12, e5: 11 },
  { e1: 19, e2: 15, e3: 14, e4: 12, e5: 11 },
  { e1: 19, e2: 16, e3: 15, e4: 12, e5: 12 },
];

const SERVICES_BY_CATEGORY_DEFINITIONS: Array<Record<ServiceCategoryId, number>> = [
  { color: 48, highlights: 28, toner: 25, straightening: 14, treatment: 25, cut: 24, other: 0 },
  { color: 50, highlights: 28, toner: 26, straightening: 15, treatment: 26, cut: 24, other: 0 },
  { color: 50, highlights: 30, toner: 26, straightening: 15, treatment: 27, cut: 25, other: 0 },
  { color: 46, highlights: 26, toner: 24, straightening: 13, treatment: 24, cut: 23, other: 0 },
  { color: 48, highlights: 28, toner: 25, straightening: 14, treatment: 26, cut: 24, other: 0 },
  { color: 45, highlights: 25, toner: 24, straightening: 13, treatment: 24, cut: 22, other: 0 },
  { color: 44, highlights: 24, toner: 22, straightening: 12, treatment: 22, cut: 21, other: 0 },
  { color: 47, highlights: 27, toner: 25, straightening: 14, treatment: 25, cut: 22, other: 0 },
  { color: 48, highlights: 28, toner: 25, straightening: 15, treatment: 26, cut: 22, other: 0 },
  { color: 49, highlights: 30, toner: 26, straightening: 15, treatment: 26, cut: 23, other: 0 },
  { color: 50, highlights: 31, toner: 27, straightening: 16, treatment: 26, cut: 24, other: 0 },
  { color: 51, highlights: 32, toner: 28, straightening: 16, treatment: 27, cut: 25, other: 0 },
];

const PRODUCT_USAGE_DEFINITIONS: Array<Record<ServiceCategoryId, number>> = [
  { color: 900, highlights: 510, toner: 380, straightening: 150, treatment: 245, cut: 0, other: 0 },
  { color: 950, highlights: 530, toner: 400, straightening: 150, treatment: 250, cut: 0, other: 0 },
  { color: 980, highlights: 550, toner: 410, straightening: 155, treatment: 255, cut: 0, other: 0 },
  { color: 890, highlights: 500, toner: 380, straightening: 140, treatment: 240, cut: 0, other: 0 },
  { color: 940, highlights: 520, toner: 390, straightening: 150, treatment: 250, cut: 0, other: 0 },
  { color: 870, highlights: 490, toner: 370, straightening: 135, treatment: 235, cut: 0, other: 0 },
  { color: 830, highlights: 460, toner: 350, straightening: 130, treatment: 230, cut: 0, other: 0 },
  { color: 920, highlights: 510, toner: 380, straightening: 145, treatment: 245, cut: 0, other: 0 },
  { color: 960, highlights: 540, toner: 400, straightening: 150, treatment: 250, cut: 0, other: 0 },
  { color: 970, highlights: 555, toner: 405, straightening: 152, treatment: 255, cut: 0, other: 0 },
  { color: 990, highlights: 565, toner: 410, straightening: 156, treatment: 258, cut: 0, other: 0 },
  { color: 1010,highlights: 580, toner: 420, straightening: 160, treatment: 265, cut: 0, other: 0 },
];

const MONTHLY_PRODUCT_COST_USD: number[] = [
  7020, 7380, 7620, 6920, 7280, 6780, 6440, 7100, 7510, 7700, 7920, 8140,
];

function buildMonthlyAnalytics(): MonthlyAnalyticsRow[] {
  return MONTH_ANCHORS.map((anchor, idx) => {
    const staffAppointments = STAFF_MONTHLY_DEFINITIONS[idx];
    const totalAppointments = Object.values(staffAppointments).reduce((s, v) => s + v, 0);
    const services = SERVICES_BY_CATEGORY_DEFINITIONS[idx];
    const totalServices = Object.values(services).reduce((s, v) => s + v, 0);
    const productUsage = PRODUCT_USAGE_DEFINITIONS[idx];
    const totalProductUsageGrams = Object.values(productUsage).reduce((s, v) => s + v, 0);
    return {
      monthStart: anchor.monthStart,
      label: anchor.label,
      totalAppointments,
      totalRevenueCents: Math.round(totalAppointments * HISTORICAL_REVENUE_PER_VISIT_CENTS),
      totalProductCostCents: Math.round(MONTHLY_PRODUCT_COST_USD[idx] * 365),
      totalProductUsageGrams,
      totalServices,
      servicesByCategory: services,
      productUsageByCategory: productUsage,
      staffAppointments,
    };
  });
}

function buildDailyOptimization(): DailyOptimizationRow[] {
  const rows: DailyOptimizationRow[] = [];
  const end = new Date("2026-05-12T00:00:00.000Z");
  let seed = 42;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const cursor = new Date("2025-06-01T00:00:00.000Z");
  while (cursor <= end) {
    if (cursor.getUTCDay() !== 6) {
      const month = cursor.getUTCMonth();
      const sf = 1 + 0.15 * Math.sin(((month - 2) / 12) * Math.PI * 2);
      const totalMixes = Math.round((8 + rand() * 14) * sf);
      const reweighMixes = Math.round(totalMixes * (0.25 + rand() * 0.35));
      rows.push({
        date: cursor.toISOString().slice(0, 10),
        reweighSavingsCents:    Math.round((18 + rand() * 30) * sf * 100),
        roundDownSavingsCents:  Math.round((12 + rand() * 22) * sf * 100),
        extraChargeRevenueCents: Math.round((25 + rand() * 45) * sf * 100),
        reweighSavedGrams:      Math.round((5 + rand() * 12) * sf),
        roundDownSavedGrams:    Math.round((3 + rand() * 8) * sf),
        reweighMixes,
        totalMixes,
      });
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return rows;
}

const ANALYTICS_SNAPSHOTS: AnalyticsSnapshot[] = [
  {
    id: "analytics-rolling-12m",
    salonId: SALON_ID,
    periodStart: "2025-06-01",
    periodEnd: "2026-05-31",
    monthly: buildMonthlyAnalytics(),
    daily: buildDailyOptimization(),
  },
];

// ── Snapshot builder ───────────────────────────────────────────────

const ENABLE_SEEDED_APPOINTMENTS = false;

function buildAppointments(weekStart: Date): {
  appointments: Appointment[];
  visits: Visit[];
  visitServices: VisitService[];
  mixSessions: MixSession[];
  productUsage: ProductUsage[];
  reweighOutcomes: ReweighOutcome[];
} {
  const appointments: Appointment[] = [];
  const visits: Visit[] = [];
  const visitServices: VisitService[] = [];
  const mixSessions: MixSession[] = [];
  const productUsage: ProductUsage[] = [];
  const reweighOutcomes: ReweighOutcome[] = [];

  if (!ENABLE_SEEDED_APPOINTMENTS) {
    return { appointments, visits, visitServices, mixSessions, productUsage, reweighOutcomes };
  }

  for (const def of APPOINTMENT_DEFINITIONS) {
    const { startTime, endTime } = buildAppointmentTimes(
      weekStart,
      def.dayOffset,
      def.startHour,
      def.startMinute,
      def.durationMinutes,
    );

    const live = LIVE_SERVICE_INDEX.get(def.id);
    const status = def.status ?? (live ? "in-progress" : "confirmed");
    const visitId = live ? `v-${def.id}` : undefined;

    const appointment: Appointment = {
      id: def.id,
      salonId: SALON_ID,
      staffMemberId: def.staffMemberId,
      customerId: def.customerId,
      customerName: customerDisplayName(def.customerId),
      serviceId: def.serviceId,
      serviceName: def.serviceName,
      serviceCategoryId: def.serviceCategoryId,
      startTime,
      endTime,
      status,
      notes: def.notes,
      visitId,
      segments: [
        {
          id: `seg-${def.id}-0`,
          appointmentId: def.id,
          segmentType: "service",
          label: def.serviceName,
          startTime,
          endTime,
          sortOrder: 0,
        },
      ],
    };
    appointments.push(appointment);

    if (live) {
      const visit: Visit = {
        id: visitId!,
        salonId: SALON_ID,
        customerId: def.customerId,
        appointmentId: def.id,
        staffMemberId: def.staffMemberId,
        startedAt: startTime,
        status: live.status === "done" ? "completed" : "active",
        totalRevenueCents: priceForService(def.serviceId),
        totalMaterialCostCents: materialForService(def.serviceId),
      };
      visits.push(visit);

      const visitServiceId = `vs-${def.id}`;
      const vs: VisitService = {
        id: visitServiceId,
        visitId: visitId!,
        serviceId: def.serviceId,
        staffMemberId: def.staffMemberId,
        assignedStaffIds: live.assignedStaffIds,
        startedAt: startTime,
        endedAt: live.status === "done" ? endTime : undefined,
        status: live.status,
        priceCents: priceForService(def.serviceId),
        materialCostCents: materialForService(def.serviceId),
      };
      visitServices.push(vs);

      if (live.mix) {
        const mixId = `mix-${def.id}`;
        const mixStarted = startTime;
        mixSessions.push({
          id: mixId,
          visitServiceId,
          startedAt: mixStarted,
          endedAt: live.status === "done" ? endTime : undefined,
          expectedGrams: live.mix.expectedGrams,
          actualGrams: live.mix.actualGrams,
          status: live.status === "done" ? "complete" : "in_progress",
        });

        productUsage.push({
          id: `usage-${def.id}-0`,
          mixSessionId: mixId,
          productId: live.mix.productId,
          inventoryItemId: live.mix.inventoryItemId,
          grams: live.mix.grams,
          costAtUseUsd: live.mix.costAtUseUsd,
          recordedAt: mixStarted,
        });

        if (live.mix.reweighOutcome) {
          const ro = live.mix.reweighOutcome;
          reweighOutcomes.push({
            id: `reweigh-${def.id}`,
            mixSessionId: mixId,
            expectedGrams: live.mix.expectedGrams,
            actualGrams: live.mix.actualGrams ?? live.mix.expectedGrams,
            varianceGrams: ro.varianceGrams,
            varianceValueUsd: ro.varianceValueUsd,
            outcome: ro.type,
            recordedAt: mixStarted,
          });
        }
      }
    }
  }

  return { appointments, visits, visitServices, mixSessions, productUsage, reweighOutcomes };
}

function minutesAgo(reference: Date, minutes: number): string {
  return new Date(reference.getTime() - minutes * 60_000).toISOString();
}

function buildLiveSalonVisits(reference: Date): {
  visits: Visit[];
  visitServices: VisitService[];
  mixSessions: MixSession[];
  productUsage: ProductUsage[];
  reweighOutcomes: ReweighOutcome[];
} {
  const visits: Visit[] = [];
  const visitServices: VisitService[] = [];
  const mixSessions: MixSession[] = [];
  const productUsage: ProductUsage[] = [];
  const reweighOutcomes: ReweighOutcome[] = [];

  const liveDefinitions: Array<{
    id: string;
    customerId: string;
    serviceId: string;
    staffMemberId: string;
    assignedStaffIds: string[];
    startedMinutesAgo: number;
    status: VisitServiceStatus;
    mix?: {
      productId: string;
      inventoryItemId: string;
      expectedGrams: number;
      grams: number;
      costAtUseUsd: number;
    };
  }> = [
    {
      id: "live-full-head-highlights",
      customerId: "c-live-noa-shalev",
      serviceId: "sv4",
      staffMemberId: "e2",
      assignedStaffIds: ["e2", "e1"],
      startedMinutesAgo: 68,
      status: "mix_in_progress",
      mix: {
        productId: "p-blondor",
        inventoryItemId: "inv-blondor",
        expectedGrams: 115,
        grams: 58,
        costAtUseUsd: 3.1,
      },
    },
    {
      id: "live-keratin",
      customerId: "c-live-dana-ron",
      serviceId: "sv7",
      staffMemberId: "e3",
      assignedStaffIds: ["e3"],
      startedMinutesAgo: 94,
      status: "active",
    },
    {
      id: "live-highlights-rinse",
      customerId: "c-live-yael-amir",
      serviceId: "sv12",
      staffMemberId: "e1",
      assignedStaffIds: ["e1", "e4"],
      startedMinutesAgo: 18,
      status: "active",
    },
  ];

  for (const def of liveDefinitions) {
    const startedAt = minutesAgo(reference, def.startedMinutesAgo);
    const visitId = `visit-${def.id}`;
    const visitServiceId = `vs-${def.id}`;
    visits.push({
      id: visitId,
      salonId: SALON_ID,
      customerId: def.customerId,
      staffMemberId: def.staffMemberId,
      startedAt,
      status: "active",
      notes: undefined,
      totalRevenueCents: priceForService(def.serviceId),
      totalMaterialCostCents: materialForService(def.serviceId),
    });

    visitServices.push({
      id: visitServiceId,
      visitId,
      serviceId: def.serviceId,
      staffMemberId: def.staffMemberId,
      assignedStaffIds: def.assignedStaffIds,
      startedAt,
      status: def.status,
      priceCents: priceForService(def.serviceId),
      materialCostCents: materialForService(def.serviceId),
    });

    if (def.mix) {
      const mixId = `mix-${def.id}`;
      mixSessions.push({
        id: mixId,
        visitServiceId,
        startedAt,
        expectedGrams: def.mix.expectedGrams,
        status: "in_progress",
      });
      productUsage.push({
        id: `usage-${def.id}`,
        mixSessionId: mixId,
        productId: def.mix.productId,
        inventoryItemId: def.mix.inventoryItemId,
        grams: def.mix.grams,
        costAtUseUsd: def.mix.costAtUseUsd,
        recordedAt: startedAt,
      });
    }
  }

  return { visits, visitServices, mixSessions, productUsage, reweighOutcomes };
}

function customerDisplayName(customerId: string): string {
  const c = CUSTOMER_DEFINITIONS.find((x) => x.id === customerId);
  if (!c) return customerId;
  return [c.firstName, c.lastName].filter(Boolean).join(" ");
}

function priceForService(serviceId: string | undefined): number {
  if (!serviceId) return 0;
  const svc = SERVICES.find((s) => s.id === serviceId);
  return svc?.defaultPriceCents ?? 0;
}

function materialForService(serviceId: string | undefined): number {
  if (!serviceId) return 0;
  const svc = SERVICES.find((s) => s.id === serviceId);
  return svc?.defaultMaterialCostCents ?? 0;
}

/**
 * Builds the canonical seed data snapshot. The week anchor defaults to the
 * Sunday before the supplied reference date so the schedule grid always has
 * fresh appointments around "today".
 */
export function buildCRMSeedSnapshot(reference: Date = new Date()): CRMDataSnapshot {
  const weekStart = startOfWeekDate(reference);
  const appointmentSeedData = buildAppointments(weekStart);
  const liveSalonData = buildLiveSalonVisits(reference);

  return {
    salonId: SALON_ID,
    salons: SALONS,
    staff: STAFF,
    customers: CUSTOMERS,
    serviceCategories: SERVICE_CATEGORIES,
    services: SERVICES,
    appointments: appointmentSeedData.appointments,
    visits: [...appointmentSeedData.visits, ...liveSalonData.visits],
    visitServices: [...appointmentSeedData.visitServices, ...liveSalonData.visitServices],
    brands: BRANDS,
    productLines: PRODUCT_LINES,
    products: PRODUCTS,
    inventoryItems: INVENTORY_ITEMS,
    mixSessions: [...appointmentSeedData.mixSessions, ...liveSalonData.mixSessions],
    productUsage: [...appointmentSeedData.productUsage, ...liveSalonData.productUsage],
    reweighOutcomes: [...appointmentSeedData.reweighOutcomes, ...liveSalonData.reweighOutcomes],
    analyticsSnapshots: ANALYTICS_SNAPSHOTS,
    systemState: {
      activeDate: addDaysToDate(weekStart, 3).toISOString().slice(0, 10),
      bluetooth: {
        connected: false,
        deviceLabel: "Spectra Scale 0142",
      },
      notifications: {
        unreadCount: 3,
        hasUrgent: true,
      },
      comingSoonFeatures: {
        addClientWizard:    true,
        appointmentDetails: true,
        marketplaceCta:     true,
        notificationsPanel: true,
        favoritesPanel:     true,
        bluetoothPairing:   true,
        liveServiceOptions: true,
        startMixWizard:     true,
        reweighDevice:      true,
        rebookingWizard:    true,
        reorderWizard:      true,
        staffDetails:       true,
        analyticsDrilldown: true,
      },
      marketplace: MARKETPLACE,
    },
  };
}

export const DEFAULT_CRM_SEED: CRMDataSnapshot = buildCRMSeedSnapshot();

export const SEED_CONSTANTS = {
  SALON_ID,
};
