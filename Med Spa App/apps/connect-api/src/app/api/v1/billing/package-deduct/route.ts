import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiKey } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logApiUsage } from '@/lib/usage';
import { getServiceSupabaseClient } from '@baseplate/core/config';
import { deductPackageSession } from '@baseplate/core/packages';
import { logAction } from '@baseplate/core/audit-logs';
import { AppError, errorToResponse, errorToStatus } from '@baseplate/core/errors';

export const dynamic = 'force-dynamic';

const packageDeductSchema = z.object({
  package_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  performed_by: z.string().uuid().optional(),
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
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  }

  let body;
  try {
    body = packageDeductSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    const result = await deductPackageSession({
      packageId: body.package_id,
      patientId: body.patient_id,
      clinicId,
      appointmentId: body.appointment_id,
      performedBy: body.performed_by,
    }, supabase);

    await logAction({
      clinicId,
      userId: body.performed_by ?? 'connect-api',
      action: 'package.deducted',
      resourceType: 'credit_package',
      resourceId: body.package_id,
    }, supabase).catch((err) =>
      console.error('[audit] package.deducted write failed', { error: err?.message, clinicId, packageId: body.package_id })
    );

    await logApiUsage({ clinicId, endpoint: req.nextUrl.pathname, statusCode: 200, responseTimeMs: Date.now() - startTime });

    return NextResponse.json({
      package_id: body.package_id,
      remaining_sessions: result.remaining,
      deducted_at: new Date().toISOString(),
    });
  } catch (err) {
    await logApiUsage({ clinicId, endpoint: req.nextUrl.pathname, statusCode: errorToStatus(err), responseTimeMs: Date.now() - startTime });

    if (err instanceof AppError) {
      return NextResponse.json(errorToResponse(err), { status: err.statusCode });
    }

    return NextResponse.json(
      { error: 'Package deduction failed' },
      { status: 500 }
    );
  }
}
