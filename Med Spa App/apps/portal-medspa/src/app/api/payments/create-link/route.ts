import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createPaymentLink } from '@baseplate/stripe';
import { setAppointmentPaymentLink } from '@baseplate/core';
import { getUserContext, createServerSupabaseClient } from '@/lib/supabase/server';

const bodySchema = z.object({
  clinicId: z.string().min(1),
  patientId: z.string().min(1),
  appointmentId: z.string().min(1),
  amount: z.number().min(0).max(10_000_000_000),
  description: z.string().min(1).max(500),
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

  const { clinicId, patientId, appointmentId, amount, description } = parsed.data;

  if (clinicId !== ctx.clinicId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Verify appointment and patient actually belong to this clinic (IDOR guard)
  const supabase = createServerSupabaseClient();
  const { data: appt, error: apptError } = await supabase
    .from('appointments')
    .select('clinic_id, patient_id')
    .eq('id', appointmentId)
    .single();

  if (apptError || !appt) {
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  }

  if (appt.clinic_id !== ctx.clinicId || appt.patient_id !== patientId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const amountCents = amount;
    const link = await createPaymentLink({ clinicId, patientId, appointmentId, amount: amountCents / 100, description });
    const appointment = await setAppointmentPaymentLink(appointmentId, link.url, amountCents);
    return NextResponse.json({ url: link.url, appointment });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 });
  }
}
