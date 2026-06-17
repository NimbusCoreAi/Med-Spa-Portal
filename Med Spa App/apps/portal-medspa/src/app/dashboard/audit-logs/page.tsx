import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/supabase/server';
import { AuditLogViewer } from '@/components/dashboard/AuditLogViewer';

export const dynamic = 'force-dynamic';

export default async function AuditLogsPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect('/auth/login');

  return <AuditLogViewer clinicId={ctx.clinicId} />;
}
