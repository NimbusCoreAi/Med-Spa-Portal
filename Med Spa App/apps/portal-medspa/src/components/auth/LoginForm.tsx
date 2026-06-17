'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@baseplate/ui/button';
import { Input } from '@baseplate/ui/input';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Login failed');

      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 bg-white p-8 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold">Login</h1>

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
      />

      {error && <div className="text-sm text-red-600">{error}</div>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Logging in...' : 'Login'}
      </Button>

      <p className="text-sm text-gray-600 text-center">
        Don&apos;t have an account?{' '}
        <a href="/auth/signup" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
