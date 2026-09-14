import type { ImprovementGoal, PhoneSystem, StylistCountRange } from "./types";

export const DEMO_DURATION_MINUTES = 30;

export const DEMO_SLOT_MINUTES = [9 * 60, 10 * 60 + 30, 12 * 60, 14 * 60, 16 * 60] as const;

export const DRAFT_STORAGE_KEY = "spectra.demoBooking.draft.v1";

export const BOOKINGS_STORAGE_KEY = "spectra.demoBooking.bookings.v1";

export const STEP_LABELS = ["Your details", "Schedule", "A few questions", "Confirm"] as const;

export const STYLIST_OPTIONS: ReadonlyArray<{ value: StylistCountRange; label: string }> = [
  { value: "1", label: "1 stylist" },
  { value: "2-5", label: "2 to 5 stylists" },
  { value: "6-15", label: "6 to 15 stylists" },
  { value: "16+", label: "16+ stylists" },
];

export const PHONE_SYSTEM_OPTIONS: ReadonlyArray<{ value: PhoneSystem; label: string }> = [
  { value: "fresha", label: "Fresha" },
  { value: "glossgenius", label: "GlossGenius" },
  { value: "vagaro", label: "Vagaro" },
  { value: "other", label: "Other" },
  { value: "nothing", label: "Nothing" },
];

export const IMPROVEMENT_OPTIONS: ReadonlyArray<{ value: ImprovementGoal; label: string }> = [
  { value: "reduce-color-cost", label: "Reduce color cost" },
  { value: "save-formulas", label: "Save formulas" },
  { value: "inventory", label: "Inventory" },
  { value: "salon-management", label: "Salon management" },
  { value: "full-system", label: "I want the full system" },
];

export const YES_NO_OPTIONS = [
  { value: "yes" as const, label: "Yes" },
  { value: "no" as const, label: "No" },
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

export const PHOTO_BY_STEP = [
  {
    src: "/new-home/hero-editorial.jpg",
    alt: "Colorist working with a client in a modern salon",
  },
  {
    src: "/new-home/color-bar-editorial.jpg",
    alt: "Color bar in a professional salon",
  },
  {
    src: "/new-home/owner-editorial.jpg",
    alt: "Salon owner reviewing the day",
  },
  {
    src: "/new-home/front-desk-editorial.jpg",
    alt: "Front desk in a modern salon",
  },
] as const;

export const THANK_YOU_PHOTO = {
  src: "/new-home/hero-editorial.jpg",
  alt: "Colorist working with a client in a modern salon",
} as const;
