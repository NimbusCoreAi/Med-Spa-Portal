import { getServiceSupabaseClient } from '@baseplate/core/config';

export async function logApiUsage(params: {
  clinicId?: string;
  endpoint: string;
  statusCode: number;
  responseTimeMs?: number;
}): Promise<void> {
  try {
    const supabase = getServiceSupabaseClient();
    await supabase.from('api_usage').insert({
      clinic_id: params.clinicId ?? null,
      endpoint: params.endpoint,
      status_code: params.statusCode,
      response_time_ms: params.responseTimeMs ?? null,
    });
  } catch {
    // Usage logging is best-effort — never block on it
  }
}
