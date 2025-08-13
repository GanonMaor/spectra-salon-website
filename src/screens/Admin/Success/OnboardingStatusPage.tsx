import React from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

const OnboardingStatusPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Success", href: "/admin/success" },
          {
            label: "Onboarding Status",
            href: "/admin/success/onboarding-status",
          },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Onboarding Status</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Client Onboarding Progress
        </h2>
        <p className="text-gray-600 mb-6">
          Track client onboarding completion rates and identify bottlenecks.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
          🚧 Coming Soon - Onboarding Analytics
        </div>
      </div>
    </div>
  );
};

export default OnboardingStatusPage;
