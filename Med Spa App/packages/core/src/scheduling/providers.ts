import { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';
import { Provider } from '../types';

export interface CreateProviderParams {
  clinicId: string;
  name: string;
  specialties?: string[];
  availability?: Record<string, string[]>;
}

export async function createProvider(params: CreateProviderParams, client?: SupabaseClient): Promise<Provider> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('providers')
    .insert({
      clinic_id: params.clinicId,
      name: params.name,
      specialties: params.specialties ?? [],
      availability: params.availability ?? {}
    })
    .select()
    .single();

  if (error) throw new Error(`Create provider failed: ${error.message}`);
  return data as Provider;
}

export async function getProviders(clinicId: string, client?: SupabaseClient): Promise<Provider[]> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('providers')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('name', { ascending: true });

  if (error) throw new Error(`Fetch providers failed: ${error.message}`);
  return (data ?? []) as Provider[];
}
