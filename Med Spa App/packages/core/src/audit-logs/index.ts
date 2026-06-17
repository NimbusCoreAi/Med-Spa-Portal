import { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';

export interface LogActionParams {
  clinicId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Record an action in the compliance audit log.
 */
export async function logAction(params: LogActionParams, client?: SupabaseClient) {
  const supabase = client ?? getAnonSupabaseClient();

  const { error } = await supabase.from('audit_logs').insert({
    clinic_id: params.clinicId,
    user_id: params.userId,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId,
    ip_address: params.ipAddress,
    user_agent: params.userAgent,
    timestamp: new Date().toISOString()
  });

  if (error) throw new Error(`Audit log failed: ${error.message}`);
}

/**
 * Retrieve audit logs for a clinic, most recent first.
 */
export async function getAuditLogs(clinicId: string, client?: SupabaseClient) {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('timestamp', { ascending: false });

  if (error) throw new Error(`Fetch audit logs failed: ${error.message}`);
  return data;
}
