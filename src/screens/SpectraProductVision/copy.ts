/**
 * Typed copy for the "Spectra Product & Vision" investor page.
 * Source of truth: investor-assets/COPY_SYSTEM.md.
 *
 * Keep this in sync with COPY_SYSTEM.md. Apple-style: minimal words,
 * no buzzwords, presentation-ready statements.
 */

export const PAGE_META = {
  title: "Salon AI — Product & Vision",
  description: "The AI-native operating system for the global beauty industry.",
} as const;

export const CHROME = {
  brand: "Salon AI",
  scrollHint: "Scroll",
  footerConfidential: "Confidential — prepared for investors.",
  footerBrand: "Salon AI · Spectra",
  reducedMotionNotice: "Animations reduced for your settings.",
  ctaRequestAccess: "Request access",
  ctaViewModel: "View the model",
} as const;

export const OPENING = {
  eyebrow: "The AI-Native Operating System for Beauty",
  headline: "Meet Salon AI",
  subheadline: "The first AI Operating System for beauty salons.",
  supporting:
    "From booking to the color bar, inventory, payments, client journeys and AI agents, everything works together in one intelligent system.",
  highlight: "Run the salon.\nFocus on the craft.",
  ctaPrimary: "Explore the Vision",
  ctaSecondary: "View the Model",
  cards: [
    { eyebrow: "Today's Schedule", value: "Liora Cohen", detail: "Highlights · 11:20" },
    { eyebrow: "AI Insight", value: "40% of revenue", detail: "from color services" },
    { eyebrow: "Color Bar", value: "Formula ready", detail: "70g · cost tracked" },
    { eyebrow: "AI Agent", value: "Delay detected", detail: "client notified" },
  ],
  scrollCue: "Begin",
} as const;

export const PROBLEM = {
  eyebrow: "The Problem",
  headlineLines: ["Software records activity.", "It does not understand it."],
  systems: ["Booking", "CRM", "Inventory", "POS", "Marketing", "Color"],
  transition: "Six systems. One business. No intelligence.",
  closing: "Every day, salons generate enormous data.",
  closingEmphasis: "Nobody turns it into intelligence.",
} as const;

export const ECOSYSTEM = {
  eyebrow: "Inside the Salon",
  headline: "A salon in motion.",
  subhead: "Every role. Every moment. Every signal.",
  nodes: [
    "Owner",
    "Reception",
    "Stylist",
    "Color Bar",
    "Customer",
    "Inventory",
    "Payments",
  ],
  ticker: [
    "A customer books.",
    "Reception schedules.",
    "A stylist delivers.",
    "Spectra captures the formula.",
    "Inventory updates.",
    "Payment clears.",
  ],
  closing: "Everything here is data.",
} as const;

export const JOURNEY = {
  eyebrow: "One Customer",
  headline: "Follow a single visit.",
  steps: [
    "Booking",
    "Arrival",
    "Consultation",
    "Color service",
    "Formula created",
    "Product consumed",
    "Payment",
    "Follow-up",
    "Rebooking",
  ],
  stepMicro: "+ data point",
  climax: "Every interaction becomes intelligence.",
} as const;

export const SPECTRA = {
  eyebrow: "The Color Bar",
  headline: "The moment a color is mixed, Spectra sees everything.",
  subhead:
    "At the color bar, a connected scale turns the real service moment into structured data — customer, colorist, formula, products, grams, cost, waste, and margin.",
  captures: [
    { label: "Brand", glyph: "swatch", value: "Which professional line" },
    { label: "Product", glyph: "bottle", value: "Exact shades used" },
    { label: "Grams", glyph: "scale", value: "Measured to the gram" },
    { label: "Formula", glyph: "color", value: "The full recipe" },
    { label: "Cost", glyph: "payments", value: "Material cost per service" },
    { label: "Waste", glyph: "bowl", value: "Mixed vs. used" },
    { label: "Customer", glyph: "customer", value: "Tied to her history" },
    { label: "Profitability", glyph: "agent-bi", value: "Margin per service" },
  ],
  takeaway: "Spectra is the data engine inside Salon AI — the service moment no CRM can see.",
} as const;

export const BRAIN = {
  eyebrow: "The Intelligence Layer",
  headline: "One layer that understands the whole salon.",
  coreLabel: "Salon AI",
  orbit: [
    "Customers",
    "Appointments",
    "Services",
    "Inventory",
    "Brands",
    "Product usage",
    "Marketing",
    "Communications",
    "Payments",
    "Formulas",
    "Team",
  ],
  statement: "The first intelligence layer built for beauty.",
  audiences: [
    { for: "For Owners", line: "Decisions, not dashboards." },
    { for: "For Employees", line: "Less admin, more craft." },
    { for: "For Customers", line: "A salon that remembers you." },
  ],
} as const;

export const WORKFORCE = {
  eyebrow: "The AI Workforce",
  headline: "A workforce that never sleeps.",
  subhead: "Specialized assistants, working alongside your salon team.",
  agents: [
    { name: "Front Desk", task: "Rebooked 3 clients before they lapsed" },
    { name: "Marketing", task: "Launched a win-back campaign for fading regulars" },
    { name: "Color Stock", task: "Reordered lightener before it ran out" },
    { name: "Scheduling", task: "Rebalanced tomorrow's chairs and breaks" },
    { name: "Business Insights", task: "Flagged a margin drop on color services" },
    { name: "Spectra Intelligence", task: "Optimized 12 formulas and cut color waste" },
  ],
  closing: "Human teams. Digital colleagues.",
} as const;

export const EVOLUTION = {
  eyebrow: "Customer Evolution",
  headline: "The customer never changes systems.",
  subhead: "They simply unlock more intelligence.",
  milestones: [
    { year: "Year 1", label: "Foundation", products: "Salon OS + Spectra", value: "$250 / mo" },
    { year: "Year 2", label: "Intelligence", products: "+ AI credits", value: "$450 / mo" },
    { year: "Year 3", label: "Automation", products: "+ first agents", value: "$800 / mo" },
    { year: "Year 4", label: "Digital Workforce", products: "Full agent team", value: "$1,500 / mo" },
    { year: "Year 5+", label: "Enterprise", products: "Multi-location + benchmarking", value: "$3,000–10,000+ / mo" },
  ],
  engineLine: "Land. Expand. Automate. Compound.",
  footnote: "Expansion with no new acquisition cost.",
} as const;

export const NETWORK = {
  eyebrow: "Network Effects",
  headline: "Every salon makes the platform smarter.",
  counterSequence: ["1", "10", "100", "1,000", "10,000", "50,000"],
  counterUnit: "salons",
  growthLabels: [
    "Color intelligence",
    "Customer intelligence",
    "Service intelligence",
    "Business intelligence",
    "Product intelligence",
  ],
  statement: "Every formula. Every service. Every salon.",
  closingEmphasis: "Data becomes the moat.",
} as const;

export const DATASET = {
  eyebrow: "The Beauty Intelligence Dataset",
  headline: "Every service becomes a data point.",
  subhead:
    "Each salon generates thousands of operational signals every month — every color service, formula, gram, and rebooking. At scale, Salon AI becomes one of the most distinctive datasets in the global beauty industry.",
  proofLine: "The Bloomberg Terminal of Beauty starts with real salon telemetry:",
  oneSalonLabel: "One salon generates, every year",
  scaleLabel: "From one salon to a living industry graph",
  brandEyebrow: "Brand & Product Intelligence",
  brandHeadline: "Salon AI sees how professional beauty products are actually used inside real salons.",
  categoriesEyebrow: "What the data enables",
  categoriesHeadline: "Volume is the proof. Relationships are the value.",
  visibilityEyebrow: "Competitive visibility",
  visibilityHeadline: "Everyone sees a slice. Salon AI sees the loop.",
  visibilityClosing: "Nobody else sees all of it inside one system.",
  flywheelEyebrow: "Why it compounds",
  flywheelHeadline: "The dataset is a flywheel.",
  takeawayLead: "The value is not the amount of data.",
  takeaway:
    "Salon AI sees operational relationships across the entire beauty business that no other platform can observe in one place.",
} as const;

export const VISION = {
  eyebrow: "The Vision",
  headlineLines: [
    "Salon OS runs the business.",
    "Spectra runs the service.",
    "Salon AI understands everything.",
  ],
  pauseLine: "We are not building salon software.",
  finalStatement:
    "We are building the intelligence infrastructure for the global beauty industry.",
  infrastructureLines: [
    "AWS for beauty operations.",
    "Bloomberg for professional products.",
    "Salesforce for salon relationships.",
  ],
  signoff: "Salon AI",
} as const;
