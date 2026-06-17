import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getClinic } from '@baseplate/core';
import { sendAppointmentConfirmationEmail } from '@baseplate/postmark';
import { getUserContext } from '@/lib/supabase/server';
import { callConnectApi } from '@/lib/connect-client';

const bodySchema = z.object({
  clinicId: z.string().min(1),
  scheduledTime: z.string().min(1),
  patientName: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  intakeFormUrl: z.string().url().optional()
});

export async function POST(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { clinicId, scheduledTime, patientName, email, phone, intakeFormUrl } = parsed.data;

  if (clinicId !== ctx.clinicId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const clinic = await getClinic(clinicId);
    const results: Record<string, unknown> = {};

    if (email) {
      results.email = await sendAppointmentConfirmationEmail({
        to: email,
        patientName,
        scheduledTime,
        clinicName: clinic.name,
        intakeFormUrl
      });
    }

    if (phone) {
      try {
        const smsResult = await callConnectApi('POST', '/api/v1/communications/sms-reminder', {
          patient_phone: phone,
          patient_name: patientName,
          appointment_time: scheduledTime,
          clinic_name: clinic.name,
          template: 'pre-appointment',
        });
        results.sms = { sent: true, message_id: (smsResult as { message_id?: string }).message_id };
      } catch {
        results.sms = { sent: false, error: 'Connect API call failed' };
      }
    }

    return NextResponse.json({ sent: results });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to send confirmation' }, { status: 500 });
  }
}
