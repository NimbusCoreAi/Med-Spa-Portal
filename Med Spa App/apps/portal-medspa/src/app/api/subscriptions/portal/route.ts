import { NextRequest, NextResponse } from 'next/server';
import { createBillingPortalSession, getSubscription } from '@baseplate/core';
import { getUserContext, createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const ctx = await getUserContext();
    if (!ctx) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const subscription = await getSubscription(supabase, ctx.clinicId);

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }

    const { url } = await createBillingPortalSession({ customerId: subscription.stripe_customer_id });
    return NextResponse.json({ url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
