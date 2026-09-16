import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Instagram, Play } from "lucide-react";
import "./customerStories.css";

// Canonical customer reels, matching the investor and founder story decks
// (src/components/ClientCarousel.tsx, src/screens/FounderStoryPresentation/FounderStoryDeck.tsx).
const customerStories = [
  {
    number: "01",
    name: "Summer",
    username: "@manely.summer",
    followers: "90.6K",
    href: "https://www.instagram.com/manely.summer",
    video: "/instagram-reel.mp4",
    poster: "/investor/media/adoption-proof/phone-summer.jpg",
    avatar: "/profile-summer.jpg",
  },
  {
    number: "02",
    name: "Angela Copozzi",
    username: "@thewitchwhodoeshair_",
    followers: "9.8K",
    href: "https://www.instagram.com/thewitchwhodoeshair_/",
    video: "/instagram-reel2.mp4",
    poster: "/investor/media/adoption-proof/phone-angela.jpg",
    avatar: "/profile-angela.jpg",
  },
  {
    number: "03",
    name: "Kendall",
    username: "@sohairsavvy",
    followers: "3,477",
    href: "https://www.instagram.com/sohairsavvy",
    video: "/instagram-reel3.mp4",
    poster: "/investor/media/adoption-proof/phone-kendall.jpg",
    avatar: "/profile-kendall.jpg",
  },
  {
    number: "04",
    name: "Serina Renee'",
    username: "@_serinarenee",
    followers: "23.2K",
    href: "https://www.instagram.com/_serinarenee",
    video: "/instagram-reel4.mp4",
    poster: "/investor/media/adoption-proof/phone-serina.jpg",
    avatar: "/profile-serina.jpg",
  },
  {
    number: "05",
    name: "Morgan Campbell",
    username: "@manesbymorgan__",
    followers: "1,084",
    href: "https://www.instagram.com/manesbymorgan__",
    video: "/instagram-reel5.mp4",
    poster: "/investor/media/adoption-proof/phone-morgan.jpg",
    avatar: "/profile-morgan.jpg",
  },
  {
    number: "06",
    name: "Bri",
    username: "@bri.stangle",
    followers: "1,718",
    href: "https://www.instagram.com/bri.stangle",
    video: "/instagram-reel6.mp4",
    poster: "/investor/media/adoption-proof/phone-bri.jpg",
    avatar: "/profile-bri.jpg",
  },
] as const;

export const CustomerStories: React.FC = () => {
  const railRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef(new Map<string, HTMLVideoElement>());
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const update = () => {
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      setAtStart(rail.scrollLeft <= 2);
      setAtEnd(maxScroll <= 2 || rail.scrollLeft >= maxScroll - 2);
    };

    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const startVideo = useCallback((username: string) => {
    videoRefs.current.forEach((video, key) => {
      if (key !== username) {
        video.pause();
      }
    });

    const video = videoRefs.current.get(username);
    if (!video) return;

    setActiveVideo(username);
    const played = video.play();
    if (played && typeof played.catch === "function") {
      played.catch(() => {});
    }
  }, []);

  const scrollRail = useCallback(
    (direction: -1 | 1) => {
      const rail = railRef.current;
      if (!rail) return;

      const card = rail.querySelector<HTMLElement>(".sah-story");
      const step = card ? card.offsetWidth + 18 : rail.clientWidth * 0.8;
      rail.scrollBy({
        left: direction * step,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    },
    [reducedMotion],
  );

  return (
    <section className="sah-stories" id="customer-videos" aria-labelledby="customer-videos-title">
      <div className="sah-stories__inner">
        <div className="sah-stories__head">
          <div>
            <p className="sai-eyebrow sah-eyebrow">Customer videos</p>
            <h2 className="sai-display sai-display--section" id="customer-videos-title">
              Salons using Spectra.
            </h2>
          </div>
          <div className="sah-stories__head-aside">
            <p>
              Real stylists, filmed inside their own salons. Press play to watch, then open their
              Instagram to see more.
            </p>
            <div className="sah-stories__arrows">
              <button
                type="button"
                onClick={() => scrollRail(-1)}
                disabled={atStart}
                aria-label="Show previous customer videos"
              >
                <ArrowLeft aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollRail(1)}
                disabled={atEnd}
                aria-label="Show next customer videos"
              >
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div
          className="sah-stories__rail"
          ref={railRef}
          role="group"
          aria-label="Customer videos from Instagram"
          tabIndex={0}
        >
          {customerStories.map((story) => {
            const isActive = activeVideo === story.username;

            return (
              <article className="sah-story" key={story.username}>
                <div className="sah-story__media">
                  <video
                    ref={(node) => {
                      if (node) {
                        videoRefs.current.set(story.username, node);
                      } else {
                        videoRefs.current.delete(story.username);
                      }
                    }}
                    src={story.video}
                    poster={story.poster}
                    preload="none"
                    playsInline
                    controls={isActive}
                    aria-label={`${story.name} using Spectra`}
                    onPlay={() => setActiveVideo(story.username)}
                  />
                  {!isActive && (
                    <button
                      type="button"
                      className="sah-story__play"
                      onClick={() => startVideo(story.username)}
                    >
                      <span aria-hidden="true">
                        <Play />
                      </span>
                      <span className="sah-story__play-label">Play {story.name}</span>
                    </button>
                  )}
                  <span className="sah-story__index" aria-hidden="true">
                    {story.number}
                  </span>
                </div>

                <div className="sah-story__meta">
                  <img src={story.avatar} alt="" loading="lazy" decoding="async" width={36} height={36} />
                  <div className="sah-story__identity">
                    <strong>{story.name}</strong>
                    <span>{story.followers} followers</span>
                  </div>
                  <a
                    className="sah-story__link"
                    href={story.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${story.name} on Instagram, ${story.username}`}
                  >
                    <Instagram aria-hidden="true" />
                    <span>{story.username}</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <p className="sah-stories__foot">
          More salon stories on Instagram{" "}
          <a href="https://www.instagram.com/spectra.ci/" target="_blank" rel="noopener noreferrer">
            @spectra.ci
          </a>
        </p>
      </div>
    </section>
  );
};
