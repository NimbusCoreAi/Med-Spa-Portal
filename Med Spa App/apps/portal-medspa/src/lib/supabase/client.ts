import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseConfig } from '@baseplate/core/config';

export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
