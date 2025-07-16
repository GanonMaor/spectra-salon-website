import React, { useState, useRef, useEffect } from 'react';

const videos = [
  {
    id: 1,
    videoUrl: "/instagram-reel.mp4",
    username: "@manely.summer",
    name: "Summer",
    profileImage: "/profile-summer.jpg",
    instagramUrl: "https://www.instagram.com/manely.summer",
    followers: "90.6K"
  },
  {
    id: 2,
    videoUrl: "/instagram-reel2.mp4",
    username: "@thewitchwhodoeshair",
    name: "Angela Maria Blom",
    profileImage: "/profile-angela.jpg",
    instagramUrl: "https://www.instagram.com/thewitchwhodoeshair",
    followers: "3,440"
  },
  {
    id: 3,
    videoUrl: "/instagram-reel3.mp4",
    username: "@sohairsavvy",
    name: "Kendall",
    profileImage: "/profile-kendall.jpg",
    instagramUrl: "https://www.instagram.com/sohairsavvy",
    followers: "3,477"
  },
  {
    id: 4,
    videoUrl: "/instagram-reel4.mp4",
    username: "@_serinarenee",
    name: "Serina Renee'",
    profileImage: "/profile-serina.jpg",
    instagramUrl: "https://www.instagram.com/_serinarenee",
    followers: "23.2K"
  },
  {
    id: 5,
    videoUrl: "/instagram-reel5.mp4",
    username: "@manesbymorgan__",
    name: "Morgan Campbell",
    profileImage: "/profile-morgan.jpg",
    instagramUrl: "https://www.instagram.com/manesbymorgan__",
    followers: "1,084"
  },
  {
    id: 6,
    videoUrl: "/instagram-reel6.mp4",
    username: "@bri.stangle",
    name: "Bri",
    profileImage: "/profile-bri.jpg",
    instagramUrl: "https://www.instagram.com/bri.stangle",
    followers: "1,718"
  }
];

export const ClientCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto play when video changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setProgress(0);
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentIndex]);

  // Update progress
  const updateProgress = () => {
    if (videoRef.current && duration > 0) {
      const currentProgress = (videoRef.current.currentTime / duration) * 100;
      setProgress(currentProgress);
    }
  };

  // Handle video end
  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
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
    window.open(instagramUrl, '_blank');
  };

  // Navigate to specific video
  const goTo = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  // Navigate functions for mobile
  const goToNext = () => {
    if (currentIndex < videos.length - 1) {
      goTo(currentIndex + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      goTo(currentIndex - 1);
    }
  };

  // Helper functions for side videos (desktop)
  const leftIdx = (currentIndex - 1 + videos.length) % videos.length;
  const rightIdx = (currentIndex + 1) % videos.length;

  const currentVideo = videos[currentIndex];

  return (
    <div className="relative">
      {/* Mobile Layout - Single Phone with Controls */}
      <div className="md:hidden flex flex-col items-center gap-4 py-8">
        {/* Main phone */}
        <div className="scale-100 opacity-100 z-10 transition-all duration-500">
          <div className="relative bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#1d1d1f] rounded-[3.5rem] p-[4px] shadow-2xl" style={{ width: 280, height: 560 }}>
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black rounded-full z-20"></div>
            
            <div className="w-full h-full bg-black rounded-[3.2rem] overflow-hidden relative">
              {/* Video */}
              <video
                ref={videoRef}
                src={currentVideo.videoUrl}
                className="w-full h-full object-cover"
                muted={false}
                playsInline
                controls={false}
                onEnded={handleEnded}
                onTimeUpdate={updateProgress}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onClick={togglePlayPause}
                preload="metadata"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />

              {/* Story-like indicators */}
              <div className="absolute top-14 left-4 right-4 z-30">
                <div className="flex gap-1">
                  {videos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-0.5 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                        index === currentIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                      onClick={() => goTo(index)}
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
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${currentVideo.name}&background=gradient&color=fff&size=40`;
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="text-white text-xs font-semibold drop-shadow-lg">{currentVideo.username}</div>
                    <div className="text-gray-200 text-[10px] drop-shadow-md">{currentVideo.name} • {currentVideo.followers} followers</div>
                  </div>
                </div>
              </div>

              {/* Play/Pause Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <button
                  onClick={togglePlayPause}
                  className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity duration-300"
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
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

        {/* Mobile Navigation */}
        <div className="flex items-center gap-4">
          <button 
            onClick={goToPrevious}
            className="p-3 bg-gray-800/80 backdrop-blur-sm rounded-full text-white hover:bg-gray-700/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
            aria-label="Previous video"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="text-gray-600 text-sm font-medium min-w-[3rem] text-center">
            {currentIndex + 1} / {videos.length}
          </div>
          
          <button 
            onClick={goToNext}
            className="p-3 bg-gray-800/80 backdrop-blur-sm rounded-full text-white hover:bg-gray-700/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === videos.length - 1}
            aria-label="Next video"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Desktop Layout - Three Phones */}
      <div className="hidden md:flex items-center justify-center gap-8 py-8">
        {/* Left phone - thumbnail only */}
        <div className="scale-75 opacity-60 transition-all duration-500 cursor-pointer hover:opacity-80" onClick={() => goTo(leftIdx)}>
          <div className="relative bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#1d1d1f] rounded-[3rem] p-[3px] shadow-2xl" style={{ width: 180, height: 360 }}>
            <div className="w-full h-full bg-black rounded-[2.7rem] overflow-hidden relative flex items-center justify-center">
              <video src={videos[leftIdx].videoUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
            </div>
          </div>
        </div>

        {/* Center phone - main video */}
        <div className="scale-100 opacity-100 z-10 transition-all duration-500">
          <div className="relative bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#1d1d1f] rounded-[3.5rem] p-[4px] shadow-2xl" style={{ width: 300, height: 600 }}>
            {/* Dynamic Island */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black rounded-full z-20"></div>
            
            <div className="w-full h-full bg-black rounded-[3.2rem] overflow-hidden relative">
              {/* Video */}
              <video
                ref={videoRef}
                src={currentVideo.videoUrl}
                className="w-full h-full object-cover"
                muted={false}
                playsInline
                controls={false}
                onEnded={handleEnded}
                onTimeUpdate={updateProgress}
                onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                onClick={togglePlayPause}
                preload="metadata"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />

              {/* Story-like indicators */}
              <div className="absolute top-14 left-4 right-4 z-30">
                <div className="flex gap-1">
                  {videos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-0.5 flex-1 rounded-full transition-all duration-300 cursor-pointer ${
                        index === currentIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                      onClick={() => goTo(index)}
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
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${currentVideo.name}&background=gradient&color=fff&size=40`;
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="text-white text-xs font-semibold drop-shadow-lg">{currentVideo.username}</div>
                    <div className="text-gray-200 text-[10px] drop-shadow-md">{currentVideo.name} • {currentVideo.followers} followers</div>
                  </div>
                </div>
              </div>

              {/* Play/Pause Overlay */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <button
                  onClick={togglePlayPause}
                  className="w-16 h-16 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity duration-300"
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
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

        {/* Right phone - thumbnail only */}
        <div className="scale-75 opacity-60 transition-all duration-500 cursor-pointer hover:opacity-80" onClick={() => goTo(rightIdx)}>
          <div className="relative bg-gradient-to-b from-[#1d1d1f] via-[#2c2c2e] to-[#1d1d1f] rounded-[3rem] p-[3px] shadow-2xl" style={{ width: 180, height: 360 }}>
            <div className="w-full h-full bg-black rounded-[2.7rem] overflow-hidden relative flex items-center justify-center">
              <video src={videos[rightIdx].videoUrl} className="w-full h-full object-cover" muted playsInline preload="metadata" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};