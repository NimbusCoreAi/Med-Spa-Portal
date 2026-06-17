import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { validateApiKey } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logApiUsage } from '@/lib/usage';
import { buildSmsMessage } from '@/lib/sms-templates';
import { sendSMS } from '@baseplate/twilio';
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { logAction } from '@baseplate/core/audit-logs';

export const dynamic = 'force-dynamic';

const smsReminderSchema = z.object({
  appointment_id: z.string().uuid().optional(),
  patient_phone: z.string().min(10),
  patient_name: z.string(),
  appointment_time: z.string().datetime(),
  clinic_name: z.string(),
  template: z.enum(['pre-appointment', 'intake-reminder']).default('pre-appointment'),
  intake_url: z.string().url().optional(),
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
    body = smsReminderSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const message = buildSmsMessage(body.template, {
      patientName: body.patient_name,
      appointmentTime: body.appointment_time,
      clinicName: body.clinic_name,
      intakeUrl: body.intake_url,
    });

    const result = await sendSMS({ to: body.patient_phone, body: message });

    if (body.appointment_id) {
      await logAction({
        clinicId,
        userId: 'connect-api',
        action: 'sms.sent',
        resourceType: 'appointment',
        resourceId: body.appointment_id,
      }, supabase).catch((err) =>
        console.error('[audit] sms.sent write failed', { requestId, error: err?.message, clinicId, appointmentId: body.appointment_id })
      );
    }

    await logApiUsage({ clinicId, endpoint: req.nextUrl.pathname, statusCode: 200, responseTimeMs: Date.now() - startTime });

    return NextResponse.json({
      message_id: result.sid,
      status: 'sent',
      sent_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[sms] send failed', { requestId, error: err instanceof Error ? err.message : String(err), clinicId });
    await logApiUsage({ clinicId, endpoint: req.nextUrl.pathname, statusCode: 500, responseTimeMs: Date.now() - startTime });
    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}
