'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@baseplate/ui/layout';
import { Table } from '@baseplate/ui/table';

interface AuditLogRow {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  user_id: string;
}

export function AuditLogViewer({ clinicId }: { clinicId: string }) {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/audit-logs');
      if (!res.ok) throw new Error('Failed to load audit logs');
      const data = await res.json();
      setLogs((data as AuditLogRow[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filtered = actionFilter
    ? logs.filter((l) => l.action.toLowerCase().includes(actionFilter.toLowerCase()))
    : logs;

  const uniqueActions = Array.from(new Set(logs.map((l) => l.action))).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Audit Logs</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400">Compliance trail — owner access only.</p>
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </Card>
      )}

      <div className="flex items-center gap-3">
        <label htmlFor="audit-action-filter" className="text-sm font-medium text-gray-700 dark:text-slate-300">
          Filter by action:
        </label>
        <select
          id="audit-action-filter"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-50 px-3 py-1.5 text-sm"
        >
          <option value="">All actions</option>
          {uniqueActions.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-slate-400">Loading audit logs...</p>
      ) : (
        <Card>
          <Table<AuditLogRow>
            columns={[
              {
                key: 'timestamp',
                header: 'Timestamp',
                accessor: (r) => new Date(r.timestamp).toLocaleString()
              },
              { key: 'action', header: 'Action', accessor: (r) => r.action },
              { key: 'resource', header: 'Resource', accessor: (r) => `${r.resource_type} (${r.resource_id.slice(0, 8)}...)` },
              {
                key: 'user',
                header: 'User',
                accessor: (r) => r.user_id.slice(0, 8) + '...'
              }
            ]}
            rows={filtered}
            rowKey={(r) => r.id}
            emptyMessage="No audit log entries."
          />
        </Card>
      )}
    </div>
  );
}
