import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlideNavigation } from "../../components/ui/SlideNavigation";

interface KpiData {
  title: string;
  value: string;
  description: string;
  delay: number;
}

const kpiData: KpiData[] = [
  {
    title: "Growth & Revenue",
    value: "150K ARR, 190 Users, 15 monthly",
    description: "Annual recurring revenue, active users, and monthly subscription growth.",
    delay: 0.1
  },
  {
    title: "Funding & Valuation",
    value: "1.1M Raised",
    description: "700K Mar 2023 at 2M pre-money, 400K 2024 SAFE at 4M pre-money.",
    delay: 0.2
  },
  {
    title: "Efficiency & Profitability",
    value: "Break-even, Lean Team",
    description: "Profitable with only 1500 monthly marketing spend.",
    delay: 0.3
  },
  {
    title: "SaaS Metrics",
    value: "LTV/CAC $2400 / $300 (8x ratio)",
    description: "36mo LTV, industry-leading ratio, holistic AI platform.",
    delay: 0.4
  },
  {
    title: "Social & Market Traction",
    value: "122K Views (90 days)",
    description: "81% from ads, 6K followers, 30K monthly profile views. Proven digital traction with measurable ROI on low ad spend.",
    delay: 0.5
  }
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
      className="text-center mb-12"
    >
      {/* Moroccan Hermès-style logo */}
      <div className="flex justify-center mb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          <div className="w-20 h-20 rounded-full border-2 border-red-600/30 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20" />
          </div>
        </motion.div>
      </div>
      
      {/* Parisian-inspired Header with Elegant Typography */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-center mb-16 px-4"
      >
        {/* Line 1: IN 2026 - Anticipation */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm sm:text-base font-extralight text-white/70 tracking-[0.4em] uppercase mb-3"
        >
          IN 2026
        </motion.p>
        
        {/* Elegant divider */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-12 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto mb-6"
        />
        
        {/* Group 1: SPECTRA WILL BE + THE FIRST AND ONLY (closely grouped) */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
        >
          SPECTRA WILL BE
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-xl sm:text-2xl md:text-3xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-orange-400 to-amber-400 tracking-[0.2em] uppercase mb-8"
        >
          THE FIRST AND ONLY
        </motion.p>
        
        {/* Elegant accent line */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="w-24 h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent mx-auto mb-8"
        />
        
        {/* Group 2: ALL-IN-ONE AI PLATFORM FOR SALONS (separate with breathing room) */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal text-white tracking-[0.1em] sm:tracking-[0.15em] uppercase leading-tight max-w-4xl mx-auto mb-6"
        >
          ALL-IN-ONE AI PLATFORM FOR SALONS
        </motion.h2>
        
        {/* Refined body text - directly attached to the headline above */}
        <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4 px-4 mb-20">
          <p className="text-xl sm:text-2xl font-light text-white leading-relaxed tracking-wide">
            The salon industry is at a turning point.
          </p>
          <p className="text-lg sm:text-xl font-light text-gray-300 leading-relaxed">
            With relatively small investment, Spectra AI is driving a game-changing shift.
          </p>
          <p className="text-lg sm:text-xl font-light text-gray-300 leading-relaxed">
            Backed by strong global traction and steady growth, we are set to lead the future of salon management.
          </p>
        </div>
      </motion.div>
    </motion.div>
  </motion.div>
);

// Slide 2: KPI Section with title and cards
const Slide2: React.FC = () => (
  <motion.div
    key="slide2"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.5 }}
    className="w-full"
  >
    {/* KPI Section */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="max-w-5xl mx-auto"
    >
      <div className="text-center mb-12">
        {/* Header for KPI Cards - Achievements & Status */}
        <p className="text-lg sm:text-xl md:text-2xl font-light text-orange-400 tracking-[0.1em] sm:tracking-[0.2em] uppercase mb-4 px-4">
          Spectra Achievements & Current Status
        </p>
        
        {/* Elegant divider - moved below title */}
        <div className="flex items-center justify-center mb-4 px-4">
          <div className="h-px w-16 sm:w-20 md:w-24 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
          <div className="mx-4 sm:mx-6 w-2 h-2 bg-orange-400/50 rounded-full" />
          <div className="h-px w-16 sm:w-20 md:w-24 bg-gradient-to-l from-transparent via-orange-400/50 to-transparent" />
        </div>
      </div>
    </motion.div>

    {/* KPI Cards Grid - Moroccan Hermès Layout */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4">
      {kpiData.map((kpi, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: kpi.delay,
            ease: "easeOut"
          }}
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
            p-4 sm:p-6
            overflow-hidden
            h-full min-h-[220px] sm:min-h-[260px]
            flex flex-col
          ">
            {/* Moroccan corner accents with hover effect */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-orange-400/40 transition-all duration-500 group-hover:border-orange-300/60 group-hover:w-10 group-hover:h-10" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-orange-400/40 transition-all duration-500 group-hover:border-orange-300/60 group-hover:w-10 group-hover:h-10" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-orange-400/40 transition-all duration-500 group-hover:border-orange-300/60 group-hover:w-10 group-hover:h-10" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-orange-400/40 transition-all duration-500 group-hover:border-orange-300/60 group-hover:w-10 group-hover:h-10" />
            
            {/* Gradient overlay on hover - paprika to cumin */}
            <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-all duration-500" />
            {/* Content - Moroccan Hermès style */}
            <div className="flex flex-col flex-grow relative z-10">
              <h3 className="text-xs sm:text-sm font-medium text-orange-400 uppercase tracking-[0.15em] sm:tracking-[0.25em] mb-3 sm:mb-4 transition-colors duration-500">
                {kpi.title}
              </h3>
              <p className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-2 sm:mb-3 tracking-wide drop-shadow-lg transition-all duration-500">
                {kpi.value}
              </p>
              
              <div className="h-[2px] w-16 bg-gradient-to-r from-red-400 to-orange-400 mb-4 group-hover:w-full transition-all duration-500" />
              <p className="text-xs sm:text-sm font-normal text-gray-300 leading-relaxed transition-colors duration-500 mt-auto">
                {kpi.description}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

const slides = [Slide1, Slide2];

export const InvestorPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  const CurrentSlideComponent = slides[currentSlide];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Amazing Salon Photo Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url('/wow222.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      {/* 80% dark opacity overlay for better contrast */}
      <div className="fixed inset-0 bg-black/80" />
      
      {/* Subtle glass effect overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-white/5 via-gray-100/3 to-white/5 backdrop-blur-sm" />
      
      {/* Moroccan-inspired Hermès texture */}
      <div 
        className="fixed inset-0 opacity-10"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="hermes" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Cpath d="M0 50h100M50 0v100" stroke="%23D2691E" stroke-width="0.8"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23hermes)"/%3E%3C/svg%3E')`,
          backgroundSize: '100px 100px'
        }}
      />
      
      {/* Warm paprika accent spots */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-gradient-radial from-red-400/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-gradient-radial from-orange-400/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-yellow-600/10 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Slide Content Container */}
        <div className="min-h-[70vh] flex flex-col justify-center">
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

      {/* Footer - Moroccan Hermès elegance */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="relative z-10 border-t-2 border-red-400/20 bg-white/10 backdrop-blur-sm pb-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col items-center">
            <Link 
              to="/"
              className="group relative px-6 sm:px-8 py-3"
            >
              <span className="text-xs sm:text-sm font-medium text-red-600 uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-500 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-yellow-600">
                Return to Main Site
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
            </Link>
            
            {/* Moroccan-style signature */}
            <div className="mt-8 sm:mt-12 text-center px-4">
              <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3">
                <div className="w-8 sm:w-12 h-px bg-gradient-to-r from-transparent to-red-400/50" />
                <p className="text-xs font-medium text-red-600 uppercase tracking-[0.2em] sm:tracking-[0.3em] whitespace-nowrap">
                  Spectra AI © 2025
                </p>
                <div className="w-8 sm:w-12 h-px bg-gradient-to-l from-transparent to-red-400/50" />
              </div>
              <p className="text-xs sm:text-sm font-light text-orange-600 tracking-[0.1em] sm:tracking-[0.15em]">
                Luxury Intelligence for Beauty
              </p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};
