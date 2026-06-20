import { getServiceSupabaseClient } from '@baseplate/core/config';
import type { UserContext } from '@baseplate/core';
import type { Role } from '@baseplate/core';

const DEV_CLINIC_ID = '00000000-0000-0000-0000-000000000001';

/**
 * DEV-ONLY auth bypass. Returns a hardcoded owner context without any DB
 * calls so it works even if Supabase is unreachable. Attempts to seed a
 * dev clinic in the background (best-effort, errors ignored).
 */
async function getDevUserContext(): Promise<UserContext> {
  // Best-effort clinic seed — don't block or throw if it fails
  try {
    const supabase = getServiceSupabaseClient();
    const { data: existing } = await supabase
      .from('clinics')
      .select('id')
      .eq('id', DEV_CLINIC_ID)
      .maybeSingle();

    if (!existing) {
      await supabase
        .from('clinics')
        .insert({ id: DEV_CLINIC_ID, name: 'Dev Test Clinic', location: 'Local' });
    }
  } catch {
    // Ignore — DB might not be reachable yet; the hardcoded context still works
  }

  return {
    userId: 'dev-bypass-user',
    clinicId: DEV_CLINIC_ID,
    role: 'owner' as Role,
    email: 'dev@bypass.local',
  };
}

/**
 * Create a Supabase client for server-side code.
 * TEMP: uses service-role client to bypass RLS in dev-bypass mode.
 */
export function createServerSupabaseClient() {
  // ⚠️ TEMP: bypass RLS for testing. To restore, delete the line below and
  // use the cookie-based client (see RESTORE_COOKIE_CLIENT at bottom).
  try {
    return getServiceSupabaseClient();
  } catch {
    // If service key is missing, fall back to anon client (RLS will apply)
    return _createAnonClient();
  }
}

function _createAnonClient() {
  // Late import to avoid circular deps
  const { createServerClient } = require('@supabase/ssr');
  const { getSupabaseConfig } = require('@baseplate/core/config');
  const { cookies: getCookies } = require('next/headers');
  const { url, anonKey } = getSupabaseConfig();
  const cookieStore = getCookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
}

/**
 * Get the current user's context.
 * TEMP: returns hardcoded dev context. To restore, use RESTORE_REAL_AUTH.
 */
export async function getUserContext(): Promise<UserContext | null> {
  // ⚠️ TEMP: auth bypassed for testing. Remove this return to restore real auth.
  return getDevUserContext();
}

// ─────────────────────────────────────────────────────────────────────────────
// RESTORE_REAL_AUTH — to restore real authentication:
// 1. Delete the early return in getUserContext() above
// 2. Uncomment the function below
// 3. Restore the cookie client in createServerSupabaseClient()
// 4. Restore middleware.ts from git history
// 5. Restore page.tsx root from git history
// ─────────────────────────────────────────────────────────────────────────────
// async function _realGetUserContext(): Promise<UserContext | null> {
//   const supabase = createServerSupabaseClient();
//   const { data: { user }, error } = await supabase.auth.getUser();
//   if (error || !user) return null;
//   const { data: staff } = await supabase
//     .from('staff')
//     .select('clinic_id, role')
//     .eq('id', user.id)
//     .maybeSingle();
//   if (!staff) return null;
//   return {
//     userId: user.id,
//     clinicId: staff.clinic_id,
//     role: staff.role as Role,
//     email: user.email ?? '',
//   };
// }
