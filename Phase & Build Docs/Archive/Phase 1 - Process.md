# Phase 1: The Wedge & First Build — Process Guide

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log".

**Goal:** Build the complete med spa portal with full module library, security hardening, and staging deployment
**Note:** AI-accelerated — timelines are logical groupings, not calendar estimates. Customer onboarding deferred to Phase 5.

---

## Phase 1A, Week 1: The 1-Hour Challenge (Revisited)

### Step 1: Run the Challenge (1 hour, on a Monday)

You did this during Phase 0 outreach. Now do it again in production:

- [ ] Create a new GitHub repo: `baseplate` (or `baseplate-private` if you want to keep it private during development)
- [ ] Initialize a Next.js project: `npx create-next-app@latest baseplate --typescript --tailwind`
- [ ] Tell Cursor + Claude: "Build me a med spa portal with: login, a table of appointments, and a simple dashboard showing today's schedule and pending payments."
- [ ] Set a 60-minute timer. Go.
- [ ] Do not clean up. Do not refactor. Just build.

**Acceptable outcome:** Working UI that loads, some dummy data in a table, a couple of forms that do nothing. It's a spike, not production code.

- [ ] Commit as: `git commit -m "spike: throwaway vertical portal UI"`
- [ ] This lives in a temporary branch or is deleted later — **do not carry code forward from this spike.**

**The point:** You're checking:
1. Can you orchestrate Cursor + Claude effectively for this vertical's domain?
2. Which parts are hard (auth? data relationships? UI complexity)?
3. Which parts are easy (form generation? tables? navigation)?

---

## Phase 1A, Weeks 2-4: Core Scaffolding + Vertical Template

### Step 2: Set Up the Monorepo (Week 2, 4-6 hours)

Now throw away the spike. Start from scratch with proper architecture.

- [ ] Initialize pnpm monorepo:

```bash
cd baseplate
pnpm init
mkdir apps packages
mkdir packages/core packages/ui
mkdir apps/portal-medspa
```

- [ ] Create `pnpm-workspace.yaml` in the root:

```yaml
packages:
  - 'packages/**'
  - 'apps/**'
```

- [ ] Create `packages/core/package.json`:

```json
{
  "name": "@baseplate/core",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    "./auth": "./src/auth/index.ts",
    "./rbac": "./src/rbac/index.ts",
    "./audit": "./src/audit/index.ts"
  },
  "dependencies": {
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

- [ ] Create `packages/ui/package.json` (shared React components):

```json
{
  "name": "@baseplate/ui",
  "version": "0.0.1",
  "type": "module",
  "exports": {
    "./button": "./src/Button.tsx",
    "./table": "./src/Table.tsx",
    "./form": "./src/Form.tsx"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

- [ ] Create `apps/portal-medspa/package.json`:

```json
{
  "name": "portal-medspa",
  "version": "0.0.1",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "@baseplate/core": "workspace:*",
    "@baseplate/ui": "workspace:*",
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

- [ ] Create root `turbo.json`:

```json
{
  "$schema": "https://turborepo.org/schema.json",
  "pipeline": {
    "build": {
      "outputs": ["dist/**"],
      "cache": false
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

- [ ] Install dependencies: `pnpm install`
- [ ] Commit: `git commit -m "chore: initialize pnpm monorepo structure"`

### Step 3: Build Core Modules (Weeks 2-3, 8-10 hours)

Now build `packages/core`. This is consumed by the vertical template in Week 3.

**Module 1: Auth**

- [ ] Create `packages/core/src/auth/index.ts`:

```typescript
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: 'owner' | 'staff' | 'patient';
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

export async function hashPasswordSync(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
```

- [ ] Create tests: `packages/core/src/auth/__tests__/auth.test.ts`
- [ ] Run: `pnpm test` (add a basic test setup in root `package.json` if needed)
- [ ] Commit: `git commit -m "feat: add core auth module (hash, token generation)"`

**Module 2: RBAC (Role-Based Access Control)**

- [ ] Create `packages/core/src/rbac/index.ts`:

```typescript
export type Role = 'owner' | 'staff' | 'patient';

export interface Permission {
  resource: string;
  action: 'read' | 'write' | 'delete' | 'admin';
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    { resource: 'clinics', action: 'admin' },
    { resource: 'patients', action: 'admin' },
    { resource: 'appointments', action: 'admin' },
    { resource: 'payments', action: 'admin' },
    { resource: 'reports', action: 'read' },
  ],
  staff: [
    { resource: 'clinics', action: 'read' },
    { resource: 'patients', action: 'read' },
    { resource: 'appointments', action: 'write' },
    { resource: 'payments', action: 'write' },
    { resource: 'reports', action: 'read' },
  ],
  patient: [
    { resource: 'appointments', action: 'read' },
    { resource: 'payments', action: 'read' },
  ],
};

export function canPerform(role: Role, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.some(
    (p) => p.resource === resource && (p.action === action || p.action === 'admin')
  );
}
```

- [ ] Add tests, commit: `git commit -m "feat: add RBAC module"`

**Module 3: Audit Log**

- [ ] Create `packages/core/src/audit/index.ts`:

```typescript
export interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes: Record<string, any>;
  timestamp: Date;
}

export function createAuditEntry(
  userId: string,
  action: string,
  resource: string,
  resourceId: string,
  changes: Record<string, any>
): AuditEntry {
  return {
    id: `audit_${Date.now()}`,
    userId,
    action,
    resource,
    resourceId,
    changes,
    timestamp: new Date(),
  };
}

export function formatAuditLog(entries: AuditEntry[]): string {
  return entries
    .map(
      (e) =>
        `[${e.timestamp.toISOString()}] ${e.userId} ${e.action} ${e.resource}#${e.resourceId}: ${JSON.stringify(e.changes)}`
    )
    .join('\n');
}
```

- [ ] Commit: `git commit -m "feat: add audit log module"`

### Step 4: Build Vertical Template (Weeks 3-4, 12-15 hours)

Now create the actual product using the core modules.

- [ ] In `apps/portal-medspa`, create Next.js pages and components consuming `@baseplate/core` and `@baseplate/ui`

**For Med Spas, structure as:**

```
apps/portal-medspa/
  src/
    app/
      page.tsx              # Dashboard
      login/page.tsx
      patients/page.tsx
      appointments/page.tsx
      payments/page.tsx
      intake/page.tsx
      layout.tsx
    components/
      Header.tsx
      Sidebar.tsx
      PatientTable.tsx
      AppointmentTable.tsx
      PaymentTable.tsx
    lib/
      api.ts               # Fetch functions
      auth.ts              # Auth wrapper using @baseplate/core
  public/
  .env.local
  package.json
  tsconfig.json
```

**Step 4a: Login Page (3-4 hours)**

- [ ] Create `apps/portal-medspa/src/app/login/page.tsx` with:
  - Email + password form
  - Links to @baseplate/core hash/verify functions (via API route)
  - Session storage (JWT in localStorage or httpOnly cookie)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push('/');
    } else {
      setError('Invalid email or password');
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] Create `apps/portal-medspa/src/app/api/auth/login/route.ts`:

```typescript
import { hashPassword, verifyPassword, generateToken } from '@baseplate/core/auth';

// Mock user store (replace with real DB in Phase 1B)
const users = [
  { id: '1', email: 'test@example.com', passwordHash: '', role: 'owner' as const },
];

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
  }

  const token = generateToken(user.id);
  return new Response(JSON.stringify({ token, user }), {
    status: 200,
    headers: { 'Set-Cookie': `token=${token}; Path=/; HttpOnly` },
  });
}
```

- [ ] Test locally with dummy user, commit: `git commit -m "feat: add login page with auth API"`

**Step 4b: Dashboard & Core Tables (4-5 hours)**

- [ ] Create `apps/portal-medspa/src/app/page.tsx` (dashboard):

```typescript
'use client';

import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [data, setData] = useState({
    todayAppointments: 12,
    completedIntakes: 8,
    pendingPayments: 4200,
    upcomingBookings: 28,
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">Today's Appointments</p>
          <p className="text-2xl font-bold">{data.todayAppointments}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-600">Completed Intakes</p>
          <p className="text-2xl font-bold">{data.completedIntakes}</p>
        </div>
        <div className="bg-red-50 p-4 rounded">
          <p className="text-sm text-gray-600">Pending Payments</p>
          <p className="text-2xl font-bold">${data.pendingPayments}</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] Create `apps/portal-medspa/src/app/patients/page.tsx` with a basic table and add/edit forms
- [ ] Create `apps/portal-medspa/src/app/appointments/page.tsx` (same pattern)
- [ ] Create `apps/portal-medspa/src/app/payments/page.tsx` (same pattern)
- [ ] Commit: `git commit -m "feat: add dashboard, patients, appointments, payments pages"`

**Step 4c: Layout & Navigation (2-3 hours)**

- [ ] Create `apps/portal-medspa/src/app/layout.tsx` with header + sidebar
- [ ] Create shared components for reusable UI (buttons, tables, forms) in `packages/ui`
- [ ] Commit: `git commit -m "feat: add main layout and shared UI components"`

### Step 5: Deploy (End of Week 4, 1-2 hours)

- [ ] Deploy to Railway:
  - `npm i -g @railway/cli` (if not installed)
  - Link repo: `railway login`
  - Deploy: `railway up`
- [ ] Create a `.env.local` for local dev with mock data
- [ ] Test the deployment is live
- [ ] Document the deployment URL: _______________
- [ ] Commit: `git commit -m "chore: deploy to Railway"`

---

## Phase 1B: Real-World Integration

### Step 6: Stripe Integration (Weeks 5-6, 6-8 hours)

This becomes your first Connect endpoint (even though you're not calling it "Connect" yet).

- [ ] Create Stripe account (if you don't have one): https://stripe.com
- [ ] Store API keys in `.env.local`: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`

**Build invoice creation endpoint:**

- [ ] Create `apps/portal-medspa/src/app/api/payments/create-invoice/route.ts`:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req: Request) {
  const { patientId, amount, description, patientEmail } = await req.json();

  try {
    const invoice = await stripe.invoices.create({
      customer: patientId, // In production, you'll map patientId to Stripe customer ID
      amount_due: amount * 100, // Stripe expects cents
      currency: 'usd',
      description,
      auto_advance: false, // Manual send for now
    });

    await stripe.invoices.sendInvoice(invoice.id);

    return new Response(JSON.stringify({ invoice }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
```

- [ ] Create a UI form in `apps/portal-medspa/src/app/payments/send-invoice.tsx` that calls this endpoint
- [ ] Test with Stripe test keys
- [ ] Document: This is endpoint #1 of Connect (will be extracted in Phase 2)
- [ ] Commit: `git commit -m "feat: add Stripe invoice creation endpoint"`

**Build payment link/webhook handling:**

- [ ] Create `apps/portal-medspa/src/app/api/webhooks/stripe/route.ts` to handle `invoice.payment_succeeded`, `invoice.payment_failed`
- [ ] Log events to audit log (from @baseplate/core)
- [ ] Commit: `git commit -m "feat: add Stripe webhook handling and audit logging"`

### Step 7: Email Integration (Weeks 5-6, 3-4 hours)

- [ ] Sign up for Postmark (postmark.com) or SendGrid
- [ ] Store API key in `.env.local`

**Build email endpoint:**

- [ ] Create `apps/portal-medspa/src/app/api/notify/email/route.ts`:

```typescript
import Postmark from 'postmark';

const client = new Postmark.ServerClient(process.env.POSTMARK_API_KEY || '');

export async function POST(req: Request) {
  const { to, subject, body, templateAlias } = await req.json();

  try {
    const result = await client.sendEmail({
      From: 'noreply@baseplate.dev',
      To: to,
      Subject: subject,
      HtmlBody: body,
      MessageStream: 'outbound',
    });

    return new Response(JSON.stringify({ result }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
```

- [ ] Add email triggers: when payment is due, when patient hasn't completed intake before appointment, when appointment is confirmed or cancelled
- [ ] Commit: `git commit -m "feat: add email notifications via Postmark"`

### Step 8: Database (Real, not dummy) — Weeks 6-7, 4-5 hours

Replace the in-memory "mock user store" with a real database.

- [ ] Create a Supabase project (supabase.com) or Neon (neon.tech)
- [ ] Create tables in SQL:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'staff', 'patient')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  provider_id UUID REFERENCES users(id),
  room_id UUID,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  amount INT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  stripe_invoice_id TEXT,
  stripe_payment_link_url TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  changes JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

- [ ] Install Supabase client: `pnpm add @supabase/supabase-js`
- [ ] Create `apps/portal-medspa/src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);
```

- [ ] Update all API routes to query Supabase instead of mock data
- [ ] Test end-to-end: create a user, create a clinic, create a patient, create an appointment, create a payment, send an invoice
- [ ] Commit: `git commit -m "feat: integrate Supabase, replace mock data with real DB"`

### Step 9: Refactor for Build Completion — Week 8, 2-3 hours

- [ ] Remove any debug/test data from the code
- [ ] Create a simple "Sign up for free trial" flow on login page (auto-create owner account)
- [ ] Document setup instructions for a new user
- [ ] Commit: `git commit -m "chore: prepare for staging deploy"`

---

## Phase 1 Build Completion: Module Gaps + Architecture + Staging Deploy

> **Note:** Customer onboarding is deferred to Phase 5. Phase 1 is pure build — close module
> gaps, fix architecture, resolve HIPAA, deploy to staging, pass smoke test.

### Step 10: Close Module Library Gaps (AI-accelerated)

Extract reusable patterns identified during codebase review:

- [ ] `packages/core/errors` — structured error handling (eliminates 36 duplicated throw patterns)
- [ ] `packages/core/bookings` — booking orchestration (find-or-create + appointment in one call)
- [ ] `packages/core/availability` — pure slot calculation engine (extract from scheduling)
- [ ] `@baseplate/hooks` — useApiQuery / useApiMutation (eliminates ~100 lines duplication)
- [ ] `@baseplate/next-api` — route handler + middleware factories (eliminates ~200 lines boilerplate)
- [ ] `packages/core/notifications` — notification orchestration (email/SMS fan-out)
- [ ] `packages/core/utils` — shared utilities (date-range, clinic-scope, snake/camel conversion)
- [ ] `@baseplate/dates` — date utilities (startOfWeek, formatTime, DATE_RANGE_PRESETS)
- [ ] `packages/patterns/form-builder` — extract FormBuilder from app
- [ ] `packages/patterns/consent-form` — extract IntakeFormRenderer pattern

### Step 11: Fix Architecture (AI-accelerated)

- [ ] Add RBAC role checks to ALL dashboard pages (not just audit logs)
- [ ] Extract clinicId from session (remove NEXT_PUBLIC_CLINIC_ID hardcoding)
- [ ] Migrate to session-aware client (@supabase/ssr)
- [ ] Unify Supabase client pattern across all core modules
- [ ] Split scheduling/ into providers/, rooms/, appointments/, availability/
- [ ] Fix duplicate Role type (types/index.ts vs rbac/types.ts)
- [ ] Share FormField.type union between UI and core

### Step 12: Resolve HIPAA + Security (AI-accelerated)

- [ ] HIPAA compliance: BAA with Supabase OR restrict intake fields to non-PHI
- [ ] Stripe webhook error handling (distinguish transient vs permanent errors)
- [ ] Audit all API routes for proper authorization checks

### Step 13: Staging Deploy + Smoke Test

- [ ] Set up Supabase, Stripe, Postmark, Twilio staging accounts
- [ ] Run all 8 migrations on staging Supabase
- [ ] Configure all env vars in staging
- [ ] Deploy to Railway staging
- [ ] Pass post-deploy smoke test:
  - [ ] Owner signup creates clinic + staff record
  - [ ] Login works, session persists
  - [ ] Provider/Room creation works
  - [ ] Patient self-booking flow works end-to-end
  - [ ] Intake form submission works with signature
  - [ ] Payment link generation works
  - [ ] Stripe webhook updates payment status
  - [ ] Notifications (email + SMS) fire correctly
  - [ ] RBAC blocks staff from owner-only pages
  - [ ] Dashboard reporting loads with real data

### Step 14: Gate Check

**Phase 1 → Phase 2 gate threshold (build-focused):**
- ✅ All features built and tested (149+ tests, 0 failures)
- ✅ Module library gaps closed
- ✅ RBAC enforced on all routes
- ✅ HIPAA resolved
- ✅ Staging smoke test passes

**If gate passed:** Proceed to Phase 2 (Platform Layer Build)

**If gate missed:** Continue building until all criteria met.

---

## Summary: Phase 1 Artifacts You'll Have

By end of Phase 1:

- ✅ Working portal deployed to Railway staging
- ✅ Supabase DB with user, entity, and payment data
- ✅ Stripe invoicing and webhooks
- ✅ Postmark email notifications
- ✅ Auth module from @baseplate/core
- ✅ Complete module library (no gaps)
- ✅ RBAC on all protected routes
- ✅ HIPAA compliance posture resolved
- ✅ Git history showing the build progression
