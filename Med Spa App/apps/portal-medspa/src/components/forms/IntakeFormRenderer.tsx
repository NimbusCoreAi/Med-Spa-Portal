'use client';

import { useEffect, useState } from 'react';
import type { IntakeForm } from '@baseplate/core';
import { Form as PatientForm } from '@baseplate/ui/form';
import { Card } from '@baseplate/ui/layout';
import { SignatureCapture, SignatureValue } from '@baseplate/patterns/digital-signature';

interface IntakeFormRendererProps {
  formId: string;
  appointmentId?: string;
}

export function IntakeFormRenderer({ formId, appointmentId }: IntakeFormRendererProps) {
  const [form, setForm] = useState<IntakeForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [responses, setResponses] = useState<Record<string, unknown>>({});

  useEffect(() => {
    fetch(`/api/intake/form?formId=${encodeURIComponent(formId)}`)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Failed to load form');
        setForm(body.form);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load form'))
      .finally(() => setLoading(false));
  }, [formId]);

  async function handleSign(signature: SignatureValue) {
    if (!form) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: form.clinic_id,
          formId: form.id,
          appointmentId,
          firstName,
          lastName,
          email: email || undefined,
          responses: { ...responses, _signature: signature },
          signedConsent: signature.agreed
        })
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Failed to submit intake form');

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit intake form');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="p-8 text-gray-500">Loading form...</p>;
  if (error && !form) return <p className="p-8 text-red-600">{error}</p>;
  if (!form) return null;

  if (submitted) {
    return (
      <Card className="max-w-xl mx-auto mt-12">
        <h1 className="text-xl font-bold mb-2">Thank you!</h1>
        <p className="text-gray-600">Your intake form has been submitted.</p>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto mt-12 space-y-6">
      <h1 className="text-xl font-bold">{form.name}</h1>

      <div className="[&_button[type='submit']]:hidden">
        <PatientForm
          fields={[
            { name: '_first_name', label: 'First Name', type: 'text', required: true },
            { name: '_last_name', label: 'Last Name', type: 'text', required: true },
            { name: '_email', label: 'Email', type: 'email', required: true },
            ...form.fields.map((f) => ({
              name: f.id,
              label: f.label,
              type: f.type,
              required: f.required,
              options: f.options
            }))
          ]}
          values={{ _first_name: firstName, _last_name: lastName, _email: email, ...responses }}
          onChange={(name, value) => {
            if (name === '_first_name') return setFirstName(value as string);
            if (name === '_last_name') return setLastName(value as string);
            if (name === '_email') return setEmail(value as string);
            setResponses((prev) => ({ ...prev, [name]: value }));
          }}
          onSubmit={(e) => e.preventDefault()}
        />
      </div>

      <SignatureCapture
        consentText="By signing below, I consent to the treatment described in this intake form and confirm the information provided is accurate."
        onSign={handleSign}
        disabled={submitting || !firstName || !lastName || !email}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </Card>
  );
}
