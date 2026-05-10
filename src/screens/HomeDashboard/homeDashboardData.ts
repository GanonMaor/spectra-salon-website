/**
 * Home Dashboard mock data + types.
 *
 * Models follow the spec:
 *   Client → Visit → Service → Mix → Weigh → Finalize → Outcome
 *
 * Everything here is mock data for the static UI phase. No backend wiring.
 */

import type { MarketplaceVariant } from "./homeDashboardTokens";

/* ── Types ────────────────────────────────────────────────────────── */

export type ServiceType =
  | "toner"
  | "color"
  | "straightener"
  | "highlights"
  | "treatment";

export type LiveServiceStatus =
  | "scheduled"
  | "active"
  | "mix_in_progress"
  | "done"
  | "reweigh_pending";

export interface Stylist {
  id: string;
  name: string;
  avatarSeed: string;
  initials: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientAvatarSeed: string;
  clientInitials: string;
  serviceType: ServiceType;
  serviceName: string;
  serviceCategory: string;
  startTime: string;
  startLabel: string;
}

export interface LiveService {
  id: string;
  name: string;
  serviceType: ServiceType;
  category: string;
  status: LiveServiceStatus;
  startedAt?: string;
  elapsedLabel: string;
  assignedStylists: Stylist[];
  hasOpenMix: boolean;
}

export interface LiveClient {
  id: string;
  visitId: string;
  name: string;
  avatarSeed: string;
  initials: string;
  arrivalLabel: string;
  isVip?: boolean;
  services: LiveService[];
}

export interface MarketplaceBanner {
  id: string;
  variant: MarketplaceVariant;
  eyebrow?: string;
  brandLine?: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
}

export type DateStripLabelKey =
  | "daySun"
  | "dayMon"
  | "dayTue"
  | "dayWed"
  | "dayThu"
  | "dayFri"
  | "daySat";

export interface DateStripDay {
  id: string;
  shortLabel: DateStripLabelKey;
  dayNumber: string;
  isActive: boolean;
}

export interface BluetoothState {
  connected: boolean;
  deviceLabel: string;
}

export interface NotificationState {
  unreadCount: number;
  hasUrgent: boolean;
}

/* ── Bluetooth + Notifications ───────────────────────────────────── */

/**
 * Bluetooth scale shows as disconnected by default to demo the manual mode
 * hint. Flip `connected` to `true` once the BLE integration lands.
 */
export const MOCK_BLUETOOTH: BluetoothState = {
  connected: false,
  deviceLabel: "Spectra Scale 0142",
};

export const MOCK_NOTIFICATIONS: NotificationState = {
  unreadCount: 3,
  hasUrgent: true,
};

/* ── Marketplace ─────────────────────────────────────────────────── */

export const MOCK_MARKETPLACE: MarketplaceBanner[] = [
  {
    id: "mkt-access-loreal",
    variant: "dark",
    brandLine: "ACCESS",
    title: "L'Oréal Pro Hub",
    subtitle: "Education, formulas, and certifications",
    ctaLabel: "Open hub",
  },
  {
    id: "mkt-serie-expert",
    variant: "rose",
    eyebrow: "More performant",
    title: "Serie Expert",
    subtitle: "The hair tech pioneer",
    ctaLabel: "Explore line",
  },
  {
    id: "mkt-metal-detox",
    variant: "cream",
    eyebrow: "Scientific discovery",
    title: "Metal Detox",
    subtitle: "True-to-one, long lasting color",
    ctaLabel: "Learn more",
  },
];

/* ── Up Next ─────────────────────────────────────────────────────── */

export const MOCK_DATE_STRIP: DateStripDay[] = [
  { id: "day-sun-29", shortLabel: "daySun", dayNumber: "29", isActive: false },
  { id: "day-mon-30", shortLabel: "dayMon", dayNumber: "30", isActive: true },
  { id: "day-tue-01", shortLabel: "dayTue", dayNumber: "01", isActive: false },
  { id: "day-wed-02", shortLabel: "dayWed", dayNumber: "02", isActive: false },
  { id: "day-thu-03", shortLabel: "dayThu", dayNumber: "03", isActive: false },
  { id: "day-fri-04", shortLabel: "dayFri", dayNumber: "04", isActive: false },
  { id: "day-sat-05", shortLabel: "daySat", dayNumber: "05", isActive: false },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "appt-001",
    clientName: "Hannah Stein",
    clientAvatarSeed: "hannah-stein",
    clientInitials: "HS",
    serviceType: "toner",
    serviceName: "Toner",
    serviceCategory: "Full Head",
    startTime: "10:00",
    startLabel: "10:00am",
  },
  {
    id: "appt-002",
    clientName: "Lisa Chen",
    clientAvatarSeed: "lisa-chen",
    clientInitials: "LC",
    serviceType: "color",
    serviceName: "Color",
    serviceCategory: "Full Head",
    startTime: "11:30",
    startLabel: "11:30am",
  },
  {
    id: "appt-003",
    clientName: "Maya Levi",
    clientAvatarSeed: "maya-levi",
    clientInitials: "ML",
    serviceType: "straightener",
    serviceName: "Straightener",
    serviceCategory: "Full Head",
    startTime: "13:30",
    startLabel: "1:30pm",
  },
];

/* ── Live Clients ────────────────────────────────────────────────── */

const STYLIST_DANA: Stylist = {
  id: "stl-dana",
  name: "Dana Levy",
  avatarSeed: "dana-levy",
  initials: "DL",
};

const STYLIST_YAEL: Stylist = {
  id: "stl-yael",
  name: "Yael Ben-David",
  avatarSeed: "yael-bd",
  initials: "YB",
};

const STYLIST_NOA: Stylist = {
  id: "stl-noa",
  name: "Noa Shapira",
  avatarSeed: "noa-shapira",
  initials: "NS",
};

export const MOCK_LIVE_CLIENTS: LiveClient[] = [
  {
    id: "live-001",
    visitId: "v-001",
    name: "Michaela Stone",
    avatarSeed: "michaela-stone",
    initials: "MS",
    arrivalLabel: "09:20AM",
    isVip: true,
    services: [
      {
        id: "svc-001",
        name: "Color",
        category: "Full Head",
        serviceType: "color",
        status: "mix_in_progress",
        elapsedLabel: "02:40",
        assignedStylists: [STYLIST_DANA, STYLIST_YAEL],
        hasOpenMix: true,
      },
    ],
  },
  {
    id: "live-002",
    visitId: "v-002",
    name: "Liyla Cavaliny",
    avatarSeed: "liyla-cavaliny",
    initials: "LC",
    arrivalLabel: "09:20AM",
    services: [
      {
        id: "svc-002",
        name: "Highlights",
        category: "Full Head",
        serviceType: "highlights",
        status: "active",
        elapsedLabel: "02:40",
        assignedStylists: [STYLIST_NOA],
        hasOpenMix: false,
      },
    ],
  },
  {
    id: "live-003",
    visitId: "v-003",
    name: "Neta Gertiog",
    avatarSeed: "neta-gertiog",
    initials: "NG",
    arrivalLabel: "09:20AM",
    services: [
      {
        id: "svc-003",
        name: "Treatment",
        category: "Full Head",
        serviceType: "treatment",
        status: "reweigh_pending",
        elapsedLabel: "02:40",
        assignedStylists: [STYLIST_YAEL, STYLIST_DANA],
        hasOpenMix: true,
      },
    ],
  },
  {
    id: "live-004",
    visitId: "v-004",
    name: "Dr. Sorbie",
    avatarSeed: "dr-sorbie",
    initials: "DS",
    arrivalLabel: "09:20AM",
    services: [
      {
        id: "svc-004",
        name: "Toner",
        category: "Full Head",
        serviceType: "toner",
        status: "done",
        elapsedLabel: "02:40",
        assignedStylists: [STYLIST_NOA, STYLIST_DANA],
        hasOpenMix: false,
      },
    ],
  },
];
