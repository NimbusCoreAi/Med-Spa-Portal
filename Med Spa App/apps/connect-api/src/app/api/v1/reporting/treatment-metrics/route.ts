import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { validateApiKey } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logApiUsage } from '@/lib/usage';
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { logAction } from '@baseplate/core/audit-logs';

export const dynamic = 'force-dynamic';

const treatmentMetricsSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  group_by: z.enum(['provider', 'service_type', 'month']).default('service_type'),
});

interface GroupData {
  total_appointments: number;
  completed: number;
  cancelled: number;
  revenue: number;
  revenue_collected: number;
}

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
    body = treatmentMetricsSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  let query = supabase
    .from('appointments')
    .select('service_type, provider_id, scheduled_time, status, amount, payment_status')
    .eq('clinic_id', clinicId);

  if (body.from) query = query.gte('scheduled_time', body.from);
  if (body.to) query = query.lte('scheduled_time', body.to);

  const { data: appointments, error } = await query;

  if (error) {
    console.error('[reporting] db query failed', { requestId, clinicId, error: error.message });
    return NextResponse.json({ error: 'Database query failed' }, { status: 500 });
  }

  const groups: Record<string, GroupData> = {};

  for (const appt of appointments ?? []) {
    let groupKey: string;

    if (body.group_by === 'provider') {
      groupKey = appt.provider_id ?? 'Unassigned';
    } else if (body.group_by === 'month') {
      const date = new Date(appt.scheduled_time);
      groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      groupKey = appt.service_type ?? 'Unknown';
    }

    if (!groups[groupKey]) {
      groups[groupKey] = {
        total_appointments: 0,
        completed: 0,
        cancelled: 0,
        revenue: 0,
        revenue_collected: 0,
      };
    }

    const g = groups[groupKey];
    g.total_appointments++;
    if (appt.status === 'completed') g.completed++;
    if (appt.status === 'cancelled') g.cancelled++;
    g.revenue += Number(appt.amount) || 0;
    if (appt.payment_status === 'completed') {
      g.revenue_collected += Number(appt.amount) || 0;
    }
  }

  const metrics = Object.entries(groups).map(([groupKey, d]) => ({
    group_key: groupKey,
    total_appointments: d.total_appointments,
    completed: d.completed,
    cancelled: d.cancelled,
    no_show_rate: d.total_appointments > 0
      ? Math.round((1 - (d.completed + d.cancelled) / d.total_appointments) * 1000) / 1000
      : 0,
    revenue: Math.round(d.revenue * 100) / 100,
    revenue_collected: Math.round(d.revenue_collected * 100) / 100,
    outstanding: Math.round((d.revenue - d.revenue_collected) * 100) / 100,
  }));

  const totals = {
    total_appointments: metrics.reduce((sum, m) => sum + m.total_appointments, 0),
    total_revenue: Math.round(metrics.reduce((sum, m) => sum + m.revenue, 0) * 100) / 100,
    total_collected: Math.round(metrics.reduce((sum, m) => sum + m.revenue_collected, 0) * 100) / 100,
    total_outstanding: Math.round(metrics.reduce((sum, m) => sum + m.outstanding, 0) * 100) / 100,
  };

  await logAction({
    clinicId,
    userId: 'connect-api',
    action: 'reporting.metrics',
    resourceType: 'reporting',
    resourceId: body.group_by,
  }, supabase).catch((err) =>
    console.error('[audit] reporting.metrics write failed', { requestId, error: err?.message, clinicId })
  );

  await logApiUsage({ clinicId, endpoint: req.nextUrl.pathname, statusCode: 200, responseTimeMs: Date.now() - startTime });

  return NextResponse.json({
    clinic_id: clinicId,
    period: { from: body.from ?? null, to: body.to ?? null },
    group_by: body.group_by,
    metrics,
    totals,
  });
}
