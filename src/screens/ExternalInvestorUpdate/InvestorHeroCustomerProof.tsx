import React, { useCallback, useEffect, useRef, useState } from "react";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";
import { CB } from "./colorBarTokens";
import type { UpdateLang } from "./finalCopy";

type Props = {
  lang: UpdateLang;
  reducedMotion: boolean;
  /** Legacy flag from the dark chapter this rail used to live in. Inert. */
  dark?: boolean;
};

/**
 * Reels published by the customers themselves. Each one shows Spectra in use
 * rather than a portrait, so the rail reads as reportage. The still is a frame
 * from the same clip, which is why it doubles as the poster.
 */
const CUSTOMERS = [
  {
    name: "Summer",
    video: "/instagram-reel.mp4",
    poster: "/customers/summer.jpg",
    alt: {
      en: "A colorist registering a client in the Spectra app on her phone",
      he: "צבעית מרשמת לקוחה באפליקציית ספקטרה בטלפון",
    },
  },
  {
    name: "Kendall",
    video: "/instagram-reel3.mp4",
    poster: "/customers/kendall.jpg",
    alt: {
      en: "The Spectra tablet showing 15.5 grams of a 46.5 gram formula during a mix",
      he: "הטאבלט של ספקטרה מציג 15.5 גרם מתוך פורמולה של 46.5 גרם בזמן ערבוב",
    },
  },
  {
    name: "Serina Renee",
    video: "/instagram-reel4.mp4",
    poster: "/customers/serina.jpg",
    alt: {
      en: "A scanned colour tube and its measured weight and cost on the Spectra screen",
      he: "שפופרת צבע סרוקה עם המשקל והעלות שנמדדו על מסך ספקטרה",
    },
  },
  {
    name: "Bri Stangle",
    video: "/instagram-reel6.mp4",
    poster: "/customers/bri.jpg",
    alt: {
      en: "A busy salon floor during a Spectra colour education session",
      he: "רצפת סלון עמוסה במהלך הדרכת צבע של ספקטרה",
    },
  },
] as const;

const COPY = {
  soundOn: { en: "Turn sound on", he: "הפעלת קול" },
  soundOff: { en: "Turn sound off", he: "כיבוי קול" },
  hint: { en: "Tap for sound", he: "לחיצה לקול" },
  railLabel: {
    en: "Real professionals using Spectra",
    he: "אנשי מקצוע אמיתיים המשתמשים בספקטרה",
  },
  pause: { en: "Pause the clips", he: "עצירת הסרטונים" },
  play: { en: "Play the clips", he: "הפעלת הסרטונים" },
} as const;

const SpeakerIcon: React.FC<{ muted: boolean }> = ({ muted }) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
    <path
      d="M4 9.5h3L11.5 6v12L7 14.5H4z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    {muted ? (
      <path d="M16 9.5l4 5m0-5l-4 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    ) : (
      <>
        <path d="M15.5 9.2a4 4 0 010 5.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M18 7a7.5 7.5 0 010 10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    )}
  </svg>
);

const TransportIcon: React.FC<{ paused: boolean }> = ({ paused }) => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
    {paused ? <path d="M8 5.5l11 6.5-11 6.5z" /> : <path d="M8 5.5h3.2v13H8zm4.8 0H16v13h-3.2z" />}
  </svg>
);

export const InvestorHeroCustomerProof: React.FC<Props> = ({ lang, reducedMotion }) => {
  const pdfExport = usePdfExportMode();
  // Print and reduced-motion readers get the still frame, never a moving image.
  const stillsOnly = pdfExport || reducedMotion;

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [unmuted, setUnmuted] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  /** Nothing downloads until a clip is actually on screen. */
  useEffect(() => {
    if (stillsOnly || typeof IntersectionObserver === "undefined") return;
    const observers = videoRefs.current.map((video) => {
      if (!video) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!video.getAttribute("src")) {
              const source = video.dataset.src;
              if (source) video.setAttribute("src", source);
            }
            if (!pausedRef.current) video.play().catch(() => {});
          } else {
            video.pause();
          }
        },
        { threshold: 0.35 },
      );
      observer.observe(video);
      return observer;
    });
    return () => observers.forEach((observer) => observer?.disconnect());
  }, [stillsOnly]);

  const toggleSound = useCallback(
    (index: number) => {
      const video = videoRefs.current[index];
      if (!video) return;
      if (unmuted === index) {
        video.muted = true;
        setUnmuted(null);
        return;
      }
      videoRefs.current.forEach((other) => {
        if (other) other.muted = true;
      });
      video.muted = false;
      video.play().catch(() => {});
      setUnmuted(index);
    },
    [unmuted],
  );

  /** One switch for the whole rail, so the motion is never unstoppable. */
  const toggleTransport = useCallback(() => {
    setPaused((wasPaused) => {
      const next = !wasPaused;
      pausedRef.current = next;
      videoRefs.current.forEach((video) => {
        if (!video) return;
        if (next) video.pause();
        else video.play().catch(() => {});
      });
      return next;
    });
  }, []);

  return (
    <div>
      {!stillsOnly && (
        <div className="mb-3 flex items-center justify-end">
          <button
            type="button"
            onClick={toggleTransport}
            aria-pressed={paused}
            aria-label={paused ? COPY.play[lang] : COPY.pause[lang]}
            className="inline-flex min-h-11 items-center gap-2 rounded-[12px] border px-3.5 text-[10px] font-extrabold uppercase tracking-[0.14em] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A37D38]"
            style={{ borderColor: CB.lineStrong, backgroundColor: CB.paper, color: CB.copperDeep }}
          >
            <TransportIcon paused={paused} />
            {paused ? COPY.play[lang] : COPY.pause[lang]}
          </button>
        </div>
      )}

      <ul
        dir="ltr"
        aria-label={COPY.railLabel[lang]}
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4"
      >
        {CUSTOMERS.map((customer, index) => (
          <li key={customer.name} className="min-w-0">
            <figure className="group relative">
              <div
                className="relative aspect-[9/16] overflow-hidden rounded-[16px] border"
                style={{ backgroundColor: CB.well, borderColor: CB.line }}
              >
                {stillsOnly ? (
                  <img
                    src={customer.poster}
                    alt={customer.alt[lang]}
                    width={900}
                    height={1600}
                    loading="eager"
                    decoding="sync"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <video
                      ref={(node) => {
                        videoRefs.current[index] = node;
                      }}
                      data-src={customer.video}
                      poster={customer.poster}
                      aria-label={customer.alt[lang]}
                      muted
                      loop
                      playsInline
                      preload="none"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => toggleSound(index)}
                      aria-label={unmuted === index ? COPY.soundOff[lang] : COPY.soundOn[lang]}
                      className="absolute end-2 top-2 grid h-11 w-11 place-items-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A37D38]"
                      style={{ borderColor: CB.lineStrong, backgroundColor: CB.paper, color: CB.ink }}
                    >
                      <SpeakerIcon muted={unmuted !== index} />
                    </button>
                  </>
                )}
              </div>

              <figcaption className="mt-2.5 flex items-baseline justify-between gap-2">
                <span
                  className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.1em]"
                  style={{ color: CB.ink }}
                >
                  {customer.name}
                </span>
                {!stillsOnly && (
                  <span
                    aria-hidden="true"
                    className="hidden shrink-0 text-[10px] font-semibold tracking-[0.08em] opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                    style={{ color: CB.copperDeep }}
                  >
                    {COPY.hint[lang]}
                  </span>
                )}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvestorHeroCustomerProof;
