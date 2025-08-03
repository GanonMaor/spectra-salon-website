import React from 'react';
import { OverviewHeader } from '../../../components/Overview/OverviewHeader';
import { KPISection } from '../../../components/Overview/KPISection.js';
import { GrowthChart } from '../../../components/Overview/GrowthChart.js';
import { RetentionChart } from '../../../components/Overview/RetentionChart.js';

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OverviewHeader />
        <KPISection />
        
        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <GrowthChart />
          <RetentionChart />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;