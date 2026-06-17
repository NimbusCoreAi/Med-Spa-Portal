import type { IntakeStatus } from '@baseplate/core';

const STATUS_STYLES: Record<IntakeStatus, string> = {
  not_started: 'bg-red-100 text-red-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800'
};

const STATUS_LABELS: Record<IntakeStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed'
};

interface IntakeStatusBadgeProps {
  status: IntakeStatus;
}

export function IntakeStatusBadge({ status }: IntakeStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
