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
 * Compute dashboard metrics (revenue, appointment stats, no-show rate,
 * intake completion rate, revenue by provider, service popularity)
 * for a clinic over an optional date range.
 */
export async function getDashboardMetrics(params: GetDashboardMetricsParams, client?: SupabaseClient): Promise<DashboardMetrics> {
  const supabase = client ?? getAnonSupabaseClient();

  let appointmentsQuery = supabase.from('appointments').select('*').eq('clinic_id', params.clinicId);
  if (params.from) appointmentsQuery = appointmentsQuery.gte('scheduled_time', params.from);
  if (params.to) appointmentsQuery = appointmentsQuery.lte('scheduled_time', params.to);

  const { data: appointments, error: appointmentsError } = await appointmentsQuery;
  if (appointmentsError) throw new Error(`Fetch appointments failed: ${appointmentsError.message}`);

  const { data: providers, error: providersError } = await supabase
    .from('providers')
    .select('id, name')
    .eq('clinic_id', params.clinicId);
  if (providersError) throw new Error(`Fetch providers failed: ${providersError.message}`);

  const rows = appointments ?? [];

  const appointmentCounts = {
    scheduled: rows.filter((a) => a.status === 'scheduled').length,
    completed: rows.filter((a) => a.status === 'completed').length,
    cancelled: rows.filter((a) => a.status === 'cancelled').length
  };

  const totalRevenue = rows
    .filter((a) => a.payment_status === 'completed')
    .reduce((sum, a) => sum + Number(a.amount ?? 0), 0);

  const completedAppointments = rows.filter((a) => a.status === 'completed');
  const noShows = rows.filter((a) => a.status === 'cancelled' && !a.intake_completed).length;
  const noShowRate = completedAppointments.length > 0 ? noShows / completedAppointments.length : 0;

  const intakeCompletionRate = rows.length > 0 ? rows.filter((a) => a.intake_completed).length / rows.length : 0;

  const revenueByProviderMap = new Map<string, number>();
  for (const a of rows) {
    if (a.payment_status !== 'completed' || !a.provider_id) continue;
    revenueByProviderMap.set(a.provider_id, (revenueByProviderMap.get(a.provider_id) ?? 0) + Number(a.amount ?? 0));
  }

  const revenueByProvider = (providers ?? [])
    .map((p) => ({
      providerId: p.id as string,
      providerName: p.name as string,
      revenue: revenueByProviderMap.get(p.id as string) ?? 0
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
    totalRevenue,
    appointmentCounts,
    noShowRate,
    intakeCompletionRate,
    revenueByProvider,
    servicePopularity
  };
}
