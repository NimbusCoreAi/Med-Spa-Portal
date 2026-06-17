'use client';

import { useState } from 'react';
import { Form } from '@baseplate/ui/form';
import { Card } from '@baseplate/ui/layout';
import { SignatureCapture } from '../digital-signature';
import type { SignatureValue } from '../digital-signature';

export interface ConsentFormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'checkbox' | 'select';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface ConsentFormProps {
  title: string;
  fields: ConsentFormField[];
  consentText: string;
  onSubmit: (responses: Record<string, unknown>, signature: SignatureValue) => Promise<void>;
  submitLabel?: string;
  successTitle?: string;
  successMessage?: string;
  extraFields?: ConsentFormField[];
}

export function ConsentForm({
  title,
  fields,
  consentText,
  onSubmit,
  submitLabel = 'Sign & Submit',
  successTitle = 'Thank you!',
  successMessage = 'Your form has been submitted.',
  extraFields = [],
}: ConsentFormProps) {
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSign(signature: SignatureValue) {
    setSubmitting(true);
    setError('');

    try {
      await onSubmit({ ...responses, _signature: signature }, signature);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <Card className="max-w-xl mx-auto mt-12">
        <h1 className="text-xl font-bold mb-2">{successTitle}</h1>
        <p className="text-gray-600">{successMessage}</p>
      </Card>
    );
  }

  const allFields = [...extraFields, ...fields];

  return (
    <Card className="max-w-xl mx-auto mt-12 space-y-6">
      <h1 className="text-xl font-bold">{title}</h1>

      <div className="[&_button[type='submit']]:hidden">
        <Form
          fields={allFields}
          values={responses}
          onChange={(name, value) => setResponses((prev) => ({ ...prev, [name]: value }))}
          onSubmit={(e) => e.preventDefault()}
          submitLabel={submitLabel}
        />
      </div>

      <SignatureCapture
        consentText={consentText}
        onSign={handleSign}
        disabled={submitting}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
    </Card>
  );
}
