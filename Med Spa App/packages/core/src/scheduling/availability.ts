import { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export interface GetAvailableSlotsParams {
  providerId: string;
  date: string;
  durationMinutes: number;
}

export async function getAvailableSlots(params: GetAvailableSlotsParams, client?: SupabaseClient): Promise<string[]> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select('availability')
    .eq('id', params.providerId)
    .single();

  if (providerError) throw new Error(`Fetch provider availability failed: ${providerError.message}`);

  const availability = (provider?.availability ?? {}) as Record<string, string[]>;
  const dayName = DAY_NAMES[new Date(`${params.date}T00:00:00Z`).getUTCDay()];
  const ranges = availability[dayName] ?? [];

  if (ranges.length === 0) return [];

  const dayStart = new Date(`${params.date}T00:00:00.000Z`);
  const dayEnd = new Date(`${params.date}T23:59:59.999Z`);

  const { data: existing, error: appointmentsError } = await supabase
    .from('appointments')
    .select('scheduled_time, duration_minutes')
    .eq('provider_id', params.providerId)
    .neq('status', 'cancelled')
    .gte('scheduled_time', dayStart.toISOString())
    .lte('scheduled_time', dayEnd.toISOString());

  if (appointmentsError) throw new Error(`Fetch existing appointments failed: ${appointmentsError.message}`);

  const booked = (existing ?? []).map((appt) => {
    const start = new Date(appt.scheduled_time as string).getTime();
    const end = start + (appt.duration_minutes as number) * 60_000;
    return { start, end };
  });

  const slotMs = params.durationMinutes * 60_000;
  const slots: string[] = [];

  for (const range of ranges) {
    const [startTime, endTime] = range.split('-');
    const rangeStart = new Date(`${params.date}T${startTime}:00.000Z`).getTime();
    const rangeEnd = new Date(`${params.date}T${endTime}:00.000Z`).getTime();

    for (let slotStart = rangeStart; slotStart + slotMs <= rangeEnd; slotStart += slotMs) {
      const slotEnd = slotStart + slotMs;
      const hasConflict = booked.some((b) => slotStart < b.end && slotEnd > b.start);
      if (!hasConflict) {
        slots.push(new Date(slotStart).toISOString());
      }
    }
  }

  return slots;
}
