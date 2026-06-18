'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@baseplate/ui';

export function QuickActionButtons() {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-4">
      <Button
        onClick={() => router.push('/dashboard/calendar')}
        className="flex-1"
      >
        Schedule New Appointment
      </Button>
      <Button
        variant="secondary"
        onClick={() => router.push('/dashboard/patients')}
        className="flex-1"
      >
        Add Patient
      </Button>
      <Button
        variant="secondary"
        onClick={() => router.push('/dashboard/calendar')}
        className="flex-1"
      >
        View Calendar
      </Button>
    </div>
  );
}
