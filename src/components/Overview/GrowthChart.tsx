import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyGrowthData {
  month: string;
  israel: number;
  international: number;
}

export const GrowthChart: React.FC = () => {
  const [growthData, setGrowthData] = useState<MonthlyGrowthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'israel' | 'international'>('all');

  useEffect(() => {
    // Mock data - replace with real API call
    const fetchGrowthData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setGrowthData([
          { month: 'Jan', israel: 14, international: 8 },
          { month: 'Feb', israel: 12, international: 10 },
          { month: 'Mar', israel: 18, international: 7 },
          { month: 'Apr', israel: 20, international: 12 },
          { month: 'May', israel: 16, international: 9 },
          { month: 'Jun', israel: 22, international: 14 },
          { month: 'Jul', israel: 19, international: 11 },
          { month: 'Aug', israel: 25, international: 16 },
          { month: 'Sep', israel: 21, international: 13 },
          { month: 'Oct', israel: 28, international: 18 },
          { month: 'Nov', israel: 24, international: 15 },
          { month: 'Dec', israel: 30, international: 20 },
        ]);
      } catch (error) {
        console.error('Failed to fetch growth data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, []);

  const chartData = {
    labels: growthData.map(d => d.month),
    datasets: [
      ...(filter === 'all' || filter === 'israel' ? [{
        label: '🇮🇱 Israel',
        data: growthData.map(d => d.israel),
        backgroundColor: '#AEDFF7',
        borderColor: '#60A5FA',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }] : []),
      ...(filter === 'all' || filter === 'international' ? [{
        label: '🌎 International',
        data: growthData.map(d => d.international),
        backgroundColor: '#C7F0BD',
        borderColor: '#34D399',
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          afterBody: function(context: any) {
            const dataIndex = context[0].dataIndex;
            const monthData = growthData[dataIndex];
            return [`Total: ${monthData.israel + monthData.international}`];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6B7280',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6B7280',
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
        <div className="h-72 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">New Customers by Region</h3>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value as any)}
          className="border border-gray-300 rounded-md px-3 py-1 text-sm"
        >
          <option value="all">All Regions</option>
          <option value="israel">Israel Only</option>
          <option value="international">International Only</option>
        </select>
      </div>
      <div className="h-72">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}; 