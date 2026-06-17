'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Patient } from '@baseplate/core/types';
import { Card } from '@baseplate/ui/layout';
import { Table } from '@baseplate/ui/table';

export function PatientList({ clinicId }: { clinicId: string }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Patients</h1>

      {error && (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {loading ? (
        <p className="text-gray-500">Loading patients...</p>
      ) : (
        <Card>
          <Table<Patient>
            columns={[
              {
                key: 'name',
                header: 'Name',
                accessor: (r) => `${r.first_name} ${r.last_name}`
              },
              { key: 'email', header: 'Email', accessor: (r) => r.email || '—' },
              { key: 'phone', header: 'Phone', accessor: (r) => r.phone || '—' },
              {
                key: 'created',
                header: 'Added',
                accessor: (r) => new Date(r.created_at).toLocaleDateString()
              }
            ]}
            rows={patients}
            rowKey={(r) => r.id}
            emptyMessage="No patients yet."
          />
        </Card>
      )}
    </div>
  );
}
