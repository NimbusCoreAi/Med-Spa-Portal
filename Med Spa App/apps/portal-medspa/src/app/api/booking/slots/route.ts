import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAvailableSlots, getServiceSupabaseClient, logError } from '@baseplate/core';
import { checkRateLimit } from '@/lib/request-rate-limit';

const querySchema = z.object({
  providerId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format'),
  durationMinutes: z.coerce.number().int().min(1).max(480)
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
    providerId: req.nextUrl.searchParams.get('providerId'),
    date: req.nextUrl.searchParams.get('date'),
    durationMinutes: req.nextUrl.searchParams.get('durationMinutes')
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const slots = await getAvailableSlots(parsed.data, getServiceSupabaseClient());
    return NextResponse.json({ slots });
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { op: 'booking.slots', providerId: parsed.data.providerId });
    return NextResponse.json({ error: 'Failed to fetch available slots' }, { status: 500 });
  }
}
