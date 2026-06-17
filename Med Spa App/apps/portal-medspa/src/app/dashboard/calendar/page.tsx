import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/supabase/server';
import { StaffCalendar } from '@/components/scheduling/StaffCalendar';
import { PageLayout } from '@baseplate/ui/layout';

export const dynamic = 'force-dynamic';

export default async function CalendarPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect('/auth/login');

  return (
    <PageLayout className="p-8">
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>
      <StaffCalendar clinicId={ctx.clinicId} />
    </PageLayout>
  );
}
