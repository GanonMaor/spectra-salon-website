import React from 'react';
import { LeadsOverview } from '../../../components/LeadsOverview';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
            <p className="mt-2 text-sm text-gray-600">
              Monitor your leads, analytics, and business performance.
            </p>
          </div>
          
          <LeadsOverview />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;