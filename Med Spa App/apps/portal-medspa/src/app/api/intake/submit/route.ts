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
  // Consent is mandatory: an intake submission records a signed consent, so
  // accepting false let callers create rows without consenting. Status is set
  // to 'completed' only when this is true (see submitIntake).
  signedConsent: z.literal(true),
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

  // Public endpoint — writes under the service role (bypasses RLS), so every
  // client-supplied reference MUST be verified against clinicId here.
  const client = getServiceSupabaseClient();
  const { data: clinic } = await client
    .from('clinics')
    .select('id')
    .eq('id', clinicId)
    .maybeSingle();

  if (!clinic) {
    return NextResponse.json({ error: 'Invalid clinic' }, { status: 400 });
  }

  // Ownership: the form template must belong to this clinic.
  const { data: form } = await client
    .from('intake_forms')
    .select('id')
    .eq('id', formId)
    .eq('clinic_id', clinicId)
    .maybeSingle();

  if (!form) {
    return NextResponse.json({ error: 'Invalid form for this clinic' }, { status: 400 });
  }

  // Ownership: if an appointment context is supplied, it must belong to this clinic.
  if (appointmentId) {
    const { data: appointment } = await client
      .from('appointments')
      .select('id')
      .eq('id', appointmentId)
      .eq('clinic_id', clinicId)
      .maybeSingle();

    if (!appointment) {
      return NextResponse.json({ error: 'Invalid appointment for this clinic' }, { status: 400 });
    }
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
