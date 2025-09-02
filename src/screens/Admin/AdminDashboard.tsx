import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUserContext } from "../../context/UserContext";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import NewAdminSidebar from "../../components/NewAdminSidebar";
import { LeadsOverview } from "../../components/LeadsOverview";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useActionLogger } from "../../utils/actionLogger";

const AdminDashboard: React.FC = () => {
  const { user } = useUserContext();
  const { logPageLoad, setUserId } = useActionLogger();
  const [loading, setLoading] = useState(false);

  // Sidebar states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Set user ID for action logging
  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user, setUserId]);

  // Log page load
  useEffect(() => {
    logPageLoad("admin_dashboard_overview");
  }, [logPageLoad]);

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
      {/* Simplified Admin Sidebar - Overview Only */}
      <NewAdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                Spectra Admin Dashboard
              </h1>
            </div>
            <div className="text-sm text-gray-500 hidden sm:block">
              Simplified Overview - 2-Table Architecture
            </div>
          </div>
        </div>

        {/* Content Area - Overview Only */}
        <div className="flex-1 overflow-auto p-6 sm:p-8 lg:p-10">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Dashboard Overview
            </h2>

            {/* Leads Overview Component */}
            <LeadsOverview />

            {/* Simple Analytics Summary */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                2-Table Architecture Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Leads Table</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    4-stage funnel: CTA → Account → Address → Payment Viewed
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900">Subscribers Table</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Completed subscriptions with SUMIT integration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
