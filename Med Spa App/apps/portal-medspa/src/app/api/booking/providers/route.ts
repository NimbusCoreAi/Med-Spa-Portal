import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getProviders, getServiceSupabaseClient, logError } from '@baseplate/core';
import { checkRateLimit } from '@/lib/request-rate-limit';

const querySchema = z.object({
  clinicId: z.string().min(1)
});

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown';
}

export async function GET(req: NextRequest) {
  const ip = getIp(req);
  if (!checkRateLimit(ip, 10)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  const parsed = querySchema.safeParse({
    clinicId: req.nextUrl.searchParams.get('clinicId')
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const client = getServiceSupabaseClient();

    const { data: clinic } = await client
      .from('clinics')
      .select('id')
      .eq('id', parsed.data.clinicId)
      .maybeSingle();

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const providers = await getProviders(parsed.data.clinicId, client);
    return NextResponse.json({ providers });
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { op: 'booking.providers', clinicId: parsed.data.clinicId });
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}
