# Phase 2 Execution Plan

> **Purpose:** Step-by-step guide for completing Phase 2 (Platform Layer Build).
> All decisions are locked. This is the build document — not a planning doc.
>
> **Estimated time:** 15-20 hours of AI-assisted build work
> **Prerequisites:** Phase 1 complete (staging smoke test passed)
>
> **Key decisions (locked):**
> - **Generalization:** Keep as-is (Option C) — codebase is already 95% vertical-agnostic
> - **Connect API:** Next.js API routes (not Express) — faster, familiar, one hosting provider
> - **Execution order:** Generalize first → Connect API → Hardening → Cross-vertical validation

---

## Table of Contents

1. [Phase 2A: Light Generalization + Repo Prep](#phase-2a)
2. [Phase 2B: Connect API](#phase-2b)
3. [Phase 2C: Hardening + Documentation](#phase-2c)
4. [Phase 2D: Cross-Vertical Validation](#phase-2d)
5. [Gate Check](#gate-check)
6. [Architecture Reference](#architecture-reference)

---

## Phase 2A: Light Generalization + Repo Prep
> ~3 hours | 5 steps

### Step 1: Add Type Aliases for Multi-Vertical Readiness
> Signals intent without changing anything structurally. Zero risk.

**File:** `packages/core/src/types/index.ts`

Add these aliases at the bottom of the file:

```typescript
// ─── Multi-Vertical Type Aliases ───────────────────────────────
// These aliases let other verticals use generic terms without
// renaming the existing med-spa types. They are zero-cost —
// TypeScript erases them at compile time.

/** The tenant/organization that owns the data */
export type Tenant = Clinic;

/** The end customer/patient receiving services */
export type Customer = Patient;

/** A schedulable resource (provider, technician, contractor, etc.) */
export type Resource = Provider;

/** A schedulable space (room, bay, chair, etc.) */
export type Space = Room;
```

**File:** `packages/core/src/index.ts`

Add to the re-exports:

```typescript
export type { Tenant, Customer, Resource, Space } from './types';
```

- [ ] Add type aliases
- [ ] Typecheck passes
- [ ] Commit: `"feat: add multi-vertical type aliases (Tenant/Customer/Resource/Space)"`

---

### Step 2: Make RBAC Permission Keys Generic
> Currently hardcoded to med-spa concepts like `canViewAllPatients`. Generalize the names.

**File:** `packages/core/src/rbac/types.ts`

```typescript
export type Role = 'owner' | 'staff' | 'patient';

export interface Permission {
  /** View all records within the tenant (patients, customers, etc.) */
  canViewAllRecords: boolean;
  /** View all appointments/bookings within the tenant */
  canViewAllAppointments: boolean;
  /** View all payment/billing data within the tenant */
  canViewAllPayments: boolean;
  /** View audit logs */
  canViewAuditLogs: boolean;
  /** Create or invite staff members */
  canManageStaff: boolean;
  /** Create appointments/bookings */
  canCreateAppointment: boolean;
  /** View own data only (self-service) */
  canViewOwnData: boolean;
}
```

**File:** `packages/core/src/rbac/index.ts`

Update the PERMISSIONS map keys to match the new interface:

```typescript
const PERMISSIONS: Record<Role, Permission> = {
  owner: {
    canViewAllRecords: true,
    canViewAllAppointments: true,
    canViewAllPayments: true,
    canViewAuditLogs: true,
    canManageStaff: true,
    canCreateAppointment: true,
    canViewOwnData: true,
  },
  staff: {
    canViewAllRecords: true,
    canViewAllAppointments: true,
    canViewAllPayments: true,
    canViewAuditLogs: false,
    canManageStaff: false,
    canCreateAppointment: true,
    canViewOwnData: true,
  },
  patient: {
    canViewAllRecords: false,
    canViewAllAppointments: false,
    canViewAllPayments: false,
    canViewAuditLogs: false,
    canManageStaff: false,
    canCreateAppointment: false,
    canViewOwnData: true,
  },
};
```

**Files that reference old permission keys (grep for `canViewAllPatients`, `canCreateStaff`, `canDeleteStaff`):**
- `packages/core/src/rbac/__tests__/rbac.test.ts` — update test assertions
- `apps/portal-medspa/src/middleware.ts` — update any `canPerform` calls
- `apps/portal-medspa/src/app/dashboard/audit-logs/page.tsx` — update role check

- [ ] Update `rbac/types.ts` (Permission interface keys)
- [ ] Update `rbac/index.ts` (PERMISSIONS map keys)
- [ ] Update all consumers (grep for old key names)
- [ ] Update RBAC tests
- [ ] Typecheck + test passes
- [ ] Commit: `"refactor: generalize RBAC permission keys (canViewAllPatients→canViewAllRecords, etc.)"`

---

### Step 3: Code Cleanup
> Remove any pilot-specific references, debug code, or stale comments.

- [ ] Grep entire `Med Spa App/` for: `'pilot'`, `'test_'`, `'TODO'`, `'FIXME'`, `'HACK'`, `'XXX'` — review and remove/fix each
- [ ] Check for any hardcoded UUIDs in source (not test) files
- [ ] Remove any `console.log` / `console.debug` in production source files (not tests)
- [ ] Verify no API keys, secrets, or real email addresses in source files
- [ ] Commit: `"chore: code cleanup — remove debug statements, TODOs, pilot references"`

---

### Step 4: Root README

**File:** `Med Spa App/README.md`

Write a comprehensive README with these sections:

```markdown
# Baseplate — AI-Built B2B SaaS Platform

> Open-source monorepo for building vertical-specific SaaS applications.
> Med Spa portal is the first vertical. Built to generalize.

## Quick Start

\`\`\`bash
git clone <repo-url>
cd baseplate
pnpm install
cp apps/portal-medspa/.env.local.example apps/portal-medspa/.env.local
# Fill in .env.local with Supabase, Stripe, Postmark, Twilio keys
pnpm dev
\`\`\`

## Architecture

[ASCII diagram showing:
  apps/portal-medspa (Next.js 14)
  apps/connect-api (Next.js 14, separate Vercel project)
  packages/core (16 modules)
  packages/ui (6 components)
  packages/patterns (6 patterns)
  packages/integrations (3: stripe, postmark, twilio)
  packages/hooks, next-api, dates
  supabase/migrations (8 migrations)]

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, React 18, Tailwind CSS |
| Backend | Next.js API Routes, Supabase (PostgreSQL) |
| API | Connect API (separate Next.js app, API-key auth) |
| Payments | Stripe |
| Email | Postmark |
| SMS | Twilio |
| Auth | Supabase Auth + @supabase/ssr |
| Hosting | Vercel |

## Module Library

| Package | Modules | Purpose |
|---------|---------|---------|
| @baseplate/core | 16 | Auth, RBAC, audit, encryption, scheduling, intake, payments, reporting, errors, bookings, availability, notifications, utils, config, types, clinics |
| @baseplate/ui | 6 | Button, Input, Form, Table, Modal, Layout |
| @baseplate/patterns | 6 | Digital signature, admin setup, invite user, media upload, form builder, consent form |
| @baseplate/hooks | 2 | useApiQuery, useApiMutation |
| @baseplate/next-api | 4 | createRouteHandler, createGetHandler, jsonResponse, errorResponse |
| @baseplate/dates | 8+ | Date utilities, range presets |
| @baseplate/stripe | 2 | createPaymentLink, constructWebhookEvent |
| @baseplate/postmark | 2 | sendEmail, sendAppointmentConfirmationEmail |
| @baseplate/twilio | 2 | sendSMS, sendAppointmentReminderSMS |

## Commands

\`\`\`bash
pnpm dev           # Start dev server
pnpm build         # Build all packages
pnpm test          # Run all tests (203+ tests)
pnpm typecheck     # TypeScript check all packages
\`\`\`

## Project Structure

[Tree showing apps/ and packages/ with one-line descriptions]

## License

MIT
```

- [ ] Write README
- [ ] Commit: `"docs: add comprehensive root README with architecture diagram"`

---

### Step 5: .env.example Template

**File:** `Med Spa App/.env.example` (root level — for developers cloning the repo)

```bash
# ─── App ───
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Supabase ───
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ─── Stripe ───
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ─── Postmark ───
POSTMARK_API_TOKEN=xxx
POSTMARK_FROM_EMAIL=noreply@yourdomain.com

# ─── Twilio ───
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+15125551234

# ─── Connect API ───
CONNECT_API_URL=http://localhost:3001
CONNECT_API_KEY=your-api-key

# ─── Optional ───
PHI_ENABLED=false
```

- [ ] Create root `.env.example`
- [ ] Commit: `"docs: add root .env.example template"`

---

### Phase 2A Gate
- [ ] Typecheck passes (all 10 packages)
- [ ] All tests pass
- [ ] Next.js build succeeds
- [ ] Commit all 2A work

---

## Phase 2B: Connect API
> ~8 hours | 7 steps

### Step 6: Scaffold Connect API as Next.js App

Create `apps/connect-api/` as a standalone Next.js application with API-key auth.

**Directory structure:**
```
apps/connect-api/
├── package.json
├── next.config.js
├── tsconfig.json
├── .env.local.example
└── src/
    └── app/
        ├── layout.tsx
        ├── page.tsx                  # Landing page (health check + docs link)
        └── api/
            ├── health/route.ts       # GET /api/health — unauthenticated
            └── v1/
                ├── communications/
                │   └── sms-reminder/route.ts
                ├── billing/
                │   └── package-deduct/route.ts
                └── reporting/
                    └── treatment-metrics/route.ts
```

**`apps/connect-api/package.json`:**
```json
{
  "name": "connect-api",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build",
    "start": "next start --port 3001",
    "test": "jest --passWithNoTests",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@baseplate/core": "workspace:*",
    "@baseplate/twilio": "workspace:*",
    "@baseplate/stripe": "workspace:*",
    "@supabase/supabase-js": "^2.39.0",
    "next": "^14.2.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0"
  }
}
```

**`apps/connect-api/src/app/api/health/route.ts`:**
```typescript
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'connect-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
}
```

**`apps/connect-api/src/app/layout.tsx` and `page.tsx`:** Minimal — a simple JSON status page or redirect to health endpoint.

**`apps/connect-api/next.config.js`:**
```javascript
/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ['@baseplate/core', '@baseplate/twilio', '@baseplate/stripe'],
};
```

- [ ] Create directory structure
- [ ] Create package.json, tsconfig.json, next.config.js
- [ ] Create health endpoint + landing page
- [ ] Run `pnpm install` from monorepo root
- [ ] Verify `pnpm dev` starts Connect API on port 3001
- [ ] Verify `curl http://localhost:3001/api/health` returns JSON
- [ ] Commit: `"feat: scaffold Connect API as standalone Next.js app"`

---

### Step 7: Build API-Key Auth Middleware

Every Connect API endpoint (except `/api/health`) requires a valid API key.

**Approach:** API keys are stored in the `staff` table or a new `api_keys` table. For Phase 2, use a simple env-var-based approach with a single shared key. Phase 5 adds per-clinic keys with metering.

**`apps/connect-api/src/lib/auth.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.CONNECT_API_KEY;

/**
 * Validate the X-API-Key header.
 * Returns null if valid, or a 401 NextResponse if invalid.
 */
export function validateApiKey(req: NextRequest): NextResponse | null {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not configured on server' }, { status: 500 });
  }

  const providedKey = req.headers.get('x-api-key');
  if (!providedKey || providedKey !== API_KEY) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 });
  }

  return null;
}
```

**Usage in each endpoint:**
```typescript
import { validateApiKey } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;
  // ... endpoint logic
}
```

- [ ] Create auth utility
- [ ] Add `CONNECT_API_KEY` to `.env.local.example`
- [ ] Commit: `"feat: add API-key authentication middleware for Connect API"`

---

### Step 8: Build Endpoint #1 — SMS Reminder

> `POST /api/v1/communications/sms-reminder`
> Built on: existing `@baseplate/twilio` integration

**Request schema (Zod):**
```typescript
const smsReminderSchema = z.object({
  appointment_id: z.string().uuid().optional(),
  patient_phone: z.string().min(10),
  patient_name: z.string(),
  appointment_time: z.string().datetime(),
  clinic_name: z.string(),
  template: z.enum(['pre-appointment', 'intake-reminder']).default('pre-appointment'),
  intake_url: z.string().url().optional(),
});
```

**Response:**
```json
{
  "message_id": "SM123abc",
  "status": "sent",
  "sent_at": "2024-06-15T14:00:00Z"
}
```

**Implementation:**
- File: `apps/connect-api/src/app/api/v1/communications/sms-reminder/route.ts`
- Uses `@baseplate/twilio`'s `sendSMS()` or `sendAppointmentReminderSMS()`
- Template logic builds message body based on `template` field
- Logs the call via `logAction()` from `@baseplate/core` (using service-role client)

- [ ] Create endpoint with Zod validation
- [ ] Create message template logic
- [ ] Test locally (mock Twilio or use test credentials)
- [ ] Write endpoint test
- [ ] Commit: `"feat: add POST /api/v1/communications/sms-reminder endpoint"`

---

### Step 9: Build Endpoint #2 — Package Deduct

> `POST /api/v1/billing/package-deduct`
> Requires: NEW database migration for credit packages

#### Step 9a: Database Migration

**File:** `supabase/migrations/0009_credit_packages.sql`

```sql
-- Migration: 0009_credit_packages.sql
-- Credit packages: patients buy bundles of sessions (e.g., "3 Botox treatments")
-- This enables the package-deduct API endpoint.

CREATE TABLE credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,          -- e.g., "Botox Package - 3 Sessions"
  service_type VARCHAR(100),            -- e.g., "Botox" (links to appointment.service_type)
  total_sessions INTEGER NOT NULL CHECK (total_sessions > 0),
  remaining_sessions INTEGER NOT NULL CHECK (remaining_sessions >= 0),
  amount_paid NUMERIC(10, 2),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_credit_packages_clinic ON credit_packages(clinic_id);
CREATE INDEX idx_credit_packages_patient ON credit_packages(patient_id);
CREATE INDEX idx_credit_packages_remaining ON credit_packages(remaining_sessions);

-- Transaction log for audit trail
CREATE TABLE package_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES credit_packages(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('purchase', 'deduct', 'refund', 'adjust')),
  previous_balance INTEGER NOT NULL,
  new_balance INTEGER NOT NULL,
  performed_by UUID,                    -- staff ID (null if automated)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_package_transactions_package ON package_transactions(package_id);
CREATE INDEX idx_package_transactions_clinic ON package_transactions(clinic_id);

-- RLS: only clinic staff can access packages
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_clinic_access" ON credit_packages
  FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM staff WHERE staff.id = auth.uid())
  );

CREATE POLICY "transactions_clinic_access" ON package_transactions
  FOR ALL USING (
    clinic_id IN (SELECT clinic_id FROM staff WHERE staff.id = auth.uid())
  );
```

#### Step 9b: Types + Core Module

**File:** `packages/core/src/types/index.ts` — add:
```typescript
export interface CreditPackage {
  id: string;
  clinic_id: string;
  patient_id: string;
  name: string;
  service_type?: string;
  total_sessions: number;
  remaining_sessions: number;
  amount_paid?: number;
  purchased_at: Date;
  expires_at?: Date;
  created_at: Date;
}

export interface PackageTransaction {
  id: string;
  package_id: string;
  clinic_id: string;
  appointment_id?: string;
  action: 'purchase' | 'deduct' | 'refund' | 'adjust';
  previous_balance: number;
  new_balance: number;
  performed_by?: string;
  created_at: Date;
}
```

**File:** `packages/core/src/packages/index.ts` — new module:
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { getAnonSupabaseClient } from '../config';
import { CreditPackage, PackageTransaction } from '../types';

export interface DeductPackageParams {
  packageId: string;
  patientId: string;
  clinicId: string;
  appointmentId?: string;
  performedBy?: string;
}

export async function deductPackageSession(
  params: DeductPackageParams,
  client?: SupabaseClient
): Promise<{ remaining: number; transaction: PackageTransaction }> {
  const supabase = client ?? getAnonSupabaseClient();

  // Fetch current balance (with row lock via UPDATE...RETURNING)
  const { data: pkg, error: fetchError } = await supabase
    .from('credit_packages')
    .select('remaining_sessions, total_sessions, patient_id, clinic_id')
    .eq('id', params.packageId)
    .eq('patient_id', params.patientId)
    .eq('clinic_id', params.clinicId)
    .single();

  if (fetchError || !pkg) throw new Error('Package not found');
  if (pkg.remaining_sessions <= 0) throw new Error('No sessions remaining in package');

  const previousBalance = pkg.remaining_sessions;
  const newBalance = previousBalance - 1;

  // Update balance
  const { error: updateError } = await supabase
    .from('credit_packages')
    .update({ remaining_sessions: newBalance })
    .eq('id', params.packageId);

  if (updateError) throw new Error(`Package update failed: ${updateError.message}`);

  // Log transaction
  const { data: txn, error: txnError } = await supabase
    .from('package_transactions')
    .insert({
      package_id: params.packageId,
      clinic_id: params.clinicId,
      appointment_id: params.appointmentId,
      action: 'deduct',
      previous_balance: previousBalance,
      new_balance: newBalance,
      performed_by: params.performedBy,
    })
    .select()
    .single();

  if (txnError) throw new Error(`Transaction log failed: ${txnError.message}`);

  return { remaining: newBalance, transaction: txn as PackageTransaction };
}

export async function getPatientPackages(
  patientId: string,
  clinicId: string,
  client?: SupabaseClient
): Promise<CreditPackage[]> {
  const supabase = client ?? getAnonSupabaseClient();
  const { data, error } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('patient_id', patientId)
    .eq('clinic_id', clinicId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Fetch packages failed: ${error.message}`);
  return (data ?? []) as CreditPackage[];
}
```

**Update:** `packages/core/package.json` exports + `packages/core/src/index.ts` re-exports.

#### Step 9c: API Endpoint

**File:** `apps/connect-api/src/app/api/v1/billing/package-deduct/route.ts`

Request schema:
```typescript
const packageDeductSchema = z.object({
  package_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  clinic_id: z.string().uuid(),
  appointment_id: z.string().uuid().optional(),
  performed_by: z.string().uuid().optional(),
});
```

Response:
```json
{
  "package_id": "uuid",
  "remaining_sessions": 2,
  "deducted_at": "2024-06-15T15:00:00Z"
}
```

- Uses `deductPackageSession()` from `@baseplate/core/packages`
- Uses `getServiceSupabaseClient()` (service-role, bypasses RLS for API access)
- Logs via `logAction()`

- [ ] Write migration `0009_credit_packages.sql`
- [ ] Add types to `packages/core/src/types/index.ts`
- [ ] Create `packages/core/src/packages/index.ts` module
- [ ] Update core exports (package.json + index.ts)
- [ ] Write tests for packages module
- [ ] Create endpoint
- [ ] Test locally
- [ ] Commit: `"feat: add POST /api/v1/billing/package-deduct endpoint + migration 0009"`

---

### Step 10: Build Endpoint #3 — Treatment Metrics

> `POST /api/v1/reporting/treatment-metrics`
> Built on: existing reporting module + server-side aggregation

**Request schema:**
```typescript
const treatmentMetricsSchema = z.object({
  clinic_id: z.string().uuid(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  group_by: z.enum(['provider', 'service_type', 'month']).default('service_type'),
});
```

**Response:**
```json
{
  "clinic_id": "uuid",
  "period": { "from": "2024-01-01T00:00:00Z", "to": "2024-06-15T23:59:59Z" },
  "metrics": [
    {
      "group_key": "Botox",
      "total_appointments": 45,
      "completed": 38,
      "cancelled": 7,
      "no_show_rate": 0.156,
      "revenue": 12500.00,
      "revenue_collected": 11200.00,
      "outstanding": 1300.00
    }
  ],
  "totals": {
    "total_appointments": 120,
    "total_revenue": 35000.00,
    "total_collected": 31000.00,
    "total_outstanding": 4000.00
  }
}
```

**Implementation:**
- File: `apps/connect-api/src/app/api/v1/reporting/treatment-metrics/route.ts`
- Uses `getServiceSupabaseClient()` to query appointments table
- Groups by `service_type`, `provider_id`, or `EXTRACT(MONTH FROM scheduled_time)` based on `group_by`
- This endpoint is read-only (no writes) but needs service-role to access all clinic data

- [ ] Create endpoint with Zod validation
- [ ] Write SQL aggregation query (use Supabase query builder or raw RPC)
- [ ] Test locally with seed data
- [ ] Write endpoint test
- [ ] Commit: `"feat: add POST /api/v1/reporting/treatment-metrics endpoint"`

---

### Step 11: Wire Portal to Call Connect API

> Prove the Connect API works by having the portal use it internally.

**Changes to `apps/portal-medspa/`:**

1. Add env vars to `.env.local`:
   ```
   CONNECT_API_URL=http://localhost:3001
   CONNECT_API_KEY=your-api-key
   ```

2. Update `apps/portal-medspa/src/app/api/appointments/confirm/route.ts`:
   - When sending SMS confirmation, call Connect API instead of calling Twilio directly:
   ```typescript
   const response = await fetch(`${process.env.CONNECT_API_URL}/api/v1/communications/sms-reminder`, {
     method: 'POST',
     headers: {
       'x-api-key': process.env.CONNECT_API_KEY!,
       'Content-Type': 'application/json',
     },
     body: JSON.stringify({
       appointment_id: appointment.id,
       patient_phone: phone,
       patient_name: patientName,
       appointment_time: scheduledTime,
       clinic_name: 'Glow Aesthetics',
       template: 'pre-appointment',
     }),
   });
   ```

3. Update the reporting dashboard to optionally call Connect API for treatment-metrics.

4. Add a "Packages" section to the patient detail page that calls the package-deduct endpoint.

- [ ] Add `CONNECT_API_URL` and `CONNECT_API_KEY` env vars
- [ ] Wire SMS confirmation through Connect API
- [ ] Wire reporting through Connect API
- [ ] Test end-to-end: Portal → Connect → Twilio/Supabase
- [ ] Commit: `"feat: portal calls Connect API instead of direct integrations"`

---

### Step 12: Deploy Connect API to Vercel

> Deploy as a separate Vercel project.

1. Push code to GitHub
2. Go to Vercel → New Project → Import repo
3. Set Root Directory to: `Med Spa App/apps/connect-api`
4. Add environment variables:
   - `CONNECT_API_KEY` — generate a strong random string
   - `SUPABASE_URL` — same as portal
   - `SUPABASE_ANON_KEY` — same as portal
   - `SUPABASE_SERVICE_ROLE_KEY` — same as portal
   - `TWILIO_ACCOUNT_SID` — same as portal
   - `TWILIO_AUTH_TOKEN` — same as portal
   - `TWILIO_PHONE_NUMBER` — same as portal
5. Deploy
6. Test: `curl https://connect-api-xxx.vercel.app/api/health`
7. Test with API key:
   ```bash
   curl -X POST https://connect-api-xxx.vercel.app/api/v1/reporting/treatment-metrics \
     -H "x-api-key: YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"clinic_id":"uuid"}'
   ```
8. Update portal's `CONNECT_API_URL` in Vercel env vars

- [ ] Deploy Connect API to Vercel
- [ ] Health check passes
- [ ] All 3 endpoints work with API key
- [ ] Portal updated to call production Connect API URL
- [ ] Commit: `"chore: deploy Connect API to Vercel + wire portal"`

---

### Phase 2B Gate
- [ ] Connect API deployed and responding
- [ ] All 3 endpoints work with API-key auth
- [ ] Portal successfully calls Connect API (end-to-end test)
- [ ] Migration 0009 run on staging Supabase
- [ ] All tests pass
- [ ] Commit all 2B work

---

## Phase 2C: Hardening + Documentation
> ~5 hours | 4 steps

### Step 13: Rate Limiting

**Approach:** Use Upstash Redis + `@upstash/ratelimit` (free tier: 10K commands/day).

1. Create an Upstash Redis database at https://console.upstash.com (free tier)
2. Get `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

**File:** `apps/connect-api/src/lib/rate-limit.ts`
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute per API key
  analytics: true,
});

export async function checkRateLimit(identifier: string): Promise<{ success: boolean; limit: number; remaining: number }> {
  return ratelimit.limit(identifier);
}
```

**Usage in each endpoint:**
```typescript
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const authError = validateApiKey(req);
  if (authError) return authError;

  const apiKey = req.headers.get('x-api-key')!;
  const rateLimit = await checkRateLimit(apiKey);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  }

  // ... endpoint logic
}
```

**Dependencies to add:**
- `@upstash/redis`
- `@upstash/ratelimit`

- [ ] Create Upstash Redis database (free tier)
- [ ] Add `@upstash/ratelimit` + `@upstash/redis` to connect-api package.json
- [ ] Create rate-limit utility
- [ ] Apply to all 3 endpoints
- [ ] Test: send 101 rapid requests, verify 429 response
- [ ] Commit: `"feat: add rate limiting via Upstash Redis"`

---

### Step 14: OpenAPI Documentation

**File:** `apps/connect-api/docs/openapi.yaml`

Write a complete OpenAPI 3.0 spec covering:
- API key auth scheme (header: `X-API-Key`)
- All 3 endpoints with request/response schemas
- Error response formats (400, 401, 404, 429, 500)
- Example requests/responses

**File:** `apps/connect-api/docs/README.md`

Write developer integration guide:
- Quick start (get API key, make first call)
- Authentication explanation
- All 3 endpoints with curl examples
- Error handling guide
- Rate limits
- SDK examples (JavaScript `fetch`, Python `requests`)

- [ ] Write OpenAPI spec
- [ ] Write developer integration guide
- [ ] Add JavaScript + Python examples
- [ ] Commit: `"docs: add OpenAPI spec + integration guide for Connect API"`

---

### Step 15: Pricing Structure Prep

> Create Stripe products for future tiers. Do NOT activate or make public.

**Pricing tiers:**
| Tier | Price | Limits |
|------|-------|--------|
| Free | $0 | 100 API calls/month |
| Starter | $49/mo | 500 calls, 2 integrations |
| Pro | $99/mo | 5,000 calls, 5 integrations |
| Enterprise | Custom | >10K calls |

1. In Stripe Dashboard → Products → Create 3 products:
   - `Connect API Starter` — $49/mo recurring
   - `Connect API Pro` — $99/mo recurring
   - `Connect API Enterprise` — Custom (flag as "contact sales")

2. Note the Price IDs (`price_xxx`) — store in a config file, not env vars

3. **Do NOT** create a public pricing page. Do NOT activate billing. This is prep only.

4. **Metering infra (lightweight):**
   - Add a `usage_log` table or use the existing `package_transactions` pattern
   - Log every API call's clinic_id + endpoint + timestamp
   - Simple count query: `SELECT COUNT(*) FROM api_usage WHERE clinic_id = $1 AND month = $2`
   - This is for Phase 5 billing enforcement, not Phase 2

- [ ] Create Stripe products in Dashboard
- [ ] Store Price IDs in config
- [ ] Create API usage logging table (migration 0010)
- [ ] Add usage logging to Connect API middleware
- [ ] Commit: `"feat: pricing structure prep — Stripe products + usage logging"`

---

### Step 16: Load Test

> Verify the 3 endpoints handle expected Phase 5 traffic.

**Expected Phase 5 load:** 3-10 clinics, ~50 API calls/day total.

**Test approach:**
1. Write a script that sends 100 concurrent requests to each endpoint
2. Measure: response time (p50, p95, p99), error rate, timeout rate
3. Target: all responses < 2 seconds, 0% error rate at 100 concurrent requests

```bash
# Using ab (Apache Bench) or a simple Node script
ab -n 100 -c 10 -H "x-api-key: YOUR_KEY" \
   -p body.json -T application/json \
   https://connect-api-xxx.vercel.app/api/v1/communications/sms-reminder
```

- [ ] Load test all 3 endpoints (100 requests each)
- [ ] Verify p95 < 2s
- [ ] Verify 0% error rate
- [ ] Document results
- [ ] Commit: `"test: load test Connect API endpoints"`

---

### Phase 2C Gate
- [ ] Rate limiting active and tested
- [ ] OpenAPI spec complete
- [ ] Integration guide written
- [ ] Pricing products created in Stripe (not activated)
- [ ] Usage logging working
- [ ] Load test passed
- [ ] Commit all 2C work

---

## Phase 2D: Cross-Vertical Validation
> ~3 hours | 2 steps

### Step 17: Create Minimal Second-Vertical Test App

> Prove the module library works for a non-med-spa domain.

Create a tiny test app at `apps/test-home-services/` (NOT a full portal — just a proof-of-concept):

```bash
mkdir apps/test-home-services
cd apps/test-home-services
npx create-next-app@latest . --typescript --app --no-tailwind
```

**What to prove:**

1. **Auth works:** Import `signUp` from `@baseplate/core`, create a "company" (not clinic)
2. **RBAC works:** Define roles as `owner | technician | customer` (not owner/staff/patient)
3. **Scheduling works:** Create a "technician" (provider) and book an appointment
4. **Payments work:** Generate a Stripe payment link
5. **Forms work:** Use `FormBuilder` from `@baseplate/patterns` with custom fields (not medical fields)

**Minimal test page:**
```typescript
import { getPermissions, canPerform } from '@baseplate/core';

// Verify RBAC works with different role interpretations
const ownerPerms = getPermissions('owner');
const canBook = canPerform('owner', 'canCreateAppointment');

// Verify FormBuilder renders non-medical fields
const fields = [
  { id: 'address', label: 'Service Address', type: 'text' as const, required: true },
  { id: 'issue', label: 'Describe the Problem', type: 'textarea' as const, required: true },
  { id: 'urgent', label: 'Is this an emergency?', type: 'checkbox' as const },
];
```

- [ ] Create test app
- [ ] Import and use @baseplate/core (auth, RBAC, scheduling)
- [ ] Import and use @baseplate/patterns (FormBuilder)
- [ | Import and use @baseplate/ui (Button, Form, Table)
- [ ] Verify no errors — modules work without med-spa context
- [ ] Document what worked and what needed config changes
- [ ] Commit: `"test: cross-vertical validation — home services test app"`

---

### Step 18: Document Cross-Vertical Config

**File:** `docs/CROSS_VERTICAL_GUIDE.md`

Document what a developer needs to change to build for a new vertical:

```markdown
# Building a New Vertical on Baseplate

## What You Get For Free
- Authentication (Supabase Auth)
- RBAC (role-based access control)
- Audit logging
- Encryption module
- Scheduling (providers, rooms, appointments)
- Intake forms (dynamic, configurable)
- Payments (Stripe)
- Notifications (email + SMS)
- Reporting (server-side aggregation)
- All UI components (Button, Input, Form, Table, Modal, Layout)
- All patterns (FormBuilder, ConsentForm, SignatureCapture, etc.)

## What You Configure Per Vertical

| Concept | Med Spa Config | Home Services Config | Fitness Config |
|---------|---------------|---------------------|----------------|
| Tenant | "Clinic" | "Company" | "Studio" |
| Customer | "Patient" | "Customer" | "Member" |
| Resource | "Provider" | "Technician" | "Trainer" |
| Space | "Room" | "Service Area" | "Court/Lane" |
| Service | "Treatment" | "Repair" | "Class" |
| Intake | "Medical History" | "Problem Description" | "Health Goals" |

## How to Build

1. Clone the repo
2. Create a new app in apps/ (copy portal structure)
3. Configure labels/terminology in a constants file
4. Create vertical-specific intake form fields
5. Configure Stripe products for your pricing
6. Deploy

## What NOT to Change
- packages/core/* — these are vertical-agnostic
- packages/ui/* — these accept configurable props
- packages/patterns/* — these accept configurable props
- packages/integrations/* — these wrap external APIs
- supabase/migrations/* — the schema works for any vertical
```

- [ ] Write cross-vertical guide
- [ ] Commit: `"docs: cross-vertical configuration guide"`

---

## Gate Check

### Phase 2 → Phase 3 Gate

| Criteria | Status | Evidence |
|----------|--------|----------|
| All modules generalized (work for ANY vertical) | ☐ | Cross-vertical test app passes |
| 3 Connect endpoints live + documented | ☐ | SMS, billing, reporting all deployed |
| Connect API auth + audit logging working | ☐ | API key validation + logAction on every call |
| API documentation complete | ☐ | OpenAPI spec + integration guide |
| Pricing structure designed (not activated) | ☐ | Stripe products created |
| Module library passes cross-vertical test | ☐ | Home services test app works |
| Portal successfully uses Connect APIs | ☐ | Portal calls Connect internally |
| Load test passed | ☐ | 100 concurrent requests, p95 < 2s |

### After Gate Passes:

1. Update `MASTER_PROGRESS.md`:
   - Change Phase 2 status to `✅ Complete`
   - Add all Phase 2 commits to Build Log
   - Update module inventory with new packages

2. Proceed to Phase 3 (Intelligence & Ecosystem Build)

---

## Architecture Reference

### Post-Phase-2 Monorepo Structure

```
Med Spa App/
├── apps/
│   ├── portal-medspa/           # Next.js 14 — Med Spa portal (Phase 1)
│   ├── connect-api/             # Next.js 14 — Connect API (Phase 2) ← NEW
│   └── test-home-services/      # Next.js 14 — Cross-vertical validation (Phase 2D) ← NEW
├── packages/
│   ├── core/                    # 17 modules (16 + packages ← NEW)
│   ├── ui/                      # 6 components
│   ├── patterns/                # 6 patterns
│   ├── hooks/                   # 2 hooks
│   ├── next-api/                # 4 route factories
│   ├── dates/                   # 8+ date utilities
│   └── integrations/
│       ├── stripe/
│       ├── postmark/
│       └── twilio/
├── supabase/
│   └── migrations/
│       ├── 0001-0008.sql        # Phase 1 migrations
│       ├── 0009_credit_packages.sql  ← NEW (Phase 2B)
│       └── 0010_api_usage.sql        ← NEW (Phase 2C)
└── docs/
    ├── HIPAA_COMPLIANCE.md
    └── CROSS_VERTICAL_GUIDE.md  ← NEW (Phase 2D)
```

### Connect API Request Flow

```
Portal (apps/portal-medspa)
  │
  │  POST /api/v1/communications/sms-reminder
  │  Headers: X-API-Key: sk_xxx
  │
  ▼
Connect API (apps/connect-api)
  │
  ├── Validate API key
  ├── Check rate limit (Upstash Redis)
  ├── Validate request body (Zod)
  ├── Call @baseplate/twilio → Twilio API
  ├── Log action via @baseplate/core → Supabase audit_logs
  └── Return response
```

### Key Design Principles

1. **Framework-agnostic business logic** — All domain logic lives in `@baseplate/core`. Connect API is a thin HTTP layer.
2. **One hosting provider** — Both portal and Connect API on Vercel. Can migrate Connect to Render/Fly.io later if needed.
3. **Service-role for API access** — Connect API uses `getServiceSupabaseClient()` (bypasses RLS) since it authenticates via API key, not user session.
4. **Migration path to Express** — If Phase 3+ needs always-warm servers, each Next.js route handler body becomes an Express callback. The `@baseplate/core` calls are identical.
5. **Rate limiting via Upstash** — Free tier covers current scale. No additional infrastructure.
