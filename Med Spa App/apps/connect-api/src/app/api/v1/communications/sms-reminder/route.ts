import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import { validateApiKey } from '@/lib/auth';
import { checkRateLimit, checkSmsDailyLimit } from '@/lib/rate-limit';
import { logApiUsage } from '@/lib/usage';
import { buildSmsMessage } from '@/lib/sms-templates';
import { isE164, isAllowedIntakeUrl } from '@/lib/sms-validation';
import { sendSMS } from '@baseplate/twilio';
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { logAction } from '@baseplate/core/audit-logs';

export const dynamic = 'force-dynamic';

const smsReminderSchema = z.object({
  appointment_id: z.string().uuid().optional(),
  patient_phone: z.string().refine(isE164, 'patient_phone must be E.164 format (+<country><number>)'),
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

  // Global per-key throttle (rejects concurrent/abusive callers).
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

  // Per-clinic daily SMS cap (prevents SMS-pumping / toll fraud via one key).
  const smsLimit = await checkSmsDailyLimit(clinicId);
  if (!smsLimit.success) {
    return NextResponse.json(
      { error: 'Daily SMS limit exceeded' },
      { status: 429, headers: { 'X-RateLimit-Limit': smsLimit.limit.toString() } }
    );
  }

  let body;
  try {
    body = smsReminderSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Restrict embedded intake_url to an allowlisted host (stops phishing links).
  if (body.intake_url && !isAllowedIntakeUrl(body.intake_url)) {
    return NextResponse.json({ error: 'intake_url host is not allowed' }, { status: 400 });
  }

  // When an appointment context is provided, verify the recipient belongs to a
  // patient in THIS clinic and matches the phone on file. Prevents a key holder
  // from texting arbitrary numbers under an appointment pretext.
  if (body.appointment_id) {
    const { data: appointment, error: apptError } = await supabase
      .from('appointments')
      .select('id, patient_id')
      .eq('id', body.appointment_id)
      .eq('clinic_id', clinicId)
      .maybeSingle();

    if (apptError || !appointment) {
      return NextResponse.json({ error: 'Appointment not found for this clinic' }, { status: 404 });
    }

    const { data: patient } = await supabase
      .from('patients')
      .select('phone')
      .eq('id', appointment.patient_id)
      .eq('clinic_id', clinicId)
      .maybeSingle();

    const onFile = (patient?.phone ?? '').trim();
    if (!onFile || onFile !== body.patient_phone.trim()) {
      return NextResponse.json(
        { error: 'patient_phone does not match the patient on file for this appointment' },
        { status: 400 }
      );
    }
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
