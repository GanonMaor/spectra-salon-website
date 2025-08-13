import React from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

const APIKeysPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "System", href: "/admin/system" },
          { label: "API Keys", href: "/admin/system/api-keys" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          API Key Management
        </h2>
        <p className="text-gray-600 mb-6">
          Manage API keys for system integrations and external services.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-gray-50 text-gray-700 rounded-lg">
          🚧 Coming Soon - API Key Management
        </div>
      </div>
    </div>
  );
};

export default APIKeysPage;
