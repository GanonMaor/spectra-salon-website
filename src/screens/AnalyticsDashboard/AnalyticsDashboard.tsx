import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, Zap, Calendar, Check, ArrowRight } from 'lucide-react';

// ═══════════════════════════════════════════════════════════
// DATA LAYER
// ═══════════════════════════════════════════════════════════

// Roadmap from Investor Page
const ROADMAP_ITEMS = [
  {
    id: "q4-2025",
    tag: "Q4 2025",
    title: "Major Product Update",
    bullets: [
      "React Native upgrade + new scale integrations",
      "Desktop dashboard, profiles, built-in AI insights",
      "Full-time dev, support & admin roles",
      "AI Order Assistance — auto reorder for inventory",
    ],
  },
  {
    id: "q1q2-2026",
    tag: "Q1–Q2 2026",
    title: "All-in-One Salon AI",
    bullets: [
      "AI Booking Assistance (Schedule Assistant)",
      "BI Assistance — automated business insights",
      "WhatsApp & Meta integrations",
      "By June: connect to POS (IL + US)",
    ],
  },
  {
    id: "q3-2026",
    tag: "Q3 2026",
    title: "Growth & Funding",
    bullets: [
      "~$200K raise for US expansion",
      "Exhibit at major US trade shows",
      "Hire 1–2 sales & 1–2 customer success",
    ],
  },
  {
    id: "q4-2026",
    tag: "Q4 2026",
    title: "Revenue Scale",
    bullets: [
      "Aggressive US market entry",
      "Finish 2026 at ~$500K ARR",
    ],
  },
];

// Revenue Data (converted to USD)
const REVENUE_DATA_2024_2025 = [
  { month: 'Jan 24', israel: 6548, international: 895, distributors: 0, total: 7443, year: 2024 },
  { month: 'Feb 24', israel: 5937, international: 260, distributors: 0, total: 6197, year: 2024 },
  { month: 'Mar 24', israel: 8494, international: 115, distributors: 0, total: 8608, year: 2024 },
  { month: 'Apr 24', israel: 8079, international: 117, distributors: 0, total: 8196, year: 2024 },
  { month: 'May 24', israel: 8926, international: 0, distributors: 0, total: 8926, year: 2024 },
  { month: 'Jun 24', israel: 5769, international: 82, distributors: 0, total: 5851, year: 2024 },
  { month: 'Jul 24', israel: 5534, international: 1037, distributors: 0, total: 6571, year: 2024 },
  { month: 'Aug 24', israel: 7846, international: 1078, distributors: 0, total: 8924, year: 2024 },
  { month: 'Sep 24', israel: 7721, international: 1019, distributors: 0, total: 8740, year: 2024 },
  { month: 'Oct 24', israel: 6629, international: 1663, distributors: 0, total: 8293, year: 2024 },
  { month: 'Nov 24', israel: 9069, international: 2549, distributors: 0, total: 11618, year: 2024 },
  { month: 'Dec 24', israel: 9796, international: 3623, distributors: 0, total: 13419, year: 2024 },
  { month: 'Jan 25', israel: 7773, international: 2259, distributors: 0, total: 10032, year: 2025 },
  { month: 'Feb 25', israel: 7519, international: 3876, distributors: 0, total: 11395, year: 2025 },
  { month: 'Mar 25', israel: 6774, international: 3645, distributors: 15552, total: 25971, year: 2025, special: '50 Distributor Licenses (€14,400 = $15.5K)' },
  { month: 'Apr 25', israel: 6635, international: 5654, distributors: 0, total: 12289, year: 2025 },
  { month: 'May 25', israel: 7199, international: 5689, distributors: 0, total: 12888, year: 2025 },
  { month: 'Jun 25', israel: 6629, international: 6828, distributors: 0, total: 13457, year: 2025 },
  { month: 'Jul 25', israel: 7229, international: 6502, distributors: 0, total: 13730, year: 2025 },
  { month: 'Aug 25', israel: 7712, international: 6181, distributors: 0, total: 13893, year: 2025 },
  { month: 'Sep 25', israel: 7524, international: 5617, distributors: 0, total: 13141, year: 2025 },
  { month: 'Oct 25', israel: 7096, international: 5482, distributors: 0, total: 12578, year: 2025 },
  { month: 'Nov 25', israel: 7966, international: 6433, distributors: 0, total: 14400, year: 2025 },
  { month: 'Dec 25', israel: 7190, international: 8443, distributors: 0, total: 15633, year: 2025 },
];

// Forecast Data
const FORECAST_DATA = [
  { quarter: 'Q1 2026', baseARR: 142, newCustomerARR: 28, expansionARR: 0, total: 170, customers: 200, investmentDeployed: 33 },
  { quarter: 'Q2 2026', baseARR: 140, newCustomerARR: 70, expansionARR: 0, total: 210, customers: 235, investmentDeployed: 66 },
  { quarter: 'Q3 2026', baseARR: 138, newCustomerARR: 115, expansionARR: 37, total: 290, customers: 275, investmentDeployed: 99 },
  { quarter: 'Q4 2026', baseARR: 137, newCustomerARR: 165, expansionARR: 83, total: 385, customers: 320, investmentDeployed: 132 },
  { quarter: 'Q1 2027', baseARR: 136, newCustomerARR: 220, expansionARR: 134, total: 490, customers: 370, investmentDeployed: 165 },
  { quarter: 'Q2 2027', baseARR: 135, newCustomerARR: 285, expansionARR: 190, total: 610, customers: 425, investmentDeployed: 200, milestone: 'Target' },
];

// KPI Data
const KPI_DATA = {
  activeCustomers: 180,
  israelARR: 82000,
  internationalARR: 63000,
  combinedARR: 145000,
};

// ═══════════════════════════════════════════════════════════
// PREMIUM COMPONENT SYSTEM
// ═══════════════════════════════════════════════════════════

// Premium Glass Card
const GlassCard: React.FC<{ children: React.ReactNode; className?: string; hoverable?: boolean }> = ({ 
  children, 
  className = '', 
  hoverable = false 
}) => (
  <motion.div
    whileHover={hoverable ? { y: -4, scale: 1.01 } : {}}
    transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
    className={`
      relative overflow-hidden
      bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-xl
      rounded-3xl border border-white/20
      shadow-[0_8px_32px_rgba(0,0,0,0.06)]
      before:absolute before:inset-0 
      before:bg-gradient-to-br before:from-orange-50/30 before:to-transparent 
      before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500
      ${className}
    `}
  >
    {children}
  </motion.div>
);

// Video Card with Play/Pause Controls
const VideoCard: React.FC<{ videoSrc: string }> = ({ videoSrc }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);

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

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative"
    >
      <div className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.12)] group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.18)] transition-all duration-300">
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover cursor-pointer"
          loop
          muted={isMuted}
          playsInline
          onClick={togglePlay}
        />
        
        {/* Play/Pause Overlay - Instagram Style */}
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onClick={togglePlay}
        >
          {!isPlaying && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/90 backdrop-blur"
            >
              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </motion.div>
          )}
        </div>

        {/* Controls - Bottom Left (Instagram style) */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/20"
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className="w-10 h-10 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center transition-all backdrop-blur-sm border border-white/20"
          >
            {isMuted ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Premium Section Header
const SectionHeader: React.FC<{ 
  number?: string; 
  title: string; 
  subtitle?: string 
}> = ({ number, title, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="mb-12 sm:mb-16"
  >
    <div className="flex items-center gap-4 sm:gap-6 mb-4">
      {number && (
        <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-gray-100 leading-none">
          {number}
        </span>
      )}
      <div className="flex-1">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-2 sm:mb-3">
          {title}
        </h2>
        <div className="w-16 sm:w-20 md:w-24 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 rounded-full" />
      </div>
    </div>
    {subtitle && (
      <p className="text-base sm:text-lg text-gray-600 max-w-3xl ml-0 sm:ml-20 md:ml-28">
        {subtitle}
      </p>
    )}
  </motion.div>
);

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

const AnalyticsDashboard: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState('2024-2025');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            Spectra AI
          </h1>
          <div className="text-xs sm:text-sm text-gray-500">
            Analytics Dashboard
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-100/40 via-amber-50/30 to-orange-100/40" />
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-orange-200/50 mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">Live Dashboard • Jan 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-gray-900 mb-6 leading-tight px-4">
              Scaling Salon AI
              <br />
              <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent font-medium">
                with Proven Traction
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed px-4">
              From $145K ARR and 180+ paying salons to $610K ARR in 18 months.
              <br className="hidden sm:block" />
              <span className="sm:inline block mt-2 sm:mt-0">Built on real revenue, proven demand, and capital-efficient growth.</span>
            </p>

            {/* Hero KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
              <GlassCard hoverable className="p-8">
                <div className="flex flex-col items-center">
                  <Users className="w-8 h-8 text-orange-500 mb-3" />
                  <div className="text-4xl font-bold text-gray-900 mb-1">{KPI_DATA.activeCustomers}</div>
                  <div className="text-sm text-gray-600">Active Customers</div>
                </div>
              </GlassCard>

              <GlassCard hoverable className="p-8 ring-2 ring-orange-400/30">
                <div className="flex flex-col items-center">
                  <DollarSign className="w-8 h-8 text-orange-500 mb-3" />
                  <div className="text-4xl font-bold text-gray-900 mb-1">${(KPI_DATA.combinedARR / 1000).toFixed(0)}K</div>
                  <div className="text-sm text-gray-600">Combined ARR</div>
                </div>
              </GlassCard>

              <GlassCard hoverable className="p-8">
                <div className="flex flex-col items-center">
                  <Target className="w-8 h-8 text-orange-500 mb-3" />
                  <div className="text-4xl font-bold text-gray-900 mb-1">$610K</div>
                  <div className="text-sm text-gray-600">Target (Q2 '27)</div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 space-y-16 sm:space-y-24 md:space-y-32">

        {/* Product Snapshot */}
        <section>
          <SectionHeader 
            number="01"
            title="Product Snapshot"
            subtitle="What Spectra helps salons do today"
          />

          {/* Value Proposition */}
          <div className="mb-12 max-w-3xl">
            <p className="text-lg text-gray-700 leading-relaxed">
              <strong className="text-gray-900">Spectra is the iPad operating layer for modern salons.</strong>
              <br />
              We help salons deliver consistent color results, reduce waste, and improve team execution — 
              all while giving owners real-time operational visibility.
              <br /><br />
              Spectra turns the iPad at the color bar into a real-time operating system for the salon. 
              It helps teams mix color faster, reduce mistakes, track formulas, and stay consistent across stylists.
            </p>
          </div>

          {/* Video Collage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Instagram Reels - Note: reel1 doesn't exist, starting from 2 */}
            {[2, 3, 4, 5, 6].map((num) => (
              <VideoCard key={num} videoSrc={`/instagram-reel${num}.mp4`} />
            ))}
            
            {/* YouTube Demo in Grid */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative"
            >
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.12)] group-hover:shadow-[0_16px_48px_rgba(0,0,0,0.18)] transition-all duration-300">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/VA6F3PjUEX8?autoplay=0&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0"
                  title="Spectra Product Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </div>


          {/* AI Layer */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-12 text-white">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-2xl font-semibold">AI Layer: In Production + Roadmap</h4>
                  <p className="text-slate-400">Powering smart salon operations</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white/10 rounded-2xl p-6 border border-white/10 backdrop-blur">
                  <p className="text-green-400 text-xs font-semibold mb-2">✓ LIVE</p>
                  <p className="text-sm font-medium mb-1">Formula Intelligence</p>
                  <p className="text-xs text-slate-400">Smart calculations</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 border border-white/10 backdrop-blur">
                  <p className="text-green-400 text-xs font-semibold mb-2">✓ LIVE</p>
                  <p className="text-sm font-medium mb-1">Usage Insights</p>
                  <p className="text-xs text-slate-400">Behavioral analytics</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 border border-white/10 backdrop-blur">
                  <p className="text-yellow-400 text-xs font-semibold mb-2">→ Q2 2026</p>
                  <p className="text-sm font-medium mb-1">Smart Automations</p>
                  <p className="text-xs text-slate-400">Workflow optimization</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-6 border border-white/10 backdrop-blur">
                  <p className="text-blue-400 text-xs font-semibold mb-2">→ ROADMAP</p>
                  <p className="text-sm font-medium mb-1">AI Assistant</p>
                  <p className="text-xs text-slate-400">Voice + predictive</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Revenue Growth */}
        <section>
          <SectionHeader 
            number="02"
            title="Revenue Growth"
            subtitle="$100K (2024) → $169K (2025) = +69% YoY"
          />

          <GlassCard className="p-10">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={REVENUE_DATA_2024_2025}>
                <defs>
                  <linearGradient id="gradIsrael" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="gradInternational" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB000" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFB000" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="gradDistributors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B7280" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#6B7280" stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6B7280" style={{ fontSize: '11px' }} label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '12px' }}
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="israel" stackId="a" fill="url(#gradIsrael)" name="Israel" radius={[4, 4, 0, 0]} />
                <Bar dataKey="international" stackId="a" fill="url(#gradInternational)" name="International" />
                <Bar dataKey="distributors" stackId="a" fill="url(#gradDistributors)" name="Distributors" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>

            <div className="mt-8 p-6 bg-blue-50/50 border border-blue-100 rounded-2xl">
              <p className="text-sm text-gray-700">
                <strong>Context:</strong> 2024 was a beta year focused on Israel. In 2025 we shifted to international growth—Israel remained stable by design while international became the main growth engine.
              </p>
            </div>
          </GlassCard>
        </section>

        {/* Growth Forecast */}
        <section>
          <SectionHeader 
            number="03"
            title="18-Month Growth Forecast"
            subtitle="$200K investment deployed over 6 quarters (Q1 2026 - Q2 2027)"
          />

          <GlassCard className="p-10 mb-8">
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={FORECAST_DATA}>
                <defs>
                  <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="newCustomerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="expansionGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="quarter" stroke="#6B7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} label={{ value: 'ARR ($K)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px' }}
                  formatter={(value: number) => `$${value}K`}
                />
                <Legend />
                <Area type="monotone" dataKey="baseARR" stackId="1" stroke="#3B82F6" fill="url(#baseGrad)" name="Base ARR" />
                <Area type="monotone" dataKey="newCustomerARR" stackId="1" stroke="#FF7A00" fill="url(#newCustomerGrad)" name="New Customers" />
                <Area type="monotone" dataKey="expansionARR" stackId="1" stroke="#10B981" fill="url(#expansionGrad)" name="Expansion (Q3+)" />
                <Line type="monotone" dataKey="total" stroke="#1F2937" strokeWidth={3} dot={{ r: 6 }} name="Total ARR" />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-2xl">
              <p className="text-sm text-gray-700">
                <strong>Baseline ARR model:</strong> Includes ~2% monthly churn, offset by retention improvements. Expansion layer starts Q3 2026 when upsell features launch.
              </p>
            </div>
          </GlassCard>

          {/* Target Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <GlassCard hoverable className="p-8 text-center">
              <p className="text-sm text-gray-600 mb-2">Start (Q1 2026)</p>
              <p className="text-5xl font-bold text-gray-900 mb-2">$145K</p>
              <p className="text-xs text-gray-500">180+ customers</p>
            </GlassCard>

            <GlassCard hoverable className="p-8 text-center ring-2 ring-orange-400/40">
              <p className="text-sm text-orange-600 mb-2 font-semibold">Target (Q2 2027)</p>
              <p className="text-5xl font-bold text-orange-600 mb-2">$610K</p>
              <p className="text-xs text-gray-600">425 customers</p>
            </GlassCard>

            <GlassCard hoverable className="p-8 text-center">
              <p className="text-sm text-gray-600 mb-2">Growth Multiple</p>
              <p className="text-5xl font-bold text-green-600 mb-2">4.2x</p>
              <p className="text-xs text-gray-500">in 18 months</p>
            </GlassCard>
          </div>

          {/* Upside Channel */}
          <div className="mt-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-50 to-indigo-50 p-10 border border-purple-200">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-7 h-7 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-semibold text-gray-900 mb-2">Reseller Partnerships (Upside)</h4>
                <p className="text-purple-600 mb-6">Not included in base forecast → additional growth potential</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="bg-white/80 rounded-xl p-4 border border-purple-100">
                    <p className="text-sm font-semibold text-gray-900 mb-1">High-Leverage Growth</p>
                    <p className="text-xs text-gray-600">Low CAC, scalable distribution</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 border border-purple-100">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Proven Traction</p>
                    <p className="text-xs text-gray-600">Portugal distributor success</p>
                  </div>
                  <div className="bg-white/80 rounded-xl p-4 border border-purple-100">
                    <p className="text-sm font-semibold text-gray-900 mb-1">Pipeline Active</p>
                    <p className="text-xs text-gray-600">Additional distributors in discussion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Roadmap */}
        <section>
          <SectionHeader 
            number="04"
            title="Product Roadmap"
            subtitle="Clear execution path from Q4 2025 through 2026"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {ROADMAP_ITEMS.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <GlassCard hoverable className="p-8 h-full">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mb-4">
                    {item.tag}
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 mb-4">{item.title}</h4>
                  <ul className="space-y-3">
                    {item.bullets.map((bullet, bidx) => (
                      <li key={bidx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Investment Thesis */}
        <section>
          <div className="relative overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 p-16 text-white text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h3 className="text-4xl font-light mb-4">The Opportunity</h3>
                <p className="text-xl text-orange-300 mb-12">$200K → $610K ARR in 18 months</p>

                <p className="text-lg text-white/80 max-w-2xl mx-auto mb-12 leading-relaxed">
                  Scaling from <strong className="text-white">$145K ARR</strong> and <strong className="text-white">180 paying customers</strong> — 
                  not starting from zero. The investment unlocks execution, not market discovery.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                    <p className="text-3xl font-bold text-blue-300 mb-2">$145K</p>
                    <p className="text-sm text-white/70">Current ARR</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                    <p className="text-3xl font-bold text-orange-300 mb-2">+$280K</p>
                    <p className="text-sm text-white/70">New Customers</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                    <p className="text-3xl font-bold text-green-300 mb-2">+$185K</p>
                    <p className="text-sm text-white/70">Expansion (Q3+)</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="bg-white/50 backdrop-blur-lg border-t border-gray-200/50 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 mb-2">Spectra AI © 2026</p>
          <p className="text-xs text-gray-400">Confidential — For Investor Use Only</p>
        </div>
      </footer>
    </div>
  );
};

export { AnalyticsDashboard };
export default AnalyticsDashboard;
