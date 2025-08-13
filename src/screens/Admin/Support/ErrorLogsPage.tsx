import React from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

const ErrorLogsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Support", href: "/admin/support" },
          { label: "Error Logs", href: "/admin/support/error-logs" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Error Logs</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          System Error Monitoring
        </h2>
        <p className="text-gray-600 mb-6">
          Monitor and analyze system errors across all client installations.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg">
          🚧 Coming Soon - Error Analytics
        </div>
      </div>
    </div>
  );
};

export default ErrorLogsPage;
