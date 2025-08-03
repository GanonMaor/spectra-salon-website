import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { apiClient } from '../../api/client';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import AdminSidebar, { TabType } from '../../components/AdminSidebar';
import { LeadsPage } from './LeadsPage';
import { DateTime } from 'luxon';
import { Bars3Icon } from '@heroicons/react/24/outline';

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
  monthly_payment: number;
  total_paid: number;
  payment_status: string;
  timezone: string;
  created_at: string;
  order_status: string;
}

interface RetentionData {
  retention_rates: any[];
  churn_data: any[];
  churnBreakdown: any[];
  topCustomers: any[];
  lastUpdated: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useUserContext();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<any>(null);
  const [sumitCustomers, setSumitCustomers] = useState<SumitCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<SumitCustomer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  
  // NEW: Retention data state
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null);
  const [retentionLoading, setRetentionLoading] = useState(false);
  
  // Load More states
  const [customersDisplayCount, setCustomersDisplayCount] = useState(1000);
  const [topCustomersDisplayCount, setTopCustomersDisplayCount] = useState(10);

  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load retention data
  const loadRetentionData = async () => {
    try {
      setRetentionLoading(true);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch('/.netlify/functions/retention-analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setRetentionData(data);
    } catch (error) {
      console.error('Failed to load retention data:', error);
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
        let sumitCustomers = [];

        const token = localStorage.getItem('authToken');

        // Try to load Sumit data
        try {
          const sumitResponse = await fetch('/.netlify/functions/sumit-dashboard', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (sumitResponse.ok) {
            sumitData = await sumitResponse.json();
          }
        } catch (error) {
          console.log('🔍 Sumit dashboard not available, continuing...');
        }

        // Try to load Sumit customers
        try {
          const customersResponse = await fetch('/.netlify/functions/sumit-customers', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (customersResponse.ok) {
            const customersData = await customersResponse.json();
            sumitCustomers = customersData?.customers || [];
          }
        } catch (error) {
          console.log('🔍 Sumit customers not available, continuing...');
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

  // Load retention data when tab is clicked
  useEffect(() => {
    if (activeTab === 'retention' && user?.role === 'admin') {
      loadRetentionData();
    }
  }, [activeTab, user]);

  // Filtered customers computation
  const filteredCustomers = useMemo(() => {
    return sumitCustomers.filter(customer => {
      const matchesSearch = 
        customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.id?.includes(searchTerm);
      
      const matchesCountry = countryFilter === '' || customer.country === countryFilter;
      
      return matchesSearch && matchesCountry;
    });
  }, [sumitCustomers, searchTerm, countryFilter]);

  // Country options for filter
  const countries = useMemo(() => {
    const uniqueCountries = Array.from(new Set(sumitCustomers.map(c => c.country).filter(Boolean)));
    return uniqueCountries.sort();
  }, [sumitCustomers]);

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Link to="/login" className="text-blue-600 hover:text-blue-800">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900 ml-4 lg:ml-0">
                Spectra Admin Dashboard
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              Complete management interface for the Spectra ecosystem
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Customers */}
                <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Total Customers</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {sumitCustomers?.length || 0}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Active subscriptions
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl">👥</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('customers')}
                    className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    View All Customers →
                  </button>
                </div>

                {/* System Users */}
                <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">System Users</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        {stats?.totalUsers || 0}
                      </p>
                      <p className="text-sm text-purple-600 mt-1">
                        Registered users
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl">🔐</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full mt-4 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                  >
                    View All Users →
                  </button>
                </div>

                {/* Website Leads */}
                <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Website Leads</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
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
                    className="w-full mt-4 text-sm text-yellow-600 hover:text-yellow-800 font-medium transition-colors"
                  >
                    View All Leads →
                  </button>
                </div>

                {/* Revenue */}
                <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl p-6 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wider">Monthly Revenue</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-2">
                        ₪{stats?.sumitData?.total_revenue || 0}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        This month
                      </p>
                    </div>
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-2xl">💰</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="w-full mt-4 text-sm text-green-600 hover:text-green-800 font-medium transition-colors"
                  >
                    View Payments →
                  </button>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Spectra Admin Dashboard! 🎉
                </h2>
                <p className="text-gray-600 text-lg">
                  Your complete business intelligence center
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveTab('leads')}
                    className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors text-left"
                  >
                    <h3 className="font-semibold text-blue-900">📊 Analytics</h3>
                    <p className="text-sm text-blue-700 mt-1">View detailed analytics and reports</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('customers')}
                    className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors text-left"
                  >
                    <h3 className="font-semibold text-green-900">👥 Customers</h3>
                    <p className="text-sm text-green-700 mt-1">Manage your customer base</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('retention')}
                    className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors text-left"
                  >
                    <h3 className="font-semibold text-purple-900">📈 Growth</h3>
                    <p className="text-sm text-purple-700 mt-1">Track retention and growth</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Website Leads Tab - NEW ENHANCED PAGE */}
          {activeTab === 'leads' && (
            <LeadsPage />
          )}

          {/* Other tabs placeholder */}
          {(activeTab !== 'overview' && activeTab !== 'leads') && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h2>
              <p className="text-gray-600">
                This section is under development. Coming soon! 🚧
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;