/**
 * Copy for the New Narrative Salon AI First investor experience.
 *
 * One idea per slide. Every line earns its place.
 * This is a technology company building the intelligence layer of the beauty industry.
 */

export const META = {
  title: "Salon AI Investor Deck",
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

// ── Slide 2 — Problem + Product Roadmap ───────────────────────────────────────
export const THREE_LAYERS = {
  eyebrow: "The Global Salon Problem",
  headline: "2.7 million professional salons are still running on disconnected workflows.",
  problemLine:
    "Most salons already use software. What they are missing is an operating intelligence layer that understands how a salon actually works.",
  problems: [
    {
      title: "Disconnected Operations",
      detail:
        "Booking, staff, inventory, client history, and revenue all live in separate places. Nothing talks to anything else.",
    },
    {
      title: "Invisible Losses",
      detail:
        "Material waste, empty chair capacity, and missed client follow-up are difficult to measure, so they never get fixed.",
    },
    {
      title: "No Intelligence Layer",
      detail:
        "Generic tools record what happened after the fact. They do not understand how the salon runs or what it needs next.",
    },
  ],
  tocEyebrow: "The Answer",
  tocLine: "One platform. Four compounding layers. Each one turns a hidden constraint into operating intelligence.",
  layers: [
    {
      num: "Layer 1",
      title: "Cost Optimization",
      status: "Live & Growing",
      promise: "Turns material waste into live operational data.",
      detail: "Live product, paying salons, and proprietary color-room data.",
      milestones: ["Paying customers", "4.6x LTV:CAC", "Data layer live"],
      story:
        "The color room is one of the most expensive places in the salon, but it is also one of the hardest to measure. Colorists work under pressure, old systems sit far away from the actual mixing station, and asking the team to manually track every gram simply does not hold in a real service flow. The result is invisible waste: bowls washed down the sink, products over-mixed, inventory ordered too early or too late, and in many salons roughly 30% of purchased color materials ending up as waste. Cost Optimization turns that hidden loss into live operational data, captured at the moment the work happens.",
      pain: "Salons don't know the real cost of a color service until profit is already lost.",
      whatItDoes: "Shows the exact material cost, waste, and margin for every formula and every service.",
      howItWorks: "The scale captures grams at the moment of mixing and connects them to formula, client, colorist, inventory, and price.",
      whyItMatters: "This turns the color room into a live data layer, the foundation for inventory, pricing, intelligence, and future AI.",
    },
    {
      num: "Layer 2",
      title: "Booking Intelligence",
      status: "Built — Testing",
      promise: "Turns the service journey into a smarter, data-driven calendar.",
      detail: "Smart booking, CRM, and POS intelligence launching into existing demand.",
      milestones: ["Soft launch", "30 early adopters", "CRM + POS"],
      story:
        "Salon booking looks simple from the outside, but inside the business every appointment depends on timing, skill, service history, processing windows, staff availability, and client behavior. Generic booking systems reduce all of that complexity into static time blocks, so the day slowly breaks: services run late, chairs sit empty, high-value clients are placed in the wrong slots, and owners lose revenue without seeing where it leaked. Booking Intelligence connects the calendar to the real workflow of the salon, so appointments are built around what actually happens on the floor.",
      pain: "Salon calendars are built on generic time blocks, so days run late and revenue capacity is wasted.",
      whatItDoes: "Creates smarter appointments based on the real service journey, not static templates.",
      howItWorks: "It learns timing from actual color services, client history, staff behavior, and capacity gaps before the booking is confirmed.",
      whyItMatters: "Better scheduling means fewer delays, better utilization, and more revenue from the same chairs and team.",
    },
    {
      num: "Layer 3",
      title: "Salon Operating System",
      status: "September 2026",
      promise: "Turns daily disconnected work into one live command center.",
      detail: "One mobile cockpit for owners, staff, clients, inventory, and revenue.",
      milestones: ["Owner app", "Live operations", "Remote control"],
      story:
        "Most salon owners still manage the business from memory, WhatsApp, disconnected apps, paper notes, and end-of-day reports. They know something went wrong only after a client complains, a product runs out, a staff member misses a task, or the numbers do not add up. The Salon Operating System brings the daily business into one live command center: clients, staff, inventory, revenue, tasks, alerts, and communication all update the same operating layer. The owner stops chasing the salon and starts seeing it in real time.",
      pain: "Owners run the salon from memory, WhatsApp, disconnected apps, and end-of-day surprises.",
      whatItDoes: "Gives the owner one live command center for clients, staff, inventory, revenue, and daily operations.",
      howItWorks: "Each workflow updates the same operating layer, so the owner sees alerts, tasks, messages, and financial signals in one place.",
      whyItMatters: "The business becomes manageable remotely and in real time, not only after problems have already happened.",
    },
    {
      num: "Layer 4",
      title: "Salon AI Agent Suite",
      status: "January 2027",
      promise: "Turns intelligence into autonomous execution across every role.",
      detail: "Role-based agents that execute work, not just surface insights.",
      milestones: ["Agent packages", "Token economy", "AI execution"],
      story:
        "Once the salon has real data and a live operating system, the next bottleneck is execution. Software can show that a client is about to churn, a shift is understaffed, a product is running low, or a campaign opportunity exists, but someone still has to make the call, send the message, place the order, update the record, and follow up. The Salon AI Agent Suite turns intelligence into action through role-based agents that work across booking, inventory, retention, marketing, and business development. This is where Salon AI becomes less like software and more like autonomous management capacity.",
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
        "We needed a frictionless way to collect intelligence from the color room, the most important source of operational truth inside any salon. Without unique data, there is no intelligence. Without intelligence, there is no AI.",
    },
    {
      title: "Foot In The Door Strategy",
      detail:
        "We always planned to build a complete salon operating system. By starting with one painful problem, we entered below the radar of larger players, learning the market, reducing risk, and building a loyal customer base before going broad.",
    },
    {
      title: "Data Becomes The Moat",
      detail:
        "As the network grows, we are not just collecting operational data. We are building a global intelligence layer on beauty industry consumption, brands, products, trends, and market shifts. This is our moat, our future revenue stream, and our valuation multiplier.",
    },
  ],
  closing: "Data becomes the moat, the future revenue stream, and the valuation multiplier.",
} as const;

// ── Slide 4 — Proof We Were Right ────────────────────────────────────────────
export const LAYER1 = {
  eyebrow: "Proof We Were Right",
  headline: "Product-market fit. Global reach. No field sales team.",
  kpis: [
    { value: "170",    label: "Paying subscriptions",  note: "$920 avg ARPU, 36+ month LTV proven" },
    { value: "12",     label: "Countries",             note: "US, Russia, Japan, Netherlands, Portugal, Israel, Chile and more" },
    { value: "500+",   label: "Color technicians",     note: "Using the system every workday, multiple times per day" },
    { value: "$130K",  label: "ARR",                   note: "Annual recurring revenue from current base" },
  ],
  dataKpis: [
    { value: "30.9M", label: "Grams measured",      note: "Real color usage captured at the mixing station" },
    { value: "556K+", label: "Services analyzed",   note: "Actual salon workflows, formulas, timing, and outcomes" },
    { value: "221",   label: "Brands observed",     note: "Network-wide product and shade behavior across salons" },
    { value: "40",    label: "Months of history",   note: "Longitudinal data no generic salon system can recreate" },
  ],
  proofLine: "Real salons. Real recurring revenue. Real global reach.",
  videoEyebrow: "Customer Proof",
  videoHeadline: "The professionals already running on Spectra.",
  regions: ["United States", "Russia", "Japan", "Netherlands", "Portugal", "Israel", "Chile"],
} as const;

// ── Slide 5 — The Triple Bundle ───────────────────────────────────────────────
export const TRIPLE_BUNDLE = {
  eyebrow: "Marketing Breakthrough",
  headline: "The Triple Bundle.",
  subheadline: "A proven go-to-market engine built and tested in 2025.",
  bundle: [
    { title: "30-Day Free Trial",  detail: "Full access, no commitment required." },
    { title: "Free Equipment",     detail: "Smart Scale and Premium Stand included." },
    { title: "Custom Training",    detail: "Complete onboarding and setup included." },
  ],
  funnelEyebrow: "2025 Sales Funnel",
  funnel: [
    { step: "Leads",     n: "1,476", conv: "100%",   cpl: "$27",  label: "Cost per lead" },
    { step: "Trials",    n: "301",   conv: "20.4%",  cpl: "$133", label: "Cost per trial" },
    { step: "Customers", n: "96",    conv: "32%",    cpl: "$417", label: "Cost per customer" },
  ],
  cacEyebrow: "CAC Breakdown",
  cac: [
    { label: "Meta Ads (12 months)", value: "$18,000" },
    { label: "Campaign Manager",     value: "$15,000" },
    { label: "Equipment Gifts",      value: "$7,000" },
  ],
  cacTotal: "$40,000",
  ltvEyebrow: "3-Year Cohort LTV (96 customers)",
  ltv: [
    { label: "2025 ARR", note: "Actual",      value: "$64,728" },
    { label: "2026 ARR", note: "5% churn",    value: "$61,492" },
    { label: "2027 ARR", note: "5% churn",    value: "$58,417" },
  ],
  ltvTotal: "$184,637",
  summary: [
    { label: "Total CAC",   value: "$40K",  highlight: false },
    { label: "3-Year LTV",  value: "$185K", highlight: false },
    { label: "Net Return",  value: "$145K", highlight: false },
    { label: "LTV:CAC",     value: "4.6x",  highlight: true  },
  ],
  aiUpside:
    "This funnel was tested before our AI operating layer. With today's AI capabilities, faster follow-up, and more efficient execution, we believe these acquisition metrics can improve by multiples.",
  closing: "We proved the product can sell, onboard, retain, and grow remotely. Then we paused marketing, studied what we learned, and moved into building the larger platform.",
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

// ── Slide 7 — Back Room To Front Desk (merged with Smart Booking Demo) ───────
export const BACK_ROOM = {
  eyebrow: "Smart Booking Demo",
  headline: "The system does not schedule appointments. It manages capacity.",
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
  eyebrow: "Mission Control Intelligence",
  headline: "The AI engine that sees the whole salon.",
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

// ── Slide 10+11 MERGED — Salon AI Acts (Agent Network + Why AI Works) ─────────
export const SALON_AI_ACTS = {
  eyebrow: "The Salon AI Agent Network",
  headline: "The Salon Starts Running Itself.",
  subheadline:
    "A live layer of autonomous agents turns signals into booked visits, ordered inventory, recovered clients, and revenue actions.",
  status: "Phase 2 — January 2027",
  traditional: ["Generates reports", "Surfaces recommendations", "Waits for humans"],
  salonAi: ["Executes workflows", "Updates systems", "Operates 24/7"],
  agents: [
    {
      name: "Booking Agent",
      detail: "Finds openings, contacts clients, confirms visits, and updates the calendar.",
      actions: ["Schedule appointments", "Move bookings", "Fill empty slots", "Optimize capacity"],
    },
    {
      name: "Inventory Agent",
      detail: "Forecasts shortages, creates orders, coordinates suppliers, and tracks delivery.",
      actions: ["Forecast inventory", "Create orders", "Contact suppliers", "Prevent stockouts"],
    },
    {
      name: "Retention Agent",
      detail: "Detects churn risk, launches win-backs, monitors response, and rebooks clients.",
      actions: ["Detect churn risk", "Launch campaigns", "Monitor response", "Rebook visits"],
    },
    {
      name: "Operations Agent",
      detail: "Monitors tasks, staff activity, and daily exceptions before they become misses.",
      actions: ["Daily oversight", "Staff monitoring", "Operational alerts", "Business checks"],
    },
    {
      name: "Growth Agent",
      detail: "Runs campaigns, captures reviews, identifies upsells, and compounds revenue.",
      actions: ["Run campaigns", "Generate reviews", "Support upsells", "Grow revenue"],
    },
  ],
  closing: "From insight to action. From software to autonomous management capacity.",
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
    { phase: "Phase 2", product: "Smart Booking + CRM + POS",   arpu: "$2,060 / year" },
    { phase: "Phase 3", product: "Salon Operating System",      arpu: "$3,060 / year" },
    { phase: "Phase 4", product: "Salon AI Agent Suite",        arpu: "$4,860 / year" },
  ],
  bars: [
    { stage: "Cost Optimization", value: 960,  display: "$960" },
    { stage: "Booking & POS",     value: 2060, display: "$2,060" },
    { stage: "Salon AI",          value: 4860, display: "$4,860" },
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
  eyebrow: "Open SAFE Allocation",
  headline: "After raising more than $1.2M from high-quality investors, we have one attractive SAFE allocation still open.",
  amount: "$350K",
  amountSub: "$350K SAFE allocation plus $130K current ARR funds a $480K operating plan",
  points: [
    { status: "Raised", title: "$1.2M+", detail: "Already committed by strong investors who understand the salon operating opportunity." },
    { status: "Open",   title: "$350K",  detail: "Available on a SAFE at a compelling $4.15M pre-money valuation." },
    { status: "Target", title: "$1.12M ARR", detail: "Capital accelerates product development and go-to-market toward 562 active subscriptions." },
  ],
  roadmap: [
    "$130K ARR today",
    "Accelerated product development",
    "Target-market go-to-market",
    "Sales and adoption expansion",
    "$1.12M ARR and 562 subscriptions",
  ],
  focus: ["Open SAFE", "$4.15M pre-money", "$350K capacity", "Product acceleration", "Target-market GTM"],
  budgetTitle: "How The Next 12 Months Are Funded",
  budget: [
    { label: "Marketing & Advertising", amount: "$154K", percent: 32 },
    { label: "Sales & Lead Management", amount: "$34K", percent: 7 },
    { label: "Software & Technology", amount: "$110K", percent: 23 },
    { label: "Operations & Senior Leadership", amount: "$182K", percent: 38 },
  ],
  growthNote:
    "The next 12 months are funded by a $350K SAFE allocation plus $130K of current ARR, creating a $480K operating plan designed to move Spectra toward a $1.12M ARR run-rate and 562 subscriptions.",
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
