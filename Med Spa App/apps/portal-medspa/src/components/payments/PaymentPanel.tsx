'use client';

import { useState } from 'react';
import type { Appointment } from '@baseplate/core/types';
import { Input } from '@baseplate/ui/input';
import { Button } from '@baseplate/ui/button';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800'
};

interface PaymentPanelProps {
  appointment: Appointment;
  clinicId: string;
  onUpdated?: (appointment: Appointment) => void;
}

export function PaymentPanel({ appointment, clinicId, onUpdated }: PaymentPanelProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState(appointment.service_type ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [linkUrl, setLinkUrl] = useState(appointment.payment_link_url ?? '');

  async function handleGenerateLink() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          patientId: appointment.patient_id,
          appointmentId: appointment.id,
          amount: Math.round(Number(amount) * 100),
          description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to create payment link');

      setLinkUrl(data.url);
      onUpdated?.(data.appointment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Payment status:</span>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[appointment.payment_status]}`}
        >
          {appointment.payment_status}
        </span>
      </div>

      {linkUrl ? (
        <div className="text-sm">
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            View payment link
          </a>
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-32">
            <Input
              label="Amount (USD)"
              name="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <Input
              label="Description"
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerateLink} disabled={loading || !amount || !description}>
            {loading ? 'Generating...' : 'Generate Payment Link'}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
