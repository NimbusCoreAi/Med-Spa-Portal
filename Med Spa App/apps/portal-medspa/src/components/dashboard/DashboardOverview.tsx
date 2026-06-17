'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { DashboardMetrics } from '@baseplate/core/reporting';
import { Card } from '@baseplate/ui/layout';
import { Table } from '@baseplate/ui/table';

type DateRange = 'this_month' | 'last_month' | 'ytd';

function getRangeDates(range: DateRange): { from?: string; to?: string; label: string } {
  const now = new Date();
  const labels: Record<DateRange, string> = {
    this_month: 'This Month',
    last_month: 'Last Month',
    ytd: 'Year to Date'
  };

  if (range === 'this_month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
      label: labels[range]
    };
  }
  if (range === 'last_month') {
    return {
      from: new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(),
      to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString(),
      label: labels[range]
    };
  }
  return {
    from: new Date(now.getFullYear(), 0, 1).toISOString(),
    label: labels[range]
  };
}

function StatCard({ label, value, sublabel }: { label: string; value: ReactNode; sublabel?: string }) {
  return (
    <Card>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-gray-500">{sublabel}</p>}
    </Card>
  );
}

function RateBadge({ rate }: { rate: number }) {
  const pct = (rate * 100).toFixed(1);
  const color = rate < 0.15 ? 'text-green-600' : rate < 0.3 ? 'text-yellow-600' : 'text-red-600';
  return <span className={color}>{pct}%</span>;
}

export function DashboardOverview() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState<DateRange>('this_month');

  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const dates = getRangeDates(range);
      const params = new URLSearchParams();
      if (dates.from) params.set('from', dates.from);
      if (dates.to) params.set('to', dates.to);
      const res = await fetch(`/api/reporting/metrics?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to load metrics');
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const dates = getRangeDates(range);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500">{dates.label}</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value as DateRange)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="ytd">Year to Date</option>
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading metrics...</p>}

      {error && (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {metrics && !loading && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Revenue"
              value={`$${(metrics.totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              sublabel="Completed payments"
            />
            <StatCard
              label="Appointments"
              value={String(metrics.appointmentCounts.scheduled)}
              sublabel={`Completed: ${metrics.appointmentCounts.completed} | Cancelled: ${metrics.appointmentCounts.cancelled}`}
            />
            <StatCard
              label="No-Show Rate"
              value={<RateBadge rate={metrics.noShowRate} />}
              sublabel="Cancelled without intake"
            />
            <StatCard
              label="Intake Completion"
              value={<RateBadge rate={metrics.intakeCompletionRate} />}
              sublabel="Appointments with intake done"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Revenue by Provider</h2>
              <Table
                columns={[
                  { key: 'name', header: 'Provider', accessor: (r) => r.providerName },
                  {
                    key: 'revenue',
                    header: 'Revenue',
                    accessor: (r) => `$${(r.revenue / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  }
                ]}
                rows={metrics.revenueByProvider}
                rowKey={(r) => r.providerId}
                emptyMessage="No revenue data yet"
              />
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">Service Popularity</h2>
              <Table
                columns={[
                  { key: 'service', header: 'Service', accessor: (r) => r.serviceType },
                  { key: 'count', header: 'Appointments', accessor: (r) => String(r.count) }
                ]}
                rows={metrics.servicePopularity}
                rowKey={(r) => r.serviceType}
                emptyMessage="No appointment data yet"
              />
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
