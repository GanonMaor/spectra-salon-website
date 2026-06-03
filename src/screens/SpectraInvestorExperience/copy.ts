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
  eyebrow: "Spectra CI \u2014 The Real Innovation In The Beauty Industry",
  headline: "Salon AI",
  subheadline: "The world\u2019s first AI-native operating system for beauty salons.",
  lines: [
    "We began by giving salons true visibility into their costs.",
    "Today we run the entire salon on one intelligent platform.",
    "Tomorrow we become the intelligence layer of the global beauty industry.",
  ],
  ctaPrimary: "Watch Demo",
  ctaSecondary: "Investor Brief",
  chapterLabel: "Begin",
} as const;

// ── SECTION 2: COLOR BAR ORIGIN ──────────────────────────────────────────────

export const COLOR_BAR = {
  eyebrow: "Chapter 1 \u2014 We Solved A Real Problem",
  headline: "We Started As A Cost-Optimization Platform At The Color Bar.",
  subhead:
    "An innovative, true-SaaS platform, built where salon profitability is won or lost.",
  context:
    "For decades, salon owners never really knew their true profitability, material waste, real inventory needs, or which services and staff actually made money.",
  unknowns: [
    "Their true profitability",
    "How much material was wasted",
    "How much inventory they actually needed",
    "Which staff consumed more material",
    "Which services actually made money",
  ],
  builtLine: "Spectra CI connects every cost signal at the bar:",
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
    "Product-market fit among the highest seen in the industry \u2014 proven across 12 countries worldwide.",
} as const;

// ── SECTION 3: SPECTRA TODAY ─────────────────────────────────────────────────

export const SPECTRA_TODAY = {
  eyebrow: "Spectra Today",
  headline: "Our Numbers.",
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
  subhead: "Owners across four countries use Spectra daily.",
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
  subhead: "The real problem wasn\u2019t color. It was fragmented operations.",
  reveal:
    "The real problem: the salon runs on 5 different systems. Each generating data that went nowhere.",
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
    "Starting at the operational core is harder to replicate than starting at the front desk.",
  closing:
    "Every layer was a natural consequence of the one before it.",
} as const;

// ── SECTION 7: WHY NOW ───────────────────────────────────────────────────────

export const WHY_NOW = {
  eyebrow: "Why Now",
  headline: "Three trends converged.",
  subhead: "The conditions that make a unified operating system possible now.",
  trends: [
    {
      title: "Cloud Adoption",
      detail: "Salons now expect connected, always-on software.",
    },
    {
      title: "Real-Time Operational Data",
      detail: "Connected workflows capture live signals impossible a decade ago.",
    },
    {
      title: "AI Reasoning",
      detail: "Models turn raw operational data into decisions \u2014 no analyst needed.",
    },
  ],
  closing:
    "The technology finally caught up with the problem.",
} as const;

// ── SECTION 8: SALONOS ───────────────────────────────────────────────────────

export const SALON_OS = {
  eyebrow: "Chapter 4 \u2014 We Built The Operating System",
  headlineLine1: "The Salon Doesn\u2019t Need Another Tool.",
  headlineLine2: "It Needs An Operating System.",
  subhead:
    "When everything connects, every workflow gets smarter \u2014 and switching costs rise.",
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
    "They\u2019re closing the entire loop.",
} as const;

// ── SECTION 9: UNEXPECTED ASSET ──────────────────────────────────────────────

export const UNEXPECTED = {
  eyebrow: "Chapter 3 \u2014 The Unexpected Asset",
  headline: "Then something unexpected emerged.",
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
  signalsClosing: "Creates another layer of operational intelligence.",
  quote:
    "Most salon software companies know what was booked.\u00A0\nSpectra knows what actually happened.",
  closing:
    "This dataset cannot be recreated by starting from the front desk.",
} as const;

// ── SECTION 10: THE OPPORTUNITY ──────────────────────────────────────────────

export const OPPORTUNITY = {
  eyebrow: "The Opportunity",
  headline: "We are starting with hair salons.",
  subheadAccent: "The operational challenges we solve exist across a much larger market.",
  tiers: [
    { label: "Adjacent TAM", value: "$677.19B", note: "Beauty & personal care" },
    { label: "TAM", value: "$447.76B", note: "Global salon services" },
    { label: "SAM", value: "$52.66B", note: "Hair color market" },
    { label: "SOM", value: "Color-heavy salons", note: "Reachable via current distribution" },
  ],
  entry: "Entry point: the color bar.",
  problem: "$10K\u2013$30K lost per salon, every year, on unmeasured color.",
  insight:
    "The same system applies to every beauty business that manages services, products, and professionals.",
  sources:
    "Sources: Fortune Business Insights (salon services, 2032E); Maximize Market Research (hair color, 2032E); Statista (beauty & personal care, 2025).",
} as const;

// ── SECTION 11: ECONOMICS IMPROVE ───────────────────────────────────────────

export const ECONOMICS = {
  eyebrow: "Chapter 5 \u2014 The Economics Improve",
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
      "Salon owners are not searching for cost-optimization software. They are searching for ways to run better salons. Salon AI dramatically expands our market appeal.",
    metrics: [
      { label: "Conversion Rates", detail: "A broader product resonates with more owners." },
      { label: "Customer Acquisition Cost", detail: "Wider appeal lowers cost to acquire." },
      { label: "Retention", detail: "More value delivered, longer relationships." },
      { label: "Lifetime Value", detail: "Deeper platform compounds account value." },
    ],
  },
  unitEcon: {
    headline: "Better Unit Economics",
    insight:
      "AI helps us support more customers with fewer human resources. Revenue scales faster than operating costs.",
    automated: [
      "Customer Success",
      "Training",
      "Support",
      "Recommendations",
      "Analysis",
    ],
  },
} as const;

// ── SECTION 12: SALON AI REVEAL ──────────────────────────────────────────────

export const SALON_AI = {
  eyebrow: "Chapter 6 \u2014 We Added Intelligence",
  headline: "Introducing Salon AI.",
  subhead:
    "Not a feature alongside the operating system. A layer above it.",
  center: {
    name: "Alice",
    role: "Your Personal Salon Assistant",
    description:
      "Understands the entire business \u2014 and acts on it.",
  },
  agents: [
    {
      name: "Operations Agent",
      outcome: "Smarter scheduling. Fewer gaps. Higher utilization.",
    },
    {
      name: "Inventory Agent",
      outcome: "Never run out of products. Smarter purchasing. Demand forecasting.",
    },
    {
      name: "Performance Agent",
      outcome: "Track profitability. Reduce waste. Improve team performance.",
    },
    {
      name: "Growth Agent",
      outcome:
        "Retention. Upselling. Client reactivation. Revenue growth.",
    },
  ],
  closing: "The AI doesn\u2019t sit beside the operating system. It runs through it.",
} as const;

// ── SECTION 13: SALON NETWORK ────────────────────────────────────────────────

export const NETWORK = {
  eyebrow: "The Salon Network",
  headline: "Everyone connected. AI in the middle.",
  subhead:
    "Owners, managers, stylists, receptionists, and clients \u2014 connected in one AI-native environment.",
  roles: [
    { label: "Owners", note: "Business decisions, not dashboards." },
    { label: "Managers", note: "Team visibility. Performance in real time." },
    { label: "Stylists", note: "Formulas ready. History accessible." },
    { label: "Receptionists", note: "Schedules optimized. Clients handled." },
    { label: "Clients", note: "A salon that remembers everything." },
    { label: "AI", note: "Working across all layers simultaneously." },
  ],
  insight:
    "The deeper this network goes, the harder the platform is to leave.",
} as const;

// ── SECTION 14: BEYOND SOFTWARE ─────────────────────────────────────────────

export const BEYOND = {
  eyebrow: "Chapter 7 \u2014 Beyond Software",
  headline: "Not SaaS. A Platform.",
  subhead:
    "Three revenue engines. Revenue expands without proportional cost growth.",
  engines: [
    {
      number: "01",
      title: "Salon Subscriptions",
      detail: "Recurring SaaS across Spectra CI, SalonOS, and Salon AI tiers.",
    },
    {
      number: "02",
      title: "AI Token Consumption",
      detail: "Salons purchasing additional AI capacity. Usage-based, not headcount-based.",
    },
    {
      number: "03",
      title: "Industry Intelligence",
      detail: "Brands. Distributors. Manufacturers. Consultants. Market research.",
    },
  ],
  example:
    "A company like L\u2019Or\u00E9al can gain access to real-world operational intelligence generated directly from salon activity.",
  closing:
    "Each engine compounds. None requires a new customer.",
} as const;

// ── SECTION 15: INDUSTRY INTELLIGENCE ───────────────────────────────────────

export const INDUSTRY = {
  eyebrow: "Industry Intelligence",
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
    "Brands spend heavily to learn how products are used. Spectra captures it at the source.",
  closing:
    "The Bloomberg Terminal of Beauty.",
} as const;

// ── SECTION 16: FUTURE MARKET EXPANSION ─────────────────────────────────────

export const EXPANSION = {
  eyebrow: "Market Expansion",
  headline: "Hair Salons Are Our Starting Point.",
  subheadAccent: "Not Our Limit.",
  context:
    "The same system applies to every beauty business managing professionals, products, and clients.",
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
    "We are not building for salons. We are building for beauty businesses.",
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
  eyebrow: "The Long-Term Vision",
  lines: [
    "We started by helping salons understand color.",
    "Then we connected the entire salon.",
    "Now we are building the intelligence layer that helps run it.",
  ],
  growthLead: "As Spectra grows, every salon strengthens the platform.",
  dataLines: [
    "Every appointment.",
    "Every formula.",
    "Every inventory movement.",
    "Every customer interaction.",
  ],
  datasetClosing:
    "Adds to a dataset that becomes more valuable, more intelligent, and more difficult to replicate.",
  belief:
    "Our vision is not simply to build another salon software company.",
  beliefEmphasis:
    "Our vision is to build the operating system and intelligence infrastructure of the global beauty industry.",
  signature: "Salon AI",
  tagline: "The World\u2019s First AI-Native Operating System For Beauty Salons.",
  ctaPrimary: "Request Investor Access",
  ctaSecondary: "View Financial Model",
  footer: "Confidential \u2014 prepared for investors. Not for distribution.",
} as const;
