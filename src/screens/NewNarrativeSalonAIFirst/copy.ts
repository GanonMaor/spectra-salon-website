/**
 * Copy for the New Narrative Salon AI First investor experience.
 *
 * One idea per slide. Every line earns its place.
 * This is a technology company building the intelligence layer of the beauty industry.
 */

export const META = {
  title: "Salon AI — The AI-Native Operating System For Beauty",
  description:
    "Salon AI is one platform built in layers: cost optimization, booking intelligence, salon operating system, and autonomous AI agents.",
  route: "/investors/new-narrative-salon-ai-first",
} as const;

export const CHROME = {
  brand: "Salon AI · Spectra",
  confidential: "Confidential — prepared for investors.",
} as const;

// ── Slide 1 — Opening ─────────────────────────────────────────────────────────
export const OPENING = {
  eyebrow: "Salon AI",
  headline: "Salon AI",
  subheadline: "The AI-Native Operating System For Beauty Businesses.",
  lines: [
    "Built by salon professionals.",
    "Powered by real production data.",
    "Designed to become the intelligence layer of the beauty industry.",
  ],
  agents: ["Booking Agent", "Inventory Agent", "Retention Agent", "Operations Agent", "Growth Agent"],
} as const;

// ── Slide 2 — Product Roadmap ─────────────────────────────────────────────────
export const THREE_LAYERS = {
  eyebrow: "Product Roadmap",
  headline: "One platform. Four compounding layers.",
  layers: [
    {
      num: "Layer 1",
      title: "Cost Optimization",
      status: "Live & Growing",
      detail: "Live product, paying salons, and proprietary color-room data.",
      milestones: ["Paying customers", "5.0x LTV:CAC", "Data layer live"],
      pain: "Salons don't know the real cost of a color service until profit is already lost.",
      whatItDoes: "Shows the exact material cost, waste, and margin for every formula and every service.",
      howItWorks: "The scale captures grams at the moment of mixing and connects them to formula, client, colorist, inventory, and price.",
      whyItMatters: "This turns the color room into a live data layer — the foundation for inventory, pricing, intelligence, and future AI.",
    },
    {
      num: "Layer 2",
      title: "Booking Intelligence",
      status: "Built — Testing",
      detail: "Smart booking, CRM, and POS intelligence launching into existing demand.",
      milestones: ["Soft launch", "30 early adopters", "CRM + POS"],
      pain: "Salon calendars are built on generic time blocks, so days run late and revenue capacity is wasted.",
      whatItDoes: "Creates smarter appointments based on the real service journey, not static templates.",
      howItWorks: "It learns timing from actual color services, client history, staff behavior, and capacity gaps before the booking is confirmed.",
      whyItMatters: "Better scheduling means fewer delays, better utilization, and more revenue from the same chairs and team.",
    },
    {
      num: "Layer 3",
      title: "Salon Operating System",
      status: "September 2026",
      detail: "One mobile cockpit for owners, staff, clients, inventory, and revenue.",
      milestones: ["Owner app", "Live operations", "Remote control"],
      pain: "Owners run the salon from memory, WhatsApp, disconnected apps, and end-of-day surprises.",
      whatItDoes: "Gives the owner one live command center for clients, staff, inventory, revenue, and daily operations.",
      howItWorks: "Each workflow updates the same operating layer, so the owner sees alerts, tasks, messages, and financial signals in one place.",
      whyItMatters: "The business becomes manageable remotely and in real time — not only after problems have already happened.",
    },
    {
      num: "Layer 4",
      title: "Salon AI Agent Suite",
      status: "January 2027",
      detail: "Role-based agents that execute work, not just surface insights.",
      milestones: ["Agent packages", "Token economy", "AI execution"],
      pain: "Even when software finds a problem, someone still has to chase the client, fix the booking, order stock, or run the campaign.",
      whatItDoes: "Deploys role-based agents for booking, inventory, retention, operations, and growth.",
      howItWorks: "Agents use the operating data layer to trigger tasks, contact people, update records, and close loops automatically.",
      whyItMatters: "This is the shift from dashboards to execution: Salon AI does the work, not just reports on it.",
    },
  ],
  closing: "Data → Intelligence → Operating System → Autonomous Agents",
} as const;

// ── Slide 3 — Why We Started With Color ──────────────────────────────────────
export const WHY_COLOR = {
  eyebrow: "Why We Started With Color",
  headline: "No data. No AI.",
  pillars: [
    {
      title: "No Data = No AI",
      detail:
        "We needed a frictionless way to collect intelligence from the color room — the most important source of operational truth inside any salon. Without unique data, there is no intelligence. Without intelligence, there is no AI.",
    },
    {
      title: "Foot In The Door Strategy",
      detail:
        "We always planned to build a complete salon operating system. By starting with one painful problem, we entered below the radar of larger players — learning the market, reducing risk, and building a loyal customer base before going broad.",
    },
    {
      title: "Data Becomes The Moat",
      detail:
        "As the network grows, we are not just collecting operational data. We are building a global intelligence layer on beauty industry consumption — brands, products, trends, and market shifts. This is our moat, our future revenue stream, and our valuation multiplier.",
    },
  ],
  closing: "Data becomes the moat, the future revenue stream, and the valuation multiplier.",
} as const;

// ── Slide 4 — Proof We Were Right ────────────────────────────────────────────
export const LAYER1 = {
  eyebrow: "Proof We Were Right",
  headline: "The first layer is live, retained, and expanding.",
  kpis: [
    { value: "170",    label: "Active accounts",      note: "Paying salons across 12 countries" },
    { value: "1 : 5",  label: "CAC : LTV",            note: "Validated acquisition economics" },
    { value: "556K+",  label: "Services analyzed",    note: "Real service cycles processed" },
    { value: "L'Oréal", label: "Market intelligence", note: "Already purchasing our data today" },
  ],
  proofPillars: [
    {
      title: "Customer Retention",
      detail:
        "Our retention and renewal rates confirm the product creates real operational value, not just trial adoption.",
    },
    {
      title: "Service Intelligence",
      detail:
        "556K+ service cycles analyzed, formulas processed, and consumption patterns mapped. We learned how salons actually operate.",
    },
    {
      title: "Market Intelligence Demand",
      detail:
        "L'Oréal Israel is already paying for market intelligence from our network — even while our salon count is still relatively small. Demand is proven.",
    },
  ],
  proofLine: "Real salons. Real production data. Real market demand.",
  videoEyebrow: "Customer Proof",
  videoHeadline: "The professionals already running on Spectra.",
  regions: ["United States", "Canada", "Europe", "Israel"],
} as const;

// ── Slide 5 — Retention & Unit Economics ─────────────────────────────────────
export const TRIPLE_BUNDLE = {
  eyebrow: "Retention & Unit Economics",
  headline: "The first product proved retention, expansion, and paid demand.",
  saas: [
    { value: "$149K", label: "ARR",                  note: "Annual recurring revenue" },
    { value: "180",   label: "Active subscriptions", note: "84 Israel · 96 US & UK" },
    { value: "+60%",  label: "YoY growth",           note: "2024 $93K → 2025 $149K" },
    { value: "5.0×",  label: "LTV : CAC",            note: "$148K net return on $37K spend" },
  ],
  offer: [
    { title: "30-Day Free Trial", detail: "Full access, no commitment" },
    { title: "Free Equipment",    detail: "Smart Scale + Premium Stand" },
    { title: "Custom Training",   detail: "Complete onboarding included" },
  ],
  offerEyebrow: "The Triple Bundle",
  funnel: [
    { step: "Leads",     n: "1,476", conv: "100%",  cpa: "$25 / lead" },
    { step: "Trials",    n: "301",   conv: "20.4%", cpa: "$123 / trial" },
    { step: "Customers", n: "96",    conv: "32%",   cpa: "$385 / customer" },
  ],
  funnelEyebrow: "2025 Sales Funnel",
  closing: "We did not just collect inventory data. We learned how salons actually operate.",
} as const;

// ── Slide 6 — Booking Intelligence ───────────────────────────────────────────
export const BOOKING_INTELLIGENCE = {
  eyebrow: "Booking Intelligence",
  headline: "The world's first truly intelligent booking engine for salons.",
  problem:
    "Today, every salon calendar runs on assumptions. Full highlights = 3 hours. The reality? Every client is different. Some process faster, some slower. The calendar has never known this.",
  solution:
    "Because we mapped material consumption in the color room, we know the real timing for every step of every service — for every individual client.",
  cycle: [
    { step: "Application",  note: "Measured per colorist and formula" },
    { step: "Processing",   note: "Real wait time, not estimated" },
    { step: "Toner",        note: "Client-specific processing window" },
    { step: "Wash",         note: "Tracked and stored per visit" },
    { step: "Cut",          note: "Stylist timing, client preference" },
    { step: "Finish",       note: "Blow dry and style completion" },
  ],
  closing: "The calendar is no longer based on estimates. It is based on reality.",
} as const;

// ── Slide 7 — Back Room To Front Desk ────────────────────────────────────────
export const BACK_ROOM = {
  eyebrow: "From Back Room To Front Desk",
  headline: "We mapped the back of the salon. Now we optimize the front.",
  body:
    "After digitizing material consumption in the color room, we extended our intelligence layer to the entire service floor. Every service. Every client. Every employee.",
  signals: [
    { title: "Every Service",  detail: "Color, cut, treatment, finish — mapped and timed.", glyph: "calendar" as const },
    { title: "Every Client",   detail: "Personal timing, visit cycle, retention, and lifetime value.", glyph: "client" as const },
    { title: "Every Employee", detail: "Capacity, utilization, productivity, and schedule efficiency.", glyph: "stylist" as const },
  ],
  closing: "From Book To Look.",
} as const;

// ── Slide 8 — Market Intelligence Dashboard ───────────────────────────────────
export const DATA_ADVANTAGE = {
  eyebrow: "Market Intelligence Dashboard",
  headline: "The data is already valuable outside the salon.",
  categories: [
    { glyph: "brand" as const,     label: "Brand Trends",          detail: "Which brands and shades actually win across the network.",   stat: "221 brands tracked" },
    { glyph: "profit" as const,    label: "Product Velocity",      detail: "Fast-moving, slow-moving, and seasonal demand patterns.",    stat: "Network-wide velocity" },
    { glyph: "inventory" as const, label: "Regional Demand",       detail: "Regional benchmarks that no research company holds.",        stat: "12 countries · 4 continents" },
    { glyph: "bowl" as const,      label: "Consumption Data",      detail: "Real gram-level consumption, not estimated usage.",          stat: "30.9M grams captured" },
    { glyph: "scale" as const,     label: "Waste Patterns",        detail: "Mixed versus used — operational waste made visible.",        stat: "556K+ services analysed" },
    { glyph: "data" as const,      label: "Intelligence Revenue",  detail: "L'Oréal Israel already purchases this data from us today.",  stat: "Validated demand" },
  ],
  stats: [
    { value: "30.9M", label: "grams measured" },
    { value: "221",   label: "brands observed" },
    { value: "40",    label: "months of history" },
  ],
  closing: "Market intelligence demand is already validated.",
} as const;

// ── Slide 9 — Intelligence Layer ──────────────────────────────────────────────
export const INTELLIGENCE_LAYER = {
  eyebrow: "The Intelligence Layer",
  headline: "Why our AI knows what to do.",
  body: "We are not building another salon software platform. We are building an intelligence layer that understands the entire business.",
  costSignals: [
    { title: "Inventory Consumption", items: "Product, brand, shade, quantity, movements" },
    { title: "Formula Intelligence",  items: "Formula success, variations, combinations" },
    { title: "Colorist Behavior",     items: "Mixing habits, waste rate, product preferences" },
    { title: "Product Velocity",      items: "Fast movers, slow movers, seasonal demand" },
    { title: "Cost Intelligence",     items: "Cost per service, margin, waste cost" },
  ],
  bookingSignals: [
    { title: "Service Behavior",      items: "Type, frequency, duration, combinations" },
    { title: "Client Journey",        items: "Visit cycle, retention, lifetime value" },
    { title: "Timing Intelligence",   items: "Application, processing, toner, wash, finish" },
    { title: "Employee Performance",  items: "Capacity, utilization, productivity" },
    { title: "Revenue Intelligence",  items: "Peak hours, empty slots, revenue per hour" },
  ],
  engineObjects: ["Clients", "Staff", "Products", "Services", "Inventory", "Revenue", "Scheduling", "Communication"],
  closing: "No single salon software platform captures both operational reality and service behavior at this depth.",
} as const;

// ── Slide 10 — Salon Operating System ─────────────────────────────────────────
export const LAYER2 = {
  eyebrow: "Salon Operating System",
  headline: "The salon cockpit.",
  status: "Phase 1 — September 2026",
  center: "Salon OS",
  centerSub: "One person. One screen. Full control.",
  modules: [
    { label: "CRM",              glyph: "client" as const },
    { label: "Booking",          glyph: "calendar" as const },
    { label: "Cost Optimization",glyph: "scale" as const },
    { label: "Inventory",        glyph: "inventory" as const },
    { label: "Staff",            glyph: "manager" as const },
    { label: "Payments",         glyph: "payment" as const },
    { label: "Communication",    glyph: "retention" as const },
    { label: "AI Insights",      glyph: "ai" as const },
  ],
  closing: "Not salon software. A mission-control center for a modern beauty business.",
} as const;

// ── Slide 11 — Salon AI Agent Network ─────────────────────────────────────────
export const LAYER3 = {
  eyebrow: "Salon AI Agent Network",
  headline: "The first true Salon AI.",
  status: "Phase 2 — January 2027",
  center: "Salon AI",
  centerRole: "Agent Layer",
  agents: [
    {
      name: "Booking Agent",
      detail: "Finds availability, contacts the client, confirms the appointment, and updates the calendar automatically.",
      actions: ["Schedule appointments", "Move bookings", "Fill empty slots", "Optimize capacity"],
    },
    {
      name: "Inventory Agent",
      detail: "Predicts shortages, creates purchase orders, contacts suppliers, and tracks delivery without human input.",
      actions: ["Forecast inventory", "Create orders", "Contact suppliers", "Prevent stockouts"],
    },
    {
      name: "Retention Agent",
      detail: "Detects clients at risk of churn, launches win-back campaigns, monitors responses, and rebooks visits.",
      actions: ["Detect churn risk", "Launch campaigns", "Monitor response", "Rebook visits"],
    },
    {
      name: "Operations Agent",
      detail: "Monitors daily tasks, staff activity, and operational alerts so nothing falls through the cracks.",
      actions: ["Daily oversight", "Staff monitoring", "Operational alerts", "Business checks"],
    },
    {
      name: "Growth Agent",
      detail: "Runs marketing campaigns, generates reviews, supports upsell opportunities, and drives revenue growth.",
      actions: ["Run campaigns", "Generate reviews", "Support upsells", "Grow revenue"],
    },
  ],
  difference: "The agents do not provide insights. They perform work.",
} as const;

// ── Slide 12 — Traditional AI vs Salon AI ─────────────────────────────────────
export const WHY_AI = {
  eyebrow: "Traditional AI vs Salon AI",
  headline: "Traditional AI thinks. Salon AI acts.",
  traditional: ["Provides recommendations", "Creates reports", "Offers suggestions", "Waits for human action"],
  salonAi: ["Executes work", "Completes workflows", "Updates the operating system", "Operates 24/7"],
  pillars: [
    {
      glyph: "calendar" as const,
      title: "Booking Agent",
      detail: "Finds availability, contacts the client, confirms the appointment, and updates the calendar.",
    },
    {
      glyph: "inventory" as const,
      title: "Inventory Agent",
      detail: "Predicts shortages, creates purchase orders, contacts suppliers, and tracks delivery.",
    },
    {
      glyph: "retention" as const,
      title: "Retention Agent",
      detail: "Detects churn risk, launches campaigns, monitors response, and rebooks visits.",
    },
    {
      glyph: "ai" as const,
      title: "The Shift",
      detail: "Hundreds of daily operational tasks performed autonomously. Not insights. Execution.",
    },
  ],
  closing: "The strategic shift is execution, not reporting.",
} as const;

// ── Slide 13 — Business Model Evolution ───────────────────────────────────────
export const MODEL = {
  eyebrow: "Business Model Evolution",
  headline: "Each layer expands ARPU and opens new revenue streams.",
  phases: [
    { phase: "Today",   product: "Cost Optimization",           arpu: "$960 / year" },
    { phase: "Phase 2", product: "Smart Booking + CRM + POS",   arpu: "$1,920 / year" },
    { phase: "Phase 3", product: "Salon Operating System",      arpu: "$3,600 / year" },
    { phase: "Phase 4", product: "Salon AI Agent Suite",        arpu: "$6,000+ / year" },
  ],
  bars: [
    { stage: "Cost Optimization", value: 960,  display: "$960" },
    { stage: "Booking & POS",     value: 1920, display: "$1,920" },
    { stage: "Salon AI",          value: 6000, display: "$6,000+" },
  ],
  note: "Annual revenue per salon.",
  engines: [
    "Subscription Revenue",
    "AI Tokens",
    "Agent Packages",
    "Marketplace Revenue",
    "Industry Intelligence",
    "Enterprise Data Products",
  ],
  growthNote:
    "The sequenced release strategy is intentional. Each layer generates new revenue that funds the next phase of development — creating a self-sustaining growth engine that does not depend on a single fundraise.",
  closing: "The company evolves from one product into a multi-layer revenue platform.",
} as const;

// ── Slide 14 — Path To Series A ───────────────────────────────────────────────
export const RAISE = {
  eyebrow: "Path To Series A",
  headline: "We are not raising a Series A to build the vision. We are executing the vision first.",
  amount: "Series A",
  amountSub: "after product stack, strong adoption, active agents, and repeatable growth",
  points: [
    { status: "Live",  title: "Today",    detail: "Cost Optimization is paid for, retained, and generating unique data." },
    { status: "Built", title: "Next",     detail: "Booking Intelligence launches in 45 days into existing demand." },
    { status: "Scale", title: "Then",     detail: "Salon OS adoption and active AI agents create the Series A moment." },
  ],
  roadmap: [
    "Today",
    "Booking Intelligence Launch",
    "Salon OS Adoption",
    "Salon AI Launch",
    "Series A",
  ],
  focus: ["Full product stack", "Strong recurring revenue", "Proven adoption", "Active AI agents", "Repeatable growth engine"],
  growthNote:
    "The layered approach also means we can continue bootstrapping after this raise if market conditions favor it. We will not raise under pressure. We will raise from a position of proven product, retained customers, and operating AI.",
} as const;

// ── Slide 15 — Closing ─────────────────────────────────────────────────────────
export const CLOSING = {
  eyebrow: "The Vision",
  line1: "We Started With One Gram Of Color.",
  line2: "We Are Building The First AI-Native Operating System For Salons.",
  ladder: "Data → Intelligence → Automation → Salon AI",
  sub: "Spectra started by solving one operational problem in the color room. That gave us unique data. That data enabled intelligence. That intelligence enabled automation. That automation becomes the first true AI-native operating system for salons.",
} as const;

// ── Archived ───────────────────────────────────────────────────────────────────
export const WHY_NOW = {
  eyebrow: "Why Now",
  headline: "The beauty industry is ready for its operating system.",
  points: [
    { glyph: "brand" as const,  title: "A Massive Industry", detail: "Hundreds of thousands of salons run on workflows nobody has digitized." },
    { glyph: "cloud" as const,  title: "Legacy Software",    detail: "Today's salon tools are calendars and registers, built before AI." },
    { glyph: "ai" as const,     title: "The AI Transformation", detail: "For the first time, software can run operations, not just record them." },
    { glyph: "profit" as const, title: "Revenue Expansion",  detail: "Every layer we add multiplies revenue per salon." },
    { glyph: "data" as const,   title: "Unique Data Access", detail: "We already operate inside the salon's most important workflow." },
  ],
} as const;
