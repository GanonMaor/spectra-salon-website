import type { AIProfile, Competitor, CompetitorDataset, FeatureScores, PricingProfile } from "../types";
import { getCompetitorData as getLegacyData } from "./competitorsData";

type CompetitorUpdate = Partial<Omit<Competitor, "ai" | "features" | "pricing">> & {
  ai: Partial<AIProfile>;
  features?: Partial<FeatureScores>;
  pricing?: Partial<PricingProfile>;
};

const updates: Record<string, CompetitorUpdate> = {
  glossgenius: {
    features: { ai: "Strong" },
    ai: {
      presence: "AI-first",
      breadth: 4,
      narrativeCriticality: 4,
      evidence: "Vendor-claimed",
      product: "GlossGenius Reception",
      rationale:
        "Genius AI is now the corporate positioning while GlossGenius remains the product. Reception performs customer-facing front-desk work.",
      actions: ["Answers calls and messages", "Books directly in the live calendar"],
      channels: ["Phone", "Messaging"],
      limitations: ["Vendor documentation; execution quality has not been independently tested"],
      availability: "Published product",
      price: "$50/mo add-on",
      verifiedAt: "2026-10-12",
      sources: [
        {
          label: "Genius AI — corporate name, Series D and positioning",
          url: "https://genius.ai/blog/your-genius-is-the-craft",
          publishedAt: "2026-07-21",
        },
        { label: "GlossGenius pricing", url: "https://glossgenius.com/pricing" },
      ],
    },
    pricing: {
      entryPrice: "$24/mo",
      entryPriceNote: "Base software; Reception is an additional $50/mo",
    },
    funding: "$125M+ total (Series D announced Jul 2026)",
    valuation: "$1.15B (Jul 2026, company announcement)",
    differentiationNote:
      "High-priority watch: agent-led positioning plus an accessible receptionist add-on. Spectra must prove deeper operational data and ROI.",
  },
  phorest: {
    features: { ai: "Strong" },
    ai: {
      presence: "Embedded",
      breadth: 4,
      narrativeCriticality: 4,
      evidence: "Vendor-claimed",
      product: "Front Desk AI in Phorest Chat",
      rationale:
        "Front Desk AI completes booking, rescheduling and cancellation in Phorest using live availability and client history.",
      actions: ["Books from live availability", "Reschedules and cancels", "Collects deposits", "Uses treatment history"],
      channels: ["SMS", "WhatsApp"],
      limitations: [
        "Designed for contacts already in the client list",
        "For SMS, the business must have previously messaged the client",
      ],
      availability: "Documented product capability",
      price: "Not publicly listed",
      verifiedAt: "2026-10-12",
      sources: [
        {
          label: "Phorest — How Front Desk AI works",
          url: "https://support.phorest.com/hc/en-us/articles/33199970495634-How-does-Front-Desk-AI-work-with-Phorest-Chat-Two-Way-SMS-Whatsapp",
          publishedAt: "2026-08-04",
        },
      ],
    },
    differentiationNote:
      "Test client-context depth and true end-to-end completion against Spectra; the previous Limited classification is no longer supportable.",
  },
  vagaro: {
    features: { ai: "Moderate" },
    ai: {
      presence: "Embedded",
      breadth: 3,
      narrativeCriticality: 3,
      evidence: "Vendor-claimed",
      product: "Vera Reports + Vera Receptionist",
      rationale:
        "Vera answers natural-language reporting questions and reception enquiries, but sends a link rather than completing booking changes itself.",
      actions: ["Answers questions about reports", "Answers customer enquiries", "Checks availability", "Sends booking links"],
      channels: ["Chat"],
      limitations: ["Booking, rescheduling and cancellation are completed by the client through a link"],
      availability: "Product updates published Aug 2026",
      price: "Not stated in the cited updates",
      verifiedAt: "2026-10-12",
      sources: [
        {
          label: "Vagaro — Vera Reports",
          url: "https://www.vagaro.com/pro/updates/vera-reports",
          publishedAt: "2026-08-10",
        },
        {
          label: "Vagaro — Vera Receptionist",
          url: "https://www.vagaro.com/pro/updates/vera-receptionist",
          publishedAt: "2026-08-24",
        },
      ],
    },
    differentiationNote:
      "Separate reporting answers and booking-link handoff from true transactional completion when comparing Vera with Spectra.",
  },
  fresha: {
    features: { ai: "Strong" },
    ai: {
      presence: "Embedded",
      breadth: 4,
      narrativeCriticality: 4,
      evidence: "Vendor-claimed",
      product: "Fresha AI Concierge",
      rationale:
        "AI Concierge answers calls and messages and completes booking, rescheduling and cancellation inside Fresha.",
      actions: ["Answers calls and messages", "Books appointments", "Reschedules", "Cancels"],
      channels: ["Phone", "Messaging"],
      limitations: ["Vendor-announced capability; execution quality has not been independently tested"],
      availability: "Launched May 2026",
      price: "Not stated in the cited launch",
      verifiedAt: "2026-10-12",
      sources: [
        {
          label: "Fresha — AI Concierge launch",
          url: "https://www.fresha.com/blog/fresha-ai-concierge-launch",
          publishedAt: "2026-05-18",
        },
        {
          label: "Fresha — $80M KKR growth investment",
          url: "https://www.fresha.com/blog/fresha-secures-80-million-investment-from-kkr-at-1-billion-valuation",
          publishedAt: "2026-05-21",
        },
      ],
    },
    pricing: {
      entryPrice: "$19.95/mo",
      entryPriceNote: "Individual plan; team pricing is per bookable member",
    },
    funding: "$285M total reported (incl. $80M KKR growth investment in May 2026)",
    valuation: "$1B+ (May 2026, company announcement)",
    differentiationNote:
      "Marketplace reach, embedded communications and fresh growth capital strengthen expansion into the installed base; Spectra needs defensible workflow depth.",
  },
  boulevard: {
    ai: {
      presence: "Embedded",
      breadth: 2,
      narrativeCriticality: 2,
      evidence: "Vendor-claimed",
      product: "Boulevard AI Receptionist (beta)",
      rationale:
        "AI Receptionist answers calls and sends booking links. It does not discuss live availability or continue a two-way text conversation.",
      actions: ["Answers calls", "Answers common questions", "Sends booking links"],
      channels: ["Phone", "Outbound SMS link"],
      limitations: ["Does not check live availability in the call", "No two-way text conversation", "Beta"],
      availability: "Beta, available to all Boulevard customers",
      price: "$125/location for 200 minutes from Dec 2026; overages and messaging extra",
      verifiedAt: "2026-10-12",
      sources: [
        {
          label: "Boulevard — AI Receptionist FAQ",
          url: "https://support.boulevard.io/en/articles/16105159-ai-receptionist-frequently-asked-questions",
        },
      ],
    },
    pricing: {
      entryPrice: "$195/mo",
      entryPriceNote: "Essentials base plan; AI Receptionist is priced separately",
    },
    differentiationNote:
      "A real beta with clear limits: Boulevard hands off booking by link and does not discuss live availability. Compare on complete task execution.",
  },
  "square-appointments": {
    features: { ai: "Strong" },
    ai: {
      presence: "Embedded",
      breadth: 4,
      narrativeCriticality: 3,
      evidence: "Vendor-claimed",
      product: "Square Managerbot (open beta)",
      rationale:
        "Managerbot proactively monitors the business and proposes actions across sales, inventory, staffing and campaigns.",
      actions: ["Monitors sales and operations", "Alerts on inventory", "Suggests staffing changes", "Proposes campaigns"],
      channels: ["In-product assistant"],
      limitations: ["Every action requires owner approval", "Part of the broader Square ecosystem", "Initial eligibility excludes franchises"],
      availability: "Open beta for most US health and beauty sellers",
      price: "No additional charge during open beta",
      verifiedAt: "2026-10-12",
      sources: [
        {
          label: "Square — Managerbot open beta",
          url: "https://squareup.com/us/en/press/managerbot-open-beta",
          publishedAt: "2026-04-28",
        },
        { label: "Square Appointments pricing", url: "https://squareup.com/us/en/appointments/pricing" },
      ],
    },
    pricing: {
      plans: [
        { name: "Free", price: "$0/mo" },
        { name: "Plus", price: "$49/mo per location" },
        { name: "Premium", price: "$149/mo per location" },
      ],
    },
    differentiationNote:
      "Managerbot competes with the proactive management-assistant vision, but currently requires approval and sits in a broad horizontal ecosystem.",
  },
  booker: {
    features: { ai: "Unknown" },
    ai: {
      presence: "Limited",
      breadth: 1,
      narrativeCriticality: 1,
      evidence: "Unclear",
      product: "Customized Websites (not an AI capability)",
      rationale:
        "The verified 2026 update expands the commercial bundle; it does not establish Mindbody's AI Concierge as available in Booker.",
      actions: ["Connects a managed website to prices, calendar and booking", "Tracks coupon redemptions"],
      channels: ["Website", "Payments"],
      limitations: ["Do not infer that Mindbody AI Concierge is available in Booker"],
      availability: "Customized Websites announced for Booker customers",
      price: "Customized Websites: no additional charge",
      verifiedAt: "2026-10-12",
      sources: [
        {
          label: "Playlist — Customized Websites for Mindbody and Booker",
          url: "https://www.playlist.com/press/playlist-launches-customized-websites-done-you-website-service-fitness-and-wellness-operators",
          publishedAt: "2026-08-26",
        },
        {
          label: "Playlist + EGYM merger completion",
          url: "https://www.playlist.com/press/playlist-and-egym-complete-merger-power-worlds-most-comprehensive-fitness-and-wellness",
          publishedAt: "2026-03-31",
        },
      ],
    },
    pricing: {
      entryPrice: "$139/mo",
      entryPriceNote: "Starter list price; verify quote and regional availability",
    },
    funding: "Parent group merger included $785M in new equity investment (Mar 2026)",
    valuation: "$7.5B combined Playlist–EGYM enterprise value; not Booker standalone",
    differentiationNote:
      "The bundle is expanding across websites, booking and payments, but Mindbody AI capabilities should not be attributed to Booker without direct evidence.",
  },
  zenoti: {
    ai: {
      presence: "AI-first",
      breadth: 4,
      narrativeCriticality: 5,
      evidence: "Vendor-claimed",
      product: "Zenoti AI Inventory",
      rationale:
        "AI Inventory recommends what, how much and from whom to order, using consumption history and booked appointments.",
      actions: ["Forecasts inventory needs", "Recommends quantities and suppliers", "Raises shortage alerts", "Creates draft purchase orders"],
      channels: ["In-product operations"],
      limitations: [
        "Requires Zenoti purchasing and goods-receipt workflows",
        "Public documentation does not establish actual gram/formula-level consumption measurement",
      ],
      availability: "Released Jun 2026",
      price: "Custom quote",
      verifiedAt: "2026-10-12",
      sources: [
        {
          label: "Zenoti release notes — AI Inventory",
          url: "https://help.zenoti.com/en/release-notes/release-notes---june-16%2C-2026.html",
          publishedAt: "2026-06-16",
        },
      ],
    },
    differentiationNote:
      "Highest-priority product validation: determine whether inventory forecasts use actual gram/formula consumption or service-level estimates.",
  },
  mindbody: {
    features: { ai: "Strong" },
    ai: {
      presence: "Embedded",
      breadth: 4,
      narrativeCriticality: 3,
      evidence: "Vendor-claimed",
      product: "Playlist AI Concierge for Mindbody",
      rationale:
        "AI Concierge handles SMS/chat enquiries, missed-call follow-up, bookings and changes directly in Mindbody.",
      actions: ["Answers customer questions", "Follows up missed calls", "Books appointments", "Changes appointments"],
      channels: ["SMS", "Chat"],
      limitations: ["Initially limited to single-location businesses in selected markets", "Included only in Ultimate"],
      availability: "Launched first for eligible Mindbody customers",
      price: "Included in Mindbody Ultimate",
      verifiedAt: "2026-10-12",
      sources: [
        {
          label: "Playlist — AI Concierge launch",
          url: "https://www.playlist.com/press/playlist-launches-ai-concierge-247-front-desk-assistant-fitness-and-wellness-operators",
          publishedAt: "2026-07-08",
        },
        {
          label: "Playlist + EGYM merger completion",
          url: "https://www.playlist.com/press/playlist-and-egym-complete-merger-power-worlds-most-comprehensive-fitness-and-wellness",
          publishedAt: "2026-03-31",
        },
      ],
    },
    pricing: {
      entryPrice: "$139/mo",
      entryPriceNote: "Starter list price; AI Concierge is included in Ultimate",
    },
    funding: "Playlist + EGYM merger included $785M in new equity investment (Mar 2026)",
    valuation: "$7.5B combined Playlist–EGYM enterprise value; not Mindbody standalone",
    differentiationNote:
      "AI Concierge is now a meaningful bundled front-desk competitor; Spectra must justify incremental spend through salon-specific measured operations.",
  },
};

export function getCompetitorData(): CompetitorDataset {
  const legacy = getLegacyData();
  return {
    lastUpdated: "2026-10-12",
    competitors: legacy.competitors.map((competitor) => {
      const update = updates[competitor.id];
      if (!update) return competitor;
      return {
        ...competitor,
        ...update,
        features: { ...competitor.features, ...update.features },
        ai: { ...competitor.ai, ...update.ai },
        pricing: { ...competitor.pricing, ...update.pricing },
      };
    }),
  };
}
