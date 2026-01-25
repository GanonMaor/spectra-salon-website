import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ============================================================================
// DESIGN TOKENS - VIXTION/FUTURE Work Style
// ============================================================================
const tokens = {
  colors: {
    background: "#FAFAF8", // warm white
    text: "#111111", // almost black
    muted: "#6B7280", // grey
    border: "#E5E7EB", // light grey for borders
    // Pastel accents
    cyan: "rgba(103, 232, 249, 0.4)",
    pink: "rgba(244, 114, 182, 0.35)",
    lavender: "rgba(167, 139, 250, 0.35)",
    mint: "rgba(52, 211, 153, 0.35)",
  },
  spacing: {
    sectionPadding: "96px",
    sectionGap: "48px",
    cardPadding: "32px",
    gridGap: "24px",
  },
  typography: {
    h1: "clamp(40px, 6vw, 72px)",
    h2: "clamp(32px, 4vw, 48px)",
    h3: "clamp(18px, 2vw, 20px)",
    body: "16px",
    small: "14px",
    label: "12px",
  },
};

// ============================================================================
// PASTEL BLOBS COMPONENT
// ============================================================================
interface PastelBlobsProps {
  variant?: "hero" | "section" | "minimal";
}

const PastelBlobs: React.FC<PastelBlobsProps> = ({ variant = "section" }) => {
  // Blob configurations - static for performance
  const blobs = {
    hero: [
      { color: tokens.colors.cyan, size: "clamp(300px, 45vw, 500px)", top: "15%", left: "5%" },
      { color: tokens.colors.pink, size: "clamp(250px, 40vw, 450px)", top: "25%", right: "10%" },
      { color: tokens.colors.lavender, size: "clamp(150px, 25vw, 300px)", bottom: "15%", left: "15%" },
    ],
    section: [
      { color: tokens.colors.cyan, size: "clamp(150px, 35vw, 400px)", top: "10%", right: "-10%" },
      { color: tokens.colors.pink, size: "clamp(120px, 30vw, 350px)", bottom: "20%", left: "-15%" },
    ],
    minimal: [
      { color: tokens.colors.lavender, size: "clamp(100px, 25vw, 300px)", top: "20%", right: "5%" },
    ],
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {blobs[variant].map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle, ${blob.color} 0%, transparent 70%)`,
            opacity: 0.8,
            top: blob.top,
            bottom: (blob as any).bottom,
            left: (blob as any).left,
            right: blob.right,
          }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// SECTION SHELL COMPONENT - Slide Header & Wrapper
// ============================================================================
interface SectionShellProps {
  children: React.ReactNode;
  sectionLabel?: string;
  pageNumber?: string;
  className?: string;
  blobs?: "hero" | "section" | "minimal" | "none";
  background?: "white" | "off-white";
}

const SectionShell: React.FC<SectionShellProps> = ({
  children,
  sectionLabel = "SPECTRA AI",
  pageNumber,
  className = "",
  blobs = "section",
  background = "off-white",
}) => {
  return (
    <section
      className={`relative py-12 sm:py-16 md:py-24 lg:py-32 xl:py-40 overflow-hidden ${className}`}
      style={{
        backgroundColor: background === "white" ? "#FFFFFF" : tokens.colors.background,
      }}
    >
      {/* Pastel Blobs */}
      {blobs !== "none" && <PastelBlobs variant={blobs} />}

      {/* Slide Header */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10">
        <div className="flex justify-between items-center mb-6 sm:mb-8 md:mb-10">
          <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-xs font-medium text-gray-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] truncate max-w-[70%]">
            {sectionLabel}
          </span>
          {pageNumber && (
            <span className="text-[9px] sm:text-[10px] md:text-[11px] lg:text-xs font-medium text-gray-400 tracking-wide">
              {pageNumber}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10">
        {children}
      </div>
    </section>
  );
};

// ============================================================================
// DECK TITLE COMPONENT - Section titles with number
// ============================================================================
interface DeckTitleProps {
  number?: string;
  title: string;
  subtitle?: string;
  alignment?: "left" | "center";
}

const DeckTitle: React.FC<DeckTitleProps> = ({
  number,
  title,
  subtitle,
  alignment = "left",
}) => {
  // Mobile: always centered. Desktop: follow alignment prop
  const isCentered = alignment === "center";
  
  return (
    <div className={`relative mb-8 sm:mb-10 md:mb-12 lg:mb-16 text-center ${isCentered ? "" : "lg:text-left"}`}>
      {/* Large faint number */}
      {number && (
        <span
          className="absolute -top-4 sm:-top-6 md:-top-8 lg:-top-12 font-semibold text-[60px] sm:text-[80px] md:text-[120px] lg:text-[180px] leading-none tracking-tight select-none pointer-events-none left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0"
          style={{
            color: "rgba(0,0,0,0.03)",
            zIndex: 0,
          }}
        >
          {number}
        </span>
      )}
      
      {/* Title */}
      <h2
        className="relative z-10 font-semibold text-gray-900 tracking-tight text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
        style={{ lineHeight: 1.1 }}
      >
        {title}
      </h2>
      
      {/* Subtle underline */}
      <div
        className={`mt-3 sm:mt-4 h-[2px] bg-gray-900 mx-auto ${isCentered ? "" : "lg:mx-0"}`}
        style={{ width: "48px" }}
      />
      
      {/* Subtitle */}
      {subtitle && (
        <p className={`mt-3 sm:mt-4 text-gray-500 max-w-2xl text-sm sm:text-base leading-relaxed mx-auto ${isCentered ? "" : "lg:mx-0"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// SLIDE CARD COMPONENT - Premium card style
// ============================================================================
interface SlideCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const SlideCard: React.FC<SlideCardProps> = ({
  children,
  className = "",
  hover = true,
}) => {
  return (
    <div
      className={`
        relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10
        border border-gray-100
        transition-all duration-500
        ${hover ? "hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1" : "shadow-sm"}
        ${className}
      `}
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FEFEFE 100%)",
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// FEATURE BLOCK COMPONENT
// ============================================================================
interface FeatureBlockProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
}

const FeatureBlock: React.FC<FeatureBlockProps> = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-center text-center">
      {icon && (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-2 sm:mb-4">
          <span className="text-base sm:text-lg">{icon}</span>
        </div>
      )}
      <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">
        {title}
      </h4>
      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-[180px] sm:max-w-[200px]">
        {description}
      </p>
    </div>
  );
};

// ============================================================================
// LAYER CARD COMPONENT - For Growth Plan
// ============================================================================
interface LayerCardProps {
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  accent?: "cyan" | "pink" | "mint";
}

const LayerCard: React.FC<LayerCardProps> = ({
  tag,
  title,
  description,
  bullets,
  accent = "cyan",
}) => {
  const accentColors = {
    cyan: "bg-cyan-50 border-cyan-100 text-cyan-700",
    pink: "bg-pink-50 border-pink-100 text-pink-700",
    mint: "bg-emerald-50 border-emerald-100 text-emerald-700",
  };

  return (
    <SlideCard className="h-full">
      <span
        className={`inline-block px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-3 sm:mb-4 ${accentColors[accent]}`}
      >
        {tag}
      </span>
      <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">{description}</p>
      <ul className="space-y-1.5 sm:space-y-2">
        {bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 sm:mt-2 flex-shrink-0" />
            {bullet}
          </li>
        ))}
      </ul>
    </SlideCard>
  );
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================
interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sublabel }) => {
  return (
    <div className="text-center p-3 sm:p-4 md:p-6 bg-white rounded-xl sm:rounded-2xl border border-gray-100">
      <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-1 sm:mb-2">{label}</p>
      <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900">{value}</p>
      {sublabel && <p className="text-xs sm:text-sm text-gray-500 mt-1">{sublabel}</p>}
    </div>
  );
};

// ============================================================================
// CUSTOM CHART COMPONENTS - Clean presentation style
// ============================================================================

// Revenue data
const revenueData = [
  { month: "Jan 24", israel: 20627, intl: 178 },
  { month: "Mar 24", israel: 26754, intl: 308 },
  { month: "Jun 24", israel: 18172, intl: 221 },
  { month: "Sep 24", israel: 24321, intl: 2743 },
  { month: "Dec 24", israel: 30857, intl: 9749 },
  { month: "Mar 25", israel: 21338, intl: 68708 },
  { month: "Jun 25", israel: 20880, intl: 18372 },
  { month: "Sep 25", israel: 23701, intl: 15111 },
  { month: "Dec 25", israel: 22649, intl: 22712 },
];

const CleanRevenueChart: React.FC = () => {
  const maxValue = Math.max(...revenueData.map(d => d.israel + d.intl));
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end justify-between gap-1 sm:gap-2 md:gap-4 h-48 sm:h-56 md:h-64 lg:h-80 min-w-[280px]">
        {revenueData.map((d, i) => {
          const israelHeight = (d.israel / maxValue) * 100;
          const intlHeight = (d.intl / maxValue) * 100;
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-2 min-w-[28px]">
              <div className="w-full flex flex-col justify-end h-40 sm:h-48 md:h-56 lg:h-72">
                <div
                  style={{ height: `${intlHeight}%` }}
                  className="w-full bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t-sm"
                />
                <div
                  style={{ height: `${israelHeight}%` }}
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-300"
                />
              </div>
              <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 whitespace-nowrap">
                {d.month}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6 text-[10px] sm:text-xs">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-blue-400" />
          <span className="text-gray-500">Israel</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-emerald-400" />
          <span className="text-gray-500">International</span>
        </div>
      </div>
    </div>
  );
};

// ARR Projection Chart
const arrProjectionData = [
  { quarter: "Q1 2026", base: 155, new: 0, expansion: 0 },
  { quarter: "Q2 2026", base: 155, new: 25, expansion: 0 },
  { quarter: "Q3 2026", base: 155, new: 60, expansion: 15 },
  { quarter: "Q4 2026", base: 155, new: 100, expansion: 35 },
  { quarter: "Q1 2027", base: 155, new: 150, expansion: 55 },
  { quarter: "Q2 2027", base: 155, new: 200, expansion: 80 },
];

const ARRProjectionChart: React.FC = () => {
  const maxValue = Math.max(...arrProjectionData.map(d => d.base + d.new + d.expansion));
  
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-end justify-between gap-2 sm:gap-4 md:gap-6 lg:gap-8 h-48 sm:h-56 md:h-64 lg:h-80 min-w-[280px]">
        {arrProjectionData.map((d, i) => {
          const total = d.base + d.new + d.expansion;
          const baseHeight = (d.base / maxValue) * 100;
          const newHeight = (d.new / maxValue) * 100;
          const expansionHeight = (d.expansion / maxValue) * 100;
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 sm:gap-2 min-w-[40px]">
              <div className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-900">${total}K</div>
              <div className="w-full flex flex-col justify-end h-36 sm:h-44 md:h-48 lg:h-64">
                {d.expansion > 0 && (
                  <div
                    style={{ height: `${expansionHeight}%` }}
                    className="w-full bg-gradient-to-t from-violet-400 to-violet-300 rounded-t-sm"
                  />
                )}
                {d.new > 0 && (
                  <div
                    style={{ height: `${newHeight}%` }}
                    className="w-full bg-gradient-to-t from-cyan-400 to-cyan-300"
                  />
                )}
                <div
                  style={{ height: `${baseHeight}%` }}
                  className="w-full bg-gradient-to-t from-gray-300 to-gray-200"
                />
              </div>
              <span className="text-[8px] sm:text-[10px] md:text-xs text-gray-400 whitespace-nowrap">
                {d.quarter}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mt-4 sm:mt-6 text-[10px] sm:text-xs flex-wrap">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gray-300" />
          <span className="text-gray-500">Base ARR</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-cyan-400" />
          <span className="text-gray-500">New Customers</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-violet-400" />
          <span className="text-gray-500">Expansion</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VIDEO COLLAGE COMPONENT - Real Videos with Instagram-style display
// ============================================================================
interface VideoItemProps {
  src: string;
  label: string;
  index: number;
}

const VideoItem: React.FC<VideoItemProps> = ({ src, label, index }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className="group relative aspect-[9/16] lg:aspect-[9/14] bg-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-200 cursor-pointer shadow-sm hover:shadow-lg transition-shadow duration-300"
      onClick={handlePlay}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted={isMuted}
        playsInline
        preload="metadata"
        onLoadedData={() => setIsLoaded(true)}
      />
      
      {/* Loading State */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Play/Pause Overlay */}
      <div 
        className={`absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-300 ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}
      >
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-white/95 shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          {isPlaying ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-700 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      </div>
      
      {/* Sound Control Button - Bottom Right */}
      <button
        onClick={toggleMute}
        className="absolute bottom-14 sm:bottom-16 right-3 w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center transition-colors duration-200 border border-white/20 z-10"
      >
        {isMuted ? (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
          </svg>
        ) : (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        )}
      </button>
      
      {/* Label */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/60 to-transparent">
        <p className="text-white text-xs sm:text-sm lg:text-base font-medium">{label}</p>
      </div>
      
      {/* Corner accent */}
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white/80" />
    </div>
  );
};

const VideoCollage: React.FC = () => {
  const videos = [
    { src: "/instagram-reel.mp4", label: "Color mixing workflow" },
    { src: "/instagram-reel2.mp4", label: "Real-time formula tracking" },
    { src: "/instagram-reel3.mp4", label: "Dashboard analytics" },
    { src: "/instagram-reel4.mp4", label: "iPad at color bar" },
    { src: "/instagram-reel5.mp4", label: "Stylist experience" },
    { src: "/instagram-reel6.mp4", label: "Salon operations" },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
      {videos.map((video, i) => (
        <VideoItem key={i} src={video.src} label={video.label} index={i} />
      ))}
    </div>
  );
};

// ============================================================================
// ROADMAP TILE COMPONENT
// ============================================================================
interface RoadmapTileProps {
  quarter: string;
  title: string;
  items: string[];
  size?: "large" | "small";
}

const RoadmapTile: React.FC<RoadmapTileProps> = ({ quarter, title, items, size = "small" }) => {
  return (
    <SlideCard className={size === "large" ? "md:col-span-2" : ""}>
      {/* Large faint quarter label */}
      <span
        className="absolute top-4 right-4 font-bold text-5xl md:text-6xl select-none pointer-events-none"
        style={{ color: "rgba(0,0,0,0.04)" }}
      >
        {quarter}
      </span>
      
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{quarter}</span>
      <h4 className="font-semibold text-gray-900 text-lg mt-2 mb-4">{title}</h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </SlideCard>
  );
};

// ============================================================================
// CTA BUTTON COMPONENT
// ============================================================================
interface CTAButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

const CTAButton: React.FC<CTAButtonProps> = ({ children, variant = "primary", onClick }) => {
  const baseStyles = "inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 w-full sm:w-auto";
  
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg hover:shadow-gray-900/20 hover:-translate-y-0.5 active:scale-[0.98]",
    secondary: "bg-white text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
  };

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]}`}>
      {children}
    </button>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export const InvestorPageNewDesign: React.FC = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "SPECTRA AI — INVESTOR SNAPSHOT";
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: tokens.colors.background }}>
      {/* Global Presentation Header - Static */}
      <div className="fixed top-0 left-0 right-0 z-[100] px-4 sm:px-6 md:px-10 py-4 sm:py-6 pointer-events-none">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center border-b border-gray-900/5 pb-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-[10px] sm:text-[11px] font-bold text-gray-900 uppercase tracking-[0.2em]">
              SPECTRA AI
            </span>
            <span className="w-px h-3 bg-gray-200" />
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-500 uppercase tracking-[0.2em] whitespace-nowrap">
              INVESTOR SNAPSHOT
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 tracking-wide">
            2026–2027
          </span>
        </div>
      </div>

      {/* ================================================================== */}
      {/* HERO SECTION (Slide 00) */}
      {/* ================================================================== */}
      {/* HERO - Reduced height, tighter layout, premium feel */}
      <SectionShell
        sectionLabel=""
        pageNumber=""
        blobs="hero"
        className="py-0 sm:py-0 md:py-0 lg:py-0 xl:py-0 min-h-[72vh] sm:min-h-[78vh] flex items-center pt-16 pb-10 sm:pt-20 sm:pb-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6 sm:gap-8 md:gap-12 lg:gap-14 items-center">
          {/* Left: Text Content - Centered on mobile */}
          <div className="relative z-10 text-center lg:text-left px-2 sm:px-0">
            {/* Small label */}
            <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-4">
              A premium AI operating layer for salons
            </p>
            
            {/* Main headline */}
            <h1 className="font-semibold text-gray-900 leading-[1.05] tracking-tight mb-4 sm:mb-5 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              SPECTRA AI<br />
              <span className="text-gray-500/80">INVESTOR SNAPSHOT</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 font-medium mb-3 sm:mb-4">
              Real traction. Clear growth plan. Built for global scale.
            </p>
            
            {/* Body text */}
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-lg leading-relaxed mx-auto lg:mx-0">
              Spectra helps salons run faster and smarter — from the iPad at the color bar 
              to real-time business visibility. We're already live with paying customers 
              and recurring revenue, and we're scaling internationally.
            </p>
            
            {/* Premium CTA Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start items-center lg:items-start">
              {/* Primary - Black pill */}
              <button className="bg-gray-900 text-white rounded-full px-6 py-3 text-sm font-medium hover:bg-gray-800 hover:shadow-lg transition-all duration-200 w-full sm:w-auto max-w-xs sm:max-w-none">
                View Growth Forecast
              </button>
              {/* Secondary - Ghost pill */}
              <button className="bg-white border border-gray-200 text-gray-700 rounded-full px-6 py-3 text-sm font-medium hover:border-gray-300 hover:shadow-md transition-all duration-200 w-full sm:w-auto max-w-xs sm:max-w-none">
                See Product Snapshot
              </button>
            </div>
            
            {/* Footnote */}
            <p className="mt-6 sm:mt-8 text-[10px] sm:text-xs text-gray-400">
              All projections are conservative and exclude reseller upside.
            </p>
          </div>
          
          {/* Right: Visual Element - Static blobs + Badge */}
          <div className="relative hidden lg:flex items-center justify-start lg:-translate-x-6">
            <div className="relative w-full max-w-[410px] aspect-square">
              {/* Large blob - static */}
              <div
                className="absolute -top-8 right-0 w-56 h-56 rounded-full opacity-70"
                style={{
                  background: "radial-gradient(circle, rgba(103, 232, 249, 0.5) 0%, rgba(167, 139, 250, 0.3) 50%, transparent 70%)",
                }}
              />
              {/* Medium blob - static */}
              <div
                className="absolute bottom-12 -left-8 w-72 h-72 rounded-full opacity-60"
                style={{
                  background: "radial-gradient(circle, rgba(244, 114, 182, 0.45) 0%, rgba(167, 139, 250, 0.25) 50%, transparent 70%)",
                }}
              />
              {/* Small accent blob - static */}
              <div
                className="absolute top-1/2 right-12 w-40 h-40 rounded-full opacity-50"
                style={{
                  background: "radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, transparent 60%)",
                }}
              />
              
              {/* Badge - static */}
              <div className="absolute top-[28%] left-[18%] bg-white/90 rounded-2xl px-5 py-4 shadow-lg border border-white/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-400 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Live ARR</p>
                    <p className="text-sm font-semibold text-gray-900">$155K+</p>
                  </div>
                </div>
              </div>
              
              {/* Second badge - static */}
              <div className="absolute bottom-[34%] right-4 bg-white/90 rounded-full px-4 py-2 shadow-md border border-white/50">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-orange-300 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                  </div>
                  <span className="text-xs font-medium text-gray-700">AI-Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================== */}
      {/* SECTION 01 — PRODUCT SNAPSHOT */}
      {/* ================================================================== */}
      <SectionShell
        sectionLabel="01 — PRODUCT SNAPSHOT"
        pageNumber="Page 2"
        blobs="minimal"
        background="white"
      >
        <DeckTitle
          number="01"
          title="The Product"
          subtitle="What salons use today — in real workflows, not demos."
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-start">
          {/* Left: Description */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">
              Spectra turns the iPad at the color bar into a real-time operating system for the salon.
              It helps teams mix faster, reduce mistakes, stay consistent across stylists, and track 
              formulas automatically.
            </p>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8">
              Owners gain operational visibility — without adding admin work.
            </p>
            
            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <FeatureBlock
                icon={<span className="text-lg">🎨</span>}
                title="Color Intelligence"
                description="Smart formula tracking and consistency"
              />
              <FeatureBlock
                icon={<span className="text-lg">⚡</span>}
                title="Real-time Ops"
                description="Live dashboard for owners"
              />
              <FeatureBlock
                icon={<span className="text-lg">📊</span>}
                title="Analytics"
                description="Business insights without effort"
              />
              <FeatureBlock
                icon={<span className="text-lg">🤖</span>}
                title="AI Powered"
                description="Smart recommendations built in"
              />
            </div>
          </div>
          
          {/* Right: Video Collage - Shows first on mobile */}
          <div className="order-1 lg:order-2">
            <VideoCollage />
            <p className="text-[10px] sm:text-xs text-gray-400 text-center mt-3 sm:mt-4">
              Real product clips from active salons
            </p>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================== */}
      {/* SECTION 02 — TRACTION & ARR */}
      {/* ================================================================== */}
      <SectionShell
        sectionLabel="02 — TRACTION"
        pageNumber="Page 3"
        blobs="section"
      >
        <DeckTitle
          number="02"
          title="Live SaaS Revenue"
          subtitle="Recurring revenue from paying salons — a stable floor to scale from."
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
          {/* Left: Text (2 cols) */}
          <div className="lg:col-span-2 order-2 lg:order-1 text-center lg:text-left">
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-6">
              Spectra operates as a live SaaS business with paying customers and recurring revenue.
              Baseline ARR reflects standard SaaS churn assumptions, partially offset by retention 
              improvements and reactivations.
            </p>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <StatCard label="Paying Salons" value="225" sublabel="Direct customers" />
              <StatCard label="Combined ARR" value="$155K" sublabel="Recurring revenue" />
              <StatCard label="International" value="42%" sublabel="Of revenue" />
              <StatCard label="LTV/CAC" value="8x" sublabel="Unit economics" />
            </div>
            
            <p className="text-[10px] sm:text-xs text-gray-400 mt-4 sm:mt-6">
              * Distributor annual licenses are excluded from monthly recurring baseline projections.
            </p>
          </div>
          
          {/* Right: Chart (3 cols) - Shows first on mobile */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <SlideCard>
              <h4 className="font-medium text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">Revenue Trajectory 2024–2025</h4>
              <CleanRevenueChart />
            </SlideCard>
          </div>
        </div>
      </SectionShell>

      {/* ================================================================== */}
      {/* SECTION 03 — GEOGRAPHIC SPLIT */}
      {/* ================================================================== */}
      <SectionShell
        sectionLabel="03 — MARKET SPLIT"
        pageNumber="Page 4"
        blobs="minimal"
        background="white"
      >
        <DeckTitle
          number="03"
          title="Israel + International"
          subtitle="A deliberate shift from local beta to global scale."
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <SlideCard>
            <h4 className="font-semibold text-gray-900 text-lg mb-4">The Strategic Shift</h4>
            <p className="text-gray-600 leading-relaxed mb-4">
              2024 was our beta year, focused mainly on Israel. In 2025 we intentionally shifted 
              focus to international growth, prioritizing global distribution and expansion outside Israel.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Israel remained stable while international became the main growth engine by design.
            </p>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Israel (Stable)</p>
                  <p className="text-2xl font-semibold text-gray-900">~$90K</p>
                  <p className="text-sm text-gray-500">Mature market</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">International (Growth)</p>
                  <p className="text-2xl font-semibold text-emerald-600">~$65K</p>
                  <p className="text-sm text-gray-500">Primary focus</p>
                </div>
              </div>
            </div>
          </SlideCard>
          
          <SlideCard>
            {/* Simple geographic visualization */}
            <div className="relative h-full min-h-[300px] flex items-center justify-center">
              <div className="relative">
                {/* Israel circle */}
                <div className="absolute -left-16 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-blue-100 border-2 border-blue-200 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs font-medium text-blue-600">Israel</p>
                    <p className="text-lg font-bold text-blue-700">58%</p>
                  </div>
                </div>
                
                {/* International circle */}
                <div className="w-44 h-44 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-xs font-medium text-emerald-600">International</p>
                    <p className="text-2xl font-bold text-emerald-700">42%</p>
                    <p className="text-xs text-emerald-500">& growing</p>
                  </div>
                </div>
              </div>
            </div>
          </SlideCard>
        </div>
      </SectionShell>

      {/* ================================================================== */}
      {/* SECTION 04 — 18-MONTH GROWTH PLAN */}
      {/* ================================================================== */}
      <SectionShell
        sectionLabel="04 — 18-MONTH PLAN"
        pageNumber="Page 5"
        blobs="section"
      >
        <DeckTitle
          number="04"
          title="Capital-Efficient Scaling"
          subtitle="Focused deployment with measurable execution milestones."
        />
        
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6 sm:mb-8 max-w-3xl text-center lg:text-left mx-auto lg:mx-0">
          We're deploying <span className="font-semibold text-gray-900">$200K over 6 quarters</span> (Q1 2026 – Q2 2027) 
          to accelerate customer acquisition and improve conversion through better automation and lead management.
        </p>
        
        {/* Layer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <LayerCard
            tag="BASELINE"
            title="Base ARR"
            description="Stable recurring revenue from existing paying salons."
            bullets={[
              "Proven subscription floor",
              "Active customers + recurring usage",
              "Foundation for all growth layers",
            ]}
            accent="cyan"
          />
          <LayerCard
            tag="PRIMARY ENGINE"
            title="New Customers"
            description="Marketing-driven acquisition based on validated funnel metrics."
            bullets={[
              "Warm pipeline already collected",
              "Improved lead handling + automation",
              "Conversion-focused growth",
            ]}
            accent="pink"
          />
          <LayerCard
            tag="Q3 2026+"
            title="Expansion"
            description="Upsell and ARPU expansion once full feature set is ready."
            bullets={[
              "CRM + Booking + POS add-ons",
              "Applies to existing + new customers",
              "Expansion begins Q3 2026",
            ]}
            accent="mint"
          />
        </div>
        
        <p className="text-xs text-gray-400 text-center">
          Lean budget. High leverage. Built on 2025 performance data.
        </p>
      </SectionShell>

      {/* ================================================================== */}
      {/* SECTION 05 — ARR PROJECTION */}
      {/* ================================================================== */}
      <SectionShell
        sectionLabel="05 — ARR FORECAST"
        pageNumber="Page 6"
        blobs="minimal"
        background="white"
      >
        <DeckTitle
          number="05"
          title="ARR Growth Projection"
          subtitle="Baseline + acquisition first, expansion later."
        />
        
        <SlideCard className="p-8 md:p-12">
          <ARRProjectionChart />
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 text-center max-w-2xl mx-auto">
              Projections are conservative and built on existing traction. Expansion is modeled 
              from Q3 2026 onward, aligned with product readiness.
            </p>
          </div>
        </SlideCard>
      </SectionShell>

      {/* ================================================================== */}
      {/* SECTION 06 — RESELLER UPSIDE */}
      {/* ================================================================== */}
      <SectionShell
        sectionLabel="06 — UPSIDE"
        pageNumber="Page 7"
        blobs="section"
      >
        <DeckTitle
          number="06"
          title="Reseller Growth Channel"
          subtitle="High-leverage distribution without heavy CAC."
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="text-center lg:text-left">
            <p className="text-gray-600 leading-relaxed mb-6">
              We've already seen strong early traction through international distributors.
              Reseller partnerships can unlock growth multipliers with minimal marketing spend — 
              and are <span className="font-semibold">not included in the base forecast</span>.
            </p>
            
            <div className="space-y-4">
              {[
                { text: "Low CAC, high leverage", icon: "📈" },
                { text: "Proven early distributor success (e.g., Portugal)", icon: "🇵🇹" },
                { text: "Adds upside beyond the core model", icon: "✨" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center lg:justify-start gap-3 p-4 bg-white rounded-xl border border-gray-100"
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <SlideCard>
            <div className="relative h-full min-h-[280px] flex flex-col justify-center">
              <span
                className="absolute top-0 right-0 font-bold text-7xl md:text-8xl select-none pointer-events-none"
                style={{ color: "rgba(0,0,0,0.03)" }}
              >
                +
              </span>
              
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-2">
                EXCLUDES RESELLER UPSIDE
              </p>
              <p className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
                Conservative Model
              </p>
              <p className="text-gray-500 leading-relaxed">
                All projections shown exclude reseller revenue. Distributor deals like 
                Portugal (50 annual licenses, March 2025) represent pure upside.
              </p>
            </div>
          </SlideCard>
        </div>
      </SectionShell>

      {/* ================================================================== */}
      {/* SECTION 07 — AI LAYER */}
      {/* ================================================================== */}
      <SectionShell
        sectionLabel="07 — AI LAYER"
        pageNumber="Page 8"
        blobs="minimal"
        background="white"
      >
        <DeckTitle
          number="07"
          title="AI That Drives Execution"
          subtitle="Not hype — practical intelligence inside daily salon workflows."
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="text-center lg:text-left">
            <p className="text-gray-600 leading-relaxed mb-8">
              Spectra applies intelligence where it matters: consistency, speed, and operational clarity.
              We use data-driven automation and smart recommendations to help salons perform better — 
              with minimal extra effort.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "Formula intelligence & consistency",
                "Workflow automation & follow-ups",
                "Usage insights and performance signals",
                "Smart recommendations (roadmap)",
                "Assistant / voice layer (future)",
              ].map((item, i) => (
                <div key={i} className="flex items-start justify-center lg:justify-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <SlideCard className="bg-gradient-to-br from-violet-50 to-cyan-50 border-violet-100">
            <div className="flex items-center justify-center h-full min-h-[280px]">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                  <span className="text-4xl">🤖</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 mb-2">Practical AI</p>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  Intelligence that makes daily operations smoother, not more complex.
                </p>
              </div>
            </div>
          </SlideCard>
        </div>
      </SectionShell>

      {/* ================================================================== */}
      {/* SECTION 08 — ROADMAP */}
      {/* ================================================================== */}
      <SectionShell
        sectionLabel="08 — ROADMAP"
        pageNumber="Page 9"
        blobs="section"
      >
        <DeckTitle
          number="08"
          title="Development Roadmap"
          subtitle="Quarterly milestones through 2027."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RoadmapTile
            quarter="Q1"
            title="Foundation & Automation"
            items={[
              "Improved lead management system",
              "Automated onboarding flows",
              "Marketing funnel optimization",
            ]}
            size="large"
          />
          <RoadmapTile
            quarter="Q2"
            title="Product Enhancement"
            items={[
              "AI Booking Assistance launch",
              "WhatsApp integration",
              "Dashboard 2.0",
            ]}
          />
          <RoadmapTile
            quarter="Q3"
            title="Expansion Ready"
            items={[
              "CRM module release",
              "POS integrations (IL + US)",
              "ARPU expansion begins",
            ]}
          />
          <RoadmapTile
            quarter="Q4"
            title="Scale & Growth"
            items={[
              "US market expansion",
              "Trade show presence",
              "Target: $500K ARR",
            ]}
          />
        </div>
      </SectionShell>

      {/* ================================================================== */}
      {/* FINAL CTA SECTION */}
      {/* ================================================================== */}
      <section 
        className="relative min-h-[80vh] flex items-center justify-center overflow-hidden py-16 sm:py-20 md:py-24"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* Subtle background blobs - static */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full opacity-80"
            style={{
              background: `radial-gradient(circle, ${tokens.colors.cyan} 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] rounded-full opacity-70"
            style={{
              background: `radial-gradient(circle, ${tokens.colors.pink} 0%, transparent 70%)`,
            }}
          />
        </div>

        {/* Centered content */}
        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-4 sm:mb-6">
            Join the Journey
          </p>
          
          <h2 className="font-semibold text-gray-900 leading-tight tracking-tight mb-4 sm:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
            Ready to Scale
          </h2>
          
          <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto">
            We're building the first all-in-one AI platform for salons — already live, already monetized.
          </p>
          
          <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
            <CTAButton>Request the Full Deck</CTAButton>
            <CTAButton variant="secondary">Book a Call</CTAButton>
            <CTAButton variant="secondary">See the Product</CTAButton>
          </div>
          
          <p className="text-[10px] sm:text-xs text-gray-400">
            All numbers are directional and based on current traction and execution assumptions.
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER */}
      {/* ================================================================== */}
      <footer className="py-8 sm:py-10 md:py-12 border-t border-gray-100" style={{ backgroundColor: tokens.colors.background }}>
        <div className="max-w-[1200px] mx-auto px-3 sm:px-4 md:px-6 lg:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-medium text-gray-900">SPECTRA AI</span>
              <span className="text-gray-300">|</span>
              <span className="text-xs sm:text-sm text-gray-500">© 2026</span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-400 text-center">
              Premium AI for the beauty industry
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InvestorPageNewDesign;
