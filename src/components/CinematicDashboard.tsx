import React, { useState, useEffect } from "react";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap
} from "lucide-react";
import MetricCardCinematic from "./MetricCardCinematic";
import GlassmorphismCard from "./GlassmorphismCard";
import TopCtaVsSignupChart from "./analytics/TopCtaVsSignupChart";
import LeadsPerDayChart from "./analytics/LeadsPerDayChart";
import SpotifyStyleTable from "./SpotifyStyleTable";
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

export default function CinematicDashboard() {
  const [data, setData] = useState<DashboardData>({
    totalLeads: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    trends: { leads: 0, users: 0, revenue: 0, conversion: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load leads data
        const leadsRes = await fetch("/.netlify/functions/leads?unique=true&summary=true", {
          headers: { ...getAuthHeader() }
        });
        const leadsData = leadsRes.ok ? await leadsRes.json() : { totalLeads: 0 };
        
        // Load users data  
        const usersRes = await fetch("/.netlify/functions/get-users", {
          headers: { ...getAuthHeader() }
        });
        const usersData = usersRes.ok ? await usersRes.json() : [];

        setData({
          totalLeads: leadsData.totalLeads || 0,
          totalUsers: Array.isArray(usersData) ? usersData.length : 0,
          monthlyRevenue: 45280, // Mock data - replace with real
          conversionRate: 24.8,
          trends: {
            leads: 12.5,
            users: 8.2,
            revenue: 15.6,
            conversion: -2.1
          }
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,107,107,0.2),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.2),transparent_50%)]" />
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-orange-100 text-lg">Loading cinematic dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Cinematic background - Black with 30% orange like the image */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Salon image overlay - using our high-quality salon image */}
        <div 
          className="absolute inset-0 opacity-25 bg-cover bg-center"
          style={{
            backgroundImage: "url('/hair_colorist_in_a_color_bar.png')"
          }}
        />
        {/* Enhanced dark blur overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-gray-900/35 to-black/50" />
        {/* Orange accent overlay - 25% (reduced for better readability) */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/25 via-amber-500/15 to-orange-700/20" />
        {/* Animated orbs - Orange theme */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-amber-500/25 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-yellow-500/20 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 sm:p-8 lg:p-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-2 tracking-tight">
            Spectra Analytics
          </h1>
          <p className="text-white/60 text-lg">
            Real-time insights into your salon ecosystem
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <MetricCardCinematic
            title="Total Leads"
            value={data.totalLeads.toLocaleString()}
            subtitle="Unique customers"
            icon={Users}
            color="blue"
            trend={{
              value: data.trends.leads,
              label: "from last month",
              isPositive: data.trends.leads > 0
            }}
          />
          
          <MetricCardCinematic
            title="Active Users"
            value={data.totalUsers.toLocaleString()}
            subtitle="System users"
            icon={Activity}
            color="green"
            trend={{
              value: data.trends.users,
              label: "from last month",
              isPositive: data.trends.users > 0
            }}
          />
          
          <MetricCardCinematic
            title="Revenue"
            value={`₪${data.monthlyRevenue.toLocaleString()}`}
            subtitle="This month"
            icon={DollarSign}
            color="purple"
            trend={{
              value: data.trends.revenue,
              label: "from last month",
              isPositive: data.trends.revenue > 0
            }}
          />
          
          <MetricCardCinematic
            title="Conversion"
            value={`${data.conversionRate}%`}
            subtitle="Lead to customer"
            icon={Target}
            color="orange"
            trend={{
              value: Math.abs(data.trends.conversion),
              label: "from last month",
              isPositive: data.trends.conversion > 0
            }}
          />
        </div>

        {/* Charts Grid - Spotify-style layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Leads Trend Chart */}
          <div className="relative">
            <GlassmorphismCard className="p-8 h-96" glow>
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl p-3 bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xl">Leads Trend</h3>
                  <p className="text-white/60 text-sm">Last 30 days performance</p>
                </div>
              </div>
              <div className="h-72">
                <LeadsPerDayChart />
              </div>
            </GlassmorphismCard>
          </div>

          {/* CTA Performance Chart */}
          <div className="relative">
            <GlassmorphismCard className="p-8 h-96" glow>
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl p-3 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-xl">CTA Performance</h3>
                  <p className="text-white/60 text-sm">Top conversion paths</p>
                </div>
              </div>
              <div className="h-72">
                <TopCtaVsSignupChart limit={5} />
              </div>
            </GlassmorphismCard>
          </div>
        </div>

        {/* Spotify-style Leads Table */}
        <div className="mb-8">
          <SpotifyStyleTable />
        </div>

        {/* Quick Actions - Bottom Player Style */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <GlassmorphismCard className="mx-6 mb-6 p-4" glow>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium">System Status</h3>
                  <p className="text-white/60 text-sm">All systems operational</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => window.location.href = '/admin/sales/leads'}
                  className="px-4 py-2 rounded-full bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 transition-colors text-sm font-medium"
                >
                  Manage Leads
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/clients/active'}
                  className="px-4 py-2 rounded-full bg-green-500/20 text-green-200 hover:bg-green-500/30 transition-colors text-sm font-medium"
                >
                  Active Clients
                </button>
                <button 
                  onClick={() => window.location.href = '/admin/marketing'}
                  className="px-4 py-2 rounded-full bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 transition-colors text-sm font-medium"
                >
                  Marketing
                </button>
              </div>
            </div>
          </GlassmorphismCard>
        </div>
      </div>
      
      {/* Floating particles effect */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
