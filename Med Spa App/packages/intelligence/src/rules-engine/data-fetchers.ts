import type { SupabaseClient } from '@supabase/supabase-js';
import type { RuleContext, AppointmentData, PaymentData, PackageData, AuditLogData } from '../types';

const LOOKBACK_DAYS = 180;
const LOOKBACK_MS = LOOKBACK_DAYS * 24 * 60 * 60 * 1000;

export async function buildRuleContext(
  tenantId: string,
  customerId: string | undefined,
  client: SupabaseClient
): Promise<RuleContext> {
  const since = new Date(Date.now() - LOOKBACK_MS).toISOString();

  const [apptRes, paymentRes, pkgRes, logRes] = await Promise.all([
    client
      .from('appointments')
      .select('id, patient_id, status, scheduled_time, service_type, amount, payment_status, intake_completed')
      .eq('clinic_id', tenantId)
      .gte('scheduled_time', since),
    client
      .from('payments')
      .select('id, patient_id, amount, created_at, status')
      .eq('clinic_id', tenantId)
      .gte('created_at', since),
    client
      .from('credit_packages')
      .select('id, patient_id, remaining_sessions, total_sessions, expires_at, created_at')
      .eq('clinic_id', tenantId),
    client
      .from('audit_logs')
      .select('id, user_id, action, created_at')
      .eq('clinic_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  const appointments = (apptRes.data ?? []) as AppointmentData[];
  const payments = (paymentRes.data ?? []) as PaymentData[];
  const packages = (pkgRes.data ?? []) as PackageData[];
  const auditLogs = (logRes.data ?? []) as AuditLogData[];

  return {
    tenantId,
    customerId,
    appointments,
    payments,
    packages,
    auditLogs,
  };
}
