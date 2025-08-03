import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

export const OverviewHeader: React.FC = () => {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Business Overview
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Monitor your customers, growth metrics, and business performance.
        </p>
      </div>
      
      <button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all duration-300 flex items-center gap-2">
        <PlusIcon className="h-5 w-5" />
        Add Customer
      </button>
    </div>
  );
}; 