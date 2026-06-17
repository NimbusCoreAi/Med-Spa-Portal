import { NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@baseplate/core';

interface HealthCheck {
  status: 'up' | 'down';
  latency_ms?: number;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, HealthCheck>;
  timestamp: string;
}

async function checkDatabase(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const supabase = getServiceSupabaseClient();
    const { error } = await supabase.from('clinics').select('id').limit(1);
    if (error) throw error;
    return { status: 'up', latency_ms: Date.now() - start };
  } catch {
    return { status: 'down', latency_ms: Date.now() - start };
  }
}

async function checkConnectApi(): Promise<HealthCheck> {
  const start = Date.now();
  try {
    const url = process.env.CONNECT_API_URL ?? 'http://localhost:3001';
    const res = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(5000) });
    return { status: res.ok ? 'up' : 'down', latency_ms: Date.now() - start };
  } catch {
    return { status: 'down', latency_ms: Date.now() - start };
  }
}

export async function GET() {
  const checks = await Promise.all([checkDatabase(), checkConnectApi()]);
  const [database, connect_api] = checks;

  const hasDown = Object.values({ database, connect_api }).some((c) => c.status === 'down');
  const allUp = database.status === 'up' && connect_api.status === 'up';

  const result: HealthResponse = {
    status: database.status === 'down' ? 'unhealthy' : hasDown ? 'degraded' : 'healthy',
    checks: { database, connect_api },
    timestamp: new Date().toISOString(),
  };

  const status = allUp ? 200 : 503;

  return NextResponse.json(result, { status });
}
