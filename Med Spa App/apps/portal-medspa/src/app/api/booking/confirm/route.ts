import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findOrCreatePatient, createAppointment, getServiceSupabaseClient, logError } from '@baseplate/core';
import { checkRateLimit } from '@/lib/request-rate-limit';

const bodySchema = z.object({
  clinicId: z.string().min(1),
  providerId: z.string().min(1),
  serviceType: z.string().min(1).max(200),
  scheduledTime: z.string().min(1),
  durationMinutes: z.number().int().min(1).max(480),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional()
});

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!checkRateLimit(ip, 5)) {
    return NextResponse.json(
      { error: 'Too many booking attempts. Please try again later.' },
      { status: 429 }
    );
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

  const { clinicId, providerId, serviceType, scheduledTime, durationMinutes, firstName, lastName, email, phone } =
    parsed.data;

  try {
    const client = getServiceSupabaseClient();

    const { data: provider } = await client
      .from('providers')
      .select('clinic_id')
      .eq('id', providerId)
      .maybeSingle();

    if (!provider) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    if (provider.clinic_id !== clinicId) {
      return NextResponse.json({ error: 'Provider does not belong to this clinic' }, { status: 403 });
    }

    const patient = await findOrCreatePatient({ clinicId, email, phone, firstName, lastName }, client);

    const appointment = await createAppointment(
      { clinicId, patientId: patient.id, providerId, serviceType, scheduledTime, durationMinutes },
      client
    );

    return NextResponse.json({ patient, appointment });
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { op: 'booking.confirm', clinicId, providerId });
    return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 });
  }
}
