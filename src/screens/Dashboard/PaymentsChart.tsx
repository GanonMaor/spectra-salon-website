import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyTrend } from '../../lib/types/payments';
import { PaymentsService } from '../../services/paymentsService';

interface PaymentsChartProps {
  data: MonthlyTrend[];
  type?: 'line' | 'bar';
}

const PaymentsChart: React.FC<PaymentsChartProps> = ({ data, type = 'line' }) => {
  const formatTooltipValue = (value: number, name: string) => {
    const currency = name as 'ILS' | 'USD';
    return PaymentsService.formatCurrency(value, currency);
  };

  const formatXAxisTick = (tickItem: string) => {
    return PaymentsService.formatMonth(tickItem);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{formatXAxisTick(label)}</p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatTooltipValue(entry.value, entry.name)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const Chart = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <Chart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="month" 
          tickFormatter={formatXAxisTick}
          className="text-xs"
        />
        <YAxis 
          className="text-xs"
          tickFormatter={(value) => new Intl.NumberFormat('he-IL', { 
            notation: 'compact',
            compactDisplay: 'short'
          }).format(value)}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <DataComponent
          type="monotone"
          dataKey="ILS"
          stroke="#3B82F6"
          fill="#3B82F6"
          strokeWidth={2}
          name="ILS"
        />
        <DataComponent
          type="monotone"
          dataKey="USD"
          stroke="#10B981"
          fill="#10B981"
          strokeWidth={2}
          name="USD"
        />
      </Chart>
    </ResponsiveContainer>
  );
};

export default PaymentsChart;
