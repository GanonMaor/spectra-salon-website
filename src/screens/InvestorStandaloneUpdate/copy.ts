export const META = {
  route: "/investors/investor-update",
  title: "Spectra | Private Investor Update",
  description: "A private update from Spectra for existing investors.",
  date: "August 2026",
} as const;

export const HERO = {
  eyebrow: "A private note from Maor Ganon",
  title: "The First Step Worked. Now We Are Building What Comes Next.",
  body:
    "Spectra began with one real problem on the salon floor. That first layer became a working SaaS network across real salons, professionals and operational data. The next chapter is Salon OS and Salon AI.",
  customerProof: "The professionals already working with Spectra",
  regions: "United States · Russia · Japan · Netherlands · Portugal · Israel · Chile",
  read: "Read the update",
} as const;

export const STORY = {
  origin: {
    eyebrow: "Where we began",
    title: "A real problem became a much larger opportunity.",
    paragraphs: [
      "I started Spectra from a problem I knew personally as a salon owner: color, inventory, clients and teams were being managed without a reliable operational picture.",
      "Over time, we understood that the problem went far beyond color and inventory. Salon owners were moving between disconnected tools for booking, clients, staff, stock, payments and performance, with no single system that understood the business as a whole.",
      "After deeply exploring how to enter the US market, we chose to pause the sales push and rebuild. The decision was difficult, but continuing in the same way no longer made sense.",
    ],
  },
  rebuild: {
    eyebrow: "What changed",
    title: "The rebuild went all the way to the foundation.",
    paragraphs: [
      "With very limited resources, the team simplified and rebuilt a major part of the platform. We stayed close to customers, kept the existing operation alive and prepared the product for a much larger AI-native future.",
      "We promised a great deal, delivered part of it, learned more than we expected and made difficult choices. Today, we are more focused, more mature and clearer about what must be built.",
    ],
  },
  direction: {
    eyebrow: "The new direction",
    title: "From Color Intelligence to Salon OS and Salon AI.",
    paragraphs: [
      "Salon OS connects the daily salon workflow: appointments, clients, employees, services, inventory, payments, expenses and business performance.",
      "Salon AI sits above that connected operating layer. It reads the business context, explains what matters and helps the owner decide what to do next.",
    ],
  },
  difference: {
    eyebrow: "Why we are different",
    title: "AI becomes useful when it understands the business behind the prompt.",
    paragraphs: [
      "Our advantage comes from the context beneath the AI interface: real salon workflows, measured product usage, client behavior, team capacity, inventory movement and financial performance in one connected system.",
      "That context allows Salon AI to move from answering questions to identifying problems, preparing decisions and eventually taking approved actions for the salon owner.",
    ],
  },
  vision: {
    eyebrow: "The vision",
    title: "A salon that becomes easier to understand and easier to run.",
    paragraphs: [
      "The owner should be able to ask where money is being lost, which clients are not returning, what inventory is at risk, where capacity is underused and what should happen next.",
      "Over time, specialized agents can monitor the business continuously, surface what needs attention and help execute the work across scheduling, retention, inventory, performance and growth.",
    ],
  },
  revenue: {
    eyebrow: "How the platform expands revenue",
    title: "Each connected layer increases the value of the system.",
    paragraphs: [
      "Color Intelligence created the initial recurring relationship. Salon OS broadens the product across daily operations. Salon AI adds intelligence, automation and new paid capabilities on top.",
      "The model is additive: more value per salon, more opportunities to expand within the installed base and new revenue streams that become possible only when the operating data is connected.",
    ],
  },
  saas: {
    eyebrow: "The SaaS foundation",
    title: "The recurring base is real. The operating system can make it stronger.",
    paragraphs: [
      "Spectra already has recurring revenue, long-standing customers and a tested remote acquisition funnel. This is a useful foundation, and the metrics still have room to improve.",
      "Better onboarding, customer-success tooling, activation automation and broader product depth can improve revenue per salon, retention, expansion and acquisition efficiency. We see these as practical areas where disciplined execution can strengthen the business.",
    ],
  },
  raise: {
    eyebrow: "Why we are raising now",
    title: "The next financing will move the company forward.",
    paragraphs: [
      "It is intended to take what has already been rebuilt and turn it into a completed product, a disciplined rollout, stronger adoption and renewed growth.",
      "Capital would be focused on completing Salon OS, accelerating Salon AI, onboarding the existing salon base, strengthening customer success, supporting go-to-market execution and giving the core team the tools required to deliver.",
    ],
  },
  round: {
    eyebrow: "What this round represents",
    title: "A chance to participate after the rebuild, before broader rollout.",
    paragraphs: [
      "The technical and product rebuilding has already begun. The next stage is about completing, deploying, learning and expanding from a real customer base.",
      "Any participation would be subject to the formal investment documents, required approvals and appropriate legal review. Future outcomes will depend on execution, adoption and market conditions.",
    ],
  },
  people: {
    eyebrow: "The people behind the work",
    title: "A small team kept moving when the path was difficult.",
    paragraphs: [
      "Elad continues to lead the financial, organizational and operational work of the company. Achela led the product rebuild, Lital leads front-end, user experience and testing, Yaar continues to lead customer service and product data, and Roy Gefen continues to support marketing thinking and market relevance.",
      "I am grateful to the team, to Yoav and Amos Horovitz, to our investors and to the experienced people who continued to support, challenge and guide us throughout the journey.",
    ],
  },
} as const;

export const PROOF_METRICS = [
  { value: "170+", label: "Existing salons", note: "The first rollout base for the new platform" },
  { value: "$130K", label: "Current ARR", note: "Recurring revenue from the current customer base" },
  { value: "12", label: "Countries", note: "Usage across multiple markets" },
  { value: "500+", label: "Color technicians", note: "Real professionals and daily workflows" },
  { value: "556K+", label: "Services analyzed", note: "Formulas, timing and operational outcomes" },
  { value: "40", label: "Months of history", note: "Longitudinal salon operating data" },
] as const;

export const DATA_FOUNDATION = [
  { step: "01", title: "Salon workflow", body: "Work happens across color, booking, clients, staff and inventory." },
  { step: "02", title: "Operational data", body: "The system captures what happened, when and at what business cost." },
  { step: "03", title: "Connected context", body: "Salon OS links the signals into one operating picture." },
  { step: "04", title: "Useful intelligence", body: "Salon AI can understand the business behind each question." },
] as const;

export const CAPACITY_SIGNALS = [
  { title: "Every Service", body: "Duration, material cost, margin and the real work required." },
  { title: "Every Client", body: "History, frequency, preferences, value and return behavior." },
  { title: "Every Employee", body: "Skills, availability, utilization and revenue contribution." },
] as const;

export const AI_SIGNALS = ["Bookings", "Clients", "Team", "Inventory", "Payments", "Color usage"] as const;

export const AGENTS = [
  { name: "Booking", action: "Protect capacity and fill the right openings." },
  { name: "Retention", action: "Identify clients who are at risk of not returning." },
  { name: "Inventory", action: "Surface shortages, waste and purchasing needs." },
  { name: "Performance", action: "Explain margins, utilization and business changes." },
  { name: "Growth", action: "Prepare practical opportunities for the next week." },
] as const;

export const REVENUE_LAYERS = [
  { phase: "Today", product: "Color Intelligence", value: "$960", note: "Current annual revenue per salon" },
  { phase: "Layer 2", product: "Booking + CRM + POS", value: "$2,060", note: "Modeled annual potential" },
  { phase: "Layer 3", product: "Salon Operating System", value: "$3,060", note: "Modeled annual potential" },
  { phase: "Layer 4", product: "Salon AI Agent Suite", value: "$4,860", note: "Modeled annual potential" },
] as const;

export const SAAS_METRICS = [
  { value: "$130K", label: "Current ARR" },
  { value: "170+", label: "Existing salons" },
  { value: "96", label: "Customers in the 2025 acquisition test" },
  { value: "4.6×", label: "Modeled three-year LTV:CAC" },
] as const;

export const SAAS_LEVERS = [
  { title: "Activation", body: "Faster setup and clearer time to first value." },
  { title: "Retention", body: "A broader daily workflow makes the product harder to replace." },
  { title: "Expansion", body: "More operating layers create more value per salon." },
  { title: "Efficiency", body: "Automation and better tools support a more disciplined growth engine." },
] as const;

export const FUNDING_PRIORITIES = [
  { number: "01", title: "Complete Salon OS", body: "Finish the connected operating workflows required for rollout." },
  { number: "02", title: "Accelerate Salon AI", body: "Build the intelligence and agent capabilities on top of the operating layer." },
  { number: "03", title: "Roll out to existing salons", body: "Deploy gradually, learn from real usage and improve quickly." },
  { number: "04", title: "Customer success and onboarding", body: "Create the tools and process required for adoption and retention." },
  { number: "05", title: "Growth and go-to-market", body: "Restart acquisition with a broader product and a measured process." },
  { number: "06", title: "Core team and execution", body: "Give the committed team the resources needed to deliver consistently." },
] as const;

export const CLOSING = {
  title: "Meet Us at Spectra",
  body: "We would be glad to host you at our office, show you the product, and discuss the next chapter together.",
  primary: "Schedule a Meeting",
  primaryHref:
    "mailto:maor@spectra-ci.com?subject=Spectra%20Investor%20Update%20Meeting",
  secondary: "Contact Maor on WhatsApp",
  secondaryHref:
    "https://wa.me/972504322680?text=Hi%20Maor%2C%20I%27d%20like%20to%20schedule%20a%20meeting%20about%20the%20Spectra%20investor%20update.",
  signature: "Maor Ganon and Elad Gotlieb · Co-Founders, Spectra",
} as const;
