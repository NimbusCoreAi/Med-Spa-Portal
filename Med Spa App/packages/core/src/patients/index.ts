import { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';
import { Patient } from '../types';

export interface FindOrCreatePatientParams {
  clinicId: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
}

export async function findOrCreatePatient(params: FindOrCreatePatientParams, client?: SupabaseClient): Promise<Patient> {
  const supabase = client ?? getAnonSupabaseClient();

  // Atomic upsert on (clinic_id, lower(email)) unique index (created in 0020).
  // Eliminates the SELECT-then-INSERT race where two concurrent requests both
  // see no existing patient and both insert, creating duplicate rows.
  if (params.email) {
    const { data, error } = await supabase
      .from('patients')
      .upsert(
        {
          clinic_id: params.clinicId,
          email: params.email,
          phone: params.phone,
          first_name: params.firstName,
          last_name: params.lastName,
        },
        {
          onConflict: 'clinic_id,email',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) throw new Error(`findOrCreatePatient failed: ${error.message}`);
    return data as Patient;
  }

  // No email — fall back to plain insert (phone-only patients have no unique constraint)
  const { data, error } = await supabase
    .from('patients')
    .insert({
      clinic_id: params.clinicId,
      email: params.email,
      phone: params.phone,
      first_name: params.firstName,
      last_name: params.lastName,
    })
    .select()
    .single();

  if (error) throw new Error(`Create patient failed: ${error.message}`);
  return data as Patient;
}

export async function getPatients(
  clinicId: string,
  opts: { limit?: number; offset?: number } = {},
  client?: SupabaseClient
): Promise<{ patients: Patient[]; total: number }> {
  const supabase = client ?? getAnonSupabaseClient();
  const limit = Math.min(opts.limit ?? 50, 200);
  const offset = opts.offset ?? 0;

  const { data, error, count } = await supabase
    .from('patients')
    .select('id, first_name, last_name, email, phone, created_at', { count: 'exact' })
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`Fetch patients failed: ${error.message}`);
  return { patients: (data ?? []) as Patient[], total: count ?? 0 };
}
