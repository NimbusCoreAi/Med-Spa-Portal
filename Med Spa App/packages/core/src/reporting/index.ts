import { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';

export interface DashboardMetrics {
  totalRevenue: number;
  appointmentCounts: {
    scheduled: number;
    completed: number;
    cancelled: number;
  };
  noShowRate: number;
  intakeCompletionRate: number;
  revenueByProvider: { providerId: string; providerName: string; revenue: number }[];
  servicePopularity: { serviceType: string; count: number }[];
}

export interface GetDashboardMetricsParams {
  clinicId: string;
  from?: string;
  to?: string;
}

/**
 * Compute dashboard metrics for a clinic over an optional date range.
 *
 * Revenue is sourced from the canonical `payments` ledger (amount_cents,
 * status = 'completed'), divided by 100 to dollars — the same source the
 * dashboard route and intelligence rules use. The legacy `appointments.amount`
 * column is NOT used for revenue: migration 0024 changed it to integer cents
 * without renaming it, so summing it as dollars inflated revenue 100x.
 */
export async function getDashboardMetrics(params: GetDashboardMetricsParams, client?: SupabaseClient): Promise<DashboardMetrics> {
  const supabase = client ?? getAnonSupabaseClient();

  // Appointments feed the non-revenue metrics (counts, no-show, intake, service
  // popularity, and the appointment_id -> provider_id map for revenue attribution).
  let appointmentsQuery = supabase
    .from('appointments')
    .select('id, status, provider_id, service_type, intake_completed, scheduled_time')
    .eq('clinic_id', params.clinicId);
  if (params.from) appointmentsQuery = appointmentsQuery.gte('scheduled_time', params.from);
  if (params.to) appointmentsQuery = appointmentsQuery.lte('scheduled_time', params.to);

  const { data: appointments, error: appointmentsError } = await appointmentsQuery;
  if (appointmentsError) throw new Error(`Fetch appointments failed: ${appointmentsError.message}`);

  const { data: providers, error: providersError } = await supabase
    .from('providers')
    .select('id, name')
    .eq('clinic_id', params.clinicId);
  if (providersError) throw new Error(`Fetch providers failed: ${providersError.message}`);

  // Canonical revenue ledger. Date range filters mirror the appointments window
  // using payments.created_at (the dashboard route uses the same column).
  let paymentsQuery = supabase
    .from('payments')
    .select('amount_cents, appointment_id, status, created_at')
    .eq('clinic_id', params.clinicId);
  if (params.from) paymentsQuery = paymentsQuery.gte('created_at', params.from);
  if (params.to) paymentsQuery = paymentsQuery.lte('created_at', params.to);

  const { data: payments, error: paymentsError } = await paymentsQuery;
  if (paymentsError) throw new Error(`Fetch payments failed: ${paymentsError.message}`);

  const rows = appointments ?? [];

  const appointmentCounts = {
    scheduled: rows.filter((a) => a.status === 'scheduled').length,
    completed: rows.filter((a) => a.status === 'completed').length,
    cancelled: rows.filter((a) => a.status === 'cancelled').length
  };

  const completedAppointments = rows.filter((a) => a.status === 'completed');
  const noShows = rows.filter((a) => a.status === 'cancelled' && !a.intake_completed).length;
  const noShowRate = completedAppointments.length > 0 ? noShows / completedAppointments.length : 0;

  const intakeCompletionRate = rows.length > 0 ? rows.filter((a) => a.intake_completed).length / rows.length : 0;

  // Revenue from payments, attributed to providers via the appointment map.
  const providerByAppointment = new Map<string, string>();
  for (const a of rows) {
    if (a.id && a.provider_id) providerByAppointment.set(a.id, a.provider_id as string);
  }

  const totalRevenueCents = (payments ?? [])
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount_cents ?? 0), 0);

  const revenueByProviderCents = new Map<string, number>();
  for (const p of payments ?? []) {
    if (p.status !== 'completed') continue;
    const appointmentId = p.appointment_id as string | null;
    if (!appointmentId) continue;
    const providerId = providerByAppointment.get(appointmentId);
    if (!providerId) continue;
    revenueByProviderCents.set(providerId, (revenueByProviderCents.get(providerId) ?? 0) + Number(p.amount_cents ?? 0));
  }

  const revenueByProvider = (providers ?? [])
    .map((p) => ({
      providerId: p.id as string,
      providerName: p.name as string,
      revenue: (revenueByProviderCents.get(p.id as string) ?? 0) / 100
    }))
    .filter((p) => p.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue);

  const serviceCounts = new Map<string, number>();
  for (const a of rows) {
    const serviceType = (a.service_type as string) || 'Unspecified';
    serviceCounts.set(serviceType, (serviceCounts.get(serviceType) ?? 0) + 1);
  }

  const servicePopularity = Array.from(serviceCounts.entries())
    .map(([serviceType, count]) => ({ serviceType, count }))
    .sort((a, b) => b.count - a.count);

  return {
    totalRevenue: totalRevenueCents / 100,
    appointmentCounts,
    noShowRate,
    intakeCompletionRate,
    revenueByProvider,
    servicePopularity
  };
}
