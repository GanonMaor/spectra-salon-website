import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlideNavigation } from "../../components/ui/SlideNavigation";

interface KpiData {
  title: string;
  value: string;
  description: string;
  delay: number;
}

// Split KPI content across two slides per request
const kpiFundingAndTeam: KpiData[] = [
  {
    title: "Funding & Investors",
    value: "$1.1M Raised",
    description: "Amos Horowitz — $600K; Brian Cooper (Retalix) — $300K; others completed the round.",
    delay: 0.1
  },
  {
    title: "Cash-Flow Positive",
    value: "Profitable Operations",
    description: "Profitable with ~ $1.5K monthly marketing.",
    delay: 0.2
  },
  {
    title: "Subscription Revenue",
    value: "~$155K ARR (Subscriptions)",
    description: "Recurring revenue from active salon subscriptions.",
    delay: 0.3
  },
  {
    title: "Active Users",
    value: "225 Paying Users",
    description: "Current live, paying salons on Spectra.",
    delay: 0.4
  }
];

const kpiTractionAndSaaS: KpiData[] = [
  {
    title: "Social & Market Traction",
    value: "122K Views (90 Days)",
    description: "81% from ads, 6K followers, 30K monthly profile views.",
    delay: 0.1
  },
  {
    title: "Customer Acquisition Pace",
    value: "+15 New Accounts Monthly",
    description: "Consistent growth in new paying salons.",
    delay: 0.2
  },
  {
    title: "SaaS Metrics",
    value: "LTV $2,400 / CAC $300 (8x Ratio)",
    description: "Every $300 spent brings $2,400 in lifetime revenue — clear 8x return.",
    delay: 0.3
  }
];

// Shared roadmap data for Slides 3–4
type RoadmapItem = {
  id: string;
  tag: string;
  title: string;
  bullets: string[];
};

const ROADMAP_ITEMS: RoadmapItem[] = [
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

// Slide 1: Hero Section with all the text content
const Slide1: React.FC = () => (
  <motion.div
    key="slide1"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.5 }}
    className="w-full"
  >
    {/* Header Section */}
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="text-center"
    >
      {/* Moroccan Hermès-style logo */}
      <div className="flex justify-center mb-4 sm:mb-6 md:mb-8 mt-6 sm:mt-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 border-red-600/30 flex items-center justify-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20" />
          </div>
        </motion.div>
      </div>
      
      {/* Parisian-inspired Header with Elegant Typography */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center mb-10 sm:mb-12 md:mb-14 px-4"
      >
        {/* Line 1: IN 2026 - Anticipation */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs sm:text-sm md:text-base font-extralight text-white/70 tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.4em] uppercase mb-3 sm:mb-4"
        >
          IN 2026
        </motion.p>
        
        {/* Elegant divider */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-8 sm:w-10 md:w-12 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-6 sm:mb-8 md:mb-10"
        />
        
        {/* Group 1: SPECTRA WILL BE + THE FIRST AND ONLY (closely grouped) */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-white tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] uppercase mb-4 sm:mb-6 md:mb-8 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight"
        >
          SPECTRA WILL BE
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-orange-400 to-amber-400 tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] uppercase mb-6 sm:mb-8 md:mb-10 leading-tight"
        >
          THE FIRST AND ONLY
        </motion.p>
        
        {/* Elegant accent line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="w-16 sm:w-20 md:w-24 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent mx-auto mb-6 sm:mb-8 md:mb-10"
        />
        
        {/* Group 2: ALL-IN-ONE AI PLATFORM FOR SALONS (separate with breathing room) */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-normal text-white tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.15em] uppercase leading-tight max-w-4xl mx-auto mb-5 sm:mb-6 md:mb-8"
        >
          ALL-IN-ONE AI PLATFORM FOR SALONS
        </motion.h2>
        
        {/* Refined body text - directly attached to the headline above */}
        <div className="max-w-3xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 px-4 mb-10 sm:mb-12 md:mb-14">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl font-light text-white leading-snug sm:leading-normal md:leading-relaxed tracking-normal sm:tracking-wide"
          >
            The salon industry is at a turning point.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl font-light text-gray-300 leading-snug sm:leading-normal md:leading-relaxed"
          >
            With relatively small investment, Spectra AI is driving a game-changing shift.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.8 }}
            className="text-sm sm:text-base md:text-lg lg:text-xl font-light text-gray-300 leading-snug sm:leading-normal md:leading-relaxed"
          >
            Backed by strong global traction and steady growth, we are set to lead the future of salon management.
          </motion.p>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.0 }}
          className="text-xs sm:text-sm md:text-base font-light text-orange-300/80 tracking-wide"
        >
          Built with care in Tel Aviv and Paris — for salons worldwide.
        </motion.p>
      </motion.div>
    </motion.div>
  </motion.div>
);

// Slide 2A: Funding + Team/Profitability
const Slide2Funding: React.FC = () => (
  <motion.div
    key="slide2"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.5 }}
    className="w-full"
  >
    {/* Section Header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="max-w-5xl mx-auto px-2 sm:px-4"
    >
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        {/* Header */}
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-orange-400 tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.2em] uppercase mb-3 sm:mb-4 px-4">
          Funding & Team Profitability
        </p>
        
        {/* Elegant divider - moved below title */}
        <div className="flex items-center justify-center mb-3 sm:mb-4 px-4">
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
          <div className="mx-3 sm:mx-4 md:mx-6 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400/50 rounded-full" />
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-l from-transparent via-orange-400/50 to-transparent" />
        </div>
      </div>
    </motion.div>

    {/* Single large card with three bullets */}
    <div className="px-2 sm:px-4 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="group/card relative"
      >
        <div className="
          relative bg-black/20 backdrop-blur-md
          border border-orange-500/40
          rounded-2xl
          transition-all duration-500
          hover:bg-black/30
          hover:border-orange-400/60
          hover:shadow-[0_8px_32px_0_rgba(251,146,60,0.3)]
          p-5 sm:p-6 md:p-8
          overflow-hidden
          min-h-[300px] sm:min-h-[320px] md:min-h-[360px]
          flex flex-col
        ">
          <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-orange-400/40 transition-all duration-500 group-hover/card:border-orange-300/60 group-hover/card:w-8 group-hover/card:h-8 sm:group-hover/card:w-10 sm:group-hover/card:h-10" />
          <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-orange-400/40 transition-all duration-500 group-hover/card:border-orange-300/60 group-hover/card:w-8 group-hover/card:h-8 sm:group-hover/card:w-10 sm:group-hover/card:h-10" />
          <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-orange-400/40 transition-all duration-500 group-hover/card:border-orange-300/60 group-hover/card:w-8 group-hover/card:h-8 sm:group-hover/card:w-10 sm:group-hover/card:h-10" />
          <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-orange-400/40 transition-all duration-500 group-hover/card:border-orange-300/60 group-hover/card:w-8 group-hover/card:h-8 sm:group-hover/card:w-10 sm:group-hover/card:h-10" />
          <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all duration-500" />

          <div className="flex flex-col flex-grow relative z-10">
            <h3 className="text-[11px] sm:text-xs font-normal text-orange-400 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] mb-2 sm:mb-3 md:mb-4">
              Summary
            </h3>
            <div className="space-y-6 sm:space-y-7 md:space-y-8">
              {kpiFundingAndTeam.map((item, i) => (
                <div key={i} className="group/bullet">
                  <p className="text-base sm:text-lg md:text-xl font-normal text-white leading-snug sm:leading-normal">
                    <span className="font-medium">{item.title}</span>{" — "}{item.value}
                  </p>
                  <p className="text-sm sm:text-base font-normal text-gray-300 leading-snug sm:leading-normal md:leading-relaxed">
                    {item.description}
                  </p>
                  <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-red-400 to-orange-400 mt-2 transition-all duration-500 group-hover/bullet:w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </motion.div>
);

// Slide 2B: Social/Acquisition/SaaS
const Slide2Traction: React.FC = () => (
  <motion.div
    key="slide2b"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.5 }}
    className="w-full"
  >
    {/* Section Header */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="max-w-5xl mx-auto px-2 sm:px-4"
    >
      <div className="text-center mb-4 sm:mb-6 md:mb-8">
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-orange-400 tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.2em] uppercase mb-3 sm:mb-4 px-4">
          Traction, Acquisition Pace & SaaS Metrics
        </p>
        <div className="flex items-center justify-center mb-3 sm:mb-4 px-4">
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
          <div className="mx-3 sm:mx-4 md:mx-6 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400/50 rounded-full" />
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-l from-transparent via-orange-400/50 to-transparent" />
        </div>
      </div>
    </motion.div>

    {/* Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4 max-w-6xl mx-auto">
      {kpiTractionAndSaaS.map((kpi, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: kpi.delay, ease: "easeOut" }}
          className="group relative"
        >
          <div className="
            relative bg-black/20 backdrop-blur-md
            border border-orange-500/40
            rounded-2xl
            transition-all duration-500
            hover:bg-black/30
            hover:border-orange-400/60
            hover:shadow-[0_8px_32px_0_rgba(251,146,60,0.3)]
            p-4 sm:p-5 md:p-7
            overflow-hidden
            h-full min-h-[192px] sm:min-h-[216px] md:min-h-[240px] lg:min-h-[288px]
            flex flex-col
          ">
            <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-orange-400/40 transition-all duration-500 group-hover:border-orange-300/60 group-hover:w-8 group-hover:h-8 sm:group-hover:w-10 sm:group-hover:h-10" />
            <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-orange-400/40 transition-all duration-500 group-hover:border-orange-300/60 group-hover:w-8 group-hover:h-8 sm:group-hover:w-10 sm:group-hover:h-10" />
            <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-orange-400/40 transition-all duration-500 group-hover:border-orange-300/60 group-hover:w-8 group-hover:h-8 sm:group-hover:w-10 sm:group-hover:h-10" />
            <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-orange-400/40 transition-all duration-500 group-hover:border-orange-300/60 group-hover:w-8 group-hover:h-8 sm:group-hover:w-10 sm:group-hover:h-10" />
            <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all duration-500" />
            <div className="flex flex-col flex-grow relative z-10">
              <h3 className="text-[11px] sm:text-xs font-normal text-orange-400 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] mb-2 sm:mb-3 md:mb-4 transition-colors duration-500">
                {kpi.title}
              </h3>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-white mb-1.5 sm:mb-2 md:mb-3 tracking-normal sm:tracking-wide drop-shadow-lg transition-all duration-500 leading-tight">
                {kpi.value}
              </p>
              <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-red-400 to-orange-400 mb-2 sm:mb-3 md:mb-4 group-hover:w-full transition-all duration-500" />
              <p className="text-sm sm:text-base font-normal text-gray-300 leading-snug sm:leading-normal md:leading-relaxed transition-colors duration-500 mt-auto">
                {kpi.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Slide 3: Investment Impact (Q4 2025 – H1 2026)
const Slide3: React.FC = () => {
  const items = ROADMAP_ITEMS.filter((i) => i.id === "q4-2025" || i.id === "q1q2-2026");

  return (
    <motion.div
      key="slide3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Title Section - matching style, updated copy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-center mb-6 sm:mb-8 md:mb-10"
      >
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-orange-400 tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.2em] uppercase mb-3 sm:mb-4 px-4">
          Impact of $80K Investment — Q4 2025 to H1 2026
        </p>
        <div className="flex items-center justify-center mb-3 sm:mb-4 px-4">
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
          <div className="mx-3 sm:mx-4 md:mx-6 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400/50 rounded-full" />
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-l from-transparent via-orange-400/50 to-transparent" />
        </div>
      </motion.div>

      {/* Vertical cards, larger, always expanded */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 px-2 sm:px-4 max-w-4xl mx-auto">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
            className="group relative"
          >
            <div className="
              relative bg-black/20 backdrop-blur-md
              border border-orange-500/40
              rounded-2xl
              transition-all duration-500
              hover:bg-black/30
              hover:border-orange-400/60
              hover:shadow-[0_8px_32px_0_rgba(251,146,60,0.3)]
              p-5 sm:p-6 md:p-8
              overflow-hidden
              min-h-[240px] sm:min-h-[260px] md:min-h-[300px]
              flex flex-col
            ">
              <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-orange-400/40" />
              <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-orange-400/40" />
              <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-orange-400/40" />
              <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-orange-400/40" />
              <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all duration-500" />

              <div className="flex flex-col flex-grow relative z-10">
                <h3 className="text-[11px] sm:text-xs font-normal text-orange-400 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] mb-2 sm:mb-3 md:mb-4">
                  {item.tag}
                </h3>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-white mb-1.5 sm:mb-2 md:mb-3 tracking-normal sm:tracking-wide drop-shadow-lg leading-tight">
                  {item.title}
                </p>
                <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-red-400 to-orange-400 mb-2 sm:mb-3 md:mb-4" />
                <ul className="list-disc ml-4 space-y-1 text-sm sm:text-base font-normal text-gray-300 leading-snug sm:leading-normal md:leading-relaxed">
                  {item.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Slide 3B: Investor Impact — Clear business outcomes from $80K
const SlideImpact: React.FC = () => {
  // Updated per user's new scenario
  const BASE_USERS = 225;
  const BASE_ARR = 156000; // $156K
  const BASE_ARPU = 58; // approx per user's note

  // After $80K investment, 40% of existing take new booking system
  const ADOPTION_RATE = 0.4;
  const AFTER_EXISTING_ARR = 211000; // $211K
  const AFTER_EXISTING_ARPU = 94; // $94

  // New account growth: from 10/mo to 25/mo → 300 new per year at $94
  const NEW_USERS_YEAR = 300;
  const NEW_USERS_ARPU = 94;
  const NEW_USERS_ARR = Math.round(NEW_USERS_YEAR * NEW_USERS_ARPU * 12); // 300 * 94 * 12 = 338,400

  const TARGET_ARR_IN_YEAR = AFTER_EXISTING_ARR + NEW_USERS_ARR; // ≈ 549,400

  const formatMoney = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <motion.div
      key="slide-impact"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-center mb-6 sm:mb-8 md:mb-10"
      >
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-orange-400 tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.2em] uppercase mb-3 sm:mb-4 px-4">
          Direct Business Impact — Updated Financial Outlook
        </p>
        <div className="flex items-center justify-center mb-3 sm:mb-4 px-4">
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
          <div className="mx-3 sm:mx-4 md:mx-6 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400/50 rounded-full" />
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-l from-transparent via-orange-400/50 to-transparent" />
        </div>
      </motion.div>

      {/* Single story card */}
      <div className="px-2 sm:px-4 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="group relative"
        >
          <div className="
            relative bg-black/20 backdrop-blur-md
            border border-orange-500/40
            rounded-2xl
            transition-all duration-500
            hover:bg-black/30
            hover:border-orange-400/60
            hover:shadow-[0_8px_32px_0_rgba(251,146,60,0.3)]
            p-5 sm:p-6 md:p-8
            overflow-hidden
            min-h-[320px] sm:min-h-[360px] md:min-h-[400px]
            flex flex-col
          ">
            <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-orange-400/40" />
            <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-orange-400/40" />
            <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-orange-400/40" />
            <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-orange-400/40" />
            <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all duration-500" />

            <div className="flex flex-col flex-grow relative z-10">
              <h3 className="text-[11px] sm:text-xs font-normal text-orange-400 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] mb-2 sm:mb-3 md:mb-4">
                The Story — Impact of $80K Investment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-white tracking-normal sm:tracking-wide drop-shadow-lg leading-tight">
                  Base: {BASE_USERS} users · {formatMoney(BASE_ARR)} ARR · ARPU ${BASE_ARPU}
                </p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-white tracking-normal sm:tracking-wide drop-shadow-lg leading-tight">
                  After adoption: {formatMoney(AFTER_EXISTING_ARR)} ARR · ARPU ${AFTER_EXISTING_ARPU}
                </p>
              </div>
              <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-red-400 to-orange-400 mb-3 sm:mb-4" />
              <ul className="list-disc ml-4 space-y-2 text-sm sm:text-base font-normal text-gray-300 leading-snug sm:leading-normal md:leading-relaxed">
                <li>{Math.round(ADOPTION_RATE * 100)}% of existing adopt booking system → ARR rises to {formatMoney(AFTER_EXISTING_ARR)}</li>
                <li>New growth: {NEW_USERS_YEAR} new accounts/year × ${NEW_USERS_ARPU} ARPU → {formatMoney(NEW_USERS_ARR)} ARR</li>
                <li>12-month outlook: ARR ≈ {formatMoney(TARGET_ARR_IN_YEAR)}</li>
                <li>AI Onboarding reduces time-to-value → higher activation, better retention, and lower churn</li>
                <li>Product stickiness increases; self-serve flows and automation lower CAC and lift LTV</li>
              </ul>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:text-sm text-orange-300/90">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-orange-400" />
                  <span>Focus: ship quickly, validate, expand usage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                  <span>Outcome: stronger unit economics within weeks</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Slide 4: Roadmap (H2 2026)
const Slide4: React.FC = () => {
  const items = ROADMAP_ITEMS.filter((i) => i.id === "q3-2026" || i.id === "q4-2026");

  return (
    <motion.div
      key="slide4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-center mb-6 sm:mb-8 md:mb-10"
      >
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-orange-400 tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.2em] uppercase mb-3 sm:mb-4 px-4">
          Development Roadmap — H2 2026
        </p>
        <div className="flex items-center justify-center mb-3 sm:mb-4 px-4">
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
          <div className="mx-3 sm:mx-4 md:mx-6 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400/50 rounded-full" />
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-l from-transparent via-orange-400/50 to-transparent" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6 px-2 sm:px-4 max-w-6xl mx-auto">
        {items.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
            className="group relative"
          >
            <div className="
              relative bg-black/20 backdrop-blur-md
              border border-orange-500/40
              rounded-2xl
              transition-all duration-500
              hover:bg-black/30
              hover:border-orange-400/60
              hover:shadow-[0_8px_32px_0_rgba(251,146,60,0.3)]
              p-4 sm:p-5 md:p-6
              overflow-hidden
              min-h-[200px] sm:min-h-[220px] md:min-h-[240px]
              flex flex-col
            ">
              <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-orange-400/40" />
              <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-orange-400/40" />
              <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-orange-400/40" />
              <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-orange-400/40" />
              <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all duration-500" />

              <div className="flex flex-col flex-grow relative z-10">
                <h3 className="text-[11px] sm:text-xs font-normal text-orange-400 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] mb-2 sm:mb-3 md:mb-4">
                  {item.tag}
                </h3>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-white mb-1.5 sm:mb-2 md:mb-3 tracking-normal sm:tracking-wide drop-shadow-lg leading-tight">
                  {item.title}
                </p>
                <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-red-400 to-orange-400 mb-2 sm:mb-3 md:mb-4" />
                <ul className="list-disc ml-4 space-y-1 text-xs sm:text-sm md:text-base font-normal text-gray-300 leading-snug sm:leading-normal md:leading-relaxed">
                  {item.bullets.map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Slide 5: Summary and Contact Form
const Slide5Summary: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/.netlify/functions/investor-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      key="slide5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-center mb-6 sm:mb-8 md:mb-10"
      >
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-light text-orange-400 tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.2em] uppercase mb-3 sm:mb-4 px-4">
          Join the Journey — Become Part of the Vision
        </p>
        <div className="flex items-center justify-center mb-3 sm:mb-4 px-4">
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
          <div className="mx-3 sm:mx-4 md:mx-6 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400/50 rounded-full" />
          <div className="h-px w-12 sm:w-16 md:w-20 lg:w-24 bg-gradient-to-l from-transparent via-orange-400/50 to-transparent" />
        </div>
      </motion.div>

      {/* Content Container */}
      <div className="px-2 sm:px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="group relative"
          >
            <div className="
              relative bg-black/20 backdrop-blur-md
              border border-orange-500/40
              rounded-2xl
              transition-all duration-500
              hover:bg-black/30
              hover:border-orange-400/60
              hover:shadow-[0_8px_32px_0_rgba(251,146,60,0.3)]
              p-5 sm:p-6 md:p-8
              overflow-hidden
              min-h-[320px] sm:min-h-[360px] md:min-h-[400px]
              flex flex-col
            ">
              <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-orange-400/40" />
              <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-orange-400/40" />
              <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-orange-400/40" />
              <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-orange-400/40" />
              <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all duration-500" />

              <div className="flex flex-col flex-grow relative z-10">
                <h3 className="text-[11px] sm:text-xs font-normal text-orange-400 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] mb-2 sm:mb-3 md:mb-4">
                  The Opportunity
                </h3>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-normal text-white mb-1.5 sm:mb-2 md:mb-3 tracking-normal sm:tracking-wide drop-shadow-lg leading-tight">
                  A Parisian Journey to Excellence
                </p>
                <div className="h-[2px] w-12 sm:w-16 bg-gradient-to-r from-red-400 to-orange-400 mb-3 sm:mb-4" />
                <div className="space-y-3 text-sm sm:text-base font-normal text-gray-300 leading-snug sm:leading-normal md:leading-relaxed">
                  <p>
                    With a proven product, clear market demand, and strong initial traction, Spectra AI is positioned to revolutionize the $300B salon industry.
                  </p>
                  <p>
                    Your strategic partnership will accelerate our immediate product roadmap, driving ARPU from $69 to $129 within months.
                  </p>
                  <p className="text-orange-300/90 italic">
                    "Together, we create the future of beauty intelligence with elegance, precision, and unmatched vision."
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-orange-400/20">
                  <p className="text-xs sm:text-sm text-orange-400 uppercase tracking-wider">
                    For Distinguished Investors Who Share Our Vision
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="group relative"
          >
            <div className="
              relative bg-black/20 backdrop-blur-md
              border border-orange-500/40
              rounded-2xl
              transition-all duration-500
              hover:bg-black/30
              hover:border-orange-400/60
              hover:shadow-[0_8px_32px_0_rgba(251,146,60,0.3)]
              p-5 sm:p-6 md:p-8
              overflow-hidden
              min-h-[320px] sm:min-h-[360px] md:min-h-[400px]
              flex flex-col
            ">
              <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-orange-400/40" />
              <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-r-2 border-orange-400/40" />
              <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-l-2 border-orange-400/40" />
              <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-orange-400/40" />
              <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all duration-500" />

              <div className="flex flex-col flex-grow relative z-10">
                <h3 className="text-[11px] sm:text-xs font-normal text-orange-400 uppercase tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.25em] mb-2 sm:mb-3 md:mb-4">
                  Express Your Interest
                </h3>
                
                {submitStatus === 'success' ? (
                  <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-400/20 flex items-center justify-center">
                        <svg className="w-8 h-8 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-white mb-2">Merci!</p>
                      <p className="text-sm text-gray-300">We will be in touch within 48 hours.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        className="w-full px-3 py-2 bg-black/30 border border-orange-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/60 transition-all"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="w-full px-3 py-2 bg-black/30 border border-orange-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/60 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="tel"
                        placeholder="Phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-3 py-2 bg-black/30 border border-orange-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/60 transition-all"
                      />
                      <input
                        type="text"
                        placeholder="Company/Fund"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="w-full px-3 py-2 bg-black/30 border border-orange-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/60 transition-all"
                      />
                    </div>
                    <textarea
                      placeholder="Your message or areas of interest"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 bg-black/30 border border-orange-400/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-400/60 transition-all resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                    >
                      {isSubmitting ? 'Sending...' : 'Begin the Conversation'}
                    </button>
                  </form>
                )}
                
                {submitStatus === 'error' && (
                  <p className="mt-2 text-sm text-red-400">Something went wrong. Please try again.</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const slides = [Slide1, Slide2Funding, Slide2Traction, Slide3, SlideImpact, Slide4, Slide5Summary];

export const InvestorPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const CurrentSlideComponent = slides[currentSlide];

  return (
    <div className="scroll-smooth overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
      {/* Main viewport container - exactly 100vh with no internal scrolling */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Amazing Salon Photo Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/wow222.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        
        {/* 80% dark opacity overlay for better contrast */}
        <div className="absolute inset-0 bg-black/80" />
        
        {/* Subtle glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-gray-100/3 to-white/5 backdrop-blur-sm" />
        
        {/* Moroccan-inspired Hermès texture */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="hermes" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Cpath d="M0 50h100M50 0v100" stroke="%23D2691E" stroke-width="0.8"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23hermes)"/%3E%3C/svg%3E')`,
            backgroundSize: '100px 100px'
          }}
        />
        
        {/* Warm paprika accent spots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-radial from-red-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-gradient-radial from-orange-400/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-yellow-600/10 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-3 pt-2 pb-12 h-full sm:px-4 sm:pt-6 sm:pb-8 md:px-6 md:pt-8 md:pb-12 lg:px-8 lg:pt-10 lg:pb-16 xl:pt-12 xl:pb-20">
          {/* Slide Content Container */}
          <div className="flex flex-col justify-center h-full">
            <AnimatePresence mode="wait">
              <CurrentSlideComponent />
            </AnimatePresence>
          </div>
        </div>

        {/* Fixed Slide Navigation */}
        <SlideNavigation
          current={currentSlide}
          total={slides.length}
          onChange={setCurrentSlide}
        />
      </div>

      {/* Footer - Below the fold, natural page scroll */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="relative z-10 border-t-2 border-red-400/20 bg-black/90 backdrop-blur-sm"
        style={{
          backgroundImage: `url('/wow222.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'scroll'
        }}
      >
        {/* Dark overlay for footer */}
        <div className="absolute inset-0 bg-black/85" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-12 pb-28 sm:pt-16 sm:pb-20 md:pt-20 md:pb-24">
          <div className="flex flex-col items-center">
            <button 
              onClick={() => { setCurrentSlide(0); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="group relative px-6 sm:px-8 py-4"
            >
              <span className="text-sm sm:text-base font-medium text-red-600 uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-500 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-yellow-600">
                Back to First Slide
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </button>
            
            {/* Moroccan-style signature */}
            <div className="mt-8 sm:mt-10 md:mt-12 text-center px-4">
              <div className="flex items-center justify-center gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                <div className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-r from-transparent to-red-400/50" />
                <p className="text-sm font-medium text-red-600 uppercase tracking-[0.2em] sm:tracking-[0.3em] whitespace-nowrap">
                  Spectra AI © 2025
                </p>
                <div className="w-8 sm:w-12 md:w-16 h-px bg-gradient-to-l from-transparent to-red-400/50" />
              </div>
              <p className="text-sm sm:text-base font-light text-orange-600 tracking-[0.1em] sm:tracking-[0.15em]">
                Luxury Intelligence for Beauty
              </p>
              
              {/* Unique design element */}
              <div className="mt-6 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-red-400/20 to-orange-400/20 blur-xl" />
                  <div className="relative flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                    <div className="w-3 h-[1px] bg-gradient-to-r from-orange-400 to-transparent" />
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse animation-delay-200" />
                    <div className="w-3 h-[1px] bg-gradient-to-r from-transparent to-orange-400" />
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse animation-delay-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};
