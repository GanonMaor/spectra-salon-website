import React from "react";
import "./DeepBlueGlass.css";

// ============================================================================
// DESIGN TOKENS - Deep Blue Glassmorphism
// ============================================================================
const tokens = {
  colors: {
    // Deep blue backgrounds - each section uses a different shade
    deepBlue1: "#0B1020",
    deepBlue2: "#0F1B2D",
    deepBlue3: "#142033",
    deepBlue4: "#1a2740",
    
    // Glass surfaces
    glassFill: "rgba(255, 255, 255, 0.08)",
    glassBorder: "rgba(255, 255, 255, 0.18)",
    glassHighlight: "rgba(255, 255, 255, 0.28)",
    
    // Accents
    primaryBlue: "#3B82F6",
    cyanGlow: "#22D3EE",
    yellow: "#F59E0B",
    orange: "#F97316",
    purple: "#7C3AED",
    green: "#10B981",
    
    // Text
    textPrimary: "#FFFFFF",
    textSecondary: "#C7D0E0",
    textMuted: "#93A0B5",
    textCaption: "#7B879B",
  },
  
  shadows: {
    soft: "0 10px 30px rgba(0, 0, 0, 0.25)",
    hero: "0 30px 80px rgba(0, 0, 0, 0.35)",
    insetGlow: "inset 0 0 30px rgba(255, 255, 255, 0.05)",
  },
};

// ============================================================================
// REUSABLE GLASS CARD COMPONENT
// ============================================================================
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  accentColor?: "blue" | "cyan" | "yellow" | "orange" | "purple" | "green";
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = "", accentColor }) => {
  const accentColors = {
    blue: "#3B82F6",
    cyan: "#22D3EE",
    yellow: "#F59E0B",
    orange: "#F97316",
    purple: "#7C3AED",
    green: "#10B981",
  };
  
  return (
    <div
      className={`relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 glass-card-mobile-optimized glass-card-accelerated ${className}`}
      style={{
        background: tokens.colors.glassFill,
        border: `1px solid ${accentColor ? accentColors[accentColor] : tokens.colors.glassBorder}`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)", // Safari support
        boxShadow: tokens.shadows.soft,
      }}
    >
      {children}
    </div>
  );
};

// ============================================================================
// STAT CHIP COMPONENT
// ============================================================================
interface StatChipProps {
  label: string;
  value: string;
  accent?: "yellow" | "orange" | "cyan";
}

const StatChip: React.FC<StatChipProps> = ({ label, value, accent = "cyan" }) => {
  const accentColors = {
    yellow: tokens.colors.yellow,
    orange: tokens.colors.orange,
    cyan: tokens.colors.cyanGlow,
  };
  
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20">
      <span className="text-xs uppercase tracking-wider" style={{ color: tokens.colors.textMuted }}>
        {label}
      </span>
      <span className="text-lg font-bold" style={{ color: accentColors[accent] }}>
        {value}
      </span>
    </div>
  );
};

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export const DeepBlueGlassPage: React.FC = () => {
  return (
    <div className="min-h-screen overflow-x-hidden deep-blue-page" style={{ background: tokens.colors.deepBlue1 }}>
      {/* ================================================================== */}
      {/* SECTION 1: HERO - Deepest Blue */}
      {/* ================================================================== */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-16 sm:py-20"
        style={{
          background: `linear-gradient(135deg, ${tokens.colors.deepBlue1} 0%, ${tokens.colors.deepBlue2} 100%)`,
        }}
      >
        {/* Background overlay pattern - hidden on mobile for performance */}
        <div
          className="absolute inset-0 opacity-10 hidden md:block"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, ${tokens.colors.cyanGlow} 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <img
              src="/spectra_logo.png"
              alt="Spectra AI"
              className="h-10 sm:h-12 opacity-90 mx-auto"
            />
          </div>

          {/* Hero Glass Card */}
          <GlassCard className="mb-6 sm:mb-8" accentColor="cyan">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 sm:mb-6"
              style={{ color: tokens.colors.textPrimary }}
            >
              THE FIRST AND ONLY
              <br />
              <span style={{ color: tokens.colors.cyanGlow }}>AI PLATFORM</span>
              <br />
              FOR HAIR SALONS
            </h1>
            
            <p
              className="text-lg sm:text-xl mb-8 leading-relaxed max-w-2xl mx-auto"
              style={{ color: tokens.colors.textSecondary }}
            >
              The salon industry is at a turning point.
              <br />
              With strategic investment, Spectra AI is driving a game-changing shift.
            </p>

            {/* Accent divider */}
            <div
              className="w-24 h-1 mx-auto mb-8 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${tokens.colors.yellow} 0%, ${tokens.colors.orange} 100%)`,
              }}
            />

            {/* CTA Button */}
            <button
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-white text-base sm:text-lg transition-all hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(90deg, ${tokens.colors.primaryBlue} 0%, ${tokens.colors.cyanGlow} 100%)`,
                boxShadow: `0 10px 30px rgba(59, 130, 246, 0.4)`,
              }}
            >
              View Investor Deck
            </button>
          </GlassCard>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4">
            <StatChip label="ARR" value="$149K" accent="cyan" />
            <StatChip label="Customers" value="180" accent="yellow" />
            <StatChip label="Countries" value="4" accent="orange" />
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 2: ACHIEVEMENTS - Medium Dark Blue */}
      {/* ================================================================== */}
      <section
        className="relative px-6 py-20"
        style={{
          background: `linear-gradient(180deg, ${tokens.colors.deepBlue2} 0%, ${tokens.colors.deepBlue3} 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: tokens.colors.yellow }}
            >
              Our Progress
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ color: tokens.colors.textPrimary }}
            >
              Proven Traction
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: tokens.colors.textSecondary }}
            >
              Real metrics from 2024-2025 operations
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <GlassCard>
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                Annual Revenue
              </p>
              <p className="text-4xl font-bold mb-1" style={{ color: tokens.colors.textPrimary }}>
                $149K
              </p>
              <p className="text-sm" style={{ color: tokens.colors.textSecondary }}>
                From direct subscriptions
              </p>
            </GlassCard>

            <GlassCard accentColor="yellow">
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                Active Subscriptions
              </p>
              <p className="text-4xl font-bold mb-1" style={{ color: tokens.colors.yellow }}>
                180
              </p>
              <p className="text-sm" style={{ color: tokens.colors.textSecondary }}>
                84 Israel, 96 International
              </p>
            </GlassCard>

            <GlassCard accentColor="orange">
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                Growth Rate
              </p>
              <p className="text-4xl font-bold mb-1" style={{ color: tokens.colors.orange }}>
                +60%
              </p>
              <p className="text-sm" style={{ color: tokens.colors.textSecondary }}>
                YoY 2024-2025
              </p>
            </GlassCard>
          </div>

          {/* Featured Highlight */}
          <GlassCard className="text-center" accentColor="cyan">
            <p className="text-sm uppercase tracking-wider mb-3" style={{ color: tokens.colors.cyanGlow }}>
              Market Validation
            </p>
            <p className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: tokens.colors.textPrimary }}>
              50 Licenses · €15K
            </p>
            <p className="text-base" style={{ color: tokens.colors.textSecondary }}>
              Sold to European distributor — validating B2B channel potential
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 3: SOCIAL TRACTION - Darkest Blue */}
      {/* ================================================================== */}
      <section
        className="relative px-6 py-20"
        style={{
          background: `linear-gradient(180deg, ${tokens.colors.deepBlue3} 0%, ${tokens.colors.deepBlue4} 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: tokens.colors.orange }}
            >
              Market Momentum
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ color: tokens.colors.textPrimary }}
            >
              Social & Market Traction
            </h2>
          </div>

          {/* Main Traction Card */}
          <GlassCard className="mb-8">
            <div className="text-center mb-8">
              <p className="text-6xl sm:text-7xl font-bold mb-2" style={{ color: tokens.colors.yellow }}>
                122K
              </p>
              <p className="text-xl" style={{ color: tokens.colors.textSecondary }}>
                Profile Views (90 Days)
              </p>
            </div>
            
            <div
              className="w-32 h-1 mx-auto mb-8 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${tokens.colors.yellow} 0%, ${tokens.colors.orange} 100%)`,
              }}
            />

            {/* Sub-stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold mb-1" style={{ color: tokens.colors.orange }}>
                  81%
                </p>
                <p className="text-sm" style={{ color: tokens.colors.textMuted }}>
                  From Paid Ads
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1" style={{ color: tokens.colors.cyanGlow }}>
                  8K+
                </p>
                <p className="text-sm" style={{ color: tokens.colors.textMuted }}>
                  Followers
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-1" style={{ color: tokens.colors.yellow }}>
                  30K
                </p>
                <p className="text-sm" style={{ color: tokens.colors.textMuted }}>
                  Monthly Profile Views
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 4: THE ASK - Deep Blue with Gold Accent */}
      {/* ================================================================== */}
      <section
        className="relative px-6 py-20"
        style={{
          background: `linear-gradient(135deg, ${tokens.colors.deepBlue2} 0%, ${tokens.colors.deepBlue1} 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div
              className="inline-block px-6 py-2 rounded-full mb-4"
              style={{
                background: `linear-gradient(90deg, ${tokens.colors.yellow} 0%, ${tokens.colors.orange} 100%)`,
              }}
            >
              <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                Investment Opportunity
              </p>
            </div>
            <h2
              className="text-5xl sm:text-6xl font-bold mb-4"
              style={{ color: tokens.colors.textPrimary }}
            >
              We're Raising <span style={{ color: tokens.colors.yellow }}>$300K</span>
            </h2>
            <p className="text-xl" style={{ color: tokens.colors.textSecondary }}>
              Seed round to reach $575K ARR in 18 months
            </p>
          </div>

          {/* Investment Math */}
          <GlassCard className="mb-8" accentColor="yellow">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                  Seed Round
                </p>
                <p className="text-4xl font-bold" style={{ color: tokens.colors.primaryBlue }}>
                  $300K
                </p>
              </div>
              <div className="flex items-center justify-center text-2xl" style={{ color: tokens.colors.textMuted }}>
                +
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                  MRR (18mo)
                </p>
                <p className="text-4xl font-bold" style={{ color: tokens.colors.green }}>
                  $223K
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                  Total Runway
                </p>
                <p className="text-4xl font-bold" style={{ color: tokens.colors.yellow }}>
                  $523K
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Use of Funds */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard accentColor="blue">
              <div className="text-center">
                <div className="text-4xl mb-3">📈</div>
                <p className="text-sm uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                  Go-to-Market
                </p>
                <p className="text-3xl font-bold mb-2" style={{ color: tokens.colors.primaryBlue }}>
                  $237K
                </p>
                <p className="text-sm" style={{ color: tokens.colors.textSecondary }}>
                  45% • 396 new customers
                </p>
              </div>
            </GlassCard>

            <GlassCard accentColor="purple">
              <div className="text-center">
                <div className="text-4xl mb-3">🤖</div>
                <p className="text-sm uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                  Product & R&D
                </p>
                <p className="text-3xl font-bold mb-2" style={{ color: tokens.colors.purple }}>
                  $171K
                </p>
                <p className="text-sm" style={{ color: tokens.colors.textSecondary }}>
                  33% • AI Booking system
                </p>
              </div>
            </GlassCard>

            <GlassCard accentColor="cyan">
              <div className="text-center">
                <div className="text-4xl mb-3">⚙️</div>
                <p className="text-sm uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                  Operations
                </p>
                <p className="text-3xl font-bold mb-2" style={{ color: tokens.colors.cyanGlow }}>
                  $115K
                </p>
                <p className="text-sm" style={{ color: tokens.colors.textSecondary }}>
                  22% • Team & support
                </p>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 5: UNIT ECONOMICS - Medium Blue */}
      {/* ================================================================== */}
      <section
        className="relative px-6 py-20"
        style={{
          background: `linear-gradient(180deg, ${tokens.colors.deepBlue3} 0%, ${tokens.colors.deepBlue2} 100%)`,
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: tokens.colors.yellow }}
            >
              The Numbers
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold"
              style={{ color: tokens.colors.textPrimary }}
            >
              Unit Economics
            </h2>
          </div>

          {/* Economics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <GlassCard className="text-center">
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                CAC
              </p>
              <p className="text-3xl font-bold" style={{ color: tokens.colors.textPrimary }}>
                $308
              </p>
            </GlassCard>

            <GlassCard className="text-center">
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                ARPU
              </p>
              <p className="text-3xl font-bold" style={{ color: tokens.colors.textPrimary }}>
                $58
              </p>
            </GlassCard>

            <GlassCard className="text-center">
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: tokens.colors.textMuted }}>
                LTV (3yr)
              </p>
              <p className="text-3xl font-bold" style={{ color: tokens.colors.green }}>
                $1,922
              </p>
            </GlassCard>

            <GlassCard className="text-center" accentColor="yellow">
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: tokens.colors.yellow }}>
                LTV:CAC
              </p>
              <p className="text-3xl font-bold" style={{ color: tokens.colors.yellow }}>
                6.2x
              </p>
            </GlassCard>
          </div>

          {/* ARR Buildup */}
          <GlassCard>
            <h3 className="text-xl font-bold mb-6 text-center" style={{ color: tokens.colors.textPrimary }}>
              ARR Buildup to $575K
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span style={{ color: tokens.colors.textSecondary }}>
                  Current ARR <span className="text-xs" style={{ color: tokens.colors.textMuted }}>(171 accounts)</span>
                </span>
                <span className="text-xl font-bold" style={{ color: tokens.colors.textPrimary }}>
                  $149K
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span style={{ color: tokens.colors.primaryBlue }}>
                  + New Customer ARR <span className="text-xs" style={{ color: tokens.colors.textMuted }}>(396 new)</span>
                </span>
                <span className="text-xl font-bold" style={{ color: tokens.colors.primaryBlue }}>
                  +$275K
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span style={{ color: tokens.colors.purple }}>
                  + Expansion ARR <span className="text-xs" style={{ color: tokens.colors.textMuted }}>(AI upsell)</span>
                </span>
                <span className="text-xl font-bold" style={{ color: tokens.colors.purple }}>
                  +$165K
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/10">
                <span style={{ color: tokens.colors.textSecondary }}>
                  - Churn <span className="text-xs" style={{ color: tokens.colors.textMuted }}>(5% annual)</span>
                </span>
                <span className="text-xl font-bold" style={{ color: "#EF4444" }}>
                  -$14K
                </span>
              </div>
              <div
                className="flex justify-between items-center py-4 rounded-xl px-4"
                style={{
                  background: `linear-gradient(90deg, ${tokens.colors.green}20 0%, ${tokens.colors.cyanGlow}20 100%)`,
                  borderTop: `2px solid ${tokens.colors.green}`,
                }}
              >
                <span className="font-bold" style={{ color: tokens.colors.green }}>
                  Target ARR (Q2 2027)
                </span>
                <span className="text-2xl font-bold" style={{ color: tokens.colors.green }}>
                  $575K
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SECTION 6: ROI SUMMARY - Deep Navy with Gold Highlights */}
      {/* ================================================================== */}
      <section
        className="relative px-6 py-20"
        style={{
          background: `linear-gradient(135deg, ${tokens.colors.deepBlue1} 0%, ${tokens.colors.deepBlue4} 100%)`,
        }}
      >
        <div className="max-w-5xl mx-auto">
          <GlassCard accentColor="yellow">
            <div className="text-center mb-8">
              <p
                className="text-sm uppercase tracking-wider mb-4"
                style={{ color: tokens.colors.yellow }}
              >
                Return on Investment
              </p>
              <p className="text-6xl sm:text-7xl font-bold" style={{ color: tokens.colors.textPrimary }}>
                $575K ARR
              </p>
              <p className="text-lg mt-2" style={{ color: tokens.colors.textSecondary }}>
                by Q2 2027
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: tokens.colors.primaryBlue }}>
                  $300K
                </p>
                <p className="text-xs mt-1" style={{ color: tokens.colors.textMuted }}>
                  Your Investment
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: tokens.colors.green }}>
                  $575K
                </p>
                <p className="text-xs mt-1" style={{ color: tokens.colors.textMuted }}>
                  ARR Generated
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: tokens.colors.yellow }}>
                  3.9x
                </p>
                <p className="text-xs mt-1" style={{ color: tokens.colors.textMuted }}>
                  ARR Growth
                </p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold" style={{ color: tokens.colors.orange }}>
                  1.9x
                </p>
                <p className="text-xs mt-1" style={{ color: tokens.colors.textMuted }}>
                  ROI (18mo)
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-sm" style={{ color: tokens.colors.textSecondary }}>
                <span style={{ color: tokens.colors.primaryBlue }}>$300K investment</span> →{" "}
                generates <span style={{ color: tokens.colors.green }}>$575K ARR</span> →{" "}
                <span style={{ color: tokens.colors.yellow }}>1.9x return</span> in 18 months
              </p>
            </div>
          </GlassCard>

          {/* CTA */}
          <div className="text-center mt-12">
            <button
              className="px-10 py-5 rounded-full font-bold text-lg text-gray-900 transition-all hover:scale-105"
              style={{
                background: `linear-gradient(90deg, ${tokens.colors.yellow} 0%, ${tokens.colors.orange} 100%)`,
                boxShadow: `0 20px 40px rgba(245, 158, 11, 0.4)`,
              }}
            >
              Get the Full Pitch Deck
            </button>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FOOTER - Darkest */}
      {/* ================================================================== */}
      <footer
        className="relative px-6 py-12"
        style={{
          background: tokens.colors.deepBlue1,
          borderTop: `1px solid ${tokens.colors.glassBorder}`,
        }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm mb-4" style={{ color: tokens.colors.textMuted }}>
            Conservative projections based on validated 2024-2025 performance data
          </p>
          <p className="text-xs" style={{ color: tokens.colors.textCaption }}>
            © 2026 Spectra AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
