import React from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

const ReweighsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Support", href: "/admin/support" },
          { label: "Reweighs", href: "/admin/support/reweighs" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reweigh Issues</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Formula Reweigh Tracking
        </h2>
        <p className="text-gray-600 mb-6">
          Track formula reweigh incidents and identify patterns for improvement.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-700 rounded-lg">
          🚧 Coming Soon - Reweigh Analytics
        </div>
      </div>
    </div>
  );
};

export default ReweighsPage;
