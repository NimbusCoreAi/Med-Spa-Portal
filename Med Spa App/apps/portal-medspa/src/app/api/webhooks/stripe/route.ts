import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent } from '@baseplate/stripe';
import {
  getStripeWebhookEvent,
  updateAppointmentPaymentStatus,
  updateSubscriptionStatus,
  getServiceSupabaseClient,
  logInfo,
  logError,
} from '@baseplate/core';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = getStripeWebhookEvent(body, signature);
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { route: '/api/webhooks/stripe', op: 'signature_verify' });
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  const eventId = stripeEvent.id;

  // Idempotency guard — skip events we've already processed (handles Stripe retries)
  const { error: dedupError } = await supabase
    .from('processed_stripe_events')
    .insert({ event_id: eventId });

  if (dedupError?.code === '23505') {
    logInfo('stripe.event.duplicate', { eventId });
    return NextResponse.json({ received: true });
  }
  if (dedupError) {
    logError(new Error(dedupError.message), { eventId, op: 'event_dedup' });
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }

  try {
    const event = constructWebhookEvent(body, signature);

    if (event.appointmentId && event.paymentStatus) {
      logInfo('stripe.payment.processing', { eventId, appointmentId: event.appointmentId, status: event.paymentStatus });
      await updateAppointmentPaymentStatus(event.appointmentId, event.paymentStatus, supabase);
      logInfo('stripe.payment.processed', { eventId, appointmentId: event.appointmentId, status: event.paymentStatus });
    }

    if (stripeEvent.type.startsWith('customer.subscription.')) {
      const subscription = stripeEvent.data.object as Stripe.Subscription;
      const metadata = subscription.metadata ?? {};
      const status = subscription.status;
      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : undefined;

      if (metadata.clinic_id && metadata.plan) {
        if (stripeEvent.type === 'customer.subscription.created') {
          const { error: subError } = await supabase.from('subscriptions').upsert(
            {
              clinic_id: metadata.clinic_id,
              stripe_customer_id: subscription.customer as string,
              stripe_subscription_id: subscription.id,
              plan: metadata.plan,
              status,
              current_period_end: periodEnd,
            },
            { onConflict: 'stripe_subscription_id' }
          );
          if (subError) {
            logError(new Error(subError.message), { eventId, op: 'subscription.upsert', clinicId: metadata.clinic_id });
          } else {
            logInfo('stripe.subscription.created', { eventId, clinicId: metadata.clinic_id, plan: metadata.plan });
          }
        } else {
          await updateSubscriptionStatus(supabase, subscription.id, { status, current_period_end: periodEnd });
          logInfo('stripe.subscription.updated', { eventId, subscriptionId: subscription.id, status });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // Release the dedup claim so Stripe's retry can reprocess this event.
    // The claim was inserted before processing to atomically reject concurrent
    // deliveries; if we don't release it here, a transient failure permanently
    // marks the event done and the payment/subscription side effects never apply.
    const { error: releaseError } = await supabase
      .from('processed_stripe_events')
      .delete()
      .eq('event_id', eventId);
    if (releaseError) {
      logError(new Error(releaseError.message), { eventId, op: 'event_release' });
    }
    logError(err instanceof Error ? err : new Error(String(err)), { eventId, route: '/api/webhooks/stripe' });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
