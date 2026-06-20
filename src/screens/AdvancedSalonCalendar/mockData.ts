import type {
  StaffMember,
  Chair,
  Room,
  Appointment,
  SalonClient,
  ScheduleOpportunity,
} from "./types";

// ── Staff ────────────────────────────────────────────────────────────────────
export const STAFF: StaffMember[] = [
  { id: "maya",   name: "Maya Goldstein", role: "Senior Colorist",   accent: "#D4571A", accentBg: "rgba(212,87,26,0.10)",  photo: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: "liam",   name: "Liam Navarro",   role: "Stylist",           accent: "#3472B8", accentBg: "rgba(52,114,184,0.10)", photo: "https://randomuser.me/api/portraits/men/32.jpg"   },
  { id: "adele",  name: "Adele Cooper",   role: "Color Specialist",  accent: "#B8891A", accentBg: "rgba(184,137,26,0.11)", photo: "https://randomuser.me/api/portraits/women/68.jpg" },
  { id: "daniel", name: "Daniel Rosen",   role: "Junior Stylist",    accent: "#3A8A62", accentBg: "rgba(58,138,98,0.10)",  photo: "https://randomuser.me/api/portraits/men/45.jpg"   },
  { id: "noa-b",  name: "Noa Berkovich",  role: "Blow-dry & Finish", accent: "#8A5AA0", accentBg: "rgba(138,90,160,0.10)", photo: "https://randomuser.me/api/portraits/women/28.jpg" },
];

// ── Chairs & Rooms ───────────────────────────────────────────────────────────
export const CHAIRS: Chair[] = [
  { id: "c1", label: "Chair 1", zone: "main" },
  { id: "c2", label: "Chair 2", zone: "main" },
  { id: "c3", label: "Chair 3", zone: "main" },
  { id: "c4", label: "Chair 4", zone: "main" },
  { id: "c5", label: "Chair 5", zone: "main" },
  { id: "w1", label: "Wash 1",  zone: "wash" },
  { id: "w2", label: "Wash 2",  zone: "wash" },
];

export const ROOMS: Room[] = [
  { id: "color-room", label: "Color Room",   type: "color-room" },
  { id: "wash-area",  label: "Wash Station", type: "wash-station" },
];

// ── Appointments ─────────────────────────────────────────────────────────────
export const APPOINTMENTS: Appointment[] = [
  {
    id: "apt-noa",
    clientName: "Noa Friedman",
    service: "Full Color",
    staffId: "maya",
    startH: 9.0,
    totalDurationH: 3.25,
    clientSavedTiming: true,
    stages: [
      { id: "noa-checkin",      label: "Check-in",          type: "checkout",      durationMin: 5,  staffId: "maya",   chairId: "c1", startH: 9.0,    status: "completed" },
      { id: "noa-consult",      label: "Consultation",      type: "consultation",  durationMin: 10, staffId: "maya",   chairId: "c1", startH: 9.083,  status: "completed" },
      { id: "noa-application",  label: "Color Application", type: "active",        durationMin: 45, staffId: "maya",   chairId: "c1", startH: 9.25,   status: "completed", formula: "7.1 + 8.13 + 20vol", grams: 84, materialCost: 18.40 },
      { id: "noa-processing",   label: "Processing",        type: "processing",    durationMin: 40, staffId: "maya",   chairId: "c4", startH: 10.0,   status: "in-progress" },
      { id: "noa-rinse",        label: "Rinse",             type: "wash",          durationMin: 15, staffId: "daniel", roomId: "wash-area", startH: 10.667, status: "upcoming" },
      { id: "noa-toner",        label: "Toner",             type: "active",        durationMin: 20, staffId: "maya",   chairId: "c1", startH: 10.917, status: "upcoming" },
      { id: "noa-blowdry",      label: "Blow-dry",          type: "active",        durationMin: 35, staffId: "noa-b",  chairId: "c1", startH: 11.25,  status: "upcoming" },
      { id: "noa-checkout",     label: "Checkout",          type: "checkout",      durationMin: 5,  staffId: "maya",   startH: 11.833, status: "upcoming" },
    ],
    linkedServices: [
      { id: "noa-link-treatment", label: "Deep Treatment", durationMin: 15, afterStageId: "noa-rinse" },
    ],
  },
  {
    id: "apt-rina",
    clientName: "Rina Katz",
    service: "Balayage",
    staffId: "maya",
    startH: 12.5,
    totalDurationH: 2.5,
    stages: [
      { id: "rina-application", label: "Application",  type: "active",     durationMin: 60,  staffId: "maya",   chairId: "c1", startH: 12.5,  status: "upcoming" },
      { id: "rina-processing",  label: "Processing",   type: "processing", durationMin: 45,  staffId: "maya",   chairId: "c4", startH: 13.5,  status: "upcoming" },
      { id: "rina-rinse",       label: "Rinse",        type: "wash",       durationMin: 15,  staffId: "daniel", roomId: "wash-area", startH: 14.25, status: "upcoming" },
      { id: "rina-blowdry",     label: "Blow-dry",     type: "active",     durationMin: 30,  staffId: "noa-b",  chairId: "c1", startH: 14.5,  status: "upcoming" },
    ],
    linkedServices: [],
  },
  {
    id: "apt-yossi",
    clientName: "Yossi Malka",
    service: "Men's Fade",
    staffId: "liam",
    startH: 9.0,
    totalDurationH: 0.75,
    stages: [
      { id: "yossi-cut", label: "Cut & Style", type: "active", durationMin: 45, staffId: "liam", chairId: "c2", startH: 9.0, status: "completed" },
    ],
    linkedServices: [],
  },
  {
    id: "apt-gili",
    clientName: "Gili Avraham",
    service: "Color Roots",
    staffId: "adele",
    startH: 9.5,
    totalDurationH: 1.75,
    stages: [
      { id: "gili-application", label: "Application", type: "active",     durationMin: 30,  staffId: "adele",  chairId: "c3", startH: 9.5,   status: "completed" },
      { id: "gili-processing",  label: "Processing",  type: "processing", durationMin: 35,  staffId: "adele",  chairId: "c3", startH: 10.0,  status: "in-progress" },
      { id: "gili-rinse",       label: "Rinse",       type: "wash",       durationMin: 10,  staffId: "daniel", roomId: "wash-area", startH: 10.583, status: "upcoming" },
      { id: "gili-blowdry",     label: "Blow-dry",    type: "active",     durationMin: 30,  staffId: "noa-b",  chairId: "c3", startH: 10.75, status: "upcoming" },
    ],
    linkedServices: [
      { id: "gili-link-toner", label: "Toner Refresh", durationMin: 20, afterStageId: "gili-rinse" },
    ],
  },
  {
    id: "apt-miri",
    clientName: "Miri Azoulay",
    service: "Half Head Highlights",
    staffId: "adele",
    startH: 11.5,
    totalDurationH: 2.25,
    stages: [
      { id: "miri-foils",      label: "Foils",       type: "active",     durationMin: 50, staffId: "adele",  chairId: "c3", startH: 11.5,  status: "upcoming" },
      { id: "miri-processing", label: "Processing",  type: "processing", durationMin: 40, staffId: "adele",  chairId: "c3", startH: 12.33, status: "upcoming" },
      { id: "miri-rinse",      label: "Rinse",       type: "wash",       durationMin: 15, staffId: "daniel", roomId: "wash-area", startH: 13.0, status: "upcoming" },
      { id: "miri-blowdry",    label: "Blow-dry",    type: "active",     durationMin: 30, staffId: "noa-b",  chairId: "c3", startH: 13.25, status: "upcoming" },
    ],
    linkedServices: [],
  },
  {
    id: "apt-amit",
    clientName: "Amit Regev",
    service: "Haircut + Style",
    staffId: "daniel",
    startH: 9.0,
    totalDurationH: 1.0,
    stages: [
      { id: "amit-cut",   label: "Cut",   type: "active", durationMin: 40, staffId: "daniel", chairId: "c5", startH: 9.0,   status: "completed" },
      { id: "amit-style", label: "Style", type: "active", durationMin: 20, staffId: "daniel", chairId: "c5", startH: 9.667, status: "completed" },
    ],
    linkedServices: [],
  },
  {
    id: "apt-shani",
    clientName: "Shani Gold",
    service: "Brazilian Blowout",
    staffId: "noa-b",
    startH: 9.0,
    totalDurationH: 2.5,
    stages: [
      { id: "shani-wash",       label: "Wash",       type: "wash",       durationMin: 15,  staffId: "noa-b",  roomId: "wash-area", startH: 9.0,  status: "completed" },
      { id: "shani-application",label: "Application",type: "active",     durationMin: 45,  staffId: "noa-b",  chairId: "c5", startH: 9.25,  status: "completed" },
      { id: "shani-processing", label: "Processing", type: "processing", durationMin: 60,  staffId: "noa-b",  chairId: "c5", startH: 10.0,  status: "in-progress" },
      { id: "shani-rinse",      label: "Rinse",      type: "wash",       durationMin: 10,  staffId: "noa-b",  roomId: "wash-area", startH: 11.0, status: "upcoming" },
      { id: "shani-blowdry",    label: "Blow-dry",   type: "active",     durationMin: 20,  staffId: "noa-b",  chairId: "c5", startH: 11.167, status: "upcoming" },
    ],
    linkedServices: [],
  },
  {
    id: "apt-liam-consult",
    clientName: "Efrat Dahan",
    service: "Consultation",
    staffId: "liam",
    startH: 10.0,
    totalDurationH: 0.5,
    stages: [
      { id: "efrat-consult", label: "Consultation", type: "consultation", durationMin: 30, staffId: "liam", chairId: "c2", startH: 10.0, status: "in-progress" },
    ],
    linkedServices: [],
  },
];

// ── Active clients on the floor ──────────────────────────────────────────────
export const ACTIVE_CLIENTS: SalonClient[] = [
  {
    id: "cl-noa",
    name: "Noa Friedman",
    appointmentId: "apt-noa",
    currentStageId: "noa-processing",
    since: "Since Jan 2022",
    formula: "7.1 + 8.13 + 20vol",
    gramsMixed: 84,
    materialCost: 18.40,
    inventoryUpdated: true,
  },
  {
    id: "cl-gili",
    name: "Gili Avraham",
    appointmentId: "apt-gili",
    currentStageId: "gili-processing",
    since: "Since Aug 2023",
    formula: "6.0 + 7.3 + 30vol",
    gramsMixed: 62,
    materialCost: 14.20,
    inventoryUpdated: true,
  },
  {
    id: "cl-shani",
    name: "Shani Gold",
    appointmentId: "apt-shani",
    currentStageId: "shani-processing",
    since: "Since Mar 2024",
  },
  {
    id: "cl-efrat",
    name: "Efrat Dahan",
    appointmentId: "apt-liam-consult",
    currentStageId: "efrat-consult",
  },
];

// ── Schedule opportunities ───────────────────────────────────────────────────
export const SCHEDULE_OPPORTUNITIES: ScheduleOpportunity[] = [
  {
    id: "opp-maya-free",
    type: "staff-available",
    message: "Maya is available for 38 minutes while Noa's color is processing.",
    staffId: "maya",
    startH: 10.0,
    durationMin: 38,
  },
  {
    id: "opp-chair4",
    type: "chair-available",
    message: "Chair 4 becomes available at 10:05.",
    chairId: "c4",
    startH: 10.083,
    durationMin: 35,
  },
];

// ── Calendar constants ───────────────────────────────────────────────────────
export const START_HOUR = 8;
export const END_HOUR = 16;
export const PX_PER_HOUR = 64;
export const NOW_HOUR = 10.25;

// ── Palette (neutral product) ────────────────────────────────────────────────
export const PALETTE = {
  bg: "#FEFCF8",
  surface: "#FFFFFF",
  surfaceAlt: "#FBF8F3",
  border: "rgba(20,12,4,0.08)",
  borderSoft: "rgba(20,12,4,0.05)",
  textStrong: "#18100A",
  textSoft: "rgba(20,12,4,0.54)",
  textFaint: "rgba(20,12,4,0.30)",
  accent: "#D4571A",
  accentSoft: "rgba(212,87,26,0.10)",
  accentMed: "rgba(212,87,26,0.18)",
} as const;

// Stage-type colors for the legend and blocks
export const STAGE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  active:       { bg: "rgba(52,114,184,0.10)",  border: "rgba(52,114,184,0.30)", text: "#2A5F9E" },
  processing:   { bg: "rgba(184,137,26,0.08)",  border: "rgba(184,137,26,0.32)", text: "#9A7010" },
  wash:         { bg: "rgba(58,138,98,0.08)",   border: "rgba(58,138,98,0.30)",  text: "#276B4D" },
  consultation: { bg: "rgba(138,90,160,0.08)",  border: "rgba(138,90,160,0.28)", text: "#6B4580" },
  checkout:     { bg: "rgba(20,12,4,0.04)",     border: "rgba(20,12,4,0.10)",    text: "rgba(20,12,4,0.45)" },
  linked:       { bg: "rgba(212,87,26,0.07)",   border: "rgba(212,87,26,0.22)",  text: "#B84A16" },
};
