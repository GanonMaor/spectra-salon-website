import React, { useId } from "react";

/**
 * iPhone 16 Pro Black Titanium, sized to wrap the owner-app captures.
 * The screens already draw a Dynamic Island, so this shell is hardware only:
 * titanium rim, one volume rocker, one power button.
 */
const VW = 320;
const VH = 694;
const BEZEL = 7;
const OUTER_R = 54;
const SCREEN_R = 46;
const SW = VW - BEZEL * 2;
const SH = VH - BEZEL * 2;

export const OWNER_IPHONE_RATIO = `${VW} / ${VH}`;

export const OwnerIPhoneFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const raw = useId();
  const id = raw.replace(/:/g, "_");

  return (
    <div className="relative h-full w-full">
      <div
        className="absolute overflow-hidden bg-black"
        style={{
          inset: `${(BEZEL / VH) * 100}% ${(BEZEL / VW) * 100}%`,
          borderRadius: `${(SCREEN_R / SW) * 100}% / ${(SCREEN_R / SH) * 100}%`,
          zIndex: 1,
        }}
      >
        {children}
      </div>

      {[
        { side: "left" as const, top: 168, h: 86 },
        { side: "right" as const, top: 188, h: 56 },
      ].map(({ side, top, h }, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="absolute"
          style={{
            [side === "left" ? "left" : "right"]: "-3px",
            top: `${(top / VH) * 100}%`,
            width: 3,
            height: `${(h / VH) * 100}%`,
            borderRadius: 1.5,
            background:
              side === "left"
                ? "linear-gradient(90deg,#7a746c,#2a2622 55%,#141210)"
                : "linear-gradient(270deg,#7a746c,#2a2622 55%,#141210)",
          }}
        />
      ))}

      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`ti-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8a847c" />
            <stop offset="18%" stopColor="#4a4640" />
            <stop offset="42%" stopColor="#1c1a18" />
            <stop offset="68%" stopColor="#0f0e0c" />
            <stop offset="88%" stopColor="#2c2925" />
            <stop offset="100%" stopColor="#5c574f" />
          </linearGradient>
          <linearGradient id={`hi-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="28%" stopColor="rgba(255,255,255,0.14)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <linearGradient id={`edge-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.42)" />
            <stop offset="40%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <mask id={`m-${id}`}>
            <rect x="0" y="0" width={VW} height={VH} rx={OUTER_R} fill="white" />
            <rect x={BEZEL} y={BEZEL} width={SW} height={SH} rx={SCREEN_R} fill="black" />
          </mask>
        </defs>

        <rect
          x="0"
          y="0"
          width={VW}
          height={VH}
          rx={OUTER_R}
          fill={`url(#ti-${id})`}
          mask={`url(#m-${id})`}
        />
        <rect
          x="0"
          y="0"
          width={VW}
          height={VH}
          rx={OUTER_R}
          fill={`url(#hi-${id})`}
          mask={`url(#m-${id})`}
          opacity="0.9"
        />
        <rect
          x="0"
          y={OUTER_R}
          width={BEZEL}
          height={VH - OUTER_R * 2}
          fill={`url(#edge-${id})`}
          mask={`url(#m-${id})`}
          opacity="0.7"
        />
        <rect
          x="0.6"
          y="0.6"
          width={VW - 1.2}
          height={VH - 1.2}
          rx={OUTER_R - 0.6}
          fill="none"
          stroke="rgba(255,255,255,0.38)"
          strokeWidth="1.1"
        />
        <rect
          x={BEZEL}
          y={BEZEL}
          width={SW}
          height={SH}
          rx={SCREEN_R}
          fill="none"
          stroke="rgba(0,0,0,0.55)"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
};
