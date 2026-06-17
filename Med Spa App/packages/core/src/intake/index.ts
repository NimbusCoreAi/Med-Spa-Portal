import { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';
import { IntakeForm, IntakeFormField, IntakeSubmission, IntakeStatus } from '../types';

export type { IntakeForm, IntakeFormField, IntakeSubmission, IntakeStatus };

export interface CreateIntakeFormParams {
  clinicId: string;
  name: string;
  fields: IntakeFormField[];
}

/**
 * Create a new intake form template for a clinic.
 */
export async function createIntakeForm(params: CreateIntakeFormParams, client?: SupabaseClient): Promise<IntakeForm> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('intake_forms')
    .insert({
      clinic_id: params.clinicId,
      name: params.name,
      fields: params.fields
    })
    .select()
    .single();

  if (error) throw new Error(`Create intake form failed: ${error.message}`);
  return data as IntakeForm;
}

/**
 * List all intake form templates for a clinic.
 */
export async function getIntakeForms(clinicId: string, client?: SupabaseClient): Promise<IntakeForm[]> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('intake_forms')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Fetch intake forms failed: ${error.message}`);
  return (data ?? []) as IntakeForm[];
}

/**
 * Fetch a single intake form template by id.
 */
export async function getIntakeForm(formId: string, client?: SupabaseClient): Promise<IntakeForm> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('intake_forms')
    .select('*')
    .eq('id', formId)
    .single();

  if (error) throw new Error(`Fetch intake form failed: ${error.message}`);
  return data as IntakeForm;
}

/**
 * Update an intake form template's fields/name.
 */
export async function updateIntakeForm(
  formId: string,
  updates: Partial<Pick<IntakeForm, 'name' | 'fields'>>,
  client?: SupabaseClient
): Promise<IntakeForm> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('intake_forms')
    .update(updates)
    .eq('id', formId)
    .select()
    .single();

  if (error) throw new Error(`Update intake form failed: ${error.message}`);
  return data as IntakeForm;
}

export interface SubmitIntakeParams {
  clinicId: string;
  patientId: string;
  formId: string;
  appointmentId?: string;
  responses: Record<string, unknown>;
  signedConsent: boolean;
}

/**
 * Submit a patient's intake responses, including digital consent signature.
 */
export async function submitIntake(params: SubmitIntakeParams, client?: SupabaseClient): Promise<IntakeSubmission> {
  const supabase = client ?? getAnonSupabaseClient();

  const status: IntakeStatus = params.signedConsent ? 'completed' : 'in_progress';

  const { data, error } = await supabase
    .from('intake_submissions')
    .insert({
      clinic_id: params.clinicId,
      patient_id: params.patientId,
      form_id: params.formId,
      appointment_id: params.appointmentId,
      responses: params.responses,
      signed_consent: params.signedConsent,
      signed_at: params.signedConsent ? new Date().toISOString() : null,
      status
    })
    .select()
    .single();

  if (error) throw new Error(`Submit intake failed: ${error.message}`);
  return data as IntakeSubmission;
}

/**
 * List intake submissions for a clinic, most recent first.
 */
export async function getIntakeSubmissions(clinicId: string, client?: SupabaseClient): Promise<IntakeSubmission[]> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('intake_submissions')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Fetch intake submissions failed: ${error.message}`);
  return (data ?? []) as IntakeSubmission[];
}

/**
 * Get the intake status for a specific appointment (for staff dashboards).
 * Returns 'not_started' if no submission exists yet.
 */
export async function getIntakeStatusForAppointment(appointmentId: string, client?: SupabaseClient): Promise<IntakeStatus> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('intake_submissions')
    .select('status')
    .eq('appointment_id', appointmentId)
    .maybeSingle();

  if (error) throw new Error(`Fetch intake status failed: ${error.message}`);
  return (data?.status as IntakeStatus | undefined) ?? 'not_started';
}
