/**
 * Calendar / booking iconography.
 *
 * Classic, line-based lucide icons (no emoji) mapped to the calendar's
 * domain objects: entry types, service categories, salon departments,
 * workflow segment types, and resource types. Mapping service icons by the
 * canonical CRM category id keeps every service — including ones created at
 * runtime — visually tagged with a clear, consistent symbol.
 */

import {
  Scissors,
  Palette,
  Sparkles,
  Droplet,
  Droplets,
  Flame,
  Leaf,
  Tag,
  CalendarPlus,
  CalendarDays,
  Coffee,
  Lock,
  ClipboardList,
  Brush,
  Flower2,
  Armchair,
  Wind,
  Hourglass,
  LogIn,
  LogOut,
  Box,
  type LucideIcon,
} from "lucide-react";
import type { ServiceCategoryId, SegmentType } from "../data/crmTypes";
import type { EntryType } from "./bookingFlowTypes";
import type { ResourceType } from "./catalogTypes";

/** Calendar entry types (the "what would you like to create?" step). */
export const ENTRY_TYPE_ICONS: Record<EntryType, LucideIcon> = {
  appointment: CalendarPlus,
  break: Coffee,
  "time-block": Lock,
  "internal-task": ClipboardList,
  other: CalendarDays,
};

/**
 * Service categories. Used both for category cards and for individual
 * services (a service inherits its category's icon).
 */
export const SERVICE_CATEGORY_ICONS: Record<ServiceCategoryId, LucideIcon> = {
  color: Palette,
  highlights: Sparkles,
  toner: Droplet,
  straightening: Flame,
  treatment: Leaf,
  cut: Scissors,
  other: Tag,
};

/** Workflow stage / segment types. */
export const SEGMENT_TYPE_ICONS: Record<SegmentType, LucideIcon> = {
  service: Scissors,
  apply: Brush,
  wait: Hourglass,
  wash: Droplets,
  dry: Wind,
  checkin: LogIn,
  checkout: LogOut,
};

/** Salon resources. */
export const RESOURCE_TYPE_ICONS: Record<ResourceType, LucideIcon> = {
  chair: Armchair,
  "wash-station": Droplets,
  "treatment-room": Flower2,
  "color-station": Palette,
  other: Box,
};

/** Icon for a service, derived from its CRM category. */
export function iconForServiceCategory(categoryId: ServiceCategoryId | undefined): LucideIcon {
  return (categoryId && SERVICE_CATEGORY_ICONS[categoryId]) || Tag;
}

/**
 * Departments are user-editable (name only), so the icon is inferred from the
 * department name in either English or Hebrew, with a neutral fallback.
 */
export function iconForDepartment(name: string): LucideIcon {
  const n = name.toLowerCase();
  if (/(hair|שיער|שער|מספרה)/.test(n)) return Scissors;
  if (/(cosmet|makeup|make-up|brow|lash|skin|איפור|קוסמ|גבות|ריסים|עור)/.test(n)) return Brush;
  if (/(spa|nail|massage|ספא|עיסוי|ציפורניים|גוף)/.test(n)) return Flower2;
  return Sparkles;
}
