import React from 'react';
import { Breadcrumbs } from '../../../components/Breadcrumbs';

const ActiveClientsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Clients', href: '/admin/clients' },
        { label: 'Active', href: '/admin/clients/active' }
      ]} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Active Clients</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Active Client Management
        </h2>
        <p className="text-gray-600 mb-6">
          View and manage all active Spectra clients with installation status and usage metrics.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
          🚧 Coming Soon - Active Clients Dashboard
        </div>
      </div>
    </div>
  );
};

export default ActiveClientsPage;