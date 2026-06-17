'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Room } from '@baseplate/core/types';
import { Card } from '@baseplate/ui/layout';
import { Table } from '@baseplate/ui/table';
import { Button } from '@baseplate/ui/button';
import { Input } from '@baseplate/ui/input';

export function RoomManager({ clinicId }: { clinicId: string }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rooms');
      if (!res.ok) throw new Error('Failed to load rooms');
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const cap = capacity ? parseInt(capacity, 10) : undefined;
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, capacity: cap })
      });
      if (!res.ok) throw new Error('Failed to create room');
      setName('');
      setCapacity('');
      setShowForm(false);
      await fetchRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rooms</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Room'}
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
              label="Room Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Treatment Room A"
              required
            />
            <Input
              label="Capacity (optional)"
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="1"
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Room'}
            </Button>
          </form>
        </Card>
      )}

      {loading ? (
        <p className="text-gray-500">Loading rooms...</p>
      ) : (
        <Card>
          <Table<Room>
            columns={[
              { key: 'name', header: 'Name', accessor: (r) => r.name },
              {
                key: 'capacity',
                header: 'Capacity',
                accessor: (r) => (r.capacity != null ? String(r.capacity) : '—')
              }
            ]}
            rows={rooms}
            rowKey={(r) => r.id}
            emptyMessage="No rooms yet. Add one to get started."
          />
        </Card>
      )}
    </div>
  );
}
