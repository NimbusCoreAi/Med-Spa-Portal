'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertCircle, Search } from 'lucide-react';
import type { Patient } from '@baseplate/core/types';

export function PatientList({ clinicId }: { clinicId: string }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/patients');
      if (!res.ok) throw new Error('Failed to load patients');
      const data = await res.json();
      setPatients(data.patients);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter((p) => {
      const name = `${p.first_name} ${p.last_name}`.toLowerCase();
      const email = (p.email ?? '').toLowerCase();
      const phone = (p.phone ?? '').toLowerCase();
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [patients, search]);

  const columns = [
    {
      key: 'name',
      header: 'Name',
      accessor: (r: Patient) => `${r.first_name} ${r.last_name}`
    },
    { key: 'email', header: 'Email', accessor: (r: Patient) => r.email || '—' },
    { key: 'phone', header: 'Phone', accessor: (r: Patient) => r.phone || '—' },
    {
      key: 'created',
      header: 'Added',
      accessor: (r: Patient) => new Date(r.created_at).toLocaleDateString()
    }
  ];

  const emptyMessage = search.trim() ? 'No patients match your search.' : 'No patients yet.';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
          Patients {!loading && !error && `(${patients.length})`}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View and search all patients in your clinic
        </p>
      </div>

      {!loading && !error && (
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone"
            aria-label="Search patients"
            className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600 dark:border-slate-700 dark:border-t-blue-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading patients...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6 shadow-sm hover:shadow-md transition-shadow">
          {filteredPatients.length === 0 ? (
            <p className="py-4 text-sm text-slate-500 dark:text-slate-400">{emptyMessage}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-300"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      {columns.map((col) => (
                        <td key={col.key} className="px-3 py-2 text-slate-700 dark:text-slate-300">
                          {col.accessor(row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
