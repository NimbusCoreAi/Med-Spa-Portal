import { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';
import { Appointment, AppointmentStatus, PaymentStatus } from '../types';

export interface CreateAppointmentParams {
  clinicId: string;
  patientId: string;
  providerId?: string;
  roomId?: string;
  serviceType?: string;
  scheduledTime: string;
  durationMinutes: number;
}

export async function createAppointment(params: CreateAppointmentParams, client?: SupabaseClient): Promise<Appointment> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      clinic_id: params.clinicId,
      patient_id: params.patientId,
      provider_id: params.providerId,
      room_id: params.roomId,
      service_type: params.serviceType,
      scheduled_time: params.scheduledTime,
      duration_minutes: params.durationMinutes,
      status: 'scheduled'
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23P01') {
      const msg = error.message.includes('no_room_conflicts')
        ? 'Create appointment failed: room is already booked for this time slot'
        : 'Create appointment failed: provider is already booked for this time slot';
      throw new Error(msg);
    }
    throw new Error(`Create appointment failed: ${error.message}`);
  }

  return data as Appointment;
}

export interface GetAppointmentsParams {
  clinicId: string;
  from?: string;
  to?: string;
}

export async function getAppointments(params: GetAppointmentsParams, client?: SupabaseClient): Promise<Appointment[]> {
  const supabase = client ?? getAnonSupabaseClient();

  let query = supabase.from('appointments').select('*').eq('clinic_id', params.clinicId);

  if (params.from) query = query.gte('scheduled_time', params.from);
  if (params.to) query = query.lte('scheduled_time', params.to);

  const { data, error } = await query.order('scheduled_time', { ascending: true });

  if (error) throw new Error(`Fetch appointments failed: ${error.message}`);
  return (data ?? []) as Appointment[];
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  client?: SupabaseClient
): Promise<Appointment> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) throw new Error(`Update appointment status failed: ${error.message}`);
  return data as Appointment;
}

export async function setAppointmentPaymentLink(
  appointmentId: string,
  paymentLinkUrl: string,
  amount?: number,
  client?: SupabaseClient
): Promise<Appointment> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('appointments')
    .update({ payment_link_url: paymentLinkUrl, ...(amount !== undefined ? { amount } : {}) })
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) throw new Error(`Set appointment payment link failed: ${error.message}`);
  return data as Appointment;
}

export async function updateAppointmentPaymentStatus(
  appointmentId: string,
  paymentStatus: PaymentStatus,
  client?: SupabaseClient
): Promise<Appointment> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('appointments')
    .update({
      payment_status: paymentStatus,
      payment_completed: paymentStatus === 'completed',
      payment_completed_at: paymentStatus === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', appointmentId)
    .neq('payment_status', 'completed') // never regress a completed payment
    .select()
    .single();

  if (error) throw new Error(`Update appointment payment status failed: ${error.message}`);
  return data as Appointment;
}
