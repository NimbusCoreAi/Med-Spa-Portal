import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { validateApiKey } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logApiUsage } from '@/lib/usage';
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { evaluateRisk } from '@baseplate/intelligence';
import { AppError, errorToResponse, errorToStatus } from '@baseplate/core/errors';

export const dynamic = 'force-dynamic';

const riskScoreSchema = z.object({
  customer_id: z.string().uuid().optional(),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = req.headers.get('x-request-id') ?? randomUUID();
  const supabase = getServiceSupabaseClient();

  const auth = await validateApiKey(req, supabase);
  if (auth.error) return auth.error;
  const clinicId = auth.clinicId;

  const rateLimit = await checkRateLimit(auth.keyHash);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  }

  let body;
  try {
    body = riskScoreSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const score = await evaluateRisk({
      tenantId: clinicId,
      customerId: body.customer_id,
      client: supabase,
    });

    await logApiUsage({
      clinicId,
      endpoint: req.nextUrl.pathname,
      statusCode: 200,
      responseTimeMs: Date.now() - startTime,
    });

    return NextResponse.json({
      tenant_id: score.tenantId,
      customer_id: score.customerId ?? null,
      overall_risk: score.overallRisk,
      flags: score.flags,
      recommendation: score.recommendation,
      evaluated_at: score.evaluatedAt.toISOString(),
    });
  } catch (err) {
    console.error('[intelligence] risk-score failed', { requestId, clinicId, error: err instanceof Error ? err.message : String(err) });
    await logApiUsage({
      clinicId,
      endpoint: req.nextUrl.pathname,
      statusCode: errorToStatus(err),
      responseTimeMs: Date.now() - startTime,
    });

    if (err instanceof AppError) {
      return NextResponse.json(errorToResponse(err), { status: err.statusCode });
    }

    return NextResponse.json({ error: 'Risk score evaluation failed' }, { status: 500 });
  }
}
