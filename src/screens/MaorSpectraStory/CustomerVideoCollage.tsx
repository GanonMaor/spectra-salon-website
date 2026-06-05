import React, { useRef, useState } from "react";
import { useSiteColors } from "../../contexts/SiteTheme";

interface ClipMeta {
  id: number;
  videoUrl: string;
  name: string;
  username: string;
  profileImage: string;
}

const clips: ClipMeta[] = [
  { id: 1, videoUrl: "/instagram-reel.mp4", name: "Summer", username: "@manely.summer", profileImage: "/profile-summer.jpg" },
  { id: 2, videoUrl: "/instagram-reel2.mp4", name: "Angela Maria Blom", username: "@thewitchwhodoeshair", profileImage: "/profile-angela.jpg" },
  { id: 3, videoUrl: "/instagram-reel3.mp4", name: "Kendall", username: "@sohairsavvy", profileImage: "/profile-kendall.jpg" },
  { id: 4, videoUrl: "/instagram-reel4.mp4", name: "Serina Renee'", username: "@_serinarenee", profileImage: "/profile-serina.jpg" },
  { id: 5, videoUrl: "/instagram-reel5.mp4", name: "Morgan Campbell", username: "@manesbymorgan__", profileImage: "/profile-morgan.jpg" },
  { id: 6, videoUrl: "/instagram-reel6.mp4", name: "Bri", username: "@bri.stangle", profileImage: "/profile-bri.jpg" },
];

export const CustomerVideoCollage: React.FC<{ lang: "he" | "en" }> = ({ lang }) => {
  const c = useSiteColors();
  const [activeId, setActiveId] = useState<number | null>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  const handleToggle = (id: number) => {
    const current = videoRefs.current[id];
    if (!current) return;

    if (activeId === id && !current.paused) {
      current.pause();
      setActiveId(null);
      return;
    }

    Object.entries(videoRefs.current).forEach(([key, el]) => {
      if (el && Number(key) !== id) {
        el.pause();
        el.currentTime = 0;
      }
    });

    current.muted = false;
    current.play().catch(() => {
      current.muted = true;
      current.play().catch(() => {});
    });
    setActiveId(id);
  };

  return (
    <div
      dir="ltr"
      data-no-swipe
      className="collage-scroll flex gap-3 sm:gap-4 overflow-x-auto overflow-y-hidden snap-x snap-proximity pb-3 px-1"
      style={{
        scrollbarWidth: "none",
        overscrollBehaviorX: "contain",
        touchAction: "pan-x",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <style>{`.collage-scroll::-webkit-scrollbar{display:none}`}</style>
      {clips.map((clip) => {
        const isActive = activeId === clip.id;
        return (
          <button
            key={clip.id}
            type="button"
            onClick={() => handleToggle(clip.id)}
            className="relative flex-shrink-0 snap-center w-40 sm:w-48 md:w-52 aspect-[9/16] rounded-2xl overflow-hidden focus:outline-none transition-transform duration-300"
            style={{
              border: `1px solid ${c.border.medium}`,
              boxShadow: isActive
                ? "0 16px 40px rgba(0,0,0,0.30)"
                : "0 8px 24px rgba(0,0,0,0.14)",
              transform: isActive ? "scale(1.02)" : "scale(1)",
            }}
          >
            <video
              ref={(el) => {
                videoRefs.current[clip.id] = el;
              }}
              src={clip.videoUrl}
              className="w-full h-full object-cover bg-black"
              playsInline
              preload="metadata"
              muted
              onEnded={() => setActiveId(null)}
            />

            {/* Gradient + profile label */}
            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/70 to-transparent text-left">
              <div className="flex items-center gap-2">
                <img
                  src={clip.profileImage}
                  alt={clip.name}
                  className="w-7 h-7 rounded-full object-cover border border-white/40"
                  loading="lazy"
                  decoding="async"
                />
                <div className="min-w-0">
                  <div className="text-white text-[11px] font-semibold truncate drop-shadow">
                    {clip.username}
                  </div>
                </div>
              </div>
            </div>

            {/* Play overlay when not active */}
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="w-12 h-12 rounded-full bg-black/45 backdrop-blur-sm flex items-center justify-center">
                  <svg className="w-6 h-6 ml-0.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
