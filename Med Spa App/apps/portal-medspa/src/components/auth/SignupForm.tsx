'use client';

import { useState } from 'react';
import { Button } from '@baseplate/ui/button';
import { Input } from '@baseplate/ui/input';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicLocation, setClinicLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          clinic_name: clinicName,
          clinic_location: clinicLocation || undefined,
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Signup failed');

      if (body.url) {
        window.location.href = body.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSignup}
      className="space-y-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-8 rounded-lg shadow-sm"
    >
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Create your clinic account</h1>

      <Input
        type="text"
        name="clinic_name"
        label="Clinic Name"
        value={clinicName}
        onChange={(e) => setClinicName(e.target.value)}
        required
      />

      <Input
        type="text"
        name="clinic_location"
        label="Clinic Location (optional)"
        value={clinicLocation}
        onChange={(e) => setClinicLocation(e.target.value)}
      />

      <Input
        type="email"
        name="email"
        label="Email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        type="password"
        name="password"
        label="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />

      {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>

      <p className="text-sm text-gray-600 dark:text-slate-400 text-center">
        Already have an account?{' '}
        <a href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:underline">
          Login
        </a>
      </p>
    </form>
  );
}
