import React from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

const ChurnedPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Clients", href: "/admin/clients" },
          { label: "Churned", href: "/admin/clients/churned" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Churned Clients</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Churn Analysis
        </h2>
        <p className="text-gray-600 mb-6">
          Analyze churned clients, identify patterns, and recovery
          opportunities.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-lg">
          🚧 Coming Soon - Churn Analytics
        </div>
      </div>
    </div>
  );
};

export default ChurnedPage;
