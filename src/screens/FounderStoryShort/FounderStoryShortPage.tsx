import React, { useEffect, useMemo, useRef, useState } from "react";
import { SalonAiLockup } from "../../components/SalonAiLockup";
import { displayFamily } from "../ExternalInvestorUpdate/EditorialPrimitives";
import { P, SLIDE } from "../ExternalInvestorUpdate/PresentationSlide";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";
import {
  FounderStoryShortDeck,
  SHORT_STORY_SLIDES,
  SHORT_STORY_TOTAL,
  ShortDeckVariantContext,
} from "./FounderStoryShortDeck";
import { SHORT_DECK_VARIANTS, type ShortDeckVariantId } from "./shortStoryVariants";

const HEADER_HEIGHT = 56;

export const FounderStoryShortPage: React.FC<{ variantId?: ShortDeckVariantId }> = ({
  variantId = "september",
}) => {
  const variant = SHORT_DECK_VARIANTS[variantId];
  const pdfExport = usePdfExportMode();
  const [slide, setSlide] = useState(0);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? SLIDE.width : window.innerWidth,
    height: typeof window === "undefined" ? SLIDE.height + HEADER_HEIGHT : window.innerHeight,
  }));
  const scrollerRef = useRef<HTMLElement | null>(null);
  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);

  const availableHeight = Math.max(1, viewport.height - HEADER_HEIGHT);
  const scale = Math.min(1, viewport.width / SLIDE.width, availableHeight / SLIDE.height);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = variant.publicName;
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
    return () => {
      document.title = previousTitle;
    };
  }, [variant.publicName]);

  useEffect(() => {
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    const previousContent = robots?.content;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";
    return () => {
      if (created) robots?.remove();
      else if (robots && previousContent !== undefined) robots.content = previousContent;
    };
  }, []);

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return undefined;
    const slots = slotRefs.current.filter((node): node is HTMLDivElement => Boolean(node));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = Number((visible.target as HTMLElement).dataset.slideIndex);
        if (Number.isFinite(index)) setSlide(index);
      },
      { root, threshold: 0.55 },
    );
    slots.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const goTo = useMemo(
    () => (index: number) => {
      const next = Math.max(0, Math.min(SHORT_STORY_TOTAL - 1, index));
      slotRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowRight" || event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        goTo(slide + 1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        goTo(slide - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(SHORT_STORY_TOTAL - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, slide]);

  if (pdfExport) {
    return (
      <div
        dir="ltr"
        lang="en"
        data-pdf-export="1"
        data-testid="founder-story-short-page"
        style={{
          background: P.paper,
          color: P.text,
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
          html, body { background: ${P.paper}; margin: 0; }
          [data-pdf-export="1"] * { animation: none !important; transition: none !important; }
          @page { size: 20in 11.25in; margin: 0; }
          @media print {
            html, body { width: auto; }
            [data-pdf-export="1"] {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
            }
            [data-pdf-slide] { break-inside: avoid; page-break-inside: avoid; }
          }
        `}</style>
        <FounderStoryShortDeck variantId={variantId} />
      </div>
    );
  }

  return (
    <div
      dir="ltr"
      lang="en"
      data-testid="founder-story-short-page"
      className="min-h-[100dvh]"
      style={{ background: "#ebe4d8", color: P.text }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        html, body { background: #ebe4d8; margin: 0; }
        .founder-story-short-page * { -webkit-font-smoothing: antialiased; }
      `}</style>

      <header
        className="fixed inset-x-0 top-0 z-50 border-b"
        style={{
          height: `calc(${HEADER_HEIGHT}px + env(safe-area-inset-top, 0px))`,
          paddingTop: "env(safe-area-inset-top, 0px)",
          background: P.paper,
          borderColor: P.accent,
        }}
      >
        <div
          className="mx-auto flex h-full items-center justify-between gap-4 px-4 sm:px-6"
          style={{ maxWidth: SLIDE.width * scale || "100%" }}
        >
          <div className="min-w-0">
            <SalonAiLockup />
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <p
              className="hidden truncate text-[10px] font-semibold uppercase tracking-[0.16em] sm:block"
              style={{ color: "rgba(43,34,27,0.46)" }}
            >
              {variant.date}
            </p>
            <p dir="ltr" className="text-[13px] tabular-nums" style={{ fontFamily: displayFamily("en"), color: P.accentDeep }}>
              {String(slide + 1).padStart(2, "0")} / {String(SHORT_STORY_TOTAL).padStart(2, "0")}
            </p>
          </div>
        </div>
      </header>

      <ShortDeckVariantContext.Provider value={variant}>
        <main
          ref={scrollerRef}
          data-testid="founder-story-short-scroller"
          className="founder-story-short-page"
          style={{
            height: "100dvh",
            overflowY: "auto",
            scrollSnapType: "y mandatory",
            paddingTop: `calc(${HEADER_HEIGHT}px + env(safe-area-inset-top, 0px))`,
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          }}
        >
          {SHORT_STORY_SLIDES.map((Slide, index) => (
            <div
              key={index}
              ref={(node) => {
                slotRefs.current[index] = node;
              }}
              data-slide-index={index}
              data-testid={`founder-story-short-slot-${index + 1}`}
              className="grid place-items-center"
              style={{
                minHeight: availableHeight,
                scrollSnapAlign: "start",
                scrollSnapStop: "always",
              }}
            >
              <div
                style={{
                  width: SLIDE.width * scale,
                  height: SLIDE.height * scale,
                  boxShadow: "0 18px 60px rgba(23,17,13,0.12)",
                }}
              >
                <div
                  style={{
                    width: SLIDE.width,
                    height: SLIDE.height,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <Slide />
                </div>
              </div>
            </div>
          ))}
        </main>
      </ShortDeckVariantContext.Provider>
    </div>
  );
};

export default FounderStoryShortPage;
