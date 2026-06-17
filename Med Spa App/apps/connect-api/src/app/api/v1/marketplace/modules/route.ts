import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logApiUsage } from '@/lib/usage';
import type { ModuleCategory } from '@baseplate/marketplace/types';
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { searchModules, getInstalledModules } from '@baseplate/marketplace';

const VALID_CATEGORIES: ModuleCategory[] = ['integration', 'automation', 'reporting', 'ai', 'ui', 'other'];

export async function GET(req: NextRequest) {
  const startTime = Date.now();
  const supabase = getServiceSupabaseClient();

  const auth = await validateApiKey(req, supabase);
  if (auth.error) return auth.error;
  const clinicId = auth.clinicId;

  const rateLimit = await checkRateLimit(auth.keyHash);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'X-RateLimit-Limit': rateLimit.limit.toString(), 'X-RateLimit-Remaining': rateLimit.remaining.toString() } }
    );
  }

  const { searchParams } = new URL(req.url);
  const listInstalled = searchParams.get('installed') === 'true';

  if (listInstalled) {
    const modules = await getInstalledModules(clinicId, supabase).catch(() => []);
    await logApiUsage({ clinicId, endpoint: req.nextUrl.pathname, statusCode: 200, responseTimeMs: Date.now() - startTime });
    return NextResponse.json({ installed: modules });
  }

  const result = await searchModules({
    vertical: searchParams.get('vertical') ?? undefined,
    category: (() => {
      const c = searchParams.get('category');
      return c && VALID_CATEGORIES.includes(c as ModuleCategory) ? (c as ModuleCategory) : undefined;
    })(),
    query: searchParams.get('q') ?? undefined,
    page: parseInt(searchParams.get('page') ?? '1'),
    pageSize: parseInt(searchParams.get('page_size') ?? '20'),
  }, supabase);

  await logApiUsage({ clinicId, endpoint: req.nextUrl.pathname, statusCode: 200, responseTimeMs: Date.now() - startTime });

  return NextResponse.json(result);
}
