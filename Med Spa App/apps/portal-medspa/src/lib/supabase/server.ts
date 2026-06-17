import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig } from '@baseplate/core/config';
import type { UserContext } from '@baseplate/core';
import type { Role } from '@baseplate/core';

/**
 * Create a cookie-aware Supabase client for server-side code
 * (server components, API routes, middleware).
 */
export function createServerSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing sessions.
        }
      },
    },
  });
}

/**
 * Get the current user's context (userId, clinicId, role, email) from the session.
 * Returns null if not authenticated.
 */
export async function getUserContext(): Promise<UserContext | null> {
  const supabase = createServerSupabaseClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const userId = session.user.id;
  const email = session.user.email ?? '';

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id, role')
    .eq('id', userId)
    .maybeSingle();

  if (!staff) return null;

  return {
    userId,
    clinicId: staff.clinic_id,
    role: staff.role as Role,
    email,
  };
}
