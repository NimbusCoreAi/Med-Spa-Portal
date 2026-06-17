'use client';

import { useState } from 'react';
import { Button } from '@baseplate/ui/button';
import { Input } from '@baseplate/ui/input';
import { Form as PreviewForm } from '@baseplate/ui/form';
import { Card } from '@baseplate/ui/layout';

export interface FormBuilderField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'checkbox' | 'select' | 'date';
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormBuilderProps {
  name: string;
  fields: FormBuilderField[];
  onNameChange: (name: string) => void;
  onFieldsChange: (fields: FormBuilderField[]) => void;
  onSave: () => void;
  loading?: boolean;
  error?: string;
  savedMessage?: string;
  title?: string;
}

const FIELD_TYPES: FormBuilderField['type'][] = ['text', 'email', 'tel', 'textarea', 'checkbox', 'select', 'date'];

function emptyField(): FormBuilderField {
  return { id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, label: '', type: 'text', required: false };
}

export function FormBuilder({
  name,
  fields,
  onNameChange,
  onFieldsChange,
  onSave,
  loading,
  error,
  savedMessage,
  title = 'Form Builder',
}: FormBuilderProps) {
  const [previewValues, setPreviewValues] = useState<Record<string, unknown>>({});

  function addField() {
    onFieldsChange([...fields, emptyField()]);
  }

  function updateField(index: number, updates: Partial<FormBuilderField>) {
    onFieldsChange(fields.map((field, i) => (i === index ? { ...field, ...updates } : field)));
  }

  function removeField(index: number) {
    onFieldsChange(fields.filter((_, i) => i !== index));
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <h2 className="text-lg font-semibold mb-4">{title}</h2>

        <Input
          label="Form Name"
          name="form_name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="New Form"
        />

        <div className="mt-4 space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-wrap items-end gap-2 rounded border border-gray-200 p-3">
              <div className="flex-1 min-w-[160px]">
                <Input
                  label="Label"
                  name={`label_${field.id}`}
                  value={field.label}
                  onChange={(e) => updateField(index, { label: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor={`type_${field.id}`} className="text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id={`type_${field.id}`}
                  value={field.type}
                  onChange={(e) => updateField(index, { type: e.target.value as FormBuilderField['type'] })}
                  className="rounded border border-gray-300 px-3 py-2 text-base"
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
                        options: e.target.value.split(',').map((o) => o.trim()).filter(Boolean),
                      })
                    }
                  />
                </div>
              )}

              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
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
          <Button onClick={onSave} disabled={loading || !name}>
            {loading ? 'Saving...' : 'Save Form'}
          </Button>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {savedMessage && <p className="mt-2 text-sm text-green-600">{savedMessage}</p>}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold mb-4">Preview</h2>
        {fields.length === 0 ? (
          <p className="text-sm text-gray-500">Add fields to preview the form.</p>
        ) : (
          <PreviewForm
            fields={fields.map((f) => ({
              name: f.id,
              label: f.label || '(untitled field)',
              type: f.type,
              required: f.required,
              options: f.options,
              placeholder: f.placeholder,
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
