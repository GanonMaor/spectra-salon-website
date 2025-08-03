/**
 * Reusable Metric Card Component
 * Displays real-time metrics with consistent styling
 * Created: 2024-01-09 14:35:00 UTC
 */

import React from 'react';
import { useActionLogger } from '../utils/actionLogger';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: React.ComponentType<any>;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  loading = false,
  onClick,
  className = ''
}) => {
  const { logButtonClick } = useActionLogger();

  const handleClick = () => {
    if (onClick) {
      logButtonClick(`metric_card_${title}`, 'dashboard', { metric_title: title, metric_value: value });
      onClick();
    }
  };

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      // Format large numbers with commas
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral'): string => {
    switch (direction) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral'): string => {
    switch (direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <div 
      className={`
        bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
            {title}
          </h3>
          
          <div className="mt-2">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </div>
            ) : (
              <p className="text-2xl font-bold text-gray-900">
                {formatValue(value)}
              </p>
            )}
          </div>

          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">
              {subtitle}
            </p>
          )}

          {trend && !loading && (
            <div className={`flex items-center mt-2 text-sm ${getTrendColor(trend.direction)}`}>
              <span className="mr-1">{getTrendIcon(trend.direction)}</span>
              <span className="font-medium">{trend.value}%</span>
              <span className="ml-1 text-gray-600">{trend.label}</span>
            </div>
          )}
        </div>

        {Icon && (
          <div className="ml-4">
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;