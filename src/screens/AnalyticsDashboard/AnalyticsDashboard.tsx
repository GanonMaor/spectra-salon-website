import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ComposedChart, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, Zap, Calendar } from 'lucide-react';

// REAL SPECTRA DATA - Revenue Growth 2024-2025 (NIS)
const REVENUE_DATA_2024_2025 = [
  { month: 'Jan 24', israel: 20627, international: 2820, total: 23447, year: 2024 },
  { month: 'Feb 24', israel: 18700, international: 819, total: 19519, year: 2024 },
  { month: 'Mar 24', israel: 26754, international: 361, total: 27115, year: 2024 },
  { month: 'Apr 24', israel: 25449, international: 369, total: 25818, year: 2024 },
  { month: 'May 24', israel: 28115, international: 0, total: 28115, year: 2024 },
  { month: 'Jun 24', israel: 18172, international: 258, total: 18430, year: 2024 },
  { month: 'Jul 24', israel: 17434, international: 3267, total: 20701, year: 2024 },
  { month: 'Aug 24', israel: 24716, international: 3396, total: 28112, year: 2024 },
  { month: 'Sep 24', israel: 24321, international: 3211, total: 27532, year: 2024 },
  { month: 'Oct 24', israel: 20882, international: 5239, total: 26121, year: 2024 },
  { month: 'Nov 24', israel: 28569, international: 8029, total: 36598, year: 2024 },
  { month: 'Dec 24', israel: 30857, international: 11414, total: 42271, year: 2024 },
  { month: 'Jan 25', israel: 24485, international: 7115, total: 31600, year: 2025 },
  { month: 'Feb 25', israel: 23685, international: 12208, total: 35893, year: 2025 },
  { month: 'Mar 25', israel: 21338, international: 80479, total: 101817, year: 2025, special: 'Portugal Deal' },
  { month: 'Apr 25', israel: 20901, international: 17809, total: 38710, year: 2025 },
  { month: 'May 25', israel: 22678, international: 17920, total: 40598, year: 2025 },
  { month: 'Jun 25', israel: 20880, international: 21508, total: 42388, year: 2025 },
  { month: 'Jul 25', israel: 22770, international: 20481, total: 43251, year: 2025 },
  { month: 'Aug 25', israel: 24293, international: 19470, total: 43763, year: 2025 },
  { month: 'Sep 25', israel: 23701, international: 17692, total: 41393, year: 2025 },
  { month: 'Oct 25', israel: 22353, international: 17268, total: 39621, year: 2025 },
  { month: 'Nov 25', israel: 25091, international: 20262, total: 45353, year: 2025 },
  { month: 'Dec 25', israel: 22649, international: 26597, total: 49246, year: 2025 },
];

// Marketing Funnel (2025)
const FUNNEL_DATA = [
  { stage: 'Leads', count: 1476, percentage: 100 },
  { stage: 'Trials', count: 300, percentage: 20.3 },
  { stage: 'Active', count: 96, percentage: 6.5 },
];

// Revenue Split
const REVENUE_SPLIT = [
  { name: 'Israel (VAT)', value: 232901, percentage: 45.4 },
  { name: 'International', value: 238093, percentage: 46.4 },
];

// User Growth
const USER_GROWTH = [
  { month: 'Jan 24', users: 150 },
  { month: 'Mar 24', users: 160 },
  { month: 'May 24', users: 170 },
  { month: 'Jul 24', users: 180 },
  { month: 'Sep 24', users: 190 },
  { month: 'Nov 24', users: 205 },
  { month: 'Jan 25', users: 220 },
  { month: 'Feb 25', users: 225 },
];

// FORECAST DATA - Projected Growth with $500K Investment
// Based on actual metrics: 180 customers, ~$140K ARR (₪258K Israel + $63K International = ~$133K)
// $500K investment deployed over 18 months = 6 quarters (Q1 2026 - Q2 2027)
// Investment pace: ~$83.3K per quarter
const FORECAST_DATA = [
  // Q1 2026 - Investment begins ($83K deployed), early expansion adoption
  {
    quarter: 'Q1 2026',
    baseARR: 140,
    expansionARR: 25,
    newCustomerARR: 15,
    total: 180,
    customers: 190,
    investmentDeployed: 83,
    type: 'forecast'
  },
  // Q2 2026 - Investment continues ($83K), expansion ramping, lead conversion begins
  {
    quarter: 'Q2 2026',
    baseARR: 140,
    expansionARR: 65,
    newCustomerARR: 50,
    total: 255,
    customers: 210,
    investmentDeployed: 166
  },
  // Q3 2026 - Investment continues ($83K), momentum building across both channels
  {
    quarter: 'Q3 2026',
    baseARR: 140,
    expansionARR: 120,
    newCustomerARR: 110,
    total: 370,
    customers: 240,
    investmentDeployed: 249
  },
  // Q4 2026 - Investment continues ($83K), platform expansion at 60% adoption
  {
    quarter: 'Q4 2026',
    baseARR: 140,
    expansionARR: 190,
    newCustomerARR: 185,
    total: 515,
    customers: 285,
    investmentDeployed: 332
  },
  // Q1 2027 - Investment continues ($83K), lead pipeline converting strongly
  {
    quarter: 'Q1 2027',
    baseARR: 140,
    expansionARR: 275,
    newCustomerARR: 285,
    total: 700,
    customers: 340,
    investmentDeployed: 415
  },
  // Q2 2027 - Final investment tranche ($85K), expansion revenue materializing fully
  {
    quarter: 'Q2 2027',
    baseARR: 140,
    expansionARR: 375,
    newCustomerARR: 410,
    total: 925,
    customers: 405,
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
  const totalRevenue2024 = 315800;
  const totalRevenue2025 = 512900;
  const yoyGrowth = ((totalRevenue2025 - totalRevenue2024) / totalRevenue2024 * 100).toFixed(1);
  const currentARR = 155000;
  const activeUsers = 225;
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
              <p className="text-sm text-gray-600 mb-2">ARR</p>
              <p className="text-4xl font-semibold text-gray-900">${(currentARR / 1000).toFixed(0)}K</p>
              <p className="text-xs text-gray-500 mt-2">Subscriptions</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Active Users</p>
              <p className="text-4xl font-semibold text-gray-900">{activeUsers}</p>
              <p className="text-xs text-gray-500 mt-2">Paying Salons</p>
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
              <strong className="text-gray-900"> ₪315.8K (2024)</strong> expanding to 
              <strong className="text-gray-900"> ₪512.9K (2025)</strong>, representing a 
              <strong className="text-green-600"> +62% year-over-year increase</strong>.
            </p>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-medium text-gray-900 mb-2">Monthly Revenue Breakdown</h3>
              <p className="text-sm text-gray-600">Israel (VAT-inclusive) vs International (VAT-exempt: US & EU)</p>
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
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '10px' }} angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#6B7280" style={{ fontSize: '11px' }} label={{ value: 'Revenue (₪)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                  formatter={(value: number) => `₪${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="israel" stackId="a" fill="url(#colorIsrael)" name="Israel (VAT)" />
                <Bar dataKey="international" stackId="a" fill="url(#colorInternational)" name="International" />
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
              Our 2025 marketing campaign delivered <strong className="text-gray-900">96 active customers</strong> from 
              <strong className="text-gray-900"> 1,476 leads</strong> with an annual budget of just 
              <strong className="text-orange-600"> $18,000</strong> ($1,500/month).
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
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">CPT</p>
                  <p className="text-lg font-bold text-purple-600">$60</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">CPA</p>
                  <p className="text-lg font-bold text-green-600">$187.50</p>
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
                <p className="text-sm text-gray-600">₪512.9K total annual revenue</p>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                    formatter={(value: number) => `₪${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center p-4 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">International Growth</p>
                <p className="text-3xl font-bold text-green-600">+663%</p>
                <p className="text-xs text-gray-500 mt-1">₪31K → ₪238K</p>
              </div>
            </div>

            {/* User Growth */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">User Growth Trajectory</h3>
                <p className="text-sm text-gray-600">+15 new paying salons per month (consistent)</p>
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
                  <p className="text-xs text-gray-600">Start</p>
                  <p className="text-xl font-bold text-gray-900">150</p>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">Current</p>
                  <p className="text-xl font-bold text-gray-900">225</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-green-600">Growth</p>
                  <p className="text-xl font-bold text-green-600">+50%</p>
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Revenue Baseline (Pre-Investment)</h3>
            <div className="prose max-w-none mb-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                Spectra operates a <strong>live SaaS business</strong> with paying customers and <strong>proven recurring revenue</strong>.
                This existing revenue base represents <strong>validated product-market fit</strong> and serves as the foundation for all projections.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Active Customers</p>
                <p className="text-2xl font-bold text-blue-600">180</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Israel ARR</p>
                <p className="text-2xl font-bold text-blue-600">₪258K</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-xs text-gray-600 mb-1">International ARR</p>
                <p className="text-2xl font-bold text-blue-600">$63K</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-500">
                <p className="text-xs text-gray-600 mb-1">Combined ARR</p>
                <p className="text-2xl font-bold text-blue-600">$140K</p>
              </div>
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
                    <span><strong>$140K stable floor</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>180 existing customers</span>
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
                    <span><strong>+$400K ARR</strong></span>
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
                    <span><strong>20% conversion</strong> → 270 customers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span><strong>+$520K ARR</strong></span>
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
              <p className="text-4xl font-bold text-gray-900">$140K</p>
              <p className="text-xs text-gray-500 mt-2">180 customers</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-orange-300 shadow-lg">
              <p className="text-sm text-orange-600 mb-2 font-semibold">Target (Q2 2027)</p>
              <p className="text-4xl font-bold text-orange-600">$925K</p>
              <p className="text-xs text-gray-600 mt-2">405 customers</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Growth Multiple</p>
              <p className="text-4xl font-bold text-green-600">6.6x</p>
              <p className="text-xs text-gray-500 mt-2">in 18 months</p>
            </div>
          </div>

          {/* Bottom Line ROI Statement */}
          <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl p-8 shadow-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold">The Bottom Line</h3>
              </div>

              <div className="mb-6">
                <p className="text-5xl font-black mb-2">$500K</p>
                <p className="text-lg text-green-100">Investment Today</p>
              </div>

              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-300">$3M+</p>
                  <p className="text-sm text-green-100">Revenue in 3 Years</p>
                </div>
                <div className="w-px h-16 bg-white/30"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-300">6x</p>
                  <p className="text-sm text-green-100">Return Multiple</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                <p className="text-lg font-medium mb-2">
                  Based on proven CAC:LTV ratio from US market validation
                </p>
                <p className="text-sm text-green-100">
                  💰 <strong>$500K investment today</strong> generates <strong>$3M+ revenue over 3 years</strong>
                  <br />📊 <strong>6x return multiple</strong> on capital deployed
                </p>
              </div>
            </div>
          </div>

          {/* Investment Thesis - Classic Salon Background Design */}
          <div className="mt-8 relative overflow-hidden rounded-2xl shadow-2xl">
            {/* Salon Background Image with Dark Filter */}
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)),
                  url('https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2940&auto=format&fit=crop')
                `,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
              }}
            />

            {/* Floating Glass Orbs */}
            <div className="absolute inset-0 overflow-hidden z-0">
              <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-32 right-16 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-amber-400/8 to-orange-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="relative z-10 p-12 text-white">
              {/* Header Badge */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-3xl rounded-full px-8 py-4 border border-white/20 shadow-2xl">
                  <div className="w-2 h-2 bg-gradient-to-r from-white to-gray-300 rounded-full animate-pulse"></div>
                  <span className="text-white/90 text-sm font-semibold uppercase tracking-[0.3em]">
                    Investment Thesis
                  </span>
                  <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-amber-300 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Main Title */}
              <div className="text-center mb-12">
                <h3 className="text-4xl lg:text-5xl font-light text-white mb-6 leading-[0.9] tracking-[-0.02em]">
                  Perfect Timing in
                </h3>
                <h3 className="text-4xl lg:text-5xl font-light text-transparent bg-clip-text bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300 leading-[0.9] tracking-[-0.02em] drop-shadow-2xl">
                  AI Market
                </h3>
              </div>

              {/* Content */}
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <p className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light">
                  This is <strong className="text-white font-medium">not a projection starting from zero</strong>. Spectra is scaling on top of
                  <strong className="text-blue-300 font-medium"> $140K in real revenue</strong>, <strong className="text-white font-medium">180 real customers</strong>, and
                  <strong className="text-white font-medium"> proven willingness to pay</strong>.
                </p>

                <p className="text-xl lg:text-2xl text-white/90 leading-relaxed font-light">
                  A strategic <strong className="text-orange-300 font-medium">$500K investment deployed over 6 quarters</strong> (Q1 2026 - Q2 2027) unlocks both
                  <strong className="text-white font-medium"> demand already waiting in the pipeline</strong> (1,500 warm leads) and
                  <strong className="text-white font-medium"> expansion revenue from existing customers</strong> (60% platform adoption),
                  transforming Spectra from sub-scale SaaS into a <strong className="text-green-300 font-medium">growth-stage platform</strong> with
                  strong ARR momentum by Q2 2027.
                </p>

                {/* Highlight Box */}
                <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 backdrop-blur-3xl border border-orange-400/30 rounded-2xl p-8 shadow-2xl">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full animate-pulse"></div>
                    <span className="text-orange-300 text-sm font-semibold uppercase tracking-[0.2em]">Key Insight</span>
                    <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full animate-pulse"></div>
                  </div>
                  <p className="text-lg font-medium text-orange-200">
                    🚀 <strong>$500K today = $2M investment from 2023</strong> - perfect timing in today's AI market
                    <br />💡 The investment <strong>accelerates execution</strong>, not market discovery.
                  </p>
                </div>

                {/* Three Layers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
                    </div>
                    <p className="text-lg text-blue-300 font-semibold mb-3">Base Layer</p>
                    <ul className="text-sm text-white/80 space-y-2 text-left">
                      <li>• <strong className="text-white">$140K ARR floor</strong></li>
                      <li>• 180 proven customers</li>
                      <li>• Recurring revenue</li>
                    </ul>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-6 h-6 bg-green-400 rounded-full"></div>
                    </div>
                    <p className="text-lg text-green-300 font-semibold mb-3">Expansion</p>
                    <ul className="text-sm text-white/80 space-y-2 text-left">
                      <li>• <strong className="text-white">+$400K ARR</strong></li>
                      <li>• ARPU uplift: 2.2x</li>
                      <li>• Low CAC (existing base)</li>
                    </ul>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="w-6 h-6 bg-orange-400 rounded-full"></div>
                    </div>
                    <p className="text-lg text-orange-300 font-semibold mb-3">New Customers</p>
                    <ul className="text-sm text-white/80 space-y-2 text-left">
                      <li>• <strong className="text-white">+$520K ARR</strong></li>
                      <li>• 270 from warm leads</li>
                      <li>• 20% conversion rate</li>
                    </ul>
                  </div>
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
