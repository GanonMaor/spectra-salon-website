import React, { useEffect, useState } from "react";
import { INV } from "../tokens";

interface ProgressRailProps {
  chapters: string[];
  reducedMotion?: boolean;
}

/**
 * Thin vertical chapter-progress rail on the right edge of the viewport.
 * Shows the current chapter based on scroll position.
 * Hidden on mobile (below md breakpoint).
 */
export const ProgressRail: React.FC<ProgressRailProps> = ({
  chapters,
  reducedMotion = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;

    const onScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - el.clientHeight;
      const pct = total > 0 ? el.scrollTop / total : 0;
      setProgress(pct);

      const idx = Math.min(
        Math.floor(pct * chapters.length),
        chapters.length - 1,
      );
      setActiveChapter(idx);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [chapters.length, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      className="hidden lg:flex flex-col items-center gap-2"
      aria-hidden
      style={{
        position: "fixed",
        right: "20px",
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 50,
      }}
    >
      {chapters.map((ch, i) => (
        <div
          key={ch}
          title={ch}
          style={{
            width: i === activeChapter ? "6px" : "4px",
            height: i === activeChapter ? "24px" : "4px",
            borderRadius: "3px",
            background:
              i === activeChapter
                ? INV.gold
                : i < activeChapter
                ? `${INV.gold}80`
                : INV.border,
            transition: "all 0.3s ease",
          }}
        />
      ))}
    </div>
  );
};
