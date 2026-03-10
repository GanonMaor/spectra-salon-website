export const SECTIONS = [
  { id: "hero", label: "Overview" },
  { id: "problem", label: "Problem" },
  { id: "breakthrough", label: "System" },
  { id: "color-bar-loop", label: "Loop" },
  { id: "dataset", label: "Dataset" },
  { id: "flywheel", label: "Flywheel" },
  { id: "hairgpt", label: "HairGPT" },
  { id: "intelligence", label: "Intelligence" },
  { id: "market", label: "Market" },
  { id: "moat", label: "Moat" },
  { id: "traction", label: "Traction" },
  { id: "roadmap", label: "Roadmap" },
  { id: "vision", label: "Vision" },
] as const;

export const HERO = {
  headline: "Spectra measures real hair color consumption inside salons.",
  sub: "Every color mix becomes structured data.\nWe are building the operational intelligence layer of the hair industry.",
  stats: [
    { label: "Salons connected", value: "180+" },
    { label: "Color mixes recorded", value: "428K+" },
    { label: "Grams measured", value: "25M+" },
  ],
  loopSteps: [
    "Stylist mixes color",
    "Scale measures grams",
    "Spectra records formula",
    "Inventory updates",
    "Data stored",
  ],
};

export const PROBLEM = {
  lead: "Hair salons spend billions on color products every year.",
  emphasis: "But today, no system measures real product consumption.",
  bullets: [
    "Salons guess inventory",
    "Brands lack real demand data",
    "Waste and over-ordering are common",
  ],
  stat: { value: "$40B", label: "Global hair color market" },
};

export const BREAKTHROUGH = {
  headline: "The Spectra System",
  sub: "Spectra captures every color mix in real time. Each mix becomes structured data.",
  stack: [
    { icon: "tablet", label: "iPad at color bar" },
    { icon: "bluetooth", label: "Bluetooth scale" },
    { icon: "beaker", label: "Formula tracking" },
  ],
};

export const COLOR_BAR_LOOP = {
  headline: "The Color Bar Loop",
  sub: "Every service expands the dataset.",
  steps: [
    "Client service",
    "Color mix",
    "Scale measures grams",
    "Spectra records formula",
    "Inventory updates",
    "Dataset grows",
  ],
};

export const DATASET = {
  headline: "The Dataset",
  sub: "Ground-truth data from the salon floor.",
  signals: [
    "Product usage",
    "Grams consumed",
    "Formula ratios",
    "Stylist behavior",
    "Brand demand",
    "Color trends",
  ],
};

export const FLYWHEEL = {
  headline: "The Flywheel",
  sub: "Spectra improves as the network grows.",
  steps: [
    "More salons",
    "More color mixes recorded",
    "Larger dataset",
    "Better intelligence",
    "More value for salons",
  ],
};

export const HAIRGPT = {
  headline: "HairGPT",
  tag: "AI Layer",
  sub: "HairGPT analyzes the global color dataset to generate insights for salons.",
  useCases: [
    "Formula recommendations",
    "Inventory forecasting",
    "Product demand signals",
    "Trend detection",
  ],
};

export const INTELLIGENCE = {
  headline: "Industry Intelligence",
  sub: "Spectra becomes the intelligence layer for the entire hair industry.",
  nodes: [
    { label: "Salons", desc: "Operational efficiency" },
    { label: "Brands", desc: "Real demand signals" },
    { label: "Distributors", desc: "Supply chain optimization" },
    { label: "Education", desc: "Training data & trends" },
  ],
};

export const MARKET = {
  headline: "Market Opportunity",
  stats: [
    { value: "1.2M", label: "Salons globally" },
    { value: "$500B", label: "Hair industry" },
    { value: "$40B", label: "Color products" },
  ],
  expansion: "Spectra starts with color, then expands to the full salon stack.",
};

export const MOAT = {
  headline: "Competitive Moat",
  pillars: [
    { label: "Workflow integration", desc: "Embedded in salon daily operations" },
    { label: "Hardware measurement", desc: "Bluetooth scale captures ground-truth data" },
    { label: "Proprietary dataset", desc: "Network-effect data asset grows with every mix" },
  ],
};

export const TRACTION = {
  headline: "Traction",
  metrics: [
    { value: "180+", label: "Active salons" },
    { value: "$149K", label: "2025 revenue" },
    { value: "+60%", label: "YoY growth" },
    { value: "81%", label: "M1 retention" },
    { value: "371", label: "Total accounts" },
    { value: "185", label: "Brands tracked" },
  ],
};

export const ROADMAP = {
  headline: "Roadmap",
  phases: [
    { phase: "Phase 1", title: "Salon OS", desc: "Color bar workflow & real-time measurement" },
    { phase: "Phase 2", title: "Consumption Intelligence", desc: "Usage analytics, formula insights, inventory prediction" },
    { phase: "Phase 3", title: "Industry Intelligence Network", desc: "Brand dashboards, distributor signals, trend feeds" },
    { phase: "Phase 4", title: "Global Beauty Data Platform", desc: "The operating system for professional beauty" },
  ],
};

export const VISION = {
  primary: "Spectra is building the operational intelligence layer of the hair industry.",
  alt: "The Bloomberg Terminal of hair.",
};
