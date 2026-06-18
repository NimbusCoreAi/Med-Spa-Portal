'use client';

export type StatusBadgeProps = {
  status: 'active' | 'inactive' | 'pending' | 'cancelled';
  className?: string;
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  cancelled: 'Cancelled',
};

const statusClasses: Record<string, string> = {
  active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
  inactive: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
  pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100',
  cancelled:
    'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100',
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-block px-2.5 py-0.5 rounded-full text-xs font-medium
        ${statusClasses[status]}
        ${className}
      `}
    >
      {statusLabels[status]}
    </span>
  );
}
