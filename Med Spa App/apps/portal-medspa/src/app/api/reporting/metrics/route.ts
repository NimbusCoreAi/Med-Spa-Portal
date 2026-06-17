import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDashboardMetrics } from '@baseplate/core/reporting';
import { getUserContext } from '@/lib/supabase/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional()
});

export async function GET(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const client = createServerSupabaseClient();
    const metrics = await getDashboardMetrics({
      clinicId: ctx.clinicId,
      from: parsed.data.from,
      to: parsed.data.to
    }, client);
    return NextResponse.json(metrics);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 });
  }
}
