import React, { useEffect, useRef, useState } from "react";
import { INV } from "../SpectraInvestorExperience/tokens";
import { LiveSystemHeroDraftSlide } from "./sections/liveDemoDraft";
import {
  DataSlide,
  GTMSlide,
  LandscapeSlide,
  MarketSlide,
  ModelSlide,
  OptionalitySlide,
  PlatformSlide,
  ProofSlide,
  RaiseSlide,
  SalonAISlide,
  TeamSlide,
  ThesisSlide,
  WedgeSlide,
} from "./working/NarrativeSlides";
import { CHROME } from "./copy";
import { ACCENTS } from "./theme";

/**
 * Working scroll page — converts the 13-slide DeckShell deck into a single
 * vertically-scrollable investor landing page.
 *
 * Structure:
 *  • Fixed header   — brand, "WORKING COPY" badge, scroll-progress bar
 *  • #cover         — LiveSystemHeroDraftSlide (full-viewport cinematic opener)
 *  • #thesis … #optionality — the 13 NarrativeSlides, each 100dvh on desktop
 *
 * Rules:
 *  - Does not modify DeckShell, Navigation.tsx, or canonical deck files.
 *  - Uses existing NarrativeSlides exports unchanged.
 *  - Hash anchors are preserved for all 13 slide IDs + cover.
 */

// ── Scroll section wrapper ─────────────────────────────────────────────────────

/**
 * Each narrative slide wraps in a section that is exactly 100dvh tall on
 * desktop (matching the 16:9 deck composition) and natural-height on mobile
 * (content flows down; no nested scroll context).
 */
const SlideSection: React.FC<{
  id: string;
  children: React.ReactNode;
  className?: string;
}> = ({ id, children, className = "" }) => (
  <section
    id={id}
    className={`relative scroll-mt-12 lg:h-[100dvh] lg:overflow-hidden ${className}`}
  >
    {children}
  </section>
);

// ── Scroll-progress bar ────────────────────────────────────────────────────────

const GOLD_BAR_START = "#b1844d";
const GOLD_BAR_END = "#d9b981";

// ── Main page ─────────────────────────────────────────────────────────────────

/**
 * Isolated working scroll page.
 * Route: /investors/new-narrative-salon-ai-first/working
 */
export const NewNarrativeSalonAIFirstWorkingPage: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    document.title = "Salon AI Investor Deck — Working Copy | Spectra";

    // Dark background fills the gap between sections on rapid scroll
    const prevBg = document.documentElement.style.background;
    document.documentElement.style.background = INV.bgDeep;

    // Smooth scroll for hash navigation
    const prevScroll = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "smooth";

    const update = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0
      );
      rafRef.current = null;
    };

    const onScroll = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(update);
      }
    };

    const syncHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ block: "start" });
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", syncHash);
    syncHash();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", syncHash);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.documentElement.style.background = prevBg;
      document.documentElement.style.scrollBehavior = prevScroll;
    };
  }, []);

  return (
    <>
      {/* ── Robots — noindex for working copy ───────────────────────────── */}
      {/* (meta injection handled by document.title; noindex via server if needed) */}

      {/* ── Fixed chrome header ─────────────────────────────────────────── */}
      <header
        className="fixed left-0 right-0 top-0 z-50"
        style={{ background: "rgba(10,7,5,0.82)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}
      >
        <div className="flex items-center justify-between px-6 py-2.5 sm:px-8">
          {/* Brand */}
          <a
            href="#cover"
            className="flex items-center gap-2.5 no-underline"
            style={{ textDecoration: "none" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: ACCENTS.gold.accent, boxShadow: `0 0 8px ${ACCENTS.gold.accent}` }}
            />
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.28em]"
              style={{ color: ACCENTS.gold.accent }}
            >
              {CHROME.brand}
            </span>
            <span
              className="hidden rounded border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.2em] sm:inline"
              style={{
                color: ACCENTS.copper.accent,
                borderColor: ACCENTS.copper.accentBorder,
                background: ACCENTS.copper.accentSoft,
              }}
            >
              Working Copy
            </span>
          </a>

          {/* Confidential tag */}
          <span
            className="text-[9px] uppercase tracking-[0.18em]"
            style={{ color: "rgba(251,246,239,0.30)" }}
          >
            {CHROME.confidential}
          </span>
        </div>

        {/* Scroll progress bar */}
        <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full transition-none"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${GOLD_BAR_START}, ${GOLD_BAR_END})`,
            }}
          />
        </div>
      </header>

      {/* ── Page body ─────────────────────────────────────────────────────── */}
      {/* Spacer keeps content below the fixed header */}
      <div className="h-[46px]" aria-hidden="true" />

      {/* ── 0. Cover — LiveSystemHeroDraftSlide ──────────────────────────── */}
      {/*
       * Fixed viewport height for both mobile and desktop.
       * The component owns its own internal mobile scroll, which is the
       * intentional design — the four-layer architecture reveals on swipe.
       * On desktop it is a full cinematic opener.
       */}
      <section
        id="cover"
        className="relative min-h-[100dvh] scroll-mt-12 overflow-visible [&>section]:!overflow-visible lg:h-[100dvh] lg:min-h-0 lg:overflow-hidden lg:[&>section]:!overflow-hidden"
        aria-label="Salon AI — Opening"
      >
        <LiveSystemHeroDraftSlide embeddedInScrollPage />
      </section>

      {/* ── 1. Thesis ────────────────────────────────────────────────────── */}
      <SlideSection id="thesis">
        <ThesisSlide />
      </SlideSection>

      {/* ── 2. Market ────────────────────────────────────────────────────── */}
      <SlideSection id="market">
        <MarketSlide />
      </SlideSection>

      {/* ── 3. Wedge ─────────────────────────────────────────────────────── */}
      <SlideSection id="wedge">
        <WedgeSlide />
      </SlideSection>

      {/* ── 4. Proof ─────────────────────────────────────────────────────── */}
      <SlideSection id="proof">
        <ProofSlide />
      </SlideSection>

      {/* ── 5. GTM ───────────────────────────────────────────────────────── */}
      <SlideSection id="gtm">
        <GTMSlide />
      </SlideSection>

      {/* ── 6. Platform ──────────────────────────────────────────────────── */}
      <SlideSection id="platform">
        <PlatformSlide />
      </SlideSection>

      {/* ── 7. Salon AI ──────────────────────────────────────────────────── */}
      <SlideSection id="salon-ai">
        <SalonAISlide />
      </SlideSection>

      {/* ── 8. Data ──────────────────────────────────────────────────────── */}
      <SlideSection id="data">
        <DataSlide />
      </SlideSection>

      {/* ── 9. Model ─────────────────────────────────────────────────────── */}
      <SlideSection id="model">
        <ModelSlide />
      </SlideSection>

      {/* ── 10. Landscape ────────────────────────────────────────────────── */}
      <SlideSection id="landscape">
        <LandscapeSlide />
      </SlideSection>

      {/* ── 11. Team ─────────────────────────────────────────────────────── */}
      <SlideSection id="team">
        <TeamSlide />
      </SlideSection>

      {/* ── 12. Raise ────────────────────────────────────────────────────── */}
      <SlideSection id="raise">
        <RaiseSlide />
      </SlideSection>

      {/* ── 13. Optionality ──────────────────────────────────────────────── */}
      <SlideSection id="optionality">
        <OptionalitySlide />
      </SlideSection>
    </>
  );
};
