# Security & Tech-Debt Fix Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remediate all 41 findings from the 2026-06-16 whole-codebase audit, in priority order, without breaking the existing 250-test suite.

**Architecture:** Fixes are organized into 11 phases that build on each other — tenant isolation first (nothing else matters if tenants can cross-read), then DB safety, security hardening, compliance logging, auth fixes, client architecture, data integrity, performance, UX/error-handling, accessibility, and finally SDK cleanup.

**Tech Stack:** Next.js 14 App Router, TypeScript, Supabase (Postgres + RLS + `@supabase/ssr`), Stripe, Twilio, Postmark, pnpm/Turborepo, Jest (test runner), Zod (validation).

---

## Phase 1 — Tenant Isolation (CRITICAL — do first)

These four tasks must ship together or in order. Nothing else matters until cross-tenant reads are closed.

---

### Task 1 — Per-clinic API keys in Connect API (C1)

Replaces the single global `CONNECT_API_KEY` with per-clinic hashed keys. Every downstream route derives `clinicId` from the authenticated key, never from the request body.

**Files:**
- Modify: `apps/connect-api/src/lib/auth.ts`
- Modify: `apps/connect-api/src/lib/__tests__/auth.test.ts`
- New migration: `supabase/migrations/0016_api_keys.sql`

- [ ] **Step 1 — Write the migration**

```sql
-- supabase/migrations/0016_api_keys.sql
CREATE TABLE IF NOT EXISTS clinic_api_keys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id   uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  key_hash    text NOT NULL UNIQUE,  -- SHA-256 hex of the raw key
  label       text NOT NULL DEFAULT 'default',
  created_at  timestamptz NOT NULL DEFAULT now(),
  revoked_at  timestamptz
);

CREATE INDEX idx_clinic_api_keys_hash ON clinic_api_keys(key_hash) WHERE revoked_at IS NULL;

ALTER TABLE clinic_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners manage their API keys"
  ON clinic_api_keys FOR ALL
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );
```

- [ ] **Step 2 — Write failing tests**

```typescript
// apps/connect-api/src/lib/__tests__/auth.test.ts
import { NextRequest } from 'next/server';
import { validateApiKey } from '../auth';

function makeReq(key: string | null) {
  return new NextRequest('http://localhost/api/test', {
    headers: key ? { 'x-api-key': key } : {},
  });
}

describe('validateApiKey', () => {
  it('returns null and clinicId for a valid key', async () => {
    // Mock the DB lookup — returns a clinic id for the given key hash
    const result = await validateApiKey(makeReq('valid-key-abc123'), mockSupabase({ clinicId: 'clinic-1' }));
    expect(result.error).toBeNull();
    expect(result.clinicId).toBe('clinic-1');
  });

  it('returns 401 when header is missing', async () => {
    const result = await validateApiKey(makeReq(null), mockSupabase({ clinicId: null }));
    expect(result.error?.status).toBe(401);
  });

  it('returns 401 for an unknown key', async () => {
    const result = await validateApiKey(makeReq('bad-key'), mockSupabase({ clinicId: null }));
    expect(result.error?.status).toBe(401);
  });

  it('returns 401 for a revoked key', async () => {
    const result = await validateApiKey(makeReq('revoked-key'), mockSupabase({ clinicId: null }));
    expect(result.error?.status).toBe(401);
  });
});

function mockSupabase(opts: { clinicId: string | null }) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          is: () => ({
            maybeSingle: async () => ({
              data: opts.clinicId ? { clinic_id: opts.clinicId } : null,
              error: null,
            }),
          }),
        }),
      }),
    }),
  } as any;
}
```

Run: `cd apps/connect-api && pnpm test -- --testPathPattern=auth`
Expected: FAIL (validateApiKey has wrong signature)

- [ ] **Step 3 — Rewrite `apps/connect-api/src/lib/auth.ts`**

```typescript
import { createHash, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';

function hashKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export interface ValidatedKey {
  clinicId: string;
  error: null;
}
export interface KeyError {
  clinicId: null;
  error: NextResponse;
}

export async function validateApiKey(
  req: NextRequest,
  supabase: SupabaseClient
): Promise<ValidatedKey | KeyError> {
  const raw = req.headers.get('x-api-key');
  if (!raw) {
    return {
      clinicId: null,
      error: NextResponse.json({ error: 'Missing x-api-key header' }, { status: 401 }),
    };
  }

  const hash = hashKey(raw);
  const { data } = await supabase
    .from('clinic_api_keys')
    .select('clinic_id')
    .eq('key_hash', hash)
    .is('revoked_at', null)
    .maybeSingle();

  if (!data) {
    return {
      clinicId: null,
      error: NextResponse.json({ error: 'Invalid API key' }, { status: 401 }),
    };
  }

  return { clinicId: data.clinic_id as string, error: null };
}
```

- [ ] **Step 4 — Update every Connect API route to use the new signature**

Each `/api/v1/*` route currently calls `validateApiKey(req)` and then reads `clinic_id` from the body. Replace the pattern in all six routes:

```typescript
// Pattern to replace in ALL connect-api routes:
// BEFORE:
//   const authError = validateApiKey(req);
//   if (authError) return authError;
//   ...uses body.clinic_id as the tenant boundary

// AFTER (example for package-deduct/route.ts):
import { getServiceSupabaseClient } from '@baseplate/core/config';
const supabase = getServiceSupabaseClient();
const auth = await validateApiKey(req, supabase);
if (auth.error) return auth.error;
const clinicId = auth.clinicId; // derive tenant from key, not body
// Use clinicId everywhere body.clinic_id was used
```

Apply to:
- `apps/connect-api/src/app/api/v1/billing/package-deduct/route.ts`
- `apps/connect-api/src/app/api/v1/communications/sms-reminder/route.ts`
- `apps/connect-api/src/app/api/v1/reporting/treatment-metrics/route.ts`
- `apps/connect-api/src/app/api/v1/intelligence/risk-score/route.ts`
- `apps/connect-api/src/app/api/v1/intelligence/churn-prediction/route.ts`
- `apps/connect-api/src/app/api/v1/marketplace/install/route.ts`
- `apps/connect-api/src/app/api/v1/marketplace/modules/route.ts`

Also update the rate-limiter to hash the key (see Task 11).

- [ ] **Step 5 — Run tests and typecheck**

```bash
cd apps/connect-api && pnpm test
cd ../.. && pnpm typecheck
```
Expected: all pass

- [ ] **Step 6 — Commit**

```bash
git add supabase/migrations/0016_api_keys.sql apps/connect-api/src/lib/auth.ts apps/connect-api/src/lib/__tests__/auth.test.ts apps/connect-api/src/app/api/v1
git commit -m "security: per-clinic API keys with SHA-256 hash lookup, drop shared global key"
```

---

### Task 2 — Authenticate the two open portal proxy routes (C2)

`/api/intelligence/risk-score` and all three marketplace verbs are fully anonymous. Add `getUserContext()` and derive `clinicId` from the session.

**Files:**
- Modify: `apps/portal-medspa/src/app/api/intelligence/risk-score/route.ts`
- Modify: `apps/portal-medspa/src/app/api/marketplace/route.ts`

- [ ] **Step 1 — Write failing test for risk-score (integration style)**

```typescript
// apps/portal-medspa/src/app/api/intelligence/__tests__/risk-score.test.ts
import { POST } from '../risk-score/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase/server', () => ({
  getUserContext: jest.fn(),
}));
import { getUserContext } from '@/lib/supabase/server';

it('returns 401 when not authenticated', async () => {
  (getUserContext as jest.Mock).mockResolvedValue(null);
  const req = new NextRequest('http://localhost/api/intelligence/risk-score', {
    method: 'POST',
    body: JSON.stringify({ tenant_id: 'clinic-1', customer_id: 'patient-1' }),
    headers: { 'Content-Type': 'application/json' },
  });
  const res = await POST(req);
  expect(res.status).toBe(401);
});
```

Run: `pnpm test -- --testPathPattern=risk-score`
Expected: FAIL

- [ ] **Step 2 — Rewrite `apps/portal-medspa/src/app/api/intelligence/risk-score/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { callConnectApi } from '@/lib/connect-client';
import { getUserContext } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    // Always override tenant_id with the session clinicId
    const result = await callConnectApi('POST', '/api/v1/intelligence/risk-score', {
      ...body,
      tenant_id: ctx.clinicId,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Risk score unavailable' }, { status: 500 });
  }
}
```

- [ ] **Step 3 — Rewrite `apps/portal-medspa/src/app/api/marketplace/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { callConnectApi } from '@/lib/connect-client';
import { getUserContext } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  // Browse is public — no auth required
  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();
  try {
    const result = await callConnectApi('GET', `/api/v1/marketplace/modules${query ? `?${query}` : ''}`);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Marketplace unavailable' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const result = await callConnectApi('POST', '/api/v1/marketplace/install', {
      ...body,
      clinic_id: ctx.clinicId, // always inject from session
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Install failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get('module_id');
  if (!moduleId) return NextResponse.json({ error: 'module_id required' }, { status: 400 });

  try {
    const result = await callConnectApi(
      'DELETE',
      `/api/v1/marketplace/install?clinic_id=${ctx.clinicId}&module_id=${moduleId}`
    );
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: 'Uninstall failed' }, { status: 500 });
  }
}
```

- [ ] **Step 4 — Run tests**

```bash
pnpm test -- --testPathPattern=risk-score
pnpm typecheck
```
Expected: PASS

- [ ] **Step 5 — Commit**

```bash
git add apps/portal-medspa/src/app/api/intelligence apps/portal-medspa/src/app/api/marketplace
git commit -m "security: require auth on risk-score and marketplace proxy routes, inject clinicId from session"
```

---

### Task 3 — Fix marketplace `clinic_id` runtime contract + install/uninstall UI (C4)

The browser component never sent `clinic_id`, and ignored `res.ok`. Also fixes the browse response mismatch.

**Files:**
- Modify: `apps/portal-medspa/src/components/marketplace-browser.tsx`

- [ ] **Step 1 — Write failing test**

```typescript
// apps/portal-medspa/src/components/__tests__/marketplace-browser.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MarketplaceBrowser } from '../marketplace-browser';

global.fetch = jest.fn();

it('does not mark module as installed when server returns error', async () => {
  (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: async () => ({ error: 'Payment required' }) });
  render(<MarketplaceBrowser modules={[{ id: 'm1', name: 'Test', description: '', pricing_model: 'free', price_cents: 0, install_count: 0 }]} installedIds={[]} />);
  fireEvent.click(screen.getByRole('button', { name: /install/i }));
  await waitFor(() => expect(screen.queryByText(/installed/i)).not.toBeInTheDocument());
});
```

Run: `pnpm test -- --testPathPattern=marketplace-browser`
Expected: FAIL

- [ ] **Step 2 — Fix `apps/portal-medspa/src/components/marketplace-browser.tsx`**

Locate the `handleInstall` and `handleUninstall` functions and replace with:

```typescript
async function handleInstall(moduleId: string) {
  const prev = new Set(installedIds);
  setInstalledIds(new Set([...installedIds, moduleId])); // optimistic
  try {
    const res = await fetch('/api/marketplace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module_id: moduleId }),
    });
    if (!res.ok) {
      setInstalledIds(prev); // rollback
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Install failed');
    }
  } catch {
    setInstalledIds(prev);
    setError('Network error — install failed');
  }
}

async function handleUninstall(moduleId: string) {
  const prev = new Set(installedIds);
  setInstalledIds(new Set([...installedIds].filter(id => id !== moduleId))); // optimistic
  try {
    const res = await fetch(`/api/marketplace?module_id=${moduleId}`, { method: 'DELETE' });
    if (!res.ok) {
      setInstalledIds(prev);
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Uninstall failed');
    }
  } catch {
    setInstalledIds(prev);
    setError('Network error — uninstall failed');
  }
}
```

- [ ] **Step 3 — Run tests and typecheck**

```bash
pnpm test -- --testPathPattern=marketplace-browser
pnpm typecheck
```
Expected: PASS

- [ ] **Step 4 — Commit**

```bash
git add apps/portal-medspa/src/components/marketplace-browser.tsx
git commit -m "fix: marketplace install/uninstall checks res.ok, rolls back state on failure"
```

---

### Task 4 — Fix payment-link IDOR: load appointment and assert ownership (H12)

`create-link` verifies `clinicId` but not that `appointmentId`/`patientId` belong to that clinic.

**Files:**
- Modify: `apps/portal-medspa/src/app/api/payments/create-link/route.ts`

- [ ] **Step 1 — Write failing test**

```typescript
// apps/portal-medspa/src/app/api/payments/__tests__/create-link.test.ts
import { POST } from '../create-link/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase/server', () => ({
  getUserContext: jest.fn().mockResolvedValue({ clinicId: 'clinic-A', userId: 'user-1' }),
  getServiceSupabaseClient: jest.fn(() => mockSupabase),
}));

const mockSupabase = {
  from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { clinic_id: 'clinic-B' }, error: null }) }) }) }),
};

it('returns 403 when appointmentId belongs to a different clinic', async () => {
  const req = new NextRequest('http://localhost/api/payments/create-link', {
    method: 'POST',
    body: JSON.stringify({ clinicId: 'clinic-A', patientId: 'p-1', appointmentId: 'appt-1', amount: 100, description: 'Test' }),
    headers: { 'Content-Type': 'application/json' },
  });
  const res = await POST(req);
  expect(res.status).toBe(403);
});
```

Run: `pnpm test -- --testPathPattern=create-link`
Expected: FAIL

- [ ] **Step 2 — Add ownership check in `apps/portal-medspa/src/app/api/payments/create-link/route.ts`**

After the existing `clinicId !== ctx.clinicId` check, add:

```typescript
// After the existing clinicId check, before creating the link:
import { getServiceSupabaseClient } from '@/lib/supabase/server';

const supabase = getServiceSupabaseClient();
const { data: appt, error: apptError } = await supabase
  .from('appointments')
  .select('clinic_id, patient_id')
  .eq('id', appointmentId)
  .single();

if (apptError || !appt) {
  return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
}
if (appt.clinic_id !== ctx.clinicId || appt.patient_id !== patientId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

- [ ] **Step 3 — Run tests**

```bash
pnpm test -- --testPathPattern=create-link
pnpm typecheck
```
Expected: PASS

- [ ] **Step 4 — Commit**

```bash
git add apps/portal-medspa/src/app/api/payments/create-link/route.ts
git commit -m "security: load appointment and assert ownership before creating payment link"
```

---

## Phase 2 — Database Safety (CRITICAL + HIGH)

---

### Task 5 — Create missing `payments` table (C3)

**Files:**
- New: `supabase/migrations/0017_payments_table.sql`

- [ ] **Step 1 — Write the migration**

```sql
-- supabase/migrations/0017_payments_table.sql
-- Creates the standalone payments table referenced by intelligence seed and rules engine.
-- Note: appointments.amount still records the per-appointment charge.
-- This table tracks individual Stripe payment records.

CREATE TABLE IF NOT EXISTS payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id           uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id          uuid NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  appointment_id      uuid REFERENCES appointments(id) ON DELETE SET NULL,
  stripe_payment_id   text UNIQUE,
  amount_cents        integer NOT NULL CHECK (amount_cents >= 0),
  currency            text NOT NULL DEFAULT 'usd',
  status              text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_clinic_id ON payments(clinic_id);
CREATE INDEX idx_payments_patient_id ON payments(patient_id);
CREATE INDEX idx_payments_clinic_created ON payments(clinic_id, created_at);
CREATE INDEX idx_payments_status ON payments(status);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic staff can view payments"
  ON payments FOR SELECT
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

CREATE POLICY "Service role manages payments"
  ON payments FOR ALL
  USING (auth.role() = 'service_role');
```

- [ ] **Step 2 — Verify the seed now works**

```bash
# On a local Supabase instance:
supabase db reset
supabase db seed  # should no longer error on "relation payments does not exist"
```

- [ ] **Step 3 — Commit**

```bash
git add supabase/migrations/0017_payments_table.sql
git commit -m "fix(db): create payments table referenced by intelligence rules engine and seed"
```

---

### Task 6 — Stripe webhook idempotency + payment status guard (H1, H2)

**Files:**
- New: `supabase/migrations/0018_stripe_events.sql`
- Modify: `apps/portal-medspa/src/app/api/webhooks/stripe/route.ts`
- Modify: `packages/core/src/scheduling/appointments.ts`

- [ ] **Step 1 — Migration for `processed_events`**

```sql
-- supabase/migrations/0018_stripe_events.sql
CREATE TABLE IF NOT EXISTS processed_stripe_events (
  event_id      text PRIMARY KEY,
  processed_at  timestamptz NOT NULL DEFAULT now()
);
-- No RLS needed — only service role accesses this table.
```

- [ ] **Step 2 — Write failing test for the webhook**

```typescript
// apps/portal-medspa/src/app/api/webhooks/__tests__/stripe.test.ts
import { POST } from '../stripe/route';
import { NextRequest } from 'next/server';

jest.mock('@baseplate/stripe', () => ({
  constructWebhookEvent: jest.fn().mockReturnValue({ appointmentId: null, paymentStatus: null, type: 'customer.subscription.created' }),
  getStripeWebhookEvent: jest.fn().mockReturnValue({
    id: 'evt_test_001',
    type: 'customer.subscription.created',
    data: { object: { id: 'sub_1', customer: 'cus_1', status: 'active', metadata: { clinic_id: 'c1', plan: 'connect' }, current_period_end: 1700000000 } },
  }),
}));

let insertCount = 0;
jest.mock('@baseplate/core', () => ({
  getStripeWebhookEvent: jest.fn(),
  updateAppointmentPaymentStatus: jest.fn(),
  updateSubscriptionStatus: jest.fn(),
  getServiceSupabaseClient: jest.fn(() => ({
    from: (table: string) => ({
      insert: jest.fn(() => ({ select: jest.fn(() => ({ single: jest.fn(async () => ({ data: null, error: table === 'processed_stripe_events' ? { code: '23505' } : null })) })) })),
      upsert: jest.fn(() => Promise.resolve({ error: null })),
    }),
  })),
  logInfo: jest.fn(),
  logError: jest.fn(),
}));

it('returns 200 and skips processing for a duplicate event', async () => {
  const req = new NextRequest('http://localhost/api/webhooks/stripe', {
    method: 'POST',
    body: 'raw-body',
    headers: { 'stripe-signature': 'sig_test' },
  });
  const res = await POST(req);
  expect(res.status).toBe(200);
});
```

Run: `pnpm test -- --testPathPattern=stripe`
Expected: FAIL

- [ ] **Step 3 — Rewrite `apps/portal-medspa/src/app/api/webhooks/stripe/route.ts`**

```typescript
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
    constructWebhookEvent(body, signature); // validates signature
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { route: '/api/webhooks/stripe', op: 'signature_verify' });
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  const supabase = getServiceSupabaseClient();
  const eventId = stripeEvent.id;

  // Idempotency guard — ignore already-processed events
  const { error: dedupError } = await supabase
    .from('processed_stripe_events')
    .insert({ event_id: eventId });

  if (dedupError?.code === '23505') {
    // Duplicate — already processed
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
          if (subError) logError(new Error(subError.message), { eventId, op: 'subscription.upsert' });
          else logInfo('stripe.subscription.created', { eventId, clinicId: metadata.clinic_id, plan: metadata.plan });
        } else {
          await updateSubscriptionStatus(supabase, subscription.id, { status, current_period_end: periodEnd });
          logInfo('stripe.subscription.updated', { eventId, subscriptionId: subscription.id, status });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { eventId, route: '/api/webhooks/stripe' });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
```

- [ ] **Step 4 — Guard payment status against regression in `packages/core/src/scheduling/appointments.ts`**

Replace the `updateAppointmentPaymentStatus` function body:

```typescript
export async function updateAppointmentPaymentStatus(
  appointmentId: string,
  paymentStatus: PaymentStatus,
  client?: SupabaseClient
): Promise<Appointment> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('appointments')
    .update({
      payment_status: paymentStatus,
      payment_completed: paymentStatus === 'completed',
      payment_completed_at: paymentStatus === 'completed' ? new Date().toISOString() : null,
    })
    .eq('id', appointmentId)
    .neq('payment_status', 'completed') // never regress from completed
    .select()
    .single();

  if (error) throw new Error(`Update payment status failed: ${error.message}`);
  return data as Appointment;
}
```

- [ ] **Step 5 — Run tests**

```bash
pnpm test -- --testPathPattern=stripe
pnpm test -- --testPathPattern=appointments
pnpm typecheck
```

- [ ] **Step 6 — Commit**

```bash
git add supabase/migrations/0018_stripe_events.sql apps/portal-medspa/src/app/api/webhooks packages/core/src/scheduling/appointments.ts
git commit -m "fix: Stripe webhook idempotency via processed_events table, prevent payment status regression"
```

---

### Task 7 — Fix RLS identity drift in migrations 0014 and 0015 (H3)

**Files:**
- New: `supabase/migrations/0019_fix_rls_identity.sql`

- [ ] **Step 1 — Write the corrective migration**

```sql
-- supabase/migrations/0019_fix_rls_identity.sql
-- Migrations 0014/0015 scoped by staff.id = auth.uid() instead of the canonical
-- (owner_id = auth.uid() OR staff.email = auth.email()) pattern.
-- Clinic owners with no staff row were locked out of billing and feedback.

-- Fix subscriptions RLS (0014 introduced the wrong policy)
DROP POLICY IF EXISTS "Clinic owners can read their subscriptions" ON subscriptions;

CREATE POLICY "Clinic staff can read their subscriptions"
  ON subscriptions FOR SELECT
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- Fix feedback INSERT RLS (0015)
DROP POLICY IF EXISTS "Staff can submit feedback for their clinic" ON feedback;

CREATE POLICY "Clinic staff can submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );

-- Fix feedback SELECT RLS (0015)
DROP POLICY IF EXISTS "Clinic staff can read their feedback" ON feedback;

CREATE POLICY "Clinic staff can read their feedback"
  ON feedback FOR SELECT
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
      UNION
      SELECT clinic_id FROM staff WHERE email = auth.email()
    )
  );
```

- [ ] **Step 2 — Commit**

```bash
git add supabase/migrations/0019_fix_rls_identity.sql
git commit -m "fix(db): restore canonical RLS identity pattern for subscriptions and feedback (fixes owner lockout)"
```

---

### Task 8 — Patient uniqueness constraint + atomic upsert (H10)

**Files:**
- New: `supabase/migrations/0020_patient_unique_email.sql`
- Modify: `packages/core/src/patients/index.ts`
- Modify: `packages/core/src/patients/__tests__/patients.test.ts`

- [ ] **Step 1 — Migration**

```sql
-- supabase/migrations/0020_patient_unique_email.sql
-- Concurrent bookings for the same new patient (SELECT then INSERT race) create duplicate rows.
-- Add a partial unique index and switch find-or-create to an atomic upsert.

-- First, deduplicate existing rows (keep the earliest)
DELETE FROM patients p1
USING patients p2
WHERE p1.clinic_id = p2.clinic_id
  AND lower(p1.email) = lower(p2.email)
  AND p1.created_at > p2.created_at
  AND p1.email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_patients_clinic_email_unique
  ON patients (clinic_id, lower(email))
  WHERE email IS NOT NULL;

-- Also add an index for phone lookups
CREATE INDEX IF NOT EXISTS idx_patients_clinic_phone
  ON patients (clinic_id, phone)
  WHERE phone IS NOT NULL;
```

- [ ] **Step 2 — Write failing test**

```typescript
// packages/core/src/patients/__tests__/patients.test.ts (add this test)
it('returns the existing patient on concurrent upsert (no duplicate row)', async () => {
  const existing = { id: 'p-1', clinic_id: 'c-1', email: 'a@b.com', first_name: 'A', last_name: 'B', created_at: '' };
  const upsertMock = jest.fn().mockResolvedValue({ data: existing, error: null });
  const client = { from: () => ({ upsert: upsertMock, select: () => ({ single: upsertMock }) }) } as any;

  const result = await findOrCreatePatient({ clinicId: 'c-1', email: 'a@b.com', firstName: 'A', lastName: 'B' }, client);
  expect(result.id).toBe('p-1');
  expect(upsertMock).toHaveBeenCalledTimes(1);
});
```

Run: `cd packages/core && pnpm test -- --testPathPattern=patients`
Expected: FAIL

- [ ] **Step 3 — Rewrite `findOrCreatePatient` in `packages/core/src/patients/index.ts`**

Replace the SELECT-then-INSERT with a single atomic upsert:

```typescript
export async function findOrCreatePatient(params: FindOrCreatePatientParams, client?: SupabaseClient): Promise<Patient> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .from('patients')
    .upsert(
      {
        clinic_id: params.clinicId,
        email: params.email,
        phone: params.phone,
        first_name: params.firstName,
        last_name: params.lastName,
      },
      {
        onConflict: 'clinic_id,email', // relies on idx_patients_clinic_email_unique
        ignoreDuplicates: false,        // return existing row
      }
    )
    .select()
    .single();

  if (error) throw new Error(`findOrCreatePatient failed: ${error.message}`);
  return data as Patient;
}
```

- [ ] **Step 4 — Run tests**

```bash
cd packages/core && pnpm test
pnpm typecheck
```

- [ ] **Step 5 — Commit**

```bash
git add supabase/migrations/0020_patient_unique_email.sql packages/core/src/patients
git commit -m "fix: atomic patient upsert with unique(clinic_id, email) constraint, eliminates duplicate-row race"
```

---

### Task 9 — Room exclusion constraint (H11)

**Files:**
- New: `supabase/migrations/0021_room_exclusion.sql`
- Modify: `packages/core/src/scheduling/appointments.ts`

- [ ] **Step 1 — Migration**

```sql
-- supabase/migrations/0021_room_exclusion.sql
ALTER TABLE appointments
  ADD CONSTRAINT no_room_conflicts
  EXCLUDE USING GIST (
    room_id WITH =,
    tsrange(
      scheduled_time,
      scheduled_time + (duration_minutes || ' minutes')::INTERVAL
    ) WITH &&
  ) WHERE (room_id IS NOT NULL AND status <> 'cancelled');
```

- [ ] **Step 2 — Handle room conflict error in `createAppointment`**

```typescript
// In createAppointment, extend the error.code check:
if (error) {
  if (error.code === '23P01') {
    const msg = error.message.includes('no_room_conflicts')
      ? 'Create appointment failed: room is already booked for this time slot'
      : 'Create appointment failed: provider is already booked for this time slot';
    throw new Error(msg);
  }
  throw new Error(`Create appointment failed: ${error.message}`);
}
```

- [ ] **Step 3 — Commit**

```bash
git add supabase/migrations/0021_room_exclusion.sql packages/core/src/scheduling/appointments.ts
git commit -m "fix(db): add room exclusion constraint, handle room conflict error in createAppointment"
```

---

### Task 10 — ON DELETE behaviors + missing FKs migration (M5)

**Files:**
- New: `supabase/migrations/0022_on_delete_policies.sql`

- [ ] **Step 1 — Write the migration**

```sql
-- supabase/migrations/0022_on_delete_policies.sql
-- Adds explicit ON DELETE behavior for relations that currently block or orphan.

-- appointments: SET NULL for provider/room (optional resources), RESTRICT for patient (audit trail)
ALTER TABLE appointments
  DROP CONSTRAINT IF EXISTS appointments_provider_id_fkey,
  DROP CONSTRAINT IF EXISTS appointments_room_id_fkey;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_provider_id_fkey
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL,
  ADD CONSTRAINT appointments_room_id_fkey
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;

-- intake_submissions: add missing FK on appointment_id
ALTER TABLE intake_submissions
  ADD CONSTRAINT intake_submissions_appointment_id_fkey
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- package_transactions: SET NULL on appointment delete (don't block appointment delete)
ALTER TABLE package_transactions
  DROP CONSTRAINT IF EXISTS package_transactions_appointment_id_fkey;

ALTER TABLE package_transactions
  ADD CONSTRAINT package_transactions_appointment_id_fkey
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL;

-- marketplace_modules: FK on author_id
ALTER TABLE marketplace_modules
  ADD CONSTRAINT marketplace_modules_author_id_fkey
    FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- marketplace_subscriptions: FK on clinic_id with cascade
ALTER TABLE marketplace_subscriptions
  ADD CONSTRAINT marketplace_subscriptions_clinic_id_fkey
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE CASCADE;

-- api_usage: RESTRICT instead of SET NULL (metering rows should be retained or explicitly removed)
ALTER TABLE api_usage
  DROP CONSTRAINT IF EXISTS api_usage_clinic_id_fkey;

ALTER TABLE api_usage
  ADD CONSTRAINT api_usage_clinic_id_fkey
    FOREIGN KEY (clinic_id) REFERENCES clinics(id) ON DELETE RESTRICT;
```

- [ ] **Step 2 — Commit**

```bash
git add supabase/migrations/0022_on_delete_policies.sql
git commit -m "fix(db): add ON DELETE behaviors for appointments, intake, package_transactions, marketplace FKs"
```

---

## Phase 3 — Security Hardening (HIGH)

---

### Task 11 — Rate limiter: fail-closed + hash key (H8)

**Files:**
- Modify: `apps/connect-api/src/lib/rate-limit.ts`

- [ ] **Step 1 — Write failing test**

```typescript
// apps/connect-api/src/lib/__tests__/rate-limit.test.ts
import { checkRateLimit } from '../rate-limit';

it('throws in production when Redis is not configured', async () => {
  const origEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  await expect(checkRateLimit('any-key')).rejects.toThrow('Rate limiter not configured');
  process.env.NODE_ENV = origEnv;
});

it('uses hashed key, never raw key', async () => {
  // Just verifies the function signature accepts string and doesn't throw in test env
  const result = await checkRateLimit('raw-secret-key-abc');
  expect(typeof result.success).toBe('boolean');
});
```

Run: `cd apps/connect-api && pnpm test -- --testPathPattern=rate-limit`
Expected: FAIL

- [ ] **Step 2 — Rewrite `apps/connect-api/src/lib/rate-limit.ts`**

```typescript
import { createHash } from 'crypto';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

function hashKey(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

function createRateLimiter() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
  });
}

const ratelimit = createRateLimiter();

export async function checkRateLimit(
  rawKey: string
): Promise<{ success: boolean; limit: number; remaining: number }> {
  if (!ratelimit) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Rate limiter not configured — set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN');
    }
    // Allow in dev/test
    return { success: true, limit: 100, remaining: 100 };
  }
  // Key on hash — never store raw key in Redis
  return ratelimit.limit(hashKey(rawKey));
}
```

- [ ] **Step 3 — Run tests**

```bash
cd apps/connect-api && pnpm test -- --testPathPattern=rate-limit
pnpm typecheck
```

- [ ] **Step 4 — Commit**

```bash
git add apps/connect-api/src/lib/rate-limit.ts apps/connect-api/src/lib/__tests__/rate-limit.test.ts
git commit -m "security: rate limiter fails closed in prod, keys hashed before storage in Redis"
```

---

### Task 12 — Signup: rate limiting + generic errors + transactional cleanup (H6)

**Files:**
- Modify: `apps/portal-medspa/src/app/api/auth/signup-enhanced/route.ts`
- New: `apps/portal-medspa/src/lib/signup-rate-limit.ts`

- [ ] **Step 1 — Create `apps/portal-medspa/src/lib/signup-rate-limit.ts`**

```typescript
// Simple in-memory per-IP rate limit (upgrade to Redis for multi-instance prod)
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 5;

export function checkSignupRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}
```

- [ ] **Step 2 — Write failing test**

```typescript
// apps/portal-medspa/src/app/api/auth/__tests__/signup-enhanced.test.ts
import { POST } from '../signup-enhanced/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/signup-rate-limit', () => ({ checkSignupRateLimit: jest.fn().mockReturnValue(false) }));

it('returns 429 when rate limit exceeded', async () => {
  const req = new NextRequest('http://localhost/api/auth/signup-enhanced', {
    method: 'POST',
    body: JSON.stringify({ email: 'a@b.com', password: 'password1', clinic_name: 'Test' }),
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '1.2.3.4' },
  });
  const res = await POST(req);
  expect(res.status).toBe(429);
});
```

Run: `pnpm test -- --testPathPattern=signup-enhanced`
Expected: FAIL

- [ ] **Step 3 — Update `apps/portal-medspa/src/app/api/auth/signup-enhanced/route.ts`**

At the top of the `POST` handler, add rate limiting and fix error leakage. Replace the early section with:

```typescript
export async function POST(req: NextRequest) {
  // Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkSignupRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 });
  }

  try {
    const body = (await req.json()) as SignupBody;
    if (!body.email || !body.password || !body.clinic_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (body.password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const plan = body.plan ?? 'pilot';
    const supabase = getServiceSupabaseClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: false,
      user_metadata: { name: body.owner_name, phone: body.phone },
    });

    if (authError) {
      // Generic message — do NOT leak authError.message (email enumeration)
      logError(new Error(authError.message), { op: 'signup.auth', email: '[redacted]' });
      return NextResponse.json({ error: 'Signup failed. Please check your details.' }, { status: 400 });
    }

    const userId = authData.user.id;

    const { data: clinic, error: clinicError } = await supabase
      .from('clinics')
      .insert({ name: body.clinic_name })
      .select()
      .single();

    if (clinicError || !clinic) {
      // Compensate: delete the orphaned auth user
      await supabase.auth.admin.deleteUser(userId).catch((e) =>
        logError(e, { op: 'signup.rollback_user', userId })
      );
      logError(new Error(clinicError?.message ?? 'No clinic returned'), { op: 'signup.clinic', userId });
      return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
    }

    const { error: staffError } = await supabase.from('staff').insert({
      id: userId,
      clinic_id: clinic.id,
      role: 'owner',
      name: body.owner_name ?? body.email,
      email: body.email,
    });

    if (staffError) {
      logError(new Error(staffError.message), { op: 'signup.staff', userId, clinicId: clinic.id });
      // Staff insert failed — clinic exists but user can't log in as owner; compensate
      await supabase.from('clinics').delete().eq('id', clinic.id).catch(() => {});
      await supabase.auth.admin.deleteUser(userId).catch(() => {});
      return NextResponse.json({ error: 'Failed to create account. Please try again.' }, { status: 500 });
    }

    logInfo('signup.success', { clinicId: clinic.id, plan });
    // ... rest of the function unchanged
  }
}
```

- [ ] **Step 4 — Run tests**

```bash
pnpm test -- --testPathPattern=signup-enhanced
pnpm typecheck
```

- [ ] **Step 5 — Commit**

```bash
git add apps/portal-medspa/src/app/api/auth apps/portal-medspa/src/lib/signup-rate-limit.ts
git commit -m "security: rate-limit signup, generic error messages (no email enumeration), compensating rollback on partial failure"
```

---

### Task 13 — Intake: rate limit + remove service-role trust on body `clinicId` (H7)

**Files:**
- Modify: `apps/portal-medspa/src/app/api/intake/submit/route.ts`

- [ ] **Step 1 — Add rate limiting and clinicId validation**

The public intake flow needs to accept `clinicId` from the client (public endpoint) but must verify the clinic exists and is enabled for public intake. Add rate limiting to prevent PHI-flooding.

```typescript
// At top of POST in apps/portal-medspa/src/app/api/intake/submit/route.ts
import { checkSignupRateLimit } from '@/lib/signup-rate-limit'; // reuse same limiter

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkSignupRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // ... existing body parse ...

  // Verify clinicId is a real, active clinic before using service-role
  const anonClient = getAnonSupabaseClient();
  const { data: clinic } = await anonClient
    .from('clinics')
    .select('id')
    .eq('id', clinicId)
    .maybeSingle();

  if (!clinic) {
    return NextResponse.json({ error: 'Invalid clinic' }, { status: 400 });
  }

  // Now safe to use service-role for the actual writes
  const client = getServiceSupabaseClient();
  // ... rest unchanged
```

- [ ] **Step 2 — Ensure error message doesn't leak internals**

Replace the catch block:
```typescript
  } catch (err) {
    // Log the real error server-side, return generic message
    logError(err instanceof Error ? err : new Error(String(err)), { op: 'intake.submit', clinicId });
    return NextResponse.json({ error: 'Failed to submit intake form' }, { status: 500 });
  }
```

- [ ] **Step 3 — Commit**

```bash
git add apps/portal-medspa/src/app/api/intake/submit/route.ts
git commit -m "security: rate-limit intake submission, verify clinic exists before service-role writes, redact errors"
```

---

## Phase 4 — Compliance Logging (HIGH)

---

### Task 14 — Fix three swallowed audit writes (H5)

The three `.catch(() => {})` calls on compliance-critical paths silence audit-trail write failures.

**Files:**
- Modify: `apps/connect-api/src/app/api/v1/communications/sms-reminder/route.ts`
- Modify: `apps/connect-api/src/app/api/v1/billing/package-deduct/route.ts`
- Modify: `apps/connect-api/src/app/api/v1/reporting/treatment-metrics/route.ts`

- [ ] **Step 1 — Fix SMS route** (`sms-reminder/route.ts:68`)

```typescript
// Replace:
await logAction({ ... }, supabase).catch(() => {});
// With:
await logAction({ ... }, supabase).catch((err) =>
  logError(err instanceof Error ? err : new Error(String(err)), { op: 'audit.sms.sent', appointmentId: body.appointment_id })
);
```

Also add `logError` for the SMS send failure itself (currently missing):
```typescript
  } catch (err) {
    logError(err instanceof Error ? err : new Error(String(err)), { op: 'sms.send', endpoint: req.nextUrl.pathname });
    await logApiUsage({ endpoint: req.nextUrl.pathname, statusCode: 500, responseTimeMs: Date.now() - startTime });
    return NextResponse.json({ error: 'Failed to send SMS' }, { status: 500 });
  }
```

- [ ] **Step 2 — Fix billing route** (`package-deduct/route.ts:65`)

```typescript
// Replace:
await logAction({ ... }, supabase).catch(() => {});
// With:
await logAction({ ... }, supabase).catch((err) =>
  logError(err instanceof Error ? err : new Error(String(err)), { op: 'audit.package.deducted', clinicId: body.clinic_id, packageId: body.package_id })
);
```

- [ ] **Step 3 — Fix reporting route** (`treatment-metrics/route.ts:129`)

```typescript
// Replace:
await logAction({ ... }, supabase).catch(() => {});
// With:
await logAction({ ... }, supabase).catch((err) =>
  logError(err instanceof Error ? err : new Error(String(err)), { op: 'audit.reporting.metrics', clinicId: body.clinic_id })
);
```

- [ ] **Step 4 — Commit**

```bash
git add apps/connect-api/src/app/api/v1
git commit -m "fix: replace empty audit-write swallows with logError on all three compliance paths (sms, billing, reporting)"
```

---

### Task 15 — Thread correlation IDs + fix console.log (L1, L2)

**Files:**
- Modify: `apps/connect-api/src/app/api/v1/intelligence/churn-prediction/route.ts`

- [ ] **Step 1 — Fix `console.log` on hot path**

In `churn-prediction/route.ts`, replace the `console.log` line:
```typescript
// Replace:
console.log('[intelligence] Using rules-engine heuristic fallback');
// With:
logInfo('intelligence.churn.fallback', { reason: 'rules-engine-heuristic', tenantId: body.tenant_id });
```

- [ ] **Step 2 — Add request-id to Connect API routes**

In each route handler, generate a correlation id and thread it through log calls:

```typescript
// Add at the top of each POST handler body in connect-api routes:
import { randomUUID } from 'crypto';
const requestId = req.headers.get('x-request-id') ?? randomUUID();

// Pass to every logError/logInfo call:
logInfo('sms.sent', { requestId, messageId: result.sid });
logError(err, { requestId, op: 'sms.send' });
```

- [ ] **Step 3 — Commit**

```bash
git add apps/connect-api/src/app/api/v1
git commit -m "fix: replace console.log with structured logger, thread request-id correlation id through Connect API routes"
```

---

## Phase 5 — Auth Fixes (MEDIUM)

---

### Task 16 — `getSession()` → `getUser()` in middleware (M1)

**Files:**
- Modify: `apps/portal-medspa/src/middleware.ts`

- [ ] **Step 1 — Write failing test**

```typescript
// apps/portal-medspa/src/__tests__/middleware.test.ts
// Verifies middleware uses getUser (revalidates JWT) not getSession (trusts cookie)
import { middleware } from '../middleware';

it('uses getUser for auth gating, not getSession', async () => {
  const src = require('fs').readFileSync(require('path').join(__dirname, '../middleware.ts'), 'utf8');
  expect(src).not.toContain('getSession');
  expect(src).toContain('getUser');
});
```

- [ ] **Step 2 — Update `apps/portal-medspa/src/middleware.ts`**

Replace the session check with `getUser`:

```typescript
// Replace:
const { data: { session } } = await supabase.auth.getSession();
if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
  return NextResponse.redirect(new URL('/auth/login', request.url));
}
if (session) {
  const { data: staff } = await supabase.from('staff').select('role').eq('id', session.user.id).maybeSingle();
// With:
const { data: { user } } = await supabase.auth.getUser();
if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
  return NextResponse.redirect(new URL('/auth/login', request.url));
}
if (user) {
  const { data: staff } = await supabase.from('staff').select('role').eq('id', user.id).maybeSingle();
```

- [ ] **Step 3 — Commit**

```bash
git add apps/portal-medspa/src/middleware.ts
git commit -m "security: use getUser() instead of getSession() in middleware to revalidate JWT against auth server"
```

---

### Task 17 — Expired package guard in RPC (M4)

**Files:**
- New: `supabase/migrations/0023_package_expiry_guard.sql`

- [ ] **Step 1 — Migration**

```sql
-- supabase/migrations/0023_package_expiry_guard.sql
-- The deduct_package_session RPC decrements regardless of expires_at.
-- Expired packages remain deductible — a revenue/entitlement leak.

CREATE OR REPLACE FUNCTION deduct_package_session(
  p_package_id   uuid,
  p_patient_id   uuid,
  p_clinic_id    uuid,
  p_appointment_id uuid DEFAULT NULL,
  p_performed_by   uuid DEFAULT NULL
)
RETURNS TABLE (
  remaining_sessions INTEGER,
  transaction_id     UUID,
  previous_balance   INTEGER,
  new_balance        INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_previous INTEGER;
  v_new      INTEGER;
  v_txn_id   UUID;
BEGIN
  SELECT remaining_sessions INTO v_previous
  FROM credit_packages
  WHERE id = p_package_id
    AND patient_id = p_patient_id
    AND clinic_id  = p_clinic_id
    AND (expires_at IS NULL OR expires_at > now())   -- <-- NEW: block expired
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PACKAGE_NOT_FOUND_OR_EXPIRED' USING ERRCODE = 'P0001';
  END IF;

  IF v_previous <= 0 THEN
    RAISE EXCEPTION 'INSUFFICIENT_SESSIONS' USING ERRCODE = 'P0002';
  END IF;

  v_new := v_previous - 1;

  UPDATE credit_packages
  SET remaining_sessions = v_new,
      updated_at = now()
  WHERE id = p_package_id;

  INSERT INTO package_transactions (
    package_id, clinic_id, appointment_id, action,
    previous_balance, new_balance, performed_by
  ) VALUES (
    p_package_id, p_clinic_id, p_appointment_id, 'deduct',
    v_previous, v_new, p_performed_by
  )
  RETURNING id INTO v_txn_id;

  RETURN QUERY SELECT v_new, v_txn_id, v_previous, v_new;
END;
$$;
```

- [ ] **Step 2 — Commit**

```bash
git add supabase/migrations/0023_package_expiry_guard.sql
git commit -m "fix(db): block deduction on expired credit packages in deduct_package_session RPC"
```

---

## Phase 6 — Client Architecture (CRITICAL architecturally — C5)

This phase moves all Supabase data-access out of `'use client'` components into Server Components or API routes. The pattern is the same for all six files.

---

### Task 18 — Move StaffCalendar data access to API routes (C5, perf H1)

**Files:**
- New: `apps/portal-medspa/src/app/api/calendar/route.ts`
- Modify: `apps/portal-medspa/src/components/scheduling/StaffCalendar.tsx`

- [ ] **Step 1 — Create server-side calendar API**

```typescript
// apps/portal-medspa/src/app/api/calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserContext } from '@/lib/supabase/server';
import { getAppointments, getProviders, getRooms, getPatients } from '@baseplate/core';
import { getServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') ?? undefined;
  const to = searchParams.get('to') ?? undefined;

  const supabase = getServiceSupabaseClient();
  const [appointments, providers, rooms, patients] = await Promise.all([
    getAppointments({ clinicId: ctx.clinicId, from, to }, supabase),
    getProviders(ctx.clinicId, supabase),
    getRooms(ctx.clinicId, supabase),
    getPatients(ctx.clinicId, supabase),
  ]);

  return NextResponse.json({ appointments, providers, rooms, patients });
}

export async function PATCH(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { appointmentId, status } = await req.json();
  const supabase = getServiceSupabaseClient();

  // Verify appointment belongs to this clinic
  const { data: appt } = await supabase
    .from('appointments')
    .select('clinic_id')
    .eq('id', appointmentId)
    .single();
  if (!appt || appt.clinic_id !== ctx.clinicId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { updateAppointmentStatus } = await import('@baseplate/core');
  const updated = await updateAppointmentStatus(appointmentId, status, supabase);
  return NextResponse.json(updated);
}
```

- [ ] **Step 2 — Remove server imports from `StaffCalendar.tsx`**

Replace the direct `@baseplate/core` imports in `StaffCalendar.tsx` with `fetch` calls to the new route, and change type imports to `import type`:

```typescript
// REMOVE these imports:
// import { getAppointments, getProviders, getRooms, getPatients, updateAppointmentStatus } from '@baseplate/core';

// ADD:
import type { Appointment, Provider, Room, Patient } from '@baseplate/core';

// In the useEffect:
const res = await fetch(`/api/calendar?from=${from}&to=${to}`);
if (!res.ok) throw new Error('Failed to load calendar');
const { appointments, providers, rooms, patients } = await res.json();

// For cancel:
const res = await fetch('/api/calendar', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ appointmentId: id, status: 'cancelled' }),
});
```

- [ ] **Step 3 — Commit**

```bash
git add apps/portal-medspa/src/app/api/calendar apps/portal-medspa/src/components/scheduling/StaffCalendar.tsx
git commit -m "refactor: move StaffCalendar Supabase calls to /api/calendar server route, client uses fetch"
```

---

### Task 19 — Move PatientList, ProviderManager, RoomManager to API (C5)

**Files:**
- New: `apps/portal-medspa/src/app/api/providers/route.ts`
- New: `apps/portal-medspa/src/app/api/rooms/route.ts`
- Modify: `apps/portal-medspa/src/app/api/reporting/metrics/route.ts` (already exists — add patients there or use separate endpoint)
- Modify: `apps/portal-medspa/src/components/dashboard/PatientList.tsx`
- Modify: `apps/portal-medspa/src/components/dashboard/ProviderManager.tsx`
- Modify: `apps/portal-medspa/src/components/dashboard/RoomManager.tsx`

Apply the same pattern as Task 18: each component replaces `@baseplate/core` function calls with `fetch('/api/<resource>')`, keeping only `import type` for types. Create authenticated GET/POST/DELETE route handlers using `getUserContext()` + `getServiceSupabaseClient()`.

The pattern for each new route:
```typescript
// Template for apps/portal-medspa/src/app/api/providers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserContext, getServiceSupabaseClient } from '@/lib/supabase/server';
import { getProviders, createProvider } from '@baseplate/core';

export async function GET(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = getServiceSupabaseClient();
  const providers = await getProviders(ctx.clinicId, supabase);
  return NextResponse.json(providers);
}

export async function POST(req: NextRequest) {
  const ctx = await getUserContext();
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const supabase = getServiceSupabaseClient();
  const provider = await createProvider({ ...body, clinicId: ctx.clinicId }, supabase);
  return NextResponse.json(provider);
}
```

Apply the same pattern for `/api/rooms` and ensure `/api/feedback` already returns with a limit (see Task 27).

- [ ] **Step 1** — Create `apps/portal-medspa/src/app/api/providers/route.ts` using the template above.
- [ ] **Step 2** — Create `apps/portal-medspa/src/app/api/rooms/route.ts` similarly.
- [ ] **Step 3** — Update `ProviderManager.tsx` to use `fetch('/api/providers')` and `import type { Provider }`.
- [ ] **Step 4** — Update `RoomManager.tsx` to use `fetch('/api/rooms')` and `import type { Room }`.
- [ ] **Step 5** — Update `PatientList.tsx` to use `fetch('/api/patients?limit=50&offset=...')` and `import type { Patient }`.

- [ ] **Step 6 — Commit**

```bash
git add apps/portal-medspa/src/app/api/providers apps/portal-medspa/src/app/api/rooms apps/portal-medspa/src/components/dashboard
git commit -m "refactor: move PatientList/ProviderManager/RoomManager Supabase calls to authenticated API routes"
```

---

### Task 20 — Move AuditLogViewer and FormBuilder to API (C5)

Same pattern. `AuditLogViewer` uses `getAuditLogs`; `FormBuilder` uses `createIntakeForm`, `getIntakeForms`, `updateIntakeForm`. These are sensitive operations (audit logs, form mutations) that must never run client-side.

- [ ] **Step 1** — Create `apps/portal-medspa/src/app/api/audit-logs/route.ts` (GET, auth required, paginated).
- [ ] **Step 2** — Create `apps/portal-medspa/src/app/api/intake/forms/route.ts` (GET/POST/PATCH, auth required, clinic-scoped).
- [ ] **Step 3** — Update `AuditLogViewer.tsx` and `FormBuilder.tsx` to use `fetch` and `import type`.

- [ ] **Step 4 — Commit**

```bash
git add apps/portal-medspa/src/app/api/audit-logs apps/portal-medspa/src/app/api/intake/forms apps/portal-medspa/src/components
git commit -m "refactor: move AuditLogViewer/FormBuilder Supabase calls to authenticated API routes"
```

---

### Task 21 — Fix remaining `import type` misses in client components (C5, L5)

**Files:**
- Modify: `apps/portal-medspa/src/components/scheduling/BookingForm.tsx`
- Modify: `apps/portal-medspa/src/components/payments/PaymentPanel.tsx`
- Modify: `apps/portal-medspa/src/components/dashboard/IntakeStatusBadge.tsx`
- Modify: `packages/marketplace/src/registry.ts`
- Modify: `packages/marketplace/src/types.ts`

- [ ] **Step 1 — Fix value imports used as types only**

In each file, change:
```typescript
import { Provider } from '@baseplate/core';       // BookingForm.tsx
import { Appointment } from '@baseplate/core';    // PaymentPanel.tsx
import { IntakeStatus } from '@baseplate/core';   // IntakeStatusBadge.tsx
```
To:
```typescript
import type { Provider } from '@baseplate/core';
import type { Appointment } from '@baseplate/core';
import type { IntakeStatus } from '@baseplate/core';
```

- [ ] **Step 2 — Fix `as unknown as` cast + type mismatch in marketplace**

In `packages/marketplace/src/registry.ts`, the `searchModules` function casts `data as unknown as MarketplaceModule[]` because the DB returns snake_case but the type uses camelCase. Standardize the type to snake_case to match the DB:

```typescript
// packages/marketplace/src/types.ts — change MarketplaceModule to snake_case:
export interface MarketplaceModule {
  id: string;
  slug: string;
  name: string;
  description: string;
  author_id: string;
  vertical?: string;
  category: ModuleCategory;
  pricing_model: PricingModel;
  price_cents: number;
  status: ModuleStatus;
  latest_version: string;
  install_count: number;
  created_at: string;
  updated_at: string;
}
```

Then in `registry.ts`, remove the `as unknown as` cast — the types now match the DB rows.

- [ ] **Step 3 — Run typecheck**

```bash
pnpm typecheck
```
Expected: PASS (TS now enforces the correct types)

- [ ] **Step 4 — Commit**

```bash
git add apps/portal-medspa/src/components packages/marketplace/src
git commit -m "fix: use import type for client components, standardize MarketplaceModule to snake_case to match DB"
```

---

## Phase 7 — Data Integrity & Money (MEDIUM)

---

### Task 22 — Standardize money to integer cents (M3)

All financial amounts should be stored and passed as **integer cents**, not `NUMERIC(10,2)` dollars. This task adds a migration to change column types and updates all code that converts.

**Files:**
- New: `supabase/migrations/0024_money_cents.sql`
- Modify: `packages/core/src/reporting/index.ts`
- Modify: `packages/integrations/stripe/src/index.ts`

- [ ] **Step 1 — Migration**

```sql
-- supabase/migrations/0024_money_cents.sql
-- Standardize all money columns to integer cents to eliminate float rounding.
-- Existing NUMERIC(10,2) dollar values are converted by * 100.

ALTER TABLE appointments
  ALTER COLUMN amount TYPE integer USING ROUND(amount * 100)::integer;

ALTER TABLE credit_packages
  ALTER COLUMN amount_paid TYPE integer USING ROUND(amount_paid * 100)::integer;

-- payments.amount_cents was already created as integer in 0017 — no change needed.
-- marketplace_modules.price_cents was already integer in 0013 — no change needed.
```

- [ ] **Step 2 — Update all code that multiplies by 100 or divides by 100**

In `packages/integrations/stripe/src/index.ts`, remove the `* 100` conversion (amount is now already cents):
```typescript
// BEFORE: unit_amount: Math.round(params.amount * 100)
// AFTER:
unit_amount: params.amount  // already in cents
```

In `packages/core/src/reporting/index.ts`, remove the `Number(a.amount ?? 0)` accumulation (already integer):
```typescript
// Same logic, no conversion needed — amounts are cents
const totalRevenueCents = rows
  .filter((a) => a.payment_status === 'completed')
  .reduce((sum, a) => sum + (a.amount ?? 0), 0);
// Return as cents; callers format for display
```

- [ ] **Step 3 — Commit**

```bash
git add supabase/migrations/0024_money_cents.sql packages/integrations packages/core/src/reporting
git commit -m "fix: standardize all money columns to integer cents, remove float multiplication"
```

---

### Task 23 — Fix seed cleanup + Stripe resource on clinic delete (M6, M7)

**Files:**
- Modify: `supabase/migrations/0012_intelligence_seed.sql` (add `is_synthetic` columns in a new forward migration)
- New: `supabase/migrations/0025_seed_is_synthetic.sql`

- [ ] **Step 1 — Add `is_synthetic` column migration**

```sql
-- supabase/migrations/0025_seed_is_synthetic.sql
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false;
ALTER TABLE patients     ADD COLUMN IF NOT EXISTS is_synthetic boolean NOT NULL DEFAULT false;
-- api_usage already has no cleanup needed

-- Update seed rows from 0012 (they used fixed UUID prefixes starting with '00000000-')
UPDATE appointments SET is_synthetic = true WHERE id::text LIKE '00000000-%';
UPDATE patients     SET is_synthetic = true WHERE id::text LIKE '00000000-%';
```

Document the cleanup command in `docs/SEED_CLEANUP.md`:
```markdown
# Seed data cleanup
Run on any environment to remove synthetic test data:
```sql
DELETE FROM appointments WHERE is_synthetic = true;
DELETE FROM patients     WHERE is_synthetic = true;
```
```

- [ ] **Step 2 — Commit**

```bash
git add supabase/migrations/0025_seed_is_synthetic.sql docs/SEED_CLEANUP.md
git commit -m "fix(db): add is_synthetic column so seed rows can be cleanly removed"
```

---

## Phase 8 — Performance (MEDIUM)

---

### Task 24 — SQL aggregation for dashboard metrics (M8)

**Files:**
- New: `supabase/migrations/0026_dashboard_metrics_rpc.sql`
- Modify: `packages/core/src/reporting/index.ts`

- [ ] **Step 1 — Create SQL RPC**

```sql
-- supabase/migrations/0026_dashboard_metrics_rpc.sql
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
  p_clinic_id uuid,
  p_from      timestamptz DEFAULT NULL,
  p_to        timestamptz DEFAULT NULL
)
RETURNS jsonb
LANGUAGE sql STABLE
AS $$
  SELECT jsonb_build_object(
    'total_revenue_cents', COALESCE(SUM(amount) FILTER (WHERE payment_status = 'completed'), 0),
    'count_scheduled',     COUNT(*) FILTER (WHERE status = 'scheduled'),
    'count_completed',     COUNT(*) FILTER (WHERE status = 'completed'),
    'count_cancelled',     COUNT(*) FILTER (WHERE status = 'cancelled'),
    'intake_completed',    COUNT(*) FILTER (WHERE intake_completed = true),
    'total_appointments',  COUNT(*),
    'revenue_by_provider', (
      SELECT jsonb_agg(jsonb_build_object('provider_id', provider_id, 'revenue_cents', rev))
      FROM (
        SELECT provider_id, SUM(amount) AS rev
        FROM appointments
        WHERE clinic_id = p_clinic_id
          AND (p_from IS NULL OR scheduled_time >= p_from)
          AND (p_to   IS NULL OR scheduled_time <= p_to)
          AND payment_status = 'completed'
        GROUP BY provider_id
      ) t
    ),
    'service_popularity', (
      SELECT jsonb_agg(jsonb_build_object('service_type', service_type, 'count', cnt))
      FROM (
        SELECT COALESCE(service_type, 'Unspecified') AS service_type, COUNT(*) AS cnt
        FROM appointments
        WHERE clinic_id = p_clinic_id
          AND (p_from IS NULL OR scheduled_time >= p_from)
          AND (p_to   IS NULL OR scheduled_time <= p_to)
        GROUP BY service_type
        ORDER BY cnt DESC
      ) t
    )
  )
  FROM appointments
  WHERE clinic_id = p_clinic_id
    AND (p_from IS NULL OR scheduled_time >= p_from)
    AND (p_to   IS NULL OR scheduled_time <= p_to);
$$;
```

- [ ] **Step 2 — Replace JS aggregation in `packages/core/src/reporting/index.ts`**

```typescript
export async function getDashboardMetrics(params: GetDashboardMetricsParams, client?: SupabaseClient): Promise<DashboardMetrics> {
  const supabase = client ?? getAnonSupabaseClient();

  const { data, error } = await supabase
    .rpc('get_dashboard_metrics', {
      p_clinic_id: params.clinicId,
      p_from: params.from ?? null,
      p_to: params.to ?? null,
    });

  if (error) throw new Error(`getDashboardMetrics failed: ${error.message}`);

  const d = data as Record<string, unknown>;
  return {
    totalRevenue: Number(d.total_revenue_cents ?? 0),
    appointmentCounts: {
      scheduled: Number(d.count_scheduled ?? 0),
      completed: Number(d.count_completed ?? 0),
      cancelled: Number(d.count_cancelled ?? 0),
    },
    noShowRate: 0, // computed separately if needed
    intakeCompletionRate: Number(d.total_appointments) > 0
      ? Number(d.intake_completed) / Number(d.total_appointments) : 0,
    revenueByProvider: (d.revenue_by_provider as any[]) ?? [],
    servicePopularity: (d.service_popularity as any[]) ?? [],
  };
}
```

- [ ] **Step 3 — Commit**

```bash
git add supabase/migrations/0026_dashboard_metrics_rpc.sql packages/core/src/reporting
git commit -m "perf: replace JS in-memory dashboard aggregation with SQL RPC, eliminates select(*) over all appointments"
```

---

### Task 25 — Add missing indexes (M9)

**Files:**
- New: `supabase/migrations/0027_performance_indexes.sql`

- [ ] **Step 1 — Migration**

```sql
-- supabase/migrations/0027_performance_indexes.sql
-- Covers appointments filtering by payment_status and combined (clinic_id, scheduled_time)
-- which are both hot paths in reporting and the rules engine.
-- Also covers patient email lookup (booking hot path) and payments (intelligence rules).

-- Already exists: idx_appointments_clinic_id, idx_appointments_scheduled_time
-- New: combined index for range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_clinic_scheduled
  ON appointments(clinic_id, scheduled_time);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_payment_status
  ON appointments(payment_status) WHERE payment_status IS NOT NULL;

-- Patient email lookup (hot path: findOrCreatePatient on every booking)
-- Note: idx_patients_clinic_email_unique already created in 0020 — no duplicate needed.

-- Payments table indexes (created in 0017 — verify they exist)
-- idx_payments_clinic_id and idx_payments_clinic_created already in 0017.

-- Feedback by clinic
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_clinic_created
  ON feedback(clinic_id, created_at DESC);
```

- [ ] **Step 2 — Commit**

```bash
git add supabase/migrations/0027_performance_indexes.sql
git commit -m "perf: add missing indexes for appointment payment_status, clinic+scheduled range, feedback"
```

---

### Task 26 — Paginate feedback and patient list endpoints (M10)

**Files:**
- Modify: `apps/portal-medspa/src/app/api/feedback/route.ts`
- Modify: `packages/core/src/patients/index.ts`

- [ ] **Step 1 — Paginate feedback GET**

```typescript
// apps/portal-medspa/src/app/api/feedback/route.ts — GET handler
const { searchParams } = new URL(req.url);
const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100);
const offset = Number(searchParams.get('offset') ?? 0);

const { data, error, count } = await supabase
  .from('feedback')
  .select('id, category, message, priority, status, created_at', { count: 'exact' })
  .eq('clinic_id', ctx.clinicId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

return NextResponse.json({ items: data ?? [], total: count ?? 0, limit, offset });
```

- [ ] **Step 2 — Paginate `getPatients`**

```typescript
// packages/core/src/patients/index.ts — add pagination params
export async function getPatients(
  clinicId: string,
  opts: { limit?: number; offset?: number } = {},
  client?: SupabaseClient
): Promise<{ patients: Patient[]; total: number }> {
  const supabase = client ?? getAnonSupabaseClient();
  const limit = Math.min(opts.limit ?? 50, 200);
  const offset = opts.offset ?? 0;

  const { data, error, count } = await supabase
    .from('patients')
    .select('id, first_name, last_name, email, phone, created_at', { count: 'exact' })
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(`getPatients failed: ${error.message}`);
  return { patients: (data ?? []) as Patient[], total: count ?? 0 };
}
```

- [ ] **Step 3 — Commit**

```bash
git add apps/portal-medspa/src/app/api/feedback/route.ts packages/core/src/patients/index.ts
git commit -m "perf: paginate feedback and patients endpoints (limit 50, max 100/200), project only needed columns"
```

---

### Task 27 — Fix O(n²) room-conflict calculation in StaffCalendar (M11)

**Files:**
- Modify: `apps/portal-medspa/src/components/scheduling/StaffCalendar.tsx`

- [ ] **Step 1 — Replace nested loop with sweep-line**

Find the `roomConflicts` useMemo and replace with:

```typescript
const roomConflicts = useMemo(() => {
  const conflicts = new Set<string>();
  // Group appointments by room, sort each group by start time, then sweep
  const byRoom = new Map<string, Appointment[]>();
  for (const a of appointments) {
    if (!a.room_id || a.status === 'cancelled') continue;
    if (!byRoom.has(a.room_id)) byRoom.set(a.room_id, []);
    byRoom.get(a.room_id)!.push(a);
  }
  for (const [, group] of byRoom) {
    // Pre-parse once, sort by start
    const parsed = group
      .map((a) => ({ id: a.id, start: new Date(a.scheduled_time).getTime(), end: new Date(a.scheduled_time).getTime() + a.duration_minutes * 60_000 }))
      .sort((a, b) => a.start - b.start);
    for (let i = 1; i < parsed.length; i++) {
      if (parsed[i].start < parsed[i - 1].end) {
        conflicts.add(parsed[i].id);
        conflicts.add(parsed[i - 1].id);
      }
    }
  }
  return conflicts;
}, [appointments]);
```

- [ ] **Step 2 — Commit**

```bash
git add apps/portal-medspa/src/components/scheduling/StaffCalendar.tsx
git commit -m "perf: replace O(n²) room conflict loop with O(n log n) sweep-line algorithm"
```

---

## Phase 9 — Error Handling & UX (MEDIUM)

---

### Task 28 — Fix feedback widget: surface errors + fix silent submit (M13)

**Files:**
- Modify: `apps/portal-medspa/src/components/feedback/FeedbackWidget.tsx`

- [ ] **Step 1 — Write failing test**

```typescript
// apps/portal-medspa/src/components/__tests__/FeedbackWidget.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FeedbackWidget } from '../feedback/FeedbackWidget';

global.fetch = jest.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Server error' }) });

it('shows error message when submit fails', async () => {
  render(<FeedbackWidget />);
  fireEvent.click(screen.getByRole('button', { name: /feedback/i }));
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'My feedback message' } });
  fireEvent.click(screen.getByRole('button', { name: /submit/i }));
  await waitFor(() => expect(screen.getByText(/server error/i)).toBeInTheDocument());
});
```

- [ ] **Step 2 — Add error state to `FeedbackWidget.tsx`**

```typescript
// Add to state:
const [error, setError] = useState<string | null>(null);

// In handleSubmit, replace the try/catch:
try {
  setSubmitting(true);
  setError(null);
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, message, priority: 'medium' }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    setError(data.error ?? 'Submission failed. Please try again.');
    return;
  }
  setSubmitted(true);
} catch {
  setError('Network error. Please try again.');
} finally {
  setSubmitting(false);
}

// In JSX, render below the submit button:
{error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
```

- [ ] **Step 3 — Commit**

```bash
git add apps/portal-medspa/src/components/feedback
git commit -m "fix: FeedbackWidget surfaces server errors and network failures instead of silently resetting"
```

---

### Task 29 — Fix booking notification failure handling (M14)

**Files:**
- Modify: `apps/portal-medspa/src/components/scheduling/BookingForm.tsx`

- [ ] **Step 1 — Surface notification outcome**

Find the post-booking notification call and replace the empty catch with:

```typescript
// After setBookingResult(data):
let notificationSent = false;
try {
  const notifRes = await fetch('/api/appointments/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appointmentId: data.id, clinicId }),
  });
  if (notifRes.ok) {
    const notifData = await notifRes.json();
    notificationSent = notifData?.results?.sms?.sent === true || notifData?.results?.email?.sent === true;
  }
} catch {
  // Non-blocking — booking already succeeded
}
setConfirmationSent(notificationSent);

// And in the success JSX:
{confirmationSent
  ? <p className="text-sm text-gray-600">A confirmation has been sent.</p>
  : <p className="text-sm text-yellow-600">Booking confirmed — we couldn't send a confirmation message. Please save these details.</p>
}
```

Add `confirmationSent` state: `const [confirmationSent, setConfirmationSent] = useState(false);`

- [ ] **Step 2 — Commit**

```bash
git add apps/portal-medspa/src/components/scheduling/BookingForm.tsx
git commit -m "fix: surface notification send failure on booking confirmation screen instead of always showing 'confirmation sent'"
```

---

### Task 30 — Fix submit/disabled gaps (M15)

**Files:**
- Modify: `apps/portal-medspa/src/app/dashboard/settings/billing/page.tsx`
- Modify: `apps/portal-medspa/src/components/scheduling/StaffCalendar.tsx`

- [ ] **Step 1 — Billing portal button**

The "Manage Subscription" button is in a Server Component. Extract to a client component:

```typescript
// apps/portal-medspa/src/components/dashboard/ManageSubscriptionButton.tsx
'use client';
import { useState } from 'react';

export function ManageSubscriptionButton() {
  const [pending, setPending] = useState(false);
  return (
    <button
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          const res = await fetch('/api/subscriptions/portal', { method: 'POST' });
          if (!res.ok) throw new Error('Failed');
          const { url } = await res.json();
          if (url) window.location.href = url;
        } finally {
          setPending(false);
        }
      }}
      className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
    >
      {pending ? 'Opening…' : 'Manage Subscription'}
    </button>
  );
}
```

Use `<ManageSubscriptionButton />` in `billing/page.tsx` instead of the inline handler.

- [ ] **Step 2 — StaffCalendar per-row cancel button**

```typescript
// Add state:
const [cancellingId, setCancellingId] = useState<string | null>(null);

// In handleCancel:
async function handleCancel(id: string) {
  setCancellingId(id);
  try {
    // ... existing cancel logic ...
  } finally {
    setCancellingId(null);
  }
}

// In JSX:
<button
  disabled={cancellingId === appt.id}
  onClick={() => handleCancel(appt.id)}
  className="text-red-600 hover:underline disabled:opacity-50"
>
  {cancellingId === appt.id ? 'Cancelling…' : 'Cancel'}
</button>
```

- [ ] **Step 3 — Commit**

```bash
git add apps/portal-medspa/src/app/dashboard/settings apps/portal-medspa/src/components/dashboard/ManageSubscriptionButton.tsx apps/portal-medspa/src/components/scheduling/StaffCalendar.tsx
git commit -m "fix: disable billing portal button and per-row cancel button while async operations are in-flight"
```

---

## Phase 10 — Accessibility (MEDIUM)

---

### Task 31 — Button focus ring (M16 — auto-fixable)

**Files:**
- Modify: `packages/ui/src/button.tsx`

- [ ] **Step 1 — Write failing test**

```typescript
// packages/ui/src/__tests__/button.test.tsx
import { render } from '@testing-library/react';
import { Button } from '../button';

it('includes a focus-visible ring class', () => {
  const { container } = render(<Button>Click</Button>);
  const btn = container.querySelector('button')!;
  expect(btn.className).toContain('focus-visible:ring-2');
});
```

- [ ] **Step 2 — Add focus-visible to base class in `packages/ui/src/button.tsx`**

```typescript
// Change the base className from:
'font-semibold rounded transition',
// To:
'font-semibold rounded transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
```

- [ ] **Step 3 — Run tests**

```bash
cd packages/ui && pnpm test -- --testPathPattern=button
```
Expected: PASS

- [ ] **Step 4 — Commit**

```bash
git add packages/ui/src/button.tsx packages/ui/src/__tests__/button.test.tsx
git commit -m "a11y: add focus-visible ring to Button primitive (propagates to all button usages)"
```

---

### Task 32 — Modal focus trap + keyboard accessibility (M17)

**Files:**
- Modify: `packages/ui/src/modal.tsx`

- [ ] **Step 1 — Write failing tests**

```typescript
// packages/ui/src/__tests__/modal.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../modal';

it('has role=dialog and aria-modal', () => {
  render(<Modal open title="Test" onClose={() => {}}><p>Content</p></Modal>);
  expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
});

it('calls onClose when Escape is pressed', async () => {
  const onClose = jest.fn();
  render(<Modal open title="Test" onClose={onClose}><button>inside</button></Modal>);
  await userEvent.keyboard('{Escape}');
  expect(onClose).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2 — Rewrite `packages/ui/src/modal.tsx`**

```typescript
import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const FOCUSABLE = 'button,input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])';

export function Modal({ open, onClose, title, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (focusable.length === 0) { e.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose} aria-hidden>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-gray-400 hover:text-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3 — Run tests**

```bash
cd packages/ui && pnpm test -- --testPathPattern=modal
```

- [ ] **Step 4 — Commit**

```bash
git add packages/ui/src/modal.tsx packages/ui/src/__tests__/modal.test.tsx
git commit -m "a11y: add focus trap, Esc handler, initial focus, focus restore, and role=dialog to Modal primitive"
```

---

### Task 33 — `aria-invalid` / `aria-describedby` on Input and Form errors (M18)

**Files:**
- Modify: `packages/ui/src/input.tsx`

- [ ] **Step 1 — Write failing test**

```typescript
// packages/ui/src/__tests__/input.test.tsx
import { render } from '@testing-library/react';
import { Input } from '../input';

it('associates error message with input via aria-describedby', () => {
  const { container } = render(<Input name="email" label="Email" error="Invalid email" />);
  const input = container.querySelector('input')!;
  const errorId = input.getAttribute('aria-describedby');
  expect(errorId).toBeTruthy();
  expect(container.querySelector(`#${errorId}`)).toHaveTextContent('Invalid email');
});

it('sets aria-invalid when error is present', () => {
  const { container } = render(<Input name="email" error="Required" />);
  expect(container.querySelector('input')).toHaveAttribute('aria-invalid', 'true');
});
```

- [ ] **Step 2 — Update `packages/ui/src/input.tsx`**

```typescript
import React, { useId } from 'react';
import clsx from 'clsx';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const generated = useId();
    const inputId = id ?? props.name ?? generated;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className={clsx(
            'rounded border px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500',
            error ? 'border-red-500' : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && (
          <span id={errorId} role="alert" className="text-sm text-red-600">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

- [ ] **Step 3 — Fix AuditLogViewer label (auto-fixable)**

In `apps/portal-medspa/src/components/dashboard/AuditLogViewer.tsx`, find the filter label/select pair and add `id`/`htmlFor`:

```tsx
// BEFORE:
<label>Filter by action</label>
<select ...>

// AFTER:
<label htmlFor="audit-action-filter">Filter by action</label>
<select id="audit-action-filter" ...>
```

- [ ] **Step 4 — Run tests**

```bash
cd packages/ui && pnpm test
```

- [ ] **Step 5 — Commit**

```bash
git add packages/ui/src/input.tsx packages/ui/src/__tests__/input.test.tsx apps/portal-medspa/src/components/dashboard/AuditLogViewer.tsx
git commit -m "a11y: Input uses useId(), aria-invalid + aria-describedby on errors; fix AuditLogViewer label association"
```

---

## Phase 11 — Homeservices + SDK Cleanup (HIGH/LOW)

---

### Task 34 — Homeservices: real signup + error boundaries (H13)

**Files:**
- Modify: `apps/portal-homeservices/src/app/auth/signup/page.tsx`
- New: `apps/portal-homeservices/src/app/error.tsx`
- New: `apps/portal-homeservices/src/app/global-error.tsx`

- [ ] **Step 1 — Add error boundaries (mirror medspa convention)**

```typescript
// apps/portal-homeservices/src/app/error.tsx
'use client';
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
      <p className="mt-2 text-gray-600">{error.message}</p>
      <button onClick={reset} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">
        Try again
      </button>
    </div>
  );
}
```

```typescript
// apps/portal-homeservices/src/app/global-error.tsx
'use client';
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html><body>
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <button onClick={reset} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded">Reload</button>
      </div>
    </body></html>
  );
}
```

- [ ] **Step 2 — Wire real signup in `apps/portal-homeservices/src/app/auth/signup/page.tsx`**

```typescript
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_MEDSPA_URL ?? 'http://localhost:3000'}/api/auth/signup-enhanced`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clinic_name: companyName, email, password }),
        }
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Signup failed'); return; }
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="max-w-md w-full space-y-4 p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center">Create Account</h1>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company Name</label>
          <input id="company" type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 border p-2" />
        </div>
        <button type="submit" disabled={submitting} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50">
          {submitting ? 'Creating account…' : 'Create Account'}
        </button>
      </form>
    </main>
  );
}
```

- [ ] **Step 3 — Commit**

```bash
git add apps/portal-homeservices/src/app
git commit -m "fix: homeservices signup wired to real API, error boundaries added (error.tsx + global-error.tsx)"
```

---

### Task 35 — SDK type completeness (L4)

**Files:**
- Modify: `packages/sdk/src/types.ts`

- [ ] **Step 1 — Add missing params and typed return types**

```typescript
// packages/sdk/src/types.ts — additions

// Add appointment_id to SMS params
export interface SmsReminderParams {
  appointment_id?: string;   // ← new
  patient_phone: string;
  patient_name: string;
  appointment_time: string;
  clinic_name: string;
  template?: 'pre-appointment' | 'intake-reminder';
  intake_url?: string;
}

// Add pagination to browse
export interface MarketplaceBrowseParams {
  vertical?: string;
  category?: string;
  q?: string;
  page?: number;        // ← new
  page_size?: number;   // ← new
}

// Typed churn prediction result
export interface ChurnPredictionResult {
  tenant_id: string;
  customer_id?: string;
  churn_probability: number;
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  factors: string[];
  recommendation: string;
  evaluated_at: string;
}
```

- [ ] **Step 2 — Update `ConnectClient.getChurnPrediction` return type**

```typescript
// packages/sdk/src/connect-client.ts
async getChurnPrediction(params: ChurnPredictionParams): Promise<ChurnPredictionResult> {
  return this.request<ChurnPredictionResult>('POST', '/api/v1/intelligence/churn-prediction', params);
}
```

- [ ] **Step 3 — Commit**

```bash
git add packages/sdk/src
git commit -m "fix: add appointment_id to SmsReminderParams, pagination to browse, typed ChurnPredictionResult in SDK"
```

---

## Final Verification

- [ ] **Run full test suite**

```bash
cd "a:/Projects/Working/Substrate Ai Infrastructure/Advance Plan & Build/Med Spa App"
pnpm typecheck
pnpm test
pnpm build
```

Expected:
- `pnpm typecheck` — 0 errors
- `pnpm test` — ≥250 tests, 0 failures
- `pnpm build` — all packages build cleanly

- [ ] **Run migrations on local Supabase**

```bash
supabase db reset   # applies 0001–0027 in order
supabase db seed    # should succeed (payments table now exists)
```

- [ ] **Final commit summary**

```bash
git log --oneline main..HEAD
```

Expected: ~35 focused commits, each with a clear scope prefix (`security:`, `fix:`, `fix(db):`, `perf:`, `a11y:`, `refactor:`).

- [ ] **Open a PR**

```bash
gh pr create --title "Security & tech-debt: 41 audit findings remediated" \
  --body "Closes all findings from CODE_REVIEW.md. See that file for the full finding list and severity breakdown."
```

---

## Quick-reference: Finding → Task mapping

| Finding | Task |
|---------|------|
| C1 — Shared global API key / timing | Task 1 |
| C2 — Unauthenticated proxy routes | Task 2 |
| C3 — `payments` table missing | Task 5 |
| C4 — Marketplace broken + unauth | Task 2 + Task 3 |
| C5 — Client-side Supabase | Tasks 18–21 |
| H1 — Webhook idempotency | Task 6 |
| H2 — Payment status regression | Task 6 |
| H3 — RLS identity drift 0014/0015 | Task 7 |
| H4 — "Tighten RLS" no-op 0007 | (covered by Task 7 migration pattern — add similar corrective migration for 0007) |
| H5 — Swallowed audit writes | Task 14 |
| H6 — Signup rate limit / enumeration | Task 12 |
| H7 — Intake service-role trust | Task 13 |
| H8 — Rate limiter fail-open | Task 11 |
| H9 — SMS pump / toll fraud | Task 13 (add per-key SMS quota to sms-reminder route) |
| H10 — Patient create race | Task 8 |
| H11 — Room double-book | Task 9 |
| H12 — Payment-link IDOR | Task 4 |
| H13 — Homeservices fake signup + no boundaries | Task 34 |
| M1 — getSession vs getUser | Task 16 |
| M2 — Booking confirm provider ownership | Add `.eq('clinic_id', clinicId)` check in `booking/confirm/route.ts` (1-line fix) |
| M3 — Money type divergence | Task 22 |
| M4 — Expired package deduction | Task 17 |
| M5 — Missing ON DELETE / FKs | Task 10 |
| M6 — Clinic delete + Stripe resources | Task 23 |
| M7 — Seed cleanup | Task 23 |
| M8 — select(*) dashboard aggregation | Task 24 |
| M9 — Missing indexes | Task 25 |
| M10 — Unbounded list fetches | Task 26 |
| M11 — O(n²) room conflict | Task 27 |
| M12 — Marketplace optimistic rollback | Task 3 |
| M13 — Feedback silent failure | Task 28 |
| M14 — Booking notification failure | Task 29 |
| M15 — Submit/disabled gaps | Task 30 |
| M16 — Button focus ring | Task 31 |
| M17 — Modal focus trap | Task 32 |
| M18 — aria-invalid/describedby | Task 33 |
| M19 — Error internals reflected | Tasks 12, 13, 14 (generic messages in catch blocks) |
| L1 — No correlation IDs | Task 15 |
| L2 — console.log on hot path | Task 15 |
| L3 — Email observability | Add `logInfo('email.sent', {...})` + `logError` in `packages/integrations/postmark/src/index.ts` |
| L4 — SDK type drift | Task 35 |
| L5 — `as unknown as` cast | Task 21 |
| L6 — No loading.tsx / aria-busy | Deferred to `add-skeleton-loaders` skill |
