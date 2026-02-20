import React from "react";

interface Props {
  className?: string;
  ghost?: boolean;
}

export const HairGPTWordmark: React.FC<Props> = ({
  className = "",
  ghost = false,
}) => {
  const uid = ghost ? "bg" : "fg";
  const hairStroke = ghost
    ? "rgba(255,255,255,0.025)"
    : "rgba(255,255,255,0.88)";
  const gptStroke = ghost
    ? "rgba(234,183,118,0.02)"
    : `url(#hgw-${uid}-gold)`;
  const sw = ghost ? 1.2 : 2.2;
  const swGpt = ghost ? 1.2 : 2.8;

  return (
    <svg
      viewBox="-8 -8 696 116"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="HairGPT"
    >
      <defs>
        <linearGradient
          id={`hgw-${uid}-gold`}
          x1="380"
          y1="0"
          x2="680"
          y2="80"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F5D5A0" />
          <stop offset="30%" stopColor="#EAB776" />
          <stop offset="65%" stopColor="#D4A06A" />
          <stop offset="100%" stopColor="#B18059" />
        </linearGradient>
        {!ghost && (
          <filter id={`hgw-${uid}-glow`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* ── Construction grid lines ── */}
      {!ghost && (
        <g opacity="0.04" stroke="#EAB776" strokeWidth="0.5">
          <line x1="-8" y1="10" x2="688" y2="10" />
          <line x1="-8" y1="50" x2="688" y2="50" />
          <line x1="-8" y1="90" x2="688" y2="90" />
          <line
            x1="340"
            y1="-8"
            x2="340"
            y2="108"
            strokeDasharray="3 6"
          />
          <line
            x1="370"
            y1="-8"
            x2="370"
            y2="108"
            strokeDasharray="3 6"
          />
        </g>
      )}

      {/* ── Blueprint data lines ── */}
      {!ghost && (
        <g opacity="0.025" stroke="white" strokeWidth="0.3">
          <line x1="0" y1="25" x2="680" y2="25" />
          <line x1="0" y1="75" x2="680" y2="75" />
          <line
            x1="0"
            y1="35"
            x2="320"
            y2="35"
            strokeDasharray="2 8"
          />
          <line
            x1="370"
            y1="65"
            x2="680"
            y2="65"
            strokeDasharray="2 8"
          />
        </g>
      )}

      {/* ── Corner registration marks ── */}
      {!ghost && (
        <g opacity="0.06" stroke="#EAB776" strokeWidth="0.5">
          <path d="M -6,0 H 4 M 0,-6 V 4" />
          <path d="M 676,0 H 686 M 680,-6 V 4" />
          <path d="M -6,100 H 4 M 0,96 V 106" />
          <path d="M 676,100 H 686 M 680,96 V 106" />
        </g>
      )}

      {/* ═══════ HAIR ═══════ white geometric strokes */}
      <g
        stroke={hairStroke}
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        {/* H */}
        <path d="M 10,10 V 90" />
        <path d="M 70,10 V 90" />
        <path d="M 10,50 H 70" />

        {/* A */}
        <path d="M 100,90 L 137,10 L 175,90" />
        <path d="M 113,60 H 162" />

        {/* I — with geometric bars + diamond accent */}
        <path d="M 215,10 V 90" />
        <path d="M 207,10 H 223" />
        <path d="M 207,90 H 223" />

        {/* R */}
        <path d="M 255,90 V 10 H 292 Q 325,10 325,30 Q 325,50 292,50 H 255" />
        <path d="M 288,50 L 325,90" />
      </g>

      {/* Diamond accent above I */}
      {!ghost && (
        <path
          d="M 215,-2 L 218.5,2 L 215,6 L 211.5,2 Z"
          fill="rgba(255,255,255,0.3)"
        />
      )}

      {/* ── Bridge connector between HAIR and GPT ── */}
      {!ghost && (
        <g opacity="0.14">
          <line
            x1="335"
            y1="50"
            x2="385"
            y2="50"
            stroke="#EAB776"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
          <path
            d="M 360,45 L 364,50 L 360,55 L 356,50 Z"
            fill="#EAB776"
            opacity="0.35"
          />
        </g>
      )}

      {/* ═══════ GPT ═══════ gold gradient, bolder */}
      <g
        stroke={gptStroke}
        strokeWidth={swGpt}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={ghost ? undefined : `url(#hgw-${uid}-glow)`}
      >
        {/* G */}
        <path d="M 465,28 Q 465,10 430,10 Q 395,10 395,50 Q 395,90 430,90 Q 465,90 465,72" />
        <path d="M 465,50 H 430" />

        {/* P */}
        <path d="M 495,90 V 10 H 530 Q 560,10 560,30 Q 560,50 530,50 H 495" />

        {/* T */}
        <path d="M 590,10 H 670" />
        <path d="M 630,10 V 90" />
      </g>

      {/* Accent dots at crossbar junctions */}
      {!ghost && (
        <g fill="rgba(234,183,118,0.2)">
          <circle cx="10" cy="50" r="1.8" />
          <circle cx="70" cy="50" r="1.8" />
          <circle cx="430" cy="50" r="1.8" />
        </g>
      )}

      {/* Subtle shimmer animation on GPT */}
      {!ghost && (
        <style>{`
          @keyframes hgw-glow-pulse {
            0%, 100% { filter: url(#hgw-fg-glow) drop-shadow(0 0 4px rgba(234,183,118,0.15)); }
            50% { filter: url(#hgw-fg-glow) drop-shadow(0 0 10px rgba(234,183,118,0.35)); }
          }
        `}</style>
      )}
    </svg>
  );
};
