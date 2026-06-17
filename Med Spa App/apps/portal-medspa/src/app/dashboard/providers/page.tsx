import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/supabase/server';
import { ProviderManager } from '@/components/dashboard/ProviderManager';

export const dynamic = 'force-dynamic';

export default async function ProvidersPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect('/auth/login');

  return <ProviderManager clinicId={ctx.clinicId} />;
}
