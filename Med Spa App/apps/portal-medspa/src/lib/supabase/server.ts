import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseConfig, getServiceSupabaseClient } from '@baseplate/core/config';
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

// Fixed UUID for the dev-bypass clinic so all requests share the same data.
const DEV_CLINIC_ID = '00000000-0000-0000-0000-000000000001';

/**
 * DEV-ONLY auth bypass. When DEV_AUTH_BYPASS=true is set in the environment,
 * this seeds a dev clinic (if none exists) and returns an owner context
 * without requiring a real Supabase Auth session. Lets you test the full app
 * without signing up / logging in. NEVER enable in production.
 */
async function getDevUserContext(): Promise<UserContext> {
  const supabase = getServiceSupabaseClient();

  const { data: existing } = await supabase
    .from('clinics')
    .select('id')
    .eq('id', DEV_CLINIC_ID)
    .maybeSingle();

  if (!existing) {
    await supabase.from('clinics').insert({
      id: DEV_CLINIC_ID,
      name: 'Dev Test Clinic',
      location: 'Local',
    });
  }

  return {
    userId: 'dev-bypass-user',
    clinicId: DEV_CLINIC_ID,
    role: 'owner' as Role,
    email: 'dev@bypass.local',
  };
}

/**
 * Get the current user's context (userId, clinicId, role, email) from the session.
 * Returns null if not authenticated.
 */
export async function getUserContext(): Promise<UserContext | null> {
  if (process.env.DEV_AUTH_BYPASS === 'true') {
    return getDevUserContext();
  }

  const supabase = createServerSupabaseClient();

  // getUser() revalidates the JWT against the auth server on every call,
  // whereas getSession() only parses the cookie. Revoked/disabled users stay
  // valid under getSession() until token expiry. This helper backs every
  // protected API route, so the server-validated path is required here.
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const userId = user.id;
  const email = user.email ?? '';

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
