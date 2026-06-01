/**
 * Locked copy for the Spectra Investor Experience.
 *
 * This is a strategic brief, not marketing copy.
 * Every line must move the investor one level higher in the business thesis.
 *
 * Voice rules:
 *  – Declarative statements, not pitches.
 *  – Numbers stand alone (never "massive $960").
 *  – No buzzwords: synergy, leverage, disrupt, revolutionary, seamless, next-gen.
 *  – One idea per line. White space does the rest.
 *
 * Real KPIs sourced from: src/screens/SpectraProductVision/dataMoat.ts (PROOF object).
 *   salonAccounts: 428, services: 556,455, grams: 30,878,848, brands: 221, monthsOfHistory: 40
 */

export const META = {
  title: "Salon AI — Investor Experience",
  description:
    "From Color Intelligence to the operating system and intelligence layer of the beauty industry.",
  route: "/investors/salon-ai",
} as const;

export const CHROME = {
  confidential: "Confidential — prepared for investors.",
  brand: "Salon AI · Spectra",
  chapterLabel: "Chapter",
} as const;

// ── SECTION 1: HERO ─────────────────────────────────────────────────────────

export const HERO = {
  eyebrow: "Spectra CI presents",
  headline: "Salon AI",
  subheadline: "From Color Intelligence to the AI Operating System for Beauty Salons",
  lines: [
    "We started by helping salons understand their costs.",
    "Today we\u2019re building the platform that helps them run their entire business.",
    "Tomorrow we\u2019re building the intelligence layer of the beauty industry.",
  ],
  ctaPrimary: "Watch Demo",
  ctaSecondary: "Investor Brief",
  chapterLabel: "Begin",
} as const;

// ── SECTION 2: COLOR BAR ORIGIN ──────────────────────────────────────────────

export const COLOR_BAR = {
  eyebrow: "Chapter 1 \u2014 We Solved A Real Problem",
  headline: "We Started At The Color Bar.",
  subhead:
    "Not at the front desk. Not at the booking calendar. At the point where salon profitability is created or lost.",
  context:
    "For decades, salon owners managed color services by memory and intuition. They had no visibility into true profitability, product waste, or inventory needs.",
  cards: [
    {
      title: "Formula Management",
      detail: "Every mix tracked to the gram. Every formula repeatable.",
    },
    {
      title: "Inventory Intelligence",
      detail: "Products tracked as they are consumed, not estimated.",
    },
    {
      title: "Waste Tracking",
      detail: "Mixed vs. used. The hidden cost made visible.",
    },
    {
      title: "Profitability Analysis",
      detail: "Real margin per service. Not guesswork.",
    },
    {
      title: "Predictive Ordering",
      detail: "Reorder before stockout, based on actual consumption.",
    },
  ],
  closing:
    "Spectra CI solved a problem that no other platform had thought to instrument.",
} as const;

// ── SECTION 3: SPECTRA TODAY ─────────────────────────────────────────────────

export const SPECTRA_TODAY = {
  eyebrow: "Spectra Today",
  headline: "This is already real.",
  subhead: "Real salons. Real data. Real usage.",
  kpis: [
    { label: "Salon Accounts", value: "428", note: "Jan 2023\u2013Apr 2026" },
    { label: "Countries", value: "4+", note: "US, Canada, Europe, Israel" },
    { label: "Mixes Tracked", value: "556K+", note: "Color formulas recorded" },
    { label: "Grams Measured", value: "30.9M", note: "Gram-level operational data" },
  ],
  footnote: "Data: Jan 2023\u2013Apr 2026. 40 months of operational history.",
} as const;

// ── SECTION 4: CUSTOMER VALIDATION ───────────────────────────────────────────

export const VALIDATION = {
  eyebrow: "Customer Validation",
  headline: "Real salons. Real results.",
  subhead: "From the color bar to the front desk, owners across four countries use Spectra daily.",
  regions: ["United States", "Canada", "Europe", "Israel"],
  quotes: [
    {
      quote:
        "For the first time, I actually know which services make money and which ones cost me.",
      role: "Salon Owner",
      location: "United States",
    },
    {
      quote:
        "The color waste alone paid for the subscription in the first month.",
      role: "Salon Owner",
      location: "Canada",
    },
    {
      quote:
        "My stylists now have every formula at their fingertips. No more guessing.",
      role: "Salon Director",
      location: "Israel",
    },
    {
      quote:
        "Inventory used to be a nightmare. Now I reorder before I run out.",
      role: "Salon Owner",
      location: "Europe",
    },
  ],
  mapNote: "Active in 4+ countries across North America, Europe, and the Middle East.",
} as const;

// ── SECTION 5: WHAT WE LEARNED ───────────────────────────────────────────────

export const LEARNED = {
  eyebrow: "Chapter 2 \u2014 We Discovered A Bigger Problem",
  headline: "Solving color costs gave us visibility into the entire salon.",
  subhead: "The problem was not color. The problem was fragmented operations.",
  reveal:
    "Salons were running on multiple disconnected systems \u2014 booking, CRM, inventory, POS, marketing, and color \u2014 each generating data that went nowhere.",
  timeline: [
    {
      phase: "Before Service",
      items: ["Booking confirmed", "Formula history reviewed", "Products prepared"],
    },
    {
      phase: "During Service",
      items: ["Formula mixed", "Grams recorded", "Service delivered"],
    },
    {
      phase: "After Service",
      items: ["Payment processed", "Inventory updated", "Follow-up scheduled"],
    },
  ],
  closing:
    "Every step generated data. No system connected it into intelligence.",
  transition:
    "That realization changed the direction of the company.",
} as const;

// ── SECTION 6: WHY US ────────────────────────────────────────────────────────

export const WHY_US = {
  eyebrow: "Why Us",
  headline: "Most competitors started at the front desk.",
  subheadAccent: "Spectra started where profitability is created or lost.",
  contrast: {
    traditional: {
      label: "Traditional Salon Software",
      steps: ["Bookings", "POS", "Reports", "Operations"],
      direction: "From administration toward operations.",
    },
    spectra: {
      label: "Spectra",
      steps: ["Operations", "Inventory", "Profitability", "Operating System"],
      direction: "From operations toward administration.",
    },
  },
  insight:
    "That path is harder to replicate. It gave Spectra visibility into product consumption, formula behavior, waste patterns, and service economics before any competitor expanded into operations.",
  closing:
    "Every layer we built was a natural consequence of the one before it.",
} as const;

// ── SECTION 7: WHY NOW ───────────────────────────────────────────────────────

export const WHY_NOW = {
  eyebrow: "Why Now",
  headline: "Three trends converged.",
  subhead: "The conditions that make a unified operating system possible now.",
  trends: [
    {
      title: "Cloud Adoption",
      detail:
        "Salon owners now expect software that works anywhere, updates automatically, and connects across devices.",
    },
    {
      title: "Real-Time Operational Data",
      detail:
        "Hardware integrations and connected workflows generate live operational signals that were impossible to capture a decade ago.",
    },
    {
      title: "AI Reasoning",
      detail:
        "Language and reasoning models can now turn raw operational data into actionable decisions \u2014 without requiring every salon to hire a data analyst.",
    },
  ],
  closing:
    "The technology caught up with the problem. The timing is now.",
} as const;

// ── SECTION 8: SALONOS ───────────────────────────────────────────────────────

export const SALON_OS = {
  eyebrow: "Chapter 3 \u2014 We Built The Operating System",
  headlineLine1: "The Salon Doesn\u2019t Need Another Tool.",
  headlineLine2: "It Needs An Operating System.",
  subhead:
    "When everything is connected, every workflow becomes more intelligent \u2014 and switching costs rise significantly.",
  flow: [
    { label: "Booking", note: "Schedule intelligence" },
    { label: "Service", note: "Formula & delivery" },
    { label: "Formula", note: "Gram-level tracking" },
    { label: "Inventory", note: "Real-time stock" },
    { label: "Payment", note: "Margin per service" },
    { label: "Profitability", note: "Business intelligence" },
    { label: "Retention", note: "Client intelligence" },
  ],
  closing:
    "A salon that uses all seven layers is not looking for alternatives. The switching cost becomes too high.",
} as const;

// ── SECTION 9: UNEXPECTED ASSET ──────────────────────────────────────────────

export const UNEXPECTED = {
  eyebrow: "The Unexpected Asset",
  headline: "Once Everything Connected, Something Unexpected Emerged.",
  equation: {
    left: "Booking Data",
    plus: "+",
    right: "Operational Data",
    equals: "=",
    result: "Industry Intelligence",
  },
  signals: [
    "Every formula",
    "Every service",
    "Every gram consumed",
    "Every reorder",
    "Every customer visit",
    "Every booking",
    "Every inventory movement",
  ],
  quote:
    "Most salon software knows what was booked.\u00A0\nSpectra knows what actually happened.",
  closing:
    "This dataset did not exist before Spectra. It cannot be recreated by starting from the front desk.",
} as const;

// ── SECTION 10: THE OPPORTUNITY ──────────────────────────────────────────────

export const OPPORTUNITY = {
  eyebrow: "The Opportunity",
  headline: "We are starting with hair salons.",
  subheadAccent: "The operational challenges we solve exist across a much larger market.",
  stack: [
    { label: "Global Beauty Industry", scale: "~$600B global market" },
    { label: "Beauty Businesses", scale: "Salons, clinics, studios, chains" },
    { label: "Hair Salons", scale: "Our primary entry market" },
    { label: "Our Entry Point", scale: "The color bar" },
  ],
  insight:
    "Hair salons are the entry point. The operational system we are building applies to every beauty business that manages services, products, and professionals.",
} as const;

// ── SECTION 11: ECONOMICS IMPROVE ───────────────────────────────────────────

export const ECONOMICS = {
  eyebrow: "Chapter 4 \u2014 The Economics Improve",
  headline: "Every layer increases the value of the same customer.",
  subhead: "No additional acquisition cost. Higher revenue. Higher retention.",
  ladder: [
    {
      stage: "Spectra CI",
      arpu: "$960",
      period: "Annual Revenue Per Salon",
      note: "Color intelligence entry point",
    },
    {
      stage: "SalonOS",
      arpu: "$1,920",
      period: "Annual Revenue Per Salon",
      note: "Full operating system",
    },
    {
      stage: "Salon AI",
      arpu: "$6,000+",
      period: "Annual Revenue Per Salon",
      note: "AI layer + agents + intelligence",
    },
  ],
  takeaways: [
    "Same Customer",
    "Higher Revenue",
    "Higher Retention",
    "Higher Switching Costs",
    "No Additional Acquisition Cost",
  ],
  marketing: {
    headline: "Better Marketing Economics",
    insight:
      "Salon owners are not searching for cost optimization software. They are searching for ways to run better salons. SalonOS is the answer to that search.",
    metrics: [
      { label: "Lower CAC", detail: "Broader product resonates with more decision-makers." },
      { label: "Higher LTV", detail: "Deeper platform = longer retention, more expansion." },
      { label: "Better Conversion", detail: "Solving the whole problem closes faster." },
    ],
  },
  unitEcon: {
    headline: "Better Unit Economics",
    insight:
      "As AI automates more of the customer experience, revenue grows faster than operating costs.",
    automated: [
      "Customer Success",
      "Training & Onboarding",
      "Support Queries",
      "Business Recommendations",
      "Performance Analysis",
    ],
  },
} as const;

// ── SECTION 12: SALON AI REVEAL ──────────────────────────────────────────────

export const SALON_AI = {
  eyebrow: "Chapter 5 \u2014 We Added Intelligence",
  headline: "Introducing Salon AI.",
  subhead:
    "Not a feature alongside the operating system. A layer above it.",
  center: {
    name: "Alice",
    role: "Your Personal Salon Assistant",
    description:
      "Alice understands the entire business \u2014 appointments, inventory, staff performance, and customer journeys \u2014 and acts on that understanding.",
  },
  agents: [
    {
      name: "Operations Agent",
      outcome: "Detects delays. Rebalances schedules. Notifies clients before they notice.",
    },
    {
      name: "Inventory Agent",
      outcome: "Forecasts stockouts. Triggers reorders. Tracks waste automatically.",
    },
    {
      name: "Performance Agent",
      outcome: "Surfaces margin drops. Identifies top performers. Flags at-risk services.",
    },
    {
      name: "Growth Agent",
      outcome:
        "Reactivates lapsed clients. Launches campaigns. Tracks rebooking before it lapses.",
    },
  ],
  closing: "The AI doesn\u2019t sit beside the operating system. It runs through it.",
} as const;

// ── SECTION 13: SALON NETWORK ────────────────────────────────────────────────

export const NETWORK = {
  eyebrow: "The Salon Network",
  headline: "Everyone connected. AI in the middle.",
  subhead:
    "Every person in the salon \u2014 owner, manager, receptionist, stylist, and client \u2014 connected in one intelligent system.",
  roles: [
    { label: "Owner", note: "Business decisions, not dashboards." },
    { label: "Manager", note: "Team visibility. Performance in real time." },
    { label: "Receptionist", note: "Schedules optimized. Clients handled." },
    { label: "Stylist", note: "Formulas ready. History accessible." },
    { label: "Client", note: "A salon that remembers everything." },
    { label: "AI", note: "Working across all layers simultaneously." },
  ],
  insight:
    "The deeper this network goes, the harder the platform is to leave.",
} as const;

// ── SECTION 14: BEYOND SOFTWARE ─────────────────────────────────────────────

export const BEYOND = {
  eyebrow: "Beyond Software",
  headline: "Three Revenue Engines.",
  subhead:
    "The platform is designed to expand revenue without requiring proportional cost growth.",
  engines: [
    {
      number: "01",
      title: "Salon Subscriptions",
      detail:
        "Recurring SaaS revenue from Spectra CI, SalonOS, and Salon AI tiers. Expanding ARPU as salons adopt more layers.",
    },
    {
      number: "02",
      title: "AI Token Consumption",
      detail:
        "Usage-based revenue from AI agents, recommendations, and automation. Scales with platform depth, not headcount.",
    },
    {
      number: "03",
      title: "Industry Intelligence",
      detail:
        "Aggregated operational data \u2014 anonymized and privacy-safe \u2014 that becomes valuable to beauty brands, distributors, and industry researchers.",
    },
  ],
  closing:
    "Each engine compounds. None requires acquiring a new customer to generate more revenue.",
} as const;

// ── SECTION 15: INDUSTRY INTELLIGENCE ───────────────────────────────────────

export const INDUSTRY = {
  eyebrow: "Chapter 6 \u2014 The Data Becomes Monetizable",
  headline: "The dataset becomes valuable to the industry itself.",
  subhead:
    "Brands and distributors cannot see inside real salon operations. Spectra can.",
  examples: [
    { label: "Product Consumption Trends", detail: "Which brands and formulas are actually used." },
    { label: "Regional Demand", detail: "How usage varies by market and salon type." },
    { label: "Inventory Forecasting", detail: "When products are needed before salons know it." },
    { label: "Category Growth", detail: "Which service categories are gaining or losing share." },
    { label: "Service Profitability", detail: "Which services generate margin across the industry." },
    { label: "Beauty Market Intelligence", detail: "A real-time view of operational beauty data." },
  ],
  brands: ["L\u2019Or\u00E9al", "Wella", "Schwarzkopf"],
  brandInsight:
    "These companies spend significantly to understand how their products are used in salons. Spectra is the only platform that captures that at the operational level.",
  closing:
    "The Bloomberg Terminal of Beauty starts with real salon telemetry.",
} as const;

// ── SECTION 16: FUTURE MARKET EXPANSION ─────────────────────────────────────

export const EXPANSION = {
  eyebrow: "Chapter 7 \u2014 The Market Is Larger Than Salons",
  headline: "Hair Salons Are Our Starting Point.",
  subheadAccent: "Not Our Limit.",
  context:
    "The operational system we have built \u2014 service management, inventory, profitability, AI \u2014 applies to every beauty business that manages professionals, products, and clients.",
  markets: [
    { label: "Hair Salons", note: "Current market. Deep penetration underway." },
    { label: "Nail Studios", note: "Product consumption. Service profitability. Same problem." },
    { label: "Beauty Clinics", note: "Complex services. High margins. Inventory sensitivity." },
    { label: "Med Spas", note: "Regulated products. Treatment tracking. Staff certification." },
    { label: "Aesthetic Centers", note: "Multi-service. High-value clients. Retention critical." },
    { label: "Beauty Chains", note: "Multi-location management. Standardization. Benchmarks." },
    { label: "Franchises", note: "Brand consistency. Operational control. AI performance." },
    { label: "Multi-Location Groups", note: "Consolidated intelligence. Network effects." },
  ],
  disclaimer:
    "This is future optionality. Current execution is focused on hair salons.",
  closing:
    "The TAM grows as the platform matures. We are not building for salons. We are building for beauty businesses.",
} as const;

// ── SECTION 17: FLYWHEEL ─────────────────────────────────────────────────────

export const FLYWHEEL = {
  eyebrow: "Chapter 8 \u2014 The Data Flywheel",
  headline: "The network compounds.",
  subhead:
    "Every salon that joins the platform makes it more valuable for every other salon.",
  center: "Data\u00A0Network\u00A0Effect",
  steps: [
    { label: "More Salons", detail: "Wider operational coverage." },
    { label: "More Data", detail: "Richer formulas, usage, and behavior signals." },
    { label: "Better AI", detail: "Recommendations and forecasting improve." },
    { label: "Better Results", detail: "Outcomes improve for every salon." },
    { label: "Higher Retention", detail: "Salons that get results stay longer." },
    { label: "More Revenue", detail: "Expansion within accounts. Referrals." },
  ],
  closing:
    "This is not a feature. It is the economic architecture of the company.",
} as const;

// ── SECTION 18: FINAL VISION ─────────────────────────────────────────────────

export const VISION = {
  eyebrow: "Chapter 9 \u2014 The Long-Term Vision",
  lines: [
    "Every salon that joins the platform improves the system.",
    "Every interaction improves the intelligence.",
    "Every decision strengthens the dataset.",
    "Every new customer increases the value of the network.",
  ],
  belief:
    "We believe the future of beauty businesses will not be powered by disconnected software.",
  beliefEmphasis: "It will be powered by intelligence.",
  signature: "Salon AI",
  tagline: "The Operating System For Beauty Businesses.",
  ctaPrimary: "Request Investor Access",
  ctaSecondary: "View Financial Model",
  footer: "Confidential \u2014 prepared for investors. Not for distribution.",
} as const;
