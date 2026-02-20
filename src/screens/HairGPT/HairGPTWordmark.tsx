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
  const sw = ghost ? 5 : 13;

  return (
    <svg
      viewBox="-2 -2 490 104"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="HairGPT"
    >
      <defs>
        <linearGradient
          id={`hgw-${uid}-gold`}
          x1="0"
          y1="50"
          x2="486"
          y2="50"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#F5D5A0" />
          <stop offset="25%" stopColor="#EAB776" />
          <stop offset="55%" stopColor="#D4A06A" />
          <stop offset="85%" stopColor="#B18059" />
          <stop offset="100%" stopColor="#C8956C" />
        </linearGradient>
        {!ghost && (
          <filter id={`hgw-${uid}-glow`}>
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <g
        stroke={
          ghost
            ? "rgba(234,183,118,0.035)"
            : `url(#hgw-${uid}-gold)`
        }
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter={ghost ? undefined : `url(#hgw-${uid}-glow)`}
      >
        {/* H */}
        <path d="M 15,10 V 90" />
        <path d="M 70,10 V 90" />
        <path d="M 15,50 H 70" />

        {/* A */}
        <path d="M 82,90 L 111,10 L 140,90" />
        <path d="M 93,58 H 129" />

        {/* I */}
        <path d="M 152,10 V 90" />

        {/* R */}
        <path d="M 164,90 V 10 H 196 Q 226,10 226,30 Q 226,50 196,50 H 164" />
        <path d="M 193,50 L 226,90" />

        {/* G */}
        <path d="M 316,26 Q 316,10 284,10 Q 252,10 252,50 Q 252,90 284,90 Q 316,90 316,74" />
        <path d="M 316,50 H 290" />

        {/* P */}
        <path d="M 326,90 V 10 H 358 Q 386,10 386,30 Q 386,50 358,50 H 326" />

        {/* T */}
        <path d="M 396,10 H 468" />
        <path d="M 432,10 V 90" />
      </g>
    </svg>
  );
};
