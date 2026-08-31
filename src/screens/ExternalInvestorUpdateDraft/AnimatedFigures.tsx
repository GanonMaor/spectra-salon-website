import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";

/** Slow last-mile settle: most of the travel happens early, then it eases onto the figure. */
const EASE_OUT = (t: number) => 1 - (1 - t) ** 5;
const START_RATIO = 0.84;

export type ParsedMetric = {
  prefix: string;
  number: number;
  decimals: number;
  suffix: string;
  grouped: boolean;
};

/** Parse investor metric strings such as 170+, $130K, 32.3M, 4.6x, 1,476. */
export const parseMetric = (raw: string): ParsedMetric | null => {
  const match = raw.trim().match(/^(\$?)([\d,]+(?:\.\d+)?)([A-Za-z+%x×]*)$/);
  if (!match) return null;
  const [, prefix, digits, suffix] = match;
  const grouped = digits.includes(",");
  const decimals = digits.includes(".") ? (digits.split(".")[1]?.length ?? 0) : 0;
  const number = Number.parseFloat(digits.replace(/,/g, ""));
  if (!Number.isFinite(number)) return null;
  return { prefix, number, decimals, suffix, grouped };
};

export const formatMetric = (parsed: ParsedMetric, current: number): string => {
  const rounded =
    parsed.decimals > 0 ? current.toFixed(parsed.decimals) : String(Math.round(current));
  const [intPart, decPart] = rounded.split(".");
  const groupedInt = parsed.grouped ? Number(intPart).toLocaleString("en-US") : intPart;
  return `${parsed.prefix}${groupedInt}${decPart != null ? `.${decPart}` : ""}${parsed.suffix}`;
};

export const useInViewOnce = (
  ref: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  options?: { threshold?: number; rootMargin?: string },
): boolean => {
  const [seen, setSeen] = useState(!enabled);

  useEffect(() => {
    if (!enabled || seen) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      {
        threshold: options?.threshold ?? 0.35,
        rootMargin: options?.rootMargin ?? "0px 0px -8% 0px",
      },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, options?.rootMargin, options?.threshold, ref, seen]);

  return seen;
};

type AnimatedMetricProps = {
  value: string;
  duration?: number;
  delay?: number;
  className?: string;
};

/**
 * A quiet last-mile count. The figure is already near its value, then
 * settles onto it slowly. Print, PDF and reduced-motion see the final number.
 */
export const AnimatedMetric: React.FC<AnimatedMetricProps> = ({
  value,
  duration = 2600,
  delay = 0,
  className = "",
}) => {
  const parsed = useMemo(() => parseMetric(value), [value]);
  const pdfExport = usePdfExportMode();
  const reducedMotion = Boolean(useReducedMotion()) || pdfExport;
  const ref = useRef<HTMLSpanElement>(null);
  const active = useInViewOnce(ref, Boolean(parsed) && !reducedMotion);
  const [display, setDisplay] = useState(() =>
    parsed && !reducedMotion ? formatMetric(parsed, parsed.number * START_RATIO) : value,
  );

  useEffect(() => {
    if (!parsed || reducedMotion || !active) return;

    let frame = 0;
    let start: number | undefined;
    const wait = window.setTimeout(() => {
      const tick = (now: number) => {
        if (start === undefined) start = now;
        const progress = Math.min((now - start) / duration, 1);
        const current = parsed.number * (START_RATIO + (1 - START_RATIO) * EASE_OUT(progress));
        setDisplay(formatMetric(parsed, current));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
        else setDisplay(value);
      };
      frame = window.requestAnimationFrame(tick);
    }, delay);

    return () => {
      window.clearTimeout(wait);
      window.cancelAnimationFrame(frame);
    };
  }, [active, delay, duration, parsed, reducedMotion, value]);

  if (!parsed) return <span className={className}>{value}</span>;

  return (
    <span
      ref={ref}
      dir="ltr"
      className={`inline-block tabular-nums ${className}`}
      aria-label={value}
      style={{ minWidth: `${value.length}ch` }}
    >
      {display}
    </span>
  );
};

type ChartRevealProps = {
  reducedMotion: boolean;
  className?: string;
  children: (active: boolean) => React.ReactNode;
};

/** Tells a chart when it has arrived, once. */
export const ChartReveal: React.FC<ChartRevealProps> = ({ reducedMotion, className = "", children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInViewOnce(ref, !reducedMotion, { threshold: 0.28 });
  return (
    <div ref={ref} className={className}>
      {children(active)}
    </div>
  );
};

export const chartEase = "cubic-bezier(0.22, 1, 0.36, 1)";
