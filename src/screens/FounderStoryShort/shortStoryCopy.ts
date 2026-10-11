/**
 * Locked English copy for the 12-slide short deck.
 * Do not rewrite, summarize, or paraphrase.
 */
import type { Localized } from "../FounderStoryPresentation/founderStoryCopy";

export const L = (en: string): Localized => ({ en, he: en });

export const SHORT_COVER = {
  kicker: "Salon AI by Spectra",
  titleA: "We made color visible.",
  titleB: "Now we’re building Salon AI.",
  founderAlt: "Maor Ganon and Elad Gotlieb holding a Spectra tablet in the salon",
  proof: [
    { value: "170+", label: L("Salons") },
    { value: "12", label: L("Countries") },
    { value: "500+", label: L("Professionals") },
    { value: "$130K", label: L("ARR") },
  ],
} as const;

export const SHORT_ORIGIN = {
  kicker: "The origin",
  titleA: "The bigger my salon became,",
  titleB: "the more expensive the blind spot became.",
  body: [
    "I learned professional color in Paris, managed color rooms, and later built and operated my own salon business.",
    "As the business grew, more professionals mixed more formulas, more services happened at the same time, and more expensive material moved through the salon every day.",
    "Professionals often mixed a little extra because running out during a service was worse than mixing too much.",
    "And much of what was left over went down the sink.",
    "One extra bowl did not look important.",
    "Across hundreds of services, employees and months, it became real money.",
    "I could see what we purchased.",
    "I could see what we charged.",
    "But I could not clearly see what each service actually consumed or truly cost.",
  ],
  pull: "Growth made the blind spot more expensive.",
  photoAlt: "Color being measured into a bowl on a connected scale",
} as const;

export const SHORT_SOLUTION = {
  kicker: "The first solution",
  titleA: "So we measured the work,",
  titleB: "not just the transaction.",
  body: [
    "Spectra follows the color service while it happens.",
    "The client is identified.",
    "The product is scanned.",
    "The formula is created.",
    "Every gram is measured.",
    "The real cost and inventory movement are recorded.",
    "For the salon, the result is simple:",
    "Less unnecessary material goes down the sink.",
    "Inventory becomes more accurate.",
    "Purchasing becomes smarter.",
    "And the owner can finally understand the real economics of the service.",
  ],
  pull: "Less waste.\nBetter margin.\nBetter control.",
  figureCaption: "Client · Scan · Mix · Measure · Record",
} as const;

export const SHORT_CYCLE = {
  kicker: "From color to the salon",
  title: "The bowl taught us how the service really works.",
  body: [
    "A booking system sees an appointment from start to finish.",
    "But a salon service does not work like one solid block of time.",
    "There is diagnosis.",
    "Mixing.",
    "Application.",
    "Processing time.",
    "Rinsing.",
    "Finishing.",
    "Sometimes the professional is working.",
    "Sometimes the client is waiting and the professional can serve someone else.",
    "Spectra entered the workflow deeply enough to understand those moments.",
  ],
  pull: "The service cycle is the missing layer between booking and execution.",
  close:
    "That is why the same knowledge that helped us understand a bowl of color can also help us build a much smarter calendar.",
  stages: [
    { name: "Diagnosis", busy: true },
    { name: "Mix", busy: true },
    { name: "Apply", busy: true },
    { name: "Process", busy: false },
    { name: "Rinse", busy: true },
    { name: "Finish", busy: true },
  ],
  busy: "Professional working",
  free: "Client processing / professional available",
} as const;

export const SHORT_PROOF = {
  kicker: "Proof",
  titleA: "We proved salons would use it,",
  titleB: "pay for it and buy it remotely.",
  body: [
    "Spectra did not stay in a prototype environment.",
    "It became part of the real workflow.",
    "More than one hundred and seventy salons and more than five hundred professionals have used the system across twelve countries.",
    "And we learned how to reach those salons remotely.",
    "In twenty twenty-five, approximately forty thousand dollars in marketing generated more than one thousand four hundred leads, more than three hundred trials and ninety-six paying salons.",
    "Across the company, cumulative revenue has reached approximately four hundred and seventy-nine thousand dollars.",
    "And we did this before today’s AI stack existed.",
    "Lead qualification, follow-up, onboarding, localization, support and customer success were still highly manual.",
    "Our historical acquisition cost was roughly three hundred dollars per paying salon.",
    "Today, our operating target is to bring that cost below half while supporting growth with a materially leaner team.",
    "That target still has to be proven.",
  ],
  pullA: "AI does not create our go-to-market from zero.",
  pullB: "It can make a proven motion dramatically more efficient.",
  proof: [
    { value: "170+", label: L("Salons") },
    { value: "12", label: L("Countries") },
    { value: "500+", label: L("Professionals") },
    { value: "~$479K", label: L("Revenue to date") },
  ],
  funnel: [
    { value: "$40K", label: "Marketing" },
    { value: "1,476", label: "Leads" },
    { value: "301", label: "Trials" },
    { value: "96", label: "Paying salons" },
  ],
  historicLabel: "Historic",
  historicValue: "~$300",
  targetLabel: "Target",
  targetValue: "< $150",
  targetNote: "TARGET — NOT YET PROVEN",
} as const;

export const SHORT_MOAT = {
  kicker: "What the work created",
  title: "Every service quietly became history.",
  body: [
    "Every time Spectra was used, it captured more than a measurement.",
    "It captured the client, professional, service, formula, products, grams, time and cost.",
    "One service became one structured operational record.",
    "Hundreds of thousands of services became operational history.",
    "Today, that history includes more than six hundred and seventeen thousand measured color services, more than thirty-four million grams of material and more than five hundred and sixteen thousand client visits.",
    "It spans more than two hundred and twenty professional brands and more than forty months of real activity.",
    "A manufacturer or distributor knows what was shipped.",
    "A point-of-sale system knows what was sold.",
    "A booking platform knows what was scheduled.",
    "Spectra knows what was actually done.",
  ],
  pullA: "Software can be rebuilt.",
  pullB: "History has to be earned.",
  fields: "Client · Professional · Service · Formula · Product · Grams · Time · Cost",
  record: "One service record",
  heroValue: "617K+",
  heroLabel: "Measured color services",
  support: [
    { value: "34M+", label: "Grams measured" },
    { value: "516K+", label: "Client visits" },
    { value: "228", label: "Brands observed" },
    { value: "44", label: "Months of history" },
  ],
  vantage: [
    { source: "Manufacturer / distributor", sees: "What shipped" },
    { source: "POS", sees: "What sold" },
    { source: "Booking", sees: "What was scheduled" },
    { source: "Spectra", sees: "What was actually done" },
  ],
} as const;

export const SHORT_INDUSTRY = {
  kicker: "The second customer",
  titleA: "L’Oréal Israel came to us",
  titleB: "because the data was different.",
  body: [
    "Professional beauty companies know what they manufacture.",
    "They know what they ship.",
    "They know what salons order.",
    "But once the product enters the salon, much of the visibility disappears.",
    "What was actually used?",
    "For which service?",
    "In what quantity?",
    "Which products are gaining adoption?",
    "Where is demand beginning to change?",
    "Sell-in is not consumption.",
    "L’Oréal Israel approached Spectra because they understood that our data was unique.",
    "Spectra could show real professional usage rather than only shipments or sales.",
    "That opened a completely new use case for the company.",
    "The same data layer can eventually serve a global beauty group, a national brand or a local professional distributor through an annual intelligence subscription.",
    "For example, a local distributor in a market such as Russia could eventually subscribe to understand consumption, adoption and demand inside its market.",
    "The local distributor example is a future business-model example, not an existing customer.",
  ],
  pullA: "The same data that helps a salon operate better",
  pullB: "can help the industry understand the market better.",
  figureCaption: "Consumption · Usage by service · Adoption signals",
  modelCaption: "Annual intelligence subscriptions can scale from global beauty groups to national brands and local professional distributors.",
  crops: [
    { src: "/investor/media/loreal-proof/consumption.png?v=en", caption: "Consumption" },
    { src: "/investor/media/loreal-proof/usage-by-service.png?v=en", caption: "Usage by service" },
    { src: "/investor/media/loreal-proof/adoption-signals.png?v=en", caption: "Adoption signals" },
  ],
} as const;

export const SHORT_MARKET = {
  kicker: "The market",
  titleA: "Two enormous economies",
  titleB: "meet inside one salon.",
  body: [
    "On one side is a global salon-services market worth approximately two hundred and sixty-five billion dollars today and expected to grow beyond five hundred and twenty billion dollars over the coming decade.",
    "On the other side is approximately one hundred and twenty-nine billion dollars of salon-grade beauty and personal-care products, also growing strongly.",
    "These markets should not simply be added together as one TAM.",
    "The point is that every salon sits directly between the services it sells and the professional products it consumes.",
    "Spectra sits inside that exchange.",
  ],
  pullA: "Spectra sits where service revenue",
  pullB: "meets professional product consumption.",
  services: "Salon services",
  servicesNow: "≈$265B",
  servicesFuture: "≈$523B by 2034",
  products: "Professional beauty products",
  productsNow: "≈$129B",
  productsFuture: "≈$222B by 2033",
  category: "Salon software alone has already created billion-dollar companies.",
  players: [
    { name: "Zenoti", note: "approximately $1.5B valuation" },
    { name: "Fresha", note: "more than $1B valuation" },
    { name: "Mangomint", note: "$35M Series B" },
  ],
  sources:
    "Sources: Fortune Business Insights, Salon Services (2025–2034); Grand View Research, Salon Beauty & Personal Care Products (2025–2033). Hair segments are not additive TAM. Zenoti last known valuation from the 2021 TPG Series D extension. Fresha $1B+ from the May 2026 KKR investment. Mangomint $35M Series B announced in 2024.",
} as const;

export const SHORT_PLATFORM = {
  kicker: "The next product",
  titleA: "We already have the network",
  titleB: "we need to build Salon AI.",
  body: [
    "We do not plan to ask salons to trust an autonomous AI on day one.",
    "The next step is to give our existing salon network Salon OS first, without the autonomous AI layer.",
    "We will learn how they actually run the business day to day:",
    "how they schedule, how the team communicates, how they manage clients, how inventory moves, how payments happen, and how decisions are made.",
    "Salon OS connects everyone around the salon.",
    "For the owner and professional, the mobile app becomes the daily command center for the calendar, clients, team, tasks, inventory, economics, service history and recommendations.",
    "For the team, schedules, communication, client context and daily work live in one connected environment — a communication layer for the salon, much like Slack became for the office.",
    "For the client, her app holds appointments, service history, formulas, preferences, purchases, payments and rebooking, keeping the relationship with the salon alive between visits.",
    "Every interaction adds operating context.",
    "Every service adds execution history.",
    "Then we combine the two.",
  ],
  pullA: "We do not need to imagine how salons operate.",
  pullB: "We can learn from them.",
  closeA: "Real salon operations + real execution history",
  closeB: "the foundation for Salon AI.",
  formulaOs: "Salon OS behavior",
  formulaHistory: "Spectra service history",
  formulaAi: "Salon AI",
} as const;

export const SHORT_MODEL = {
  kicker: "The business model",
  titleA: "The operating system",
  titleB: "can become the commerce layer.",
  body: [
    "Once Spectra knows the client, the service, the inventory and what was actually consumed, commerce becomes a natural extension of the workflow.",
    "Today, salon owners and professionals spend hours checking shelves, building order lists, contacting suppliers and replenishing products manually.",
    "Spectra already knows what was consumed.",
    "At sufficient density inside a defined market, it can know what is running low and turn that shortage into an order with one click.",
    "Brands, distributors, equipment companies, professional-product suppliers and educators can then sell to salon professionals through the same platform they already use to operate their business.",
    "Commerce also flows in the other direction.",
    "The professional can recommend and sell products to the client based on her real service history.",
    "Through the client app, she can purchase, reorder, pay and rebook through her salon.",
    "The salon remains at the center of the client relationship.",
    "That creates three revenue layers.",
    "Software: salons pay to operate.",
    "Intelligence: brands and distributors pay annual subscriptions to understand consumption, demand and adoption.",
    "Commerce: Spectra participates in transactions flowing through the platform.",
  ],
  pullA: "Spectra connects how the salon operates,",
  pullB: "what the industry sells to it, and what the salon sells to its clients.",
  flow: ["Industry", "Salon", "Client"],
  engines: ["Software", "Intelligence", "Commerce"],
} as const;

export const SHORT_TEAM = {
  kicker: "Why us · Why this round",
  titleA: "We know the workflow.",
  titleB: "We have the history.",
  titleC: "Now we need to prove the platform.",
  body: [
    "Maor Ganon built his career inside professional salons, including working in Paris and managing color rooms.",
    "He later built and operated his own salon business, where the operational pain that became Spectra grew with the company.",
    "Elad Gotlieb brings international operating and commercial experience. Before Spectra, he led Asia operations and market expansion at Secret.",
    "Achela leads Spectra’s engineering, platform and AI development.",
    "Around the company are investors and advisors with experience across capital, growth, professional beauty and data, including people connected to Estée Lauder and L’Oréal.",
    "For the September round, Spectra is raising one million dollars at a five million dollar pre-money valuation.",
    "The capital has three jobs:",
    "Finish the platform.",
    "Deploy it across the existing customer base.",
    "Restart growth with a leaner AI-native go-to-market.",
  ],
  pullA: "The goal of this round is simple:",
  pullB: "prove that the wedge can become the platform.",
  close:
    "If we prove that transition, Spectra can become strategically relevant to professional beauty groups, salon software companies, distributors and data businesses.",
  jobs: ["Finish", "Deploy", "Restart growth"],
  advisors:
    "Yoav Horovitz, Investor & Board · Brian Cooper, Early Investor / Board Observer · Roy Gefen, GTM Advisor · Aquilo, Strategy & Growth · Oren Revach, Chairman, Estée Lauder Companies Israel · Paul Hagag, Data Advisor, L’Oréal",
  advisorsNote: "Oren, Paul and Aquilo contribute expertise and are not investors in the company.",
} as const;

export const SHORT_CLOSE = {
  kicker: "Where we started",
  title: "One gram of color.",
  body: [
    "That is where the story started.",
    "One gram became part of a formula.",
    "The formula became a service.",
    "The services became hundreds of thousands of real operational records.",
    "Those records became history.",
    "The history became a data layer.",
    "And now that data layer can help operate the salon, inform the professional beauty industry and eventually power commerce.",
  ],
  finalA: "We started by making color visible.",
  finalB: "Now we’re building the rest.",
  layerA: "The operating, intelligence and commerce layer",
  layerB: "for professional beauty.",
  signoff: "With appreciation,",
  names: "Maor Ganon & Elad Gotlieb",
  role: "Co-Founders, Spectra",
} as const;
