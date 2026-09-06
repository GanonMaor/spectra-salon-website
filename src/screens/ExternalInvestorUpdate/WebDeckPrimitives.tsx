import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";
import { CB_INK } from "./colorBarTokens";
import type { UpdateLang } from "./finalCopy";

export const WEB_SLIDE = {
  width: 1920,
  height: 1080,
  headerHeight: 60,
  safeX: 120,
  safeY: 58,
} as const;

/** Below this width the deck reflows instead of scaling a 16:9 canvas. */
export const DECK_FLUID_MAX = 1023;

/** CSS width of the scaled 16:9 slide frame under the running header. */
export const WEB_DECK_FRAME_WIDTH = `min(100vw, calc((100dvh - ${WEB_SLIDE.headerHeight}px) * ${WEB_SLIDE.width} / ${WEB_SLIDE.height}), ${WEB_SLIDE.width}px)`;

export type DeckLayout = "canvas" | "fluid";

type DeckScaleContextValue = {
  scale: number;
  availableHeight: number;
  layout: DeckLayout;
};

const DeckScaleContext = createContext<DeckScaleContextValue>({
  scale: 1,
  availableHeight: WEB_SLIDE.height,
  layout: "canvas",
});

export const useDeckLayout = () => useContext(DeckScaleContext);

const FLUID_CSS = `
  .investor-web-deck,
  .investor-slide-slot,
  .investor-slide-frame,
  .investor-slide-canvas {
    direction: ltr;
  }
  .investor-web-deck[data-deck-layout="fluid"] {
    padding-top: calc(${WEB_SLIDE.headerHeight}px + env(safe-area-inset-top, 0px));
    background: #EEE9E1;
  }
  .investor-web-deck[data-deck-layout="fluid"] .investor-slide-slot {
    display: block;
    min-height: 0 !important;
    overflow: visible;
    scroll-snap-align: none;
  }
  .investor-web-deck[data-deck-layout="fluid"] .investor-slide-frame {
    width: 100% !important;
    height: auto !important;
    overflow: visible;
  }
  .investor-web-deck[data-deck-layout="fluid"] .investor-slide-canvas {
    width: 100% !important;
    height: auto !important;
    min-height: calc(100dvh - ${WEB_SLIDE.headerHeight}px - env(safe-area-inset-top, 0px));
    transform: none !important;
    overflow: visible;
    scroll-margin-top: calc(${WEB_SLIDE.headerHeight}px + env(safe-area-inset-top, 0px) + 8px);
  }
  .investor-web-deck[data-deck-layout="fluid"] [data-slide-safe-area] {
    position: relative !important;
    inset: auto !important;
    overflow: visible !important;
    display: flex;
    flex-direction: column;
    min-height: calc(100dvh - ${WEB_SLIDE.headerHeight}px - env(safe-area-inset-top, 0px));
    padding: 28px max(20px, env(safe-area-inset-left, 0px)) 44px max(20px, env(safe-area-inset-right, 0px));
  }
  @media (min-width: 480px) {
    .investor-web-deck[data-deck-layout="fluid"] [data-slide-safe-area] {
      padding: 36px 28px 52px;
    }
  }
  .investor-web-deck[data-deck-layout="fluid"] [data-slide-safe-area] > * {
    width: 100%;
    height: auto !important;
    min-height: 0 !important;
    max-width: 100%;
  }
  .investor-web-deck[data-deck-layout="fluid"] h1 {
    font-size: clamp(1.85rem, 8.2vw, 2.55rem) !important;
    line-height: 1.12 !important;
    max-width: none !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] h2 {
    font-size: clamp(1.5rem, 6.8vw, 2.2rem) !important;
    line-height: 1.16 !important;
    max-width: none !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] [data-deck-lead] {
    font-size: 1.05rem !important;
    line-height: 1.45 !important;
    max-width: none !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] [style*="grid-template-columns"] {
    grid-template-columns: minmax(0, 1fr) !important;
    gap: 24px !important;
    align-items: start !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] .deck-quad {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
    gap: 14px !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] .deck-marks {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
    row-gap: 14px !important;
    column-gap: 16px !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] .deck-ledger > * {
    padding-inline: 0 !important;
    padding-block: 18px !important;
    border-inline-start: none !important;
    border-block-start: 1px solid rgba(92, 72, 42, 0.14);
  }
  .investor-web-deck[data-deck-layout="fluid"] .deck-hero-metric {
    font-size: clamp(3.1rem, 15vw, 5rem) !important;
    white-space: normal !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] .deck-metric {
    font-size: clamp(1.85rem, 9vw, 2.6rem) !important;
    white-space: nowrap !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] .deck-cover-photo {
    height: 220px !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] .web-deck-market-salon figure img,
  .investor-web-deck[data-deck-layout="fluid"] .web-deck-market-products figure img {
    height: 240px !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] .deck-photo,
  .investor-web-deck[data-deck-layout="fluid"] .deck-media-band {
    height: auto !important;
    min-height: 0 !important;
    flex: none !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] .deck-media-band figure,
  .investor-web-deck[data-deck-layout="fluid"] .deck-photo-frame {
    height: 210px !important;
    min-height: 210px !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] [style*="white-space: nowrap"] {
    white-space: normal !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] .deck-keep-nowrap {
    white-space: nowrap !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] aside {
    padding-inline-start: 0 !important;
    border-inline-start: none !important;
    padding-block: 8px 0 !important;
    border-block-start: 1px solid rgba(92, 72, 42, 0.14);
  }
  .investor-web-deck[data-deck-layout="fluid"] .deck-track + .deck-track {
    padding-inline-start: 0 !important;
    border-inline-start: none !important;
    padding-block-start: 24px;
    border-block-start: 1px solid rgba(245, 238, 225, 0.14);
  }
  .investor-web-deck[data-deck-layout="fluid"] .deck-pair {
    white-space: normal !important;
    font-size: 1.12rem !important;
    flex-wrap: wrap !important;
  }
  .investor-web-deck[data-deck-layout="fluid"] .web-deck-data-moat footer,
  .investor-web-deck[data-deck-layout="fluid"] .deck-footer-wrap {
    flex-wrap: wrap !important;
    gap: 12px !important;
  }
`;

export const ResponsiveWebDeck: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const pdfExport = usePdfExportMode();
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? WEB_SLIDE.width : window.innerWidth,
    height: typeof window === "undefined" ? WEB_SLIDE.height + WEB_SLIDE.headerHeight : window.innerHeight,
  }));

  useEffect(() => {
    const update = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  const layout: DeckLayout = !pdfExport && viewport.width <= DECK_FLUID_MAX ? "fluid" : "canvas";

  const value = useMemo<DeckScaleContextValue>(() => {
    if (pdfExport || layout === "fluid") {
      return { availableHeight: WEB_SLIDE.height, scale: 1, layout };
    }
    const availableHeight = Math.max(1, viewport.height - WEB_SLIDE.headerHeight);
    return {
      availableHeight,
      scale: Math.min(1, viewport.width / WEB_SLIDE.width, availableHeight / WEB_SLIDE.height),
      layout,
    };
  }, [pdfExport, viewport, layout]);

  useEffect(() => {
    if (pdfExport) return;
    const root = document.querySelector(".investor-update-page");
    if (!(root instanceof HTMLElement)) return;
    if (value.layout === "fluid") {
      root.style.removeProperty("--investor-slide-width");
      return undefined;
    }
    root.style.setProperty("--investor-slide-width", `${WEB_SLIDE.width * value.scale}px`);
    return () => {
      root.style.removeProperty("--investor-slide-width");
    };
  }, [pdfExport, value.layout, value.scale]);

  return (
    <DeckScaleContext.Provider value={value}>
      <main
        data-investor-presentation="true"
        data-deck-layout={value.layout}
        className="investor-web-deck"
        style={{
          paddingTop: pdfExport
            ? 0
            : value.layout === "fluid"
              ? `calc(${WEB_SLIDE.headerHeight}px + env(safe-area-inset-top, 0px))`
              : WEB_SLIDE.headerHeight,
          background: value.layout === "fluid" ? "#FBFAF7" : "#EEE9E1",
        }}
      >
        <style>{`
          .investor-slide-slot {
            display: grid;
            place-items: center;
            overflow: hidden;
            scroll-snap-align: start;
          }
          .investor-slide-frame {
            position: relative;
            overflow: hidden;
          }
          ${FLUID_CSS}
          @media print {
            @page { size: 1920px 1080px; margin: 0; }
            .investor-update-page > header { display: none !important; }
            .investor-web-deck { padding: 0 !important; background: #FBFAF7 !important; }
            .investor-slide-slot,
            .investor-slide-frame,
            .investor-slide-canvas {
              width: 1920px !important;
              height: 1080px !important;
              min-height: 0 !important;
            }
            .investor-slide-slot {
              break-after: page;
              page-break-after: always;
            }
            .investor-slide-slot:last-child {
              break-after: auto;
              page-break-after: auto;
            }
            .investor-slide-canvas { transform: none !important; }
          }
        `}</style>
        {children}
      </main>
    </DeckScaleContext.Provider>
  );
};

export type WebSlideTone = "paper" | "warm" | "chalk" | "ink";

const TONE: Record<WebSlideTone, { background: string; color: string }> = {
  paper: { background: "#FBFAF7", color: "#1C1914" },
  warm: { background: "#F5F2EC", color: "#1C1914" },
  chalk: { background: "#F8F6F1", color: "#1C1914" },
  ink: { background: CB_INK.bg, color: CB_INK.ink },
};

export const WebSlide: React.FC<{
  id: string;
  label: string;
  lang: UpdateLang;
  tone?: WebSlideTone;
  bleed?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ id, label, lang, tone = "paper", bleed, children, className = "" }) => {
  const { scale, availableHeight, layout } = useContext(DeckScaleContext);
  const palette = TONE[tone];
  const fluid = layout === "fluid";

  return (
    <div
      className={`investor-slide-slot${fluid ? " investor-slide-slot--fluid" : ""}`}
      style={{ minHeight: fluid ? undefined : availableHeight }}
    >
      <div
        className="investor-slide-frame"
        style={
          fluid
            ? { width: "100%", height: "auto" }
            : { width: WEB_SLIDE.width * scale, height: WEB_SLIDE.height * scale }
        }
      >
        <section
          id={id}
          aria-label={label}
          data-pdf-slide="true"
          dir="ltr"
          lang={lang}
          className={`deck-slide investor-slide-canvas ${className}`}
          style={{
            position: "relative",
            width: fluid ? "100%" : WEB_SLIDE.width,
            height: fluid ? "auto" : WEB_SLIDE.height,
            minHeight: fluid
              ? "calc(100dvh - 60px - env(safe-area-inset-top, 0px))"
              : undefined,
            overflow: fluid ? "hidden" : "hidden",
            background: palette.background,
            color: palette.color,
            transform: fluid ? undefined : `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {bleed}
          <div
            data-slide-safe-area="true"
            dir={lang === "he" ? "rtl" : "ltr"}
            style={
              fluid
                ? undefined
                : {
                    position: "absolute",
                    inset: `${WEB_SLIDE.safeY}px ${WEB_SLIDE.safeX}px`,
                    overflow: "hidden",
                  }
            }
          >
            {children}
          </div>
        </section>
      </div>
    </div>
  );
};
