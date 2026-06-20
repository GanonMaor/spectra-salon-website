export type CalendarActionType = "appointment" | "break" | "time-block" | "internal-task" | "other";

export interface CalendarAction {
  id: CalendarActionType;
  label: string;
  description: string;
  icon: string;
}

export const CALENDAR_ACTIONS: CalendarAction[] = [
  { id: "appointment",   label: "Client Appointment", description: "Book a service for a client",         icon: "👤" },
  { id: "break",         label: "Break",              description: "Personal or team break",              icon: "☕" },
  { id: "time-block",    label: "Time Block",         description: "Block time for preparation or admin", icon: "🔒" },
  { id: "internal-task", label: "Internal Task",      description: "Staff task, training, or meeting",    icon: "📋" },
  { id: "other",         label: "Other",              description: "Custom calendar entry",               icon: "📅" },
];

export interface ClientRecord {
  id: string;
  name: string;
  phone?: string;
  since?: string;
  lastVisit?: string;
}

export const CLIENT_DATABASE: ClientRecord[] = [
  { id: "cl-daniel-m", name: "Daniel Marom",     phone: "054-123-4567", since: "Mar 2021", lastVisit: "2 weeks ago" },
  { id: "cl-noa-f",    name: "Noa Friedman",     phone: "052-987-6543", since: "Jan 2022", lastVisit: "3 days ago" },
  { id: "cl-rina-k",   name: "Rina Katz",        phone: "050-555-1234", since: "Nov 2020", lastVisit: "1 week ago" },
  { id: "cl-gili-a",   name: "Gili Avraham",     phone: "053-222-3344", since: "Aug 2023", lastVisit: "5 days ago" },
  { id: "cl-shani-g",  name: "Shani Gold",       phone: "054-888-9900", since: "Mar 2024", lastVisit: "Today" },
  { id: "cl-efrat-d",  name: "Efrat Dahan",      phone: "052-111-2233", since: "Jun 2022", lastVisit: "Yesterday" },
  { id: "cl-miri-a",   name: "Miri Azoulay",     phone: "050-444-5566", since: "Sep 2021", lastVisit: "4 days ago" },
  { id: "cl-yossi-m",  name: "Yossi Malka",      phone: "053-777-8899", since: "Feb 2023", lastVisit: "1 week ago" },
  { id: "cl-amit-r",   name: "Amit Regev",       phone: "054-333-4455", since: "May 2024", lastVisit: "2 weeks ago" },
  { id: "cl-karen-s",  name: "Karen Stern",      phone: "052-666-7788", since: "Dec 2022", lastVisit: "3 weeks ago" },
  { id: "cl-tamar-l",  name: "Tamar Levy",       phone: "050-999-0011", since: "Apr 2023", lastVisit: "6 days ago" },
  { id: "cl-oren-b",   name: "Oren Benayoun",    phone: "053-444-2211", since: "Jul 2024", lastVisit: "10 days ago" },
];

export interface Department {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const DEPARTMENTS: Department[] = [
  { id: "hair",       label: "Hair",       icon: "✂️",  description: "Cut, color, styling, and treatments" },
  { id: "cosmetics",  label: "Cosmetics",  icon: "💄",  description: "Makeup, brows, lashes, and skincare" },
  { id: "spa",        label: "Spa",        icon: "🧖",  description: "Massage, body treatments, and nails" },
];

export interface ServiceCategory {
  id: string;
  departmentId: string;
  label: string;
  image: string;
  serviceCount: number;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: "color",         departmentId: "hair", label: "Color",             image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&h=200&fit=crop", serviceCount: 6 },
  { id: "highlights",    departmentId: "hair", label: "Highlights & Foils", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=200&fit=crop", serviceCount: 5 },
  { id: "toner-wash",    departmentId: "hair", label: "Toner & Wash",      image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=300&h=200&fit=crop", serviceCount: 4 },
  { id: "straightening", departmentId: "hair", label: "Straightening",     image: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=300&h=200&fit=crop", serviceCount: 3 },
  { id: "treatments",    departmentId: "hair", label: "Treatments",        image: "https://images.unsplash.com/photo-1562322140-8baeacacf3df?w=300&h=200&fit=crop", serviceCount: 5 },
  { id: "extensions",    departmentId: "hair", label: "Hair Extensions",   image: "https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=300&h=200&fit=crop", serviceCount: 3 },
  { id: "cut-style",     departmentId: "hair", label: "Cut & Style",       image: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=300&h=200&fit=crop", serviceCount: 7 },
  { id: "makeup",        departmentId: "cosmetics", label: "Makeup",       image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=300&h=200&fit=crop", serviceCount: 4 },
  { id: "brows-lashes",  departmentId: "cosmetics", label: "Brows & Lashes", image: "https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=300&h=200&fit=crop", serviceCount: 5 },
  { id: "massage",       departmentId: "spa",  label: "Massage",           image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop", serviceCount: 4 },
  { id: "nails",         departmentId: "spa",  label: "Nails",             image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=300&h=200&fit=crop", serviceCount: 6 },
];

export interface ServiceItem {
  id: string;
  categoryId: string;
  label: string;
  durationMin: number;
  price: number;
  popular?: boolean;
}

export const SERVICES: ServiceItem[] = [
  // Color
  { id: "root-color",       categoryId: "color", label: "Root Color",            durationMin: 90,  price: 180 },
  { id: "full-color",       categoryId: "color", label: "Full Color",            durationMin: 150, price: 280, popular: true },
  { id: "color-correction", categoryId: "color", label: "Color Correction",      durationMin: 240, price: 450 },
  { id: "ammonia-free",     categoryId: "color", label: "Ammonia-Free Color",    durationMin: 120, price: 220 },
  { id: "gray-coverage",    categoryId: "color", label: "Gray Coverage",         durationMin: 100, price: 200 },
  { id: "fashion-color",    categoryId: "color", label: "Fashion Color",         durationMin: 180, price: 350 },
  // Highlights
  { id: "full-highlights",  categoryId: "highlights", label: "Full Highlights",     durationMin: 180, price: 380, popular: true },
  { id: "half-head",        categoryId: "highlights", label: "Half Head Highlights", durationMin: 120, price: 260 },
  { id: "balayage",         categoryId: "highlights", label: "Balayage",             durationMin: 150, price: 320, popular: true },
  { id: "babylights",       categoryId: "highlights", label: "Babylights",           durationMin: 200, price: 400 },
  { id: "ombre",            categoryId: "highlights", label: "Ombré",                durationMin: 140, price: 300 },
  // Toner & Wash
  { id: "toner-refresh",    categoryId: "toner-wash", label: "Toner Refresh",   durationMin: 45,  price: 80 },
  { id: "gloss-treatment",  categoryId: "toner-wash", label: "Gloss Treatment", durationMin: 40,  price: 90 },
  { id: "color-wash",       categoryId: "toner-wash", label: "Color Wash",      durationMin: 30,  price: 60 },
  { id: "deep-condition",   categoryId: "toner-wash", label: "Deep Condition",  durationMin: 35,  price: 70 },
  // Straightening
  { id: "keratin",          categoryId: "straightening", label: "Keratin Treatment",    durationMin: 180, price: 500, popular: true },
  { id: "brazilian",        categoryId: "straightening", label: "Brazilian Blowout",    durationMin: 150, price: 420 },
  { id: "japanese",         categoryId: "straightening", label: "Japanese Straightening", durationMin: 240, price: 600 },
  // Treatments
  { id: "olaplex",          categoryId: "treatments", label: "Olaplex Treatment",   durationMin: 45, price: 120 },
  { id: "scalp-treatment",  categoryId: "treatments", label: "Scalp Treatment",     durationMin: 40, price: 100 },
  { id: "protein",          categoryId: "treatments", label: "Protein Treatment",   durationMin: 50, price: 130 },
  { id: "moisture",         categoryId: "treatments", label: "Moisture Therapy",    durationMin: 40, price: 95 },
  { id: "botox-hair",       categoryId: "treatments", label: "Hair Botox",          durationMin: 90, price: 250 },
  // Cut & Style
  { id: "women-cut",        categoryId: "cut-style", label: "Women's Cut",      durationMin: 45,  price: 120, popular: true },
  { id: "men-cut",          categoryId: "cut-style", label: "Men's Cut",        durationMin: 30,  price: 70 },
  { id: "blowdry",          categoryId: "cut-style", label: "Blow-dry",         durationMin: 35,  price: 80 },
  { id: "updo",             categoryId: "cut-style", label: "Updo / Event",     durationMin: 60,  price: 180 },
  { id: "kids-cut",         categoryId: "cut-style", label: "Kids' Cut",        durationMin: 25,  price: 50 },
  { id: "trim",             categoryId: "cut-style", label: "Trim",             durationMin: 20,  price: 45 },
  { id: "beard-trim",       categoryId: "cut-style", label: "Beard Trim",       durationMin: 20,  price: 40 },
];
