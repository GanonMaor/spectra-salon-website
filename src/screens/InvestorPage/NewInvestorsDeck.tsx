import React, { useState } from "react";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ============================================================================
// REVENUE DATA - Real data without distributors (USD)
// ============================================================================
const REVENUE_DATA = [
  { month: 'Jan 24', israel: 6548, international: 895 },
  { month: 'Feb 24', israel: 5937, international: 260 },
  { month: 'Mar 24', israel: 8494, international: 115 },
  { month: 'Apr 24', israel: 8079, international: 117 },
  { month: 'May 24', israel: 8926, international: 0 },
  { month: 'Jun 24', israel: 5769, international: 82 },
  { month: 'Jul 24', israel: 5534, international: 1037 },
  { month: 'Aug 24', israel: 7846, international: 1078 },
  { month: 'Sep 24', israel: 7721, international: 1019 },
  { month: 'Oct 24', israel: 6629, international: 1663 },
  { month: 'Nov 24', israel: 9069, international: 2549 },
  { month: 'Dec 24', israel: 9796, international: 3623 },
  { month: 'Jan 25', israel: 7773, international: 2259 },
  { month: 'Feb 25', israel: 7519, international: 3876 },
  { month: 'Mar 25', israel: 6774, international: 3645 },
  { month: 'Apr 25', israel: 6635, international: 5654 },
  { month: 'May 25', israel: 7199, international: 5689 },
  { month: 'Jun 25', israel: 6629, international: 6828 },
  { month: 'Jul 25', israel: 7229, international: 6502 },
  { month: 'Aug 25', israel: 7712, international: 6181 },
  { month: 'Sep 25', israel: 7524, international: 5617 },
  { month: 'Oct 25', israel: 7096, international: 5482 },
  { month: 'Nov 25', israel: 7966, international: 6433 },
  { month: 'Dec 25', israel: 7190, international: 8443 },
];

// Calculate totals
const total2024 = REVENUE_DATA.slice(0, 12).reduce((sum, item) => sum + item.israel + item.international, 0);
const total2025 = REVENUE_DATA.slice(12).reduce((sum, item) => sum + item.israel + item.international, 0);
const yoyGrowth = Math.round(((total2025 / total2024) - 1) * 100);

// ============================================================================
// DESIGN TOKENS - Minimalist Apple-inspired
// ============================================================================
const tokens = {
  colors: {
    white: "#FFFFFF",
    black: "#000000",
    charcoal: "#1D1D1F",
    lightGray: "#F5F5F5",
    mediumGray: "#86868B",
    green: "#34C759",
    amber: "#FF9500",
  },
  spacing: {
    slidePadding: "clamp(60px, 8vw, 120px)",
    slideGap: "clamp(80px, 12vh, 160px)",
  },
  typography: {
    hero: "clamp(48px, 7vw, 72px)",
    h1: "clamp(32px, 5vw, 48px)",
    h2: "clamp(24px, 3.5vw, 32px)",
    body: "clamp(16px, 2vw, 18px)",
    small: "clamp(12px, 1.5vw, 14px)",
  },
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

interface SlideProps {
  children: React.ReactNode;
  bgColor?: string;
  footer?: string;
}

const Slide: React.FC<SlideProps> = ({ children, bgColor = tokens.colors.white, footer }) => (
  <section
    className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden overflow-x-hidden"
    style={{ background: bgColor, padding: tokens.spacing.slidePadding }}
  >
    <div className="w-full max-w-[1400px] mx-auto flex-1 flex flex-col justify-center px-4 sm:px-6 md:px-8">
      {children}
    </div>
    {footer && (
      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-gray-400 px-4">
        {footer}
      </p>
    )}
  </section>
);

interface SlideHeaderProps {
  title: string;
  align?: "left" | "center";
}

const SlideHeader: React.FC<SlideHeaderProps> = ({ title, align = "left" }) => (
  <h2
    className={`font-bold tracking-tight mb-8 sm:mb-12 ${align === "center" ? "text-center" : "text-left"}`}
    style={{ fontSize: tokens.typography.h1, lineHeight: 1.1, color: tokens.colors.charcoal }}
  >
    {title}
  </h2>
);

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sublabel }) => (
  <div className="p-4 sm:p-6 bg-white/10 backdrop-blur rounded-xl border border-white/20">
    <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
      {label}
    </p>
    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1">{value}</p>
    {sublabel && <p className="text-xs sm:text-sm text-gray-400">{sublabel}</p>}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NewInvestorsDeck: React.FC = () => {
  const [showVision, setShowVision] = useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "SPECTRA AI — INVESTOR PITCH DECK";
  }, []);

  return (
    <div className="bg-white">
      {/* ================================================================== */}
      {/* SLIDE 1: THE VISION */}
      {/* ================================================================== */}
      <Slide>
        {/* Logo top-left */}
        <div className="absolute top-8 left-8">
          <img
            src="/spectra-logo-new.png"
            alt="Spectra AI"
            className="h-6 sm:h-8 opacity-80"
            onError={(e) => {
              e.currentTarget.src = "/spectra_logo.png";
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto">
          <h1
            className="font-bold tracking-tight mb-6 sm:mb-8 leading-[1.05]"
            style={{ fontSize: tokens.typography.hero, color: tokens.colors.black }}
          >
            IN 2026
            <br />
            SPECTRA WILL BE
            <br />
            THE FIRST AND ONLY
            <br />
            ALL-IN-ONE AI PLATFORM FOR HAIR SALONS
          </h1>

          <p
            className="font-light mb-8 sm:mb-12 leading-relaxed"
            style={{ fontSize: tokens.typography.h2, color: tokens.colors.charcoal }}
          >
            The salon industry is at a turning point.
            <br />
            With strategic investment, Spectra AI is driving a game-changing shift.
          </p>

          {/* Subtle line accent */}
          <div className="w-16 h-0.5 bg-black mx-auto mb-6"></div>

          <p className="text-sm sm:text-base italic text-gray-500">
            Created by a hair colorist for hair colorists.
          </p>
        </div>
      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 2: COMPANY ACHIEVEMENTS */}
      {/* ================================================================== */}
      <Slide bgColor="linear-gradient(180deg, #0a0a0f 0%, #000000 100%)">
        <div className="text-center mb-12">
          <div className="inline-block px-6 py-2 rounded-full border border-white/30 mb-4">
            <p className="text-sm font-medium text-white uppercase tracking-wider">Traction</p>
          </div>
          <h2 className="text-5xl sm:text-6xl font-bold text-white mb-4">Company Achievements</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: Key Metrics */}
          <div className="space-y-6">
            <StatCard label="Annual Subscription Revenue" value="$149K" sublabel="From direct subscriptions" />
            <StatCard label="Active Subscriptions" value="180" sublabel="84 in Israel, 96 in US & England (target market)" />
            
            {/* Revenue Split & ARPU */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Intl Subscriptions</p>
                <p className="text-xl sm:text-2xl font-bold text-white">58%</p>
                <p className="text-xs text-gray-500">of Total</p>
              </div>
              <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Intl Avg/Account</p>
                <p className="text-xl sm:text-2xl font-bold text-white">$58</p>
              </div>
              <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 text-center">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Israel Avg/Account</p>
                <p className="text-xl sm:text-2xl font-bold text-white">$68</p>
              </div>
            </div>

            {/* Distributor Pilot Section */}
            <div className="p-4 sm:p-6 bg-white/10 backdrop-blur rounded-xl border border-white/20">
              <p className="text-xs sm:text-sm font-medium text-blue-400 uppercase tracking-wider mb-2">
                Distributor Pilot
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">50 Licenses · €15K</p>
              <p className="text-xs sm:text-sm text-gray-400">
                Sold to a distributor in a non-English speaking European country — validating B2B channel potential
              </p>
            </div>

            {/* L'Oreal Pilot Section */}
            <div className="p-4 sm:p-6 bg-white/10 backdrop-blur rounded-xl border border-white/20">
              <p className="text-xs sm:text-sm font-medium text-blue-400 uppercase tracking-wider mb-2">
                L'Oreal Pilot
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-white mb-1">Market Intelligence · $5.5K</p>
              <p className="text-xs sm:text-sm text-gray-400">
                2025 pilot with L'Oreal for Israeli market data license
              </p>
            </div>
          </div>

          {/* RIGHT: Revenue Chart */}
          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-lg">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-black">
              Revenue Trajectory 2024–2025
            </h3>
            
            {/* Recharts Stacked Bar Chart - Minimalist Style */}
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                  <defs>
                    <linearGradient id="gradIsrael" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1D1D1F" stopOpacity={0.85}/>
                      <stop offset="100%" stopColor="#1D1D1F" stopOpacity={0.65}/>
                    </linearGradient>
                    <linearGradient id="gradInternational" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#86868B" stopOpacity={0.7}/>
                      <stop offset="100%" stopColor="#86868B" stopOpacity={0.5}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#86868B" 
                    fontSize={9} 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    interval={1}
                    tick={{ fill: '#86868B' }}
                    axisLine={{ stroke: '#E5E7EB' }}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="#86868B" 
                    fontSize={10} 
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    tick={{ fill: '#86868B' }}
                    width={45}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1D1D1F', 
                      border: 'none', 
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    formatter={(value: number, name: string) => [
                      `$${value.toLocaleString()}`, 
                      name === 'israel' ? 'Israel' : 'International'
                    ]}
                    labelStyle={{ fontWeight: 600, marginBottom: 4, color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  />
                  <Bar 
                    dataKey="israel" 
                    stackId="revenue" 
                    fill="url(#gradIsrael)" 
                    name="israel"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="international" 
                    stackId="revenue" 
                    fill="url(#gradInternational)" 
                    name="international"
                    radius={[2, 2, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Legend - Minimalist */}
            <div className="flex justify-center gap-8 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#1D1D1F]"></div>
                <span className="text-sm text-gray-600">Israel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[#86868B]"></div>
                <span className="text-sm text-gray-600">International</span>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-900 uppercase tracking-wider mb-1">2024</p>
                  <p className="text-lg font-semibold text-gray-900">$93K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-900 uppercase tracking-wider mb-1">2025</p>
                  <p className="text-lg font-semibold text-gray-900">$149K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-900 uppercase tracking-wider mb-1">Growth</p>
                  <p className="text-lg font-semibold text-gray-900">+60%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 2.5: PRODUCT & CUSTOMER LOVE - INSTAGRAM STYLE */}
      {/* ================================================================== */}
      <Slide bgColor={tokens.colors.white}>
        {/* Instagram Gradient Header */}
        <div className="relative mb-10 sm:mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-3xl opacity-10 blur-xl"></div>
          <div className="relative text-center py-8">
            <h2 
              className="font-bold tracking-tight mb-3 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent"
              style={{ fontSize: tokens.typography.h1, lineHeight: 1.1 }}
            >
              Our Customers Love Spectra
            </h2>
            <p className="text-lg sm:text-xl text-gray-500">
              Cost optimization that works in the real world
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Problem → Solution - Compact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="bg-gray-50 rounded-xl p-5 text-center">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">The Problem</p>
              <p className="text-sm text-gray-700">Salons waste 20-40% on color products, tracking is manual, no visibility</p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 text-center border border-purple-100">
              <p className="text-xs text-purple-500 uppercase tracking-wider mb-2">The Solution</p>
              <p className="text-sm text-gray-700">iPad at color bar → real-time tracking, smart mixing, owner dashboard</p>
            </div>
          </div>

          {/* Results Strip */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-10 py-4 border-y border-gray-100">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">122K</p>
              <p className="text-xs text-gray-500">Views (90 Days)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">81%</p>
              <p className="text-xs text-gray-500">From Ads</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">8K+</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent">30K</p>
              <p className="text-xs text-gray-500">Monthly Profile Views</p>
            </div>
          </div>

          {/* Customer Video Reels - Instagram Style */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <p className="text-sm font-medium text-gray-600">Real product clips from active salons</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { video: "/instagram-reel.mp4", label: "Color mixing workflow" },
                { video: "/instagram-reel2.mp4", label: "Real-time formula tracking" },
                { video: "/instagram-reel3.mp4", label: "Dashboard analytics" },
                { video: "/instagram-reel4.mp4", label: "iPad at color bar" },
                { video: "/instagram-reel5.mp4", label: "Stylist experience" },
                { video: "/instagram-reel6.mp4", label: "Salon operations" },
              ].map((item, i) => {
                const VideoReel = () => {
                  const [isPlaying, setIsPlaying] = React.useState(false);
                  const [isMuted, setIsMuted] = React.useState(true);
                  const videoRef = React.useRef<HTMLVideoElement>(null);

                  const togglePlay = () => {
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
                      videoRef.current.muted = !videoRef.current.muted;
                      setIsMuted(videoRef.current.muted);
                    }
                  };

                  return (
                    <div
                      onClick={togglePlay}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group"
                      style={{ aspectRatio: "9/16" }}
                    >
                      <video
                        ref={videoRef}
                        src={item.video}
                        className="w-full h-full object-cover"
                        loop
                        muted
                        playsInline
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                      
                      {/* Play button - subtle */}
                      {!isPlaying && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-lg">
                            <svg className="w-5 h-5 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      )}
                      
                      {/* Mute button - subtle */}
                      <button
                        onClick={toggleMute}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {isMuted ? (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        )}
                      </button>
                      
                      {/* Label */}
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-xs font-medium leading-tight">{item.label}</p>
                      </div>
                    </div>
                  );
                };
                return <VideoReel key={i} />;
              })}
            </div>
          </div>

          {/* Instagram CTA */}
          <div className="text-center">
            <a
              href="https://www.instagram.com/spectra.ci"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              @spectra.ci · 8.2K followers
            </a>
          </div>
        </div>
      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 4: MARKETING BREAKTHROUGH - TRIPLE BUNDLE */}
      {/* ================================================================== */}
      <Slide bgColor="#FAFAFA">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-4">
            Marketing Breakthrough
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-black mb-6 tracking-tight">
            The Triple Bundle
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light mb-3">
            The strategic offer that solved our go-to-market challenge
          </p>
          <p className="text-base sm:text-lg text-gray-500 max-w-xl mx-auto font-medium">
            A proven Go To Market Winner
          </p>
        </div>

        {/* The Offer - 3 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20 max-w-5xl mx-auto">
          {[
            { title: "30-Day Free Trial", desc: "Full access, no commitment" },
            { title: "Free Equipment", desc: "Smart Scale + Premium Stand" },
            { title: "Custom Training", desc: "Complete onboarding included" },
          ].map((offer, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 text-center">
              <h4 className="text-xl sm:text-2xl font-semibold text-black mb-3">{offer.title}</h4>
              <p className="text-sm sm:text-base text-gray-500">{offer.desc}</p>
            </div>
          ))}
        </div>

        {/* Combined Results Section */}
        <div className="w-full">
          <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 shadow-sm border border-gray-100 max-w-6xl mx-auto">
            
            {/* Campaign Performance - Funnel */}
            <div className="mb-12 sm:mb-16">
              <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-10 text-center">
                Marketing Funnel (2025)
              </h4>
              
              {/* Horizontal Funnel */}
              <div className="relative max-w-6xl mx-auto">
                {/* Funnel Steps */}
                <div className="flex flex-col md:flex-row items-stretch justify-center">
                  
                  {/* Step 1: Leads */}
                  <div className="relative flex-shrink-0 w-full md:w-[380px]">
                    <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black text-white p-6 sm:p-8 h-full rounded-t-2xl md:rounded-t-none md:rounded-l-2xl shadow-xl"
                         style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%)' }}>
                      <div className="pr-4">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2">Step 1 · Leads</p>
                        <p className="text-4xl sm:text-5xl font-black mb-1">1,476</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="bg-white/10 text-white text-xs font-medium px-2 py-0.5 rounded">100%</span>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Cost per Lead</p>
                          <p className="text-2xl font-bold text-white">$25</p>
                        </div>
                      </div>
                    </div>
                    {/* Conversion Badge - Desktop */}
                    <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20">
                      <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white text-sm font-bold w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                        20%
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Conversion Arrow */}
                  <div className="md:hidden flex items-center justify-center py-2 z-10">
                    <div className="bg-gradient-to-br from-gray-700 to-gray-800 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      20% Convert
                    </div>
                  </div>

                  {/* Step 2: Trials */}
                  <div className="relative flex-shrink-0 w-full md:w-[320px] md:-ml-1">
                    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white p-6 sm:p-8 h-full shadow-xl"
                         style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 50%, calc(100% - 20px) 100%, 0 100%, 20px 50%)' }}>
                      <div className="px-2">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2">Step 2 · Trials</p>
                        <p className="text-4xl sm:text-5xl font-black mb-1">301</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="bg-white/10 text-white text-xs font-medium px-2 py-0.5 rounded">20.4%</span>
                        </div>
                        <div className="pt-4 border-t border-white/10">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider">Cost per Trial</p>
                          <p className="text-2xl font-bold text-white">$123</p>
                        </div>
                      </div>
                    </div>
                    {/* Conversion Badge - Desktop */}
                    <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20">
                      <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white text-sm font-bold w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                        32%
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Conversion Arrow */}
                  <div className="md:hidden flex items-center justify-center py-2 z-10">
                    <div className="bg-gradient-to-br from-gray-700 to-gray-900 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      32% Convert
                    </div>
                  </div>

                  {/* Step 3: Customers */}
                  <div className="relative flex-shrink-0 w-full md:w-[280px] md:-ml-1">
                    <div className="bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 text-white p-6 sm:p-8 h-full rounded-b-2xl md:rounded-b-none md:rounded-r-2xl shadow-xl"
                         style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 20px 50%)' }}>
                      <div className="pl-2">
                        <p className="text-[10px] font-semibold text-slate-300 uppercase tracking-[0.15em] mb-2">Step 3 · Customers</p>
                        <p className="text-4xl sm:text-5xl font-black mb-1">96</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded">6.5%</span>
                          <span className="text-[10px] text-slate-300">of leads</span>
                        </div>
                        <div className="pt-4 border-t border-white/20">
                          <p className="text-[10px] text-slate-300 uppercase tracking-wider">Cost per Customer</p>
                          <p className="text-2xl font-bold text-white">$385</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 mb-12 sm:mb-16"></div>

            {/* Investment & Returns - Accountant Style */}
            <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 lg:p-10">
              {/* Header Summary */}
              <div className="grid grid-cols-3 gap-4 mb-8 pb-6 border-b-2 border-gray-300">
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Total CAC</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">($37,000)</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">3-Year LTV</p>
                  <p className="text-xl sm:text-2xl font-bold text-black">$184,637</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">LTV - CAC</p>
                  <p className="text-xl sm:text-2xl font-bold text-slate-700">+$147,637</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Investment Column */}
                <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
                  <h4 className="text-xs font-semibold text-red-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    CAC Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Meta Ads (12 mo)</span>
                      <span className="text-base font-medium text-gray-900">$18,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Campaign Manager</span>
                      <span className="text-base font-medium text-gray-900">$15,000</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Equipment Gifts</span>
                      <span className="text-base font-medium text-gray-900">$4,000</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-900">
                    <span className="text-sm font-bold text-gray-900">Total CAC</span>
                    <span className="text-xl font-bold text-red-600">($37,000)</span>
                  </div>
                </div>

                {/* Returns Column */}
                <div className="bg-white rounded-xl p-5 sm:p-6 shadow-sm">
                  <h4 className="text-xs font-semibold text-green-600 uppercase tracking-[0.15em] mb-5 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Cohort LTV (96 Customers)
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">2025 ARR <span className="text-xs text-green-600 font-medium">(Actual)</span></span>
                      <span className="text-base font-medium text-gray-900">$64,728</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">2026 ARR <span className="text-xs text-gray-400">(5% churn)</span></span>
                      <span className="text-base font-medium text-gray-900">$61,492</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">2027 ARR <span className="text-xs text-gray-400">(5% churn)</span></span>
                      <span className="text-base font-medium text-gray-900">$58,417</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-gray-900">
                    <span className="text-sm font-bold text-gray-900">3-Year LTV</span>
                    <span className="text-xl font-bold text-slate-700">$184,637</span>
                  </div>
                </div>
              </div>

              {/* Bottom Summary */}
              <div className="mt-8 pt-6 border-t-2 border-gray-300">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">CAC</p>
                    <p className="text-lg font-bold text-red-600">$37K</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">LTV</p>
                    <p className="text-lg font-bold text-black">$185K</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Net LTV</p>
                    <p className="text-lg font-bold text-slate-700">$148K</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-600 to-slate-800 rounded-xl p-4 text-center shadow-lg">
                    <p className="text-[10px] text-slate-300 uppercase tracking-wider mb-1">LTV:CAC</p>
                    <p className="text-2xl font-black text-white">5.0x</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4 text-center">
                  Based on 3-year LTV (conservative). High retention expected in years 4-5.
                </p>
              </div>
            </div>
          </div>
        </div>

      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 4.5: THE ASK - INVESTMENT */}
      {/* ================================================================== */}
      {/* ================================================================== */}
      {/* THE ASK - DARK DESIGN WITH ACCENT GRADIENTS */}
      {/* ================================================================== */}
      <Slide bgColor="linear-gradient(180deg, #0a0a0f 0%, #000000 100%)">
        <div className="max-w-6xl mx-auto">
          {/* Main Header */}
          <div className="text-center mb-12">
            <div className="inline-block px-6 py-2 rounded-full border border-white/30 mb-4">
              <p className="text-sm font-medium text-white uppercase tracking-wider">Investment Opportunity</p>
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold text-white mb-4">
              From Breakthrough to Scale
            </h2>
            <p className="text-xl text-gray-400">From $149K to $575K ARR in 18 months</p>
          </div>

          {/* 01: Investment Breakdown */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-xl font-bold text-white">01</span>
              </div>
              <h3 className="text-2xl font-bold text-white">Investment Breakdown</h3>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Funding Round</p>
                  <p className="text-4xl font-bold text-white">$300K</p>
                  <p className="text-xs text-gray-500 mt-1">Your investment</p>
                </div>
                <div className="flex items-center justify-center text-2xl text-gray-600">+</div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">MRR Income</p>
                  <p className="text-4xl font-bold text-white">$223K</p>
                  <p className="text-xs text-gray-500 mt-1">18mo subscriptions</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Budget</p>
                  <p className="text-4xl font-bold text-white">$523K</p>
                  <p className="text-xs text-gray-500 mt-1">18 months @ $29K/mo</p>
                </div>
              </div>

              {/* Budget Allocation Header */}
              <div className="text-center my-8">
                <p className="text-sm text-gray-400 uppercase tracking-wider">Budget Allocation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Go-to-Market</p>
                  <p className="text-3xl font-bold text-white mb-1">$237K</p>
                  <p className="text-sm text-gray-400">45% • 396 new customers</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Product & R&D</p>
                  <p className="text-3xl font-bold text-white mb-1">$171K</p>
                  <p className="text-sm text-gray-400">33% • AI Booking system</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Operations</p>
                  <p className="text-3xl font-bold text-white mb-1">$115K</p>
                  <p className="text-sm text-gray-400">22% • Team & support</p>
                </div>
              </div>
            </div>
          </div>

          {/* 02: ARR Buildup */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-xl font-bold text-white">02</span>
              </div>
              <h3 className="text-2xl font-bold text-white">ARR Growth Model</h3>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white font-medium">Current ARR <span className="text-xs text-gray-400">(171 accounts)</span></span>
                  <span className="text-xl font-bold text-white">$149,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white font-medium">+ New Customer ARR <span className="text-xs text-gray-500">(396 new salons)</span></span>
                  <span className="text-xl font-bold text-white">+$275,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white font-medium">+ Expansion ARR <span className="text-xs text-gray-400">(AI upsell to 226)</span></span>
                  <span className="text-xl font-bold text-white">+$165,000</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-white font-medium">- Churn <span className="text-xs text-gray-400">(5% annual)</span></span>
                  <span className="text-xl font-bold text-white">-$14,000</span>
                </div>
                <div className="flex justify-between items-center py-4 bg-white/5 rounded-2xl px-6 border-t-2 border-white/20">
                  <span className="text-white font-bold text-lg">Target ARR (Q2 2027)</span>
                  <span className="text-2xl font-bold text-white">$575,000</span>
                </div>
              </div>
            </div>
          </div>

          {/* 03: Unit Economics */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                <span className="text-xl font-bold text-white">03</span>
              </div>
              <h3 className="text-2xl font-bold text-white">3-Year Cohort LTV</h3>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* CAC Side */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span className="font-semibold text-white">Total CAC</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-gray-300">Campaign Budget</span>
                      <span className="font-semibold text-white">$122,000</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-gray-300">New Customers</span>
                      <span className="font-semibold text-white">396 salons</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-gray-300">CAC per Customer</span>
                      <span className="font-semibold text-white">$308</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 mt-2 border-t-2 border-white/20 bg-white/5 rounded-xl px-4">
                    <span className="font-semibold text-white">Total Investment</span>
                    <span className="text-xl font-bold text-white">($122,000)</span>
                  </div>
                </div>

                {/* LTV Side */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                    <span className="font-semibold text-white">3-Year LTV</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-gray-300">Year 1 ARR</span>
                      <span className="font-semibold text-white">$275,616</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-gray-300">Year 2 ARR <span className="text-xs text-gray-400">(5% churn)</span></span>
                      <span className="font-semibold text-white">$261,835</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/10">
                      <span className="text-gray-300">Year 3 ARR <span className="text-xs text-gray-400">(5% churn)</span></span>
                      <span className="font-semibold text-white">$248,743</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-3 mt-2 border-t-2 border-white/20 bg-white/5 rounded-xl px-4">
                    <span className="font-semibold text-white">Total Revenue</span>
                    <span className="text-xl font-bold text-white">$786,194</span>
                  </div>
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/10">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">CAC</p>
                  <p className="text-2xl font-bold text-white">-$122K</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/10">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">LTV (3yr)</p>
                  <p className="text-2xl font-bold text-white">+$786K</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/10">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Net Profit</p>
                  <p className="text-2xl font-bold text-white">+$664K</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-5 text-center border border-white/10">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">LTV:CAC</p>
                  <p className="text-2xl font-bold text-white">6.4x</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 5: INVESTMENT IMPACT - COMPREHENSIVE GROWTH JOURNEY */}
      {/* ================================================================== */}
      <Slide bgColor={tokens.colors.white}>
        <SlideHeader title="Investment Impact" align="center" />
        <p className="text-lg sm:text-xl text-gray-500 text-center mb-10 -mt-4">
          Your $300K investment fuels a 4x growth journey
        </p>

        {/* Main Growth Chart - Extended Timeline */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 sm:p-10 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Company Growth Trajectory</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-full">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-blue-700">Projected</span>
            </div>
          </div>

          {/* Extended SVG Chart */}
          <svg viewBox="0 0 800 320" className="w-full" style={{ maxHeight: "400px" }}>
            {/* Background Grid */}
            <defs>
              <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="baseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1D1D1F" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#1D1D1F" stopOpacity="0.4" />
              </linearGradient>
            </defs>

            {/* Horizontal grid lines */}
            <line x1="60" y1="60" x2="760" y2="60" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="60" y1="120" x2="760" y2="120" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="60" y1="180" x2="760" y2="180" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4,4" />
            <line x1="60" y1="240" x2="760" y2="240" stroke="#E5E7EB" strokeWidth="1" />

            {/* Y-axis labels */}
            <text x="50" y="65" fontSize="10" fill="#9CA3AF" textAnchor="end">$575K</text>
            <text x="50" y="125" fontSize="10" fill="#9CA3AF" textAnchor="end">$400K</text>
            <text x="50" y="185" fontSize="10" fill="#9CA3AF" textAnchor="end">$200K</text>
            <text x="50" y="245" fontSize="10" fill="#9CA3AF" textAnchor="end">$0</text>

            {/* Investment marker line */}
            <line x1="140" y1="50" x2="140" y2="250" stroke="#EF4444" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
            <rect x="100" y="30" width="80" height="20" rx="4" fill="#FEE2E2" />
            <text x="140" y="43" fontSize="9" fill="#DC2626" textAnchor="middle" fontWeight="600">INVESTMENT</text>

            {/* Before Investment - Slow Growth Area */}
            <path
              d="M 60,220 Q 100,218 140,215 L 140,240 L 60,240 Z"
              fill="#9CA3AF"
              opacity="0.3"
            />

            {/* After Investment - Accelerated Growth Area */}
            <path
              d="M 140,215 Q 250,195 340,160 Q 430,125 520,95 Q 610,70 700,55 L 760,50 L 760,240 L 140,240 Z"
              fill="url(#growthGradient)"
            />

            {/* Growth Line */}
            <path
              d="M 60,220 Q 100,218 140,215 Q 250,195 340,160 Q 430,125 520,95 Q 610,70 700,55 L 760,50"
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Key milestones */}
            <circle cx="60" cy="220" r="5" fill="#9CA3AF" />
            <circle cx="140" cy="215" r="6" fill="#EF4444" stroke="#FFF" strokeWidth="2" />
            <circle cx="340" cy="160" r="5" fill="#2563eb" />
            <circle cx="520" cy="95" r="6" fill="#3B82F6" stroke="#FFF" strokeWidth="2" />
            <circle cx="700" cy="55" r="6" fill="#1d4ed8" stroke="#FFF" strokeWidth="2" />
            <circle cx="760" cy="50" r="7" fill="#1e40af" stroke="#FFF" strokeWidth="3" />

            {/* X-axis labels */}
            <text x="60" y="260" fontSize="10" fill="#9CA3AF" textAnchor="middle">Today</text>
            <text x="140" y="260" fontSize="10" fill="#DC2626" textAnchor="middle" fontWeight="600">Q1 26</text>
            <text x="250" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q2 26</text>
            <text x="340" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q3 26</text>
            <text x="430" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q4 26</text>
            <text x="520" y="260" fontSize="10" fill="#3B82F6" textAnchor="middle" fontWeight="600">Q1 27</text>
            <text x="610" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q2 27</text>
            <text x="700" y="260" fontSize="10" fill="#1d4ed8" textAnchor="middle" fontWeight="600">Q3 27</text>
            <text x="760" y="260" fontSize="10" fill="#1e40af" textAnchor="middle" fontWeight="600">Q4 27</text>

            {/* Value annotations */}
            <rect x="45" y="200" width="45" height="18" rx="4" fill="#F3F4F6" />
            <text x="68" y="213" fontSize="10" fill="#374151" textAnchor="middle" fontWeight="600">$149K</text>

            <rect x="300" y="140" width="50" height="18" rx="4" fill="#DBEAFE" />
            <text x="325" y="153" fontSize="10" fill="#1e40af" textAnchor="middle" fontWeight="600">$280K</text>

            <rect x="480" y="75" width="55" height="18" rx="4" fill="#DBEAFE" />
            <text x="508" y="88" fontSize="10" fill="#1D4ED8" textAnchor="middle" fontWeight="600">$427K</text>
            <text x="520" y="110" fontSize="8" fill="#3B82F6" textAnchor="middle">AI Booking</text>

            <rect x="720" y="30" width="55" height="20" rx="4" fill="#1e40af" />
            <text x="748" y="44" fontSize="11" fill="#FFF" textAnchor="middle" fontWeight="700">$575K</text>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span className="text-xs text-gray-600">Pre-Investment</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Investment Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">AI Features Launch</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-xs text-gray-600">Target ARR</span>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">18-Month Execution Timeline</h3>
          
          {/* Horizontal Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-blue-500 to-blue-700 rounded-full"></div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { q: "Q1 26", title: "Launch", items: ["Team hiring", "Funnel optimization"], color: "red" },
                { q: "Q2 26", title: "Build", items: ["AI Booking dev", "WhatsApp"], color: "orange" },
                { q: "Q3 26", title: "Expand", items: ["CRM module", "Marketing push"], color: "yellow" },
                { q: "Q4 26", title: "Scale", items: ["US market", "$320K ARR"], color: "blue" },
                { q: "Q1 27", title: "AI Launch", items: ["AI Booking live", "40% upsell"], color: "indigo", highlight: true },
                { q: "Q4 27", title: "Target", items: ["$575K ARR", "3.9x growth"], color: "blue", highlight: true },
              ].map((phase, i) => (
                <div key={i} className="relative pt-10">
                  <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${
                    phase.highlight ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-gray-300'
                  }`}></div>
                  <div className={`text-center p-3 rounded-xl ${
                    phase.highlight ? 'bg-blue-50 border-2 border-blue-600' : 'bg-gray-50 border border-gray-100'
                  }`}>
                    <p className={`text-xs font-bold mb-1 ${phase.highlight ? 'text-blue-700' : 'text-gray-500'}`}>{phase.q}</p>
                    <p className={`text-sm font-semibold mb-2 ${phase.highlight ? 'text-blue-800' : 'text-gray-900'}`}>{phase.title}</p>
                    {phase.items.map((item, j) => (
                      <p key={j} className="text-[10px] text-gray-500 leading-tight">{item}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-8">
          Conservative projections based on validated 2024-2025 performance data
        </p>
      </Slide>

      {/* ================================================================== */}
      {/* VISION REVEAL SECTION - INTERACTIVE */}
      {/* ================================================================== */}
      <section className="relative bg-gradient-to-b from-gray-900 to-black py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          {!showVision ? (
            <button
              onClick={() => setShowVision(true)}
              className="group relative px-16 py-6 bg-white/5 backdrop-blur border border-white/20 text-white text-lg font-semibold rounded-full hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            >
              <span className="relative z-10">Explore the Long-Term Vision</span>
            </button>
          ) : (
            <button
              onClick={() => setShowVision(false)}
              className="px-8 py-3 bg-white/5 border border-white/20 text-white text-sm rounded-full hover:bg-white/10 transition-all"
            >
              ← Back to Current Plan
            </button>
          )}
        </div>
      </section>

      {/* ================================================================== */}
      {/* THE VISION - SERIES A SCALE PLAN */}
      {/* ================================================================== */}
      {showVision && (
        <Slide bgColor="linear-gradient(135deg, #1a0a14 0%, #0a0a0f 50%, #000000 100%)">
          <div className="max-w-6xl mx-auto">
            {/* Dramatic Header */}
            <div className="text-center mb-16">
              <div className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 mb-6 shadow-lg shadow-pink-500/50">
                <p className="text-sm font-bold text-white uppercase tracking-widest">The Vision • Series A</p>
              </div>
              <h2 className="text-6xl sm:text-7xl font-black text-white mb-6">
                After We <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Prove It</span>
              </h2>
              <p className="text-2xl text-gray-300">18 months from now, we raise $2M and scale globally</p>
            </div>

            {/* The $2M Plan */}
            <div className="mb-12">
              <div className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 backdrop-blur-xl rounded-3xl p-10 border border-pink-500/30 shadow-2xl">
                <div className="text-center mb-8">
                  <p className="text-sm text-pink-400 uppercase tracking-wider mb-2">Series A Round</p>
                  <p className="text-7xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">$2M</p>
                  <p className="text-gray-400 mt-2">Plus $1.5M in subscription revenue = $3.5M total budget</p>
                </div>

                {/* Budget Allocation - Same Ratios, Bigger Numbers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/5 border border-pink-500/20 rounded-2xl p-6 text-center">
                    <p className="text-xs text-pink-300 uppercase tracking-wider mb-2">Go-to-Market</p>
                    <p className="text-4xl font-bold text-white mb-1">$1.58M</p>
                    <p className="text-sm text-gray-400">45% • 2,650 new customers</p>
                  </div>
                  <div className="bg-white/5 border border-pink-500/20 rounded-2xl p-6 text-center">
                    <p className="text-xs text-pink-300 uppercase tracking-wider mb-2">Product & R&D</p>
                    <p className="text-4xl font-bold text-white mb-1">$1.16M</p>
                    <p className="text-sm text-gray-400">33% • Global platform</p>
                  </div>
                  <div className="bg-white/5 border border-pink-500/20 rounded-2xl p-6 text-center">
                    <p className="text-xs text-pink-300 uppercase tracking-wider mb-2">Operations</p>
                    <p className="text-4xl font-bold text-white mb-1">$770K</p>
                    <p className="text-sm text-gray-400">22% • Scale team</p>
                  </div>
                </div>

                {/* Revenue Streams */}
                <div className="border-t border-pink-500/20 pt-8">
                  <p className="text-sm text-pink-400 uppercase tracking-wider mb-6 text-center">Additional Revenue Streams</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-pink-500/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Data Licenses</p>
                      <p className="text-2xl font-bold text-pink-400">$150K</p>
                      <p className="text-xs text-gray-500">L'Oreal + partners</p>
                    </div>
                    <div className="bg-pink-500/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Distributors</p>
                      <p className="text-2xl font-bold text-pink-400">$90K</p>
                      <p className="text-xs text-gray-500">3 × 100 licenses</p>
                    </div>
                    <div className="bg-pink-500/10 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Enterprise</p>
                      <p className="text-2xl font-bold text-pink-400">$200K</p>
                      <p className="text-xs text-gray-500">Chain accounts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 36-Month Projection */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">36-Month Explosive Growth</h3>
              
              {/* Timeline Visualization */}
              <div className="space-y-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <p className="text-sm text-gray-400">Month 18</p>
                    <p className="text-lg font-bold text-white">$575K</p>
                  </div>
                  <div className="flex-1 h-3 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <p className="text-sm text-gray-400">Month 36</p>
                    <p className="text-lg font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">$2.8M</p>
                  </div>
                  <div className="flex-1 h-3 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-400 rounded-full shadow-lg shadow-pink-500/50"></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <p className="text-sm text-gray-400">Month 54</p>
                    <p className="text-lg font-bold bg-gradient-to-r from-pink-300 to-rose-300 bg-clip-text text-transparent">$5.2M+</p>
                  </div>
                  <div className="flex-1 h-3 bg-gradient-to-r from-pink-500 via-rose-400 to-pink-300 rounded-full shadow-lg shadow-pink-400/50"></div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Total Customers</p>
                  <p className="text-4xl font-bold text-white">3,217</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">ARR</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">$5.2M</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Growth</p>
                  <p className="text-4xl font-bold text-pink-400">35x</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Valuation</p>
                  <p className="text-4xl font-bold text-white">$30M+</p>
                </div>
              </div>

              {/* Sales Roadmap Graph */}
              <div className="mt-10 pt-8 border-t border-pink-500/20">
                <h4 className="text-xl font-bold text-white mb-6 text-center">54-Month Sales Roadmap</h4>
                <div className="bg-black/30 rounded-2xl p-8">
                  <svg viewBox="0 0 900 400" className="w-full" style={{ maxHeight: "400px" }}>
                    {/* Gradient Definitions */}
                    <defs>
                      <linearGradient id="pinkGrowthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.05" />
                      </linearGradient>
                      <linearGradient id="pinkLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f9a8d4" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="60" y1="60" x2="840" y2="60" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4,4" />
                    <line x1="60" y1="140" x2="840" y2="140" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4,4" />
                    <line x1="60" y1="220" x2="840" y2="220" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.1" strokeDasharray="4,4" />
                    <line x1="60" y1="300" x2="840" y2="300" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.2" />

                    {/* Y-axis Labels */}
                    <text x="50" y="65" fontSize="11" fill="#9ca3af" textAnchor="end" fontWeight="600">$5M</text>
                    <text x="50" y="145" fontSize="11" fill="#9ca3af" textAnchor="end">$3M</text>
                    <text x="50" y="225" fontSize="11" fill="#9ca3af" textAnchor="end">$1M</text>
                    <text x="50" y="305" fontSize="11" fill="#9ca3af" textAnchor="end">$0</text>

                    {/* Growth Area Fill */}
                    <path
                      d="M 60,285 L 200,270 L 340,250 L 480,160 L 620,100 L 760,55 L 840,45 L 840,300 L 60,300 Z"
                      fill="url(#pinkGrowthGradient)"
                    />

                    {/* Growth Line */}
                    <path
                      d="M 60,285 Q 130,277 200,270 Q 270,260 340,250 Q 410,200 480,160 Q 550,125 620,100 Q 690,70 760,55 L 840,45"
                      fill="none"
                      stroke="url(#pinkLineGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                    {/* Milestones */}
                    <circle cx="60" cy="285" r="6" fill="#f472b6" stroke="#fff" strokeWidth="2" />
                    <circle cx="200" cy="270" r="6" fill="#ec4899" stroke="#fff" strokeWidth="2" />
                    <circle cx="340" cy="250" r="7" fill="#ec4899" stroke="#fff" strokeWidth="2" />
                    <circle cx="480" cy="160" r="8" fill="#f43f5e" stroke="#fff" strokeWidth="3" />
                    <circle cx="620" cy="100" r="8" fill="#ec4899" stroke="#fff" strokeWidth="3" />
                    <circle cx="760" cy="55" r="9" fill="#f472b6" stroke="#fff" strokeWidth="3" />
                    <circle cx="840" cy="45" r="10" fill="#ec4899" stroke="#fff" strokeWidth="4" />

                    {/* X-axis Labels */}
                    <text x="60" y="330" fontSize="11" fill="#f472b6" textAnchor="middle" fontWeight="600">Today</text>
                    <text x="200" y="330" fontSize="11" fill="#9ca3af" textAnchor="middle">M6</text>
                    <text x="340" y="330" fontSize="11" fill="#f9a8d4" textAnchor="middle" fontWeight="600">M18</text>
                    <text x="480" y="330" fontSize="11" fill="#f43f5e" textAnchor="middle" fontWeight="700">M24</text>
                    <text x="620" y="330" fontSize="11" fill="#ec4899" textAnchor="middle" fontWeight="700">M36</text>
                    <text x="760" y="330" fontSize="11" fill="#f472b6" textAnchor="middle" fontWeight="700">M48</text>
                    <text x="840" y="330" fontSize="11" fill="#ec4899" textAnchor="middle" fontWeight="700">M54</text>

                    {/* Value Annotations */}
                    <rect x="35" y="267" width="50" height="20" rx="4" fill="#ec4899" fillOpacity="0.2" />
                    <text x="60" y="281" fontSize="11" fill="#f472b6" textAnchor="middle" fontWeight="700">$149K</text>

                    <rect x="315" y="232" width="50" height="20" rx="4" fill="#ec4899" fillOpacity="0.3" />
                    <text x="340" y="246" fontSize="11" fill="#f9a8d4" textAnchor="middle" fontWeight="700">$575K</text>

                    <rect x="455" y="142" width="50" height="20" rx="4" fill="#f43f5e" />
                    <text x="480" y="156" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="700">$1.2M</text>

                    <rect x="595" y="82" width="50" height="20" rx="4" fill="#ec4899" />
                    <text x="620" y="96" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="700">$2.8M</text>

                    <rect x="735" y="37" width="50" height="20" rx="4" fill="#f472b6" />
                    <text x="760" y="51" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="700">$4.5M</text>

                    <rect x="815" y="27" width="50" height="22" rx="4" fill="#ec4899" />
                    <text x="840" y="42" fontSize="13" fill="#fff" textAnchor="middle" fontWeight="900">$5.2M</text>

                    {/* Milestone Labels */}
                    <text x="200" y="255" fontSize="9" fill="#f9a8d4" textAnchor="middle">Traction</text>
                    <text x="340" y="235" fontSize="9" fill="#f9a8d4" textAnchor="middle">Seed Exit</text>
                    <text x="480" y="145" fontSize="9" fill="#fda4af" textAnchor="middle">Series A</text>
                    <text x="620" y="85" fontSize="9" fill="#fda4af" textAnchor="middle">Scale</text>
                    <text x="760" y="40" fontSize="9" fill="#fda4af" textAnchor="middle">Dominance</text>
                  </svg>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-6 mt-6 pt-4 border-t border-pink-500/10">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-400 rounded-full"></div>
                      <span className="text-xs text-gray-400">Current</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-rose-400 rounded-full"></div>
                      <span className="text-xs text-gray-400">$300K Round (M0-18)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-pink-600 rounded-full"></div>
                      <span className="text-xs text-gray-400">$2M Round (M18-54)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Tagline */}
              <div className="mt-10 pt-8 border-t border-pink-500/20 text-center">
                <p className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 bg-clip-text text-transparent">
                  From $149K to $5.2M ARR in 54 months
                </p>
                <p className="text-gray-400 mt-2">That's the power of proven metrics + strategic capital</p>
              </div>
            </div>
          </div>
        </Slide>
      )}
    </div>
  );
};
