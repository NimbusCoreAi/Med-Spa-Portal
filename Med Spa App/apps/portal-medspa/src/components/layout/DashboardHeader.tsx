'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@baseplate/ui/button';

export function DashboardHeader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch {
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <header className="flex items-center justify-end border-b border-gray-200 bg-white px-6 py-3">
      <Button variant="secondary" size="sm" onClick={handleLogout} disabled={loading}>
        {loading ? 'Logging out...' : 'Logout'}
      </Button>
    </header>
  );
}
