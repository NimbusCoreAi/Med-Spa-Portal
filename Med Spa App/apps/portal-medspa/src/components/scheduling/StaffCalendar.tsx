'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Appointment, Provider, Room, Patient } from '@baseplate/core/types';
import { Button } from '@baseplate/ui/button';
import { Card } from '@baseplate/ui/layout';
import { IntakeStatusBadge } from '../dashboard/IntakeStatusBadge';
import { PaymentPanel } from '../payments/PaymentPanel';

interface StaffCalendarProps {
  clinicId: string;
}

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getUTCDay();
  result.setUTCDate(result.getUTCDate() - day);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatDay(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function StaffCalendar({ clinicId }: StaffCalendarProps) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  useEffect(() => {
    setLoading(true);
    setError('');

    fetch(`/api/calendar?from=${weekStart.toISOString()}&to=${weekEnd.toISOString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load calendar');
        return res.json();
      })
      .then((data) => {
        const { appointments: appts, providers: provs, rooms: rms, patients: pats } = data;
        setAppointments(appts);
        setProviders(provs);
        setRooms(rms);
        setPatients(pats);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load calendar'))
      .finally(() => setLoading(false));
  }, [clinicId, weekStart, weekEnd]);

  const providerName = (id?: string) => providers.find((p) => p.id === id)?.name ?? 'Unassigned';
  const roomName = (id?: string) => rooms.find((r) => r.id === id)?.name ?? 'No room';
  const patientName = (id: string) => {
    const patient = patients.find((p) => p.id === id);
    return patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown patient';
  };

  const roomConflicts = useMemo(() => {
    const conflictIds = new Set<string>();
    const valid = appointments.filter((a) => a.room_id && a.status !== 'cancelled');

    const byRoom = new Map<string, Appointment[]>();
    for (const a of valid) {
      const group = byRoom.get(a.room_id!);
      if (group) {
        group.push(a);
      } else {
        byRoom.set(a.room_id!, [a]);
      }
    }

    for (const group of byRoom.values()) {
      const events: Array<{ time: number; delta: 1 | -1; id: string }> = [];
      for (const a of group) {
        const start = new Date(a.scheduled_time).getTime();
        const end = start + a.duration_minutes * 60_000;
        events.push({ time: start, delta: 1, id: a.id });
        events.push({ time: end, delta: -1, id: a.id });
      }
      events.sort((x, y) => x.time - y.time || y.delta - x.delta);

      const active = new Set<string>();
      for (const ev of events) {
        if (ev.delta === 1) {
          if (active.size > 0) {
            for (const id of active) conflictIds.add(id);
            conflictIds.add(ev.id);
          }
          active.add(ev.id);
        } else {
          active.delete(ev.id);
        }
      }
    }

    return conflictIds;
  }, [appointments]);

  async function handleCancel(appointmentId: string) {
    setCancellingId(appointmentId);
    try {
      const res = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId })
      });
      if (!res.ok) throw new Error('Failed to cancel appointment');
      const updated = await res.json();
      setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Week of {formatDay(weekStart)} – {formatDay(addDays(weekStart, 6))}
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setWeekStart((d) => addDays(d, -7))}>
            Previous
          </Button>
          <Button variant="secondary" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            Today
          </Button>
          <Button variant="secondary" onClick={() => setWeekStart((d) => addDays(d, 7))}>
            Next
          </Button>
        </div>
      </div>

      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {!loading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-7">
          {days.map((day) => {
            const dayEnd = addDays(day, 1);
            const dayAppointments = appointments
              .filter((a) => {
                const time = new Date(a.scheduled_time).getTime();
                return time >= day.getTime() && time < dayEnd.getTime();
              })
              .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

            return (
              <div key={day.toISOString()} className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">{formatDay(day)}</h3>

                {dayAppointments.length === 0 && <p className="text-xs text-gray-400">No appointments</p>}

                {dayAppointments.map((appt) => {
                  const hasConflict = roomConflicts.has(appt.id);
                  const isExpanded = expandedId === appt.id;
                  return (
                    <div
                      key={appt.id}
                      className={`rounded border p-2 text-xs ${
                        hasConflict
                          ? 'border-red-400 bg-red-50'
                          : appt.status === 'cancelled'
                            ? 'border-gray-200 bg-gray-50 opacity-60'
                            : 'border-gray-200 bg-white'
                      }`}
                    >
                      <button
                        type="button"
                        className="w-full text-left"
                        onClick={() => setExpandedId(isExpanded ? null : appt.id)}
                      >
                        <p className="font-medium">{formatTime(new Date(appt.scheduled_time))}</p>
                        <p>{patientName(appt.patient_id)}</p>
                        <p className="text-gray-500">{providerName(appt.provider_id)}</p>
                        <p className="text-gray-500">{roomName(appt.room_id)}</p>
                        {hasConflict && <p className="font-semibold text-red-600">Room conflict</p>}
                      </button>
                      <div className="mt-1 flex items-center justify-between">
                        <IntakeStatusBadge status={appt.intake_completed ? 'completed' : 'not_started'} />
                        {appt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancel(appt.id)}
                            disabled={cancellingId === appt.id}
                            className="text-red-600 hover:underline disabled:opacity-50"
                          >
                            {cancellingId === appt.id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </div>
                      {isExpanded && (
                        <div className="mt-2 border-t border-gray-200 pt-2">
                          <PaymentPanel
                            appointment={appt}
                            clinicId={clinicId}
                            onUpdated={(updated) =>
                              setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
