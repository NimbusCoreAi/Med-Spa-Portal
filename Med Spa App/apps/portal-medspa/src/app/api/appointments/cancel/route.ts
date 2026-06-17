import { NextRequest, NextResponse } from 'next/server';
import { updateAppointmentStatus } from '@baseplate/core/scheduling';
import { getUserContext, createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { appointmentId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (!body.appointmentId) {
    return NextResponse.json({ error: 'Appointment ID is required' }, { status: 400 });
  }

  try {
    const supabase = createServerSupabaseClient();

    const { data: appt, error: apptError } = await supabase
      .from('appointments')
      .select('clinic_id, status')
      .eq('id', body.appointmentId)
      .single();

    if (apptError || !appt) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (appt.clinic_id !== ctx.clinicId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (appt.status === 'cancelled') {
      return NextResponse.json({ error: 'Appointment is already cancelled' }, { status: 409 });
    }

    const updated = await updateAppointmentStatus(body.appointmentId, 'cancelled', supabase);
    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 });
  }
}
