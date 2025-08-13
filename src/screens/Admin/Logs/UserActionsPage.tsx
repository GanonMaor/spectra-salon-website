import React, { useState } from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { useActionLogger } from "../../../utils/actionLogger";

const UserActionsPage: React.FC = () => {
  const { logDataView } = useActionLogger();
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("7d");

  React.useEffect(() => {
    logDataView("user_actions", {
      filter_type: filterType,
      date_range: dateRange,
    });
  }, [logDataView, filterType, dateRange]);

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Logs", href: "/admin/logs" },
          { label: "User Actions", href: "/admin/logs/user-actions" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Actions Log</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Action Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm"
            >
              <option value="all">All Actions</option>
              <option value="navigation">Navigation</option>
              <option value="button_click">Button Clicks</option>
              <option value="form_submit">Form Submissions</option>
              <option value="data_view">Data Views</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Log Viewer */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Action Log Viewer
        </h2>
        <p className="text-gray-600 mb-6">
          View and analyze all user actions with filtering and export
          capabilities.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg">
          🚧 Coming Soon - Log Viewer with Real Data
        </div>
      </div>
    </div>
  );
};

export default UserActionsPage;
