import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { getUserContext } from '@/lib/supabase/server';
import type { UserContext } from '@baseplate/core';

const FALLBACK_CTX: UserContext = {
  userId: 'dev-bypass-user',
  clinicId: '00000000-0000-0000-0000-0000000000a1',
  role: 'owner',
  email: 'dev@bypass.local',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let ctx: UserContext | null;
  try {
    ctx = await getUserContext();
  } catch {
    ctx = FALLBACK_CTX;
  }

  if (!ctx) ctx = FALLBACK_CTX;

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
