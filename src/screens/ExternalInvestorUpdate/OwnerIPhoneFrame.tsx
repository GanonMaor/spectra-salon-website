import React, { useId } from "react";

/**
 * iPhone 16 Pro Black Titanium, sized to wrap the owner-app captures.
 * The screens already draw a Dynamic Island, so this shell is hardware only:
 * titanium rim, one volume rocker, one power button.
 *
 * The device is real hardware, so it keeps its dark shell on the cream page —
 * but the specular gradients are held back to a single restrained sweep so the
 * rim reads as metal without turning into decoration.
 */

/** Native size of the owner-app screenshots. */
const CAPTURE_W = 1206;
const CAPTURE_H = 2622;

const VW = 320;
const BEZEL = 7;
const SW = VW - BEZEL * 2;
/* Screen box follows the capture ratio, so nothing inside is ever cropped. */
const SH = Math.round((SW * CAPTURE_H) / CAPTURE_W);
const VH = SH + BEZEL * 2;
const OUTER_R = 54;
const SCREEN_R = 46;

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
            backgroundColor: "#2A2622",
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
          {/* One quiet sweep across the rim. Warm dark, not chrome. */}
          <linearGradient id={`ti-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A443C" />
            <stop offset="45%" stopColor="#1F1C18" />
            <stop offset="100%" stopColor="#38332C" />
          </linearGradient>
          <linearGradient id={`hi-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="30%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
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
        />
        <rect
          x="0.6"
          y="0.6"
          width={VW - 1.2}
          height={VH - 1.2}
          rx={OUTER_R - 0.6}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1"
        />
        <rect
          x={BEZEL}
          y={BEZEL}
          width={SW}
          height={SH}
          rx={SCREEN_R}
          fill="none"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
};
