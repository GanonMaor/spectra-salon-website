import React from "react";

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
      <Slide footer="Source: Company vision statement 2026">
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
            ALL-IN-ONE AI PLATFORM FOR SALONS
          </h1>

          <p
            className="font-light mb-8 sm:mb-12 leading-relaxed"
            style={{ fontSize: tokens.typography.h2, color: tokens.colors.charcoal }}
          >
            The salon industry is at a turning point.
            <br />
            With relatively small investment, Spectra AI is driving a game-changing shift.
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
      <Slide bgColor={tokens.colors.lightGray} footer="Source: Analytics dashboard Q4 2025">
        <SlideHeader title="Company Achievements" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT: Key Metrics */}
          <div className="space-y-6">
            <StatCard label="Live ARR" value="$155K+" sublabel="AI-Powered Platform" />
            <StatCard label="Paying Salons" value="225" sublabel="Direct Customers" />
            <StatCard label="International Revenue" value="42%" sublabel="of total" />
            <StatCard label="LTV/CAC Ratio" value="8x" sublabel="Unit Economics" />
          </div>

          {/* RIGHT: Revenue Chart */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg sm:text-xl font-semibold mb-6 text-gray-900">
              Revenue Trajectory 2024–2025
            </h3>
            
            {/* Stacked Area Chart - Single Total Line */}
            <svg viewBox="0 0 480 280" className="w-full" style={{ maxHeight: "340px" }}>
              {/* Horizontal grid lines */}
              <line x1="60" y1="50" x2="460" y2="50" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="60" y1="90" x2="460" y2="90" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="60" y1="130" x2="460" y2="130" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="60" y1="170" x2="460" y2="170" stroke="#F3F4F6" strokeWidth="1" strokeDasharray="2,2" />
              <line x1="60" y1="210" x2="460" y2="210" stroke="#E5E7EB" strokeWidth="1.5" />
              
              {/* Y-axis labels */}
              <text x="50" y="54" fontSize="10" fill="#9CA3AF" textAnchor="end">$180K</text>
              <text x="50" y="94" fontSize="10" fill="#9CA3AF" textAnchor="end">$140K</text>
              <text x="50" y="134" fontSize="10" fill="#9CA3AF" textAnchor="end">$100K</text>
              <text x="50" y="174" fontSize="10" fill="#9CA3AF" textAnchor="end">$60K</text>
              <text x="50" y="214" fontSize="10" fill="#9CA3AF" textAnchor="end">$20K</text>
              
              {/* X-axis */}
              <line x1="60" y1="210" x2="460" y2="210" stroke="#1D1D1F" strokeWidth="1.5" />
              
              {/* X-axis ticks and labels */}
              <line x1="80" y1="210" x2="80" y2="215" stroke="#1D1D1F" strokeWidth="1" />
              <text x="80" y="230" fontSize="10" fill="#6B7280" textAnchor="middle">Jan 24</text>
              <line x1="140" y1="210" x2="140" y2="215" stroke="#1D1D1F" strokeWidth="1" />
              <text x="140" y="230" fontSize="10" fill="#6B7280" textAnchor="middle">Mar 24</text>
              <line x1="200" y1="210" x2="200" y2="215" stroke="#1D1D1F" strokeWidth="1" />
              <text x="200" y="230" fontSize="10" fill="#6B7280" textAnchor="middle">Jun 24</text>
              <line x1="260" y1="210" x2="260" y2="215" stroke="#1D1D1F" strokeWidth="1" />
              <text x="260" y="230" fontSize="10" fill="#6B7280" textAnchor="middle">Sep 24</text>
              <line x1="320" y1="210" x2="320" y2="215" stroke="#1D1D1F" strokeWidth="1" />
              <text x="320" y="230" fontSize="10" fill="#6B7280" textAnchor="middle">Dec 24</text>
              <line x1="380" y1="210" x2="380" y2="215" stroke="#1D1D1F" strokeWidth="1" />
              <text x="380" y="230" fontSize="10" fill="#6B7280" textAnchor="middle">Jun 25</text>
              <line x1="440" y1="210" x2="440" y2="215" stroke="#1D1D1F" strokeWidth="1" />
              <text x="440" y="230" fontSize="10" fill="#6B7280" textAnchor="middle">Dec 25</text>
              
              {/* Stacked Area - Israel (darker, bottom) */}
              <path
                d="M 80,152 L 140,148 L 200,146 L 260,147 L 320,144 L 380,142 L 440,140 L 440,210 L 80,210 Z"
                fill="#1D1D1F"
                opacity="0.7"
              />
              
              {/* Stacked Area - International (lighter, top) */}
              <path
                d="M 80,152 L 140,148 L 200,146 L 260,147 L 320,144 L 380,142 L 440,140 L 440,58 L 380,92 L 320,132 L 260,158 L 200,175 L 140,185 L 80,190 Z"
                fill="#3B82F6"
                opacity="0.4"
              />
              
              {/* Total revenue line */}
              <path
                d="M 80,190 L 140,185 L 200,175 L 260,158 L 320,132 L 380,92 L 440,58"
                fill="none"
                stroke="#000000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {/* Data point markers */}
              <circle cx="80" cy="190" r="5" fill="#000000" />
              <circle cx="140" cy="185" r="5" fill="#000000" />
              <circle cx="200" cy="175" r="5" fill="#000000" />
              <circle cx="260" cy="158" r="5" fill="#000000" />
              <circle cx="320" cy="132" r="5" fill="#000000" />
              <circle cx="380" cy="92" r="5" fill="#000000" />
              <circle cx="440" cy="58" r="5" fill="#000000" />
              
              {/* End value */}
              <circle cx="440" cy="58" r="7" fill="none" stroke="#000000" strokeWidth="2" />
              <rect x="395" y="43" width="50" height="20" rx="3" fill="#000000" />
              <text x="420" y="57" fontSize="12" fill="#FFFFFF" textAnchor="middle" fontWeight="700">$169K</text>
            </svg>

            {/* Legend */}
            <div className="flex justify-center gap-8 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-black opacity-70 rounded"></div>
                <span className="text-sm font-medium text-gray-700">Israel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-3 bg-blue-500 opacity-40 rounded"></div>
                <span className="text-sm font-medium text-gray-700">International</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500">2024 Total</p>
                  <p className="text-base font-bold text-gray-900">$100K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">2025 Total</p>
                  <p className="text-base font-bold text-gray-900">$169K</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">YoY Growth</p>
                  <p className="text-base font-bold text-green-600">+69%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Strategy Evolution */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <h3 className="text-xl sm:text-2xl font-semibold text-black mb-6 text-center">
            Market Strategy Evolution
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
              <h4 className="text-base sm:text-lg font-bold text-black mb-3">2024: Israel Beta Phase</h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Focused market testing and product validation in local market.
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100">
              <h4 className="text-base sm:text-lg font-bold text-black mb-3">2025: International Target Market</h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Strategic pivot to global expansion and distribution. 
                International revenue grew to 42% of total ARR.
              </p>
            </div>
          </div>
        </div>

        {/* The Product */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-semibold text-black mb-6">The Product</h3>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
            Spectra turns the iPad at the color bar into a real-time operating system 
            for the salon. It helps teams mix faster, reduce mistakes, stay consistent 
            across stylists, and track formulas automatically.
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <div className="text-center">
              <p className="text-3xl mb-2">🎨</p>
              <p className="text-sm font-medium text-gray-700">Color Intelligence</p>
            </div>
            <div className="text-center">
              <p className="text-3xl mb-2">⚡</p>
              <p className="text-sm font-medium text-gray-700">Real-time Ops</p>
            </div>
            <div className="text-center">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm font-medium text-gray-700">Analytics</p>
            </div>
            <div className="text-center">
              <p className="text-3xl mb-2">🤖</p>
              <p className="text-sm font-medium text-gray-700">AI Powered</p>
            </div>
          </div>
        </div>
      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 3: TRACTION & GO-TO-MARKET */}
      {/* ================================================================== */}
      <Slide footer="Source: Customer testimonials & Instagram analytics">
        <SlideHeader title="Traction & Go-To-Market" />

        {/* Instagram Social Proof */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-2xl p-8 sm:p-10 mb-8 sm:mb-12 text-center shadow-xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            {/* Instagram icon */}
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-3xl p-4 mb-4">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Instagram Community
            </h3>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">1.5K+</p>
                <p className="text-xs sm:text-sm text-white/90">Followers</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">12%</p>
                <p className="text-xs sm:text-sm text-white/90">Engagement</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-3xl sm:text-4xl font-bold text-white mb-1">200+</p>
                <p className="text-xs sm:text-sm text-white/90">Posts</p>
              </div>
            </div>

            <p className="text-base sm:text-lg text-white/90 font-medium mb-6">
              Trusted by Hair Professionals Worldwide
            </p>

            {/* CTA Button */}
            <a
              href="https://www.instagram.com/spectra.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-sm sm:text-base hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Visit @spectra.ai
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <p className="text-xs sm:text-sm text-white/70 mt-4">
              💜 Organic growth • Real engagement • Community-driven
            </p>
          </div>
        </div>

        {/* Customer Success Stories */}
        <div>
          <h3 className="text-xl sm:text-2xl font-semibold text-center mb-6 sm:mb-8 text-gray-900">
            Real Salons, Real Results
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                video: "/instagram-reel.mp4",
                caption: "Salon A - 85% waste reduction",
              },
              {
                video: "/instagram-reel2.mp4",
                caption: "Salon B - $10K annual savings",
              },
              {
                video: "/instagram-reel3.mp4",
                caption: "Salon C - 3.5 hours saved weekly",
              },
            ].map((item, i) => {
              const VideoCard = () => {
                const [isMuted, setIsMuted] = React.useState(true);
                const [isPlaying, setIsPlaying] = React.useState(false);
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
                    className="relative bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                    style={{ aspectRatio: "9/16", maxHeight: "600px" }}
                  >
                    <video
                      ref={videoRef}
                      src={item.video}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                    />
                    {/* Play/Pause overlay */}
                    {!isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
                        <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center">
                          <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {/* Pause button overlay when playing */}
                    {isPlaying && (
                      <div className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center transition-all group/play">
                        <div className="w-20 h-20 rounded-full bg-white/0 group-hover/play:bg-white/90 flex items-center justify-center transition-all">
                          <svg className="w-8 h-8 text-white group-hover/play:text-black opacity-0 group-hover/play:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                          </svg>
                        </div>
                      </div>
                    )}
                    {/* Sound control button */}
                    {isPlaying && (
                      <button
                        onClick={toggleMute}
                        className="absolute top-3 right-3 w-12 h-12 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-all z-10"
                      >
                        {isMuted ? (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        )}
                      </button>
                    )}
                    {/* Caption */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pointer-events-none">
                      <p className="text-white text-sm sm:text-base font-medium">{item.caption}</p>
                    </div>
                  </div>
                );
              };

              return <VideoCard key={i} />;
            })}
          </div>
        </div>
      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 4: MARKETING BREAKTHROUGH - TRIPLE BUNDLE */}
      {/* ================================================================== */}
      <Slide bgColor="#FAFAFA" footer="Source: Meta Ads dashboard & financial records 2025">
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

        {/* Results - Full Width, Spacious */}
        <div className="w-full mb-16 sm:mb-24">
          <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 lg:p-20 shadow-sm border border-gray-100 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-24">
              {/* Investment */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-8 sm:mb-12">
                  Investment
                </h4>
                <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-12">
                  <div className="flex justify-between items-center pb-4 sm:pb-6 border-b border-gray-100">
                    <span className="text-sm sm:text-base md:text-lg text-gray-600">Meta Ads (12 mo)</span>
                    <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black">$18,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 sm:pb-6 border-b border-gray-100">
                    <span className="text-sm sm:text-base md:text-lg text-gray-600">Campaign Manager</span>
                    <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black">$15,000</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 sm:pb-6 border-b border-gray-100">
                    <span className="text-sm sm:text-base md:text-lg text-gray-600">Equipment Gifts</span>
                    <span className="text-lg sm:text-xl md:text-2xl font-semibold text-black">$4,000</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-6 sm:pt-8 border-t-2 border-black">
                  <span className="text-lg sm:text-xl md:text-2xl font-medium text-black">Total</span>
                  <span className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black">$37,000</span>
                </div>
              </div>

              {/* Returns */}
              <div>
                <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-8 sm:mb-12">
                  Returns
                </h4>
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <p className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-3">Year 1 Revenue</p>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black">$64,728</p>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-3">Year 2 Revenue (5% churn)</p>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black">$61,492</p>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-3">Year 3 Revenue (5% churn)</p>
                    <p className="text-3xl sm:text-4xl md:text-5xl font-semibold text-black">$58,417</p>
                  </div>
                  <div className="pt-6 sm:pt-8 border-t-2 border-black">
                    <p className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-3">Total LTV Revenue (3 years)</p>
                    <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-black">$184,637</p>
                  </div>
                  <div className="pt-4 sm:pt-6">
                    <p className="text-sm sm:text-base text-gray-500 mb-2 sm:mb-3">Return on Investment</p>
                    <p className="text-5xl sm:text-6xl md:text-7xl font-bold text-black">5.0x</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">ROI multiple on $37K</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Marketing Metrics */}
        <div className="w-full mb-16 sm:mb-20">
          <div className="max-w-6xl mx-auto">
            <h4 className="text-base sm:text-lg font-medium text-gray-400 uppercase tracking-[0.2em] mb-12 sm:mb-16 text-center">
              Performance Metrics
            </h4>
            
            {/* Current Performance (2025) */}
            <p className="text-sm text-gray-500 mb-8 text-center font-medium">
              Current Performance (2025 Baseline)
            </p>
            <div className="grid grid-cols-2 gap-6 sm:gap-8 mb-16 sm:mb-20 max-w-5xl mx-auto">
              <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-gray-100 shadow-sm">
                <p className="text-xs sm:text-sm text-gray-400 font-medium mb-4 uppercase tracking-wider">Leads</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-semibold text-black mb-3">1,476</p>
                <p className="text-sm text-gray-500">CPL: $12.20</p>
              </div>
              <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-gray-100 shadow-sm">
                <p className="text-xs sm:text-sm text-gray-400 font-medium mb-4 uppercase tracking-wider">Conversion</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-semibold text-black mb-3">6.5%</p>
                <p className="text-sm text-gray-500">Industry: 2-3%</p>
              </div>
              <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-gray-100 shadow-sm">
                <p className="text-xs sm:text-sm text-gray-400 font-medium mb-4 uppercase tracking-wider">CPA</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-semibold text-black mb-3">$188</p>
                <p className="text-sm text-gray-500">Cost/Trial: $60</p>
              </div>
              <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border border-gray-100 shadow-sm">
                <p className="text-xs sm:text-sm text-gray-400 font-medium mb-4 uppercase tracking-wider">Customers</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-semibold text-black mb-3">96</p>
                <p className="text-sm text-gray-500">Active now</p>
              </div>
            </div>

            {/* Projected Performance (with optimization) */}
            <p className="text-sm text-gray-500 mb-8 text-center font-medium">
              Projected (2026-2027 with 30% optimization)
            </p>
            <div className="grid grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-16 sm:mb-20">
              <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border-2 border-blue-200 shadow-sm">
                <p className="text-xs sm:text-sm text-blue-600 font-medium mb-4 uppercase tracking-wider">Leads</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-semibold text-black mb-3">6,393</p>
                <p className="text-sm text-blue-600 font-medium">18 months</p>
              </div>
              <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border-2 border-green-200 shadow-sm">
                <p className="text-xs sm:text-sm text-green-600 font-medium mb-4 uppercase tracking-wider">Conversion</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-semibold text-black mb-3">8.45%</p>
                <p className="text-sm text-green-600 font-medium">+30%</p>
              </div>
              <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border-2 border-purple-200 shadow-sm">
                <p className="text-xs sm:text-sm text-purple-600 font-medium mb-4 uppercase tracking-wider">CAC</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-semibold text-black mb-3">$208</p>
                <p className="text-sm text-purple-600 font-medium">↓ 23%</p>
              </div>
              <div className="bg-white rounded-3xl p-8 sm:p-10 text-center border-2 border-orange-200 shadow-sm">
                <p className="text-xs sm:text-sm text-orange-600 font-medium mb-4 uppercase tracking-wider">Customers</p>
                <p className="text-4xl sm:text-5xl md:text-6xl font-semibold text-black mb-3">540</p>
                <p className="text-sm text-orange-600 font-medium">+40%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Funnel - Full Width */}
        <div className="w-full">
          <div className="bg-white rounded-3xl p-8 sm:p-12 md:p-16 lg:p-20 border border-gray-100 shadow-sm max-w-7xl mx-auto">
              <p className="text-base sm:text-lg font-medium text-gray-400 uppercase tracking-[0.2em] mb-12 sm:mb-16 text-center">
                Lead Funnel Performance
              </p>
              <p className="text-sm sm:text-base text-gray-600 mb-10 sm:mb-12 text-center">
                Current funnel (2025 baseline data)
              </p>
              <div className="space-y-6 sm:space-y-8 md:space-y-10 w-full">
                <div className="relative w-full">
                  <div className="h-20 sm:h-24 md:h-28 lg:h-32 bg-black rounded-2xl sm:rounded-3xl flex items-center justify-between px-6 sm:px-10 md:px-16 shadow-lg">
                    <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-white">Leads</span>
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">1,476</span>
                  </div>
                </div>
                <div className="relative w-[85%] mx-auto">
                  <div className="h-20 sm:h-24 md:h-28 lg:h-32 bg-gray-800 rounded-2xl sm:rounded-3xl flex items-center justify-between px-6 sm:px-10 md:px-16 shadow-lg">
                    <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-white">Trials Started</span>
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">300</span>
                  </div>
                </div>
                <div className="relative w-[70%] mx-auto">
                  <div className="h-20 sm:h-24 md:h-28 lg:h-32 bg-gray-600 rounded-2xl sm:rounded-3xl flex items-center justify-between px-6 sm:px-10 md:px-16 shadow-lg">
                    <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-white">Conversions</span>
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">96</span>
                  </div>
                </div>
                <div className="relative w-[55%] mx-auto">
                  <div className="h-20 sm:h-24 md:h-28 lg:h-32 bg-gray-400 rounded-2xl sm:rounded-3xl flex items-center justify-between px-6 sm:px-10 md:px-16 shadow-lg">
                    <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-white">Revenue</span>
                    <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">$65K</span>
                  </div>
                </div>
              </div>
              <div className="mt-10 sm:mt-12 pt-8 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-6 sm:gap-8 max-w-3xl mx-auto">
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 uppercase tracking-wider">Conversion Rate</p>
                    <p className="text-3xl sm:text-4xl font-bold text-black">6.5<span className="text-2xl">%</span></p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 uppercase tracking-wider">CAC</p>
                    <p className="text-3xl sm:text-4xl font-bold text-black">$188</p>
                    <p className="text-xs text-gray-500 mt-1">Cost per Acquisition</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-400 mb-2 uppercase tracking-wider">LTV/CAC Ratio</p>
                    <p className="text-3xl sm:text-4xl font-bold text-black">8x</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Bottom Statement */}
        <div className="mt-10 sm:mt-16 text-center">
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-light">
            A repeatable, scalable go-to-market system
          </p>
        </div>
      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 4.5: 18-MONTH INVESTMENT BREAKDOWN */}
      {/* ================================================================== */}
      <Slide bgColor="#FAFAFA" footer="Source: Financial projections model with Smart Diary upsell Q1 2026">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-4">
            Investment Deployment
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-black mb-6 tracking-tight">
            18-Month Plan
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-light">
            $300K investment + Smart Diary upsell = Accelerated growth
          </p>
        </div>

        {/* Budget Allocation - Clean Layout */}
        <div className="max-w-6xl mx-auto mb-16 sm:mb-20">
          <h3 className="text-sm sm:text-base font-medium text-gray-400 uppercase tracking-[0.2em] mb-10 text-center">
            Investment Breakdown
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Budget Split */}
            <div className="bg-white rounded-3xl p-10 sm:p-12 border border-gray-100 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-black mb-8 pb-4 border-b border-gray-200">
                Budget Split
              </h3>
              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Marketing</p>
                    <p className="text-xs text-gray-400">70% of investment</p>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-black">$210K</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Operations</p>
                    <p className="text-xs text-gray-400">30% of investment</p>
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold text-black">$90K</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-6 border-t-2 border-black">
                <p className="text-lg sm:text-xl font-semibold text-black">Total Investment</p>
                <p className="text-4xl sm:text-5xl font-bold text-black">$300K</p>
              </div>
            </div>

            {/* Smart Diary Impact */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 sm:p-12 border border-blue-200 shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-black mb-8 pb-4 border-b border-blue-200">
                Smart Diary Impact
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Launch Date</p>
                  <p className="text-2xl sm:text-3xl font-bold text-black">January 2027</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Upsell Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-black">40%</p>
                  <p className="text-sm text-gray-600 mt-1">of customer base</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Price Increase</p>
                  <p className="text-2xl sm:text-3xl font-bold text-black">$50 → $100/mo</p>
                  <p className="text-sm text-gray-600 mt-1">2x multiplier</p>
                </div>
                <div className="pt-6 border-t border-blue-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Total Impact</p>
                  <p className="text-4xl sm:text-5xl font-bold text-blue-600">+$54K</p>
                  <p className="text-sm text-gray-600 mt-1">Additional ARR (Q1-Q2 27)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Marketing Budget - Gradual Increase */}
        <div className="max-w-6xl mx-auto mb-12 sm:mb-16">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-8 text-center">
            Marketing Budget Ramp-Up
          </h3>
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-8">
              {[
                { period: "Q1 26", budget: "$8K", leads: "655" },
                { period: "Q2 26", budget: "$10K", leads: "820" },
                { period: "Q3 26", budget: "$12K", leads: "984" },
                { period: "Q4 26", budget: "$14K", leads: "1,148" },
                { period: "Q1 27", budget: "$16K", leads: "1,311" },
                { period: "Q2 27", budget: "$18K", leads: "1,475" },
              ].map((q, i) => (
                <div key={i} className="text-center">
                  <p className="text-xs text-gray-400 font-medium mb-2 uppercase">{q.period}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-black mb-1">{q.budget}</p>
                  <p className="text-xs text-gray-500">{q.leads} leads</p>
                  <div 
                    className="mt-3 h-2 bg-black rounded-full" 
                    style={{ width: `${45 + (i * 9)}%`, margin: '0 auto' }}
                  ></div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">
              Total: $78K/quarter average = $210K over 18 months
            </p>
          </div>
        </div>

        {/* Projected Outcomes */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-[0.2em] mb-8 text-center">
            Projected Outcomes (with 30% conversion improvement)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-3">New Customers</p>
              <p className="text-5xl sm:text-6xl font-bold text-black mb-2">540</p>
              <p className="text-xs text-gray-500">From 6,393 leads @ 8.45% conv.</p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-3">Total ARR Added</p>
              <p className="text-5xl sm:text-6xl font-bold text-black mb-2">$378K</p>
              <p className="text-xs text-gray-500">+$54K from Smart Diary (Q1-Q2 27)</p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center">
              <p className="text-sm text-gray-500 mb-3">CAC:LTV Ratio</p>
              <p className="text-5xl sm:text-6xl font-bold text-black mb-2">1:7.7</p>
              <p className="text-xs text-gray-500">LTV: $1,590 | CAC: $208</p>
            </div>
          </div>

          {/* 3-Year Breakdown - Top */}
          <div className="mt-12 mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-3">Year 1 ARR</p>
              <p className="text-4xl sm:text-5xl font-bold text-black mb-2">$378K</p>
              <p className="text-xs text-gray-500">126% ROI</p>
            </div>
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-3">Years 2-3</p>
              <p className="text-4xl sm:text-5xl font-bold text-black mb-2">$1.13M</p>
              <p className="text-xs text-gray-500">377% ROI</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 sm:p-8 border-2 border-green-500 text-center">
              <p className="text-sm text-green-700 font-semibold mb-3">3-Year Total</p>
              <p className="text-5xl sm:text-6xl font-bold text-black mb-2">$1.51M</p>
              <p className="text-xs text-green-700 font-semibold">503% Total ROI</p>
            </div>
          </div>

          {/* Summary Box */}
          <div className="bg-black text-white rounded-3xl p-8 sm:p-12 text-center">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-4">18-Month Investment</p>
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">$300K</p>
            <div className="flex items-center justify-center gap-4 mb-4">
              <span className="text-2xl sm:text-3xl text-gray-400">→</span>
              <p className="text-3xl sm:text-4xl font-bold text-green-400">$378K ARR</p>
            </div>
            <p className="text-base sm:text-lg text-gray-300">
              Generates $1.51M total revenue over 3 years
            </p>
          </div>
        </div>
      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 5: RISKS & MITIGATION */}
      {/* ================================================================== */}
      <Slide footer="Source: Internal risk assessment & strategic planning">
        <SlideHeader title="Risks & Strategic Solutions" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Left: Risks */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">⚠️</span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">IDENTIFIED RISKS</h3>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: "1. Conversion Optimization",
                  desc: "Current funnel has room for improvement",
                },
                {
                  title: "2. Customer Success Operations",
                  desc: "Limited resources for onboarding at scale",
                },
                {
                  title: "3. Growth Constraints",
                  desc: "Need full-time team + stable budget",
                },
              ].map((risk, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-1">{risk.title}</h4>
                  <p className="text-sm text-gray-600">{risk.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Solutions */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-2xl">✅</span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">OUR SOLUTION</h3>
            </div>
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
              <h4 className="text-lg font-bold text-gray-900 mb-3">
                Full-time Team + Investment
              </h4>
              <p className="text-sm text-gray-700 mb-4">Dedicated resources for:</p>
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li>• Lead management automation</li>
                <li>• Enhanced onboarding flows</li>
                <li>• Customer success operations</li>
              </ul>
              <p className="text-sm text-gray-600 italic">
                With improved infrastructure, we can scale efficiently
              </p>
            </div>
          </div>
        </div>

        {/* The Ask */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xl">
          <div className="inline-block bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4">
            💎 INVESTMENT OPPORTUNITY
          </div>
          
          <h3 className="text-3xl sm:text-4xl font-bold mb-8">THE ASK</h3>
          
          {/* Investment Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-sm text-gray-300 mb-2">Your Investment</p>
              <p className="text-3xl sm:text-4xl font-bold mb-1">$300K</p>
              <p className="text-xs text-gray-400">over 18 months</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-sm text-gray-300 mb-2">Company Investment</p>
              <p className="text-3xl sm:text-4xl font-bold mb-1">$216K</p>
              <p className="text-xs text-gray-400">$12K/month operating budget</p>
            </div>
          </div>

          {/* Combined Power */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-6 mb-8 border border-blue-400/30">
            <p className="text-sm text-blue-200 mb-2 uppercase tracking-wider">Combined Deployment</p>
            <p className="text-4xl sm:text-5xl font-bold mb-2">$516K</p>
            <p className="text-sm sm:text-base text-blue-100">
              🔥 Your money works double: External investment + Company's skin in the game
            </p>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <h4 className="text-xl sm:text-2xl font-bold mb-4">PROJECTED OUTCOME</h4>
            <p className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              $600K ARR by Q2 2027
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-4">
              <div>
                <p className="text-sm text-gray-400">Revenue Multiple</p>
                <p className="text-xl sm:text-2xl font-bold text-green-400">4.2x</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Return on Your $300K</p>
                <p className="text-xl sm:text-2xl font-bold text-green-400">2x in 18 months</p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 italic">
              Based on proven metrics, validated funnel, and conservative projections
            </p>
          </div>
        </div>
      </Slide>

      {/* ================================================================== */}
      {/* SLIDE 6: GROWTH FORECAST & MILESTONES */}
      {/* ================================================================== */}
      <Slide bgColor={tokens.colors.lightGray} footer="Source: Financial projections model Q1 2026">
        <SlideHeader title="18-Month Growth Plan" />
        <p className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12">Q1 2026 → Q2 2027</p>

        {/* ARR Projection Chart */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm mb-8 sm:mb-12">
          <h3 className="text-lg sm:text-xl font-semibold mb-6 text-gray-900">ARR Projection</h3>

          {/* Stacked Area Chart */}
          <svg viewBox="0 0 500 280" className="w-full" style={{ maxHeight: "320px" }}>
            {/* Grid */}
            <line x1="50" y1="20" x2="50" y2="220" stroke="#E5E7EB" strokeWidth="1" />
            <line x1="50" y1="220" x2="480" y2="220" stroke="#E5E7EB" strokeWidth="1" />

            {/* Stacked areas */}
            {/* Base ARR (dark) */}
            <path
              d="M 70,180 L 140,175 L 210,165 L 280,155 L 350,145 L 420,135 L 420,220 L 70,220 Z"
              fill="#1D1D1F"
              opacity="0.8"
            />
            {/* New Customers (medium) */}
            <path
              d="M 70,180 L 140,175 L 210,160 L 280,140 L 350,120 L 420,95 L 420,135 L 350,145 L 280,155 L 210,165 L 140,175 Z"
              fill="#86868B"
              opacity="0.6"
            />
            {/* Smart Diary Expansion (light blue) - ONLY Q1-Q2 2027 */}
            <path
              d="M 350,120 L 420,70 L 420,95 L 350,120 Z"
              fill="#3B82F6"
              opacity="0.4"
            />

            {/* Milestone markers */}
            <circle cx="70" cy="180" r="4" fill="#1D1D1F" />
            <circle cx="140" cy="175" r="4" fill="#1D1D1F" />
            <circle cx="210" cy="160" r="4" fill="#1D1D1F" />
            <circle cx="280" cy="140" r="4" fill="#1D1D1F" />
            <circle cx="350" cy="120" r="5" fill="#3B82F6" stroke="#3B82F6" strokeWidth="2" />
            <circle cx="420" cy="70" r="5" fill="#3B82F6" stroke="#3B82F6" strokeWidth="2" />

            {/* Labels */}
            <text x="70" y="240" fontSize="11" fill="#86868B" textAnchor="middle">Q1 26</text>
            <text x="140" y="240" fontSize="11" fill="#86868B" textAnchor="middle">Q2</text>
            <text x="210" y="240" fontSize="11" fill="#86868B" textAnchor="middle">Q3</text>
            <text x="280" y="240" fontSize="11" fill="#86868B" textAnchor="middle">Q4</text>
            <text x="350" y="240" fontSize="11" fill="#3B82F6" textAnchor="middle" fontWeight="600">Q1 27</text>
            <text x="420" y="240" fontSize="11" fill="#3B82F6" textAnchor="middle" fontWeight="600">Q2 27</text>

            {/* ARR values */}
            <text x="70" y="170" fontSize="10" fill="#1D1D1F" fontWeight="600">$155K</text>
            <text x="350" y="110" fontSize="11" fill="#3B82F6" fontWeight="700">$427K</text>
            <text x="420" y="60" fontSize="11" fill="#3B82F6" fontWeight="700">$600K</text>
            
            {/* Smart Diary Launch Indicator */}
            <line x1="350" y1="30" x2="350" y2="220" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
            <text x="350" y="20" fontSize="9" fill="#3B82F6" textAnchor="middle" fontWeight="600">Smart Diary Launch</text>
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-900 rounded"></div>
              <span className="text-xs text-gray-600">Base ARR</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-400 rounded"></div>
              <span className="text-xs text-gray-600">New Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">Smart Diary Upsell (Q1-Q2 27)</span>
            </div>
          </div>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Target: $600K ARR • Smart Diary impact: +$173K in 6 months
          </p>
        </div>

        {/* Execution Roadmap */}
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-6 text-gray-900 text-center">
            Execution Roadmap
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                quarter: "Q1 2026",
                title: "Foundation",
                items: [
                  "Lead management system",
                  "Automated onboarding",
                  "Funnel optimization",
                ],
              },
              {
                quarter: "Q2 2026",
                title: "Enhancement",
                items: ["AI Booking launch", "WhatsApp integration", "Dashboard 2.0"],
              },
              {
                quarter: "Q3 2026",
                title: "Expansion",
                items: ["CRM module", "POS integrations", "Marketing scale-up"],
              },
              {
                quarter: "Q4 2026",
                title: "Growth",
                items: ["US market push", "Trade show presence", "$300K+ ARR milestone"],
              },
              {
                quarter: "Q1 2027",
                title: "Smart Diary Launch",
                highlight: true,
                items: ["Smart Diary + Payments", "40% upsell to Pro ($100/mo)", "ARPU boost begins"],
              },
              {
                quarter: "Q2 2027",
                title: "Scale",
                items: ["Full Smart Diary adoption", "International expansion", "$600K+ ARR target"],
              },
            ].map((phase, i) => (
              <div 
                key={i} 
                className={`bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 shadow-sm ${
                  phase.highlight ? 'border-2 border-blue-500' : 'border border-gray-100'
                }`}
              >
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {phase.quarter}
                </p>
                <h4 className={`text-base sm:text-lg font-bold mb-3 ${
                  phase.highlight ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {phase.title}
                </h4>
                <ul className="space-y-2">
                  {phase.items.map((item, j) => (
                    <li key={j} className="text-xs sm:text-sm text-gray-600 flex items-start gap-2">
                      <span className={`mt-0.5 ${phase.highlight ? 'text-blue-500' : 'text-gray-400'}`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 text-center mt-8">
          Conservative projections. Excludes reseller upside. Based on validated 2024-2025
          performance data.
        </p>
      </Slide>
    </div>
  );
};
