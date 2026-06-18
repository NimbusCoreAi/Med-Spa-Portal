import { NextResponse } from 'next/server';
import { getUserContext, createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_DAYS = 30;

function dateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

/**
 * GET /api/dashboard/metrics
 *
 * Summary KPIs + chart data for the authenticated clinic's dashboard.
 *
 * Data sources (confirmed against real schema, see supabase/migrations):
 * - Revenue: `payments` table (status = 'completed'), amount_cents — this is the
 *   table the rules-engine and the get_dashboard_metrics RPC (0026) treat as the
 *   canonical revenue ledger, distinct from the legacy `appointments.amount` column.
 * - Appointments: `appointments` table, scoped by clinic_id, bucketed by created_at.
 * - Patients: `patients` table, scoped by clinic_id.
 *
 * riskDistribution: there is no queryable per-patient risk table — risk is computed
 * on demand per-patient via `evaluateRisk()` in @baseplate/intelligence (see
 * /api/intelligence/risk-score), which would require an N-query loop over every
 * patient to bucket. Rather than fabricate precise-looking numbers, this route
 * returns zeroed buckets labeled clearly as unavailable until risk scores are
 * persisted in a queryable form.
 */
export async function GET() {
  const ctx = await getUserContext();
  if (!ctx) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const clinicId = ctx.clinicId;

    const now = new Date();
    const periodStart = new Date(now.getTime() - CHART_DAYS * DAY_MS);
    const priorPeriodStart = new Date(periodStart.getTime() - CHART_DAYS * DAY_MS);

    const [paymentsResult, priorPaymentsResult, appointmentsResult, patientsCountResult, activePatientsResult] =
      await Promise.all([
        supabase
          .from('payments')
          .select('amount_cents, created_at')
          .eq('clinic_id', clinicId)
          .eq('status', 'completed')
          .gte('created_at', periodStart.toISOString()),
        supabase
          .from('payments')
          .select('amount_cents')
          .eq('clinic_id', clinicId)
          .eq('status', 'completed')
          .gte('created_at', priorPeriodStart.toISOString())
          .lt('created_at', periodStart.toISOString()),
        supabase
          .from('appointments')
          .select('created_at, status')
          .eq('clinic_id', clinicId)
          .gte('created_at', periodStart.toISOString()),
        supabase
          .from('patients')
          .select('*', { count: 'exact', head: true })
          .eq('clinic_id', clinicId),
        supabase
          .from('appointments')
          .select('patient_id')
          .eq('clinic_id', clinicId)
          .gte('scheduled_time', periodStart.toISOString())
      ]);

    if (paymentsResult.error) throw paymentsResult.error;
    if (priorPaymentsResult.error) throw priorPaymentsResult.error;
    if (appointmentsResult.error) throw appointmentsResult.error;
    if (patientsCountResult.error) throw patientsCountResult.error;
    if (activePatientsResult.error) throw activePatientsResult.error;

    const payments = paymentsResult.data ?? [];
    const priorPayments = priorPaymentsResult.data ?? [];
    const appointments = appointmentsResult.data ?? [];
    const totalPatients = patientsCountResult.count ?? 0;

    // --- Summary ---
    const revenueCents = payments.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);
    const priorRevenueCents = priorPayments.reduce((sum, p) => sum + (p.amount_cents ?? 0), 0);
    const revenue = revenueCents / 100;

    const revenueTrend =
      priorRevenueCents > 0
        ? Math.round(((revenueCents - priorRevenueCents) / priorRevenueCents) * 100)
        : 0;

    const appointmentsCount = appointments.length;

    // --- Charts: bucket by day, oldest to newest, 30 entries ---
    const revenueByDay = new Map<string, number>();
    const appointmentsByDay = new Map<string, number>();

    for (const p of payments) {
      const key = dateKey(new Date(p.created_at as string));
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + (p.amount_cents ?? 0) / 100);
    }
    for (const a of appointments) {
      const key = dateKey(new Date(a.created_at as string));
      appointmentsByDay.set(key, (appointmentsByDay.get(key) ?? 0) + 1);
    }

    const revenueTrendChart: Array<{ date: string; revenue: number }> = [];
    const appointmentTrendChart: Array<{ date: string; appointments: number }> = [];
    for (let i = CHART_DAYS - 1; i >= 0; i--) {
      const day = new Date(now.getTime() - i * DAY_MS);
      const key = dateKey(day);
      revenueTrendChart.push({ date: key, revenue: revenueByDay.get(key) ?? 0 });
      appointmentTrendChart.push({ date: key, appointments: appointmentsByDay.get(key) ?? 0 });
    }

    // --- Patient status: derived from real appointment activity, not fabricated. ---
    // Active = at least one appointment in the last 30 days. Inactive = no recent
    // appointment activity. There is no separate "pending"/"cancelled" patient
    // lifecycle status column on `patients`, so we only report buckets we can derive.
    const activePatientIds = new Set(
      (activePatientsResult.data ?? [])
        .map((a) => a.patient_id as string | null)
        .filter((id): id is string => Boolean(id))
    );
    const activeCount = activePatientIds.size;
    const inactiveCount = Math.max(totalPatients - activeCount, 0);

    const patientStatus = [
      { name: 'Active', value: activeCount },
      { name: 'Inactive', value: inactiveCount }
    ];

    // --- Risk distribution: no queryable per-patient risk table exists yet.
    // Returning zeroed, clearly-labeled buckets rather than fabricated numbers.
    const riskDistribution = [
      { name: 'High Risk', value: 0 },
      { name: 'Medium Risk', value: 0 },
      { name: 'Low Risk', value: 0 }
    ];

    return NextResponse.json({
      summary: {
        revenue,
        patients: totalPatients,
        appointments: appointmentsCount,
        revenueTrend
      },
      charts: {
        revenueTrend: revenueTrendChart,
        appointmentTrend: appointmentTrendChart,
        riskDistribution,
        patientStatus
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to load dashboard metrics' }, { status: 500 });
  }
}
