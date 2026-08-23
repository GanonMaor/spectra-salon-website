import React, { useEffect, useRef, useState } from "react";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";
import { FINAL_MOBILE, FINAL_OWNER_APP, type UpdateLang } from "./finalCopy";
import { OWNER_IPHONE_RATIO, OwnerIPhoneFrame } from "./OwnerIPhoneFrame";
import {
  Body,
  Caption,
  Chapter,
  Display,
  Kicker,
  PullQuote,
  Reveal,
  Rule,
  Spread,
  TermList,
  t as text,
} from "./EditorialPrimitives";

type SectionProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const SCREENS = FINAL_OWNER_APP.screens;

/** Two phones at a time. The three new business screens cycle as two pairs. */
const PAIRS = [
  [3, 4],
  [5, 3],
] as const;

const PHONE_WIDTH = "w-[min(42vw,16.25rem)]";
const FRAME_RATIO = OWNER_IPHONE_RATIO;
const HOLD_MS = 5800;
const FADE_MS = 820;
const HOLD_OUT_MS = 220;

const OwnerPhone: React.FC<{
  screen: (typeof SCREENS)[number];
  lang: UpdateLang;
}> = ({ screen, lang }) => (
  <div className={`${PHONE_WIDTH} shrink-0`}>
    <div
      className="relative"
      style={{
        aspectRatio: FRAME_RATIO,
        filter: "drop-shadow(0 16px 28px rgba(23, 17, 13, 0.24))",
      }}
    >
      <OwnerIPhoneFrame>
        <img
          src={screen.image}
          alt={text(screen.alt, lang)}
          width={1206}
          height={2622}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </OwnerIPhoneFrame>
    </div>
    <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#2b221b]/55">
      {text(screen.label, lang)}
    </p>
  </div>
);

/**
 * Two owner phones, shown as a pair. The pair fades out and back in.
 * Print and reduced-motion stay on the first pair; dots still switch.
 */
const OwnerScreenPairs: React.FC<{ lang: UpdateLang; animate: boolean }> = ({ lang, animate }) => {
  const [pairIndex, setPairIndex] = useState(0);
  const [opaque, setOpaque] = useState(true);
  const [inView, setInView] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const fadeTimer = useRef<number | null>(null);
  const fading = useRef(false);

  useEffect(() => {
    const node = frameRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.25,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const showPair = (next: number) => {
    if (next === pairIndex || fading.current) return;
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    if (!animate) {
      setPairIndex(next);
      setOpaque(true);
      return;
    }
    fading.current = true;
    setOpaque(false);
    fadeTimer.current = window.setTimeout(() => {
      setPairIndex(next);
      setOpaque(true);
      fading.current = false;
      fadeTimer.current = null;
    }, FADE_MS + HOLD_OUT_MS);
  };

  useEffect(() => {
    if (!animate || !inView) return;
    const timer = window.setInterval(() => {
      showPair((pairIndex + 1) % PAIRS.length);
    }, HOLD_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, inView, pairIndex]);

  useEffect(
    () => () => {
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    },
    [],
  );

  const pair = PAIRS[pairIndex];
  const left = SCREENS[pair[0]];
  const right = SCREENS[pair[1]];

  return (
    <div>
      <div
        ref={frameRef}
        data-owner-device="true"
        className="flex items-start justify-center gap-3 sm:gap-5"
        style={{
          opacity: opaque ? 1 : 0,
          transform: opaque ? "translateY(0)" : "translateY(12px)",
          transition: animate
            ? `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
            : "none",
        }}
      >
        <OwnerPhone screen={left} lang={lang} />
        <OwnerPhone screen={right} lang={lang} />
      </div>

      <div className="mx-auto mt-5 max-w-[22rem] text-center">
        <Caption>
          {text(left.note, lang)}
          <span aria-hidden="true" className="mx-2 text-[#b1844d]/50">
            ·
          </span>
          {text(right.note, lang)}
        </Caption>
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {PAIRS.map((entry, index) => (
            <button
              key={entry.join("-")}
              type="button"
              onClick={() => showPair(index)}
              aria-label={`${text(SCREENS[entry[0]].label, lang)}, ${text(SCREENS[entry[1]].label, lang)}`}
              aria-current={index === pairIndex}
              className="grid h-6 w-6 place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c19a63]"
            >
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full transition-colors"
                style={{
                  background: index === pairIndex ? "#8c6537" : "rgba(43,34,27,0.22)",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const OwnerCommandSpread: React.FC<SectionProps> = ({ lang, reducedMotion }) => {
  const pdfExport = usePdfExportMode();
  const o = FINAL_OWNER_APP;

  return (
    <Chapter id="owner-app" label={text(o.title, lang)} tone="warm" rhythm="pause">
      <Spread>
        <Reveal reducedMotion={reducedMotion}>
          <div className="mx-auto max-w-[34rem] text-center lg:mx-0 lg:max-w-[36rem] lg:text-start">
            <Kicker>{text(o.kicker, lang)}</Kicker>
            <Display lang={lang} size="feature" className="mx-auto mt-6 max-w-[15ch] lg:mx-0">
              {text(o.title, lang)}
            </Display>
            <Body className="mx-auto mt-7 max-w-[27rem] lg:mx-0">{text(o.body, lang)}</Body>

            <PullQuote lang={lang} size="chapter" className="mt-10 max-w-[30rem]">
              {text(o.pull, lang)}
            </PullQuote>

            <TermList items={FINAL_MOBILE.roles} lang={lang} className="mt-8 justify-center lg:justify-start" />
            <Body className="mt-2.5">{text(FINAL_MOBILE.line, lang)}</Body>
          </div>

          <div className="mt-10 lg:mt-12">
            <OwnerScreenPairs lang={lang} animate={!reducedMotion && !pdfExport} />
          </div>

          <Rule className="mt-8" />
          <Caption className="mt-5 max-w-[26rem]">{text(o.status, lang)}</Caption>
          <Caption className="mt-2 max-w-[28rem]">{text(o.screensCaption, lang)}</Caption>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default OwnerCommandSpread;
