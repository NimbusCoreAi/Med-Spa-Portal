import { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';
import { Clinic } from '../types';

/**
 * Fetch a single clinic by id.
 */
export async function getClinic(clinicId: string, client?: SupabaseClient): Promise<Clinic> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase.from('clinics').select('*').eq('id', clinicId).single();

  if (error) throw new Error(`Fetch clinic failed: ${error.message}`);
  return data as Clinic;
}
