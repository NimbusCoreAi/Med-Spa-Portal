import { NextRequest, NextResponse } from 'next/server';
import { getUserContext, createServerSupabaseClient } from '@/lib/supabase/server';
import { evaluateRisk } from '@baseplate/intelligence';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { customer_id?: string };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const supabase = createServerSupabaseClient();
    const score = await evaluateRisk({
      tenantId: ctx.clinicId,
      customerId: body.customer_id,
      client: supabase,
    });

    return NextResponse.json({
      tenant_id: score.tenantId,
      customer_id: score.customerId ?? null,
      overall_risk: score.overallRisk,
      flags: score.flags,
      recommendation: score.recommendation,
      evaluated_at: score.evaluatedAt.toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Risk score unavailable' }, { status: 500 });
  }
}
