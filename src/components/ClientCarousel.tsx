import React, { useState, useRef, useEffect } from "react";

const videos = [
  {
    id: 1,
    videoUrl: "/instagram-reel.mp4",
    username: "@manely.summer",
    name: "Summer",
    profileImage: "/profile-summer.jpg",
    instagramUrl: "https://www.instagram.com/manely.summer",
    followers: "90.6K",
  },
  {
    id: 2,
    videoUrl: "/instagram-reel2.mp4",
    username: "@thewitchwhodoeshair",
    name: "Angela Maria Blom",
    profileImage: "/profile-angela.jpg",
    instagramUrl: "https://www.instagram.com/thewitchwhodoeshair",
    followers: "3,440",
  },
  {
    id: 3,
    videoUrl: "/instagram-reel3.mp4",
    username: "@sohairsavvy",
    name: "Kendall",
    profileImage: "/profile-kendall.jpg",
    instagramUrl: "https://www.instagram.com/sohairsavvy",
    followers: "3,477",
  },
  {
    id: 4,
    videoUrl: "/instagram-reel4.mp4",
    username: "@_serinarenee",
    name: "Serina Renee'",
    profileImage: "/profile-serina.jpg",
    instagramUrl: "https://www.instagram.com/_serinarenee",
    followers: "23.2K",
  },
  {
    id: 5,
    videoUrl: "/instagram-reel5.mp4",
    username: "@manesbymorgan__",
    name: "Morgan Campbell",
    profileImage: "/profile-morgan.jpg",
    instagramUrl: "https://www.instagram.com/manesbymorgan__",
    followers: "1,084",
  },
  {
    id: 6,
    videoUrl: "/instagram-reel6.mp4",
    username: "@bri.stangle",
    name: "Bri",
    profileImage: "/profile-bri.jpg",
    instagramUrl: "https://www.instagram.com/bri.stangle",
    followers: "1,718",
  },
];

export const ClientCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll to top when component mounts (for direct links)
  useEffect(() => {
    if (window.location.pathname.includes("ugc-offer")) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Enable autoplay after user interaction
  useEffect(() => {
    const enableAutoplay = () => {
      setUserInteracted(true);
    };

    document.addEventListener("click", enableAutoplay, { once: true });
    document.addEventListener("touchstart", enableAutoplay, { once: true });

    return () => {
      document.removeEventListener("click", enableAutoplay);
      document.removeEventListener("touchstart", enableAutoplay);
    };
  }, []);

  // Intersection Observer for auto-play when reaching section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStarted) {
            setHasStarted(true);
          } else if (!entry.isIntersecting && hasStarted) {
            // Pause video when section is out of view
            if (videoRef.current && isPlaying) {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [hasStarted, isPlaying]);

  // Reset video loaded state when index changes
  useEffect(() => {
    setIsVideoLoaded(false);
    setProgress(0);
  }, [currentIndex]);

  // Auto-play logic when conditions are met
  useEffect(() => {
    if (hasStarted && userInteracted && isVideoLoaded && videoRef.current) {
      const video = videoRef.current;
      video.currentTime = 0;
      video.muted = isMuted;

      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // If sound fails, try muted
          if (!isMuted) {
            video.muted = true;
            video
              .play()
              .then(() => {
                setIsPlaying(true);
              })
              .catch(() => {
                setIsPlaying(false);
              });
          }
        });
    }
  }, [currentIndex, hasStarted, userInteracted, isVideoLoaded, isMuted]);

  // Progress update - simplified
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying && videoRef.current) {
      interval = setInterval(() => {
        if (videoRef.current) {
          const currentTime = videoRef.current.currentTime;
          const duration = videoRef.current.duration;
          setCurrentTime(currentTime);
          setDuration(duration);
          if (duration > 0) {
            setProgress((currentTime / duration) * 100);
          }
        }
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  // Video event listeners - simplified
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedData = () => setIsVideoLoaded(true);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("loadeddata", handleLoadedData);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("loadeddata", handleLoadedData);
    };
  }, []);

  // Handle video ended
  const handleEnded = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    setProgress(0);
  };

  // Toggle play/pause - simplified
  const togglePlayPause = () => {
    if (!videoRef.current) return;

    setUserInteracted(true);
    setHasStarted(true);

    const video = videoRef.current;

    if (isPlaying) {
      video.pause();
    } else {
      video.muted = isMuted;
      video
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {
          // Fallback to muted
          video.muted = true;
          video.play().catch(() => {});
        });
    }
  };

  // Toggle mute/unmute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = (clickX / rect.width) * 100;
    const newTime = (newProgress / 100) * duration;

    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  // Handle profile click
  const handleProfileClick = (instagramUrl: string) => {
    window.open(instagramUrl, "_blank");
  };

  // Navigate to video - simplified
  const goTo = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Navigation functions
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  // Helper functions for side videos
  const leftIdx = (currentIndex - 1 + videos.length) % videos.length;
  const rightIdx = (currentIndex + 1) % videos.length;

  const currentVideo = videos[currentIndex];

  return (
    <div
      ref={sectionRef}
      className="flex flex-col items-center justify-center py-8 overflow-x-hidden"
    >
      {/* Main Video Display */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-8 px-4">
        {/* Left phone - thumbnail only - hidden on small mobile */}
        <div
          className="hidden sm:block scale-50 sm:scale-75 opacity-60 transition-all duration-500 cursor-pointer hover:opacity-80"
          onClick={() => goTo(leftIdx)}
        >
          <div
            className="relative bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#1d1d1f] rounded-[3rem] p-[3px] shadow-2xl"
            style={{ width: 180, height: 360 }}
          >
            <div className="w-full h-full bg-black rounded-[2.7rem] overflow-hidden relative flex items-center justify-center">
              <video
                src={videos[leftIdx].videoUrl}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        </div>

        {/* Center phone - main video with controls */}
        <div className="scale-75 sm:scale-90 md:scale-100 opacity-100 z-10 transition-all duration-500">
          <div
            className="relative bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#1d1d1f] rounded-[3.5rem] p-[4px] shadow-2xl"
            style={{ width: 300, height: 600 }}
          >
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black rounded-full z-20"></div>

            <div className="w-full h-full bg-black rounded-[3.2rem] overflow-hidden relative">
              {/* Video */}
              <video
                ref={videoRef}
                src={currentVideo.videoUrl}
                className="w-full h-full object-cover"
                muted={isMuted}
                playsInline
                controls={false}
                onEnded={handleEnded}
                preload="auto"
                onLoadedMetadata={() => {
                  setIsVideoLoaded(true);
                }}
                style={{ objectFit: "cover", objectPosition: "center" }}
              />

              {/* Story-like indicators - moved below Dynamic Island */}
              <div className="absolute top-14 left-4 right-4 z-30">
                <div className="flex gap-1">
                  {videos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                        index === currentIndex ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Profile Section */}
              <div className="absolute top-20 left-4 right-4 z-30">
                <div
                  className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleProfileClick(currentVideo.instagramUrl)}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 p-[2px]">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                      <img
                        src={currentVideo.profileImage}
                        alt={currentVideo.name}
                        className="w-full h-full rounded-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${currentVideo.name}&background=gradient&color=fff&size=40`;
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="text-white text-xs font-semibold drop-shadow-lg">
                      {currentVideo.username}
                    </div>
                    <div className="text-gray-200 text-[10px] drop-shadow-md">
                      {currentVideo.name} • {currentVideo.followers} followers
                    </div>
                  </div>
                </div>
              </div>

              {/* Mute/Unmute Button - Center */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <button
                  onClick={toggleMute}
                  className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity duration-300"
                >
                  {isMuted ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-4 left-4 right-4 z-30">
                <div
                  className="h-1 bg-white/30 rounded-full cursor-pointer"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right phone - thumbnail only - hidden on small mobile */}
        <div
          className="hidden sm:block scale-50 sm:scale-75 opacity-60 transition-all duration-500 cursor-pointer hover:opacity-80"
          onClick={() => goTo(rightIdx)}
        >
          <div
            className="relative bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#1d1d1f] rounded-[3rem] p-[3px] shadow-2xl"
            style={{ width: 180, height: 360 }}
          >
            <div className="w-full h-full bg-black rounded-[2.7rem] overflow-hidden relative flex items-center justify-center">
              <video
                src={videos[rightIdx].videoUrl}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Controls Below Phones */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 px-4">
        {/* Previous Button */}
        <button
          onClick={goToPrevious}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-50 transition-all duration-300 shadow-lg"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
          </svg>
        </button>

        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          className="w-16 h-16 bg-white border border-black rounded-full flex items-center justify-center text-black hover:bg-gray-50 transition-all duration-300 shadow-xl"
        >
          {isPlaying ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              className="w-8 h-8 ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Next Button */}
        <button
          onClick={goToNext}
          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-gray-50 transition-all duration-300 shadow-lg"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z" />
          </svg>
        </button>
      </div>
    </div>
  );
};
