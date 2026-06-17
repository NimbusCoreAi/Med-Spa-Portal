'use client';

import { useState, useEffect, useCallback } from 'react';

interface MarketplaceModule {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  pricing_model: string;
  price_cents: number;
  install_count: number;
}

const categoryColors: Record<string, string> = {
  integration: 'bg-blue-100 text-blue-700',
  automation: 'bg-purple-100 text-purple-700',
  reporting: 'bg-green-100 text-green-700',
  ai: 'bg-orange-100 text-orange-700',
  ui: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-700',
};

function formatPrice(cents: number, model: string): string {
  if (model === 'free') return 'Free';
  const dollars = (cents / 100).toFixed(0);
  return `$${dollars}/mo`;
}

export function MarketplaceBrowser() {
  const [modules, setModules] = useState<MarketplaceModule[]>([]);
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [installing, setInstalling] = useState<string | null>(null);

  const loadModules = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('q', search);
      if (category) params.set('category', category);
      const res = await fetch(`/api/marketplace?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load modules');
      const data = await res.json();
      setModules(data.modules ?? []);
      setInstalledIds(new Set((data.installed ?? []).map((m: { module_id: string }) => m.module_id)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  async function handleInstall(moduleId: string) {
    setInstalling(moduleId);
    try {
      const res = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ module_id: moduleId }),
      });
      if (!res.ok) throw new Error('Failed to install module');
      setInstalledIds((prev) => new Set(prev).add(moduleId));
    } catch {
      setError('Failed to install module');
    } finally {
      setInstalling(null);
    }
  }

  async function handleUninstall(moduleId: string) {
    setInstalling(moduleId);
    try {
      const res = await fetch(`/api/marketplace?module_id=${moduleId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to uninstall module');
      setInstalledIds((prev) => {
        const next = new Set(prev);
        next.delete(moduleId);
        return next;
      });
    } catch {
      setError('Failed to uninstall module');
    } finally {
      setInstalling(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search modules..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Categories</option>
          <option value="integration">Integration</option>
          <option value="automation">Automation</option>
          <option value="reporting">Reporting</option>
          <option value="ai">AI</option>
          <option value="ui">UI</option>
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading modules...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && modules.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No modules available yet.</p>
          <p className="text-gray-400 text-sm mt-1">Check back soon — developers are building new modules!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <div key={mod.id} className="bg-white rounded-lg shadow border p-6 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold">{mod.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[mod.category] ?? categoryColors.other}`}>
                {mod.category}
              </span>
            </div>
            <p className="text-sm text-gray-600 flex-grow mb-4">{mod.description}</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">{formatPrice(mod.price_cents, mod.pricing_model)}</p>
                <p className="text-xs text-gray-400">{mod.install_count} installs</p>
              </div>
              {installedIds.has(mod.id) ? (
                <button
                  onClick={() => handleUninstall(mod.id)}
                  disabled={installing === mod.id}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  {installing === mod.id ? '...' : 'Uninstall'}
                </button>
              ) : (
                <button
                  onClick={() => handleInstall(mod.id)}
                  disabled={installing === mod.id}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {installing === mod.id ? '...' : 'Install'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
