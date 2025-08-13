import React from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

const AIAlertsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Success", href: "/admin/success" },
          { label: "AI Alerts", href: "/admin/success/ai-alerts" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">AI Alerts</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Intelligent Client Success Alerts
        </h2>
        <p className="text-gray-600 mb-6">
          AI-powered alerts for at-risk clients and success opportunities.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg">
          🚧 Coming Soon - AI-Powered Alerts
        </div>
      </div>
    </div>
  );
};

export default AIAlertsPage;
