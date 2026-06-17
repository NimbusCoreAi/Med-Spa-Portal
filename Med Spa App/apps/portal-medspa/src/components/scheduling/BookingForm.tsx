'use client';

import { useEffect, useState } from 'react';
import type { Provider } from '@baseplate/core/types';
import { Input } from '@baseplate/ui/input';
import { Button } from '@baseplate/ui/button';
import { Card } from '@baseplate/ui/layout';

interface BookingFormProps {
  clinicId: string;
}

const DURATION_OPTIONS = [30, 45, 60, 90];

function formatSlot(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function BookingForm({ clinicId }: BookingFormProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [providerId, setProviderId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [date, setDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [notificationSent, setNotificationSent] = useState(true);

  useEffect(() => {
    fetch(`/api/booking/providers?clinicId=${encodeURIComponent(clinicId)}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load providers');
        setProviders(body.providers);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load providers'));
  }, [clinicId]);

  useEffect(() => {
    if (!providerId || !date) {
      setSlots([]);
      setSelectedSlot('');
      return;
    }

    setLoadingSlots(true);
    setError('');

    const params = new URLSearchParams({ providerId, date, durationMinutes: String(durationMinutes) });

    fetch(`/api/booking/slots?${params.toString()}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load available times');
        setSlots(body.slots);
        setSelectedSlot('');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load available times'))
      .finally(() => setLoadingSlots(false));
  }, [providerId, date, durationMinutes]);

  async function handleConfirm() {
    setSubmitting(true);
    setError('');
    setNotificationSent(true);

    try {
      const res = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          providerId,
          serviceType,
          scheduledTime: selectedSlot,
          durationMinutes,
          firstName,
          lastName,
          email: email || undefined,
          phone: phone || undefined
        })
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Failed to book appointment');

      try {
        await fetch('/api/appointments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clinicId,
            scheduledTime: selectedSlot,
            patientName: `${firstName} ${lastName}`,
            email,
            phone: phone || undefined
          })
        });
      } catch {
        setNotificationSent(false);
      }

      setConfirmed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmed) {
    return (
      <Card className="max-w-xl mx-auto mt-12">
        <h1 className="text-xl font-bold mb-2">You're booked!</h1>
        <p className="text-gray-600">
          Your appointment is confirmed for {formatSlot(selectedSlot)}.{' '}
          {notificationSent
            ? "You'll receive a confirmation shortly."
            : "Your appointment is booked, but we couldn't send a confirmation notification. Please note your appointment time."}
        </p>
      </Card>
    );
  }

  const canConfirm =
    !!providerId && !!serviceType && !!selectedSlot && !!firstName && !!lastName && !!email && !submitting;

  return (
    <Card className="max-w-xl mx-auto mt-12 space-y-4">
      <h1 className="text-xl font-bold">Book an Appointment</h1>

      <Input
        label="Service Type"
        name="service_type"
        value={serviceType}
        onChange={(e) => setServiceType(e.target.value)}
        placeholder="e.g. Consultation, Procedure, Follow-up"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="provider" className="text-sm font-medium text-gray-700">
          Provider
        </label>
        <select
          id="provider"
          value={providerId}
          onChange={(e) => setProviderId(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-base"
        >
          <option value="">Select a provider...</option>
          {providers.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="duration" className="text-sm font-medium text-gray-700">
          Duration
        </label>
        <select
          id="duration"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
          className="rounded border border-gray-300 px-3 py-2 text-base"
        >
          {DURATION_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d} minutes
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Date"
        name="date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {loadingSlots && <p className="text-sm text-gray-500">Loading available times...</p>}

      {!loadingSlots && providerId && date && slots.length === 0 && (
        <p className="text-sm text-gray-500">No available times on this date.</p>
      )}

      {slots.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Available Times</span>
          <div className="flex flex-wrap gap-2">
            {slots.map((slot) => (
              <Button
                key={slot}
                size="sm"
                variant={slot === selectedSlot ? 'primary' : 'secondary'}
                onClick={() => setSelectedSlot(slot)}
              >
                {formatSlot(slot)}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="First Name" name="first_name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input label="Last Name" name="last_name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Input label="Email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={handleConfirm} disabled={!canConfirm} className="w-full">
        {submitting ? 'Booking...' : 'Confirm Appointment'}
      </Button>
    </Card>
  );
}
