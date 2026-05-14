import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertTriangle,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useSiteTheme } from "../../../contexts/SiteTheme";
import { useCrmLocale, useCrmT } from "../../SalonCRM/i18n/CrmLocale";
import type { CrmTranslations } from "../../SalonCRM/i18n/translations";
import type {
  AIInsight,
  AIInsightCta,
  AIInsightSeverity,
  AIInsightType,
} from "../../SalonCRM/data/crmSelectors";
import { EMPTY_STATE_INSIGHT } from "../aiInsightPrioritization";

const DRAG_THRESHOLD_PX = 48;
const DEFAULT_AUTOPLAY_MS = 6000;

export interface AIInsightsCarouselProps {
  /**
   * Already-prioritized insights. The carousel never re-orders or
   * randomizes the input — that responsibility lives in
   * `getPrioritizedInsights`.
   */
  insights: AIInsight[];
  /** Override for the empty state card. */
  emptyState?: AIInsight;
  /** Triggered when the user taps a primary or secondary CTA. */
  onInsightAction?: (insight: AIInsight, cta: AIInsightCta) => void;
  /** Triggered when the empty state's "Ask Alice" CTA is tapped. */
  onAskAlice?: () => void;
  /** Auto-advance through cards when idle. Defaults to true. */
  autoPlay?: boolean;
  /** Auto-advance interval in ms. */
  autoPlayMs?: number;
  /**
   * Notified whenever the active card changes (swipe, autoplay, or
   * external prop reset). Lets the host record a
   * `lastPresentedInsightId` so subsequent prioritizations don't
   * surface the same card again.
   */
  onActiveInsightChange?: (insight: AIInsight) => void;
}

/**
 * One-card-at-a-time carousel for AI insights.
 *
 * Behavior summary:
 *   - Always shows exactly one card.
 *   - Swipe / drag to move; pagination dots reflect position.
 *   - Optional autoplay pauses while the user touches, drags, or
 *     focuses a CTA.
 *   - When `insights` is empty, renders the calm empty-state card
 *     and surfaces "Ask Alice" instead of fake urgency.
 *   - Order is fully driven by the parent. No internal sort.
 */
const AIInsightsCarousel: React.FC<AIInsightsCarouselProps> = ({
  insights,
  emptyState = EMPTY_STATE_INSIGHT,
  onInsightAction,
  onAskAlice,
  autoPlay = true,
  autoPlayMs = DEFAULT_AUTOPLAY_MS,
  onActiveInsightChange,
}) => {
  const { isDark } = useSiteTheme();
  const { isRTL } = useCrmLocale();
  const t = useCrmT();
  const aiT = t.ai;

  const cards = useMemo<AIInsight[]>(
    () => (insights.length > 0 ? insights : [emptyState]),
    [insights, emptyState],
  );
  const isEmpty = insights.length === 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const [dragDx, setDragDx] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const dragOriginRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lastNotifiedIdRef = useRef<string | null>(null);

  // Keep activeIndex in range when the deck changes.
  useEffect(() => {
    setActiveIndex((idx) => Math.min(idx, Math.max(0, cards.length - 1)));
  }, [cards.length]);

  // Notify parent of the visible card — but only when its id actually
  // changes. The `cards` memo gets a new reference every parent render
  // (prioritization recomputes), so an unguarded effect would fire on
  // every pass and create a setState/render feedback loop.
  useEffect(() => {
    const current = cards[activeIndex];
    if (!current) return;
    if (lastNotifiedIdRef.current === current.id) return;
    lastNotifiedIdRef.current = current.id;
    onActiveInsightChange?.(current);
  }, [activeIndex, cards, onActiveInsightChange]);

  const goTo = useCallback(
    (next: number) => {
      if (cards.length === 0) return;
      const wrapped = ((next % cards.length) + cards.length) % cards.length;
      setActiveIndex(wrapped);
    },
    [cards.length],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

  // Autoplay — paused while interacting, dragging, or empty.
  useEffect(() => {
    if (!autoPlay || cards.length <= 1 || isInteracting) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % cards.length);
    }, autoPlayMs);
    return () => window.clearInterval(id);
  }, [autoPlay, autoPlayMs, cards.length, isInteracting]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (cards.length <= 1) return;
    dragOriginRef.current = e.clientX;
    setIsInteracting(true);
    setDragDx(0);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }, [cards.length]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragOriginRef.current == null) return;
    setDragDx(e.clientX - dragOriginRef.current);
  }, []);

  const finishDrag = useCallback((dx: number) => {
    if (Math.abs(dx) >= DRAG_THRESHOLD_PX) {
      const direction = dx < 0 ? 1 : -1;
      // Honor RTL: a left swipe in RTL means previous in reading order.
      goTo(activeIndex + (isRTL ? -direction : direction));
    }
    dragOriginRef.current = null;
    setDragDx(0);
    setIsInteracting(false);
  }, [activeIndex, goTo, isRTL]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (dragOriginRef.current == null) return;
    finishDrag(e.clientX - dragOriginRef.current);
  }, [finishDrag]);

  const handlePointerCancel = useCallback(() => {
    dragOriginRef.current = null;
    setDragDx(0);
    setIsInteracting(false);
  }, []);

  const handleCtaActivate = useCallback(
    (insight: AIInsight, cta: AIInsightCta) => {
      if (cta.actionKey === "alice.focusInput") {
        onAskAlice?.();
        return;
      }
      onInsightAction?.(insight, cta);
    },
    [onAskAlice, onInsightAction],
  );

  const activeCard = cards[activeIndex];
  if (!activeCard) return null;

  return (
    <section
      aria-label={aiT.insightsTitle}
      className={`relative rounded-2xl sm:rounded-3xl border backdrop-blur-xl px-3 py-3 sm:px-4 ${
        isDark
          ? "border-white/[0.08] bg-white/[0.035]"
          : "border-black/[0.05] bg-white/[0.68]"
      }`}
      style={{
        boxShadow: isDark
          ? "0 10px 30px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 10px 30px rgba(15,23,42,0.045), inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
    >
      <header className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-violet-500/12 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          </div>
          <p
            className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${
              isDark ? "text-white/50" : "text-black/50"
            }`}
          >
            {aiT.insightsTitle}
          </p>
        </div>
        {!isEmpty && cards.length > 1 && (
          <span
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          >
            {`${aiT.paginationCardLabel} ${activeIndex + 1} / ${cards.length}`}
          </span>
        )}
      </header>

      <div
        ref={containerRef}
        className="relative overflow-hidden touch-pan-y select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div
          className="flex transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: `translateX(calc(${
              isRTL ? activeIndex * 100 : -activeIndex * 100
            }% + ${dragDx}px))`,
            transitionDuration: dragOriginRef.current != null ? "0ms" : undefined,
          }}
        >
          {cards.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              isDark={isDark}
              onAction={handleCtaActivate}
              aiT={aiT}
            />
          ))}
        </div>
      </div>

      {!isEmpty && cards.length > 1 && (
        <div
          className="flex items-center justify-center gap-1.5 mt-4"
          role="tablist"
          aria-label={aiT.paginationLabel}
        >
          {cards.map((card, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={card.id}
                type="button"
                role="tab"
                aria-label={`${aiT.paginationCardLabel} ${i + 1} / ${cards.length}`}
                aria-selected={active}
                onClick={() => goTo(i)}
                onFocus={() => setIsInteracting(true)}
                onBlur={() => setIsInteracting(false)}
                className="group flex h-4 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 rounded-full"
              >
                <span
                  className={`block rounded-full transition-[width,background-color,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                    active
                      ? `h-1 w-5 ${isDark ? "bg-white" : "bg-[#1A1A1A]"}`
                      : `h-1 w-1 ${
                          isDark
                            ? "bg-white/25 group-hover:bg-white/55"
                            : "bg-black/15 group-hover:bg-black/40"
                        }`
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}

      <div className="sr-only">
        <button type="button" onClick={goPrev}>
          {`${aiT.paginationCardLabel} ${activeIndex === 0 ? cards.length : activeIndex}`}
        </button>
        <button type="button" onClick={goNext}>
          {`${aiT.paginationCardLabel} ${(activeIndex + 2 > cards.length ? 1 : activeIndex + 2)}`}
        </button>
      </div>
    </section>
  );
};

const InsightCard: React.FC<{
  insight: AIInsight;
  isDark: boolean;
  onAction: (insight: AIInsight, cta: AIInsightCta) => void;
  aiT: CrmTranslations["ai"];
}> = ({ insight, isDark, onAction, aiT }) => {
  const visuals = severityVisuals(insight.severity);
  const typeBadge = typeLabel(insight.type, aiT);

  return (
    <article
      className="w-full flex-shrink-0 px-1 sm:px-2"
      aria-label={insight.title}
    >
      <div
        className={`rounded-xl border px-4 py-4 sm:px-5 sm:py-5 ${
          isDark
            ? "border-white/[0.08] bg-white/[0.04]"
            : "border-black/[0.05] bg-black/[0.02]"
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ backgroundColor: visuals.accent.bg, color: visuals.accent.icon }}
          >
            <visuals.Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={`flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider ${
                isDark ? "text-white/45" : "text-black/45"
              }`}
            >
              <span>{typeBadge}</span>
              <span aria-hidden>·</span>
              <span style={{ color: visuals.accent.icon }}>
                {severityLabel(insight.severity, aiT)}
              </span>
            </div>
            <p
              className={`mt-1 text-[14px] sm:text-[15px] font-semibold leading-snug ${
                isDark ? "text-white" : "text-[#1A1A1A]"
              }`}
            >
              {insight.title}
            </p>
            <p
              className={`text-[12px] sm:text-[13px] leading-snug mt-1 ${
                isDark ? "text-white/65" : "text-black/60"
              }`}
            >
              {insight.description}
            </p>
            {(insight.ctaPrimary || insight.ctaSecondary) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {insight.ctaPrimary && (
                  <button
                    type="button"
                    onClick={() => onAction(insight, insight.ctaPrimary!)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                      isDark
                        ? "bg-white text-[#1A1A1A] hover:bg-white/90"
                        : "bg-[#1A1A1A] text-white hover:bg-black/85"
                    }`}
                  >
                    {insight.ctaPrimary.label}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                {insight.ctaSecondary && (
                  <button
                    type="button"
                    onClick={() => onAction(insight, insight.ctaSecondary!)}
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${
                      isDark
                        ? "bg-white/[0.06] text-white/80 hover:bg-white/[0.12]"
                        : "bg-black/[0.04] text-black/70 hover:bg-black/[0.08]"
                    }`}
                  >
                    {insight.ctaSecondary.label}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

function severityVisuals(severity: AIInsightSeverity) {
  switch (severity) {
    case "high":
      return {
        Icon: AlertTriangle,
        accent: { bg: "rgba(239,68,68,0.14)", icon: "#EF4444" },
      };
    case "medium":
      return {
        Icon: AlertTriangle,
        accent: { bg: "rgba(251,191,36,0.18)", icon: "#F59E0B" },
      };
    case "low":
    default:
      return {
        Icon: TrendingUp,
        accent: { bg: "rgba(16,185,129,0.16)", icon: "#10B981" },
      };
  }
}

function severityLabel(severity: AIInsightSeverity, aiT: CrmTranslations["ai"]): string {
  switch (severity) {
    case "high": return aiT.severityHigh;
    case "medium": return aiT.severityMedium;
    case "low": return aiT.severityLow;
  }
}

function typeLabel(type: AIInsightType, aiT: CrmTranslations["ai"]): string {
  switch (type) {
    case "inventory": return aiT.typeInventory;
    case "performance": return aiT.typePerformance;
    case "revenue": return aiT.typeRevenue;
    case "mix": return aiT.typeMix;
  }
}

export default AIInsightsCarousel;
