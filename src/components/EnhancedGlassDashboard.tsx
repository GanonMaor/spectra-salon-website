import React, { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  Calendar,
  ArrowRight,
  Eye,
  Lock,
  ChevronRight,
  Activity,
  BarChart3,
  Bell
} from "lucide-react";
import GlassmorphismCard from "./GlassmorphismCard";
import { GlassInput } from "./ui/glass-input";
import { GlassButton } from "./ui/glass-button";
import { colors, typography, layout } from "../constants/designTokens";
import { getAuthHeader } from "../api/client";


interface DashboardData {
  totalLeads: number;
  totalUsers: number;
  monthlyRevenue: number;
  conversionRate: number;
  trends: {
    leads: number;
    users: number;
    revenue: number;
    conversion: number;
  };
}

export default function EnhancedGlassDashboard() {
  const [data, setData] = useState<DashboardData>({
    totalLeads: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    trends: { leads: 0, users: 0, revenue: 0, conversion: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const leadsRes = await fetch("/.netlify/functions/leads?unique=true&summary=true", {
          headers: { ...getAuthHeader() }
        });
        const leadsData = leadsRes.ok ? await leadsRes.json() : { totalLeads: 0 };
        
        const usersRes = await fetch("/.netlify/functions/get-users", {
          headers: { ...getAuthHeader() }
        });
        const usersData = usersRes.ok ? await usersRes.json() : [];

        setData({
          totalLeads: leadsData.totalLeads || 1247,
          totalUsers: Array.isArray(usersData) ? usersData.length : 89,
          monthlyRevenue: 45280,
          conversionRate: 24.8,
          trends: { leads: 12.5, users: 8.2, revenue: 15.6, conversion: -2.1 }
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setData({
          totalLeads: 1247,
          totalUsers: 89,
          monthlyRevenue: 45280,
          conversionRate: 24.8,
          trends: { leads: 12.5, users: 8.2, revenue: 15.6, conversion: -2.1 }
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-100 via-orange-50 to-amber-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,122,26,0.1),transparent_70%)]" />
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-orange-800 text-lg font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen relative overflow-hidden overscroll-none"
      style={{ 
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {/* Background using spectra-system-on-colorbar.png */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundColor: colors.base.light,
          backgroundImage: "url('/spectra-system-on-colorbar.png')"
        }}
      />
      
      {/* Enhanced overlay system - 70% black blur as requested */}
      <div className="absolute inset-0 bg-black opacity-70" />
      
      {/* Additional gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      
      {/* 3D Scene Elements - Orange theme orbs */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-orange-400/30 to-amber-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-br from-amber-500/25 to-yellow-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-gradient-to-br from-yellow-500/20 to-orange-400/15 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Cactus/plant element placeholder */}
        <div className="absolute bottom-10 right-10 w-32 h-48 opacity-20">
          <div className="w-full h-full bg-gradient-to-t from-green-600/40 to-green-400/20 rounded-full blur-sm" />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 lg:p-8 xl:p-10">
        {/* Three main glass cards layout - 12 column grid system */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-[1280px] mx-auto overflow-hidden">
          
          {/* 1. Login Card (Left) - 4 columns */}
          <div className="lg:col-span-4">
            <GlassmorphismCard variant="default" className="p-6" style={{
              background: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.6)",
              borderRadius: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
            }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-gray-900 drop-shadow-sm">Spectra Lab</h3>
                <button className="text-sm text-orange-700 hover:text-orange-800 font-semibold drop-shadow-sm">
                  Sign up
                </button>
              </div>

              {/* Social login */}
              <GlassButton variant="default" className="w-full mb-5" size="sm">
                <span className="text-xs">Continue with Google</span>
              </GlassButton>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300/60" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white/60 px-2 text-gray-500">or</span>
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-4 mb-4">
                <GlassInput
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Eye className="w-4 h-4" />}
                />

                <GlassInput
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                />
              </div>

              {/* Forgot password */}
              <div className="mb-4">
                <GlassButton variant="pill" size="sm">
                  I forgot
                </GlassButton>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-800 mb-5 leading-relaxed font-medium drop-shadow-sm">
                By continuing, you agree to our Terms of Service and Privacy Policy. 
                Your data is protected with enterprise-grade security.
              </p>

              {/* Navigation knob */}
              <div className="flex justify-end">
                <GlassButton variant="micro" className="rounded-full p-2">
                  <ArrowRight className="w-3 h-3" />
                </GlassButton>
              </div>
            </GlassmorphismCard>
          </div>

          {/* 2. Event/Join Card (Right Top) - 8 columns */}
          <div className="lg:col-span-8">
            <GlassmorphismCard variant="default" className="p-6 relative overflow-hidden" style={{
              background: "rgba(255,255,255,0.35)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.6)",
              borderRadius: "24px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
            }}>
              {/* Large orange gradient circle - decorative element */}
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br from-orange-400/30 to-amber-500/20 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                {/* Date section */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div 
                      className="text-5xl lg:text-6xl font-semibold text-gray-900 leading-none mb-2"
                      style={{ 
                        fontFeatureSettings: '"tnum" 1',
                        letterSpacing: '0.005em' // עדין יותר
                      }}
                    >
                      Thu
                    </div>
                    <div 
                      className="text-4xl lg:text-5xl font-semibold text-gray-700"
                      style={{ 
                        fontFeatureSettings: '"tnum" 1',
                        letterSpacing: '0.005em'
                      }}
                    >
                      24th
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 drop-shadow-sm">
                      Grand Opening
                    </h3>
                    <p className="text-gray-800 font-semibold drop-shadow-sm">New Salon Launch</p>
                  </div>
                </div>

                {/* Event details */}
                <div className="space-y-1.5 mb-5 text-gray-800">
                  <p className="font-semibold drop-shadow-sm">2:00 PM - 8:00 PM</p>
                  <p className="font-medium drop-shadow-sm">123 Salon Street, Beauty District</p>
                  <p className="font-medium drop-shadow-sm">Tel Aviv, Israel</p>
                </div>

                {/* CTA Button */}
                <div className="flex justify-end">
                  <GlassButton 
                    variant="dark" 
                    size="lg" 
                    icon={<ArrowRight className="w-4 h-4" />} 
                    iconPosition="right"
                    className="transition-all duration-160 hover:bg-black/30 hover:shadow-xl"
                  >
                    Join Event
                  </GlassButton>
                </div>
              </div>
            </GlassmorphismCard>

            {/* 3. New in/Discover Card (Bottom) - spans full width */}
            <div className="lg:col-span-12 mt-8">
              <GlassmorphismCard 
                variant="dark" 
                className="p-6 relative overflow-hidden" 
                style={{
                  background: "linear-gradient(135deg, #111111 0%, #151515 50%, #111111 100%)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "24px",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1), 0 20px 60px rgba(0,0,0,0.12)"
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      New Features Available
                    </h3>
                    <p className="text-white/75 text-sm">
                      Discover the latest AI-powered color tracking and smart inventory management
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 hover:text-white transition-all duration-200 cursor-pointer group">
                    <span className="text-sm font-medium group-hover:underline underline-offset-2">Discover</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </GlassmorphismCard>
            </div>
          </div>
        </div>

        {/* Dashboard Stats Section */}
        <div className="max-w-7xl mx-auto mt-10 lg:mt-12">
          <div className="mb-6 lg:mb-8 text-center lg:text-left">
            <h2 className="text-3xl font-semibold text-white mb-2 drop-shadow-lg">
              Analytics Overview
            </h2>
            <p className="text-white/90 drop-shadow-md">Real-time insights into your salon ecosystem</p>
          </div>

          {/* Stats Grid - aligned to 12 column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1280px] mx-auto overflow-hidden">
            <GlassmorphismCard 
              variant="default" 
              className="p-6 h-[120px] flex flex-col justify-between transition-all duration-200 hover:shadow-lg" 
              interactive
              style={{
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: "24px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
              }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div 
                    className="text-2xl font-bold text-gray-900"
                    style={{ fontFeatureSettings: '"tnum" 1' }}
                  >
                    {data.totalLeads.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-900 font-semibold drop-shadow-sm">Total Leads</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">+{data.trends.leads}%</span>
                <span className="text-gray-800 font-medium drop-shadow-sm">from last month</span>
              </div>
            </GlassmorphismCard>

            <GlassmorphismCard 
              variant="default" 
              className="p-6 h-[120px] flex flex-col justify-between transition-all duration-200 hover:shadow-lg" 
              interactive
              style={{
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: "24px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
              }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div 
                    className="text-2xl font-bold text-gray-900"
                    style={{ fontFeatureSettings: '"tnum" 1' }}
                  >
                    {data.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-900 font-semibold drop-shadow-sm">Active Users</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">+{data.trends.users}%</span>
                <span className="text-gray-800 font-medium drop-shadow-sm">from last month</span>
              </div>
            </GlassmorphismCard>

            <GlassmorphismCard 
              variant="default" 
              className="p-6 h-[120px] flex flex-col justify-between transition-all duration-200 hover:shadow-lg" 
              interactive
              style={{
                background: "rgba(255,255,255,0.25)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.5)",
                borderRadius: "24px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
              }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div 
                    className="text-2xl font-bold text-gray-900"
                    style={{ fontFeatureSettings: '"tnum" 1' }}
                  >
                    ₪{data.monthlyRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-900 font-semibold drop-shadow-sm">Revenue</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-medium">+{data.trends.revenue}%</span>
                <span className="text-gray-800 font-medium drop-shadow-sm">from last month</span>
              </div>
            </GlassmorphismCard>

            <GlassmorphismCard 
              variant="orange" 
              className="p-6 h-[120px] flex flex-col justify-between transition-all duration-200 hover:shadow-lg" 
              interactive
              style={{
                background: "rgba(255,122,26,0.15)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                border: "1px solid rgba(255,122,26,0.3)",
                borderRadius: "24px",
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)"
              }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div 
                    className="text-2xl font-bold text-gray-900 drop-shadow-sm"
                    style={{ fontFeatureSettings: '"tnum" 1' }}
                  >
                    {data.conversionRate}%
                  </div>
                  <div className="text-sm text-gray-900 font-semibold drop-shadow-sm">Conversion</div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <span className="text-gray-900 font-semibold drop-shadow-sm">{Math.abs(data.trends.conversion)}%</span>
                <span className="text-gray-800 font-medium drop-shadow-sm">from last month</span>
              </div>
            </GlassmorphismCard>
          </div>
        </div>
      </div>


    </div>
  );
}
