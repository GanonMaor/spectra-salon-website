import React from "react";

interface Props {
  size?: number;
  className?: string;
}

export const SpectraLogo: React.FC<Props> = ({ size = 40, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 239 236"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <filter id="sl_bg" x="0" y="0" width="238.4" height="235.3" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="bg" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="a" />
        <feOffset dy="5.93" />
        <feGaussianBlur stdDeviation="11.85" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
        <feBlend in2="bg" result="s" />
        <feBlend in="SourceGraphic" in2="s" result="shape" />
      </filter>
      <filter id="sl_c" x="35.8" y="41.7" width="166" height="170.5" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="bg" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="a" />
        <feOffset dy="15.3" />
        <feGaussianBlur stdDeviation="11.47" />
        <feComposite in2="a" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.33 0" />
        <feBlend in2="bg" result="s" />
        <feBlend in="SourceGraphic" in2="s" result="shape" />
      </filter>
      <filter id="sl_d" x="78.6" y="80.7" width="103.3" height="80.3" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="bg" />
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="a" />
        <feOffset dy="7.65" />
        <feGaussianBlur stdDeviation="5.74" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0" />
        <feBlend in2="bg" result="s" />
        <feBlend in="SourceGraphic" in2="s" result="shape" />
      </filter>
      <linearGradient id="sl_g1" x1="168.1" y1="205.7" x2="35.8" y2="6.4" gradientUnits="userSpaceOnUse">
        <stop stopColor="#181717" />
        <stop offset="1" stopColor="#404040" />
      </linearGradient>
      <linearGradient id="sl_g2" x1="46.1" y1="42.8" x2="218.2" y2="260.8" gradientUnits="userSpaceOnUse">
        <stop stopColor="#B18059" />
        <stop offset="0.878" stopColor="#EAB776" />
      </linearGradient>
      <linearGradient id="sl_g3" x1="157" y1="83" x2="105.8" y2="102.7" gradientUnits="userSpaceOnUse">
        <stop stopColor="#B18059" />
        <stop offset="1" stopColor="#EAB776" />
      </linearGradient>
    </defs>
    <g filter="url(#sl_bg)">
      <rect x="23.7" y="17.8" width="191" height="187.9" rx="47" fill="url(#sl_g1)" />
    </g>
    <g filter="url(#sl_c)">
      <path
        d="M171 91.4c-2.5-6.3-6.2-12-10.8-16.8C150.4 64.2 136.5 57.8 121 57.8c-29.8 0-53.9 24.1-53.9 53.9s24.1 53.9 53.9 53.9c15.4 0 29.3-6.5 39.1-16.8 4.2-4.4 7.6-9.5 10.1-15.2"
        stroke="url(#sl_g2)"
        strokeWidth="16.84"
        fill="none"
      />
    </g>
    <g filter="url(#sl_d)">
      <path
        d="M170.4 113.2c-9.6 5.7-24.9 15.3-30.6 19.5-6.2 4.5-12.7 9.2-21 9.2-15.8 0-28.7-12.8-28.7-28.7s12.8-28.7 28.7-28.7c7.5 0 12.8 2.3 19.5 7.6 7.3 5.7 22.6 15.3 32.1 21z"
        fill="url(#sl_g3)"
      />
    </g>
  </svg>
);
