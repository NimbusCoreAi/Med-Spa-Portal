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
  // ⚠️ TEMP: bypass RLS for testing. To restore, delete the line below and
  // uncomment the code at the bottom of this file (RESTORE_COOKIE_CLIENT).
  return getServiceSupabaseClient();
}

// Fixed UUID for the dev-bypass clinic so all requests share the same data.
const DEV_CLINIC_ID = '00000000-0000-0000-0000-000000000001';

/**
 * DEV-ONLY auth bypass. Seeds a dev clinic (if none exists) and returns an
 * owner context without requiring a real Supabase Auth session.
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
  // ⚠️ TEMP: auth bypassed for testing. To restore, delete the line below and
  // uncomment the code at the bottom of this file (RESTORE_REAL_AUTH).
  return getDevUserContext();
}

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE_COOKIE_CLIENT — uncomment this block and delete the early return in
// createServerSupabaseClient() above to restore the cookie-based client.
// ─────────────────────────────────────────────────────────────────────────────
// function _createRealCookieClient() {
//   const { url, anonKey } = getSupabaseConfig();
//   const cookieStore = cookies();
//   return createServerClient(url, anonKey, {
//     cookies: {
//       getAll() { return cookieStore.getAll(); },
//       setAll(cookiesToSet) {
//         try {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set(name, value, options)
//           );
//         } catch { /* Server Component — safe to ignore */ }
//       },
//     },
//   });
// }

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE_REAL_AUTH — uncomment this block and delete the early return in
// getUserContext() above to restore real authentication.
// ─────────────────────────────────────────────────────────────────────────────
// async function _realGetUserContext(): Promise<UserContext | null> {
//   const supabase = createServerSupabaseClient();
//   const { data: { user }, error } = await supabase.auth.getUser();
//   if (error || !user) return null;
//   const userId = user.id;
//   const email = user.email ?? '';
//   const { data: staff } = await supabase
//     .from('staff')
//     .select('clinic_id, role')
//     .eq('id', userId)
//     .maybeSingle();
//   if (!staff) return null;
//   return { userId, clinicId: staff.clinic_id, role: staff.role as Role, email };
// }
