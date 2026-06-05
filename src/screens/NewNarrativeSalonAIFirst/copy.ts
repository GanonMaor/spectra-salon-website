/**
 * Copy for the New Narrative Salon AI First investor experience.
 *
 * This is a visual business thesis, not a feature tour.
 * One idea per slide. Salon AI is one platform built in three layers.
 *
 * Real proof numbers are sourced from
 * src/screens/SpectraProductVision/dataMoat.ts (PROOF object).
 */

export const META = {
  title: "Salon AI — The AI-Native Operating System For Beauty",
  description:
    "Salon AI is one platform built in three layers: cost optimization, operations, and autonomous intelligence.",
  route: "/investors/new-narrative-salon-ai-first",
} as const;

export const CHROME = {
  brand: "Salon AI · Spectra",
  confidential: "Confidential — prepared for investors.",
} as const;

// ── Slide 1 — Salon AI ────────────────────────────────────────────────────────
export const OPENING = {
  eyebrow: "Salon AI",
  headline: "Salon AI",
  subheadline: "The AI-Native Operating System For Beauty Businesses.",
  lines: [
    "Built by salon professionals.",
    "Powered by real production data.",
    "Designed to become the intelligence layer of the beauty industry.",
  ],
  agents: ["Personal Assistant", "Inventory Agent", "Scheduling Agent", "Performance Agent", "Growth Agent"],
} as const;

// ── Slide 2 — Why Now ──────────────────────────────────────────────────────────
export const WHY_NOW = {
  eyebrow: "Why Now",
  headline: "The beauty industry is ready for its operating system.",
  points: [
    {
      glyph: "brand" as const,
      title: "A Massive Industry",
      detail: "Hundreds of thousands of salons run on workflows nobody has digitized.",
    },
    {
      glyph: "cloud" as const,
      title: "Legacy Software",
      detail: "Today's salon tools are calendars and registers, built before AI.",
    },
    {
      glyph: "ai" as const,
      title: "The AI Transformation",
      detail: "For the first time, software can run operations, not just record them.",
    },
    {
      glyph: "profit" as const,
      title: "Revenue Expansion",
      detail: "Every layer we add multiplies revenue per salon.",
    },
    {
      glyph: "data" as const,
      title: "Unique Data Access",
      detail: "We already operate inside the salon's most important workflow.",
    },
  ],
} as const;

// ── Slide 3 — One Platform. Three Layers. ──────────────────────────────────────
export const THREE_LAYERS = {
  eyebrow: "One Platform. Three Layers.",
  headline: "Three layers. One operating system.",
  layers: [
    {
      num: "Layer 1",
      title: "Cost Optimization",
      status: "Production",
      detail: "Every mix, gram, and material cost becomes data.",
    },
    {
      num: "Layer 2",
      title: "Booking & POS + Cost Optimization",
      status: "Pilot",
      detail: "The salon runs as one real-time operating system.",
    },
    {
      num: "Layer 3",
      title: "Autonomous AI Agents",
      status: "Next",
      detail: "Intelligence that makes decisions, not just dashboards.",
    },
  ],
  closing: "Together, these layers are Salon AI.",
} as const;

// ── Slide 4 — Why We Started With Color ────────────────────────────────────────
export const WHY_COLOR = {
  eyebrow: "Why We Started With Color",
  headline: "Most software started with calendars. We started with production.",
  lines: [
    "The color bar is the most complex area in any salon.",
    "It is where profitability is created or lost, gram by gram.",
    "We digitized the hardest workflow first.",
  ],
  closing: "That decision created an advantage no calendar app can copy.",
} as const;

// ── Slide 5 — Layer 1: Already Running ──────────────────────────────────────────
export const LAYER1 = {
  eyebrow: "Layer 1 — Already Running",
  headline: "This layer is live, paid for, and proven.",
  kpis: [
    { value: "170", label: "Active accounts", note: "Salons live on Spectra" },
    { value: "500+", label: "Colorists", note: "Professionals on the platform" },
    { value: "$150K", label: "ARR", note: "Annual recurring revenue" },
    { value: "1 : 5", label: "CAC / LTV", note: "$1 acquired → $5 lifetime value" },
  ],
  proofLine: "Real salons. Real production data. Real unit economics.",
  videoEyebrow: "Customer Proof",
  videoHeadline: "The professionals already running on Spectra.",
  regions: ["United States", "Canada", "Europe", "Israel"],
} as const;

// ── Slide 6 — The Data Advantage ───────────────────────────────────────────────
export const DATA_ADVANTAGE = {
  eyebrow: "The Data Advantage",
  headline: "We do not observe the industry. We operate inside it.",
  categories: [
    { glyph: "scale" as const,     label: "Consumption",         detail: "Grams measured per service, not estimated.",       stat: "30.9M grams captured" },
    { glyph: "bowl" as const,      label: "Waste",               detail: "Mixed versus used, made visible.",                  stat: "556K+ services analysed" },
    { glyph: "brand" as const,     label: "Product Trends",      detail: "Which brands and shades actually win.",             stat: "221 brands tracked" },
    { glyph: "inventory" as const, label: "Inventory Behavior",  detail: "Real reorder patterns across the network.",        stat: "170 active salons feeding data" },
    { glyph: "calendar" as const,  label: "Service Trends",      detail: "Which services repeat and which churn.",           stat: "40 months of history" },
    { glyph: "data" as const,      label: "Market Intelligence", detail: "Regional benchmarks no one else holds.",           stat: "12 countries · 4 continents" },
  ],
  stats: [
    { value: "30.9M", label: "grams measured" },
    { value: "221", label: "brands observed" },
    { value: "40", label: "months of history" },
  ],
  closing: "This is operational data, captured at the source.",
} as const;

// ── Slide 7 — Layer 2: Operations ──────────────────────────────────────────────
export const LAYER2 = {
  eyebrow: "Layer 2 — Booking & POS + Cost Optimization",
  headline: "The whole salon, running in real time.",
  status: "Entering Pilot",
  center: "Salon AI",
  centerSub: "One real-time OS",
  modules: [
    { label: "Booking", glyph: "calendar" as const },
    { label: "POS", glyph: "payment" as const },
    { label: "Inventory", glyph: "inventory" as const },
    { label: "Payments", glyph: "payment" as const },
    { label: "CRM", glyph: "client" as const },
    { label: "Marketing", glyph: "brand" as const },
    { label: "Client History", glyph: "retention" as const },
    { label: "Cost Optimization", glyph: "scale" as const },
  ],
  closing: "Disconnected tools become one connected system.",
} as const;

// ── Slide 8 — Layer 3: Autonomous AI Agents ────────────────────────────────────
export const LAYER3 = {
  eyebrow: "Layer 3 — Autonomous AI Agents",
  headline: "An AI assistant, plus four specialized agents.",
  status: "Development Accelerating",
  center: "Salon AI",
  centerRole: "Intelligence Layer",
  agents: [
    { name: "Personal Assistant", detail: "The owner's co-pilot across the business." },
    { name: "Inventory Agent", detail: "Predicts, reorders, and prevents stockouts." },
    { name: "Scheduling Agent", detail: "Optimizes the calendar and absorbs delays." },
    { name: "Performance Agent", detail: "Tracks margin, staff, and service profitability." },
    { name: "Growth Agent", detail: "Drives rebooking, retention, and revenue." },
  ],
  difference:
    "Most AI companies bolt ChatGPT onto old software. We built the software first, then the intelligence layer on top of it.",
} as const;

// ── Slide 9 — Why AI Works Here ────────────────────────────────────────────────
export const WHY_AI = {
  eyebrow: "Why AI Works Here",
  headline: "AI needs structured operational data. We already create it.",
  pillars: [
    { glyph: "data" as const, title: "Operational Data", detail: "Captured at the source, every service." },
    { glyph: "inventory" as const, title: "Structured Objects", detail: "Formulas, products, grams, timing, staff." },
    { glyph: "cloud" as const, title: "Connected Workflows", detail: "Booking to service to inventory to payment." },
    { glyph: "ai" as const, title: "Native Architecture", detail: "Built for AI, not retrofitted for it." },
  ],
  closing: "This is the foundation of autonomous decision making.",
} as const;

// ── Slide 10 — The Business Model Evolution ────────────────────────────────────
export const MODEL = {
  eyebrow: "The Business Model Evolution",
  headline: "Revenue per salon expands with every layer.",
  bars: [
    { stage: "Cost Optimization", value: 960, display: "$960" },
    { stage: "Booking & POS", value: 1920, display: "$1,920" },
    { stage: "Salon AI", value: 6000, display: "$6,000+" },
  ],
  note: "Annual revenue per salon.",
  engines: ["AI Tokens", "Industry Intelligence", "Market Data"],
  closing: "And new revenue engines open on top of the platform.",
} as const;

// ── Slide 11 — Why Raise Now ───────────────────────────────────────────────────
export const RAISE = {
  eyebrow: "Why Raise Now",
  headline: "The layers are aligned. The timing is now.",
  amount: "$300K",
  amountSub: "to accelerate execution",
  points: [
    { status: "Proven", title: "Layer 1", detail: "In production, paid for, across 12 countries." },
    { status: "Pilot", title: "Layer 2", detail: "Operating system entering pilot now." },
    { status: "Opportunity", title: "Layer 3", detail: "Autonomous agents are the reason to accelerate." },
  ],
  focus: ["Speed of execution", "Concentration of resources", "Timing of the AI shift"],
} as const;

// ── Slide 12 — Closing ─────────────────────────────────────────────────────────
export const CLOSING = {
  eyebrow: "The Vision",
  line1: "We Started With Color.",
  line2: "We Are Building The Intelligence Layer Of The Beauty Industry.",
  ladder: "Cost Optimization → Operations → Autonomous Intelligence",
} as const;
