'use client';

import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, DollarSign, Users, Calendar } from 'lucide-react';
import { KPICard } from '@baseplate/ui';
import { RevenueTrendChart } from '@/components/charts/RevenueTrendChart';
import { AppointmentTrendChart } from '@/components/charts/AppointmentTrendChart';
import { RiskScoringChart } from '@/components/charts/RiskScoringChart';
import { PatientStatusChart } from '@/components/charts/PatientStatusChart';
import { QuickActionButtons } from '@/components/dashboard/QuickActionButtons';

interface DashboardMetricsResponse {
  summary: {
    revenue: number;
    patients: number;
    appointments: number;
    revenueTrend: number;
  };
  charts: {
    revenueTrend: Array<{ date: string; revenue: number }>;
    appointmentTrend: Array<{ date: string; appointments: number }>;
    riskDistribution: Array<{ name: string; value: number }>;
    patientStatus: Array<{ name: string; value: number }>;
  };
}

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/dashboard/metrics');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load dashboard metrics');
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Overview of your clinic&apos;s performance
        </p>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading dashboard...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {metrics && !loading && !error && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <KPICard
              title="Revenue"
              value={`$${metrics.summary.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              trend={{
                value: Math.abs(metrics.summary.revenueTrend),
                direction: metrics.summary.revenueTrend >= 0 ? 'up' : 'down'
              }}
              icon={DollarSign}
              color="success"
            />
            <KPICard
              title="Total Patients"
              value={metrics.summary.patients}
              icon={Users}
              color="primary"
            />
            <KPICard
              title="Scheduled Appointments"
              value={metrics.summary.appointments}
              icon={Calendar}
              color="warning"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevenueTrendChart data={metrics.charts.revenueTrend} />
            <AppointmentTrendChart data={metrics.charts.appointmentTrend} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RiskScoringChart data={metrics.charts.riskDistribution} />
            <PatientStatusChart data={metrics.charts.patientStatus} />
          </div>

          <QuickActionButtons />
        </>
      )}
    </div>
  );
}
