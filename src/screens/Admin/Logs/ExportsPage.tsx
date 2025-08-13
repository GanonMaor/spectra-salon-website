import React from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

const ExportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Logs", href: "/admin/logs" },
          { label: "Exports", href: "/admin/logs/exports" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Data Exports</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Export Management
        </h2>
        <p className="text-gray-600 mb-6">
          Generate and download data exports in various formats.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 rounded-lg">
          🚧 Coming Soon - Data Export Tools
        </div>
      </div>
    </div>
  );
};

export default ExportsPage;
