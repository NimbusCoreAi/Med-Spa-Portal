import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@baseplate/core';
import { getUserContext } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body as { plan?: 'connect' | 'intelligence' };

    if (!plan || (plan !== 'connect' && plan !== 'intelligence')) {
      return NextResponse.json({ error: 'Invalid plan. Must be "connect" or "intelligence".' }, { status: 400 });
    }

    const { url } = await createCheckoutSession({ plan, clinicId: ctx.clinicId });
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
