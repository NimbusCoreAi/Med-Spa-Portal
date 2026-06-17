# Phase 5 Code Gaps — Detailed Build Guide

> **Purpose:** AI-ready build instructions for the 5 code features Phase 5 requires.
> **Companion:** `PHASE_5_EXECUTION_PLAN.md` (full plan with manual steps + skill mappings)
> **Stack:** Next.js 14 App Router, TypeScript, Supabase (PostgreSQL), Stripe, Tailwind CSS
> **Monorepo:** pnpm + Turborepo, packages consume source via `workspace:*`

---

## Table of Contents

- [1A. Pricing Page + Stripe Subscription Billing](#1a-pricing-page--stripe-subscription-billing)
- [1B. Production Observability](#1b-production-observability)
- [1C. Self-Service Signup Flow](#1c-self-service-signup-flow)
- [1D. Feedback Collection Infrastructure](#1d-feedback-collection-infrastructure)
- [1E. ML Pipeline Wiring (Deferred)](#1e-ml-pipeline-wiring-deferred-to-part-7)
- [Build Order](#build-order)
- [Conventions](#conventions)

---

## 1A. Pricing Page + Stripe Subscription Billing

### Problem

No pricing page exists. The portal only supports one-time Stripe payment links for appointments. Phase 5 gate requires "Pricing page live with self-service signup" and "$500+ MRR from converted pilots."

### What to Build

#### 1. Migration: `supabase/migrations/0014_subscriptions.sql`

Table: `subscriptions`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid default gen_random_uuid()` | PK |
| `clinic_id` | `uuid` | FK → `clinics(id)` |
| `stripe_customer_id` | `text` | Stripe customer ID (`cus_...`) |
| `stripe_subscription_id` | `text` | Stripe subscription ID (`sub_...`) |
| `plan` | `text not null` | `'connect'` or `'intelligence'` |
| `status` | `text not null default 'active'` | `active`, `past_due`, `canceled`, `trialing` |
| `current_period_end` | `timestamptz` | Stripe billing period end |
| `created_at` | `timestamptz default now()` | |
| `updated_at` | `timestamptz default now()` | |

RLS policies:
- Owners can read their clinic's subscriptions
- Service role can insert/update (webhook handler uses service-role client)

```sql
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  plan text NOT NULL CHECK (plan IN ('connect', 'intelligence')),
  status text NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_clinic_id ON subscriptions(clinic_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic owners can read their subscriptions"
  ON subscriptions FOR SELECT
  USING (
    clinic_id IN (
      SELECT clinic_id FROM staff WHERE id = auth.uid()
    )
  );
```

#### 2. Billing Module: `packages/core/src/billing/index.ts`

Functions:
- `createSubscription(supabase, { clinic_id, plan, stripe_customer_id, stripe_subscription_id })` → inserts row
- `getSubscription(supabase, clinic_id)` → returns active subscription or null
- `getSubscriptionStatus(supabase, clinic_id)` → returns `'active' | 'past_due' | 'canceled' | 'none'`
- `updateSubscriptionStatus(supabase, stripe_subscription_id, { status, current_period_end })` → updates row
- `hasActiveSubscription(supabase, clinic_id, plan?)` → boolean check

Tests: `packages/core/src/billing/__tests__/billing.test.ts`

#### 3. Pricing Page: `apps/portal-medspa/src/app/pricing/page.tsx`

Public page (no auth required). Three-tier comparison card layout:

| Tier | Price | Features | CTA |
|------|-------|----------|-----|
| **Pilot** | Free (6 months) | All features, biweekly feedback calls | "Start Free Pilot" → `/signup?plan=pilot` |
| **Connect** | $49/mo | All features, Connect API access, priority support | "Get Connect" → `/signup?plan=connect` |
| **Intelligence** | +$99/mo | ML predictions, risk scoring, churn alerts | "Add Intelligence" → `/dashboard/settings/billing` (auth required) |

UI conventions to match:
- Use `@baseplate/ui` Button component
- Use Tailwind for layout (3-column grid, `md:grid-cols-3`)
- Center the "Connect" tier (recommended badge)
- Responsive: stack vertically on mobile

#### 4. Subscription Create API: `apps/portal-medspa/src/app/api/subscriptions/create/route.ts`

POST handler:
- Auth required (must be logged in clinic owner)
- Body: `{ plan: 'connect' | 'intelligence' }`
- Creates Stripe Checkout Session with `mode: 'subscription'`
- Uses Stripe Price IDs from env vars (`STRIPE_PRICE_CONNECT`, `STRIPE_PRICE_INTELLIGENCE`)
- Returns `{ url: checkoutSession.url }`
- Client redirects to Stripe Checkout

Env vars needed:
- `STRIPE_PRICE_CONNECT` — Stripe Price ID for Connect plan
- `STRIPE_PRICE_INTELLIGENCE` — Stripe Price ID for Intelligence add-on

#### 5. Customer Portal API: `apps/portal-medspa/src/app/api/subscriptions/portal/route.ts`

POST handler:
- Auth required
- Creates Stripe Billing Portal Session
- Returns `{ url: portalSession.url }`
- User manages their subscription (cancel, update card, view invoices) on Stripe-hosted page

#### 6. Webhook Extension: `apps/portal-medspa/src/app/api/webhooks/stripe/route.ts`

**Extend the existing webhook handler** (currently only handles checkout session events for payments).

Add handling for:
- `customer.subscription.created` → insert into `subscriptions` table
- `customer.subscription.updated` → update status + period end
- `customer.subscription.deleted` → set status to `canceled`

Use `packages/integrations/stripe` for `constructWebhookEvent()` (existing pattern).

#### 7. Settings/Billing Page: `apps/portal-medspa/src/app/dashboard/settings/billing/page.tsx`

Dashboard page (auth + owner role required):
- Shows current subscription status
- "Manage Subscription" button → Customer Portal
- "Add Intelligence" button → if not subscribed, starts Intelligence checkout
- Shows next billing date, plan, amount

### Files Summary

```
supabase/migrations/0014_subscriptions.sql
packages/core/src/billing/index.ts
packages/core/src/billing/__tests__/billing.test.ts
packages/core/src/index.ts                          ← add billing export
apps/portal-medspa/src/app/pricing/page.tsx
apps/portal-medspa/src/app/api/subscriptions/create/route.ts
apps/portal-medspa/src/app/api/subscriptions/portal/route.ts
apps/portal-medspa/src/app/api/webhooks/stripe/route.ts  ← extend
apps/portal-medspa/src/app/dashboard/settings/billing/page.tsx
apps/portal-medspa/.env.local.example               ← add STRIPE_PRICE_*
```

### Skill Mapping

| Skill | Collection | Purpose |
|-------|-----------|---------|
| `add-feature` (`mode=production`) | Agent Core | Full pipeline for pricing + billing feature |
| `add-migration` | Agent Core | Subscriptions table (additive, safe — no destructive changes) |
| `harden-types` | Agent Core | Stripe webhook event typing, subscription status union types |
| `add-observability` | Agent Core | Log subscription lifecycle events (create, update, cancel) |
| `write-tests` | Agent Core | Billing module unit tests (mock Supabase + Stripe) |
| `polish-ui` | Agent Core | Pricing page tier card UX, responsive 3-column layout, CTA buttons |
| `audit-authz` | Agent Core | Verify webhook endpoint is unauthenticated but signature-verified |
| `simplify` | Agent Core | Post-build cleanup on billing module + webhook handler |
| `check-pr-readiness` | Agent Core | Verify typecheck + test + build pass before merge |
| `update-changelog` | Agent Core | Add CHANGELOG entry for subscription billing feature |

### Subagent Mapping

| Subagent | Category | Purpose |
|----------|----------|---------|
| `payment-integration` | 07-Specialized Domains | Stripe Checkout subscriptions, Customer Portal, webhook events |
| `nextjs-developer` | 02-Language Specialists | App Router pricing page + API routes + middleware |
| `api-designer` | 01-Core Development | Billing module function signatures, return types |
| `typescript-pro` | 02-Language Specialists | Type-safe Stripe event handlers, union types for plan/status |
| `postgres-pro` | 05-Data & AI | Subscriptions table schema, indexes, RLS policy design |
| `security-auditor` | 04-Quality & Security | Verify webhook signature validation, no subscription bypass |
| `code-reviewer` | 04-Quality & Security | Review billing diff for edge cases (failed payment, refund, etc.) |
| `documentation-engineer` | 06-Developer Experience | Update .env.local.example with new STRIPE_PRICE_* vars |

### Per-Deliverable Skill Routing

| Deliverable | Primary Skill | Subagent |
|-------------|--------------|----------|
| Migration `0014_subscriptions.sql` | `add-migration` | `postgres-pro` |
| Billing module `packages/core/src/billing/` | `add-feature` | `api-designer` |
| Billing tests | `write-tests` | `typescript-pro` |
| Pricing page `/pricing` | `add-feature` → `polish-ui` | `nextjs-developer` |
| Subscription create API | `add-feature` | `payment-integration` |
| Customer Portal API | `add-feature` | `payment-integration` |
| Webhook extension | `modify-feature` → `harden-types` | `payment-integration`, `security-auditor` |
| Settings/billing page | `add-feature` → `polish-ui` | `nextjs-developer` |
| Post-build verification | `check-pr-readiness` → `simplify` | `code-reviewer` |

---

## 1B. Production Observability

### Problem

No error tracking, no health monitoring on the portal. No error boundary. Phase 5 requires "no critical bugs blocking daily usage" — need visibility to catch them.

### What to Build

#### 1. Health Endpoint: `apps/portal-medspa/src/app/api/health/route.ts`

GET handler returns JSON:

```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "checks": {
    "database": { "status": "up" | "down", "latency_ms": 12 },
    "stripe": { "status": "up" | "down" },
    "connect_api": { "status": "up" | "down", "latency_ms": 45 },
    "twilio": { "status": "up" | "down" }
  },
  "timestamp": "2026-06-16T..."
}
```

Checks:
- **Database:** `SELECT 1` via Supabase service-role client
- **Stripe:** `stripe.balance.retrieve()` (lightweight)
- **Connect API:** `fetch(CONNECT_API_URL + '/api/health')`
- **Twilio:** Check API balance via REST API

Return 200 if healthy, 503 if any critical check fails.

#### 2. Error Boundary: `apps/portal-medspa/src/app/error.tsx`

Next.js App Router error boundary:
- Catches errors thrown in route components
- Shows user-friendly error message + "Try Again" button
- Logs error details via `logError()` from monitoring module

```tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // logError(error) on mount
  return (
    <div className="...">
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

#### 3. Global Error Boundary: `apps/portal-medspa/src/app/global-error.tsx`

Root-level error boundary (catches errors in root layout):
- Similar to `error.tsx` but wraps entire app
- Minimal HTML (no shared layout)

#### 4. Monitoring Module: `packages/core/src/monitoring/index.ts`

Structured logging utility:

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export function logError(error: Error, context?: Record<string, unknown>): void;
export function logInfo(message: string, context?: Record<string, unknown>): void;
export function logMetric(name: string, value: number, context?: Record<string, unknown>): void;
```

Implementation:
- In production: structured JSON to stdout (Vercel captures)
- In development: colorized console output
- Context object merged into every log entry
- Error stack traces captured for `logError`

#### 5. Tests: `packages/core/src/monitoring/__tests__/monitoring.test.ts`

- `logError` includes error name, message, stack
- `logInfo` includes message + context
- `logMetric` includes name, value, unit
- Context merging works correctly
- Production mode outputs JSON

### Integration Points

After building the module, wrap key boundaries:
- All API route handlers — catch and log errors before returning 500
- Stripe webhook handler — log all events
- Connect API calls (from portal) — log failures with context

### Files Summary

```
apps/portal-medspa/src/app/api/health/route.ts
apps/portal-medspa/src/app/error.tsx
apps/portal-medspa/src/app/global-error.tsx
packages/core/src/monitoring/index.ts
packages/core/src/monitoring/__tests__/monitoring.test.ts
packages/core/src/index.ts                          ← add monitoring export
```

### Skill Mapping

| Skill | Collection | Purpose |
|-------|-----------|---------|
| `add-observability` | Agent Core | Instrument all API route boundaries with leveled structured logs |
| `modify-feature` (`mode=balanced`) | Agent Core | Add error boundary to existing Next.js app without breaking routes |
| `write-tests` | Agent Core | Monitoring utilities tests (logError, logInfo, logMetric) |
| `simplify` | Agent Core | Post-build cleanup — remove console.log, replace with logInfo |
| `check-pr-readiness` | Agent Core | Verify typecheck + test + build pass |
| `update-changelog` | Agent Core | Add CHANGELOG entry for observability feature |

### Subagent Mapping

| Subagent | Category | Purpose |
|----------|----------|---------|
| `sre-engineer` | 03-Infrastructure | Monitoring strategy, alerting thresholds, log aggregation |
| `devops-engineer` | 03-Infrastructure | Health check endpoint design, Vercel log integration |
| `backend-developer` | 01-Core Development | Structured logging module implementation |
| `typescript-pro` | 02-Language Specialists | Type-safe log levels, context typing |
| `code-reviewer` | 04-Quality & Security | Review error boundary coverage, verify no silent failures |

### Per-Deliverable Skill Routing

| Deliverable | Primary Skill | Subagent |
|-------------|--------------|----------|
| Health endpoint `/api/health` | `add-observability` | `sre-engineer`, `devops-engineer` |
| Error boundary `error.tsx` | `modify-feature` | `nextjs-developer` |
| Global error boundary `global-error.tsx` | `modify-feature` | `nextjs-developer` |
| Monitoring module `packages/core/src/monitoring/` | `add-observability` | `backend-developer` |
| Monitoring tests | `write-tests` | `typescript-pro` |
| Wrap existing API handlers with logging | `add-observability` | `backend-developer` |
| Post-build verification | `check-pr-readiness` → `simplify` | `code-reviewer` |

---

## 1C. Self-Service Signup Flow

### Problem

Basic signup exists (`/auth/signup`) but there's no flow for plan selection → Stripe checkout → account provisioning. Pilots sign up manually; paying customers need self-service.

### What to Build

#### 1. Enhanced Signup Page: `apps/portal-medspa/src/app/signup/page.tsx`

**Note:** This is a NEW page at `/signup`, separate from the existing `/auth/signup`.

Two-step flow:
1. **Plan selection** — if no `?plan=` query param, show plan chooser (reuse pricing card layout)
2. **Signup form** — clinic name, owner name, email, password, phone

If `plan=pilot`:
- Submit to existing auth signup flow
- Redirect to dashboard

If `plan=connect`:
- Create auth account first
- Then redirect to Stripe Checkout for subscription
- On checkout success → webhook activates subscription → redirect to dashboard

#### 2. Signup Success Page: `apps/portal-medspa/src/app/signup/success/page.tsx`

- Reads `?plan=` and `?session_id=` from query
- Pilot: "Welcome! Your account is ready." → link to dashboard
- Connect: "Payment received! Your subscription is active." → link to dashboard

#### 3. Enhanced Signup API: `apps/portal-medspa/src/app/api/auth/signup-enhanced/route.ts`

POST handler:
- Body: `{ clinic_name, owner_name, email, password, phone, plan }`
- Creates Supabase auth user
- Creates clinic record
- Creates staff record (owner role)
- If `plan === 'connect'`: creates Stripe customer + returns checkout URL
- If `plan === 'pilot'`: returns dashboard URL

**Security:** Rate limit via existing Upstash integration (or basic in-memory throttle). Validate input with zod.

### Flow Diagram

```
/pricing → user clicks "Get Connect"
  → /signup?plan=connect
    → user fills form
      → API creates account
        → plan=pilot: redirect /dashboard
        → plan=connect: redirect Stripe Checkout
          → success: webhook → /signup/success?plan=connect
          → dashboard unlocked
```

### Files Summary

```
apps/portal-medspa/src/app/signup/page.tsx
apps/portal-medspa/src/app/signup/success/page.tsx
apps/portal-medspa/src/app/api/auth/signup-enhanced/route.ts
```

### Skill Mapping

| Skill | Collection | Purpose |
|-------|-----------|---------|
| `modify-feature` (`mode=production`) | Agent Core | Extend existing signup with plan selection flow |
| `polish-ui` | Agent Core | Plan selection card UI, success page with different paths |
| `add-e2e-test` | Agent Core | Playwright test: signup → checkout → dashboard for both plans |
| `harden-types` | Agent Core | Type-safe plan selection union, zod input validation |
| `audit-authz` | Agent Core | Verify paid plan can't be activated without Stripe checkout |
| `simplify` | Agent Core | Post-build cleanup on signup flow |
| `check-pr-readiness` | Agent Core | Verify typecheck + test + build pass |
| `update-changelog` | Agent Core | Add CHANGELOG entry for self-service signup |

### Subagent Mapping

| Subagent | Category | Purpose |
|----------|----------|---------|
| `frontend-developer` | 01-Core Development | Multi-step signup UI, plan card component |
| `payment-integration` | 07-Specialized Domains | Stripe Checkout session creation during signup |
| `security-auditor` | 04-Quality & Security | Verify signup can't bypass Stripe for paid plans, rate limiting |
| `nextjs-developer` | 02-Language Specialists | App Router pages, query param handling, redirect flow |
| `qa-expert` | 04-Quality & Security | Edge case testing (existing email, weak password, checkout cancel) |
| `code-reviewer` | 04-Quality & Security | Review signup flow for auth race conditions |

### Per-Deliverable Skill Routing

| Deliverable | Primary Skill | Subagent |
|-------------|--------------|----------|
| Enhanced signup page `/signup` | `modify-feature` → `polish-ui` | `frontend-developer`, `nextjs-developer` |
| Signup success page `/signup/success` | `modify-feature` → `polish-ui` | `frontend-developer` |
| Enhanced signup API route | `modify-feature` → `harden-types` | `payment-integration`, `security-auditor` |
| E2E test (signup → checkout → dashboard) | `add-e2e-test` | `qa-expert` |
| Post-build verification | `check-pr-readiness` → `simplify` | `code-reviewer` |

---

## 1D. Feedback Collection Infrastructure

### Problem

Feedback process is entirely manual (spreadsheets, calls). A basic in-app feedback mechanism catches bugs early and tracks feature requests without requiring a call.

### What to Build

#### 1. Migration: `supabase/migrations/0015_feedback.sql`

Table: `feedback`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid default gen_random_uuid()` | PK |
| `clinic_id` | `uuid` | FK → `clinics(id)` |
| `submitted_by` | `uuid` | FK → `staff(id)` |
| `category` | `text not null` | `bug`, `feature`, `improvement`, `question`, `complaint` |
| `message` | `text not null` | The feedback text |
| `priority` | `text not null default 'medium'` | `low`, `medium`, `high`, `critical` |
| `status` | `text not null default 'new'` | `new`, `triaged`, `in_progress`, `resolved`, `closed` |
| `created_at` | `timestamptz default now()` | |

RLS: Staff can insert for their clinic. Owners can read all clinic feedback.

```sql
CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  submitted_by uuid NOT NULL REFERENCES staff(id),
  category text NOT NULL CHECK (category IN ('bug', 'feature', 'improvement', 'question', 'complaint')),
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_feedback_clinic_id ON feedback(clinic_id);
CREATE INDEX idx_feedback_status ON feedback(status);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can submit feedback for their clinic"
  ON feedback FOR INSERT
  WITH CHECK (
    clinic_id IN (SELECT clinic_id FROM staff WHERE id = auth.uid())
  );

CREATE POLICY "Clinic staff can read their feedback"
  ON feedback FOR SELECT
  USING (
    clinic_id IN (SELECT clinic_id FROM staff WHERE id = auth.uid())
  );
```

#### 2. Feedback API: `apps/portal-medspa/src/app/api/feedback/route.ts`

POST (auth required):
- Body: `{ category, message }`
- Auto-detects clinic_id from session
- Auto-assigns priority based on keywords:
  - "broken", "can't", "critical", "error", "crash" → high
  - Default → medium
- Inserts row
- Returns `{ id, status: 'new' }`

GET (auth + owner required):
- Returns all feedback for clinic, ordered by `created_at DESC`

#### 3. Feedback Page: `apps/portal-medspa/src/app/dashboard/feedback/page.tsx`

Dashboard page (auth required):
- Feedback form at top (category dropdown, message textarea, submit button)
- List of past feedback below (filtered by status optionally)
- Owners see all feedback; staff see their own submissions
- Empty state: "No feedback yet. Submit your first piece of feedback above."

#### 4. Feedback Widget: `apps/portal-medspa/src/components/feedback-widget.tsx`

Floating button (bottom-right corner) visible on all dashboard pages:
- Click → opens modal (reuse `@baseplate/ui` Modal component)
- Modal contains: category dropdown, message textarea, submit button
- On submit: POST to `/api/feedback`, show success toast, close modal
- Keyboard accessible (focus trap inside modal, Escape to close)

Match modal pattern from `@baseplate/ui/modal.tsx` — same open/close behavior, same overlay styling.

### Files Summary

```
supabase/migrations/0015_feedback.sql
apps/portal-medspa/src/app/api/feedback/route.ts
apps/portal-medspa/src/app/dashboard/feedback/page.tsx
apps/portal-medspa/src/components/feedback-widget.tsx
apps/portal-medspa/src/app/dashboard/layout.tsx        ← add FeedbackWidget to layout
```

### Skill Mapping

| Skill | Collection | Purpose |
|-------|-----------|---------|
| `add-feature` (`mode=balanced`) | Agent Core | New feedback feature end-to-end |
| `add-migration` | Agent Core | Feedback table (additive, safe — new table only) |
| `add-empty-error-states` | Agent Core | Empty feedback list state + API error state |
| `polish-ui` | Agent Core | Floating feedback button UX, modal form, toast notification |
| `propagate-ui-pattern` | Agent Core | Match existing `@baseplate/ui` Modal open/close behavior |
| `audit-a11y` | Agent Core | Feedback widget keyboard accessible (focus trap, Escape, ARIA) |
| `harden-types` | Agent Core | Category/priority/status union types, zod validation on input |
| `simplify` | Agent Core | Post-build cleanup |
| `check-pr-readiness` | Agent Core | Verify typecheck + test + build pass |
| `update-changelog` | Agent Core | Add CHANGELOG entry for feedback feature |

### Subagent Mapping

| Subagent | Category | Purpose |
|----------|----------|---------|
| `frontend-developer` | 01-Core Development | Feedback widget component, floating button, modal form |
| `qa-expert` | 04-Quality & Security | Feedback submission flow testing, permission checks |
| `react-specialist` | 02-Language Specialists | Client component state management for modal/toast |
| `postgres-pro` | 05-Data & AI | Feedback table schema, indexes, RLS policy design |
| `accessibility-tester` | 04-Quality & Security | Widget keyboard nav, screen reader compatibility |
| `ui-designer` | 01-Core Development | Visual design of floating button + modal |
| `code-reviewer` | 04-Quality & Security | Review feedback API auth + RBAC, priority auto-assignment logic |

### Per-Deliverable Skill Routing

| Deliverable | Primary Skill | Subagent |
|-------------|--------------|----------|
| Migration `0015_feedback.sql` | `add-migration` | `postgres-pro` |
| Feedback API `/api/feedback` | `add-feature` → `harden-types` | `backend-developer` |
| Feedback page `/dashboard/feedback` | `add-feature` → `add-empty-error-states` | `frontend-developer` |
| Feedback widget component | `add-feature` → `polish-ui` → `propagate-ui-pattern` | `frontend-developer`, `ui-designer` |
| Widget a11y pass | `audit-a11y` | `accessibility-tester` |
| Post-build verification | `check-pr-readiness` → `simplify` | `code-reviewer` |

---

## 1E. ML Pipeline Wiring (Deferred to Part 7)

> **Prerequisite:** 3+ clinics using portal for 4-6 weeks. Built in Part 7 after real data exists.

### What to Build (High-Level)

#### 1. Update Feature Extraction: `ml-models/src/features.py`

- Add `fetch_pilot_data(supabase_url, supabase_key)` function
- Pull real appointment history, payment records, patient engagement from Supabase
- Return features DataFrame matching existing schema

#### 2. Update Training: `ml-models/src/train.py`

- Replace synthetic data source with `fetch_pilot_data()`
- Train churn/LTV/demand models on real data
- Save as `.joblib` to `ml-models/models/` (gitignored)

#### 3. Update Serve Endpoint: `ml-models/src/serve.py`

- Load trained `.joblib` model at startup
- FastAPI endpoint: `POST /predict/churn` → accepts features, returns prediction + confidence
- Health check: `GET /health`

#### 4. Update Connect API: `apps/connect-api/src/app/api/v1/intelligence/churn-prediction/route.ts`

- Call ML serve endpoint (`ML_SERVE_URL`) with patient features
- If serve endpoint is down or returns error → fall back to existing heuristic
- Log whether prediction came from ML model or heuristic fallback

#### 5. Surface in Dashboard

- Add ML prediction card to patient detail page (showing churn risk + confidence)
- Add "ML Insights" section to dashboard overview (for owners)

### Deployment

- Deploy FastAPI serve endpoint to Railway, Fly.io, or Vercel serverless
- Set `ML_SERVE_URL` env var on Connect API

### Files Summary

```
ml-models/src/features.py                          ← update
ml-models/src/train.py                             ← update
ml-models/src/serve.py                             ← update
apps/connect-api/src/app/api/v1/intelligence/churn-prediction/route.ts  ← update
apps/portal-medspa/src/app/dashboard/patients/[id]/page.tsx  ← add ML card
apps/portal-medspa/src/app/dashboard/page.tsx      ← add ML insights section
```

### Skill Mapping

| Skill | Collection | Purpose |
|-------|-----------|---------|
| `add-feature` (`mode=balanced`) | Agent Core | Wire ML serve endpoint to Connect API |
| `modify-feature` (`mode=balanced`) | Agent Core | Update existing churn-prediction endpoint with ML fallback |
| `add-observability` | Agent Core | Log ML predictions + fallback events (model vs heuristic) |
| `simplify` | Agent Core | Post-update cleanup on churn endpoint |
| `check-pr-readiness` | Agent Core | Verify typecheck + test + build pass |
| `update-changelog` | Agent Core | Add CHANGELOG entry for ML integration |

### Subagent Mapping

| Subagent | Category | Purpose |
|----------|----------|---------|
| `ml-engineer` | 05-Data & AI | Model training, feature engineering, accuracy validation |
| `data-engineer` | 05-Data & AI | Supabase data export pipeline, feature extraction |
| `data-scientist` | 05-Data & AI | Model accuracy validation, confusion matrix, ROC analysis |
| `python-pro` | 02-Language Specialists | FastAPI serve endpoint, pandas data manipulation |
| `node-specialist` | 02-Language Specialists | Connect API endpoint update (TS), fetch call to FastAPI |
| `devops-engineer` | 03-Infrastructure | Deploy FastAPI to Railway/Fly.io, set ML_SERVE_URL env var |
| `code-reviewer` | 04-Quality & Security | Review fallback logic — must never crash the endpoint |

### Per-Deliverable Skill Routing

| Deliverable | Primary Skill | Subagent |
|-------------|--------------|----------|
| Feature extraction update `features.py` | `modify-feature` | `data-engineer`, `python-pro` |
| Training update `train.py` | `modify-feature` | `ml-engineer`, `data-scientist` |
| Serve endpoint `serve.py` | `add-feature` | `python-pro` |
| Connect API churn endpoint update | `modify-feature` → `add-observability` | `node-specialist` |
| ML prediction card in patient detail | `add-feature` → `polish-ui` | `frontend-developer` |
| ML insights section on dashboard | `add-feature` → `polish-ui` | `frontend-developer` |
| FastAPI deployment | `release` | `devops-engineer` |
| Post-build verification | `check-pr-readiness` → `simplify` | `code-reviewer` |

---

## Build Order

```
1A (Pricing + Billing)     ─┐
1B (Observability)          ├─ All four can run in parallel
1C (Self-Service Signup)    │   (independent features, no cross-deps)
1D (Feedback Widget)       ─┘
                               1E deferred to Part 7 (needs real data)
```

**Recommended sequence if building serially:**
1. **1B first** (observability) — errors from other features will be visible
2. **1A second** (billing) — biggest feature, most complex
3. **1C third** (signup) — depends on 1A (pricing page links to signup)
4. **1D fourth** (feedback) — standalone, quick to build

After each feature:
- Run `pnpm typecheck && pnpm test && pnpm build`
- Use `check-pr-readiness` skill to verify
- Use `simplify` skill to clean up
- Use `update-changelog` skill for CHANGELOG entry

---

## Conventions

### Code Style
- TypeScript strict mode (already configured)
- No `any` types — use `harden-types` skill if found
- zod validation on all API route inputs
- `import type` for type-only imports
- `.js` extensions in relative imports (ESM)

### UI
- Use `@baseplate/ui` components (Button, Input, Form, Table, Modal, Layout)
- Use `@baseplate/patterns` for form building (FormBuilder)
- Tailwind CSS for styling — match existing portal pages
- Responsive: mobile-first, `md:` breakpoints
- All new pages need empty + error states

### API Routes
- Use `@baseplate/next-api` factories (`createRouteHandler`, `jsonResponse`, `errorResponse`)
- Auth check first (session-based, `@supabase/ssr`)
- RBAC check second (owner/staff role from session)
- zod validation third
- Business logic last
- Error logging via `@baseplate/core/monitoring`

### Database
- Migrations run via Supabase SQL Editor (manual)
- RLS on every new table
- `gen_random_uuid()` for IDs
- `timestamptz` for all timestamps
- `now()` defaults on `created_at`

### Testing
- Jest (already configured per-package)
- `--passWithNoTests` where no tests exist yet
- Mock Supabase client in tests (don't hit real DB)
- Mock Stripe SDK in tests

### Security
- Never log secrets, tokens, or PHI
- Validate all user input with zod
- Auth + RBAC on every API route
- Rate limit signup endpoint
- Stripe webhook must verify signature

---

> **After building all code gaps:** Run `pnpm typecheck && pnpm test && pnpm build`, then proceed to Part 2 (Production Deploy) in `PHASE_5_EXECUTION_PLAN.md`.
