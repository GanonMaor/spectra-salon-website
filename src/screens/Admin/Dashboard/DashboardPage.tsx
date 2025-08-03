import React from 'react';
import { Breadcrumbs } from '../../../components/Breadcrumbs';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/admin/dashboard' }]} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Main Dashboard Overview
        </h2>
        <p className="text-gray-600 mb-6">
          Centralized operational dashboard for tracking client usage, sales, and system performance.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
          🚧 Coming Soon - Dashboard Analytics
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;