import React from 'react';

// KPI Card Component
const KPICard: React.FC<{
  icon: string;
  number: string;
  label: string;
  change: { type: 'positive' | 'negative' | 'neutral'; value: string };
}> = ({ icon, number, label, change }) => {
  const getChangeClass = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 flex-1 min-w-[300px]">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
          {icon}
        </div>
      </div>
      <div className="text-6xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Poppins' }}>
        {number}
      </div>
      <div className="text-xl text-gray-600 mb-3" style={{ fontFamily: 'Poppins' }}>
        {label}
      </div>
      <div className={`text-base font-semibold ${getChangeClass(change.type)}`}>
        {change.value}
      </div>
    </div>
  );
};

// Feature Card Component
const FeatureCard: React.FC<{
  type: 'blue' | 'pink' | 'navy';
  title: string;
  subtitle: string;
}> = ({ type, title, subtitle }) => {
  const gradients = {
    blue: 'bg-gradient-to-br from-blue-300 to-blue-500',
    pink: 'bg-gradient-to-br from-pink-200 to-pink-400',
    navy: 'bg-gradient-to-br from-slate-700 to-slate-900'
  };

  return (
    <div className={`${gradients[type]} rounded-lg p-12 flex flex-col justify-between min-h-[600px] relative overflow-hidden shadow-xl`}>
      <div>
        <h2 className="text-white text-6xl font-bold uppercase mb-6" style={{ fontFamily: 'Aspira Nar, Poppins' }}>
          {title}
        </h2>
      </div>
      
      <div className="flex justify-center">
        <button className="w-60 h-60 border-4 border-white rounded-full bg-transparent hover:bg-white/10 transition-all duration-300 flex items-center justify-center group">
          <div className="text-white text-6xl group-hover:scale-110 transition-transform">+</div>
        </button>
      </div>
      
      <div className="text-white text-4xl font-light" style={{ fontFamily: 'Poppins' }}>
        | {subtitle}
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen" style={{ background: '#FDFEFF', fontFamily: 'Poppins' }}>
      <div className="p-8">
        {/* Page Header */}
        <h1 className="text-5xl font-bold text-gray-900 opacity-80 mb-12" style={{ fontFamily: 'Aspira Nar' }}>
          Overview
        </h1>

        {/* Top Section */}
        <div className="flex gap-20 mb-32">
          {/* KPI Section */}
          <div className="flex-1">
            {/* Month Navigation */}
            <div className="flex items-center gap-16 mb-8">
              <span className="text-5xl font-normal text-gray-900" style={{ fontFamily: 'Aspira Nar' }}>
                January
              </span>
              <span className="text-5xl font-semibold text-gray-900" style={{ fontFamily: 'Aspira Nar' }}>
                2024
              </span>
              <div className="w-16 h-0 border-t-4 border-gray-900 opacity-20 transform rotate-90"></div>
              <button className="bg-red-600 text-white rounded-full w-36 h-28 flex items-center justify-center text-4xl font-semibold hover:scale-105 transition-transform">
                12
              </button>
            </div>
            
            {/* KPI Cards */}
            <div className="flex gap-8">
              <KPICard 
                icon="👥"
                number="235"
                label="Active Customers"
                change={{ type: 'positive', value: '↑ 3.2%' }}
              />
              <KPICard 
                icon="🧪"
                number="22"
                label="Customers in Trial"
                change={{ type: 'positive', value: '+2 / +10.2% MoM, -4.3% YoY' }}
              />
              <KPICard 
                icon="⏳"
                number="12"
                label="Waiting for Onboarding"
                change={{ type: 'neutral', value: '12/30 onboarded (60%)' }}
              />
            </div>
          </div>

          {/* Feature Cards Section */}
          <div className="flex gap-28">
            <FeatureCard type="blue" title="Highlight" subtitle="Half head" />
            <FeatureCard type="pink" title="Color" subtitle="Keratin" />
            <FeatureCard type="navy" title="Toner" subtitle="Roots" />
          </div>
        </div>

        {/* Notification Icon */}
        <div className="fixed top-24 right-28">
          <div className="relative w-28 h-30 bg-gradient-to-b from-gray-500 to-gray-700 rounded-full flex items-center justify-center text-white text-2xl">
            🔔
            <div className="absolute -top-2 -right-2 w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              7
            </div>
          </div>
        </div>

        {/* Charts Section Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Monthly New Customers Chart */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">New Customers by Region</h3>
            <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 text-lg">Monthly Chart Placeholder</span>
            </div>
          </div>

          {/* Retention Chart */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Retention & Churn</h3>
            <div className="h-64 bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-600 text-lg">Retention Chart Placeholder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;