import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ComposedChart, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, Zap, Calendar } from 'lucide-react';

// REAL SPECTRA DATA - Revenue Growth 2024-2025 (USD)
// Converted from NIS at 3.15 ILS/USD | EUR at 1.08 EUR/USD (March 2025)
// Note: March 2025 "distributors" = €14,400 = $15,552 one-time annual licenses for 50 distributor accounts
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

// Marketing Funnel (2025)
const FUNNEL_DATA = [
  { stage: 'Leads', count: 1476, percentage: 100 },
  { stage: 'Trials', count: 300, percentage: 20.3 },
  { stage: 'Active', count: 96, percentage: 6.5 },
];

// Revenue Split 2025 - Calculated from monthly data (USD)
// Israel: $87,246 | International (Subscriptions): $66,607 | Distributors (One-time): $15,552 (€14,400)
// Total: $169,405
const REVENUE_SPLIT = [
  { name: 'Israel', value: 87246, percentage: 51.5 },
  { name: 'International (Subs)', value: 66607, percentage: 39.3 },
  { name: 'Distributors', value: 15552, percentage: 9.2 },
];

// User Growth - Based on revenue data
// Started 2025 with ~90 users (90% Israel, 10% UK)
// Ended 2025 with 180+ monthly subscribers + 50 distributor licenses
const USER_GROWTH = [
  { month: 'Jan 24', users: 55 },
  { month: 'Mar 24', users: 60 },
  { month: 'May 24', users: 65 },
  { month: 'Jul 24', users: 70 },
  { month: 'Sep 24', users: 75 },
  { month: 'Nov 24', users: 85 },
  { month: 'Jan 25', users: 90 },
  { month: 'Mar 25', users: 100 },
  { month: 'Jun 25', users: 120 },
  { month: 'Sep 25', users: 150 },
  { month: 'Dec 25', users: 180 },
];

// FORECAST DATA - Projected Growth with $500K Investment
// Based on ACTUAL metrics (March 2025):
// - 180+ Monthly Subscriptions (Direct Paying Salons)
// - Israel ARR: ₪258K ÷ 3.15 = $81.9K
// - International ARR: $63K
// - Combined ARR: $145K (rounded)
// NOTE: 50 Annual Licenses sold to distributor are EXCLUDED from recurring base
// $500K investment deployed over 18 months = 6 quarters (Q1 2026 - Q2 2027)
// All figures in USD (FX rate: 3.15 ILS/USD)
const FORECAST_DATA = [
  // Q1 2026 - Investment begins ($83K deployed), early expansion adoption
  {
    quarter: 'Q1 2026',
    baseARR: 145,
    expansionARR: 25,
    newCustomerARR: 15,
    total: 185,
    customers: 195,
    investmentDeployed: 83,
    type: 'forecast'
  },
  // Q2 2026 - Investment continues ($83K), expansion ramping, lead conversion begins
  {
    quarter: 'Q2 2026',
    baseARR: 145,
    expansionARR: 65,
    newCustomerARR: 55,
    total: 265,
    customers: 220,
    investmentDeployed: 166
  },
  // Q3 2026 - Investment continues ($83K), momentum building across both channels
  {
    quarter: 'Q3 2026',
    baseARR: 145,
    expansionARR: 125,
    newCustomerARR: 115,
    total: 385,
    customers: 255,
    investmentDeployed: 249
  },
  // Q4 2026 - Investment continues ($83K), platform expansion at 60% adoption
  {
    quarter: 'Q4 2026',
    baseARR: 145,
    expansionARR: 200,
    newCustomerARR: 195,
    total: 540,
    customers: 300,
    investmentDeployed: 332
  },
  // Q1 2027 - Investment continues ($83K), lead pipeline converting strongly
  {
    quarter: 'Q1 2027',
    baseARR: 145,
    expansionARR: 290,
    newCustomerARR: 300,
    total: 735,
    customers: 360,
    investmentDeployed: 415
  },
  // Q2 2027 - Final investment tranche ($85K), expansion revenue materializing fully
  {
    quarter: 'Q2 2027',
    baseARR: 145,
    expansionARR: 395,
    newCustomerARR: 430,
    total: 970,
    customers: 430,
    investmentDeployed: 500,
    milestone: 'Target'
  },
];

const COLORS = ['#FF7A00', '#FFB000'];

interface Filters {
  year: string;
  timePeriod: string;
}

export const AnalyticsDashboard: React.FC = () => {
  const [filters, setFilters] = useState<Filters>({
    year: 'all',
    timePeriod: 'all',
  });

  const filteredData = useMemo(() => {
    let revenueData = [...REVENUE_DATA_2024_2025];

    if (filters.year === '2024') {
      revenueData = revenueData.filter(d => d.year === 2024);
    } else if (filters.year === '2025') {
      revenueData = revenueData.filter(d => d.year === 2025);
    }

    if (filters.timePeriod === 'last3') {
      revenueData = revenueData.slice(-3);
    } else if (filters.timePeriod === 'last6') {
      revenueData = revenueData.slice(-6);
    } else if (filters.timePeriod === 'last12') {
      revenueData = revenueData.slice(-12);
    }

    return { revenueData };
  }, [filters]);

  const resetFilters = () => {
    setFilters({ year: 'all', timePeriod: 'all' });
  };

  // Real Spectra Metrics
  const totalRevenue2024 = 315800; // ₪ - includes subscriptions + minor hardware/installation
  const totalRevenue2025 = 512900; // ₪ - includes subscriptions + minor hardware/installation
  const yoyGrowth = ((totalRevenue2025 - totalRevenue2024) / totalRevenue2024 * 100).toFixed(1);
  // Note: 225 = total paying entities (180+ monthly + 50 distributor annual licenses)
  // Forward projections use 180+ monthly subscribers only
  const totalPayingEntities = 225; // Historical total (mixed model)
  const monthlySubscribers = 180; // Core recurring base for projections
  const currentARR = 145000; // $145K = $81.9K Israel + $63K International (subscriptions only)
  const ltv = 2400;
  const cac = 300;
  const ltvCacRatio = (ltv / cac).toFixed(1);

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* PDF-Style Header with Color Bar Background */}
      <div className="relative text-white overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)),
              url('/colorbar_with_spectra.png')
            `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />

        {/* Gradient Overlay for Extra Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 z-0"></div>

        {/* Floating Orbs */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-80 h-80 bg-gradient-to-br from-orange-400/8 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-12 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-orange-400" />
              <span className="text-sm font-medium text-orange-300 tracking-wider uppercase">Quarterly Update</span>
            </div>
            <h1 className="text-5xl font-light text-white mb-4 tracking-tight drop-shadow-lg">Spectra AI</h1>
            <p className="text-xl text-gray-200 font-light mb-8">Investor Performance Report</p>
              <div className="flex items-center gap-8 text-sm flex-wrap">
                <div>
                  <span className="text-gray-300">Period:</span>
                  <span className="ml-2 text-white font-medium">2026-2027</span>
                </div>
                <div>
                  <span className="text-gray-300">Status:</span>
                  <span className="ml-2 text-green-400 font-medium">Cash-Flow Positive</span>
                </div>
                <div>
                  <span className="text-gray-300">Last Updated:</span>
                  <span className="ml-2 text-white font-medium">January 2026</span>
                </div>
              </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-12 py-16">
        {/* Section 01: Executive Summary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="flex items-baseline gap-6 mb-8">
            <span className="text-8xl font-light text-gray-200">01</span>
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-2">Executive Summary</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">ARR (Subscriptions)</p>
              <p className="text-4xl font-semibold text-gray-900">${(currentARR / 1000).toFixed(0)}K</p>
              <p className="text-xs text-gray-500 mt-2">Monthly recurring</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Total Paying Entities</p>
              <p className="text-4xl font-semibold text-gray-900">{totalPayingEntities}</p>
              <p className="text-xs text-gray-500 mt-2">Incl. distributor licenses*</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">YoY Growth</p>
              <p className="text-4xl font-semibold text-green-600">+{yoyGrowth}%</p>
              <p className="text-xs text-gray-500 mt-2">2024 → 2025</p>
            </div>
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">LTV:CAC</p>
              <p className="text-4xl font-semibold text-blue-600">{ltvCacRatio}x</p>
              <p className="text-xs text-gray-500 mt-2">Unit Economics</p>
            </div>
          </div>

          {/* Clarification Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-xs text-gray-600">
            <p>
              * 225 total paying entities = 180+ monthly subscribers (direct) + 50 annual licenses (Portugal distributor). 
              Forward projections use the <strong>180+ monthly subscriber base</strong> only.
            </p>
          </div>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Spectra continues to demonstrate strong execution across all key metrics. We achieved 
              <strong className="text-gray-900"> +62% year-over-year revenue growth</strong> while maintaining 
              cash-flow positive operations with minimal marketing spend.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our international expansion is accelerating, with <strong className="text-gray-900">+663% growth</strong> in 
              VAT-exempt revenue, driven by strategic partnerships including our Portugal distributor agreement (50 annual licenses).
            </p>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-20"></div>

        {/* Section 02: Revenue Growth */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <div className="flex items-baseline gap-6 mb-8">
            <span className="text-8xl font-light text-gray-200">02</span>
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-2">Revenue & Growth</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
            </div>
          </div>

          {/* Interactive Filters */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <p className="text-xs font-medium text-gray-600 mb-3 uppercase tracking-wider">Interactive Data Controls</p>
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="all">2024-2025</option>
                <option value="2024">2024 Only</option>
                <option value="2025">2025 Only</option>
              </select>

              <select
                value={filters.timePeriod}
                onChange={(e) => setFilters(prev => ({ ...prev, timePeriod: e.target.value }))}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
              >
                <option value="all">All Months</option>
                <option value="last3">Last 3 Months</option>
                <option value="last6">Last 6 Months</option>
                <option value="last12">Last 12 Months</option>
              </select>

              <button
                onClick={resetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-base text-gray-700 leading-relaxed">
              Revenue performance across 24 months demonstrates consistent growth trajectory with
              <strong className="text-gray-900"> $100K (2024)</strong> expanding to
              <strong className="text-gray-900"> $169K (2025)</strong>, representing a
              <strong className="text-green-600"> +69% year-over-year increase</strong>.
            </p>
            <p className="text-sm text-gray-500 italic mt-2">
              Note: All figures in USD. Converted at 3.15 ILS/USD and 1.08 EUR/USD. Includes recurring subscriptions and one-time distributor licenses.
            </p>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Monthly Revenue Breakdown</h3>
              <p className="text-sm text-gray-600">Israel (VAT-inclusive) vs International Subscriptions vs Distributor Licenses (one-time)</p>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={filteredData.revenueData}>
                <defs>
                  <linearGradient id="colorIsrael" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorInternational" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB000" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFB000" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorDistributors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B7280" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#6B7280" stopOpacity={0.5}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6B7280" style={{ fontSize: '11px' }} label={{ value: 'Revenue ($)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => {
                    const label = name === 'distributors' ? `$${value.toLocaleString()} (One-time: 50 annual licenses)` : `$${value.toLocaleString()}`;
                    return label;
                  }}
                />
                <Legend />
                <Bar dataKey="israel" stackId="a" fill="url(#colorIsrael)" name="Israel (VAT)" />
                <Bar dataKey="international" stackId="a" fill="url(#colorInternational)" name="International (Subscriptions)" />
                <Bar dataKey="distributors" stackId="a" fill="url(#colorDistributors)" name="Distributors (One-time)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-20"></div>

        {/* Section 03: Marketing Performance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-20"
        >
          <div className="flex items-baseline gap-6 mb-8">
            <span className="text-8xl font-light text-gray-200">03</span>
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-2">Marketing Performance</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-base text-gray-700 leading-relaxed">
              Our 2025 paid marketing campaign delivered <strong className="text-gray-900">96 customers</strong> from
              <strong className="text-gray-900"> 1,476 leads</strong> with an annual budget of just
              <strong className="text-orange-600"> $18,000</strong> ($1,500/month).
            </p>
            <p className="text-sm text-gray-500 italic mt-2">
              Note: 96 customers acquired via paid marketing in 2025 (subset of total customer base).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Marketing Funnel */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Conversion Funnel</h3>
                <p className="text-sm text-gray-600">Instagram-funded acquisition campaign</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={FUNNEL_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis dataKey="stage" type="category" stroke="#6B7280" style={{ fontSize: '12px' }} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">CPL</p>
                  <p className="text-lg font-bold text-blue-600">$12.20</p>
                  <p className="text-[10px] text-gray-400">Cost Per Lead</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">CPT</p>
                  <p className="text-lg font-bold text-purple-600">$60</p>
                  <p className="text-[10px] text-gray-400">Cost Per Trial</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">CPA</p>
                  <p className="text-lg font-bold text-green-600">$187.50</p>
                  <p className="text-[10px] text-gray-400">Cost Per Acquisition</p>
                </div>
              </div>
            </div>

            {/* Unit Economics */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Unit Economics</h3>
                <p className="text-sm text-gray-600">Strong fundamentals across the board</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Lifetime Value</span>
                  <span className="text-2xl font-bold text-green-600">${ltv}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Customer Acquisition Cost</span>
                  <span className="text-2xl font-bold text-red-600">${cac}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <span className="text-sm font-medium text-gray-700">LTV:CAC Ratio</span>
                  <span className="text-3xl font-bold text-blue-600">{ltvCacRatio}x</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center italic p-3 bg-gray-50 rounded-lg">
                Every $300 invested returns $2,400 in lifetime value
              </p>
            </div>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-20"></div>

        {/* Section 04: Market Position */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-20"
        >
          <div className="flex items-baseline gap-6 mb-8">
            <span className="text-8xl font-light text-gray-200">04</span>
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-2">Market Position</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Split */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Revenue Distribution 2025</h3>
                <p className="text-sm text-gray-600">$169K total annual revenue</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={REVENUE_SPLIT}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={(entry) => `${entry.name.split(' ')[0]}: ${entry.percentage}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {REVENUE_SPLIT.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#FF7A00', '#FFB000', '#6B7280'][index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">International Growth (YoY)</p>
                <p className="text-3xl font-bold text-green-600">+560%</p>
                <p className="text-xs text-gray-500 mt-1">$12K (2024) → $82K (2025)</p>
              </div>
            </div>

            {/* User Growth */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Growth Trajectory (Historical)</h3>
                <p className="text-sm text-gray-600">Total paying entities growth (includes all revenue sources)</p>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={USER_GROWTH}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '11px' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="users" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-4 flex justify-between items-center px-4">
                <div className="text-center">
                  <p className="text-xs text-gray-600">Jan 2024</p>
                  <p className="text-xl font-bold text-gray-900">55</p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Dec 2025</p>
                  <p className="text-xl font-bold text-gray-900">180</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-green-600">Growth</p>
                  <p className="text-xl font-bold text-green-600">+227%</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-20"></div>

        {/* Section 05: Team & Leadership */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-20"
        >
          <div className="flex items-baseline gap-6 mb-8">
            <span className="text-8xl font-light text-gray-200">05</span>
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-2">Team & Leadership</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Spectra AI is led by two co-founders with complementary expertise: 
              <strong className="text-gray-900"> Maor Ganon</strong> (CEO) brings deep domain knowledge as a practicing hair colorist, 
              while <strong className="text-gray-900">Elad Gotlib</strong> (COO) brings extensive experience in cosmetics marketing, 
              production, and distribution across <strong className="text-gray-900">US and Asia markets</strong>.
            </p>
            <p className="text-base text-gray-700 leading-relaxed mb-4">
              Over the past year, we significantly strengthened our engineering leadership with 
              <strong className="text-gray-900"> Atzella</strong> as Head of Development. Atzella brings extensive SaaS development 
              experience, and working alongside Danny, has <strong className="text-gray-900">accelerated product development</strong>, 
              improved <strong className="text-gray-900">code quality and stability</strong>, and positioned the platform for efficient scale.
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              This leadership combination of <strong className="text-gray-900">domain expertise</strong> (salon operations), 
              <strong className="text-gray-900"> go-to-market strength</strong> (cosmetics distribution), and 
              <strong className="text-gray-900"> technical excellence</strong> (scalable SaaS) positions us uniquely for 
              <strong className="text-gray-900"> US market expansion</strong>.
            </p>
          </div>

          {/* Team Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200 p-6">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                  MG
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Maor Ganon</h4>
                <p className="text-sm text-gray-600">Co-Founder & CEO</p>
              </div>
              <p className="text-sm text-gray-700">
                Hair colorist turned entrepreneur. Built Spectra from firsthand salon pain points.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-200 p-6">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                  EG
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Elad Gotlib</h4>
                <p className="text-sm text-gray-600">Co-Founder, Marketing & COO</p>
              </div>
              <p className="text-sm text-gray-700">
                Extensive cosmetics marketing, production & distribution experience across US and Asia markets.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-6">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                  AT
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Atzella</h4>
                <p className="text-sm text-gray-600">Head of Development</p>
              </div>
              <p className="text-sm text-gray-700">
                Extensive SaaS & scalable systems experience. Leading engineering for US market expansion.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
              <div className="mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-3">
                  DY
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Danny</h4>
                <p className="text-sm text-gray-600">Development Team</p>
              </div>
              <p className="text-sm text-gray-700">
                Core engineering & product development. Building scalable infrastructure.
              </p>
            </div>
          </div>

          {/* Impact Boxes */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 uppercase tracking-wider">Engineering Impact</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Accelerated product development velocity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Enhanced code quality and platform stability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Infrastructure positioned for efficient US market scale</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg">
              <h4 className="text-sm font-semibold text-green-900 mb-3 uppercase tracking-wider">Operations & Market Expansion</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>COO leadership driving operational excellence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Deep cosmetics industry relationships in US & Asia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span>Proven track record in production, marketing & distribution</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-20"></div>

        {/* Section 06: Key Highlights */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-20"
        >
          <div className="flex items-baseline gap-6 mb-8">
            <span className="text-8xl font-light text-gray-200">06</span>
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-2">Key Highlights</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Profitability */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Cash-Flow Status</h4>
                  <p className="text-3xl font-semibold text-green-700">Profitable</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Operating profitably with only $1.5K monthly marketing spend</p>
            </div>

            {/* Capital Efficiency */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Capital Efficient</h4>
                  <p className="text-3xl font-semibold text-blue-700">$187</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Customer acquisition cost with 8x LTV:CAC ratio</p>
            </div>

            {/* Social Traction */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Social Reach</h4>
                  <p className="text-3xl font-semibold text-purple-700">122K</p>
                </div>
              </div>
              <p className="text-sm text-gray-600">Views in 90 days • 6K followers • Strong organic growth</p>
            </div>
          </div>

          {/* Performance Summary Box */}
          <div className="bg-gray-900 text-white rounded-lg p-8">
            <h3 className="text-2xl font-light mb-6">Performance Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Funding Raised</p>
                <p className="text-3xl font-semibold">$1.1M</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Monthly Growth</p>
                <p className="text-3xl font-semibold">+15</p>
                <p className="text-xs text-gray-500 mt-1">users/month</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Intl. Growth</p>
                <p className="text-3xl font-semibold text-green-400">+663%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Social Views</p>
                <p className="text-3xl font-semibold">122K</p>
                <p className="text-xs text-gray-500 mt-1">90 days</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-20"></div>

        {/* Transition Section - From Historical Revenue to Subscription-Only Baseline */}
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-8 mb-20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Revenue Clarification & 2026 Baseline</h3>
          </div>
          <div className="prose max-w-none text-sm text-gray-700 leading-relaxed space-y-4">
            <p>
              Spectra's 2024–2025 revenue reflects a <strong>mixed revenue model</strong>, including recurring subscriptions 
              alongside limited one-time hardware and installation fees. While these non-recurring components were 
              operationally necessary to support early adoption, they represent a marginal portion of total revenue 
              and are <strong>not included in forward-looking growth projections</strong>.
            </p>
            <p>
              As of January 2026, all projections are based exclusively on the <strong>active, paying subscription base</strong>. 
              Spectra enters 2026 with <strong>180+ monthly paying customers</strong>, generating <strong>$145K in annual recurring revenue</strong>, 
              consisting of $81.9K ARR from Israel and $63K ARR from international markets.
            </p>
            <p className="text-gray-600 italic">
              This subscription-only baseline provides a clean, conservative foundation for scalable growth and capital deployment.
            </p>
          </div>
        </div>

        {/* Section 07: Growth Forecast */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mb-20"
        >
          <div className="flex items-baseline gap-6 mb-8">
            <span className="text-8xl font-light text-gray-200">07</span>
            <div>
              <h2 className="text-3xl font-light text-gray-900 mb-2">Growth Forecast: 18-Month Capital Deployment</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>
            </div>
          </div>

          {/* Current Baseline Box */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-8 rounded-r-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Subscription-Only ARR Baseline (January 2026)</h3>
            <div className="prose max-w-none mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Spectra operates a <strong>live SaaS business</strong> with paying customers and <strong>proven recurring revenue</strong>.
                This existing revenue base represents <strong>validated product-market fit</strong> and serves as the foundation for all projections.
              </p>
            </div>
            
            {/* Customer Breakdown - Two Lines */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Monthly Subscriptions (Direct)</p>
                    <p className="text-2xl font-bold text-blue-600">180+</p>
                    <p className="text-xs text-gray-500">Direct paying salons</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Annual Licenses (Distributor)</p>
                    <p className="text-2xl font-bold text-gray-500">50</p>
                    <p className="text-xs text-gray-500">One-off bulk agreement*</p>
                  </div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue in USD Only */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Israel ARR</p>
                <p className="text-2xl font-bold text-blue-600">$81.9K</p>
                <p className="text-xs text-gray-400">₪258K @ 3.15</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">International ARR</p>
                <p className="text-2xl font-bold text-blue-600">$63K</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-500">
                <p className="text-xs text-gray-600 mb-1">Combined ARR</p>
                <p className="text-2xl font-bold text-blue-600">$145K</p>
              </div>
            </div>

            {/* Distributor Disclaimer */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600">
              <p className="italic">
                * The 50 annual licenses were sold as a bulk distributor agreement and are excluded from the core recurring monthly subscription base used for growth projections.
              </p>
            </div>
          </div>

          {/* Investment Scenario Box */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-l-4 border-orange-500 p-8 rounded-r-lg mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">$500K Investment Over 18 Months: Capital Efficient Scaling</h3>
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-orange-800">
                💰 <strong>$500K deployed over 6 quarters</strong> (Q1 2026 - Q2 2027): ~$83K/quarter investment pace
                <br />🎯 <strong>AI equivalent:</strong> Like a $2M investment from 2023 - perfect timing in today's market
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Layer 1: Base ARR</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span><strong>$145K stable floor</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>180+ monthly subscribers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>Proven recurring revenue</span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Layer 2: Expansion</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>60% adoption</strong> CRM + POS + Booking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>2.2x ARPU uplift</strong> per customer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span><strong>+$395K ARR</strong></span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Layer 3: New Customers</h4>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span><strong>1,500 warm leads</strong> collected</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span><strong>20% conversion</strong> → 250 customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span><strong>+$430K ARR</strong></span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Forecast Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">ARR Growth Projection (Q1 2026 - Q2 2027)</h3>
              <p className="text-sm text-gray-600">Revenue trajectory with $500K growth capital deployed over 6 quarters</p>
            </div>
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={FORECAST_DATA}>
                <defs>
                  <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="expansionGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="newCustomerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="quarter" 
                  stroke="#6B7280" 
                  style={{ fontSize: '11px' }} 
                />
                <YAxis 
                  stroke="#6B7280" 
                  style={{ fontSize: '11px' }} 
                  label={{ value: 'ARR ($K)', angle: -90, position: 'insideLeft', style: { fontSize: '11px' } }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  formatter={(value: number) => [`$${value}K`, '']}
                />
                <Legend />
                
                {/* Layer 1: Base ARR (Existing Customers) */}
                <Area
                  type="monotone"
                  dataKey="baseARR"
                  stackId="1"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#baseGradient)"
                  name="Base ARR (180 existing customers)"
                />
                
                {/* Layer 2: Expansion Revenue */}
                <Area
                  type="monotone"
                  dataKey="expansionARR"
                  stackId="1"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#expansionGradient)"
                  name="Expansion Revenue (ARPU uplift)"
                />
                
                {/* Layer 3: New Customer ARR */}
                <Area
                  type="monotone"
                  dataKey="newCustomerARR"
                  stackId="1"
                  stroke="#FF7A00"
                  strokeWidth={2}
                  fill="url(#newCustomerGradient)"
                  name="New Customer ARR (lead conversion)"
                />
                
                {/* Total Line Overlay */}
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#1F2937"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#1F2937' }}
                  name="Total ARR"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Chart Annotation */}
            <div className="mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg">
              <p className="text-sm font-medium text-orange-900 italic">
                "$500K investment deployed systematically over 18 months, maximizing capital efficiency"
              </p>
            </div>
          </div>

          {/* Results Grid */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Start (Q1 2026)</p>
              <p className="text-4xl font-bold text-gray-900">$145K</p>
              <p className="text-xs text-gray-500 mt-2">180+ monthly subscribers</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-orange-300 shadow-lg">
              <p className="text-sm text-orange-600 mb-2 font-semibold">Target (Q2 2027)</p>
              <p className="text-4xl font-bold text-orange-600">$970K</p>
              <p className="text-xs text-gray-600 mt-2">430 customers</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Growth Multiple</p>
              <p className="text-4xl font-bold text-green-600">6.7x</p>
              <p className="text-xs text-gray-500 mt-2">in 18 months</p>
            </div>
          </div>

          {/* Bottom Line ROI Statement - Single, Clean Version */}
          <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">The Bottom Line</h3>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-6 border border-white/20">
                <p className="text-lg font-medium mb-4">
                  Based on proven CAC:LTV ratio from US market validation (sampled in 2024)
                </p>
                <p className="text-2xl font-bold text-yellow-300 mb-2">
                  $500K investment → $3M+ cumulative revenue over 3 years
                </p>
                <p className="text-sm text-green-100">
                  The investment <strong>accelerates execution</strong>, not market discovery.
                </p>
              </div>
            </div>
          </div>

          {/* Operating Under Constraints Section - NEW */}
          <div className="mt-8 bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200 rounded-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-6 h-6 text-slate-600" />
              <h3 className="text-xl font-semibold text-gray-900">Operating Under Capital & Team Constraints</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              The metrics above were achieved with significant resource constraints. Growth is currently limited by bandwidth, not by demand.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sales Team</p>
                <p className="text-sm font-semibold text-gray-700">None</p>
                <p className="text-xs text-gray-400">Founders-led</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Customer Success</p>
                <p className="text-sm font-semibold text-gray-700">None</p>
                <p className="text-xs text-gray-400">Founders-led</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Engineering</p>
                <p className="text-sm font-semibold text-gray-700">Minimal</p>
                <p className="text-xs text-gray-400">Not scaled</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Marketing</p>
                <p className="text-sm font-semibold text-gray-700">Organic</p>
                <p className="text-xs text-gray-400">Viral + referrals</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Onboarding</p>
                <p className="text-sm font-semibold text-gray-700">Manual</p>
                <p className="text-xs text-gray-400">Founders-led</p>
              </div>
            </div>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Key insight:</strong> These constraints create a clear investment opportunity. 
                The $500K deployment will remove bandwidth bottlenecks and unlock the existing demand pipeline.
              </p>
            </div>
          </div>

          {/* Investment Thesis - Clean & Focused */}
          <div className="mt-8 relative overflow-hidden rounded-2xl shadow-2xl">
            {/* Salon Background */}
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.9)),
                  url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')
                `,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            <div className="relative z-10 p-10 text-white text-center">
              {/* Title */}
              <h3 className="text-3xl lg:text-4xl font-light text-white mb-2">
                The Opportunity
              </h3>
              <p className="text-orange-300 text-lg mb-8">$500K → $970K ARR in 18 months</p>

              {/* Single Clear Message */}
              <p className="text-lg text-white/85 max-w-2xl mx-auto mb-10 leading-relaxed">
                Scaling from <strong className="text-white">$145K ARR</strong> and <strong className="text-white">180 paying customers</strong> — 
                not starting from zero. The investment unlocks execution, not market discovery.
              </p>

              {/* Three Growth Pillars */}
              <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur rounded-lg p-5 border border-white/10">
                  <p className="text-2xl font-bold text-blue-300">$145K</p>
                  <p className="text-sm text-white/70 mt-1">Current ARR</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-5 border border-white/10">
                  <p className="text-2xl font-bold text-green-300">+$400K</p>
                  <p className="text-sm text-white/70 mt-1">Expansion</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-5 border border-white/10">
                  <p className="text-2xl font-bold text-orange-300">+$425K</p>
                  <p className="text-sm text-white/70 mt-1">New Customers</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <div className="text-center py-12 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Spectra AI © 2026</p>
          <p className="text-xs text-gray-400">Confidential — For Investor Use Only</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
