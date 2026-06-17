import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration: set SUPABASE_URL/SUPABASE_ANON_KEY (server) ' +
        'or NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY (client)'
    );
  }

  return { url, anonKey };
}

export interface SupabaseServiceConfig {
  url: string;
  serviceRoleKey: string;
}

/**
 * Service-role Supabase configuration. This bypasses Row Level Security and
 * must only be used in server-side code (API routes, webhooks) - never sent
 * to the client.
 */
export function getSupabaseServiceConfig(): SupabaseServiceConfig {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase configuration: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server only)');
  }

  return { url, serviceRoleKey };
}

/**
 * Supabase client authenticated with the anon key (subject to RLS).
 * This is the default client used by core modules.
 */
export function getAnonSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey);
}

/**
 * Supabase client authenticated with the service-role key (bypasses RLS).
 * Only construct this in server-side code (API routes, webhooks).
 */
export function getServiceSupabaseClient(): SupabaseClient {
  const { url, serviceRoleKey } = getSupabaseServiceConfig();
  return createClient(url, serviceRoleKey);
}

/**
 * Feature flag: When true, PHI (Protected Health Information) field types
 * are available in the intake form builder. Requires BAA with infrastructure
 * providers before enabling. See docs/HIPAA_COMPLIANCE.md.
 */
export function isPhiEnabled(): boolean {
  return process.env.PHI_ENABLED === 'true';
}
