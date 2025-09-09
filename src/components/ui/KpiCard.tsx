import React from 'react';
import { cn } from '../../lib/utils';
import { RADIUS, SHADOWS, PADDING, GAP, TRANSITIONS } from '../../design/tokens';
import { useCountUp } from '../../hooks/useCountUp';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percentage';
  decimals?: number;
  icon?: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export function KpiCard({
  label,
  value,
  previousValue,
  format = 'number',
  decimals = 0,
  icon,
  className,
  animate = true,
}: KpiCardProps) {
  const { value: animatedValue } = useCountUp(value, {
    duration: 2000,
    decimals,
    startOnView: false,
  });

  const displayValue = animate ? animatedValue : value;
  
  // Format the value based on type
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(val);
      case 'percentage':
        return `${val.toFixed(decimals)}%`;
      default:
        return new Intl.NumberFormat('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(val);
    }
  };

  // Calculate change percentage if previous value exists
  const changePercentage = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : null;

  const isPositive = changePercentage !== null && changePercentage > 0;
  const isNegative = changePercentage !== null && changePercentage < 0;

  return (
    <div
      className={cn(
        'bg-white',
        RADIUS.lg,
        SHADOWS.md,
        PADDING.md,
        GAP.sm,
        TRANSITIONS.smooth,
        'hover:shadow-lg',
        'flex flex-col',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      
      <div className="flex items-end justify-between">
        <p className="text-2xl sm:text-3xl font-bold text-gray-900">
          {formatValue(displayValue)}
        </p>
        
        {changePercentage !== null && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              isPositive && 'text-green-600',
              isNegative && 'text-red-600',
              !isPositive && !isNegative && 'text-gray-500'
            )}
          >
            {isPositive && <ArrowUpIcon className="w-4 h-4" />}
            {isNegative && <ArrowDownIcon className="w-4 h-4" />}
            <span>{Math.abs(changePercentage).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
