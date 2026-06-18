'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@baseplate/ui/button';
import { useTheme } from '@baseplate/ui';
import { Moon, Sun } from 'lucide-react';

export function DashboardHeader() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <header className="flex items-center justify-end gap-3 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-6 py-3">
      {mounted && (
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="rounded-md p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-900 transition-colors"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      )}
      <Button variant="secondary" size="sm" onClick={handleLogout} disabled={loading}>
        {loading ? 'Logging out...' : 'Logout'}
      </Button>
    </header>
  );
}
