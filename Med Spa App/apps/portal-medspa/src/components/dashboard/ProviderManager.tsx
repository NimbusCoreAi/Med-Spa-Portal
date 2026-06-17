'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Provider } from '@baseplate/core/types';
import { Card } from '@baseplate/ui/layout';
import { Table } from '@baseplate/ui/table';
import { Button } from '@baseplate/ui/button';
import { Input } from '@baseplate/ui/input';

export function ProviderManager({ clinicId }: { clinicId: string }) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/providers');
      if (!res.ok) throw new Error('Failed to load providers');
      const data = await res.json();
      setProviders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const specs = specialties
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, specialties: specs })
      });
      if (!res.ok) throw new Error('Failed to create provider');
      setName('');
      setSpecialties('');
      setShowForm(false);
      await fetchProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create provider');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Providers</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Provider'}
        </Button>
      </div>

      {error && (
        <Card>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}

      {showForm && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              label="Provider Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. Jane Smith"
              required
            />
            <Input
              label="Specialties (comma-separated)"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              placeholder="Botox, Fillers, Laser"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Provider'}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-gray-500">Loading providers...</p>
      ) : (
        <Card>
          <Table<Provider>
            columns={[
              { key: 'name', header: 'Name', accessor: (r) => r.name },
              {
                key: 'specialties',
                header: 'Specialties',
                accessor: (r) => (r.specialties ?? []).join(', ') || '—'
              }
            ]}
            rows={providers}
            rowKey={(r) => r.id}
            emptyMessage="No providers yet. Add one to get started."
          />
        </Card>
      )}
    </div>
  );
}
