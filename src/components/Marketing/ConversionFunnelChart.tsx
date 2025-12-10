import React, { useState, useEffect } from "react";

interface FunnelData {
  stage: string;
  value: number;
  percentage: number;
  color: string;
  dropOffRate?: number;
}

export const ConversionFunnelChart: React.FC = () => {
  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunnelData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));

        const data = [
          {
            stage: "Leads from Campaigns",
            value: 74,
            percentage: 100,
            color: "from-pink-400 to-pink-500",
          },
          {
            stage: "Converted to Q1",
            value: 21,
            percentage: 28.4,
            color: "from-sky-400 to-blue-500",
            dropOffRate: 71.6,
          },
          {
            stage: "Paying Clients",
            value: 13,
            percentage: 61.9,
            color: "from-green-400 to-emerald-500",
            dropOffRate: 38.1,
          },
        ];

        setFunnelData(data);
      } catch (error) {
        console.error("Failed to fetch funnel data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFunnelData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="h-6 bg-gray-200 rounded w-64 mb-8 animate-pulse"></div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-16 bg-gray-200 rounded animate-pulse flex-1"></div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-8">
        Conversion Funnel
      </h3>

      <div className="space-y-6">
        {funnelData.map((stage, index) => {
          const displayedPercent = index === 0 ? 100 : stage.percentage;

          return (
          <div key={stage.stage} className="relative">
            <div className="flex items-center space-x-6">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-gray-900">
                    {stage.stage}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">
                      {stage.value}
                    </span>
                    {index > 0 && (
                      <span className="text-sm text-gray-600 ml-2">
                          ({displayedPercent.toFixed(1)}% conversion)
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-12 relative overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${stage.color} h-12 rounded-full transition-all duration-1000 ease-out flex items-center justify-center`}
                    style={{
                        width: `${Math.max(displayedPercent, 12)}%`,
                    }}
                  >
                    <span className="text-white font-semibold">
                        {displayedPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {stage.dropOffRate && (
              <div className="mt-2 text-right">
                <span className="text-sm text-red-600 font-medium">
                  ↓ {stage.dropOffRate.toFixed(1)}% drop-off
                </span>
              </div>
            )}

            {index < funnelData.length - 1 && (
              <div className="flex justify-center mt-4 mb-2">
                <div className="text-gray-400">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
};