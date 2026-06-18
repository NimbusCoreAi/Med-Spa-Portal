'use client';

export type RiskBadgeProps = {
  level: 'high' | 'medium' | 'low';
  className?: string;
};

const riskLabels: Record<string, string> = {
  high: 'High Risk',
  medium: 'Medium Risk',
  low: 'Low Risk',
};

const riskClasses: Record<string, string> = {
  high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
  medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
  low: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100',
};

export function RiskBadge({ level, className = '' }: RiskBadgeProps) {
  return (
    <span
      className={`
        inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
        ${riskClasses[level]}
        ${className}
      `}
    >
      {riskLabels[level]}
    </span>
  );
}
