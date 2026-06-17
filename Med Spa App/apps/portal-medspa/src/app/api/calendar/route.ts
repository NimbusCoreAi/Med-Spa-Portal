import { NextRequest, NextResponse } from 'next/server';
import { getAppointments, getProviders, getRooms } from '@baseplate/core/scheduling';
import { getPatients } from '@baseplate/core/patients';
import { getUserContext, createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const from = url.searchParams.get('from') ?? undefined;
  const to = url.searchParams.get('to') ?? undefined;

  try {
    const client = createServerSupabaseClient();
    const [appointments, providers, rooms, patients] = await Promise.all([
      getAppointments({ clinicId: ctx.clinicId, from, to }, client),
      getProviders(ctx.clinicId, client),
      getRooms(ctx.clinicId, client),
      getPatients(ctx.clinicId, {}, client)
    ]);

    return NextResponse.json({
      appointments,
      providers,
      rooms,
      patients: patients.patients
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load calendar data' }, { status: 500 });
  }
}
