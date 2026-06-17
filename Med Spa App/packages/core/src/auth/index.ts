import { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';
import { LoginParams, SignUpParams } from './types';

export type { LoginParams, SignUpParams };

/**
 * Log in a user with email and password.
 */
export async function login(params: LoginParams, client?: SupabaseClient) {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: params.email,
    password: params.password
  });

  if (error) throw new Error(`Login failed: ${error.message}`);
  return data;
}

/**
 * Sign up a new user, create their clinic, and create their owner staff record.
 * The staff record is required for RBAC — middleware checks staff.id = session.user.id
 * with role === 'owner' to gate protected pages (audit logs, etc.).
 */
export async function signUp(params: SignUpParams, client?: SupabaseClient) {
  const supabase = client ?? getAnonSupabaseClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: params.email,
    password: params.password
  });

  if (authError) throw new Error(`Signup failed: ${authError.message}`);
  if (!authData.user) throw new Error('Signup failed: no user returned');

  const { data: clinicData, error: clinicError } = await supabase
    .from('clinics')
    .insert({
      owner_id: authData.user.id,
      name: params.clinic_name,
      location: params.clinic_location
    })
    .select()
    .single();

  if (clinicError) throw new Error(`Clinic creation failed: ${clinicError.message}`);

  const { error: staffError } = await supabase.from('staff').insert({
    id: authData.user.id,
    clinic_id: clinicData.id,
    email: params.email,
    role: 'owner'
  });

  if (staffError) throw new Error(`Staff creation failed: ${staffError.message}`);

  return { user: authData.user, clinic: clinicData };
}

/**
 * Log out the current user.
 */
export async function logout(client?: SupabaseClient) {
  const supabase = client ?? getAnonSupabaseClient();

  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(`Logout failed: ${error.message}`);
}
