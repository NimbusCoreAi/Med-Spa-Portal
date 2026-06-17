import { NextResponse } from 'next/server';
import { getAuditLogs } from '@baseplate/core/audit-logs';
import { getUserContext, createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const client = createServerSupabaseClient();
    const logs = await getAuditLogs(ctx.clinicId, client);
    return NextResponse.json(logs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 });
  }
}
