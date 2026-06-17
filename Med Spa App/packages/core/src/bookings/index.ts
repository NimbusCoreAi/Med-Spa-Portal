import { SupabaseClient } from '@supabase/supabase-js';
import { findOrCreatePatient } from '../patients';
import { createAppointment } from '../scheduling/appointments';
import { Patient, Appointment } from '../types';

export interface BookAppointmentParams {
  clinicId: string;
  providerId?: string;
  roomId?: string;
  serviceType?: string;
  scheduledTime: string;
  durationMinutes: number;
  patient: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
  };
}

export interface BookAppointmentResult {
  patient: Patient;
  appointment: Appointment;
}

/**
 * Book an appointment in one call: find-or-create patient + create appointment.
 * Used by self-service booking flows.
 */
export async function bookAppointment(
  params: BookAppointmentParams,
  client?: SupabaseClient
): Promise<BookAppointmentResult> {
  const patient = await findOrCreatePatient({
    clinicId: params.clinicId,
    firstName: params.patient.firstName,
    lastName: params.patient.lastName,
    email: params.patient.email,
    phone: params.patient.phone,
  }, client);

  const appointment = await createAppointment({
    clinicId: params.clinicId,
    patientId: patient.id,
    providerId: params.providerId,
    roomId: params.roomId,
    serviceType: params.serviceType,
    scheduledTime: params.scheduledTime,
    durationMinutes: params.durationMinutes,
  }, client);

  return { patient, appointment };
}
