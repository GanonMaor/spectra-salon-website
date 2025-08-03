import React from 'react';
import { Breadcrumbs } from '../../../components/Breadcrumbs';

const SalesLeadsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Sales', href: '/admin/sales' },
        { label: 'Leads', href: '/admin/sales/leads' }
      ]} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sales Leads</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Lead Management
        </h2>
        <p className="text-gray-600 mb-6">
          Track leads, conversion funnels, and sales pipeline performance.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg">
          🚧 Coming Soon - Sales Pipeline
        </div>
      </div>
    </div>
  );
};

export default SalesLeadsPage;