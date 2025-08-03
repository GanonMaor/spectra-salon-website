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

interface RetentionData {
  month: string;
  totalSignups: number;
  retained: number;
  churned: number;
  retentionRate: number;
}

export const RetentionChart: React.FC = () => {
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRetentionData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 900));
        
        const mockData = [
          { month: 'Jan', totalSignups: 20, retained: 12, churned: 8 },
          { month: 'Feb', totalSignups: 22, retained: 15, churned: 7 },
          { month: 'Mar', totalSignups: 25, retained: 18, churned: 7 },
          { month: 'Apr', totalSignups: 32, retained: 24, churned: 8 },
          { month: 'May', totalSignups: 25, retained: 17, churned: 8 },
          { month: 'Jun', totalSignups: 36, retained: 28, churned: 8 },
        ];

        const dataWithRates = mockData.map(item => ({
          ...item,
          retentionRate: Math.round((item.retained / item.totalSignups) * 100)
        }));

        setRetentionData(dataWithRates);
      } catch (error) {
        console.error('Failed to fetch retention data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRetentionData();
  }, []);

  const chartData = {
    labels: retentionData.map(d => d.month),
    datasets: [
      {
        label: 'Retained',
        data: retentionData.map(d => d.retained),
        backgroundColor: '#AEDFF7',
        borderColor: '#60A5FA',
        borderWidth: 1,
        stack: 'Stack 0',
      },
      {
        label: 'Churned',
        data: retentionData.map(d => d.churned),
        backgroundColor: '#FFC5B8',
        borderColor: '#F87171',
        borderWidth: 1,
        stack: 'Stack 0',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
        <div className="h-72 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Retention & Churn Analysis</h3>
      <div className="h-72">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};
      