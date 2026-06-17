import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { validateApiKey } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logApiUsage } from '@/lib/usage';
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { evaluateRisk } from '@baseplate/intelligence';

export const dynamic = 'force-dynamic';

const churnSchema = z.object({
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
      { status: 429, headers: { 'X-RateLimit-Limit': rateLimit.limit.toString(), 'X-RateLimit-Remaining': rateLimit.remaining.toString() } }
    );
  }

  let body;
  try {
    body = churnSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    let churnResult: { churn_probability: number; confidence: number; risk_level: string; factors: string[] };

    try {
      const riskScore = await evaluateRisk({
        tenantId: clinicId,
        customerId: body.customer_id,
        client: supabase,
      });

      const churnFlag = riskScore.flags.find((f) => f.type === 'churn_risk');

      churnResult = {
        churn_probability: churnFlag ? 0.65 : 0.05,
        confidence: churnFlag ? 0.5 : 0.3,
        risk_level: riskScore.overallRisk,
        factors: riskScore.flags.map((f) => f.reason),
      };

      console.info('[intelligence] churn-prediction using heuristic fallback (rules-engine)', { requestId, clinicId });
    } catch {
      churnResult = {
        churn_probability: 0,
        confidence: 0,
        risk_level: 'unknown',
        factors: ['Unable to evaluate — insufficient data'],
      };
    }

    await logApiUsage({
      clinicId,
      endpoint: req.nextUrl.pathname,
      statusCode: 200,
      responseTimeMs: Date.now() - startTime,
    });

    return NextResponse.json({
      tenant_id: clinicId,
      customer_id: body.customer_id ?? null,
      ...churnResult,
      recommendation: churnResult.risk_level === 'high'
        ? 'Immediate follow-up recommended — customer at high churn risk'
        : churnResult.risk_level === 'medium'
        ? 'Monitor closely — consider sending a re-engagement offer'
        : 'No immediate concerns detected',
      evaluated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[intelligence] churn-prediction failed', { requestId, clinicId, error: err instanceof Error ? err.message : String(err) });
    await logApiUsage({
      clinicId,
      endpoint: req.nextUrl.pathname,
      statusCode: 500,
      responseTimeMs: Date.now() - startTime,
    });

    return NextResponse.json({ error: 'Churn prediction failed' }, { status: 500 });
  }
}
