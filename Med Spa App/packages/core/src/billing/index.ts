import type { SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('Missing Stripe configuration: set STRIPE_SECRET_KEY');
  return new Stripe(secretKey);
}

export type Plan = 'connect' | 'intelligence';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing' | 'none';

export interface SubscriptionRecord {
  id: string;
  clinic_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  status: string;
  current_period_end: string | null;
}

export async function getSubscription(supabase: SupabaseClient, clinicId: string): Promise<SubscriptionRecord | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('clinic_id', clinicId)
    .eq('status', 'active')
    .single();

  if (error) return null;
  return data as SubscriptionRecord;
}

export async function getSubscriptionStatus(supabase: SupabaseClient, clinicId: string): Promise<SubscriptionStatus> {
  const sub = await getSubscription(supabase, clinicId);
  if (!sub) return 'none';
  return sub.status as SubscriptionStatus;
}

export async function updateSubscriptionStatus(
  supabase: SupabaseClient,
  stripeSubscriptionId: string,
  updates: { status: string; current_period_end?: string }
): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: updates.status,
      ...(updates.current_period_end ? { current_period_end: updates.current_period_end } : {}),
    })
    .eq('stripe_subscription_id', stripeSubscriptionId);

  if (error) throw new Error(`Failed to update subscription: ${error.message}`);
}

export async function hasActiveSubscription(supabase: SupabaseClient, clinicId: string, plan?: Plan): Promise<boolean> {
  const sub = await getSubscription(supabase, clinicId);
  if (!sub || sub.status !== 'active') return false;
  if (plan && sub.plan !== plan) return false;
  return true;
}

export async function createCheckoutSession(params: {
  plan: Plan;
  clinicId: string;
  customerId?: string;
}): Promise<{ url: string }> {
  const stripe = getStripeClient();
  const priceMap: Record<Plan, string | undefined> = {
    connect: process.env.STRIPE_PRICE_CONNECT,
    intelligence: process.env.STRIPE_PRICE_INTELLIGENCE,
  };

  const priceId = priceMap[params.plan];
  if (!priceId) throw new Error(`Missing Stripe Price ID for plan: ${params.plan}. Set STRIPE_PRICE_${params.plan.toUpperCase()}`);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { clinic_id: params.clinicId, plan: params.plan },
    customer: params.customerId,
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/signup/success?plan=${params.plan}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/pricing`,
  });

  return { url: session.url ?? '' };
}

export async function createBillingPortalSession(params: {
  customerId: string;
}): Promise<{ url: string }> {
  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/settings/billing`,
  });
  return { url: session.url };
}

export function getStripeWebhookEvent(body: string, signature: string): Stripe.Event {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('Missing Stripe configuration: set STRIPE_WEBHOOK_SECRET');
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}
