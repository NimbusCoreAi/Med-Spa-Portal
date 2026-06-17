import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiKey } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logApiUsage } from '@/lib/usage';
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { installModule, uninstallModule } from '@baseplate/marketplace';
import { AppError, errorToResponse } from '@baseplate/core/errors';

export const dynamic = 'force-dynamic';

const installSchema = z.object({
  module_id: z.string().uuid(),
});

export async function POST(req: NextRequest) {
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

  let body;
  try {
    body = installSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const result = await installModule(clinicId, body.module_id, supabase);

    await logApiUsage({ clinicId, endpoint: req.nextUrl.pathname, statusCode: 200, responseTimeMs: Date.now() - startTime });

    return NextResponse.json({
      subscription_id: result.subscription.id,
      module_id: result.module.id,
      module_name: result.module.name,
      status: 'active',
      activated_at: result.subscription.activated_at,
    });
  } catch (err) {
    await logApiUsage({ clinicId, endpoint: req.nextUrl.pathname, statusCode: 500, responseTimeMs: Date.now() - startTime });
    return NextResponse.json(errorToResponse(err), { status: err instanceof AppError ? err.statusCode : 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const startTime = Date.now();
  const supabase = getServiceSupabaseClient();

  const auth = await validateApiKey(req, supabase);
  if (auth.error) return auth.error;
  const clinicId = auth.clinicId;

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get('module_id');

  if (!moduleId) {
    return NextResponse.json({ error: 'module_id is required' }, { status: 400 });
  }

  try {
    await uninstallModule(clinicId, moduleId, supabase);
    await logApiUsage({ clinicId, endpoint: req.nextUrl.pathname, statusCode: 200, responseTimeMs: Date.now() - startTime });
    return NextResponse.json({ status: 'cancelled' });
  } catch (err) {
    return NextResponse.json(errorToResponse(err), { status: 500 });
  }
}
