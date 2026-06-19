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

    // Record the payment in the canonical payments ledger so revenue appears on
    // dashboards and reports. The Checkout Session carries the metadata set by
    // createPaymentLink (clinic_id, patient_id, appointment_id) plus amount_total
    // in cents. We upsert on stripe_payment_id so Stripe retries are idempotent.
    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata ?? {};
      const stripePaymentId =
        typeof session.payment_intent === 'string' ? session.payment_intent : session.id;

      if (metadata.clinic_id && metadata.patient_id) {
        const { error: payError } = await supabase.from('payments').upsert(
          {
            clinic_id: metadata.clinic_id,
            patient_id: metadata.patient_id,
            appointment_id: metadata.appointment_id ?? null,
            stripe_payment_id: stripePaymentId,
            amount_cents: session.amount_total ?? 0,
            currency: session.currency ?? 'usd',
            status: 'completed',
          },
          { onConflict: 'stripe_payment_id' }
        );
        if (payError) {
          logError(new Error(payError.message), { eventId, op: 'payment.insert', clinicId: metadata.clinic_id });
        } else {
          logInfo('stripe.payment.recorded', { eventId, clinicId: metadata.clinic_id, amountCents: session.amount_total });
        }
      }
    }

    // Mark a previously-recorded payment as refunded when a charge is refunded.
    // The charge inherits the checkout-session metadata, and its payment_intent
    // links back to the row stored above.
    if (stripeEvent.type === 'charge.refunded') {
      const charge = stripeEvent.data.object as Stripe.Charge;
      const metadata = charge.metadata ?? {};
      const stripePaymentId =
        typeof charge.payment_intent === 'string' ? charge.payment_intent : null;

      if (stripePaymentId) {
        const { error: refundError } = await supabase
          .from('payments')
          .update({ status: 'refunded' })
          .eq('stripe_payment_id', stripePaymentId);
        if (refundError) {
          logError(new Error(refundError.message), { eventId, op: 'payment.refund', clinicId: metadata.clinic_id });
        } else {
          logInfo('stripe.payment.refunded', { eventId, stripePaymentId });
        }
      }
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
