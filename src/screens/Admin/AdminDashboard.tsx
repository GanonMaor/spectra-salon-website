import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { apiClient } from '../../api/client';
import { LoadingSpinner } from '../../components/LoadingSpinner';

interface SumitCustomer {
  id: string;
  customer_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  region: string;
  status: string;
  registration_date: string;
  package_type: string;
  total_payments: number;
  last_payment_date: string;
}

// 🆕 NEW: Retention Analytics Interface
interface RetentionMetrics {
  total_customers: number;
  active_customers: number;
  churned_customers: number;
  at_risk_customers: number;
  avg_lifetime_months: number;
  avg_lifetime_value: number;
  monthly_churn_rate: number;
  overall_retention_rate: number;
}

interface RetentionCohort {
  cohort_month: string;
  period_number: number;
  customers_count: number;
  cohort_size: number;
  retention_rate: number;
}

interface MonthlyTrend {
  activity_month: string;
  active_customers: number;
  total_revenue: number;
  avg_revenue_per_customer: number;
}

interface TopCustomer {
  customer_name: string;
  lifetime_value: number;
  total_active_months: number;
  churn_status: string;
  lifecycle_months: number;
  last_activity_month?: string; // Added for at risk modal
}

interface RetentionData {
  metrics: RetentionMetrics;
  retentionCohorts: RetentionCohort[];
  monthlyTrends: MonthlyTrend[];
  churnBreakdown: any[];
  topCustomers: TopCustomer[];
  lastUpdated: string;
}

// 🆕 UPDATED: Add retention to tab types
type TabType = 'overview' | 'customers' | 'payments' | 'leads' | 'users' | 'retention';

const AdminDashboard: React.FC = () => {
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<any>(null);
  const [sumitCustomers, setSumitCustomers] = useState<SumitCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<SumitCustomer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  
  // 🆕 NEW: Retention data state
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [retentionLoading, setRetentionLoading] = useState(false);
  
  // Load More states 🔥
  const [customersDisplayCount, setCustomersDisplayCount] = useState(1000);
  const [paymentsDisplayCount, setPaymentsDisplayCount] = useState(1000);
  const [leadsDisplayCount, setLeadsDisplayCount] = useState(1000);

  // 🆕 ADD: Top customers display state
  const [topCustomersDisplayCount, setTopCustomersDisplayCount] = useState(10);

  // 🆕 NEW: Top customers search and filter states
  const [topCustomersSearch, setTopCustomersSearch] = useState('');
  const [topCustomersStatusFilter, setTopCustomersStatusFilter] = useState('all');

  // 🆕 NEW: Leads search and filter states
  const [leadsSearchTerm, setLeadsSearchTerm] = useState('');
  const [leadsSourceFilter, setLeadsSourceFilter] = useState('all');
  const [leadsDateFilter, setLeadsDateFilter] = useState('all'); // all, last7days, last30days, last90days

  // 🆕 NEW: Payments search and filter states
  const [paymentsSearchTerm, setPaymentsSearchTerm] = useState('');
  const [paymentsStatusFilter, setPaymentsStatusFilter] = useState('all'); // all, completed, failed
  const [paymentsAmountMin, setPaymentsAmountMin] = useState('');
  const [paymentsAmountMax, setPaymentsAmountMax] = useState('');
  const [monthsDisplayCount, setMonthsDisplayCount] = useState(12); // Show last 12 months by default
  const [detailedPaymentsDisplayCount, setDetailedPaymentsDisplayCount] = useState<{[key: string]: number}>({});

  // הוסף state למעקב אחרי חודשים פתוחים
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

  // 🆕 NEW: Filter function for leads
  const getFilteredLeads = () => {
    if (!stats?.leads) return [];
    
    return stats.leads.filter((lead: any) => {
      // Search filter
      const matchesSearch = !leadsSearchTerm || 
        lead.name?.toLowerCase().includes(leadsSearchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(leadsSearchTerm.toLowerCase()) ||
        lead.phone?.includes(leadsSearchTerm);
      
      // Source filter
      const matchesSource = leadsSourceFilter === 'all' || 
        (lead.source || 'Website').toLowerCase() === leadsSourceFilter.toLowerCase();
      
      // Date filter
      let matchesDate = true;
      if (leadsDateFilter !== 'all') {
        const leadDate = new Date(lead.created_at);
        const now = new Date();
        const daysDiff = Math.floor((now.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (leadsDateFilter) {
          case 'last7days':
            matchesDate = daysDiff <= 7;
            break;
          case 'last30days':
            matchesDate = daysDiff <= 30;
            break;
          case 'last90days':
            matchesDate = daysDiff <= 90;
            break;
        }
      }
      
      return matchesSearch && matchesSource && matchesDate;
    });
  };

  // 🆕 NEW: Filter functions for payments
  const getFilteredMonths = () => {
    if (!stats?.sumitData?.payments?.monthly_summaries) return [];
    return stats.sumitData.payments.monthly_summaries.slice(0, monthsDisplayCount);
  };

  const getFilteredPaymentsForMonth = (monthKey: string) => {
    const payments = stats?.sumitData?.payments?.detailed_payments_by_month?.[monthKey] || [];
    const displayCount = detailedPaymentsDisplayCount[monthKey] || 20;
    
    return payments.filter((payment: any) => {
      // Search filter
      const matchesSearch = !paymentsSearchTerm || 
        payment.customer_name?.toLowerCase().includes(paymentsSearchTerm.toLowerCase()) ||
        payment.product_service?.toLowerCase().includes(paymentsSearchTerm.toLowerCase()) ||
        payment.payment_method?.toLowerCase().includes(paymentsSearchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = paymentsStatusFilter === 'all' || 
        payment.status === paymentsStatusFilter;
      
      // Amount filter
      let matchesAmount = true;
      if (paymentsAmountMin || paymentsAmountMax) {
        const amount = parseFloat(payment.amount) || 0;
        const minAmount = parseFloat(paymentsAmountMin) || 0;
        const maxAmount = parseFloat(paymentsAmountMax) || Infinity;
        matchesAmount = amount >= minAmount && amount <= maxAmount;
      }
      
      return matchesSearch && matchesStatus && matchesAmount;
    }).slice(0, displayCount);
  };

  const getTotalFilteredPayments = () => {
    if (!stats?.sumitData?.payments?.detailed_payments_by_month) return 0;
    
    let total = 0;
    Object.keys(stats.sumitData.payments.detailed_payments_by_month).forEach(monthKey => {
      const payments = stats.sumitData.payments.detailed_payments_by_month[monthKey] || [];
      const filteredCount = payments.filter((payment: any) => {
        const matchesSearch = !paymentsSearchTerm || 
          payment.customer_name?.toLowerCase().includes(paymentsSearchTerm.toLowerCase()) ||
          payment.product_service?.toLowerCase().includes(paymentsSearchTerm.toLowerCase()) ||
          payment.payment_method?.toLowerCase().includes(paymentsSearchTerm.toLowerCase());
        
        const matchesStatus = paymentsStatusFilter === 'all' || 
          payment.status === paymentsStatusFilter;
        
        let matchesAmount = true;
        if (paymentsAmountMin || paymentsAmountMax) {
          const amount = parseFloat(payment.amount) || 0;
          const minAmount = parseFloat(paymentsAmountMin) || 0;
          const maxAmount = parseFloat(paymentsAmountMax) || Infinity;
          matchesAmount = amount >= minAmount && amount <= maxAmount;
        }
        
        return matchesSearch && matchesStatus && matchesAmount;
      }).length;
      total += filteredCount;
    });
    return total;
  };

  // 🆕 NEW: Helper function for detailed payments load more
  const loadMorePaymentsForMonth = (monthKey: string) => {
    setDetailedPaymentsDisplayCount(prev => ({
      ...prev,
      [monthKey]: (prev[monthKey] || 20) + 20
    }));
  };

  // 🆕 NEW: Filter function for top customers
  const getFilteredTopCustomers = () => {
    if (!retentionData?.topCustomers) return [];
    
    return retentionData.topCustomers.filter(customer => {
      const matchesSearch = !topCustomersSearch || 
        customer.customer_name?.toLowerCase().includes(topCustomersSearch.toLowerCase());
      
      const matchesStatus = topCustomersStatusFilter === 'all' || 
        customer.churn_status === topCustomersStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  // פונקציה לפתיחה/סגירה של חודש
  const toggleMonth = (monthKey: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(monthKey)) {
      newExpanded.delete(monthKey);
    } else {
      newExpanded.add(monthKey);
    }
    setExpandedMonths(newExpanded);
  };

  // 🆕 NEW: At Risk Customers Modal state
  const [showAtRiskModal, setShowAtRiskModal] = useState(false);

  // 🆕 ENHANCED: Load retention data function with caching
  const loadRetentionData = async (forceRefresh = false) => {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      // Check memory cache
      if (retentionData) return;
      
      // Check localStorage cache (valid for 30 minutes)
      const cachedData = localStorage.getItem('retention-data-cache');
      const cacheTimestamp = localStorage.getItem('retention-data-cache-time');
      
      if (cachedData && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        const cacheValidDuration = 30 * 60 * 1000; // 30 minutes
        
        if (cacheAge < cacheValidDuration) {
          console.log('📊 Using cached retention data');
          try {
            const parsedData = JSON.parse(cachedData);
            setRetentionData(parsedData);
            return;
          } catch (e) {
            console.warn('⚠️ Failed to parse cached retention data');
          }
        } else {
          console.log('📊 Retention cache expired, fetching fresh data');
        }
      }
    } else {
      console.log('📊 Force refreshing retention data');
    }
    
    try {
      setRetentionLoading(true);
      const token = localStorage.getItem('token');
      console.log('📊 Fetching retention analytics...');
      
      const response = await fetch('/.netlify/functions/retention-dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const retentionData = data.data;
        
        // Update state
        setRetentionData(retentionData);
        
        // Cache in localStorage
        localStorage.setItem('retention-data-cache', JSON.stringify(retentionData));
        localStorage.setItem('retention-data-cache-time', Date.now().toString());
        
        console.log('✅ Retention data loaded and cached');
      } else {
        const errorText = await response.text();
        console.error('❌ Retention API error:', errorText);
      }
    } catch (error) {
      console.error('❌ Failed to load retention data:', error);
    } finally {
      setRetentionLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load dashboard data
        let sumitData = null;
        let sumitCustomers = null;
        const token = localStorage.getItem('token');
        console.log('🔑 Auth token:', token ? 'Found' : 'Missing');

        try {
          console.log('📡 Fetching SUMIT dashboard data...');
          const response = await fetch('/.netlify/functions/sumit-dashboard', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('📊 Dashboard response status:', response.status);
          if (response.ok) {
            sumitData = await response.json();
            console.log('✅ SUMIT dashboard data:', sumitData);
          } else {
            const errorText = await response.text();
            console.error('❌ Dashboard API error:', errorText);
          }
        } catch (err) {
          console.error('❌ SUMIT dashboard fetch error:', err);
        }

        try {
          console.log('📡 Fetching SUMIT customers...');
          const response = await fetch('/.netlify/functions/sumit-customers', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          console.log('👥 Customers response status:', response.status);
          if (response.ok) {
            const data = await response.json();
            sumitCustomers = data.customers || [];
            console.log('✅ SUMIT customers loaded:', sumitCustomers.length);
          } else {
            const errorText = await response.text();
            console.error('❌ Customers API error:', errorText);
          }
        } catch (err) {
          console.error('❌ SUMIT customers fetch error:', err);
        }

        // Load other data
        try {
          const response = await fetch('/.netlify/functions/get-users', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.ok ? res.json() : []);

          const leadsResponse = await fetch('/.netlify/functions/leads', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }).then(res => res.ok ? res.json() : { leads: [] });

          const leads = leadsResponse;
          
          setStats({
            users: response || [],
            leads: leads?.leads || [],
            sumitData: sumitData || {},
            totalUsers: response?.length || 0,
            totalLeads: leads?.leads?.length || 0
          });
        } catch (error) {
          console.error('❌ Failed to load stats:', error);
          setStats({
            users: [],
            leads: [],
            sumitData: sumitData || {},
            totalUsers: 0,
            totalLeads: 0
          });
        }

        setSumitCustomers(sumitCustomers || []);
      } catch (error) {
        console.error('❌ Dashboard load error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  // 🆕 NEW: Load retention data when tab is clicked
  useEffect(() => {
    if (activeTab === 'retention' && user?.role === 'admin') {
      loadRetentionData();
    }
  }, [activeTab, user]);

  // 🔧 ADD: Filtered customers computation
  const filteredCustomers = useMemo(() => {
    return sumitCustomers.filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || 
        customer.customer_name?.toLowerCase().includes(searchLower) ||
        customer.email?.toLowerCase().includes(searchLower) ||
        customer.phone?.includes(searchTerm) ||
        customer.city?.toLowerCase().includes(searchLower);
      
      const matchesCountry = !countryFilter || 
        (countryFilter === 'israel' && customer.country?.toLowerCase().includes('israel')) ||
        (countryFilter === 'international' && !customer.country?.toLowerCase().includes('israel'));
      
      return matchesSearch && matchesCountry;
    });
  }, [sumitCustomers, searchTerm, countryFilter]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spectra-pink via-spectra-lavender to-spectra-gold flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-white/80 mb-8">You don't have permission to view this page.</p>
          <Link to="/" className="text-spectra-gold hover:underline">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spectra-pink via-spectra-lavender to-spectra-gold flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spectra-pink via-spectra-lavender to-spectra-gold">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Spectra Admin Dashboard
          </h1>
          <p className="text-white/80">
            Complete management interface for the Spectra ecosystem
          </p>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                📊
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">SUMIT Customers</h3>
                <p className="text-2xl font-bold text-spectra-charcoal">{stats?.sumitData?.customers?.total_customers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                ✓
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Active</h3>
                <p className="text-2xl font-bold text-spectra-charcoal">{stats?.sumitData?.customers?.active_customers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                📧
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Website Leads</h3>
                <p className="text-2xl font-bold text-spectra-charcoal">{stats?.totalLeads || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                🌍
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Israel/International</h3>
                <p className="text-2xl font-bold text-spectra-charcoal">
                  {stats?.sumitData?.customers?.israel_customers || 0}/{stats?.sumitData?.customers?.international_customers || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-spectra-gold to-spectra-gold-light rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                ⭐
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Status</h3>
                <p className="text-lg font-bold text-spectra-gold">System Admin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - 🆕 UPDATED: Added Retention tab */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl mb-8 border border-spectra-gold/20">
          <div className="flex space-x-1 p-1">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'retention', label: 'Retention & Churn', icon: '📈' }, // 🆕 NEW TAB
              { id: 'customers', label: 'SUMIT Customers', icon: '👥' },
              { id: 'payments', label: 'Payments', icon: '💰' },
              { id: 'leads', label: 'Website Leads', icon: '📧' },
              { id: 'users', label: 'System Users', icon: '👤' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-spectra-gold to-spectra-gold-light text-white shadow-lg'
                    : 'text-gray-600 hover:text-spectra-charcoal hover:bg-gray-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Enhanced Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome to Spectra Admin Dashboard!</h2>
                <p className="text-white/80 text-lg">Your complete business intelligence center</p>
              </div>

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Customers */}
                <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Total Customers</h3>
                      <p className="text-3xl font-bold text-spectra-charcoal mt-2">
                        {stats?.sumitData?.customers?.total_customers || 0}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        {stats?.sumitData?.customers?.active_customers || 0} active
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl">👥</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('customers')}
                    className="w-full mt-4 text-sm text-spectra-gold hover:text-spectra-gold-dark font-medium transition-colors"
                  >
                    View All Customers →
                  </button>
                </div>

                {/* Revenue Stats */}
                <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Total Revenue</h3>
                      <p className="text-3xl font-bold text-spectra-charcoal mt-2">
                        ₪{(stats?.sumitData?.payments?.total_amount || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        ₪{(stats?.sumitData?.payments?.current_month_amount || 0).toLocaleString()} this month
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl">💰</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="w-full mt-4 text-sm text-spectra-gold hover:text-spectra-gold-dark font-medium transition-colors"
                  >
                    View Payment Details →
                  </button>
                </div>

                {/* Retention Rate */}
                <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Retention Rate</h3>
                      <p className="text-3xl font-bold text-spectra-charcoal mt-2">
                        {retentionData?.metrics?.overall_retention_rate || '--'}%
                      </p>
                      <p className="text-sm text-yellow-600 mt-1">
                        {retentionData?.metrics?.at_risk_customers || 0} at risk
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl">📈</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('retention')}
                    className="w-full mt-4 text-sm text-spectra-gold hover:text-spectra-gold-dark font-medium transition-colors"
                  >
                    View Analytics →
                  </button>
                </div>

                {/* Website Leads */}
                <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Website Leads</h3>
                      <p className="text-3xl font-bold text-spectra-charcoal mt-2">
                        {stats?.totalLeads || 0}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        New leads this month
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl">📧</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="w-full mt-4 text-sm text-spectra-gold hover:text-spectra-gold-dark font-medium transition-colors"
                  >
                    View All Leads →
                  </button>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Retention Insights */}
                <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                  <h3 className="text-xl font-bold text-spectra-charcoal mb-4">📊 Business Insights</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Active Customers</span>
                      <span className="text-lg font-bold text-green-600">
                        {retentionData?.metrics?.active_customers || '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">At Risk Customers</span>
                      <span className="text-lg font-bold text-yellow-600">
                        {retentionData?.metrics?.at_risk_customers || '--'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Avg Lifetime Value</span>
                      <span className="text-lg font-bold text-blue-600">
                        ₪{Math.round(retentionData?.metrics?.avg_lifetime_value || 0)}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('retention')}
                    className="w-full mt-4 bg-gradient-to-r from-spectra-gold to-spectra-gold-light text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all"
                  >
                    📈 View Full Analytics
                  </button>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                  <h3 className="text-xl font-bold text-spectra-charcoal mb-4">🎯 Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('customers')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="flex items-center">
                        <span className="mr-3">👥</span>
                        <span className="font-medium">Manage Customers</span>
                      </span>
                      <span className="text-spectra-gold">→</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="flex items-center">
                        <span className="mr-3">💰</span>
                        <span className="font-medium">View Payments</span>
                      </span>
                      <span className="text-spectra-gold">→</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('leads')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="flex items-center">
                        <span className="mr-3">📧</span>
                        <span className="font-medium">Check New Leads</span>
                      </span>
                      <span className="text-spectra-gold">→</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('users')}
                      className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="flex items-center">
                        <span className="mr-3">👤</span>
                        <span className="font-medium">System Users</span>
                      </span>
                      <span className="text-spectra-gold">→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                <h3 className="text-xl font-bold text-spectra-charcoal mb-4">⚡ System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 text-xl">✅</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Database</p>
                    <p className="text-xs text-green-600">Online</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 text-xl">📊</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Analytics</p>
                    <p className="text-xs text-green-600">Updated</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-green-600 text-xl">🔒</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Security</p>
                    <p className="text-xs text-green-600">Protected</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 🆕 NEW: Retention & Churn Tab */}
          {activeTab === 'retention' && (
            <div className="space-y-6">
              {/* 🆕 NEW: Retention Header with Refresh */}
              <div className="flex items-center justify-between bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                <div>
                  <h2 className="text-2xl font-bold text-spectra-charcoal">📈 Retention & Churn Analytics</h2>
                  <p className="text-gray-600 mt-1">
                    {retentionData ? 
                      `Last updated: ${new Date(retentionData.lastUpdated).toLocaleString()}` : 
                      'Real-time customer lifecycle insights'
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {/* Cache indicator */}
                  <div className="flex items-center text-sm text-gray-500">
                    {(() => {
                      const cacheTimestamp = localStorage.getItem('retention-data-cache-time');
                      if (cacheTimestamp) {
                        const cacheAge = Date.now() - parseInt(cacheTimestamp);
                        const cacheValidDuration = 30 * 60 * 1000; // 30 minutes
                        if (cacheAge < cacheValidDuration) {
                          return (
                            <>
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Cached ({Math.round((30 * 60 * 1000 - cacheAge) / 60000)}m left)
                            </>
                          );
                        }
                      }
                      return (
                        <>
                          <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                          Live data
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Refresh button */}
                  <button
                    onClick={() => loadRetentionData(true)}
                    disabled={retentionLoading}
                    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all ${
                      retentionLoading 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-spectra-gold text-white hover:bg-spectra-gold-light hover:shadow-lg'
                    }`}
                  >
                    <span className={`mr-2 ${retentionLoading ? 'animate-spin' : ''}`}>
                      {retentionLoading ? '⟳' : '🔄'}
                    </span>
                    {retentionLoading ? 'Refreshing...' : 'Refresh Data'}
                  </button>
                </div>
              </div>

              {retentionLoading ? (
                <div className="text-center py-12">
                  <LoadingSpinner />
                  <p className="text-white/80 mt-4">Loading retention analytics...</p>
                </div>
              ) : retentionData ? (
                <>
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                          📈
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Retention Rate</h3>
                          <p className="text-2xl font-bold text-green-600">{retentionData.metrics.overall_retention_rate}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                          📉
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Churn Rate</h3>
                          <p className="text-2xl font-bold text-red-600">{retentionData.metrics.monthly_churn_rate}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                          📅
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg Lifetime</h3>
                          <p className="text-2xl font-bold text-blue-600">{retentionData.metrics.avg_lifetime_months} months</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold mr-4">
                          💰
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Avg LTV</h3>
                          <p className="text-2xl font-bold text-purple-600">₪{Math.round(retentionData.metrics.avg_lifetime_value)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Status Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                      <h3 className="text-lg font-semibold text-spectra-charcoal mb-4">👥 Active Customers</h3>
                      <div className="text-3xl font-bold text-green-600 mb-2">{retentionData.metrics.active_customers}</div>
                      <p className="text-sm text-gray-600">Currently paying customers</p>
                    </div>

                    <div 
                      className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20 cursor-pointer hover:bg-white/90 transition-all hover:shadow-xl"
                      onClick={() => setShowAtRiskModal(true)}
                    >
                      <h3 className="text-lg font-semibold text-spectra-charcoal mb-4">⚠️ At Risk</h3>
                      <div className="text-3xl font-bold text-yellow-600 mb-2">{retentionData.metrics.at_risk_customers}</div>
                      <p className="text-sm text-gray-600">Haven't paid in 1+ months</p>
                      <p className="text-xs text-yellow-600 mt-2 font-medium">👆 Click to view list</p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                      <h3 className="text-lg font-semibold text-spectra-charcoal mb-4">❌ Churned</h3>
                      <div className="text-3xl font-bold text-red-600 mb-2">{retentionData.metrics.churned_customers}</div>
                      <p className="text-sm text-gray-600">Haven't paid in 2+ months</p>
                    </div>
                  </div>

                  {/* Top Customers Table */}
                  <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                    <h3 className="text-xl font-semibold text-spectra-charcoal mb-6">👑 Top Customers by Value</h3>
                    
                    {/* 🆕 NEW: Search and Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="🔍 Search customers..."
                          value={topCustomersSearch}
                          onChange={(e) => setTopCustomersSearch(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                        />
                      </div>
                      <div className="sm:w-48">
                        <select
                          value={topCustomersStatusFilter}
                          onChange={(e) => setTopCustomersStatusFilter(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                        >
                          <option value="all">All Status</option>
                          <option value="active">Active</option>
                          <option value="at_risk">At Risk</option>
                          <option value="churned">Churned</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider">Lifetime Value</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider">Active Months</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredTopCustomers().slice(0, topCustomersDisplayCount).map((customer, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-3 px-4 text-spectra-charcoal">{customer.customer_name}</td>
                              <td className="py-3 px-4 font-semibold text-green-600">₪{Math.round(customer.lifetime_value)}</td>
                              <td className="py-3 px-4 text-gray-600">{customer.total_active_months}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  customer.churn_status === 'active' 
                                    ? 'bg-green-100 text-green-800'
                                    : customer.churn_status === 'at_risk'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {customer.churn_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Results info and Load More */}
                    <div className="mt-4 flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        Showing {Math.min(topCustomersDisplayCount, getFilteredTopCustomers().length)} of {getFilteredTopCustomers().length} customers
                      </p>
                      {getFilteredTopCustomers().length > topCustomersDisplayCount && (
                        <button
                          onClick={() => setTopCustomersDisplayCount(prev => prev + 20)}
                          className="bg-spectra-gold text-white px-6 py-2 rounded-lg hover:bg-spectra-gold-light transition-all"
                        >
                          Load More ({getFilteredTopCustomers().length - topCustomersDisplayCount} remaining)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="text-center py-4">
                    <p className="text-white/60 text-sm">
                      Last updated: {new Date(retentionData.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-white mb-4">No retention data available</h3>
                  <p className="text-white/80 mb-6">
                    Retention analytics data might still be processing or unavailable.
                  </p>
                  <button
                    onClick={() => loadRetentionData(true)}
                    className="bg-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/30 transition-all"
                  >
                    🔄 Retry Loading
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SUMIT Customers Tab - OPTIMIZED */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              {/* Search and Filters - ENHANCED */}
              <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-spectra-charcoal">Search Customers</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    {filteredCustomers.length} of {sumitCustomers.length} customers
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="🔍 Name, email, phone, city..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    />
                  </div>
                  <div>
                    <select
                      value={countryFilter}
                      onChange={(e) => setCountryFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    >
                      <option value="">All Countries</option>
                      <option value="israel">Israel</option>
                      <option value="international">International</option>
                    </select>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setCountryFilter('');
                        setCustomersDisplayCount(50); // Reset display count
                      }}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      🗑️ Clear Filters
                    </button>
                  </div>
                </div>
                
                {/* Quick stats */}
                {(searchTerm || countryFilter) && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📊 Found {filteredCustomers.length} customers
                      {searchTerm && ` matching "${searchTerm}"`}
                      {countryFilter && ` in ${countryFilter}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Performance-optimized customers table */}
              <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-spectra-gold/20 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-spectra-charcoal">
                    SUMIT Customers
                  </h3>
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(customersDisplayCount, filteredCustomers.length)} of {filteredCustomers.length}
                  </div>
                </div>
                
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">😔 No customers found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search filters</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {filteredCustomers.slice(0, customersDisplayCount).map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-spectra-gold to-spectra-gold-light rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                    {customer.customer_name?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{customer.customer_name || 'No Name'}</div>
                                    <div className="text-sm text-gray-500">ID: {customer.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{customer.email || 'No Email'}</div>
                                <div className="text-sm text-gray-500">{customer.phone || 'No Phone'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{customer.country || 'Unknown'}</div>
                                <div className="text-sm text-gray-500">{[customer.city, customer.region].filter(Boolean).join(', ') || 'No Location'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  customer.status === 'פעיל' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {customer.status === 'פעיל' ? 'Active' : 'Suspended'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {customer.registration_date ? new Date(customer.registration_date).toLocaleDateString('en-US') : 'Unknown'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => setSelectedCustomer(customer)}
                                  className="text-spectra-gold hover:text-spectra-gold-dark transition-colors"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Smart Load More */}
                    {filteredCustomers.length > customersDisplayCount && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Showing {customersDisplayCount} of {filteredCustomers.length} customers
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCustomersDisplayCount(prev => Math.min(prev + 50, filteredCustomers.length))}
                            className="bg-spectra-gold text-white px-4 py-2 rounded-lg hover:bg-spectra-gold-dark transition-colors text-sm"
                          >
                            +50 More
                          </button>
                          <button
                            onClick={() => setCustomersDisplayCount(filteredCustomers.length)}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            Show All ({filteredCustomers.length - customersDisplayCount} remaining)
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Payments Tab with Monthly Summaries - OPTIMIZED */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Payment Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg p-6">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ₪{stats?.sumitData?.payments?.total_amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg p-6">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">This Month</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₪{stats?.sumitData?.payments?.current_month_amount?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg p-6">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Payments</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats?.sumitData?.payments?.total_payments?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg p-6">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Filtered Payments</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {getTotalFilteredPayments().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🆕 NEW: Search and Filters for Payments */}
              <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-spectra-charcoal">Search Payments</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    {getTotalFilteredPayments()} payments found
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="🔍 Customer, product, method..."
                      value={paymentsSearchTerm}
                      onChange={(e) => setPaymentsSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    />
                  </div>
                  <div>
                    <select
                      value={paymentsStatusFilter}
                      onChange={(e) => setPaymentsStatusFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="failed">Failed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Min Amount ₪"
                      value={paymentsAmountMin}
                      onChange={(e) => setPaymentsAmountMin(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Max Amount ₪"
                      value={paymentsAmountMax}
                      onChange={(e) => setPaymentsAmountMax(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setPaymentsSearchTerm('');
                        setPaymentsStatusFilter('all');
                        setPaymentsAmountMin('');
                        setPaymentsAmountMax('');
                        setMonthsDisplayCount(12);
                        setDetailedPaymentsDisplayCount({});
                      }}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      🗑️ Clear Filters
                    </button>
                  </div>
                </div>

                {/* Quick stats */}
                {(paymentsSearchTerm || paymentsStatusFilter !== 'all' || paymentsAmountMin || paymentsAmountMax) && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-purple-800">
                      💰 Found {getTotalFilteredPayments()} payments
                      {paymentsSearchTerm && ` matching "${paymentsSearchTerm}"`}
                      {paymentsStatusFilter !== 'all' && ` with status: ${paymentsStatusFilter}`}
                      {(paymentsAmountMin || paymentsAmountMax) && ` in amount range: ₪${paymentsAmountMin || '0'} - ₪${paymentsAmountMax || '∞'}`}
                    </p>
                  </div>
                )}
              </div>

              {/* 🆕 OPTIMIZED: Monthly Summaries with Filtering */}
              <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Monthly Payment Summaries</h3>
                    <p className="text-sm text-gray-600">Click on any month to see detailed payments</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(monthsDisplayCount, getFilteredMonths().length)} of {stats?.sumitData?.payments?.monthly_summaries?.length || 0} months
                  </div>
                </div>
                
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Month & Year
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredMonths().map((month: any) => (
                        <React.Fragment key={month.month_key}>
                          {/* Monthly Summary Row */}
                          <tr 
                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                              expandedMonths.has(month.month_key) ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => toggleMonth(month.month_key)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`transform transition-transform mr-2 ${
                                  expandedMonths.has(month.month_key) ? 'rotate-90' : ''
                                }`}>
                                  ▶️
                                </span>
                                <div className="text-sm font-medium text-gray-900">
                                  {month.month_display}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {month.payment_count} payments
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600">
                                ₪{month.month_total.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Click to {expandedMonths.has(month.month_key) ? 'collapse' : 'expand'} details
                            </td>
                          </tr>
                          
                          {/* 🆕 OPTIMIZED: Collapsible Payment Details with Filtering */}
                          {expandedMonths.has(month.month_key) && (
                            <tr>
                              <td colSpan={4} className="px-0 py-0">
                                <div className="bg-gray-50 border-l-4 border-blue-400">
                                  <div className="px-6 py-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h4 className="text-sm font-medium text-gray-900">
                                        Detailed Payments for {month.month_display}
                                      </h4>
                                      <div className="text-xs text-gray-500">
                                        Showing {getFilteredPaymentsForMonth(month.month_key).length} of {stats?.sumitData?.payments?.detailed_payments_by_month?.[month.month_key]?.length || 0} payments
                                      </div>
                                    </div>
                                    <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100 sticky top-0">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                              Customer
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                              Amount
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                              Product/Service
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                              Date
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                              Method
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                              Status
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {getFilteredPaymentsForMonth(month.month_key).map((payment: any, paymentIndex: number) => (
                                            <tr key={`${month.month_key}-${payment.id}-${paymentIndex}`} className="hover:bg-gray-50">
                                              <td className="px-4 py-2 text-sm text-gray-900">
                                                {payment.customer_name}
                                              </td>
                                              <td className="px-4 py-2 text-sm font-medium text-green-600">
                                                ₪{payment.amount.toLocaleString()}
                                              </td>
                                              <td className="px-4 py-2 text-sm text-gray-600">
                                                {payment.product_service}
                                              </td>
                                              <td className="px-4 py-2 text-sm text-gray-600">
                                                {payment.converted_date ? new Date(payment.converted_date).toLocaleDateString() : payment.payment_date}
                                              </td>
                                              <td className="px-4 py-2 text-sm text-gray-600">
                                                {payment.payment_method}
                                              </td>
                                              <td className="px-4 py-2">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                  payment.status === 'completed' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : payment.status === 'failed'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                  {payment.status}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                      
                                      {/* 🆕 NEW: Load More for detailed payments */}
                                      {(() => {
                                        const allPayments = stats?.sumitData?.payments?.detailed_payments_by_month?.[month.month_key] || [];
                                        const filteredPayments = getFilteredPaymentsForMonth(month.month_key);
                                        const hasMore = filteredPayments.length < allPayments.filter((payment: any) => {
                                          const matchesSearch = !paymentsSearchTerm || 
                                            payment.customer_name?.toLowerCase().includes(paymentsSearchTerm.toLowerCase()) ||
                                            payment.product_service?.toLowerCase().includes(paymentsSearchTerm.toLowerCase()) ||
                                            payment.payment_method?.toLowerCase().includes(paymentsSearchTerm.toLowerCase());
                                          const matchesStatus = paymentsStatusFilter === 'all' || payment.status === paymentsStatusFilter;
                                          let matchesAmount = true;
                                          if (paymentsAmountMin || paymentsAmountMax) {
                                            const amount = parseFloat(payment.amount) || 0;
                                            const minAmount = parseFloat(paymentsAmountMin) || 0;
                                            const maxAmount = parseFloat(paymentsAmountMax) || Infinity;
                                            matchesAmount = amount >= minAmount && amount <= maxAmount;
                                          }
                                          return matchesSearch && matchesStatus && matchesAmount;
                                        }).length;
                                        
                                        return hasMore && (
                                          <div className="mt-3 text-center">
                                            <button
                                              onClick={() => loadMorePaymentsForMonth(month.month_key)}
                                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                                            >
                                              Load More Payments
                                            </button>
                                          </div>
                                        );
                                      })()}
                                      
                                      {getFilteredPaymentsForMonth(month.month_key).length === 0 && (
                                        <div className="text-center py-4 text-gray-500">
                                          No payments match your filters for this month
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                  
                  {getFilteredMonths().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No monthly payment data available
                    </div>
                  )}
                </div>
                
                {/* 🆕 NEW: Load More Months */}
                {stats?.sumitData?.payments?.monthly_summaries && 
                  stats.sumitData.payments.monthly_summaries.length > monthsDisplayCount && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {monthsDisplayCount} of {stats.sumitData.payments.monthly_summaries.length} months
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setMonthsDisplayCount(prev => Math.min(prev + 6, stats.sumitData.payments.monthly_summaries.length))}
                        className="bg-spectra-gold text-white px-4 py-2 rounded-lg hover:bg-spectra-gold-dark transition-colors text-sm"
                      >
                        +6 More Months
                      </button>
                      <button
                        onClick={() => setMonthsDisplayCount(stats.sumitData.payments.monthly_summaries.length)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        Show All ({stats.sumitData.payments.monthly_summaries.length - monthsDisplayCount} remaining)
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Website Leads Tab - OPTIMIZED */}
          {activeTab === 'leads' && stats.leads && (
            <div className="space-y-6">
              {/* Search and Filters - ENHANCED */}
              <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-spectra-charcoal">Search Leads</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {getFilteredLeads().length} of {stats.leads.length} leads
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="🔍 Name, email, phone..."
                      value={leadsSearchTerm}
                      onChange={(e) => setLeadsSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    />
                  </div>
                  <div>
                    <select
                      value={leadsSourceFilter}
                      onChange={(e) => setLeadsSourceFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    >
                      <option value="all">All Sources</option>
                      <option value="website">Website</option>
                      <option value="facebook">Facebook</option>
                      <option value="google">Google</option>
                      <option value="instagram">Instagram</option>
                      <option value="referral">Referral</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={leadsDateFilter}
                      onChange={(e) => setLeadsDateFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spectra-gold focus:border-spectra-gold"
                    >
                      <option value="all">All Time</option>
                      <option value="last7days">Last 7 Days</option>
                      <option value="last30days">Last 30 Days</option>
                      <option value="last90days">Last 90 Days</option>
                    </select>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setLeadsSearchTerm('');
                        setLeadsSourceFilter('all');
                        setLeadsDateFilter('all');
                        setLeadsDisplayCount(50); // Reset display count
                      }}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      🗑️ Clear Filters
                    </button>
                  </div>
                </div>

                {/* Quick stats */}
                {(leadsSearchTerm || leadsSourceFilter !== 'all' || leadsDateFilter !== 'all') && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      📧 Found {getFilteredLeads().length} leads
                      {leadsSearchTerm && ` matching "${leadsSearchTerm}"`}
                      {leadsSourceFilter !== 'all' && ` from ${leadsSourceFilter}`}
                      {leadsDateFilter !== 'all' && ` in ${leadsDateFilter.replace('last', 'last ')}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Performance-optimized leads table */}
              <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-spectra-gold/20 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-spectra-charcoal">
                    Website Leads
                  </h3>
                  <div className="text-sm text-gray-500">
                    Showing {Math.min(leadsDisplayCount, getFilteredLeads().length)} of {getFilteredLeads().length}
                  </div>
                </div>
                
                {getFilteredLeads().length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">📧 No leads found</p>
                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search filters</p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {getFilteredLeads().slice(0, leadsDisplayCount).map((lead: any) => (
                            <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                                    {lead.name?.charAt(0) || '?'}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{lead.name || 'No Name'}</div>
                                    <div className="text-sm text-gray-500">ID: {lead.id}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{lead.email || 'No Email'}</div>
                                <div className="text-sm text-gray-500">{lead.phone || 'No Phone'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  (lead.source || 'Website').toLowerCase() === 'website' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : (lead.source || 'Website').toLowerCase() === 'facebook'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {lead.source || 'Website'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>{new Date(lead.created_at).toLocaleDateString('en-US')}</div>
                                <div className="text-xs text-gray-400">
                                  {Math.floor((Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => window.open(`mailto:${lead.email}`, '_blank')}
                                  className="text-spectra-gold hover:text-spectra-gold-dark transition-colors"
                                >
                                  Contact
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Smart Load More */}
                    {getFilteredLeads().length > leadsDisplayCount && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                          Showing {leadsDisplayCount} of {getFilteredLeads().length} leads
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setLeadsDisplayCount(prev => Math.min(prev + 50, getFilteredLeads().length))}
                            className="bg-spectra-gold text-white px-4 py-2 rounded-lg hover:bg-spectra-gold-dark transition-colors text-sm"
                          >
                            +50 More
                          </button>
                          <button
                            onClick={() => setLeadsDisplayCount(getFilteredLeads().length)}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            Show All ({getFilteredLeads().length - leadsDisplayCount} remaining)
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* System Users Tab */}
          {activeTab === 'users' && stats.users && (
            <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-spectra-gold/20">
              <h3 className="text-lg font-semibold text-spectra-charcoal mb-4">System Users ({stats.users.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.users.slice(0, 10).map((user: any) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-spectra-charcoal">
                          {user.full_name || 'Not specified'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-gradient-to-r from-spectra-gold to-spectra-gold-light text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role === 'admin' ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('en-US')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-spectra-charcoal">Customer Details</h2>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-gray-900">{selectedCustomer.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{selectedCustomer.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedCustomer.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="text-gray-900">{selectedCustomer.status || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 NEW: At Risk Customers Modal */}
      {showAtRiskModal && retentionData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-spectra-charcoal">⚠️ At Risk Customers</h2>
                <button
                  onClick={() => setShowAtRiskModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-gray-600 mt-2">
                Customers who haven't paid in 1+ months ({retentionData.metrics.at_risk_customers} total)
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider">Last Payment</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider">Lifetime Value</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500 uppercase tracking-wider">Active Months</th>
                    </tr>
                  </thead>
                  <tbody>
                    {retentionData.topCustomers
                      .filter(customer => customer.churn_status === 'at_risk')
                      .map((customer, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-3 px-4 text-spectra-charcoal font-medium">{customer.customer_name}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {customer.last_activity_month ? 
                              new Date(customer.last_activity_month).toLocaleDateString() : 
                              'N/A'
                            }
                          </td>
                          <td className="py-3 px-4 font-semibold text-green-600">₪{Math.round(customer.lifetime_value)}</td>
                          <td className="py-3 px-4 text-gray-600">{customer.total_active_months}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
                
                {retentionData.topCustomers.filter(customer => customer.churn_status === 'at_risk').length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">🎉 No customers at risk!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 