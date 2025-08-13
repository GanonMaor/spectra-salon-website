import React, { useState, useEffect } from "react";
import {
  MegaphoneIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

interface MarketingKPIData {
  leadsFromCampaigns: {
    value: number;
    change: number;
    changeType: "increase" | "decrease";
  };
  convertedToQ1: {
    value: number;
    change: number;
    conversionRate: number;
  };
  payingClients: {
    value: number;
    change: number;
    conversionRate: number;
  };
}

interface KPICardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  bgColor: string;
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  icon,
  value,
  label,
  change,
  changeType,
  bgColor,
  description,
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case "positive":
        return "text-green-600";
      case "negative":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getChangeIcon = () => {
    if (changeType === "positive") return "↑";
    if (changeType === "negative") return "↓";
    return "";
  };

  return (
    <div
      className={`${bgColor} rounded-lg shadow-sm border border-gray-200 p-6 flex-1 min-w-[220px] relative group`}
    >
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 text-gray-600">{icon}</div>
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="text-lg text-gray-700 mb-3">{label}</div>
      <div className={`text-sm font-semibold ${getChangeColor()}`}>
        {getChangeIcon()} {change}
      </div>

      {description && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
          {description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export const MarketingKPISection: React.FC = () => {
  const [kpiData, setKpiData] = useState<MarketingKPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setKpiData({
          leadsFromCampaigns: {
            value: 74,
            change: 12.5,
            changeType: "increase",
          },
          convertedToQ1: {
            value: 21,
            change: 8.2,
            conversionRate: 28.4,
          },
          payingClients: {
            value: 13,
            change: 15.6,
            conversionRate: 61.9,
          },
        });
      } catch (error) {
        console.error("Failed to fetch marketing KPI data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchKPIData();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1 animate-pulse"
          >
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!kpiData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <p className="text-red-600">Failed to load marketing KPI data</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 mb-8">
      <KPICard
        icon={<MegaphoneIcon className="h-8 w-8" />}
        value={kpiData.leadsFromCampaigns.value.toString()}
        label="Leads from Campaigns"
        change={`${kpiData.leadsFromCampaigns.change}% from last month`}
        changeType={
          kpiData.leadsFromCampaigns.changeType === "increase"
            ? "positive"
            : "negative"
        }
        bgColor="bg-gradient-to-br from-pink-100 to-pink-200"
        description="Total leads from all marketing channels"
      />

      <KPICard
        icon={<CheckCircleIcon className="h-8 w-8" />}
        value={kpiData.convertedToQ1.value.toString()}
        label="Converted to Q1"
        change={`${kpiData.convertedToQ1.change}% MoM | ${kpiData.convertedToQ1.conversionRate}% conversion`}
        changeType={kpiData.convertedToQ1.change > 0 ? "positive" : "negative"}
        bgColor="bg-gradient-to-br from-sky-100 to-blue-200"
        description="Leads that moved to qualified stage"
      />

      <KPICard
        icon={<CurrencyDollarIcon className="h-8 w-8" />}
        value={kpiData.payingClients.value.toString()}
        label="Paying Clients"
        change={`${kpiData.payingClients.change}% MoM | ${kpiData.payingClients.conversionRate}% from Q1`}
        changeType="positive"
        bgColor="bg-gradient-to-br from-green-100 to-emerald-200"
        description="Leads who became paying customers"
      />
    </div>
  );
};
