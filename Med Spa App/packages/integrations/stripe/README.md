# Stripe Integration

Stripe payment integration — creates checkout sessions (payment links) and verifies webhook events for appointment payments.

Part of `@baseplate/integrations` (`@baseplate/stripe`).

## Quick Start

```ts
import { createPaymentLink, constructWebhookEvent } from '@baseplate/stripe';
```

## API

| Export | Signature | Description |
|--------|-----------|-------------|
| `createPaymentLink` | `(params: CreatePaymentLinkParams) => Promise<PaymentLinkResult>` | Create a Stripe Checkout session |
| `constructWebhookEvent` | `(body: string, signature: string) => WebhookResult` | Verify + parse a Stripe webhook event |
| `CreatePaymentLinkParams` | `interface` (see below) | Params for `createPaymentLink` |
| `PaymentLinkResult` | `{ id: string; url: string }` | Checkout session ID + URL |
| `WebhookResult` | `{ type: string; appointmentId?: string; paymentStatus?: 'completed' \| 'failed' }` | Parsed webhook payload |

### `CreatePaymentLinkParams`

```ts
interface CreatePaymentLinkParams {
  clinicId: string;
  patientId: string;
  appointmentId: string;
  amount: number;       // dollars (converted to cents internally)
  description: string;
}
```

## Usage

```ts
import { createPaymentLink, constructWebhookEvent } from '@baseplate/stripe';

// Create a payment link for an appointment
const { url } = await createPaymentLink({
  clinicId: 'clinic_123',
  patientId: 'patient_456',
  appointmentId: 'appt_789',
  amount: 250, // $250.00
  description: 'Botox Consultation',
});

// Handle a webhook (e.g., in an API route)
const result = constructWebhookEvent(rawBody, stripeSignature);
if (result.paymentStatus === 'completed') {
  console.log(`Appointment ${result.appointmentId} paid`);
}
```

## Return Values

- **`createPaymentLink`** — `{ id, url }` where `url` is the checkout URL to redirect the patient to.
- **`constructWebhookEvent`** — Extracts `appointmentId` and `paymentStatus` from event metadata for `checkout.session.completed`, `payment_intent.succeeded` (→ `'completed'`), and `payment_intent.payment_failed` (→ `'failed'`).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Yes (for webhooks) | Stripe webhook signing secret |
| `STRIPE_SUCCESS_URL` | No | Redirect URL after successful payment |
| `STRIPE_CANCEL_URL` | No | Redirect URL after cancelled payment |
| `NEXT_PUBLIC_APP_URL` | No | Fallback base URL for success/cancel redirects |

> Vertical-agnostic — no med-spa-specific code.
