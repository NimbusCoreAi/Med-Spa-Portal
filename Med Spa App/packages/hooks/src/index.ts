import { useState, useEffect, useCallback } from 'react';

export interface ApiQueryState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  refetch: () => void;
}

export function useApiQuery<T>(url: string | null): ApiQueryState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState('');
  const [nonce, setNonce] = useState(0);

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    fetch(url)
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? `Request failed: ${res.status}`);
        if (!cancelled) setData(body);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Request failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [url, nonce]);

  return { data, loading, error, refetch };
}

export interface ApiMutationState<T> {
  data: T | null;
  loading: boolean;
  error: string;
  mutate: (body: unknown) => Promise<T | null>;
}

export function useApiMutation<T>(url: string): ApiMutationState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mutate = useCallback(async (body: unknown): Promise<T | null> => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? `Request failed: ${res.status}`);
      setData(json);
      return json;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error, mutate };
}
