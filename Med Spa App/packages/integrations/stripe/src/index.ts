import Stripe from 'stripe';

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error('Missing Stripe configuration: set STRIPE_SECRET_KEY');
  return new Stripe(secretKey);
}

export interface CreatePaymentLinkParams {
  clinicId: string;
  patientId: string;
  appointmentId: string;
  amount: number; // dollars
  description: string;
}

export interface PaymentLinkResult {
  id: string;
  url: string;
}

/**
 * Create a Stripe Payment Link for an appointment.
 */
export async function createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResult> {
  const stripe = getStripeClient();

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: { name: params.description },
          unit_amount: Math.round(params.amount * 100)
        },
        quantity: 1
      }
    ],
    metadata: {
      clinic_id: params.clinicId,
      patient_id: params.patientId,
      appointment_id: params.appointmentId
    },
    success_url: process.env.STRIPE_SUCCESS_URL || `${process.env.NEXT_PUBLIC_APP_URL || ''}/payments/success`,
    cancel_url: process.env.STRIPE_CANCEL_URL || `${process.env.NEXT_PUBLIC_APP_URL || ''}/payments/cancelled`
  });

  return { id: session.id, url: session.url ?? '' };
}

export interface WebhookResult {
  type: string;
  appointmentId?: string;
  paymentStatus?: 'completed' | 'failed';
}

/**
 * Verify and parse a Stripe webhook event, extracting the appointment id and
 * resulting payment status (if applicable) from its metadata.
 */
export function constructWebhookEvent(body: string, signature: string): WebhookResult {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('Missing Stripe configuration: set STRIPE_WEBHOOK_SECRET');

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    const metadata = (event.data.object as { metadata?: Record<string, string> }).metadata ?? {};
    return { type: event.type, appointmentId: metadata.appointment_id, paymentStatus: 'completed' };
  }

  if (event.type === 'payment_intent.payment_failed') {
    const metadata = (event.data.object as { metadata?: Record<string, string> }).metadata ?? {};
    return { type: event.type, appointmentId: metadata.appointment_id, paymentStatus: 'failed' };
  }

  return { type: event.type };
}
