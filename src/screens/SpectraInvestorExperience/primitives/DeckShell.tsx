import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { INV } from "../tokens";

export type DeckTone = "base" | "soft" | "warm" | "deep" | "gold";

const TONES: Record<DeckTone, string> = {
  base: INV.bg,
  soft: INV.bgSoft,
  warm: INV.bgWarm,
  deep: INV.bgDeep,
  gold: "#EFE4D0",
};

export interface DeckSlide {
  id: string;
  /** short label shown in the table of contents / menu */
  label: string;
  /** chapter grouping label for the agenda */
  group?: string;
  /** background tone for the whole slide */
  tone?: DeckTone;
  /** full-bleed slides (title / closing) skip the centered content frame */
  fullBleed?: boolean;
  node: React.ReactNode;
}

interface DeckContextValue {
  current: number;
  total: number;
  go: (index: number) => void;
  goToId: (id: string) => void;
  next: () => void;
  prev: () => void;
  slides: { id: string; label: string; group?: string }[];
}

const DeckContext = createContext<DeckContextValue | null>(null);

export const useDeck = (): DeckContextValue => {
  const ctx = useContext(DeckContext);
  if (!ctx) throw new Error("useDeck must be used inside DeckShell");
  return ctx;
};

interface DeckShellProps {
  slides: DeckSlide[];
  brand: string;
  confidential: string;
}

export const DeckShell: React.FC<DeckShellProps> = ({ slides, brand, confidential }) => {
  const total = slides.length;
  const [current, setCurrent] = useState(() => {
    if (typeof window === "undefined") return 0;
    const hashId = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    const hashIndex = slides.findIndex((slide) => slide.id === hashId);
    return hashIndex >= 0 ? hashIndex : 0;
  });
  const [menuOpen, setMenuOpen] = useState(false);

  const go = useCallback(
    (index: number) => {
      setCurrent((prev) => {
        const clamped = Math.max(0, Math.min(total - 1, index));
        return clamped === prev ? prev : clamped;
      });
      setMenuOpen(false);
    },
    [total],
  );

  const goToId = useCallback(
    (id: string) => {
      const idx = slides.findIndex((s) => s.id === id);
      if (idx >= 0) go(idx);
    },
    [slides, go],
  );

  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  useEffect(() => {
    const activeId = slides[current]?.id;
    if (!activeId || typeof window === "undefined") return;

    const nextHash = `#${encodeURIComponent(activeId)}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
    }
  }, [current, slides]);

  useEffect(() => {
    const onHashChange = () => {
      const hashId = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      const idx = slides.findIndex((slide) => slide.id === hashId);
      if (idx >= 0) setCurrent(idx);
    };

    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [slides]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(total - 1);
      } else if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, total]);

  // Touch swipe navigation
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
      // Trigger only when clearly horizontal (dx > 40px and more horizontal than vertical)
      if (Math.abs(dx) > 40 && Math.abs(dx) > dy * 1.5) {
        if (dx < 0) next();
        else prev();
      }
    },
    [next, prev],
  );

  const ctxValue = useMemo<DeckContextValue>(
    () => ({
      current,
      total,
      go,
      goToId,
      next,
      prev,
      slides: slides.map(({ id, label, group }) => ({ id, label, group })),
    }),
    [current, total, go, goToId, next, prev, slides],
  );

  const progress = total > 1 ? (current / (total - 1)) * 100 : 100;
  const currentDark = slides[current]?.tone === "deep";
  const footMuted = currentDark ? "rgba(251,246,239,0.7)" : INV.textMuted;
  const footFaint = currentDark ? "rgba(251,246,239,0.4)" : INV.textFaint;
  const headerBg = currentDark ? "rgba(18,14,11,0.72)" : "rgba(244,238,230,0.72)";
  const headerBorder = currentDark ? "rgba(255,255,255,0.10)" : INV.border;
  const brandColor = currentDark ? INV.textOnDark : INV.text;
  const menuBorderColor = currentDark ? "rgba(255,255,255,0.22)" : INV.borderStrong;
  const menuColor = currentDark ? INV.textOnDark : INV.text;

  return (
    <DeckContext.Provider value={ctxValue}>
      <main
        role="main"
        className="font-sans antialiased relative overflow-hidden"
        style={{ background: INV.bg, height: "100dvh", width: "100vw" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Top chrome */}
        <header
          className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 sm:px-10 h-11 transition-colors duration-300"
          style={{
            background: headerBg,
            backdropFilter: "blur(20px) saturate(140%)",
            WebkitBackdropFilter: "blur(20px) saturate(140%)",
            borderBottom: `1px solid ${headerBorder}`,
          }}
        >
          <button
            type="button"
            onClick={() => go(0)}
            className="max-w-[40vw] truncate text-[10px] font-medium uppercase transition-colors duration-300 tracking-[0.26em] sm:max-w-none"
            style={{ color: brandColor, opacity: 0.72 }}
          >
            {brand}
          </button>

          <div className="flex items-center gap-4">
            <span
              className="text-[10px] font-light uppercase hidden md:inline tracking-[0.18em]"
              style={{ color: currentDark ? "rgba(217,185,129,0.55)" : INV.gold }}
            >
              {confidential}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full transition-all duration-200"
              style={{
                color: menuColor,
                border: `1px solid ${menuOpen ? menuBorderColor : currentDark ? "rgba(255,255,255,0.18)" : INV.border}`,
                background: menuOpen ? "rgba(193,154,99,0.14)" : "transparent",
                opacity: menuOpen ? 1 : 0.8,
                padding: "5px 12px",
              }}
            >
              {/* Mobile: icon only */}
              <span className="sm:hidden">
                {menuOpen ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="15" height="11" viewBox="0 0 15 11" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                    <line x1="0" y1="1" x2="15" y2="1" />
                    <line x1="0" y1="5.5" x2="15" y2="5.5" />
                    <line x1="0" y1="10" x2="15" y2="10" />
                  </svg>
                )}
              </span>
              {/* sm+: text */}
              <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-[0.18em]">
                {menuOpen ? "Close" : "Contents"}
              </span>
            </button>
          </div>
        </header>

        {/* Progress bar */}
        <div className="absolute top-11 left-0 right-0 z-40 h-px" style={{ background: "rgba(43,34,27,0.06)" }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${INV.gold}, ${INV.goldDeep})` }}
          />
        </div>

        {/* Slide track */}
        <div
          className="flex h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(calc(${current} * -100vw))` }}
        >
          {slides.map((slide) => (
            <section
              key={slide.id}
              aria-label={slide.label}
              aria-hidden={slides[current].id !== slide.id}
              className="shrink-0 h-full overflow-y-auto overflow-x-hidden"
              style={{
                width: "100vw",
                background: TONES[slide.tone ?? "base"],
                WebkitOverflowScrolling: "touch",
              }}
            >
              {slide.fullBleed ? (
                <div className="min-h-full w-full lg:h-full">{slide.node}</div>
              ) : (
                <div className="min-h-full w-full flex items-center pt-16 pb-20">
                  <div className="w-full">{slide.node}</div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Bottom navigation */}
        <footer className="absolute bottom-0 left-0 right-0 z-40 flex items-center justify-between px-5 sm:px-8 h-16 pointer-events-none">
          <span
            className="text-xs font-medium tabular-nums pointer-events-auto"
            style={{ color: footMuted, letterSpacing: "0.1em" }}
          >
            {String(current + 1).padStart(2, "0")}
            <span style={{ color: footFaint }}> / {String(total).padStart(2, "0")}</span>
          </span>

          <div className="flex items-center gap-3 pointer-events-auto">
            <NavButton onClick={prev} disabled={current === 0} label="Previous slide" dir="prev" dark={currentDark} />
            <NavButton onClick={next} disabled={current === total - 1} label="Next slide" dir="next" dark={currentDark} />
          </div>
        </footer>

        {/* Contents overlay */}
        {menuOpen && (
          <ContentsOverlay
            slides={slides}
            current={current}
            onSelect={go}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </main>
    </DeckContext.Provider>
  );
};

const NavButton: React.FC<{
  onClick: () => void;
  disabled: boolean;
  label: string;
  dir: "prev" | "next";
  dark?: boolean;
}> = ({ onClick, disabled, label, dir, dark = false }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
    style={{
      border: `1px solid ${dark ? "rgba(255,255,255,0.28)" : INV.borderStrong}`,
      background: disabled ? "transparent" : dark ? "rgba(255,255,255,0.1)" : "rgba(255,253,250,0.7)",
      color: disabled ? (dark ? "rgba(251,246,239,0.4)" : INV.textFaint) : dark ? INV.textOnDark : INV.text,
      opacity: disabled ? 0.4 : 1,
      cursor: disabled ? "default" : "pointer",
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {dir === "next" ? (
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  </button>
);

const ContentsOverlay: React.FC<{
  slides: DeckSlide[];
  current: number;
  onSelect: (i: number) => void;
  onClose: () => void;
}> = ({ slides, current, onSelect, onClose }) => (
  <div
    className="absolute inset-0 z-50 overflow-y-auto"
    style={{ background: "rgba(244,238,230,0.96)", backdropFilter: "blur(20px)" }}
    onClick={onClose}
  >
    <div
      className="max-w-3xl mx-auto px-6 sm:px-10 pt-20 pb-16"
      onClick={(e) => e.stopPropagation()}
    >
      <p
        className="text-[11px] font-semibold uppercase mb-8"
        style={{ letterSpacing: "0.22em", color: INV.gold }}
      >
        Contents
      </p>
      <ol className="space-y-1">
        {slides.map((slide, i) => (
          <li key={slide.id}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              className="w-full flex items-baseline gap-4 py-2.5 text-left group"
            >
              <span
                className="text-xs tabular-nums w-6 shrink-0"
                style={{ color: i === current ? INV.gold : INV.textFaint }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="text-lg sm:text-xl font-light transition-colors"
                style={{ color: i === current ? INV.gold : INV.text }}
              >
                {slide.label}
              </span>
              {slide.group && (
                <span className="ml-auto text-[10px] uppercase tracking-[0.14em] self-center" style={{ color: INV.textFaint }}>
                  {slide.group}
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>
    </div>
  </div>
);
