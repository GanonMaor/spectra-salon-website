import React from "react";
import { avatarGradient } from "../homeDashboardTokens";

export interface AvatarProps {
  seed: string;
  initials: string;
  size?: number;
  ringColor?: string;
  className?: string;
}

/**
 * Deterministic gradient avatar.
 *
 * Pure presentational; intentionally avoids loading network images so the
 * static dashboard renders consistently without external dependencies.
 */
const Avatar: React.FC<AvatarProps> = ({
  seed,
  initials,
  size = 32,
  ringColor,
  className,
}) => {
  const gradient = avatarGradient(seed);
  const fontPx = Math.max(10, Math.round(size * 0.38));

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full text-white font-semibold flex-shrink-0 ${
        className ?? ""
      }`}
      style={{
        width: size,
        height: size,
        background: gradient,
        fontSize: fontPx,
        boxShadow: ringColor
          ? `0 0 0 2px ${ringColor}`
          : "0 1px 3px rgba(15, 23, 42, 0.18)",
        letterSpacing: "0.02em",
      }}
      aria-label={seed}
    >
      {initials.slice(0, 2).toUpperCase()}
    </span>
  );
};

export default Avatar;
