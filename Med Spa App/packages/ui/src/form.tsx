import React from 'react';
import { Input } from './input';
import { Button } from './button';

export type FormFieldType = 'text' | 'email' | 'password' | 'tel' | 'date' | 'textarea' | 'checkbox' | 'select';

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FormProps {
  fields: FormField[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel?: string;
  loading?: boolean;
  error?: string;
}

export function Form({ fields, values, onChange, onSubmit, submitLabel = 'Submit', loading, error }: FormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {fields.map((field) => {
        const value = values[field.name];

        if (field.type === 'textarea') {
          return (
            <div key={field.name} className="flex flex-col gap-1">
              <label htmlFor={field.name} className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {field.label}
              </label>
              <textarea
                id={field.name}
                name={field.name}
                required={field.required}
                placeholder={field.placeholder}
                value={(value as string) ?? ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                className="rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-50 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          );
        }

        if (field.type === 'checkbox') {
          return (
            <label key={field.name} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-slate-300">
              <input
                type="checkbox"
                name={field.name}
                required={field.required}
                checked={Boolean(value)}
                onChange={(e) => onChange(field.name, e.target.checked)}
              />
              {field.label}
            </label>
          );
        }

        if (field.type === 'select') {
          return (
            <div key={field.name} className="flex flex-col gap-1">
              <label htmlFor={field.name} className="text-sm font-medium text-gray-700 dark:text-slate-300">
                {field.label}
              </label>
              <select
                id={field.name}
                name={field.name}
                required={field.required}
                value={(value as string) ?? ''}
                onChange={(e) => onChange(field.name, e.target.value)}
                className="rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-50 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="" disabled>
                  Select...
                </option>
                {(field.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        return (
          <Input
            key={field.name}
            id={field.name}
            name={field.name}
            type={field.type}
            label={field.label}
            required={field.required}
            placeholder={field.placeholder}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(field.name, e.target.value)}
          />
        );
      })}

      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : submitLabel}
      </Button>
    </form>
  );
}
