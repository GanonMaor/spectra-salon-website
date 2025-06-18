import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ClientCarousel } from "../../components/ClientCarousel";

export const Frame = (): JSX.Element => {
  const [isFeatureDropdownOpen, setIsFeatureDropdownOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [hoveredFeatureIndex, setHoveredFeatureIndex] = useState<number | null>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredVideoStep, setHoveredVideoStep] = useState<number | null>(null);
  const dropdownTimeoutRef = useRef<number | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const stepVideoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Track video playing states to prevent race conditions
  const videoPlayingStates = useRef<boolean[]>([]);
  const stepVideoPlayingStates = useRef<boolean[]>([]);

  const navItems = [
    { label: "Features", href: "/features", hasDropdown: true },
    { label: "Company", href: "#company" },
    { label: "Contact", href: "#contact" },
    { label: "Pricing", href: "#pricing" },
  ];

  const features = [
    {
      icon: (
        <svg className="w-5 h-5 text-[#c79c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7a5 5 0 100 10 5 5 0 000-10z" />
        </svg>
      ),
      title: "Quick Scans, Precise Mixes",
      description: "With Spectra's barcode scanning feature, simply scan the color tube to automatically save precise formulas no searching required.",
      hasVideo: true,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      videoPlaceholder: "https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=800&h=450"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-[#c79c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: "Real-Time Inventory Insights", 
      description: "Inventory data automatically updates with every use, providing real-time insights into expenses and optimizing every gram of color.",
      hasVideo: true,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      videoPlaceholder: "https://images.pexels.com/photos/590022/pexels-photo-590022.jpg?auto=compress&cs=tinysrgb&w=800&h=450"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-[#c79c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      title: "Less Waste, More Profit",
      description: "10%-25% of the products from every treatment get dumped. Say goodbye to product waste and hello to cost savings.",
      hasVideo: true,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      videoPlaceholder: "https://images.pexels.com/photos/3735747/pexels-photo-3735747.jpg?auto=compress&cs=tinysrgb&w=800&h=450"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-[#c79c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: "Optimize Inventory Management",
      description: "Optimize your inventory by knowing exactly which products you use most and least often.",
      hasVideo: true,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      videoPlaceholder: "https://images.pexels.com/photos/590016/pexels-photo-590016.jpg?auto=compress&cs=tinysrgb&w=800&h=450"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-[#c79c6d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Streamline Orders",
      description: "Smart ordering directly from the system, ensuring your stock is always accurate and based on your salon's actual usage.",
      hasVideo: true,
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      videoPlaceholder: "https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpg?auto=compress&cs=tinysrgb&w=800&h=450"
    }
  ];

  const walkthroughSteps = [
    {
      image: "/stap 1 chack in.jpeg",
      title: "Check-In",
      alt: "Spectra - Check-In action",
      description: "Client arrives and checks in through our streamlined system",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    },
    {
      image: "/stepn 2 select service.jpeg", 
      title: "Service",
      alt: "Spectra - Service action",
      description: "Professional hair service with precise color application",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
    },
    {
      image: "/step 3 scan tube.jpeg",
      title: "Scan", 
      alt: "Spectra - Scan action",
      description: "Quick barcode scan to track product usage automatically",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    },
    {
      image: "/step 4 squiz the color.jpeg",
      title: "Squeeze",
      alt: "Spectra - Squeeze action",
      description: "Precise measurement and application with zero waste",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"
    },
    {
      image: "/step 4 squiz the color.jpeg", // Using same image as placeholder for step 5
      title: "Reweigh",
      alt: "Spectra - Reweigh action",
      description: "Track leftovers, reduce waste, and start saving money",
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
    }
  ];

  // Safe video play function
  const safePlayVideo = useCallback((video: HTMLVideoElement, index: number, isStepVideo = false) => {
    if (!video) return;
    
    const playingStates = isStepVideo ? stepVideoPlayingStates.current : videoPlayingStates.current;
    
    if (video.paused || video.ended) {
      video.currentTime = 0;
      playingStates[index] = true;
      video.play().catch((err) => {
        console.warn('Video playback error:', err);
        playingStates[index] = false;
      });
    }
  }, []);

  // Safe video pause function
  const safePauseVideo = useCallback((video: HTMLVideoElement, index: number, isStepVideo = false) => {
    if (!video) return;
    
    const playingStates = isStepVideo ? stepVideoPlayingStates.current : videoPlayingStates.current;
    
    if (!video.paused) {
      video.pause();
      video.currentTime = 0;
    }
    playingStates[index] = false;
  }, []);

  // Create callback refs for feature dropdown videos
  const createFeatureVideoRef = useCallback((index: number) => {
    return (el: HTMLVideoElement | null) => {
      if (el === null && videoRefs.current[index]) {
        // Element is being unmounted, pause the video first
        safePauseVideo(videoRefs.current[index]!, index, false);
      }
      videoRefs.current[index] = el;
      if (el) {
        videoPlayingStates.current[index] = false;
      }
    };
  }, [safePauseVideo]);

  // Create callback refs for step videos
  const createStepVideoRef = useCallback((index: number) => {
    return (el: HTMLVideoElement | null) => {
      if (el === null && stepVideoRefs.current[index]) {
        // Element is being unmounted, pause the video first
        safePauseVideo(stepVideoRefs.current[index]!, index, true);
      }
      stepVideoRefs.current[index] = el;
      if (el) {
        stepVideoPlayingStates.current[index] = false;
      }
    };
  }, [safePauseVideo]);

  // Handle dropdown video playback - FIXED TO PREVENT RACE CONDITIONS
  useEffect(() => {
    // Pause all videos first
    videoRefs.current.forEach((video, index) => {
      if (video && index !== hoveredFeatureIndex) {
        safePauseVideo(video, index, false);
      }
    });

    // Play the hovered video
    if (hoveredFeatureIndex !== null && videoRefs.current[hoveredFeatureIndex]) {
      const video = videoRefs.current[hoveredFeatureIndex];
      if (video) {
        // Small delay to ensure previous video is paused
        setTimeout(() => {
          safePlayVideo(video, hoveredFeatureIndex, false);
        }, 50);
      }
    }
  }, [hoveredFeatureIndex, safePlayVideo, safePauseVideo]);

  // Handle step video hover playback - FIXED TO PREVENT RACE CONDITIONS
  useEffect(() => {
    // Pause all step videos first
    stepVideoRefs.current.forEach((video, index) => {
      if (video && index !== hoveredVideoStep) {
        safePauseVideo(video, index, true);
      }
    });

    // Play the hovered step video
    if (hoveredVideoStep !== null && stepVideoRefs.current[hoveredVideoStep]) {
      const video = stepVideoRefs.current[hoveredVideoStep];
      if (video) {
        // Small delay to ensure previous video is paused
        setTimeout(() => {
          safePlayVideo(video, hoveredVideoStep, true);
        }, 50);
      }
    }
  }, [hoveredVideoStep, safePlayVideo, safePauseVideo]);

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setIsFeatureDropdownOpen(true);
    if (hoveredFeatureIndex === null) {
      setHoveredFeatureIndex(0);
    }
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      // Pause all videos before closing dropdown
      videoRefs.current.forEach((video, index) => {
        if (video) {
          safePauseVideo(video, index, false);
        }
      });
      
      setIsFeatureDropdownOpen(false);
      setHoveredFeatureIndex(null);
    }, 300);
  };

  const handleFeatureHover = (index: number) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredFeatureIndex(index);
  };

  const handleFeatureLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      // Don't reset to null, keep the last hovered feature active
    }, 200);
  };

  const handleFeatureClick = (feature: any) => {
    if (feature.hasVideo) {
      setIsVideoModalOpen(true);
    }
  };

  const handleStepHover = (stepIndex: number) => {
    setHoveredVideoStep(stepIndex);
  };

  const handleStepLeave = () => {
    setHoveredVideoStep(null);
  };

  return (
    <div className="bg-white w-full min-h-screen font-['Inter',system-ui,sans-serif] antialiased">
      {/* Navigation bar - UPDATED TO MATCH DARK DESIGN */}
      <header className="fixed w-full top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo - RESTORED ORIGINAL COLORS */}
            <div className="flex items-center">
              <img
                className="h-8 w-auto"
                alt="Spectra Logo"
                src="/image.png"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.label} className="relative">
                  {item.hasDropdown ? (
                    <div
                      className="relative"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button className="flex items-center gap-1 text-white/70 hover:text-white font-normal text-sm transition-all duration-200">
                        {item.label}
                        <svg 
                          className={`w-3 h-3 transition-all duration-200 ${isFeatureDropdownOpen ? 'rotate-180 text-[#c79c6d]' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Features Dropdown - GLASSMORPHISM DESIGN */}
                      {isFeatureDropdownOpen && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-3">
                          {/* Floating Background Elements - Behind Glass */}
                          <div className="absolute inset-0 overflow-hidden rounded-2xl">
                            {/* Subtle Floating Orbs */}
                            <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-gradient-to-br from-[#c79c6d]/8 to-transparent rounded-full blur-2xl animate-pulse" 
                                 style={{ animationDuration: '4s' }}></div>
                            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-gradient-to-br from-purple-400/6 to-transparent rounded-full blur-xl animate-pulse" 
                                 style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
                            <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-gradient-to-br from-blue-300/5 to-transparent rounded-full blur-lg animate-pulse" 
                                 style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
                          </div>

                          {/* Main Glassmorphism Container */}
                          <div 
                            className="w-screen max-w-[65vw] min-w-[1100px] max-h-[85vh] relative overflow-hidden rounded-2xl shadow-2xl"
                            style={{ 
                              maxWidth: '65vw',
                              background: 'rgba(0, 0, 0, 0.93)',
                              backdropFilter: 'blur(25px)',
                              WebkitBackdropFilter: 'blur(25px)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              boxShadow: `
                                0 25px 50px -12px rgba(0, 0, 0, 0.9),
                                0 0 0 1px rgba(255, 255, 255, 0.08),
                                inset 0 1px 0 rgba(255, 255, 255, 0.12)
                              `
                            }}
                          >
                            {/* Inner Glow Effect */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.12] via-white/[0.04] to-transparent pointer-events-none"></div>
                            
                            <div className="flex max-h-[85vh] relative z-10">
                              {/* Left Panel - Features List */}
                              <div className="w-1/2 p-8 overflow-y-auto max-h-[85vh] relative">
                                {/* Subtle Inner Background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent rounded-l-2xl"></div>
                                
                                <div className="relative z-10">
                                  <div className="mb-8">
                                    <h3 className="font-medium text-white/95 text-xl mb-3">
                                      Features
                                    </h3>
                                    <p className="text-white/80 text-base leading-relaxed">
                                      Discover powerful tools designed for modern hair salons
                                    </p>
                                  </div>

                                  <div className="space-y-2">
                                    {features.map((feature, index) => (
                                      <div 
                                        key={index}
                                        className={`group flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                                          hoveredFeatureIndex === index 
                                            ? 'bg-white/[0.08] border border-[#c79c6d]/30 shadow-lg' 
                                            : 'hover:bg-white/[0.04] border border-transparent'
                                        }`}
                                        style={{
                                          backdropFilter: hoveredFeatureIndex === index ? 'blur(10px)' : 'none',
                                          WebkitBackdropFilter: hoveredFeatureIndex === index ? 'blur(10px)' : 'none'
                                        }}
                                        onMouseEnter={() => handleFeatureHover(index)}
                                        onMouseLeave={handleFeatureLeave}
                                        onClick={() => handleFeatureClick(feature)}
                                      >
                                        {/* Subtle Glow on Hover */}
                                        {hoveredFeatureIndex === index && (
                                          <div className="absolute inset-0 bg-gradient-to-r from-[#c79c6d]/10 via-transparent to-transparent rounded-xl"></div>
                                        )}
                                        
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 relative z-10 ${
                                          hoveredFeatureIndex === index 
                                            ? 'bg-[#c79c6d]/20 shadow-lg' 
                                            : 'bg-white/10 group-hover:bg-white/15'
                                        }`}
                                        style={{
                                          backdropFilter: 'blur(10px)',
                                          WebkitBackdropFilter: 'blur(10px)',
                                          border: hoveredFeatureIndex === index ? '1px solid rgba(199, 156, 109, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)'
                                        }}>
                                          {feature.icon}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 relative z-10">
                                          <h4 className="font-medium text-white/95 text-base mb-2 leading-tight">
                                            {feature.title}
                                          </h4>
                                          <p className="text-white/80 text-sm leading-relaxed">
                                            {feature.description}
                                          </p>
                                        </div>

                                        <div className={`transition-all duration-300 relative z-10 ${
                                          hoveredFeatureIndex === index ? 'text-[#c79c6d] opacity-100 transform translate-x-1' : 'text-white/40 opacity-0 group-hover:opacity-100'
                                        }`}>
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                          </svg>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              {/* Right Panel - Video Preview with Modern 3D UI */}
                              <div className="w-1/2 p-8 flex flex-col items-center justify-center border-l border-white/10 relative">
                                {/* Modern Background with Floating Elements */}
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/8 to-purple-600/10 rounded-r-2xl"></div>
                                
                                {/* Floating Spheres */}
                                <div className="absolute top-20 left-12 w-16 h-16 bg-gradient-to-br from-pink-400/30 to-purple-500/30 rounded-full blur-sm animate-pulse" 
                                     style={{ animationDuration: '3s' }}></div>
                                <div className="absolute top-40 right-16 w-12 h-12 bg-gradient-to-br from-purple-400/25 to-pink-500/25 rounded-full blur-sm animate-pulse" 
                                     style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
                                <div className="absolute bottom-32 left-20 w-8 h-8 bg-gradient-to-br from-pink-300/20 to-purple-400/20 rounded-full blur-sm animate-pulse" 
                                     style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                                <div className="absolute bottom-16 right-8 w-20 h-20 bg-gradient-to-br from-purple-300/15 to-pink-400/15 rounded-full blur-lg animate-pulse" 
                                     style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
                                
                                {hoveredFeatureIndex !== null && (
                                  <div className="w-full transition-all duration-500 ease-out relative z-10">
                                    {/* Modern 3D Card Container */}
                                    <div className="relative p-6 rounded-3xl"
                                         style={{
                                           background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                                           boxShadow: `
                                             0 25px 50px -12px rgba(147, 51, 234, 0.25),
                                             0 10px 30px -8px rgba(236, 72, 153, 0.15),
                                             inset 0 1px 0 rgba(255, 255, 255, 0.8)
                                           `,
                                           borderRadius: '24px',
                                           border: '1px solid rgba(255, 255, 255, 0.6)'
                                         }}>
                                      
                                      {/* 3D Video Display */}
                                      <div className="relative rounded-2xl overflow-hidden"
                                           style={{
                                             background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
                                             transform: 'perspective(1000px) rotateX(-2deg) rotateY(5deg)',
                                             boxShadow: `
                                               0 20px 40px -8px rgba(0, 0, 0, 0.4),
                                               0 8px 25px -5px rgba(147, 51, 234, 0.2),
                                               inset 0 2px 0 rgba(255, 255, 255, 0.1)
                                             `
                                           }}>
                                        
                                        {/* Modern Device Frame */}
                                        <div className="aspect-[16/10] relative overflow-hidden rounded-2xl border-4 border-gray-800">
                                          {/* Screen Content */}
                                          <div className="absolute inset-2 rounded-xl overflow-hidden">
                                            <video
                                              ref={createFeatureVideoRef(hoveredFeatureIndex)}
                                              className="w-full h-full object-cover rounded-xl"
                                              muted
                                              loop
                                              playsInline
                                              preload="metadata"
                                            >
                                              <source src={features[hoveredFeatureIndex].videoUrl} type="video/mp4" />
                                            </video>

                                            {/* Modern UI Overlay */}
                                            <div className="absolute top-2 left-2 right-2 flex justify-between items-center">
                                              {/* Status Bar */}
                                              <div className="flex items-center gap-1">
                                                <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                                                <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                                                <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                                              </div>
                                              
                                              {/* Live Indicator */}
                                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 backdrop-blur-sm">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="text-white text-xs font-medium">LIVE</span>
                                              </div>
                                            </div>

                                            {/* Bottom UI Elements */}
                                            <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                                              <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-full">
                                                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                                                <div className="w-16 h-1 bg-white/30 rounded-full"></div>
                                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Device Glow */}
                                          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-2xl"></div>
                                        </div>
                                      </div>

                                      {/* Modern Typography Section */}
                                      <div className="mt-6 text-center">
                                        <h4 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                                          {features[hoveredFeatureIndex].title}
                                        </h4>
                                        <p className="text-gray-600 text-base mb-6 leading-relaxed max-w-sm mx-auto">
                                          Ready to take your salon to the next level? Experience this feature now.
                                        </p>

                                        {/* Modern CTA Button */}
                                        <button className="w-full h-12 rounded-2xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group"
                                                style={{
                                                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                                                  color: 'white',
                                                  boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.3)'
                                                }}>
                                          <span className="relative z-10">Try it now</span>
                                          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <a
                      href={item.href}
                      className="text-white/70 hover:text-white font-normal text-sm transition-all duration-200"
                    >
                      {item.label}
                    </a>
                  )}
                </div>
              ))}
            </nav>

            {/* Desktop CTA Button - DARK THEME */}
            <div className="hidden lg:flex items-center">
              <Button className="bg-[#c79c6d] hover:bg-[#b8906b] text-white px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border-0 h-auto">
                Start free trial
              </Button>
            </div>

            {/* Mobile menu button - DARK THEME */}
            <button
              className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation - UPDATED FOR FEATURES PAGE */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-white/10 py-6 px-4">
              <div className="space-y-6">
                {navItems.map((item) => (
                  <div key={item.label}>
                    {item.hasDropdown ? (
                      <Link
                        to="/features"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block text-white/70 hover:text-white font-normal text-base py-2 transition-colors duration-200"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        className="block text-white/70 hover:text-white font-normal text-base py-2 transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    )}
                  </div>
                ))}
                <Button className="w-full bg-[#c79c6d] hover:bg-[#b8906b] text-white py-3 rounded-lg font-medium text-base mt-4">
                  Start free trial
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - IMPROVED LAYOUT & SPACING */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white pt-16">
        {/* Background Elements - More Subtle */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 right-1/5 w-72 h-72 sm:w-96 sm:h-96 lg:w-[28rem] lg:h-[28rem] bg-[#c79c6d]/3 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/6 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 bg-gray-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-12 gap-16 lg:gap-20 xl:gap-24 items-center">
            {/* Left Column - Content - EXPANDED & MORE PROMINENT */}
            <div className="lg:col-span-6 xl:col-span-7 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-light text-black leading-[1.1] mb-6 sm:mb-8">
                Cost Optimization
                <br />
                <span className="text-[#c79c6d] font-normal">
                  For Hair Salon
                </span>
              </h1>

              <p className="text-lg sm:text-xl lg:text-2xl xl:text-2xl text-gray-600 mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
                Plug & play AI for salons — cut color waste, grow profits, and
                take control of your business in minutes
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start items-center">
                <button className="w-full sm:w-auto bg-[#c79c6d] hover:bg-[#b8906b] text-white px-8 py-4 rounded-xl font-medium text-base transition-all duration-200 shadow-lg hover:shadow-xl">
                  Get started for free
                </button>
                <div className="text-center sm:text-left">
                  <p className="text-gray-500 text-base font-normal">
                    14 Days Free Trial
                  </p>
                  <p className="text-gray-400 text-sm">
                    No commitment, no charge
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Modern 3D Video Container */}
            <div className="lg:col-span-6 xl:col-span-5 relative lg:mt-8">
              {/* 3D Background with Floating Elements */}
              <div className="absolute inset-0">
                {/* Floating Spheres */}
                <div className="absolute top-12 right-20 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse" 
                     style={{ animationDuration: '4s' }}></div>
                <div className="absolute top-32 left-16 w-16 h-16 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-lg animate-pulse" 
                     style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
                <div className="absolute bottom-24 right-12 w-20 h-20 bg-gradient-to-br from-pink-300/10 to-purple-400/10 rounded-full blur-lg animate-pulse" 
                     style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
                <div className="absolute bottom-40 left-8 w-12 h-12 bg-gradient-to-br from-purple-300/25 to-pink-400/25 rounded-full blur-sm animate-pulse" 
                     style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
              </div>

              <div className="relative z-10">
                {/* Modern 3D Card */}
                <div className="relative p-6 rounded-3xl max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto"
                     style={{
                       background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
                       boxShadow: `
                         0 25px 50px -12px rgba(147, 51, 234, 0.25),
                         0 10px 30px -8px rgba(236, 72, 153, 0.15),
                         inset 0 1px 0 rgba(255, 255, 255, 0.8)
                       `,
                       borderRadius: '24px',
                       border: '1px solid rgba(255, 255, 255, 0.6)'
                     }}>
                  
                  {/* 3D Video Container */}
                  <div className="relative rounded-2xl overflow-hidden"
                       style={{
                         transform: 'perspective(1000px) rotateX(-3deg) rotateY(-2deg)',
                         boxShadow: `
                           0 20px 40px -8px rgba(0, 0, 0, 0.3),
                           0 8px 25px -5px rgba(147, 51, 234, 0.2)
                         `
                       }}>
                    
                    <div className="aspect-video rounded-2xl overflow-hidden border-4 border-gray-900">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/VA6F3PjUEX8?autoplay=0&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0&enablejsapi=1"
                        title="Spectra Hair Salon Demo"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>

                    {/* Device Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none rounded-2xl"></div>
                  </div>
                  
                  {/* Modern Typography */}
                  <div className="mt-6 text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight">
                      A New Salon Experience
                    </h3>
                    <p className="text-gray-600 text-base mb-4 leading-relaxed">
                      Ready to take your salon to the next level? Watch how Spectra transforms operations in under 2 minutes.
                    </p>

                    {/* Modern CTA Button */}
                    <button className="px-8 py-3 rounded-2xl font-semibold text-sm transition-all duration-300 relative overflow-hidden group"
                            style={{
                              background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                              color: 'white',
                              boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.3)'
                            }}>
                      <span className="relative z-10">Watch Demo</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Portrait Video Steps Section - CLEAN DESIGN WITHOUT NUMBERS */}
      <section 
        id="features-section"
        className="relative py-20 sm:py-24 lg:py-28 bg-black overflow-hidden" 
        aria-label="How it works"
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header - Dark Theme */}
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-[#c79c6d] rounded-full"></div>
              <span className="text-white/70 text-xs font-medium uppercase tracking-wider">
                HOW IT WORKS
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-white mb-4 sm:mb-6 leading-tight">
              <span className="text-[#c79c6d]">5 Simple Steps</span>
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed font-light">
              Watch real salon professionals use Spectra to streamline operations, reduce waste, and increase profits
            </p>
          </div>

          {/* Portrait Video Grid - CLEAN DESIGN WITHOUT STEP NUMBERS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 mb-16 sm:mb-20 lg:mb-24">
            {walkthroughSteps.map((step, index) => (
              <div
                key={index}
                className="group relative"
                onMouseEnter={() => handleStepHover(index)}
                onMouseLeave={handleStepLeave}
              >
                {/* Portrait Video Container - WHITE CARDS ON DARK BACKGROUND */}
                <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group-hover:-translate-y-2">
                  {/* Video/Image Container - PORTRAIT 9:16 */}
                  <div className="relative w-full aspect-[9/16] bg-gray-100 overflow-hidden">
                    {/* Background Image */}
                    <img
                      src={step.image}
                      alt={step.alt}
                      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-[#c79c6d] to-[#b8906b] flex items-center justify-center">
                            <div class="text-center text-white">
                              <div class="text-4xl mb-4">📱</div>
                              <div class="text-lg font-medium">${step.title}</div>
                            </div>
                          </div>
                        `;
                      }}
                    />

                    {/* Hover Video Overlay - SMOOTH TRANSITION */}
                    {hoveredVideoStep === index && (
                      <div className="absolute inset-0 bg-black/20">
                        <video
                          ref={createStepVideoRef(index)}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        >
                          <source src={step.videoUrl} type="video/mp4" />
                        </video>
                        
                        {/* Subtle Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                      </div>
                    )}

                    {/* Elegant Hover Highlight */}
                    <div className={`absolute inset-0 bg-[#c79c6d]/10 transition-all duration-300 ${
                      hoveredVideoStep === index ? 'opacity-100' : 'opacity-0'
                    }`}></div>
                  </div>

                  {/* Content Section - WHITE CARD CONTENT */}
                  <div className="p-4 sm:p-5 lg:p-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-black mb-2 sm:mb-3 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>

                  {/* Subtle Border Highlight on Hover */}
                  <div className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
                    hoveredVideoStep === index 
                      ? 'border-[#c79c6d]/30' 
                      : 'border-transparent'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA Section - DARK THEME */}
          <div className="text-center">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 lg:p-12 max-w-4xl mx-auto border border-white/10">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white mb-4 sm:mb-6">
                Ready to Transform Your Salon?
              </h3>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 mb-8 sm:mb-10 leading-relaxed font-light max-w-2xl mx-auto">
                Join thousands of salons already saving money and reducing waste with Spectra
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button className="w-full sm:w-auto bg-[#c79c6d] hover:bg-[#b8906b] text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 shadow-lg hover:shadow-xl">
                  Start Your Free Trial
                </button>
                
                <button className="w-full sm:w-auto bg-transparent border-2 border-white/20 hover:border-white/40 text-white hover:text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 backdrop-blur-sm">
                  Watch Full Demo
                </button>
              </div>
              
              <p className="mt-6 text-white/50 text-sm font-light">
                14-day free trial • No commitment, no charge • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Client Testimonials Section */}
      <ClientCarousel />

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-6">
          <div className="relative bg-white rounded-lg p-6 max-w-4xl w-full border border-gray-200">
            <button
              onClick={() => setIsVideoModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#c79c6d] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">Feature Demo</h3>
                <p className="text-gray-300 text-sm">Video demonstration will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};