import type {
  DeviceChoice,
  EquipmentId,
  PaymentMethod,
  StartNowStepId,
  StylistCountRange,
} from "./types";
import { START_NOW_STEPS } from "./types";

export const DRAFT_STORAGE_KEY = "spectra.startNow.draft.v1";

export const ORDERS_STORAGE_KEY = "spectra.startNow.orders.v1";

export const BOOK_DEMO_HREF = "/book-a-demo";

export const LOGIN_HREF = "/user-login?redirect=/crm/setup";

export const FIRST_POST_CONFIRM_STEP = 6;

export const STEP_LABELS = [
  "Account",
  "Equipment",
  "Device",
  "Shipping",
  "Delivery",
  "Payment",
  "Confirmed",
  "Password",
  "All set",
  "Next steps",
] as const;

export const STEP_GROUPS = [
  { id: "account", label: "Account", stepIds: ["account"] },
  { id: "equipment", label: "Equipment", stepIds: ["equipment", "device"] },
  { id: "shipping", label: "Shipping", stepIds: ["shipping", "delivery"] },
  { id: "payment", label: "Payment", stepIds: ["payment", "confirmed"] },
  { id: "access", label: "Access", stepIds: ["password", "allset"] },
  { id: "next", label: "Next steps", stepIds: ["next"] },
] as const;

export const DEFAULT_EQUIPMENT: EquipmentId[] = [
  "precision-scale",
  "tablet-stand",
  "online-setup",
];

export const EQUIPMENT_OPTIONS: ReadonlyArray<{
  id: EquipmentId;
  title: string;
  description: string;
}> = [
  {
    id: "precision-scale",
    title: "Precision Bluetooth scale",
    description: "A compatible scale for color-room measurements.",
  },
  {
    id: "tablet-stand",
    title: "Tablet stand",
    description: "A stable stand for an iPad or Android tablet.",
  },
  {
    id: "online-setup",
    title: "Guided online setup",
    description: "A short walkthrough to get Spectra ready on your tablet.",
  },
];

export const DEVICE_OPTIONS: ReadonlyArray<{
  id: DeviceChoice;
  title: string;
  description: string;
}> = [
  {
    id: "ipad",
    title: "I have an iPad",
    description: "iPad or a similar iPadOS tablet.",
  },
  {
    id: "android",
    title: "I have an Android tablet",
    description: "A recent Android tablet with a modern browser.",
  },
  {
    id: "need-recommendation",
    title: "I need a recommendation",
    description: "We will suggest a compatible tablet during setup.",
  },
];

export const PAYMENT_OPTIONS: ReadonlyArray<{
  id: PaymentMethod;
  title: string;
  description: string;
}> = [
  {
    id: "card",
    title: "Card checkout",
    description: "Simulated card authorization. No card numbers are entered here.",
  },
  {
    id: "paypal",
    title: "PayPal checkout",
    description: "Simulated PayPal handoff. No PayPal credentials are entered here.",
  },
];

export const STYLIST_OPTIONS: ReadonlyArray<{ value: StylistCountRange; label: string }> = [
  { value: "1", label: "1 stylist" },
  { value: "2-5", label: "2 to 5 stylists" },
  { value: "6-15", label: "6 to 15 stylists" },
  { value: "16+", label: "16+ stylists" },
];

export const COUNTRIES: ReadonlyArray<{ code: string; name: string }> = [
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "BR", name: "Brazil" },
  { code: "BG", name: "Bulgaria" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" },
  { code: "EG", name: "Egypt" },
  { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "GR", name: "Greece" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IN", name: "India" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KE", name: "Kenya" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MY", name: "Malaysia" },
  { code: "MX", name: "Mexico" },
  { code: "MA", name: "Morocco" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TH", name: "Thailand" },
  { code: "TR", name: "Turkey" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "VN", name: "Vietnam" },
];

/**
 * Rail photography, one entry per step index.
 *
 * `position` is an `object-position` value. The rail crops to a tall portrait
 * box, so landscape sources need a focal point or they clip to empty wall.
 */
export const PHOTO_BY_STEP = [
  { src: "/new-home/owner-editorial.jpg", position: "20% center" },
  { src: "/investor-vision/salon-ai-live-demo/color-bar-scale-bg.png", position: "35% center" },
  { src: "/new-home/color-bar-editorial.jpg", position: "center" },
  { src: "/new-home/front-desk-editorial.jpg", position: "25% center" },
  { src: "/new-home/hero-editorial.jpg", position: "80% center" },
  { src: "/new-home/front-desk-editorial.jpg", position: "80% center" },
  { src: "/new-home/owner-editorial.jpg", position: "20% center" },
  { src: "/new-home/owner-editorial.jpg", position: "20% center" },
  { src: "/new-home/color-bar-editorial.jpg", position: "center" },
  { src: "/new-home/hero-editorial.jpg", position: "80% center" },
] as const;

export function stepIdAt(index: number): StartNowStepId {
  return START_NOW_STEPS[index] ?? "account";
}

export function countryName(code: string): string {
  return COUNTRIES.find((item) => item.code === code)?.name ?? code;
}
