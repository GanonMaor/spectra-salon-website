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
    <div className="h-screen bg-gradient-to-br from-black via-gray-900 to-black flex relative overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/spectra-system-on-colorbar.png')"
        }}
      />
      <div className="absolute inset-0 bg-black opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/15 via-transparent to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      
      {/* Fixed Sidebar */}
      <NewAdminSidebar
        user={user}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onLogout={handleLogout}
      />

      {/* Main Content Area - with left margin to account for fixed sidebar */}
      <div 
        className={`flex-1 flex flex-col relative z-10 transition-all duration-200 ${
          sidebarCollapsed ? 'ml-[72px]' : 'ml-[260px]'
        }`}
      >
        {/* Page Content - Single scroll area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden overscroll-none">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                Dashboard Overview
              </h2>

              {/* Leads Overview Component */}
              <LeadsOverview />

              {/* Simple Analytics Summary */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  2-Table Architecture Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-400/30">
                    <h4 className="font-semibold text-blue-200">Leads Table</h4>
                    <p className="text-sm text-blue-300 mt-1">
                      4-stage funnel: CTA → Account → Address → Payment Viewed
                    </p>
                  </div>
                  <div className="bg-green-500/20 p-4 rounded-lg border border-green-400/30">
                    <h4 className="font-semibold text-green-200">Subscribers Table</h4>
                    <p className="text-sm text-green-300 mt-1">
                      Completed subscriptions with secure payment integration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
