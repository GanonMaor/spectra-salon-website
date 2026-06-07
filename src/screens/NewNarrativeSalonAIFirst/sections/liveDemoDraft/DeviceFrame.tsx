import React from "react";
import { motion, type TargetAndTransition, type Transition } from "framer-motion";
import { ACCENTS, INK } from "../../theme";

export const LIVE_DEMO_ASSET_BASE = "/investor-vision/salon-ai-live-demo";

export const LIVE_DEMO_ASSETS = {
  heroReception: `${LIVE_DEMO_ASSET_BASE}/hero-reception-bg.png`,
  productShelves: `${LIVE_DEMO_ASSET_BASE}/product-scan-shelves-bg.png`,
  colorBarScale: `${LIVE_DEMO_ASSET_BASE}/color-bar-scale-bg.png`,
  desktopOperationalHub: `${LIVE_DEMO_ASSET_BASE}/desktop-operational-hub.png`,
  desktopClientIntelligence: `${LIVE_DEMO_ASSET_BASE}/desktop-client-intelligence.png`,
  desktopMarketplaceSchedule: `${LIVE_DEMO_ASSET_BASE}/desktop-marketplace-schedule.png`,
  tabletColorIntelligence: `${LIVE_DEMO_ASSET_BASE}/tablet-color-mixing.png`,
  colorBarComposition: `${LIVE_DEMO_ASSET_BASE}/colorbar-ipad-composition.png`,
  inventoryComposition: `${LIVE_DEMO_ASSET_BASE}/inventory-ipad-composition.png`,
  mobileOwnerExecutive: `${LIVE_DEMO_ASSET_BASE}/mobile-owner-executive.png`,
  mobileAiTeam: `${LIVE_DEMO_ASSET_BASE}/mobile-ai-team.png`,
  mobileInventoryAgent: `${LIVE_DEMO_ASSET_BASE}/mobile-inventory-agent.png`,
  mobileSmartScheduling: `${LIVE_DEMO_ASSET_BASE}/mobile-smart-scheduling.png`,
} as const;

type DeviceKind = "desktop" | "tablet" | "phone";

interface DeviceFrameProps {
  src: string;
  alt: string;
  kind: DeviceKind;
  className?: string;
  priority?: boolean;
}

/** Soft diagonal screen glare shared by every device. */
const ScreenGlare: React.FC = () => (
  <div
    className="pointer-events-none absolute inset-0 z-20"
    style={{
      background:
        "linear-gradient(125deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.06) 100%)",
    }}
  />
);

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  src,
  alt,
  kind,
  className = "",
  priority = false,
}) => {
  const image = (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      draggable={false}
      className="h-full w-full object-cover"
    />
  );

  // ── Desktop — browser window with URL/chrome bar ───────────────────────────
  let device: React.ReactNode;
  if (kind === "desktop") {
    device = (
      <div
        className="relative flex w-full flex-col overflow-hidden"
        style={{
          borderRadius: "16px",
          aspectRatio: "16 / 10",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow:
            "0 44px 104px rgba(0,0,0,0.5), 0 8px 30px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.12)",
        }}
      >
        {/* Browser chrome */}
        <div
          className="flex shrink-0 items-center gap-3 px-4"
          style={{
            height: "9%",
            minHeight: "34px",
            background: "rgba(16,11,8,0.30)",
            backdropFilter: "blur(24px) saturate(140%)",
            WebkitBackdropFilter: "blur(24px) saturate(140%)",
            borderBottom: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          <div className="flex shrink-0 items-center gap-[6px]">
            <span className="block rounded-full" style={{ width: "10px", height: "10px", background: "#ff5f57" }} />
            <span className="block rounded-full" style={{ width: "10px", height: "10px", background: "#febc2e" }} />
            <span className="block rounded-full" style={{ width: "10px", height: "10px", background: "#28c840" }} />
          </div>
          <div className="flex flex-1 justify-center">
            <div
              className="flex items-center gap-2 rounded-full px-3"
              style={{
                height: "70%",
                minHeight: "20px",
                maxWidth: "62%",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                <rect x="5" y="11" width="14" height="9" rx="2" fill="rgba(217,185,129,0.9)" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="rgba(217,185,129,0.9)" strokeWidth="2" fill="none" />
              </svg>
              <span
                className="truncate font-medium tracking-wide"
                style={{ color: "rgba(255,255,255,0.72)", fontSize: "clamp(8px, 0.78vw, 12px)" }}
              >
                app.salon-ai.com
              </span>
            </div>
          </div>
          {/* right spacer to keep the URL pill optically centered */}
          <div className="shrink-0" style={{ width: "42px" }} aria-hidden />
        </div>
        {/* Screen */}
        <div className="relative flex-1 overflow-hidden" style={{ background: "#000" }}>
          {image}
          <ScreenGlare />
        </div>
      </div>
    );
  } else if (kind === "tablet") {
    // ── iPad — uniform dark bezel, aluminum edge, centered front camera ──────
    device = (
      <div
        className="relative w-full"
        style={{
          borderRadius: "30px",
          padding: "3.4%",
          background: "linear-gradient(150deg, #2b2825 0%, #100d0b 52%, #060504 100%)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow:
            "0 40px 96px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 0 0 1.5px rgba(0,0,0,0.7)",
        }}
      >
        <div
          className="absolute left-1/2 top-[1.6%] z-30 -translate-x-1/2 rounded-full"
          style={{
            width: "6px",
            height: "6px",
            background: "radial-gradient(circle at 40% 35%, #5b6b73, #0b0d0e)",
            boxShadow: "0 0 4px rgba(0,0,0,0.6)",
          }}
        />
        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: "18px",
            aspectRatio: "4 / 3",
            background: "#000",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.6)",
          }}
        >
          {image}
          <ScreenGlare />
        </div>
      </div>
    );
  } else {
    // ── Modern iPhone — titanium edge, Dynamic Island, side buttons ─────────
    device = (
      <div
        className="relative w-full"
        style={{
          borderRadius: "30px",
          padding: "3.1%",
          background: "linear-gradient(150deg, #3a352f 0%, #14110e 46%, #0a0807 100%)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow:
            "0 38px 90px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1.5px rgba(0,0,0,0.65)",
        }}
      >
        {/* Left edge — action + volume buttons */}
        <div className="absolute -left-[1.5px] top-[19%] rounded-l" style={{ width: "3px", height: "5%", background: "#27231d" }} />
        <div className="absolute -left-[1.5px] top-[30%] rounded-l" style={{ width: "3px", height: "9%", background: "#27231d" }} />
        <div className="absolute -left-[1.5px] top-[42%] rounded-l" style={{ width: "3px", height: "9%", background: "#27231d" }} />
        {/* Right edge — side button */}
        <div className="absolute -right-[1.5px] top-[34%] rounded-r" style={{ width: "3px", height: "13%", background: "#27231d" }} />

        <div
          className="relative overflow-hidden"
          style={{
            borderRadius: "24px",
            aspectRatio: "9 / 19.5",
            background: "#000",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.6)",
          }}
        >
          {image}
          <div
            className="absolute left-1/2 top-[1.7%] z-30 -translate-x-1/2 rounded-full"
            style={{
              width: "33%",
              height: "3.4%",
              minHeight: "16px",
              background: "#000",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          />
          <ScreenGlare />
        </div>
      </div>
    );
  }

  // Wrapper carries slide positioning + a grounding shadow so the device reads
  // as a staged product shot rather than a cutout floating over the photo.
  return (
    <div className={`relative ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: "-7%",
          width: "82%",
          height: "13%",
          background: "radial-gradient(closest-side, rgba(0,0,0,0.55), transparent 78%)",
          filter: "blur(14px)",
        }}
      />
      {device}
    </div>
  );
};

interface GlassAiCardProps {
  label: string;
  value: string;
  detail: string;
  accent?: string;
  className?: string;
  /** stronger dark background for cards sitting over bright imagery */
  strong?: boolean;
}

export const GlassAiCard: React.FC<GlassAiCardProps> = ({
  label,
  value,
  detail,
  accent = ACCENTS.gold.accent,
  className = "",
  strong = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    className={`rounded-2xl px-5 py-4 ${className}`}
    style={{
      background: strong ? "rgba(10,7,5,0.64)" : "rgba(16,11,8,0.48)",
      border: "1px solid rgba(255,255,255,0.20)",
      backdropFilter: "blur(24px) saturate(140%)",
      WebkitBackdropFilter: "blur(24px) saturate(140%)",
      boxShadow: "0 24px 66px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.14)",
    }}
  >
    <div className="mb-2 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 18px ${accent}` }} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: INK.faint }}>
        {label}
      </span>
    </div>
    <div className="text-xl font-light tracking-[-0.02em]" style={{ color: INK.strong }}>
      {value}
    </div>
    <div className="mt-1 text-xs leading-5" style={{ color: INK.soft }}>
      {detail}
    </div>
  </motion.div>
);

/** A single device or card placed on the cinematic stage. */
export interface StagePiece {
  key: string;
  node: React.ReactNode;
  /** absolute placement + width on the lg cinematic stage */
  desktopClass: string;
  /** width constraint when the piece is stacked on mobile */
  mobileClass?: string;
  initial?: TargetAndTransition;
  animate?: TargetAndTransition;
  transition?: Transition;
  style?: React.CSSProperties;
}

interface LiveDemoSlideProps {
  background: string;
  eyebrow: string;
  headline: string;
  takeaway: string;
  backgroundPosition?: string;
  devices: StagePiece[];
  cards: StagePiece[];
  /** optional extra rendered inside the desktop stage (e.g. labels) */
  desktopStageExtra?: React.ReactNode;
  /** optional extra appended to the mobile stack */
  mobileExtra?: React.ReactNode;
}

export const LiveDemoSlide: React.FC<LiveDemoSlideProps> = ({
  background,
  eyebrow,
  headline,
  takeaway,
  backgroundPosition = "center",
  devices,
  cards,
  desktopStageExtra,
  mobileExtra,
}) => {
  const textBlock = (
    <div>
      <div className="mb-5 flex items-center gap-3 lg:mb-6">
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: ACCENTS.gold.accent, boxShadow: `0 0 12px ${ACCENTS.gold.accent}` }}
        />
        <span
          className="h-px w-12"
          style={{ background: `linear-gradient(90deg, ${ACCENTS.gold.accent}, transparent)` }}
        />
        <span
          className="text-[11px] font-semibold uppercase tracking-[0.34em]"
          style={{ color: ACCENTS.gold.accent }}
        >
          {eyebrow}
        </span>
      </div>
      <h1
        className="max-w-[540px] text-[2.4rem] font-light leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-7xl lg:leading-[0.94]"
        style={{
          backgroundImage: "linear-gradient(168deg, #ffffff 0%, #f6ecda 48%, #e7c992 112%)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 4px 30px rgba(0,0,0,0.55))",
        }}
      >
        {headline}
      </h1>
      <div className="relative mt-6 max-w-md pl-6 lg:mt-8">
        <span
          aria-hidden
          className="absolute left-0 top-[6px] bottom-[6px] w-[2px] rounded-full"
          style={{
            background:
              "linear-gradient(180deg, rgba(217,185,129,0.95) 0%, rgba(217,185,129,0.35) 55%, rgba(217,185,129,0.04) 100%)",
            boxShadow: "0 0 18px rgba(217,185,129,0.55)",
          }}
        />
        <p
          className="text-base font-light leading-7 lg:text-lg lg:leading-8"
          style={{
            color: INK.soft,
            textShadow: "0 2px 26px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.7)",
          }}
        >
          {takeaway}
        </p>
      </div>
    </div>
  );

  return (
    <section className="relative min-h-full w-full overflow-hidden" aria-label={headline}>
      <div
        className="absolute inset-0 bg-cover"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(16,11,8,0.76) 0%, rgba(16,11,8,0.48) 42%, rgba(16,11,8,0.16) 100%), linear-gradient(180deg, rgba(16,11,8,0.14) 0%, rgba(16,11,8,0.56) 100%), url('" +
            background +
            "')",
          backgroundPosition,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 44% at 74% 42%, rgba(217,185,129,0.24), transparent 70%), radial-gradient(36% 44% at 18% 54%, rgba(224,153,106,0.18), transparent 70%)",
        }}
      />

      {/* ── Desktop cinematic stage (lg+) ─────────────────────────────────── */}
      <div className="relative z-10 hidden h-full grid-cols-12 items-center gap-8 px-8 pb-16 pt-20 sm:px-12 lg:grid lg:px-20">
        <div className="col-span-4">{textBlock}</div>
        <div className="relative col-span-8 h-[64vh] min-h-[440px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "repeating-radial-gradient(circle at 52% 46%, rgba(217,185,129,0.085) 0 1.5px, transparent 1.5px 70px)",
              maskImage: "radial-gradient(58% 58% at 52% 46%, #000 28%, transparent 76%)",
              WebkitMaskImage: "radial-gradient(58% 58% at 52% 46%, #000 28%, transparent 76%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "radial-gradient(40% 40% at 52% 46%, rgba(217,185,129,0.12), transparent 72%)",
            }}
          />
          {devices.map((p) => (
            <motion.div
              key={p.key}
              className={`absolute ${p.desktopClass}`}
              initial={p.initial}
              animate={p.animate}
              transition={p.transition}
              style={p.style}
            >
              {p.node}
            </motion.div>
          ))}
          {cards.map((p) => (
            <div key={p.key} className={`absolute z-30 ${p.desktopClass}`}>
              {p.node}
            </div>
          ))}
          {desktopStageExtra}
        </div>
      </div>

      {/* ── Mobile stacked, scrollable layout (< lg) ──────────────────────── */}
      <div className="relative z-10 flex min-h-full flex-col gap-9 px-5 pb-28 pt-20 sm:px-8 lg:hidden">
        {textBlock}
        <div className="flex flex-col items-center gap-7">
          {devices.map((p) => (
            <div key={p.key} className={`mx-auto w-full ${p.mobileClass ?? "max-w-[460px]"}`}>
              {p.node}
            </div>
          ))}
        </div>
        {cards.length > 0 && (
          <div className="flex flex-col gap-4">
            {cards.map((p) => (
              <div key={p.key} className="mx-auto w-full max-w-[460px]">
                {p.node}
              </div>
            ))}
          </div>
        )}
        {mobileExtra}
      </div>
    </section>
  );
};
