import React, { useEffect, useRef, useState } from "react";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";
import { FINAL_MOBILE, FINAL_OWNER_APP, type UpdateLang } from "./finalCopy";
import { OWNER_IPHONE_RATIO, OwnerIPhoneFrame } from "./OwnerIPhoneFrame";
import { CB, CB_SHADOW } from "./colorBarTokens";
import { Sheet } from "./ColorBarPatterns";
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
  loc,
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

/** Labels for the playback control. Announced state, not just an icon. */
const CONTROL = {
  pause: loc("Pause the owner app screens", "השהיית מסכי אפליקציית הבעלים"),
  play: loc("Play the owner app screens", "הפעלת מסכי אפליקציית הבעלים"),
} as const;

/* The device carries the section, so it gets the only shadow on the page. */
const DEVICE_SHADOW = `drop-shadow(${CB_SHADOW.panel}) drop-shadow(${CB_SHADOW.card})`;

const PlaybackIcon: React.FC<{ paused: boolean }> = ({ paused }) => (
  <svg
    viewBox="0 0 12 12"
    aria-hidden="true"
    focusable="false"
    className="h-[11px] w-[11px]"
    fill={CB.ink}
  >
    {paused ? <path d="M2.5 1.2 10 6l-7.5 4.8Z" /> : <path d="M2.6 1.6h2.6v8.8H2.6Zm4.2 0h2.6v8.8H6.8Z" />}
  </svg>
);

const OwnerScreenCycle: React.FC<{ lang: UpdateLang; animate: boolean }> = ({ lang, animate }) => {
  const [index, setIndex] = useState(0);
  const [opaque, setOpaque] = useState(true);
  const [inView, setInView] = useState(false);
  const [paused, setPaused] = useState(false);
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
    if (!animate || !inView || paused) return;
    const timer = window.setInterval(() => {
      showScreen((index + 1) % SCREENS.length);
    }, HOLD_MS);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, inView, paused, index]);

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
    <div className="mx-auto w-full max-w-[19rem] sm:max-w-[23rem] lg:mx-0 lg:max-w-[25rem]">
      <Sheet>
        <div className="px-3 py-5 sm:px-7 sm:py-8">
          <div
            ref={frameRef}
            data-owner-device="true"
            className="relative mx-auto w-full max-w-[15rem] sm:max-w-[16.5rem]"
            style={{ aspectRatio: FRAME_RATIO, filter: DEVICE_SHADOW }}
          >
            <OwnerIPhoneFrame>
              <div
                className="absolute inset-0"
                style={{
                  opacity: opaque ? 1 : 0,
                  transform: opaque ? "translateX(0)" : `translateX(${fromText})`,
                  transition: animate
                    ? `opacity ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                    : "none",
                }}
              >
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
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ opacity: screenIndex === index ? 1 : 0 }}
                  />
                ))}
              </div>
            </OwnerIPhoneFrame>
          </div>
        </div>
      </Sheet>

      <div className="mt-5">
        <p
          className="text-[11px] font-extrabold uppercase leading-none tracking-[0.14em]"
          style={{ color: CB.copperDeep }}
        >
          {text(active.label, lang)}
        </p>
        <Caption className="mt-2">{text(active.note, lang)}</Caption>

        <div className="mt-3 border-t pt-1" style={{ borderColor: CB.line }}>
          <div className="-mx-2.5 flex flex-wrap items-center justify-between gap-y-1">
            {animate && (
              <button
                type="button"
                onClick={() => setPaused((current) => !current)}
                aria-label={text(paused ? CONTROL.play : CONTROL.pause, lang)}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A37D38]"
              >
                <span
                  aria-hidden="true"
                  className="grid h-8 w-8 place-items-center rounded-full border transition-colors"
                  style={{ borderColor: CB.lineStrong, backgroundColor: CB.paper }}
                >
                  <PlaybackIcon paused={paused} />
                </span>
              </button>
            )}

            <div className="flex items-center">
              {SCREENS.map((screen, screenIndex) => (
                <button
                  key={screen.key}
                  type="button"
                  onClick={() => showScreen(screenIndex)}
                  aria-label={text(screen.label, lang)}
                  aria-current={screenIndex === index}
                  className="grid h-11 w-11 place-items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A37D38]"
                >
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full transition-colors"
                    style={{
                      backgroundColor: screenIndex === index ? CB.copper : CB.well,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
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
          {/* The owner app is the subject here, so it takes the wider column. */}
          <div className="grid gap-11 lg:grid-cols-[0.44fr_0.56fr] lg:items-center lg:gap-14">
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
