'use client';

import { useEffect, useState } from 'react';
import type { IntakeForm, IntakeFormField } from '@baseplate/core/intake';
import { Button } from '@baseplate/ui/button';
import { Input } from '@baseplate/ui/input';
import { Form as PreviewForm } from '@baseplate/ui/form';
import { Card } from '@baseplate/ui/layout';

const FIELD_TYPES: IntakeFormField['type'][] = ['text', 'email', 'tel', 'textarea', 'checkbox', 'select', 'date'];

function emptyField(): IntakeFormField {
  return { id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, label: '', type: 'text', required: false };
}

interface FormBuilderProps {
  clinicId: string;
}

export function FormBuilder({ clinicId }: FormBuilderProps) {
  const [forms, setForms] = useState<IntakeForm[]>([]);
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [fields, setFields] = useState<IntakeFormField[]>([]);
  const [previewValues, setPreviewValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    fetch('/api/intake-forms')
      .then((r) => {
        if (!r.ok) throw new Error('Failed to load forms');
        return r.json();
      })
      .then(setForms)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load forms'));
  }, [clinicId]);

  function selectForm(form: IntakeForm | null) {
    setSavedMessage('');
    setError('');
    if (!form) {
      setSelectedFormId(null);
      setName('');
      setFields([]);
      return;
    }
    setSelectedFormId(form.id);
    setName(form.name);
    setFields(form.fields);
  }

  function addField() {
    setFields((prev) => [...prev, emptyField()]);
  }

  function updateField(index: number, updates: Partial<IntakeFormField>) {
    setFields((prev) => prev.map((field, i) => (i === index ? { ...field, ...updates } : field)));
  }

  function removeField(index: number) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setLoading(true);
    setError('');
    setSavedMessage('');

    try {
      if (selectedFormId) {
        const res = await fetch('/api/intake-forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: selectedFormId, name, fields })
        });
        if (!res.ok) throw new Error('Failed to save form');
        const updated = await res.json();
        setForms((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      } else {
        const res = await fetch('/api/intake-forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, fields })
        });
        if (!res.ok) throw new Error('Failed to save form');
        const created = await res.json();
        setForms((prev) => [created, ...prev]);
        setSelectedFormId(created.id);
      }
      setSavedMessage('Saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save form');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Intake Forms</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="secondary" onClick={() => selectForm(null)}>
            + New Form
          </Button>
          {forms.map((form) => (
            <Button
              key={form.id}
              variant={form.id === selectedFormId ? 'primary' : 'secondary'}
              onClick={() => selectForm(form)}
            >
              {form.name}
            </Button>
          ))}
        </div>

        <Input
          label="Form Name"
          name="form_name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New Patient Intake"
        />

        <div className="mt-4 space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex flex-wrap items-end gap-2 rounded border border-gray-200 dark:border-slate-800 p-3"
            >
              <div className="flex-1 min-w-[160px]">
                <Input
                  label="Label"
                  name={`label_${field.id}`}
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={`type_${field.id}`} className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  Type
                </label>
                <select
                  id={`type_${field.id}`}
                  value={field.type}
                  onChange={(e) => updateField(index, { type: e.target.value as IntakeFormField['type'] })}
                  className="rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-50 px-3 py-2 text-base"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {field.type === 'select' && (
                <div className="flex-1 min-w-[160px]">
                  <Input
                    label="Options (comma separated)"
                    name={`options_${field.id}`}
                    value={(field.options ?? []).join(', ')}
                    onChange={(e) =>
                      updateField(index, {
                        options: e.target.value
                          .split(',')
                          .map((o) => o.trim())
                          .filter(Boolean)
                      })
                    }
                  />
                </div>
              )}

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(index, { required: e.target.checked })}
                />
                Required
              </label>

              <Button variant="danger" onClick={() => removeField(index)}>
                Remove
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button variant="secondary" onClick={addField}>
            + Add Field
          </Button>
          <Button onClick={handleSave} disabled={loading || !name}>
            {loading ? 'Saving...' : 'Save Form'}
          </Button>
        </div>

        {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {savedMessage && <p className="mt-2 text-sm text-green-600 dark:text-green-400">{savedMessage}</p>}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-50">Preview</h2>
        {fields.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-slate-400">Add fields to preview the form.</p>
        ) : (
          <PreviewForm
            fields={fields.map((f) => ({
              name: f.id,
              label: f.label || '(untitled field)',
              type: f.type,
              required: f.required,
              options: f.options,
              placeholder: f.placeholder
            }))}
            values={previewValues}
            onChange={(name, value) => setPreviewValues((prev) => ({ ...prev, [name]: value }))}
            onSubmit={(e) => e.preventDefault()}
            submitLabel="Submit (preview only)"
          />
        )}
      </Card>
    </div>
  );
}
