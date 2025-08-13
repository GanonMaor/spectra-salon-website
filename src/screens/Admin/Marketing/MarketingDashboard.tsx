import React from "react";
import { MarketingHeader } from "../../../components/Marketing/MarketingHeader";
import { MarketingKPISection } from "../../../components/Marketing/MarketingKPISection";
import { ConversionFunnelChart } from "../../../components/Marketing/ConversionFunnelChart";
import { InsightsSection } from "../../../components/Marketing/InsightsSection";

const MarketingDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MarketingHeader />
        <MarketingKPISection />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <ConversionFunnelChart />
          <InsightsSection />
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;
