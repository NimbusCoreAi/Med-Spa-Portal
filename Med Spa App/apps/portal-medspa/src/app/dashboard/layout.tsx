import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { getUserContext } from '@/lib/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getUserContext();
  if (!ctx) redirect('/auth/login');

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <DashboardSidebar role={ctx.role} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-8">{children}</main>
      </div>
      <FeedbackWidget />
    </div>
  );
}
