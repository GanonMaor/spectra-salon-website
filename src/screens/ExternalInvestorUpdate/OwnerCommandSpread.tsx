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
const FRAME_RATIO = OWNER_IPHONE_RATIO;
const HOLD_MS = 6800;
const FADE_MS = 900;
const HOLD_OUT_MS = 280;

const OwnerScreenCycle: React.FC<{ lang: UpdateLang; animate: boolean }> = ({ lang, animate }) => {
  const [index, setIndex] = useState(0);
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
      threshold: 0.3,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const showScreen = (next: number) => {
    if (next === index || fading.current) return;
    if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    if (!animate) {
      setIndex(next);
      setOpaque(true);
      return;
    }
    fading.current = true;
    setOpaque(false);
    fadeTimer.current = window.setTimeout(() => {
      setIndex(next);
      setOpaque(true);
      fading.current = false;
      fadeTimer.current = null;
    }, FADE_MS + HOLD_OUT_MS);
  };

  useEffect(() => {
    if (!animate || !inView) return;
    const timer = window.setInterval(() => {
      showScreen((index + 1) % SCREENS.length);
    }, HOLD_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, inView, index]);

  useEffect(
    () => () => {
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    },
    [],
  );

  const active = SCREENS[index];
  /* Enter from the copy, not from below. Hebrew reads from the right. */
  const fromText = lang === "he" ? "12px" : "-12px";

  return (
    <div className="w-[min(36vw,11.75rem)] shrink-0 sm:w-[min(34vw,16.5rem)] lg:w-[min(32vw,18.25rem)]">
      <div
        ref={frameRef}
        data-owner-device="true"
        className="relative"
        style={{
          aspectRatio: FRAME_RATIO,
          opacity: opaque ? 1 : 0,
          transform: opaque ? "translateX(0)" : `translateX(${fromText})`,
          filter: "drop-shadow(0 18px 30px rgba(23, 17, 13, 0.24))",
          transition: animate
            ? `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
            : "none",
        }}
      >
        <OwnerIPhoneFrame>
          {SCREENS.map((screen, screenIndex) => (
            <img
              key={screen.key}
              src={screen.image}
              alt={screenIndex === index ? text(screen.alt, lang) : ""}
              aria-hidden={screenIndex !== index}
              width={1206}
              height={2622}
              loading={screenIndex === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ opacity: screenIndex === index ? 1 : 0 }}
            />
          ))}
        </OwnerIPhoneFrame>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2b221b]/62">
            {text(active.label, lang)}
          </p>
          <div className="flex shrink-0 items-center gap-0.5">
            {SCREENS.map((screen, screenIndex) => (
              <button
                key={screen.key}
                type="button"
                onClick={() => showScreen(screenIndex)}
                aria-label={text(screen.label, lang)}
                aria-current={screenIndex === index}
                className="grid h-5 w-5 place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c19a63]"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full transition-colors"
                  style={{
                    background: screenIndex === index ? "#8c6537" : "rgba(43,34,27,0.22)",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
        <Caption className="mt-1.5">{text(active.note, lang)}</Caption>
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
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-0 sm:gap-x-10 lg:gap-x-14">
            <div className="min-w-0">
              <Kicker>{text(o.kicker, lang)}</Kicker>
              <Display lang={lang} size="feature" className="mt-5 max-w-[14ch] sm:mt-6 sm:max-w-[15ch]">
                {text(o.title, lang)}
              </Display>
              <Body className="mt-5 max-w-[27rem] sm:mt-7">{text(o.body, lang)}</Body>

              <PullQuote lang={lang} size="chapter" className="mt-7 max-w-[28rem] sm:mt-10">
                {text(o.pull, lang)}
              </PullQuote>

              <TermList items={FINAL_MOBILE.roles} lang={lang} className="mt-6 sm:mt-8" />
              <Body className="mt-2.5">{text(FINAL_MOBILE.line, lang)}</Body>

              <Rule className="mt-6 sm:mt-8" />
              <Caption className="mt-4 max-w-[24rem] sm:mt-5">{text(o.status, lang)}</Caption>
              <Caption className="mt-2 max-w-[26rem]">{text(o.screensCaption, lang)}</Caption>
            </div>

            <OwnerScreenCycle lang={lang} animate={!reducedMotion && !pdfExport} />
          </div>
        </Reveal>
      </Spread>
    </Chapter>
  );
};

export default OwnerCommandSpread;
