import React from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface ConversionInsight {
  stage: string;
  conversionRate: number;
  dropOffRate: number;
  status: 'good' | 'warning' | 'critical';
  target: number;
}

export const InsightsSection: React.FC = () => {
  const insights: ConversionInsight[] = [
    {
      stage: 'Leads → Q1',
      conversionRate: 28.4,
      dropOffRate: 71.6,
      status: 'good',
      target: 25
    },
    {
      stage: 'Q1 → Paying Clients',
      conversionRate: 61.9,
      dropOffRate: 38.1,
      status: 'good',
      target: 50
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircleIcon className="h-5 w-5" />;
      case 'warning':
      case 'critical': return <ExclamationTriangleIcon className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Conversion Insights
      </h3>
      
      {/* Key Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm font-medium">
          💡 Track conversion rates across each step to identify where clients are lost.
        </p>
      </div>
      
      {/* Conversion Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Conversion Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Drop-off
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Target
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {insights.map((insight) => (
              <tr key={insight.stage} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {insight.stage}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                  {insight.conversionRate.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  {insight.dropOffRate.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(insight.status)}`}>
                    {getStatusIcon(insight.status)}
                    <span className="ml-1 capitalize">{insight.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {insight.target}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Action Suggestions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-800 mb-2">🎯 Focus Areas</h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• Optimize lead quality from campaigns</li>
            <li>• Improve Q1 qualification process</li>
          </ul>
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-green-800 mb-2">✅ Performing Well</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Q1 → Paying conversion at 61.9%</li>
            <li>• Above target for all stages</li>
          </ul>
        </div>
      </div>
    </div>
  );
};