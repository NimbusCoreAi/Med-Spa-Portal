export const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const;

/**
 * Returns the list of required environment variables that are NOT set.
 * Empty array = all good.
 *
 * Works in both server components (full access) and middleware (NEXT_PUBLIC_ only).
 * In middleware, pass `edgeSafe=true` to only check NEXT_PUBLIC_ vars (the only
 * ones available in the Edge runtime).
 */
export function getMissingRequiredEnv(edgeSafe = false): string[] {
  const vars = edgeSafe
    ? REQUIRED_ENV_VARS.filter((v) => v.startsWith('NEXT_PUBLIC_'))
    : REQUIRED_ENV_VARS;
  return vars.filter((v) => !process.env[v] || process.env[v] === 'your-anon-key');
}

/**
 * True when every required env var is present.
 */
export function hasRequiredEnv(edgeSafe = false): boolean {
  return getMissingRequiredEnv(edgeSafe).length === 0;
}
