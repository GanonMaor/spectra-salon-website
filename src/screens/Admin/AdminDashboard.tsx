import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import NewAdminSidebar, { TabType } from "../../components/NewAdminSidebar";
import { LeadsPage } from "./LeadsPage";
import { LeadsOverview } from "../../components/LeadsOverview";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useActionLogger } from "../../utils/actionLogger";

const AdminDashboard: React.FC = () => {
  const { user } = useUserContext();
  const { logPageLoad, logNavigation, setUserId } = useActionLogger();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [loading, setLoading] = useState(false);

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
    logPageLoad("admin_dashboard");
  }, [logPageLoad]);

  // Handle tab changes with action logging
  const handleTabChange = (newTab: TabType) => {
    logNavigation(`admin_${activeTab}`, `admin_${newTab}`, "click");
    setActiveTab(newTab);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You need admin privileges to access this page.
          </p>
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
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Dashboard Overview
              </h2>

              {/* Leads Overview Component */}
              <LeadsOverview />

              {/* Quick Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleTabChange("leads-marketing")}
                    className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors text-left"
                  >
                    <h4 className="font-semibold text-blue-900">
                      Manage Leads
                    </h4>
                    <p className="text-sm text-blue-700 mt-1">
                      View and manage all website leads
                    </p>
                  </button>
                  <button
                    onClick={() => handleTabChange("clients")}
                    className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors text-left"
                  >
                    <h4 className="font-semibold text-green-900">Customers</h4>
                    <p className="text-sm text-green-700 mt-1">
                      Manage your customer base
                    </p>
                  </button>
                  <button
                    onClick={() => handleTabChange("support")}
                    className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors text-left"
                  >
                    <h4 className="font-semibold text-purple-900">Support</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Handle customer support tickets
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Leads & Marketing */}
          {activeTab === "leads-marketing" && <LeadsPage />}

          {/* Other sections placeholder */}
          {activeTab !== "dashboard" && activeTab !== "leads-marketing" && (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {activeTab.charAt(0).toUpperCase() +
                  activeTab.slice(1).replace("-", " & ")}{" "}
                Section
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
