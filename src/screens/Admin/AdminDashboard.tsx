import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from '../../context/UserContext';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import NewAdminSidebar, { TabType } from '../../components/NewAdminSidebar';
import { LeadsPage } from './LeadsPage';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { useActionLogger } from '../../utils/actionLogger';

const AdminDashboard: React.FC = () => {
  const { user } = useUserContext();
  const { logPageLoad, logNavigation, setUserId } = useActionLogger();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Set user ID for action logging
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user, setUserId]);

  // Log page load
  useEffect(() => {
    logPageLoad('admin_dashboard');
  }, [logPageLoad]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Only load leads data (clean implementation)
        let leads = [];
        try {
          const leadsResponse = await fetch('/.netlify/functions/leads');
          if (leadsResponse.ok) {
            const leadsData = await leadsResponse.json();
            leads = leadsData.leads || [];
          }
        } catch (error) {
          console.log('Leads not available, continuing...');
        }
          
          setStats({
          leads,
          totalLeads: leads.length
          });
        } catch (error) {
          setStats({
            leads: [],
            totalLeads: 0
          });
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user]);

  // Handle tab changes with action logging
  const handleTabChange = (newTab: TabType) => {
    logNavigation(`admin_${activeTab}`, `admin_${newTab}`, 'click');
    setActiveTab(newTab);
  };

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
      {/* New Admin Sidebar */}
      <NewAdminSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
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
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-6 sm:px-8 lg:px-10">
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
            <div className="text-sm text-gray-500 hidden sm:block">
              Complete management interface for the Spectra ecosystem
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 sm:p-8 lg:p-10">
          {/* Dashboard Overview */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Customers */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Customers</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
                  <p className="text-sm text-gray-600 mt-1">Active subscriptions</p>
                  <button
                    onClick={() => handleTabChange('clients')}
                    className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    View All Customers →
                  </button>
                </div>

                {/* System Users */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">System Users</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2">1</p>
                  <p className="text-sm text-gray-600 mt-1">Registered users</p>
                  <button
                    onClick={() => handleTabChange('system')}
                    className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    View All Users →
                  </button>
                </div>

                {/* Website Leads */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Website Leads</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                        {stats?.totalLeads || 0}
                      </p>
                  <p className="text-sm text-gray-600 mt-1">New leads this month</p>
                  <button
                    onClick={() => handleTabChange('leads-marketing')}
                    className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    View All Leads →
                  </button>
              </div>

                {/* Revenue */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Monthly Revenue</h3>
                  <p className="text-2xl font-bold text-gray-900 mt-2">₪0</p>
                  <p className="text-sm text-gray-600 mt-1">This month</p>
                  <button
                    onClick={() => handleTabChange('payments')}
                    className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    View Payments →
                  </button>
                </div>
              </div>

              {/* Welcome Message */}
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Spectra Admin Dashboard
                </h2>
                <p className="text-gray-600 text-lg">
                  Your complete business intelligence center
                </p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleTabChange('leads-marketing')}
                    className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors text-left"
                  >
                    <h3 className="font-semibold text-blue-900">Analytics</h3>
                    <p className="text-sm text-blue-700 mt-1">View detailed analytics and reports</p>
                  </button>
                        <button
                    onClick={() => handleTabChange('clients')}
                    className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors text-left"
                        >
                    <h3 className="font-semibold text-green-900">Customers</h3>
                    <p className="text-sm text-green-700 mt-1">Manage your customer base</p>
                        </button>
                  <button
                    onClick={() => handleTabChange('color-insights')}
                    className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors text-left"
                  >
                    <h3 className="font-semibold text-purple-900">Insights</h3>
                    <p className="text-sm text-purple-700 mt-1">Color trends and analytics</p>
                  </button>
                </div>
            </div>
                  </div>
                )}

          {/* Leads & Marketing */}
          {activeTab === 'leads-marketing' && <LeadsPage />}

          {/* Other sections placeholder */}
          {(activeTab !== 'dashboard' && activeTab !== 'leads-marketing') && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' & ')} Section
              </h2>
              <p className="text-gray-600">
                This section is under development. Coming soon!
              </p>
                      </div>
                )}
              </div>
            </div>
    </div>
  );
};

export default AdminDashboard; 