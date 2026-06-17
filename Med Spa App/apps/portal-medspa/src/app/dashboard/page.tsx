import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/supabase/server';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect('/auth/login');

  return <DashboardOverview />;
}
