import React from "react";
import { Breadcrumbs } from "../../../components/Breadcrumbs";

const HelpVideosPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Live", href: "/admin/live" },
          { label: "Help Videos", href: "/admin/live/help-videos" },
        ]}
      />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Help Videos</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Video Support Library
        </h2>
        <p className="text-gray-600 mb-6">
          Manage help videos and tutorials for client self-service support.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
          🚧 Coming Soon - Video Library
        </div>
      </div>
    </div>
  );
};

export default HelpVideosPage;
