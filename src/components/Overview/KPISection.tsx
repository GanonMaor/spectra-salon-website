import React, { useState, useEffect } from 'react';
import { UsersIcon, BeakerIcon, ClockIcon } from '@heroicons/react/24/outline';

interface KPIData {
  activeCustomers: {
    value: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  trialCustomers: {
    value: number;
    monthlyChange: number;
    yearlyChange: number;
  };
  onboardingQueue: {
    value: number;
    totalThisMonth: number;
    percentageOnboarded: number;
  };
}

interface KPICardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  bgColor: string;
  description?: string;
}

const KPICard: React.FC<KPICardProps> = ({ icon, value, label, change, changeType, bgColor, description }) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return '↑';
    if (changeType === 'negative') return '↓';
    return '';
  };

  return (
    <div className={`${bgColor} rounded-lg shadow-sm border border-gray-200 p-6 flex-1 min-w-[220px] relative group`}>
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 text-gray-600">
          {icon}
        </div>
      </div>
      <div className="text-4xl font-bold text-gray-900 mb-2">
        {value}
      </div>
      <div className="text-lg text-gray-700 mb-3">
        {label}
      </div>
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

export const KPISection: React.FC = () => {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - replace with real API call
    const fetchKPIData = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setKpiData({
          activeCustomers: {
            value: 235,
            change: 3.2,
            changeType: 'increase'
          },
          trialCustomers: {
            value: 22,
            monthlyChange: 10.2,
            yearlyChange: -4.3
          },
          onboardingQueue: {
            value: 12,
            totalThisMonth: 30,
            percentageOnboarded: 60
          }
        });
      } catch (error) {
        console.error('Failed to fetch KPI data:', error);
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
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex-1 animate-pulse">
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
        <p className="text-red-600">Failed to load KPI data</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6 mb-8">
      <KPICard
        icon={<UsersIcon className="h-8 w-8" />}
        value={kpiData.activeCustomers.value.toString()}
        label="Active Customers"
        change={`${kpiData.activeCustomers.change}% from last month`}
        changeType={kpiData.activeCustomers.changeType === 'increase' ? 'positive' : 'negative'}
        bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
        description="Total customers currently using Spectra"
      />
      
      <KPICard
        icon={<BeakerIcon className="h-8 w-8" />}
        value={kpiData.trialCustomers.value.toString()}
        label="Customers in Trial"
        change={`+${kpiData.trialCustomers.monthlyChange}% MoM, ${kpiData.trialCustomers.yearlyChange}% YoY`}
        changeType={kpiData.trialCustomers.monthlyChange > 0 ? 'positive' : 'negative'}
        bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
        description="Customers evaluating Spectra system"
      />
      
      <KPICard
        icon={<ClockIcon className="h-8 w-8" />}
        value={kpiData.onboardingQueue.value.toString()}
        label="Waiting for Onboarding"
        change={`${kpiData.onboardingQueue.percentageOnboarded}% onboarded this month`}
        changeType="neutral"
        bgColor="bg-gradient-to-br from-amber-100 to-orange-200"
        description="New customers pending setup"
      />
    </div>
  );
}; 