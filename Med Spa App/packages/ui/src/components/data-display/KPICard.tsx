'use client';

import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

export type KPICardProps = {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon: LucideIcon;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
};

export function KPICard(props: KPICardProps) {
  const {
    title,
    value,
    trend,
    icon: Icon,
    color = 'primary',
    className = '',
  } = props;

  const colorClasses = {
    primary:
      'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    success:
      'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    warning:
      'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    danger: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  };

  const trendColor = trend?.direction === 'up' ? 'text-green-600' : 'text-red-600';
  const TrendIcon = trend?.direction === 'up' ? TrendingUp : TrendingDown;

  return (
    <div
      className={`
        rounded-lg border border-slate-200 dark:border-slate-800
        bg-white dark:bg-slate-950 p-6
        shadow-sm hover:shadow-md transition-shadow
        ${className}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {title}
          </p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-3">
            {value}
          </h3>
          {trend && (
            <div className={`flex items-center gap-1 font-medium text-sm ${trendColor}`}>
              <TrendIcon size={16} />
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
