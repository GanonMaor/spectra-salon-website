import React from 'react';
import { Breadcrumbs } from '../../../components/Breadcrumbs';

const TrialsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Clients', href: '/admin/clients' },
        { label: 'Trials', href: '/admin/clients/trials' }
      ]} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Trial Clients</h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Trial Management
        </h2>
        <p className="text-gray-600 mb-6">
          Track trial clients, conversion rates, and onboarding progress.
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg">
          🚧 Coming Soon - Trial Tracking
        </div>
      </div>
    </div>
  );
};

export default TrialsPage;