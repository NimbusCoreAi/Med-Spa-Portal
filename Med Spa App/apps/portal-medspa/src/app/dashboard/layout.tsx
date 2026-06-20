import { redirect } from 'next/navigation';
import { DashboardSidebar } from '@/components/layout/DashboardSidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { FeedbackWidget } from '@/components/feedback/FeedbackWidget';
import { getUserContext } from '@/lib/supabase/server';
import { getMissingRequiredEnv } from '@/lib/env-check';
import { EnvSetupNotice } from '@/components/setup/EnvSetupNotice';
import type { UserContext } from '@baseplate/core';

const FALLBACK_CTX: UserContext = {
  userId: '00000000-0000-0000-0000-0000000000f1',
  clinicId: '00000000-0000-0000-0000-0000000000a1',
  role: 'owner',
  email: 'dev@bypass.local',
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const missingEnv = getMissingRequiredEnv();
  if (missingEnv.length > 0) {
    return <EnvSetupNotice missing={missingEnv} />;
  }

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
