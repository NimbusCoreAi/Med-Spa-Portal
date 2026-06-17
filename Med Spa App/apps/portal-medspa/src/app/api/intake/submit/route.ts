import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findOrCreatePatient, submitIntake, getServiceSupabaseClient, logError } from '@baseplate/core';
import { checkRateLimit } from '@/lib/request-rate-limit';

const bodySchema = z.object({
  clinicId: z.string().uuid(),
  formId: z.string().min(1),
  appointmentId: z.string().uuid().optional(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  responses: z.record(z.string(), z.unknown()),
  signedConsent: z.boolean(),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip, 10)) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
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

  const { clinicId, formId, appointmentId, firstName, lastName, email, responses, signedConsent } = parsed.data;

  // Verify the clinic exists before using service-role to write to it.
  // Public endpoint — clinic_id comes from the client (QR code / link), must be validated.
  const client = getServiceSupabaseClient();
  const { data: clinic } = await client
    .from('clinics')
    .select('id')
    .eq('id', clinicId)
    .maybeSingle();

  if (!clinic) {
    return NextResponse.json({ error: 'Invalid clinic' }, { status: 400 });
  }

  try {
    const patient = await findOrCreatePatient({ clinicId, email, firstName, lastName }, client);

    const submission = await submitIntake(
      { clinicId, patientId: patient.id, formId, appointmentId, responses, signedConsent },
      client
    );

    return NextResponse.json({ patient, submission });
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { op: 'intake.submit', clinicId });
    return NextResponse.json({ error: 'Failed to submit intake form' }, { status: 500 });
  }
}
