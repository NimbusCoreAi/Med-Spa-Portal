import { redirect } from 'next/navigation';
import { getUserContext } from '@/lib/supabase/server';
import { RoomManager } from '@/components/dashboard/RoomManager';

export const dynamic = 'force-dynamic';

export default async function RoomsPage() {
  const ctx = await getUserContext();
  if (!ctx) redirect('/auth/login');

  return <RoomManager clinicId={ctx.clinicId} />;
}
