import React, { useEffect, useRef, useState } from "react";
import { usePdfExportMode } from "../../SpectraInvestorExperience/primitives";
import { CB, colorBarSans } from "../colorBarTokens";
import type { Localized, UpdateLang } from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";

const COPY = {
  headline: {
    en: "Real salons. Real services. Real usage.",
    he: "סלונים אמיתיים. שירותים אמיתיים. שימוש אמיתי.",
  },
  support: {
    en: "Across 12+ countries, Spectra became part of the real salon workflow — measuring services as they happened.",
    he: "ב־12+ מדינות הפכה Spectra לחלק מתהליך העבודה האמיתי בסלון — ומדדה שירותים ברגע שהתרחשו.",
  },
  index: { en: "07 — Proof at scale", he: "07 — הוכחה בקנה מידה" },
  stripLabel: {
    en: "Customer footage of Spectra in real salon work",
    he: "צילומי לקוחות של Spectra בעבודה אמיתית בסלון",
  },
} as const;

const METRICS = [
  { value: "300+", label: { en: "Salons in real use", he: "סלונים בשימוש אמיתי" } },
  { value: "12+", label: { en: "Countries", he: "מדינות" } },
  { value: "617K+", label: { en: "Color services measured", he: "שירותי צבע שנמדדו" } },
  { value: "34M+ g", label: { en: "Professional materials measured", he: "חומרים מקצועיים שנמדדו" } },
] as const;

const PROOFS = [
  {
    video: "/instagram-reel2.mp4",
    poster: "/investor/media/adoption-proof/01-color-station.jpg",
    position: "48% 42%",
    alt: {
      en: "A colorist at a salon station using a Spectra tablet and digital scale during a mix",
      he: "צבעית בעמדת סלון משתמשת בטאבלט Spectra ובמשקל דיגיטלי במהלך ערבוב",
    },
  },
  {
    video: "/instagram-reel4.mp4",
    poster: "/investor/media/adoption-proof/02-mix-interface.jpg",
    position: "50% 46%",
    alt: {
      en: "Spectra mix screen showing a live ounce measurement during a color service",
      he: "מסך ערבוב של Spectra מציג מדידה חיה באונקיות במהלך שירות צבע",
    },
  },
  {
    video: "/instagram-reel5.mp4",
    poster: "/investor/media/adoption-proof/03-materials-measured.jpg",
    position: "50% 40%",
    alt: {
      en: "A hand measuring lightener on a scale beside a Spectra tablet reading zero grams",
      he: "יד מודדת בהיר על משקל לצד טאבלט Spectra שמראה אפס גרם",
    },
  },
  {
    video: "/instagram-reel3.mp4",
    poster: "/customers/kendall.jpg",
    position: "50% 42%",
    alt: {
      en: "A Spectra tablet showing 15.5 grams of a 46.5 gram formula during a live mix",
      he: "טאבלט Spectra מציג 15.5 גרם מתוך פורמולה של 46.5 גרם בזמן ערבוב חי",
    },
  },
] as const;

const text = (value: Localized, lang: UpdateLang) => value[lang];

const mediaFill: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const ProofStrip: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const pdfExport = usePdfExportMode();
  const [reducedMotion, setReducedMotion] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const playVideos = !pdfExport && !reducedMotion;

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const root = stripRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return;
    if (!playVideos) {
      videoRefs.current.forEach((video) => video?.pause());
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        videoRefs.current.forEach((video) => {
          if (!video) return;
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      },
      { threshold: 0.2 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [playVideos]);

  return (
    <div
      ref={stripRef}
      role="group"
      aria-label={text(COPY.stripLabel, lang)}
      className="deck-quad deck-media-band"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 12,
        flex: "1 1 auto",
        minHeight: 0,
        height: 0,
        marginTop: 40,
      }}
    >
      {PROOFS.map((proof, index) => (
        <figure
          key={proof.video}
          style={{
            margin: 0,
            minWidth: 0,
            minHeight: 0,
            height: "100%",
            overflow: "hidden",
            background: CB.well,
            outline: `1px solid ${CB.lineStrong}`,
            outlineOffset: -1,
          }}
        >
          {playVideos ? (
            <video
              ref={(node) => {
                videoRefs.current[index] = node;
              }}
              src={proof.video}
              poster={proof.poster}
              aria-label={text(proof.alt, lang)}
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              style={{ ...mediaFill, objectPosition: proof.position, pointerEvents: "none" }}
            />
          ) : (
            <img
              src={proof.poster}
              alt={text(proof.alt, lang)}
              width={720}
              height={1000}
              decoding="sync"
              style={{ ...mediaFill, objectPosition: proof.position }}
            />
          )}
        </figure>
      ))}
    </div>
  );
};

export const AdoptionScaleWebSlide: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const hebrew = lang === "he";

  return (
    <WebSlide
      id="web-deck-adoption-scale"
      label={text(COPY.headline, lang)}
      lang={lang}
      tone="paper"
      className="web-deck-adoption-scale"
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: colorBarSans(lang),
          color: CB.ink,
        }}
      >
        <header style={{ flex: "0 0 auto" }}>
          <span
            aria-hidden="true"
            style={{ display: "block", width: 58, height: 3, background: CB.copper }}
          />
          <h2
            style={{
              margin: "22px 0 0",
              maxWidth: hebrew ? 980 : 1120,
              color: CB.ink,
              fontSize: hebrew ? 52 : 58,
              fontWeight: 600,
              lineHeight: 1.06,
              letterSpacing: hebrew ? "-0.03em" : "-0.046em",
            }}
          >
            {text(COPY.headline, lang)}
          </h2>
          <p
            style={{
              margin: "18px 0 0",
              maxWidth: hebrew ? 860 : 980,
              color: CB.muted,
              fontSize: hebrew ? 21 : 22,
              fontWeight: 400,
              lineHeight: 1.42,
              letterSpacing: hebrew ? "-0.008em" : "-0.016em",
            }}
          >
            {hebrew ? (
              <>
                ב־12+ מדינות הפכה
                {" "}
                <span dir="ltr">Spectra</span>
                {" "}
                לחלק מתהליך העבודה האמיתי בסלון — ומדדה שירותים ברגע שהתרחשו.
              </>
            ) : (
              text(COPY.support, lang)
            )}
          </p>
        </header>

        <dl
          className="deck-quad"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            columnGap: 36,
            margin: "48px 0 0",
            padding: "28px 0 0",
            borderTop: `1px solid ${CB.lineStrong}`,
          }}
        >
          {METRICS.map((item, index) => (
            <div
              key={item.value}
              style={{
                minWidth: 0,
                paddingInlineStart: index === 0 ? 0 : 28,
                borderInlineStart: index === 0 ? undefined : `1px solid ${CB.lineStrong}`,
              }}
            >
              <dd
                dir="ltr"
                className="deck-metric"
                style={{
                  margin: 0,
                  color: CB.copper,
                  fontSize: hebrew ? 58 : 64,
                  fontWeight: 600,
                  lineHeight: 0.92,
                  letterSpacing: "-0.052em",
                  fontVariantNumeric: "tabular-nums",
                  whiteSpace: "nowrap",
                }}
              >
                {item.value}
              </dd>
              <dt
                style={{
                  marginTop: 14,
                  maxWidth: 240,
                  color: CB.muted,
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  letterSpacing: hebrew ? "0.06em" : "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {text(item.label, lang)}
              </dt>
            </div>
          ))}
        </dl>

        <ProofStrip lang={lang} />

        <footer
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 16,
          }}
        >
          <p
            dir="ltr"
            style={{
              margin: 0,
              color: CB.faint,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {text(COPY.index, lang)}
          </p>
        </footer>
      </div>
    </WebSlide>
  );
};
