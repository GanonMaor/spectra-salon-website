import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

export const MarketingHeader: React.FC = () => {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Marketing Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Track conversion funnel from leads to paying clients across all
          campaigns.
        </p>
      </div>

      <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2">
        <PlusIcon className="h-5 w-5" />
        Add Campaign
      </button>
    </div>
  );
};
