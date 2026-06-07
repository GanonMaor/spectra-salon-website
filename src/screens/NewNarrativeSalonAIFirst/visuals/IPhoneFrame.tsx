import React, { useId } from "react";

// iPhone 15 Pro SVG coordinate space
const VW = 320, VH = 693, OR = 46, B = 10, SW = 300, SH = 673, SR = 38;
const DI_W = 124, DI_H = 36, DI_X = 98, DI_Y = 24;
const SL = `${(B / VW) * 100}%`;           // 3.125%
const ST = `${(B / VH) * 100}%`;           // 1.443%
const SRX = `${(SR / SW) * 100}% / ${(SR / SH) * 100}%`; // screen border-radius

interface IPhoneFrameProps {
  children: React.ReactNode;
  /** Screen background — defaults to warm cream (light UI) */
  screenBg?: string;
}

/**
 * Reusable iPhone 15 Pro titanium-frame shell.
 * Children are rendered inside the OLED screen area.
 */
export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({
  children,
  screenBg = "linear-gradient(175deg, #FDFAF7 0%, #F6EEE6 100%)",
}) => {
  const raw = useId();
  const id = raw.replace(/:/g, "_"); // SVG ids can't contain colons

  return (
    <div className="relative w-full h-full">

      {/* ── Screen content ── */}
      <div
        className="absolute overflow-hidden"
        style={{ left: SL, top: ST, right: SL, bottom: ST, borderRadius: SRX, background: screenBg, zIndex: 1 }}
      >
        {children}
      </div>

      {/* ── Dynamic Island ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${(DI_X / VW) * 100}%`,
          top: `${(DI_Y / VH) * 100}%`,
          width: `${(DI_W / VW) * 100}%`,
          height: `${(DI_H / VH) * 100}%`,
          borderRadius: "50px",
          background: "#050403",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 2px rgba(0,0,0,0.8)",
          zIndex: 2,
        }}
      />

      {/* ── Side hardware buttons ── */}
      {[
        { side: "left",  top: 120, h: 24 }, // silent switch
        { side: "left",  top: 162, h: 58 }, // volume up
        { side: "left",  top: 232, h: 58 }, // volume down
        { side: "right", top: 188, h: 72 }, // power
      ].map(({ side, top, h }, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            [side === "left" ? "left" : "right"]: "-4px",
            top: `${(top / VH) * 100}%`,
            width: "4px",
            height: `${(h / VH) * 100}%`,
            borderRadius: "2px",
            background: "linear-gradient(180deg,#3e3a36,#1a1714,#3e3a36)",
            boxShadow: side === "left"
              ? "inset 1px 0 0 rgba(255,255,255,0.13)"
              : "inset -1px 0 0 rgba(255,255,255,0.09)",
          }}
        />
      ))}

      {/* ── SVG titanium frame ── */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ zIndex: 3 }}
      >
        <defs>
          <linearGradient id={`ti-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#4c4844" />
            <stop offset="12%"  stopColor="#3a3632" />
            <stop offset="30%"  stopColor="#252220" />
            <stop offset="52%"  stopColor="#161412" />
            <stop offset="72%"  stopColor="#1c1a18" />
            <stop offset="100%" stopColor="#2e2a26" />
          </linearGradient>
          <linearGradient id={`sp-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.38)" />
            <stop offset="30%"  stopColor="rgba(255,255,255,0.12)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
          </linearGradient>
          <linearGradient id={`sl-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.30)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
          </linearGradient>
          <mask id={`m-${id}`}>
            <rect x="0" y="0" width={VW} height={VH} rx={OR} fill="white" />
            <rect x={B}  y={B}  width={SW} height={SH} rx={SR} fill="black" />
          </mask>
        </defs>

        {/* Base titanium */}
        <rect x="0" y="0" width={VW} height={VH} rx={OR} fill={`url(#ti-${id})`} mask={`url(#m-${id})`} />
        {/* Top catch-light */}
        <rect x="0" y="0" width={VW} height={VH} rx={OR} fill={`url(#sp-${id})`} mask={`url(#m-${id})`} opacity="0.85" />
        {/* Left-edge specular strip */}
        <rect x="0" y={OR} width={B} height={VH - OR * 2} fill={`url(#sl-${id})`} mask={`url(#m-${id})`} opacity="0.55" />
        {/* Right-edge shadow */}
        <rect x={VW - B} y={OR} width={B} height={VH - OR * 2} fill="rgba(0,0,0,0.40)" mask={`url(#m-${id})`} />
        {/* Outer hairline */}
        <rect x="0.5" y="0.5" width={VW - 1} height={VH - 1} rx={OR - 0.5} fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="0.75" />
        {/* Inner screen hairline */}
        <rect x={B} y={B} width={SW} height={SH} rx={SR} fill="none" stroke="rgba(0,0,0,0.10)" strokeWidth="0.5" />
      </svg>

      {/* ── Glass reflection over screen — subtle, not dominant ── */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: SL, top: ST, right: SL, bottom: ST,
          borderRadius: SRX,
          background: "linear-gradient(130deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 20%, transparent 38%)",
          zIndex: 4,
        }}
      />
    </div>
  );
};
