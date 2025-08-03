import React from 'react';
import { Breadcrumbs } from '../../../components/Breadcrumbs';

const UTMReportingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Sales', href: '/admin/sales' },
        { label: 'UTM Reporting', href: '/admin/sales/utm-reporting' }
      ]} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">UTM Reporting</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Campaign Analytics
        </h2>
        <p className="text-gray-600 mb-6">
          Track UTM campaigns, conversion rates, and marketing performance.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg">
          🚧 Coming Soon - UTM Analytics
        </div>
      </div>
    </div>
  );
};

export default UTMReportingPage;