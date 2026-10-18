import React, { useEffect, useMemo, useRef, useState } from "react";
import { SalonAiLockup } from "../../components/SalonAiLockup";
import { displayFamily } from "../ExternalInvestorUpdate/EditorialPrimitives";
import { P, SLIDE } from "../ExternalInvestorUpdate/PresentationSlide";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";
import {
  DeckVariantContext,
  FounderStoryDeck,
  FOUNDER_STORY_SLIDE_COUNT,
  FOUNDER_STORY_SLIDES,
} from "./FounderStoryDeck";
import { type UpdateLang } from "./founderStoryCopy";
import { DECK_VARIANTS, type DeckVariantId } from "./founderStoryVariants";

const HEADER_HEIGHT = 56;
const MOBILE_TOOLBAR_HEIGHT = 58;
const MOBILE_BREAKPOINT = 768;
const MOBILE_READING_SCALE = 0.56;

const readLang = (): UpdateLang =>
  typeof window !== "undefined" && new URLSearchParams(window.location.search).get("lang") === "he"
    ? "he"
    : "en";

export const FounderStoryPresentationPage: React.FC<{ variantId: DeckVariantId }> = ({ variantId }) => {
  const variant = DECK_VARIANTS[variantId];
  const pdfExport = usePdfExportMode();
  const [lang, setLang] = useState<UpdateLang>(readLang);
  const [slide, setSlide] = useState(0);
  const [mobileReadingMode, setMobileReadingMode] = useState(false);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? SLIDE.width : window.innerWidth,
    height: typeof window === "undefined" ? SLIDE.height + HEADER_HEIGHT : window.innerHeight,
  }));
  const scrollerRef = useRef<HTMLElement | null>(null);
  const readingViewportRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<Array<HTMLDivElement | null>>([]);

  const mobile = viewport.width < MOBILE_BREAKPOINT;
  const availableHeight = Math.max(
    1,
    viewport.height - HEADER_HEIGHT - (mobile ? MOBILE_TOOLBAR_HEIGHT : 0),
  );
  const scale = Math.min(1, viewport.width / SLIDE.width, availableHeight / SLIDE.height);
  const readingScale = Math.max(scale, MOBILE_READING_SCALE);

  useEffect(() => {
    const previousTitle = document.title;
    const previousLang = document.documentElement.lang;
    const previousDir = document.documentElement.dir;
    document.title = variant.publicName;
    document.documentElement.lang = lang;
    document.documentElement.dir = "ltr";
    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLang;
      document.documentElement.dir = previousDir;
    };
  }, [lang, variant.publicName]);

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
    if (mobile) return;
    setMobileReadingMode(false);
  }, [mobile]);

  useEffect(() => {
    const root = readingViewportRef.current;
    if (!mobileReadingMode || !root) return;
    const left = lang === "he" ? root.scrollWidth - root.clientWidth : 0;
    root.scrollTo({ left, top: 0, behavior: "auto" });
  }, [lang, mobileReadingMode, slide]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (lang === "he") params.set("lang", "he");
    else params.delete("lang");
    const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", next);
  }, [lang]);

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
      const next = Math.max(0, Math.min(FOUNDER_STORY_SLIDE_COUNT - 1, index));
      slotRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [],
  );

  const goToMobileSlide = (index: number) => {
    setMobileReadingMode(false);
    goTo(index);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof HTMLMediaElement) return;
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
        goTo(FOUNDER_STORY_SLIDE_COUNT - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, slide]);

  if (pdfExport) {
    return (
      <div
        dir="ltr"
        lang={lang}
        data-pdf-export="1"
        data-testid="founder-story-page"
        style={{
          background: P.paper,
          color: P.text,
          fontFamily:
            lang === "he"
              ? '"Assistant", "Noto Sans Hebrew", Arial, sans-serif'
              : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600&family=Frank+Ruhl+Libre:wght@400;500&family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
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
        <FounderStoryDeck lang={lang} variantId={variantId} />
      </div>
    );
  }

  return (
    <div
      dir="ltr"
      lang={lang}
      data-testid="founder-story-page"
      className="min-h-[100dvh]"
      style={{ background: "#ebe4d8", color: P.text }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600&family=Frank+Ruhl+Libre:wght@400;500&family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&display=swap');
        html, body { background: #ebe4d8; margin: 0; }
        .founder-story-page * { -webkit-font-smoothing: antialiased; }
        .founder-story-reading-viewport {
          scrollbar-color: rgba(177,132,77,0.72) rgba(43,34,27,0.08);
          scrollbar-width: thin;
        }
        .founder-story-reading-viewport::-webkit-scrollbar { width: 6px; height: 6px; }
        .founder-story-reading-viewport::-webkit-scrollbar-track { background: rgba(43,34,27,0.08); }
        .founder-story-reading-viewport::-webkit-scrollbar-thumb {
          border-radius: 999px;
          background: rgba(177,132,77,0.72);
        }
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
              {variant.date[lang]}
            </p>
            <div
              dir="ltr"
              className="inline-flex items-center"
              role="group"
              aria-label={lang === "he" ? "החלפת שפה" : "Change language"}
            >
              {(["en", "he"] as UpdateLang[]).map((option, index) => (
                <React.Fragment key={option}>
                  {index > 0 && (
                    <span aria-hidden="true" className="px-1 text-[10px]" style={{ color: "rgba(43,34,27,0.28)" }}>
                      /
                    </span>
                  )}
                  <button
                    type="button"
                    aria-pressed={lang === option}
                    onClick={() => setLang(option)}
                    className="min-h-11 px-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B1844D]"
                    style={{ color: lang === option ? P.ink : "rgba(43,34,27,0.38)" }}
                  >
                    {option === "en" ? "EN" : "עברית"}
                  </button>
                </React.Fragment>
              ))}
            </div>
            <p
              dir="ltr"
              className="text-[13px] tabular-nums"
              style={{ fontFamily: displayFamily(lang), color: P.accentDeep }}
            >
              {String(slide + 1).padStart(2, "0")} / {String(FOUNDER_STORY_SLIDE_COUNT).padStart(2, "0")}
            </p>
          </div>
        </div>
      </header>

      <DeckVariantContext.Provider value={variant}>
      <main
        ref={scrollerRef}
        data-testid="founder-story-scroller"
        className="founder-story-page"
        style={{
          height: "100dvh",
          overflowY: "auto",
          scrollSnapType: "y mandatory",
          paddingTop: `calc(${HEADER_HEIGHT}px + env(safe-area-inset-top, 0px))`,
          paddingBottom: mobile
            ? `calc(${MOBILE_TOOLBAR_HEIGHT}px + env(safe-area-inset-bottom, 0px))`
            : undefined,
          fontFamily:
            lang === "he"
              ? '"Assistant", "Noto Sans Hebrew", Arial, sans-serif'
              : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        {FOUNDER_STORY_SLIDES.map((Slide, index) => (
          <div
            key={index}
            ref={(node) => {
              slotRefs.current[index] = node;
            }}
            data-slide-index={index}
            data-testid={`founder-story-slot-${index + 1}`}
            className="grid place-items-center"
            style={{
              minHeight: availableHeight,
              scrollSnapAlign: "start",
              scrollSnapStop: "always",
            }}
          >
            <div
              ref={index === slide && mobileReadingMode ? readingViewportRef : undefined}
              className={index === slide && mobileReadingMode ? "founder-story-reading-viewport" : undefined}
              style={{
                width: index === slide && mobileReadingMode ? "100%" : SLIDE.width * scale,
                height: index === slide && mobileReadingMode ? availableHeight : SLIDE.height * scale,
                overflow: index === slide && mobileReadingMode ? "auto" : "visible",
                overscrollBehavior: index === slide && mobileReadingMode ? "contain" : undefined,
                touchAction: index === slide && mobileReadingMode ? "pan-x pan-y" : undefined,
                boxShadow: "0 18px 60px rgba(23,17,13,0.12)",
              }}
            >
              <div
                style={{
                  width: SLIDE.width * (index === slide && mobileReadingMode ? readingScale : scale),
                  height: SLIDE.height * (index === slide && mobileReadingMode ? readingScale : scale),
                }}
              >
                <div
                  style={{
                    width: SLIDE.width,
                    height: SLIDE.height,
                    transform: `scale(${index === slide && mobileReadingMode ? readingScale : scale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <Slide lang={lang} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
      </DeckVariantContext.Provider>

      {mobile && (
        <nav
          dir="ltr"
          aria-label={lang === "he" ? "ניווט במצגת" : "Presentation navigation"}
          className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center border-t px-3"
          style={{
            minHeight: `calc(${MOBILE_TOOLBAR_HEIGHT}px + env(safe-area-inset-bottom, 0px))`,
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            borderColor: "rgba(43,34,27,0.14)",
            background: "rgba(245,239,231,0.96)",
            backdropFilter: "blur(14px)",
          }}
        >
          <button
            type="button"
            onClick={() => goToMobileSlide(slide - 1)}
            disabled={slide === 0}
            className="min-h-11 justify-self-start px-2 text-[11px] font-semibold uppercase tracking-[0.14em] disabled:opacity-25"
            style={{ color: P.accentDeep }}
          >
            {lang === "he" ? "הקודם" : "Previous"}
          </button>
          <button
            type="button"
            aria-pressed={mobileReadingMode}
            onClick={() => setMobileReadingMode((active) => !active)}
            className="min-h-11 rounded-full border px-4 text-[11px] font-semibold uppercase tracking-[0.12em]"
            style={{
              color: mobileReadingMode ? P.inkText : P.text,
              borderColor: mobileReadingMode ? P.ink : "rgba(43,34,27,0.22)",
              background: mobileReadingMode ? P.ink : "rgba(255,255,255,0.42)",
            }}
          >
            {mobileReadingMode
              ? lang === "he"
                ? "הצג הכל"
                : "Fit slide"
              : lang === "he"
                ? "מצב קריאה"
                : "Readable view"}
          </button>
          <button
            type="button"
            onClick={() => goToMobileSlide(slide + 1)}
            disabled={slide === FOUNDER_STORY_SLIDE_COUNT - 1}
            className="min-h-11 justify-self-end px-2 text-[11px] font-semibold uppercase tracking-[0.14em] disabled:opacity-25"
            style={{ color: P.accentDeep }}
          >
            {lang === "he" ? "הבא" : "Next"}
          </button>
        </nav>
      )}
    </div>
  );
};

export default FounderStoryPresentationPage;
