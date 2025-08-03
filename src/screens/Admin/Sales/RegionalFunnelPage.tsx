import React from 'react';
import { Breadcrumbs } from '../../../components/Breadcrumbs';

const RegionalFunnelPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Sales', href: '/admin/sales' },
        { label: 'Regional Funnel', href: '/admin/sales/regional-funnel' }
      ]} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Regional Funnel</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Regional Performance
        </h2>
        <p className="text-gray-600 mb-6">
          Analyze sales performance across different regions and markets.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-teal-50 text-teal-700 rounded-lg">
          🚧 Coming Soon - Regional Analytics
        </div>
      </div>
    </div>
  );
};

export default RegionalFunnelPage;