import React, { useCallback, useEffect, useRef, useState } from "react";

interface Reel {
  id: number;
  videoUrl: string;
  username: string;
  name: string;
  followers: string;
}

const REELS: Reel[] = [
  { id: 1, videoUrl: "/instagram-reel.mp4", username: "@manely.summer", name: "Summer", followers: "90.6K" },
  { id: 2, videoUrl: "/instagram-reel2.mp4", username: "@thewitchwhodoeshair", name: "Angela Maria Blom", followers: "3,440" },
  { id: 3, videoUrl: "/instagram-reel3.mp4", username: "@sohairsavvy", name: "Kendall", followers: "3,477" },
  { id: 4, videoUrl: "/instagram-reel4.mp4", username: "@_serinarenee", name: "Serina Renee'", followers: "23.2K" },
  { id: 5, videoUrl: "/instagram-reel5.mp4", username: "@manesbymorgan__", name: "Morgan Campbell", followers: "1,084" },
  { id: 6, videoUrl: "/instagram-reel6.mp4", username: "@bri.stangle", name: "Bri", followers: "1,718" },
];

interface CustomerVideoRailProps {
  accent: string;
}

/**
 * Horizontal, snap-scrolling rail of customer reels — phones side by side.
 * Autoplay muted loop; click a phone to toggle its sound. Includes arrows and
 * scroll-position dot indicators. Sized to fill the available slide height.
 */
export const CustomerVideoRail: React.FC<CustomerVideoRailProps> = ({ accent }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const [unmutedId, setUnmutedId] = useState<number | null>(null);

  const updateActive = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const first = el.children[0] as HTMLElement | undefined;
    if (!first) return;
    const itemW = first.offsetWidth + 16; // card + gap
    const idx = Math.round(el.scrollLeft / itemW);
    setActive(Math.max(0, Math.min(REELS.length - 1, idx)));
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateActive, { passive: true });
    return () => el.removeEventListener("scroll", updateActive);
  }, [updateActive]);

  const scrollToIndex = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(REELS.length - 1, idx));
    const first = el.children[0] as HTMLElement | undefined;
    if (!first) return;
    const itemW = first.offsetWidth + 16;
    el.scrollTo({ left: clamped * itemW, behavior: "smooth" });
  };

  const toggleSound = (i: number, id: number) => {
    const v = videoRefs.current[i];
    if (!v) return;
    if (unmutedId === id) {
      v.muted = true;
      setUnmutedId(null);
    } else {
      videoRefs.current.forEach((other) => {
        if (other) other.muted = true;
      });
      v.muted = false;
      v.play().catch(() => {});
      setUnmutedId(id);
    }
  };

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Rail */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollerRef}
          className="flex gap-4 h-full overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {REELS.map((reel, i) => (
            <div
              key={reel.id}
              className="relative h-full shrink-0 snap-center rounded-[1.6rem] overflow-hidden cursor-pointer group"
              style={{
                aspectRatio: "9 / 18",
                border: unmutedId === reel.id ? `2px solid ${accent}` : "1px solid rgba(255,255,255,0.16)",
                boxShadow: "0 16px 50px rgba(0,0,0,0.45)",
              }}
              onClick={() => toggleSound(i, reel.id)}
            >
              <video
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                src={reel.videoUrl}
                className="w-full h-full object-cover"
                muted
                loop
                autoPlay
                playsInline
                preload="metadata"
              />
              {/* gradient + label */}
              <div
                className="absolute inset-x-0 bottom-0 p-3"
                style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.72), transparent)" }}
              >
                <div className="text-white text-xs font-semibold leading-tight drop-shadow">{reel.username}</div>
                <div className="text-white/75 text-[10px] leading-tight">{reel.followers} followers</div>
              </div>
              {/* sound hint */}
              <div
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
              >
                {unmutedId === reel.id ? (
                  <svg className="w-3.5 h-3.5" fill="#fff" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="rgba(255,255,255,0.85)" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          type="button"
          aria-label="Previous reels"
          onClick={() => scrollToIndex(active - 1)}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button
          type="button"
          aria-label="Next reels"
          onClick={() => scrollToIndex(active + 1)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* Scroll indicator dots */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {REELS.map((reel, i) => (
          <button
            key={reel.id}
            type="button"
            aria-label={`Go to reel ${i + 1}`}
            onClick={() => scrollToIndex(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === active ? 22 : 7,
              height: 7,
              background: i === active ? accent : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>
    </div>
  );
};
