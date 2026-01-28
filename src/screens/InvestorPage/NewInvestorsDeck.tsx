import React from "react";
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
    style={{ backgroundColor: bgColor, padding: tokens.spacing.slidePadding }}
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
  <div className="p-4 sm:p-6">
    <p className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
      {label}
    </p>
    <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-1">{value}</p>
    {sublabel && <p className="text-xs sm:text-sm text-gray-500">{sublabel}</p>}
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const NewInvestorsDeck: React.FC = () => {
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
      <Slide bgColor={tokens.colors.lightGray}>
        <SlideHeader title="Company Achievements" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: Key Metrics */}
          <div className="space-y-6">
            <StatCard label="Annual Subscription Revenue" value="$149K" sublabel="From direct subscriptions" />
            <StatCard label="Active Subscriptions" value="180" sublabel="84 in Israel, 96 in US & England (target market)" />
            
            {/* Revenue Split & ARPU */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Intl Subscriptions</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">58%</p>
                <p className="text-xs text-gray-500">of Total</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Intl Avg/Account</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">$58</p>
              </div>
              <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-100 text-center">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Israel Avg/Account</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">$68</p>
              </div>
            </div>

            {/* Distributor Pilot Section */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <p className="text-xs sm:text-sm font-medium text-blue-600 uppercase tracking-wider mb-2">
                Distributor Pilot
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">50 Licenses · €15K</p>
              <p className="text-xs sm:text-sm text-gray-600">
                Sold to a distributor in a non-English speaking European country — validating B2B channel potential
              </p>
            </div>
          </div>

          {/* RIGHT: Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
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

            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">2024</p>
                  <p className="text-lg font-semibold text-gray-900">$93K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">2025</p>
                  <p className="text-lg font-semibold text-gray-900">$149K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Growth</p>
                  <p className="text-lg font-semibold text-green-600">+60%</p>
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
              className="font-bold tracking-tight mb-3"
              style={{ fontSize: tokens.typography.h1, lineHeight: 1.1, color: tokens.colors.charcoal }}
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
              <p className="text-2xl sm:text-3xl font-bold text-black">122K</p>
              <p className="text-xs text-gray-500">Views (90 Days)</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-black">81%</p>
              <p className="text-xs text-gray-500">From Ads</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-black">8K+</p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-black">30K</p>
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
            Triple Bundle
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light">
            The strategic offer that solved our go-to-market challenge
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
                    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 sm:p-8 h-full rounded-t-2xl md:rounded-t-none md:rounded-l-2xl shadow-xl"
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
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                        20%
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Conversion Arrow */}
                  <div className="md:hidden flex items-center justify-center py-2 z-10">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      20% Convert
                    </div>
                  </div>

                  {/* Step 2: Trials */}
                  <div className="relative flex-shrink-0 w-full md:w-[320px] md:-ml-1">
                    <div className="bg-gradient-to-br from-gray-700 via-gray-600 to-gray-700 text-white p-6 sm:p-8 h-full shadow-xl"
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
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold w-10 h-10 rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                        32%
                      </div>
                    </div>
                  </div>
                  
                  {/* Mobile Conversion Arrow */}
                  <div className="md:hidden flex items-center justify-center py-2 z-10">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      32% Convert
                    </div>
                  </div>

                  {/* Step 3: Customers */}
                  <div className="relative flex-shrink-0 w-full md:w-[280px] md:-ml-1">
                    <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-green-600 text-white p-6 sm:p-8 h-full rounded-b-2xl md:rounded-b-none md:rounded-r-2xl shadow-xl"
                         style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 20px 50%)' }}>
                      <div className="pl-2">
                        <p className="text-[10px] font-semibold text-green-100 uppercase tracking-[0.15em] mb-2">Step 3 · Customers</p>
                        <p className="text-4xl sm:text-5xl font-black mb-1">96</p>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="bg-white/20 text-white text-xs font-medium px-2 py-0.5 rounded">6.5%</span>
                          <span className="text-[10px] text-green-100">of leads</span>
                        </div>
                        <div className="pt-4 border-t border-white/20">
                          <p className="text-[10px] text-green-100 uppercase tracking-wider">Cost per Customer</p>
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
                  <p className="text-xl sm:text-2xl font-bold text-green-600">+$147,637</p>
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
                    <span className="text-xl font-bold text-green-600">$184,637</span>
                  </div>
                </div>
              </div>

              {/* Bottom Summary */}
              <div className="mt-8 pt-6 border-t-2 border-gray-300">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">CAC</p>
                    <p className="text-lg font-bold text-red-600">-$37K</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">LTV</p>
                    <p className="text-lg font-bold text-black">+$185K</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Net LTV</p>
                    <p className="text-lg font-bold text-green-600">+$148K</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-center shadow-lg">
                    <p className="text-[10px] text-green-100 uppercase tracking-wider mb-1">LTV:CAC</p>
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
      <Slide bgColor={tokens.colors.white}>
        {/* Header - The Ask */}
        <div className="text-center mb-10 sm:mb-12">
          <SlideHeader title="The Ask" align="center" />
          <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto -mt-4 mb-6">
            Turn your investment into a money maker
          </p>
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl shadow-lg">
            <span className="text-lg font-medium">We are raising</span>
            <span className="text-4xl sm:text-5xl font-bold">$300,000</span>
          </div>
          
          {/* How we get to $523K */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-3 text-center">
                <p className="text-xs text-blue-600 mb-1">Investment</p>
                <p className="text-xl font-bold text-blue-700">$300,000</p>
              </div>
              <span className="text-2xl text-gray-400 font-light">+</span>
              <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3 text-center">
                <p className="text-xs text-green-600 mb-1">Subscription Income</p>
                <p className="text-xl font-bold text-green-700">$223,000</p>
              </div>
              <span className="text-2xl text-gray-400 font-light">=</span>
              <div className="bg-gray-900 rounded-xl px-5 py-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Total Budget</p>
                <p className="text-xl font-bold text-white">$523,000</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              18 months of subscription revenue funds the remainder of operations
            </p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Chapter 1: The 18-Month Plan */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-full mb-4">
                Chapter 1
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                The 18-Month Plan
              </h3>
              <p className="text-gray-500 max-w-xl mx-auto">
                A $523,000 total budget strategically allocated across three pillars
              </p>
            </div>
            
            {/* Budget Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 sm:p-8 text-white mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total 18-Month Budget</p>
                  <p className="text-4xl sm:text-5xl font-bold">$523,000</p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-xs text-gray-400">Monthly Burn Rate</p>
                    <p className="text-lg font-semibold">$29,000/mo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Budget Segmentation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">📈</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">45%</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Sales & Marketing</h4>
                <p className="text-2xl font-bold text-blue-600 mb-2">$237,000</p>
                <p className="text-xs text-gray-500">$13,166/month</p>
              </div>
              
              <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">🤖</span>
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded">33%</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">R&D</h4>
                <p className="text-2xl font-bold text-green-600 mb-2">$171,000</p>
                <p className="text-xs text-gray-500">$9,500/month</p>
              </div>
              
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">⚙️</span>
                  <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">22%</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">Operations</h4>
                <p className="text-2xl font-bold text-purple-600 mb-2">$115,000</p>
                <p className="text-xs text-gray-500">$6,389/month</p>
              </div>
            </div>
          </div>

          {/* Chapter 2: Income from Marketing */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full mb-4">
                Chapter 2
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Income from Marketing
              </h3>
              <p className="text-gray-500 max-w-xl mx-auto">
                Based on our proven metrics and validated funnel
              </p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* The Story */}
              <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-white border-b border-gray-100">
                <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                  {/* Investment */}
                  <div className="flex-1">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-2">Campaign Budget</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900">$122,000</p>
                    <p className="text-sm text-gray-500 mt-1">allocated to paid acquisition</p>
                  </div>
                  
                  {/* Arrow */}
                  <div className="hidden md:flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-xl">→</span>
                    </div>
                  </div>
                  
                  {/* Result */}
                  <div className="flex-1">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-2">New Subscribers</p>
                    <p className="text-3xl sm:text-4xl font-bold text-gray-900">396</p>
                    <p className="text-sm text-gray-500 mt-1">new salons onboarded</p>
                  </div>
                </div>
              </div>
              
              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
                <div className="p-4 sm:p-6 text-center">
                  <p className="text-xs text-gray-500 mb-1">CAC</p>
                  <p className="text-xl font-bold text-gray-900">$308</p>
                </div>
                <div className="p-4 sm:p-6 text-center">
                  <p className="text-xs text-gray-500 mb-1">ARPU</p>
                  <p className="text-xl font-bold text-gray-900">$58/mo</p>
                </div>
                <div className="p-4 sm:p-6 text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Accounts</p>
                  <p className="text-xl font-bold text-gray-900">567</p>
                </div>
                <div className="p-4 sm:p-6 text-center bg-blue-50">
                  <p className="text-xs text-blue-600 mb-1">Expected ARR</p>
                  <p className="text-xl font-bold text-blue-700">$410,000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter 3: Income from R&D */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-full mb-4">
                Chapter 3
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Income from R&D
              </h3>
              <p className="text-gray-500 max-w-xl mx-auto">
                The AI Booking system will 2x our ARPU
              </p>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* The Vision */}
              <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-50 to-white">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Within 18 months we are going to <span className="font-semibold text-indigo-700">increase stickiness</span> and 
                  <span className="font-semibold text-indigo-700"> increase the average price per subscriber</span> by adding new features 
                  and by developing the <span className="font-semibold text-indigo-700">first intelligent Booking system based on AI</span>.
                </p>
                
                <div className="bg-indigo-100/50 rounded-xl p-5 border border-indigo-200">
                  <p className="text-sm text-indigo-800 font-medium mb-3">
                    Our conservative forecast: 40% of customers will use our new AI booking system
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">40%</span>
                      <span className="text-sm text-gray-700">of 567 = <strong>226 salons</strong></span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Price Transformation */}
              <div className="p-6 sm:p-8 border-t border-gray-100">
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Current ARPU</p>
                    <p className="text-3xl font-bold text-gray-400">$58/mo</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-0.5 bg-gradient-to-r from-gray-300 to-indigo-500"></div>
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-sm">2x</span>
                    </div>
                    <div className="w-16 h-0.5 bg-indigo-500"></div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-xs text-indigo-600 mb-1">New ARPU with AI</p>
                    <p className="text-3xl font-bold text-indigo-600">$119/mo</p>
                  </div>
                </div>
              </div>
              
              {/* Result */}
              <div className="p-6 sm:p-8 bg-indigo-600 text-white text-center">
                <p className="text-sm text-indigo-200 mb-2">Expected ARR by Q2 2027</p>
                <p className="text-4xl sm:text-5xl font-bold">$575,432</p>
              </div>
            </div>
          </div>

          {/* The Summary */}
          <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-8 sm:p-12">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 bg-white/10 text-white text-xs font-medium rounded-full mb-4">
                The Bottom Line
              </span>
              <p className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">$575K ARR</p>
              <p className="text-lg text-gray-400">by Q2 2027</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-blue-400">$523K</p>
                <p className="text-xs text-gray-400 mt-1">Total Investment</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-green-400">567</p>
                <p className="text-xs text-gray-400 mt-1">Total Accounts</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-purple-400">$119</p>
                <p className="text-xs text-gray-400 mt-1">Avg ARPU</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">3.9x</p>
                <p className="text-xs text-gray-400 mt-1">ARR Growth</p>
              </div>
            </div>
            
            <div className="text-center pt-6 border-t border-gray-700">
              <p className="text-gray-400">
                Marketing brings <span className="text-blue-400 font-semibold">396 new salons</span> → 
                R&D doubles ARPU to <span className="text-green-400 font-semibold">$119/mo</span> → 
                <span className="text-white font-semibold"> $575K ARR</span>
              </p>
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
          Your investment + subscription income = $523K to fuel a 4x growth journey
        </p>

        {/* Main Growth Chart - Extended Timeline */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 sm:p-10 mb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Company Growth Trajectory</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Projected</span>
            </div>
          </div>

          {/* Extended SVG Chart */}
          <svg viewBox="0 0 800 320" className="w-full" style={{ maxHeight: "400px" }}>
            {/* Background Grid */}
            <defs>
              <linearGradient id="growthGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
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
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Key milestones */}
            <circle cx="60" cy="220" r="5" fill="#9CA3AF" />
            <circle cx="140" cy="215" r="6" fill="#EF4444" stroke="#FFF" strokeWidth="2" />
            <circle cx="340" cy="160" r="5" fill="#10B981" />
            <circle cx="520" cy="95" r="6" fill="#3B82F6" stroke="#FFF" strokeWidth="2" />
            <circle cx="700" cy="55" r="6" fill="#10B981" stroke="#FFF" strokeWidth="2" />
            <circle cx="760" cy="50" r="7" fill="#10B981" stroke="#FFF" strokeWidth="3" />

            {/* X-axis labels */}
            <text x="60" y="260" fontSize="10" fill="#9CA3AF" textAnchor="middle">Today</text>
            <text x="140" y="260" fontSize="10" fill="#DC2626" textAnchor="middle" fontWeight="600">Q1 26</text>
            <text x="250" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q2 26</text>
            <text x="340" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q3 26</text>
            <text x="430" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q4 26</text>
            <text x="520" y="260" fontSize="10" fill="#3B82F6" textAnchor="middle" fontWeight="600">Q1 27</text>
            <text x="610" y="260" fontSize="10" fill="#6B7280" textAnchor="middle">Q2 27</text>
            <text x="700" y="260" fontSize="10" fill="#10B981" textAnchor="middle" fontWeight="600">Q3 27</text>
            <text x="760" y="260" fontSize="10" fill="#10B981" textAnchor="middle" fontWeight="600">Q4 27</text>

            {/* Value annotations */}
            <rect x="45" y="200" width="45" height="18" rx="4" fill="#F3F4F6" />
            <text x="68" y="213" fontSize="10" fill="#374151" textAnchor="middle" fontWeight="600">$149K</text>

            <rect x="300" y="140" width="50" height="18" rx="4" fill="#D1FAE5" />
            <text x="325" y="153" fontSize="10" fill="#065F46" textAnchor="middle" fontWeight="600">$280K</text>

            <rect x="480" y="75" width="55" height="18" rx="4" fill="#DBEAFE" />
            <text x="508" y="88" fontSize="10" fill="#1D4ED8" textAnchor="middle" fontWeight="600">$427K</text>
            <text x="520" y="110" fontSize="8" fill="#3B82F6" textAnchor="middle">AI Booking</text>

            <rect x="720" y="30" width="55" height="20" rx="4" fill="#10B981" />
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
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Target ARR</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Journey */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">TODAY</p>
            <p className="text-2xl font-bold text-gray-900">$149K</p>
            <p className="text-xs text-gray-500">ARR</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
            <p className="text-xs text-blue-600 uppercase tracking-wider mb-1">Q4 2026</p>
            <p className="text-2xl font-bold text-blue-700">$320K</p>
            <p className="text-xs text-blue-500">+115% Growth</p>
          </div>
          <div className="bg-indigo-50 rounded-xl p-4 text-center border border-indigo-100">
            <p className="text-xs text-indigo-600 uppercase tracking-wider mb-1">Q2 2027</p>
            <p className="text-2xl font-bold text-indigo-700">$480K</p>
            <p className="text-xs text-indigo-500">+222% Growth</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center border-2 border-green-500">
            <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Q4 2027</p>
            <p className="text-2xl font-bold text-green-700">$575K</p>
            <p className="text-xs text-green-500">+286% Growth</p>
          </div>
        </div>

        {/* Growth Drivers */}
        <div className="bg-black text-white rounded-2xl p-6 sm:p-8 mb-10">
          <h3 className="text-lg font-bold mb-6 text-center">What Drives This Growth?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl mb-2">📈</p>
              <p className="text-sm font-semibold mb-1">Marketing Scale</p>
              <p className="text-xs text-gray-400">$122K ad spend → 396 new customers</p>
              <p className="text-lg font-bold text-green-400 mt-2">+$275K ARR</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl mb-2">🤖</p>
              <p className="text-sm font-semibold mb-1">AI Booking Upsell</p>
              <p className="text-xs text-gray-400">40% adoption @ $119/mo</p>
              <p className="text-lg font-bold text-blue-400 mt-2">+$165K ARR</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl mb-2">🔄</p>
              <p className="text-sm font-semibold mb-1">Retention</p>
              <p className="text-xs text-gray-400">85% annual retention rate</p>
              <p className="text-lg font-bold text-purple-400 mt-2">$127K base</p>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">18-Month Execution Timeline</h3>
          
          {/* Horizontal Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 rounded-full"></div>
            
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { q: "Q1 26", title: "Launch", items: ["Team hiring", "Funnel optimization"], color: "red" },
                { q: "Q2 26", title: "Build", items: ["AI Booking dev", "WhatsApp"], color: "orange" },
                { q: "Q3 26", title: "Expand", items: ["CRM module", "Marketing push"], color: "yellow" },
                { q: "Q4 26", title: "Scale", items: ["US market", "$300K ARR"], color: "blue" },
                { q: "Q1 27", title: "AI Launch", items: ["AI Booking live", "40% upsell"], color: "indigo", highlight: true },
                { q: "Q4 27", title: "Target", items: ["$575K ARR", "3.9x growth"], color: "green", highlight: true },
              ].map((phase, i) => (
                <div key={i} className="relative pt-10">
                  <div className={`absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${
                    phase.highlight ? 'bg-green-500 ring-4 ring-green-100' : 'bg-gray-300'
                  }`}></div>
                  <div className={`text-center p-3 rounded-xl ${
                    phase.highlight ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50 border border-gray-100'
                  }`}>
                    <p className={`text-xs font-bold mb-1 ${phase.highlight ? 'text-green-600' : 'text-gray-500'}`}>{phase.q}</p>
                    <p className={`text-sm font-semibold mb-2 ${phase.highlight ? 'text-green-700' : 'text-gray-900'}`}>{phase.title}</p>
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
    </div>
  );
};
