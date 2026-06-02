/**
 * Asset manifest for the hidden "Spectra Product & Vision" investor page.
 *
 * Source of truth: investor-assets/README.md (+ FOLDER_STRUCTURE.md).
 * Shipped assets are expected under /investor-vision/<section>/<filename>
 * (i.e. public/investor-vision/...). See investor-assets/TECHNICAL_PLAN.md.
 *
 * IMPORTANT:
 *   - This manifest only DECLARES the expected assets. It does NOT invent or
 *     ship any image. Until a real file exists at the given path, the asset is
 *     considered "missing" and the UI degrades gracefully (see AssetSlot).
 *   - Do not add assets here that are not specified in README.md.
 *   - The asset-check script (scripts/check-investor-assets.mjs) parses this
 *     file, so keep the `section` / `file` / `priority` fields literal strings.
 */

export const ASSET_BASE = "/investor-vision";

export type AssetKind = "image" | "vector" | "video" | "model";

/** Priority mirrors README.md production tiers. */
export type AssetPriority = "critical" | "recommended" | "optional";

export interface AssetSpec {
  /** Stable manifest key used in code. */
  readonly id: string;
  /** Human label (from README.md). */
  readonly name: string;
  /** Section folder under ASSET_BASE. */
  readonly section: AssetSection;
  /** Filename exactly as defined in README.md / FOLDER_STRUCTURE.md. */
  readonly file: string;
  readonly kind: AssetKind;
  /** Whether transparency is expected (informational). */
  readonly transparent: boolean;
  readonly priority: AssetPriority;
  /** Expected dimensions, e.g. "3840x2160" or "1600x1000 viewBox" (informational). */
  readonly dims: string;
  /** Optional retina/secondary export filename. */
  readonly file2x?: string;
  /** Optional poster still for videos. */
  readonly poster?: string;
}

export type AssetSection =
  | "hero"
  | "problem"
  | "ecosystem"
  | "customer-journey"
  | "salon-os"
  | "spectra"
  | "intelligence-core"
  | "agents"
  | "customer-evolution"
  | "network"
  | "vision"
  | "shared";

/** Resolve the public URL for an asset's primary file. */
export function assetUrl(spec: AssetSpec): string {
  return `${ASSET_BASE}/${spec.section}/${spec.file}`;
}

/** Resolve the public URL for a sibling file (poster, @2x, etc). */
export function assetSiblingUrl(spec: AssetSpec, file: string): string {
  return `${ASSET_BASE}/${spec.section}/${file}`;
}

/** File extension (lowercase, no dot), e.g. "webp". */
export function assetExt(spec: AssetSpec): string {
  const i = spec.file.lastIndexOf(".");
  return i >= 0 ? spec.file.slice(i + 1).toLowerCase() : "";
}

/** Human format label for display, e.g. "WEBP", "SVG". */
export function assetFormat(spec: AssetSpec): string {
  return assetExt(spec).toUpperCase();
}

/**
 * Build a srcSet string for high-resolution displays when a @2x export exists.
 * Returns undefined for non-raster assets or when no @2x is declared.
 */
export function assetSrcSet(spec: AssetSpec): string | undefined {
  if (spec.kind !== "image" || !spec.file2x) return undefined;
  return `${assetUrl(spec)} 1x, ${assetSiblingUrl(spec, spec.file2x)} 2x`;
}

/**
 * The declared assets. Keys are referenced by section components.
 * Filenames must match investor-assets/README.md exactly.
 */
export const ASSETS = {
  // ── Section 1 — Opening / hero ───────────────────────────────────────
  heroSalonPhoto: {
    id: "heroSalonPhoto",
    name: "Premium salon hero photo",
    section: "hero",
    file: "salon-hero.jpg",
    kind: "image",
    transparent: false,
    priority: "critical",
    dims: "1536x1024",
  },
  heroStoryPhoto: {
    id: "heroStoryPhoto",
    name: "Booking to chair — client books, salon AI responds",
    section: "hero",
    file: "salon-story.jpg",
    kind: "image",
    transparent: false,
    priority: "critical",
    dims: "1536x1024",
  },
  heroStoryColoristPhoto: {
    id: "heroStoryColoristPhoto",
    name: "Color bar — Spectra alerts the colorist and asks to notify the client",
    section: "hero",
    file: "salon-story-colorist.jpg",
    kind: "image",
    transparent: false,
    priority: "critical",
    dims: "1448x1086",
  },
  heroStoryDelayPhoto: {
    id: "heroStoryDelayPhoto",
    name: "Delay detected — salon AI notifies the client, no human touch",
    section: "hero",
    file: "salon-story-delay.jpg",
    kind: "image",
    transparent: false,
    priority: "critical",
    dims: "1536x1024",
  },
  heroNetworkBg: {
    id: "heroNetworkBg",
    name: "Network field background",
    section: "hero",
    file: "network-field-bg.webp",
    file2x: "network-field-bg@2x.webp",
    kind: "image",
    transparent: false,
    priority: "critical",
    dims: "3840x2160",
  },
  heroNetworkPoster: {
    id: "heroNetworkPoster",
    name: "Network field poster",
    section: "hero",
    file: "network-field-poster.webp",
    kind: "image",
    transparent: false,
    priority: "critical",
    dims: "1920x1080",
  },
  heroNetworkLoop: {
    id: "heroNetworkLoop",
    name: "Network field loop",
    section: "hero",
    file: "network-field-loop.webm",
    poster: "network-field-poster.webp",
    kind: "video",
    transparent: false,
    priority: "optional",
    dims: "1920x1080",
  },

  // ── Section 2 — Problem (system chips) ───────────────────────────────
  chipBooking: {
    id: "chipBooking",
    name: "System chip — Booking",
    section: "problem",
    file: "system-chip-booking.png",
    kind: "image",
    transparent: true,
    priority: "critical",
    dims: "512x512",
  },
  chipCrm: {
    id: "chipCrm",
    name: "System chip — CRM",
    section: "problem",
    file: "system-chip-crm.png",
    kind: "image",
    transparent: true,
    priority: "critical",
    dims: "512x512",
  },
  chipInventory: {
    id: "chipInventory",
    name: "System chip — Inventory",
    section: "problem",
    file: "system-chip-inventory.png",
    kind: "image",
    transparent: true,
    priority: "critical",
    dims: "512x512",
  },
  chipPos: {
    id: "chipPos",
    name: "System chip — POS",
    section: "problem",
    file: "system-chip-pos.png",
    kind: "image",
    transparent: true,
    priority: "critical",
    dims: "512x512",
  },
  chipMarketing: {
    id: "chipMarketing",
    name: "System chip — Marketing",
    section: "problem",
    file: "system-chip-marketing.png",
    kind: "image",
    transparent: true,
    priority: "critical",
    dims: "512x512",
  },
  chipColor: {
    id: "chipColor",
    name: "System chip — Color",
    section: "problem",
    file: "system-chip-color.png",
    kind: "image",
    transparent: true,
    priority: "critical",
    dims: "512x512",
  },

  // ── Section 3 — Salon ecosystem ──────────────────────────────────────
  ecosystemConnectionLayer: {
    id: "ecosystemConnectionLayer",
    name: "Ecosystem connection layer",
    section: "ecosystem",
    file: "ecosystem-connection-layer.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "1600x1000 viewBox",
  },
  ecosystemEnvironmentBg: {
    id: "ecosystemEnvironmentBg",
    name: "Ecosystem environment bg",
    section: "ecosystem",
    file: "ecosystem-environment-bg.webp",
    kind: "image",
    transparent: false,
    priority: "optional",
    dims: "3840x2160",
  },
  roleOwner: {
    id: "roleOwner",
    name: "Role icon — Owner",
    section: "ecosystem",
    file: "role-icon-owner.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "96x96 viewBox",
  },
  roleReception: {
    id: "roleReception",
    name: "Role icon — Reception",
    section: "ecosystem",
    file: "role-icon-reception.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "96x96 viewBox",
  },
  roleStylist: {
    id: "roleStylist",
    name: "Role icon — Stylist",
    section: "ecosystem",
    file: "role-icon-stylist.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "96x96 viewBox",
  },
  roleColorbar: {
    id: "roleColorbar",
    name: "Role icon — Color Bar",
    section: "ecosystem",
    file: "role-icon-colorbar.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "96x96 viewBox",
  },
  roleCustomer: {
    id: "roleCustomer",
    name: "Role icon — Customer",
    section: "ecosystem",
    file: "role-icon-customer.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "96x96 viewBox",
  },
  roleInventory: {
    id: "roleInventory",
    name: "Role icon — Inventory",
    section: "ecosystem",
    file: "role-icon-inventory.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "96x96 viewBox",
  },
  rolePayments: {
    id: "rolePayments",
    name: "Role icon — Payments",
    section: "ecosystem",
    file: "role-icon-payments.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "96x96 viewBox",
  },

  // ── Section 4 — Customer journey ─────────────────────────────────────
  journeyAvatar: {
    id: "journeyAvatar",
    name: "Journey avatar",
    section: "customer-journey",
    file: "journey-avatar.png",
    kind: "image",
    transparent: true,
    priority: "critical",
    dims: "256x256",
  },
  journeyDataPoint: {
    id: "journeyDataPoint",
    name: "Journey data point",
    section: "customer-journey",
    file: "journey-data-point.png",
    kind: "image",
    transparent: true,
    priority: "critical",
    dims: "128x128",
  },
  journeyCollectorCore: {
    id: "journeyCollectorCore",
    name: "Journey collector core",
    section: "customer-journey",
    file: "journey-collector-core.webp",
    kind: "image",
    transparent: true,
    priority: "optional",
    dims: "1024x1024",
  },

  // ── Foundation — Salon OS ────────────────────────────────────────────
  salonOsDashboard: {
    id: "salonOsDashboard",
    name: "Salon OS dashboard mockup",
    section: "salon-os",
    file: "salon-os-dashboard-mockup.webp",
    file2x: "salon-os-dashboard-mockup@2x.webp",
    kind: "image",
    transparent: false,
    priority: "critical",
    dims: "2560x1600",
  },
  salonOsDeviceFrame: {
    id: "salonOsDeviceFrame",
    name: "Salon OS device frame",
    section: "salon-os",
    file: "salon-os-device-frame.png",
    kind: "image",
    transparent: true,
    priority: "optional",
    dims: "2880x1800",
  },

  // ── Foundation — Spectra ─────────────────────────────────────────────
  spectraTablet: {
    id: "spectraTablet",
    name: "Spectra tablet mockup",
    section: "spectra",
    file: "spectra-tablet-mockup.webp",
    file2x: "spectra-tablet-mockup@2x.webp",
    kind: "image",
    transparent: false,
    priority: "critical",
    dims: "2048x2732",
  },
  spectraScale: {
    id: "spectraScale",
    name: "Spectra scale render",
    section: "spectra",
    file: "spectra-scale-render.webp",
    kind: "image",
    transparent: false,
    priority: "optional",
    dims: "2560x2560",
  },

  // ── Section 5 — Intelligence core ────────────────────────────────────
  brainCore: {
    id: "brainCore",
    name: "AI brain core",
    section: "intelligence-core",
    file: "ai-brain-core.webp",
    file2x: "ai-brain-core@2x.webp",
    kind: "image",
    transparent: false,
    priority: "critical",
    dims: "2048x2048",
  },
  brainCoreAlpha: {
    id: "brainCoreAlpha",
    name: "AI brain core (alpha)",
    section: "intelligence-core",
    file: "ai-brain-core.png",
    kind: "image",
    transparent: true,
    priority: "critical",
    dims: "2048x2048",
  },
  brainCoreLoop: {
    id: "brainCoreLoop",
    name: "AI brain core loop",
    section: "intelligence-core",
    file: "ai-brain-core-loop.webm",
    kind: "video",
    transparent: true,
    priority: "optional",
    dims: "1440x1440",
  },
  dataStreamOverlay: {
    id: "dataStreamOverlay",
    name: "Data stream overlay",
    section: "intelligence-core",
    file: "data-stream-overlay.webm",
    kind: "video",
    transparent: true,
    priority: "optional",
    dims: "1920x1080",
  },

  // ── Section 6 — AI workforce ─────────────────────────────────────────
  agentCustomerSuccess: {
    id: "agentCustomerSuccess",
    name: "Agent — Customer Success",
    section: "agents",
    file: "agent-customer-success.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "160x160 viewBox",
  },
  agentMarketing: {
    id: "agentMarketing",
    name: "Agent — Marketing",
    section: "agents",
    file: "agent-marketing.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "160x160 viewBox",
  },
  agentInventory: {
    id: "agentInventory",
    name: "Agent — Inventory",
    section: "agents",
    file: "agent-inventory.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "160x160 viewBox",
  },
  agentOperations: {
    id: "agentOperations",
    name: "Agent — Operations",
    section: "agents",
    file: "agent-operations.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "160x160 viewBox",
  },
  agentBi: {
    id: "agentBi",
    name: "Agent — Business Intelligence",
    section: "agents",
    file: "agent-bi.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "160x160 viewBox",
  },
  agentSpectra: {
    id: "agentSpectra",
    name: "Agent — Spectra Intelligence",
    section: "agents",
    file: "agent-spectra.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "160x160 viewBox",
  },
  commandCenterBg: {
    id: "commandCenterBg",
    name: "Command center backdrop",
    section: "agents",
    file: "command-center-bg.webp",
    kind: "image",
    transparent: false,
    priority: "optional",
    dims: "3840x2160",
  },

  // ── Section 7 — Customer evolution ───────────────────────────────────
  evolutionCurve: {
    id: "evolutionCurve",
    name: "Evolution curve",
    section: "customer-evolution",
    file: "evolution-curve.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "1600x700 viewBox",
  },

  // ── Section 8 — Data network ─────────────────────────────────────────
  networkGrowthField: {
    id: "networkGrowthField",
    name: "Network growth field",
    section: "network",
    file: "network-growth-field.webp",
    kind: "image",
    transparent: false,
    priority: "critical",
    dims: "3840x2160",
  },
  networkGrowthLoop: {
    id: "networkGrowthLoop",
    name: "Network growth loop",
    section: "network",
    file: "network-growth-loop.webm",
    kind: "video",
    transparent: false,
    priority: "optional",
    dims: "1920x1080",
  },

  // ── Section 9 — Vision ───────────────────────────────────────────────
  visionCosmosBg: {
    id: "visionCosmosBg",
    name: "Vision cosmos background",
    section: "vision",
    file: "vision-cosmos-bg.webp",
    file2x: "vision-cosmos-bg@2x.webp",
    kind: "image",
    transparent: false,
    priority: "critical",
    dims: "3840x2160",
  },
  visionCosmosLoop: {
    id: "visionCosmosLoop",
    name: "Vision cosmos loop",
    section: "vision",
    file: "vision-cosmos-loop.webm",
    kind: "video",
    transparent: false,
    priority: "optional",
    dims: "1920x1080",
  },
  salonAiWordmark: {
    id: "salonAiWordmark",
    name: "Salon AI wordmark",
    section: "vision",
    file: "salon-ai-wordmark.svg",
    kind: "vector",
    transparent: true,
    priority: "critical",
    dims: "800x200 viewBox",
  },

  // ── Shared ───────────────────────────────────────────────────────────
  ogShareImage: {
    id: "ogShareImage",
    name: "OG share image",
    section: "shared",
    file: "og-share-image.webp",
    kind: "image",
    transparent: false,
    priority: "recommended",
    dims: "1200x630",
  },
} as const satisfies Record<string, AssetSpec>;

export type AssetKey = keyof typeof ASSETS;

/** All declared assets as an array (stable order). */
export const ALL_ASSETS: readonly AssetSpec[] = Object.values(ASSETS);
