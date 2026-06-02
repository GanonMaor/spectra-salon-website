import React, { useEffect } from "react";
import { useReducedMotion } from "framer-motion";
import { ProgressRail } from "./primitives";
import { SalonAtmosphere } from "./visuals";
import { PAGE_META, CHROME } from "./copy";
import { SALON } from "./tokens";
import {
  OpeningSection,
  StoryFlowSection,
  ProblemSection,
  SalonEcosystemSection,
  CustomerJourneySection,
  SpectraColorBarSection,
  IntelligenceCoreSection,
  AIWorkforceSection,
  CustomerEvolutionSection,
  DataNetworkSection,
  BeautyIntelligenceDatasetSection,
  VisionSection,
} from "./sections";

/**
 * Hidden investor experience: "Spectra Product & Vision".
 * Route: /spectra-product-vision (no navigation link).
 *
 * Phase 1 (this file): technical foundation + premium shell. The page is its
 * own dark cinematic world (independent of the global SiteTheme), with all 9
 * sections in story order Problem -> ... -> Vision, simple reveal motion, and
 * graceful handling of not-yet-shipped assets.
 *
 * Phase 2 will add scroll scrubbing, pinned tracks, network/particle systems,
 * and the real cinematic motion (see investor-assets/MOTION_PLAN.md).
 */
export const SpectraProductVisionPage: React.FC = () => {
  const reducedMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const prevTitle = document.title;
    document.title = PAGE_META.title;
    window.scrollTo(0, 0);
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <main
      className="relative w-full"
      style={{
        background: `linear-gradient(180deg, ${SALON.bg} 0%, ${SALON.bgSoft} 40%, ${SALON.bgWarm} 100%)`,
        color: SALON.text,
      }}
    >
      <style>{SPV_STYLES}</style>
      <div id="spv-root" className="relative">
        {/* Global premium-salon wash behind every section (fixed, full-viewport). */}
        <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
          <SalonAtmosphere variant="base" reducedMotion={reducedMotion} />
        </div>
        <ProgressRail reducedMotion={reducedMotion} />

        <OpeningSection reducedMotion={reducedMotion} />
        <StoryFlowSection reducedMotion={reducedMotion} />
        <ProblemSection reducedMotion={reducedMotion} />
        <SalonEcosystemSection reducedMotion={reducedMotion} />
        <CustomerJourneySection reducedMotion={reducedMotion} />
        <SpectraColorBarSection reducedMotion={reducedMotion} />
        <IntelligenceCoreSection reducedMotion={reducedMotion} />
        <AIWorkforceSection reducedMotion={reducedMotion} />
        <CustomerEvolutionSection reducedMotion={reducedMotion} />
        <DataNetworkSection reducedMotion={reducedMotion} />
        <BeautyIntelligenceDatasetSection reducedMotion={reducedMotion} />
        <VisionSection reducedMotion={reducedMotion} />

        <footer
          className="flex flex-col sm:flex-row items-center justify-between gap-2 px-[clamp(24px,8vw,160px)] pt-20 pb-12"
          style={{ borderTop: `1px solid ${SALON.border}` }}
        >
          <span style={{ fontSize: 12, color: SALON.muted }}>
            {CHROME.footerConfidential}
          </span>
          <span style={{ fontSize: 12, color: SALON.muted }}>
            {CHROME.footerBrand}
          </span>
        </footer>
      </div>
    </main>
  );
};

/**
 * Page-scoped CSS: salon design tokens as CSS variables + the shared glass /
 * button / insight utility classes used across every section. Centralised so
 * the glassmorphism system is defined once and never hardcoded per component.
 */
const SPV_STYLES = `
#spv-root {
  color-scheme: light;
  --salon-bg: ${SALON.bg};
  --salon-bg-soft: ${SALON.bgSoft};
  --salon-bg-warm: ${SALON.bgWarm};
  --salon-surface: ${SALON.surface};
  --salon-surface-strong: ${SALON.surfaceStrong};
  --salon-glass-dark: ${SALON.glassInsight};
  --salon-text: ${SALON.text};
  --salon-text-soft: ${SALON.textSoft};
  --salon-muted: ${SALON.muted};
  --salon-rose: ${SALON.rose};
  --salon-rose-soft: ${SALON.roseSoft};
  --salon-gold: ${SALON.gold};
  --salon-champagne: ${SALON.champagne};
  --salon-copper: ${SALON.copper};
  --salon-ivory: ${SALON.ivory};
  --salon-border: ${SALON.borderSoft};
  --salon-border-dark: ${SALON.border};
  --salon-shadow: ${SALON.shadow};
}
.spv-glass {
  background: var(--salon-surface-strong);
  -webkit-backdrop-filter: blur(18px) saturate(135%);
  backdrop-filter: blur(18px) saturate(135%);
  border: 1px solid var(--salon-border);
  box-shadow: 0 24px 80px var(--salon-shadow), inset 0 1px 0 rgba(255,255,255,0.45);
}
.spv-glass-soft {
  background: var(--salon-surface);
  -webkit-backdrop-filter: blur(14px) saturate(125%);
  backdrop-filter: blur(14px) saturate(125%);
  border: 1px solid var(--salon-border);
  box-shadow: 0 16px 50px var(--salon-shadow), inset 0 1px 0 rgba(255,255,255,0.40);
}
.spv-insight {
  background: var(--salon-glass-dark);
  -webkit-backdrop-filter: blur(20px) saturate(130%);
  backdrop-filter: blur(20px) saturate(130%);
  border: 1px solid rgba(255,215,190,0.42);
  color: var(--salon-ivory);
  box-shadow: 0 22px 60px rgba(84,45,30,0.28), inset 0 1px 0 rgba(255,255,255,0.18);
}
.spv-btn-primary {
  background: linear-gradient(135deg, ${SALON.roseSoft}, ${SALON.copper});
  color: ${SALON.ivory};
  box-shadow: 0 18px 45px rgba(185,104,82,0.28);
  transition: transform .2s ease, box-shadow .2s ease;
}
.spv-btn-primary:hover { transform: translateY(-1px) scale(1.01); box-shadow: 0 22px 55px rgba(185,104,82,0.34); }
.spv-btn-ghost {
  background: var(--salon-surface);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border: 1px solid var(--salon-rose);
  color: var(--salon-text);
  transition: background .2s ease;
}
.spv-btn-ghost:hover { background: var(--salon-surface-strong); }

/* ═══════════════════════════════════════════════════════════════════════════
 * LIQUID GLASS SYSTEM — 5-layer champagne-pink glass objects
 * ═══════════════════════════════════════════════════════════════════════════ */

/* Layer 1 + 2 — Glass body & frost blur. */
.spv-ai-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.32) 0%,
    rgba(255,248,243,0.20) 50%,
    rgba(255,235,225,0.12) 100%
  );
  -webkit-backdrop-filter: blur(42px) saturate(180%);
  backdrop-filter: blur(42px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.42);
  border-radius: 28px;
  /* Layer 5 — Ambient glow: outer warmth + inner edge highlights. */
  box-shadow:
    0 30px 80px rgba(255,205,180,0.18),
    0 12px 32px rgba(255,180,140,0.12),
    inset 0 1px 1px rgba(255,255,255,0.55),
    inset 0 -1px 1px rgba(255,220,200,0.15);
  transition: transform .35s cubic-bezier(0.16,1,0.3,1), box-shadow .35s ease;
}

/* Layer 3 — Edge refraction (bright top → dim bottom along the border). */
.spv-ai-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.52) 0%,
    rgba(255,255,255,0.04) 100%
  );
  opacity: 0.60;
  pointer-events: none;
  z-index: 0;
}

/* Layer 4 — Internal top-light: upper 40% glows as if lit from above. */
.spv-ai-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 42%;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.24) 0%,
    transparent 100%
  );
  border-radius: inherit;
  pointer-events: none;
  z-index: 0;
}

/* Card content must sit above the pseudo-element layers. */
.spv-ai-card > * { position: relative; z-index: 1; }

.spv-ai-card:hover {
  box-shadow:
    0 36px 90px rgba(255,205,180,0.24),
    0 16px 40px rgba(255,180,140,0.16),
    inset 0 1px 1px rgba(255,255,255,0.70),
    inset 0 -1px 1px rgba(255,220,200,0.20);
}

/* Layer 6 — Reflection streak (angled highlight across the face). */
.spv-ai-reflection {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 35%;
  background: linear-gradient(
    120deg,
    transparent 0%,
    rgba(255,255,255,0.18) 45%,
    transparent 70%
  );
  border-radius: inherit;
  filter: blur(20px);
  opacity: 0.70;
  pointer-events: none;
  z-index: 2;
}

/* Ambient AI aura — smaller, warmer radial glow at 60px blur. */
.spv-ai-aura {
  position: absolute;
  inset: -20% -14%;
  z-index: -1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(245,195,165,0.20) 0%, transparent 70%);
  filter: blur(60px);
  pointer-events: none;
}

/* Living amber signal dot. */
.spv-ai-dot {
  background: #F5C4A6;
  box-shadow: 0 0 12px rgba(245,196,166,0.85);
}

@media (prefers-reduced-motion: reduce) {
  .spv-ai-floating { animation: none !important; }
}
`;
