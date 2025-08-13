import React from "react";
import { useLocation } from "react-router-dom";
import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { useChatNotifications } from "../hooks/useChatNotifications";

interface AdminTopbarProps {
  user?: {
    full_name?: string;
    email?: string;
    role?: string;
  };
  onMobileMenuToggle?: () => void;
  onLogout?: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  user,
  onMobileMenuToggle,
  onLogout,
}) => {
  const location = useLocation();
  const { unreadCount } = useChatNotifications();

  const getPageTitle = () => {
    const path = location.pathname;

    // Map paths to titles
    const titleMap: Record<string, string> = {
      "/admin/dashboard": "Dashboard Overview",
      "/admin/clients/active": "Active Clients",
      "/admin/clients/trials": "Trial Clients",
      "/admin/clients/churned": "Churned Clients",
      "/admin/sales/leads": "Sales Leads",
      "/admin/sales/utm-reporting": "UTM Reporting",
      "/admin/sales/regional-funnel": "Regional Funnel",
      "/admin/success/onboarding-status": "Onboarding Status",
      "/admin/success/video-call-requests": "Video Call Requests",
      "/admin/success/ai-alerts": "AI Alerts",
      "/admin/support/error-logs": "Error Logs",
      "/admin/support/reweighs": "Reweigh Issues",
      "/admin/support/formula-fails": "Formula Failures",
      "/admin/support/hardware-status": "Hardware Status",
      "/admin/live/zoom-links": "Zoom Links",
      "/admin/live/help-videos": "Help Videos",
      "/admin/live/diagnostics": "Live Diagnostics",
      "/admin/logs/user-actions": "User Actions Log",
      "/admin/logs/usage-heatmap": "Usage Heatmap",
      "/admin/logs/exports": "Data Exports",
      "/admin/system/users": "System Users",
      "/admin/system/api-keys": "API Keys",
      "/admin/system/permissions": "Permissions",
    };

    return titleMap[path] || "Spectra Admin";
  };

  const getPageDescription = () => {
    const path = location.pathname;

    if (path.includes("/clients")) return "Client management and analytics";
    if (path.includes("/sales")) return "Sales pipeline and performance";
    if (path.includes("/success")) return "Client success and onboarding";
    if (path.includes("/support")) return "Technical support and monitoring";
    if (path.includes("/live")) return "Live support and diagnostics";
    if (path.includes("/logs")) return "System logs and analytics";
    if (path.includes("/system")) return "System administration";

    return "Centralized operational dashboard";
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu toggle and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-gray-500 hidden sm:block">
              {getPageDescription()}
            </p>
          </div>
        </div>

        {/* Right side - Notifications and user menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative">
            <BellIcon className="h-6 w-6" />
            {/* Chat notification badge */}
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* User info */}
          <div className="hidden sm:flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user?.full_name || "User"}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role || "admin"}
              </p>
            </div>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {user?.full_name?.charAt(0) || "U"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
