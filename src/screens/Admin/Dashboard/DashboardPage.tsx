import React from 'react';
import { Breadcrumbs } from '../../../components/Breadcrumbs';
import { LeadsOverview } from '../../../components/LeadsOverview';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/admin/dashboard' }]} />
      
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Complete business intelligence center</p>
      </div>

      {/* Leads Overview Component */}
      <LeadsOverview />
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/sales/leads"
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg transition-colors text-left block"
          >
            <h4 className="font-semibold text-blue-900">Manage Leads</h4>
            <p className="text-sm text-blue-700 mt-1">View and manage all website leads</p>
          </a>
          <a
            href="/admin/clients/active"
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg transition-colors text-left block"
          >
            <h4 className="font-semibold text-green-900">Customers</h4>
            <p className="text-sm text-green-700 mt-1">Manage your customer base</p>
          </a>
          <a
            href="/admin/support/messages"
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg transition-colors text-left block"
          >
            <h4 className="font-semibold text-purple-900">Support</h4>
            <p className="text-sm text-purple-700 mt-1">Handle customer support tickets</p>
          </a>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;