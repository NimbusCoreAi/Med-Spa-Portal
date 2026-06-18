# Phase 2: Platform Layer Build — Process Guide

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase in this phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log". This is mandatory after every significant commit.

**Goal:** Build Connect API, generalize modules, prepare for open-source launch
**Note:** Pure build phase — no customer contact. AI-accelerated timelines.

---

## Phase 2A: Module Generalization + Repo Prep

> **Note:** Steps 1-3 prepare the codebase for open-source launch (which happens in Phase 4).
> Steps 4-5 (GitHub publish + social launch) are deferred to Phase 4.

### Step 1: Code Cleanup (Weeks 13-14, 6-8 hours)

Before publishing, remove pilot-specific code and data.

- [ ] **Remove hardcoded data:**
  - Delete any test accounts with real pilot info
  - Remove any pilot-specific logic or feature flags
  - Search for any hardcoded IDs, API keys, or business logic (grep for `'pilot'`, `'test'`, etc.)

- [ ] **Clean up documentation:**
  - Review code comments — remove references to specific pilots
  - Update component/module names to be generic (e.g., `PatientTable` not `JohnsPatientTable`)
  - Ensure variable names are domain-specific, not person-specific

- [ ] **Verify the monorepo structure:**
  - `packages/core` should have no vertical-specific code
  - `apps/portal-medspa` should have no other verticals' code
  - All secrets must be in `.env.local` or `.env.example`

- [ ] **Commit:** `git commit -m "chore: remove pilot-specific data and hardcoded references"`

### Step 2: Create `.env.example` (Week 14, 1 hour)

Developers will fork/clone your repo and need to know what env vars to set.

- [ ] Create `apps/portal-medspa/.env.example`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Postmark
POSTMARK_API_KEY=your-api-key

# Session
JWT_SECRET=your-secret-key-here
```

- [ ] Create a root `.env.example` for any shared secrets
- [ ] Commit: `git commit -m "docs: add .env.example template"`

### Step 3: Write Strong README (Week 14, 4-6 hours)

This is your marketing document. A weak README kills your OSS project before it starts.

- [ ] Create `README.md` in root with:

**1. Problem statement (2-3 sentences)**
> Most med spas juggle Mindbody, Square, and Google Drive to manage scheduling, patient intake, and payments. This fragmentation costs them hours per week.

**2. Screenshot or demo GIF (visual proof)**
- Screencap your best dashboard screen
- Or record a 30-second GIF of key workflow

**3. Quick wins callout**
> ✅ Free (MIT licensed)  
> ✅ Deploy in 5 minutes  
> ✅ AI-agent-friendly (works with Cursor, Claude)

**4. Installation in 5 minutes**

```bash
# Clone
git clone https://github.com/you/baseplate.git
cd baseplate

# Install
pnpm install

# Setup env
cp apps/portal-medspa/.env.example apps/portal-medspa/.env.local
# [Fill in the env vars — Supabase, Stripe, Postmark]

# Run
pnpm dev

# Open http://localhost:3000 and sign up
```

**5. Architecture diagram**
```
┌─────────────────────────────────────────────┐
│            Baseplate Portal                 │
│   (Next.js + React + Tailwind)              │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  pages/                             │   │
│  │  • Dashboard                        │   │
│  │  • Patients/Appointments            │   │
│  │  • Payments                         │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  @baseplate/core (packages/core/)   │   │
│  │  • Auth (login, JWT)                │   │
│  │  • RBAC (owner/staff/patient)       │   │
│  │  • Audit Log                        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Integrations                       │   │
│  │  • Stripe → Invoices                │   │
│  │  • Postmark → Email                 │   │
│  │  • Supabase → Database              │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**6. Tech stack**

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, Tailwind |
| Backend | Next.js API routes, Supabase |
| Database | PostgreSQL (Supabase) |
| Payments | Stripe |
| Email | Postmark |
| Hosting | Railway (frontend + Connect API) |

**7. Roadmap preview**

> Connect API included: unified middleware for QuickBooks, Xero, or other services without custom code.

**8. Contributing + License**

> MIT licensed. Contributions welcome.

- [ ] Review for typos, clarity, accuracy
- [ ] Get feedback from a fresh reader: "Would this README convince you to try it?"
- [ ] Commit: `git commit -m "docs: add comprehensive README"`

### Step 4: Module Generalization (4-6 hours)

> **Deferred to Phase 4:** GitHub publishing and social launch. This step focuses on making
> modules generalized and reusable.

- [ ] **Generalize core modules:** Remove any vertical-specific types, names, or logic
- [ ] **Generalize UI components:** Make labels, icons, and copy configurable
- [ ] **Test generalization:** Verify modules work in a fresh Next.js app without vertical deps
- [ ] **Document module APIs:** Each exported function should have JSDoc comments
- [ ] Commit: `git commit -m "feat: generalize modules for multi-vertical use"`

### Step 5: Cross-Vertical Architecture Validation (3-4 hours)

- [ ] Verify `packages/core` has zero vertical-specific imports
- [ ] Verify `packages/ui` components accept configurable props (not hardcoded labels)
- [ ] Create a minimal test harness that imports core modules in a non-med-spa context
- [ ] Document what's configurable vs what's shared across verticals
- [ ] Commit: `git commit -m "test: cross-vertical architecture validation"`

---

## Phase 2B: Build the Connect API

### Step 6: Extract Real Endpoints from Phase 0 Research (4-6 hours)

Look at your Phase 0 research. Pick the **top 2-3 integration pain points** that appeared most often.

From Phase 0 research, med spa pain points identified:
- "SMS reminders reduce no-shows but we send them manually" → SMS reminder API
- "Package deduction is manual — we lose $500-2K/month" → Package deduction API
- "No visibility into revenue per provider" → Treatment metrics API

All three are Connect API candidates.

**Decision: Which endpoints to build?**

Rank by:
1. **How many Phase 0 research interviews mentioned this?** (2+ = strong signal)
2. **How hard is it to build?** (< 4 hours = good first endpoint)
3. **Is it a common integration?** (QuickBooks, Stripe, Postmark = yes; custom niche tool = no)

**Your endpoint menu for Phase 2:**
- ✅ `POST /v1/communications/sms-reminder` (built on Twilio from Phase 1, highest ROI)
- ✅ `POST /v1/billing/package-deduct` (built on payments module from Phase 1, clear ROI)
- ✅ `POST /v1/reporting/treatment-metrics` (built on dashboard queries from Phase 1, owner-facing)

**Or if you don't have strong signals:**
- Start with just invoicing and email
- Wait for real demand in Phase 5

### Step 7: Scaffold the Connect API Monorepo App (Week 16, 3-4 hours)

Create a separate service so Connect can scale independently.

- [ ] Create `apps/connect-api` (separate from the portal):

```bash
mkdir apps/connect-api
cd apps/connect-api
npm init -y
npm install --save express dotenv axios
npm install --save-dev typescript @types/express
mkdir src
```

- [ ] Create `apps/connect-api/src/index.ts`:

```typescript
import express from 'express';

const app = express();
app.use(express.json());

// Middleware: API key validation (placeholder)
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || typeof apiKey !== 'string') {
    return res.status(401).json({ error: 'Missing API key' });
  }
  // TODO: verify against database in Phase 2
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Connect API running on port ${PORT}`);
});

export default app;
```

- [ ] Create `apps/connect-api/package.json` with build scripts:

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

- [ ] Test locally: `npm run dev` and `curl http://localhost:3001/health`
- [ ] Commit: `git commit -m "feat: scaffold Connect API service"`

### Step 8: Build Endpoint #1: SMS Reminder (Weeks 17-18, 6-8 hours)

This is the most critical endpoint — SMS reminders directly reduce no-shows, which Phase 0 research identified as the top revenue leak for med spas.

**Design:**

```
POST /v1/communications/sms-reminder
Headers: X-API-Key: <api-key>
Body:
{
  "appointment_id": "uuid",
  "patient_phone": "+1234567890",
  "patient_name": "Jane Doe",
  "appointment_time": "2024-03-15T14:00:00Z",
  "clinic_name": "Glow Aesthetics",
  "template": "pre-appointment"
}
Response:
{
  "message_id": "SM123abc",
  "status": "sent",
  "sent_at": "2024-03-13T14:00:00Z"
}
```

- [ ] Create `apps/connect-api/src/endpoints/communications.ts`:

```typescript
import express from 'express';
import twilio from 'twilio';

const router = express.Router();
const client = twilio(process.env.TWILIO_SID || '', process.env.TWILIO_AUTH_TOKEN || '');

const TEMPLATES: Record<string, (data: any) => string> = {
  'pre-appointment': (d) =>
    `Hi ${d.patient_name}, reminder: your appointment at ${d.clinic_name} is on ${new Date(d.appointment_time).toLocaleString()}. Reply C to confirm or R to reschedule.`,
  'intake-reminder': (d) =>
    `Hi ${d.patient_name}, please complete your intake form before your appointment at ${d.clinic_name}: ${d.intake_url}`,
};

router.post('/sms-reminder', async (req, res) => {
  const { appointment_id, patient_phone, patient_name, appointment_time, clinic_name, template = 'pre-appointment' } = req.body;

  try {
    const messageBody = TEMPLATES[template]({ patient_name, appointment_time, clinic_name });

    const message = await client.messages.create({
      body: messageBody,
      from: process.env.TWILIO_PHONE_NUMBER || '',
      to: patient_phone,
    });

    res.json({
      message_id: message.sid,
      status: message.status,
      sent_at: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
```

- [ ] Add to main app (`src/index.ts`):

```typescript
import communicationsRouter from './endpoints/communications';

app.use('/v1/communications', communicationsRouter);
```

- [ ] Write tests: `apps/connect-api/src/endpoints/__tests__/communications.test.ts`
- [ ] Document: Create `docs/endpoints/communications.md`

```markdown
# POST /v1/communications/sms-reminder

Send an SMS appointment reminder to a patient via Twilio.

## Request

```json
{
  "appointment_id": "string (uuid)",
  "patient_phone": "string (E.164 format)",
  "patient_name": "string",
  "appointment_time": "string (ISO 8601)",
  "clinic_name": "string",
  "template": "string (optional: 'pre-appointment' | 'intake-reminder')"
}
```

## Response

```json
{
  "message_id": "string (Twilio SID)",
  "status": "string",
  "sent_at": "string (ISO 8601)"
}
```

## Example

```bash
curl -X POST http://localhost:3001/v1/communications/sms-reminder \
  -H "X-API-Key: sk_test_..." \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "abc-123",
    "patient_phone": "+1234567890",
    "patient_name": "Jane Doe",
    "appointment_time": "2024-03-15T14:00:00Z",
    "clinic_name": "Glow Aesthetics",
    "template": "pre-appointment"
  }'
```
```

- [ ] Commit: `git commit -m "feat: add /v1/communications/sms-reminder endpoint"`

### Step 9: Build Endpoint #2: Package Deduct (Weeks 18-19, 4-5 hours)

Automated treatment package deduction — eliminates manual session tracking and prevents revenue leakage from unclaimed sessions.

```
POST /v1/billing/package-deduct
Headers: X-API-Key: <api-key>
Body:
{
  "patient_id": "uuid",
  "appointment_id": "uuid",
  "treatment_type": "Botox",
  "package_id": "uuid"
}
Response:
{
  "package_id": "uuid",
  "remaining_sessions": 2,
  "deducted_at": "2024-03-15T15:00:00Z"
}
```

- [ ] Create `apps/connect-api/src/endpoints/billing.ts`:

```typescript
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

router.post('/package-deduct', async (req, res) => {
  const { patient_id, appointment_id, package_id } = req.body;

  try {
    // Fetch current package balance
    const { data: pkg, error: fetchError } = await supabase
      .from('patient_packages')
      .select('remaining_sessions, total_sessions')
      .eq('id', package_id)
      .eq('patient_id', patient_id)
      .single();

    if (fetchError || !pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    if (pkg.remaining_sessions <= 0) {
      return res.status(400).json({ error: 'No sessions remaining in package' });
    }

    // Deduct one session
    const newRemaining = pkg.remaining_sessions - 1;
    await supabase
      .from('patient_packages')
      .update({ remaining_sessions: newRemaining, updated_at: new Date().toISOString() })
      .eq('id', package_id);

    // Log the deduction
    await supabase.from('package_transactions').insert({
      package_id,
      appointment_id,
      patient_id,
      action: 'deduct',
      previous_balance: pkg.remaining_sessions,
      new_balance: newRemaining,
      created_at: new Date().toISOString(),
    });

    res.json({
      package_id,
      remaining_sessions: newRemaining,
      deducted_at: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
```

- [ ] Add to main app (`src/index.ts`):

```typescript
import billingRouter from './endpoints/billing';

app.use('/v1/billing', billingRouter);
```

- [ ] Write tests: `apps/connect-api/src/endpoints/__tests__/billing.test.ts`
- [ ] Document: Create `docs/endpoints/billing.md`
- [ ] Commit: `git commit -m "feat: add /v1/billing/package-deduct endpoint"`

### Step 9b: Build Endpoint #3: Treatment Metrics (3-4 hours)

Revenue reporting by provider, treatment type, and period.

- [ ] Create `apps/connect-api/src/endpoints/reporting.ts`
- [ ] Query: revenue by provider, by treatment type, by date range
- [ ] Returns JSON suitable for dashboard charts
- [ ] Document endpoint
- [ ] Commit: `git commit -m "feat: add /v1/reporting/treatment-metrics endpoint"`

### Step 10: Connect API Deployment (Week 19, 2-3 hours)

Deploy Connect as a second Railway service.

- [ ] Railway auto-detects the Node/Express app via Nixpacks. Optionally create a `nixpacks.toml`:

```toml
# nixpacks.toml (optional — Railway auto-detects Node)
[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

- [ ] Deploy: Run `railway up` from `apps/connect-api` (or link the repo to a new Railway service)
- [ ] Test: `curl https://connect-api-xxxx.up.railway.app/health`
- [ ] Document the URL: `NEXT_PUBLIC_CONNECT_API_URL=https://connect-api-xxxx.up.railway.app`
- [ ] Commit: `git commit -m "chore: deploy Connect API to Railway"`

### Step 11: Integrate Connect into the Portal (Week 20, 3-4 hours)

The portal should call Connect endpoints instead of doing work directly.

- [ ] Update `apps/portal-medspa/.env.local`:

```
NEXT_PUBLIC_CONNECT_API_URL=http://localhost:3001  # dev
CONNECT_API_KEY=sk_...
```

- [ ] Update SMS reminder creation in portal to call Connect:

Old (in-app Twilio):
```typescript
// apps/portal-medspa/src/app/api/communications/sms-reminder/route.ts
const message = await twilioClient.messages.create(...);
```

New (via Connect):
```typescript
// apps/portal-medspa/src/app/api/communications/sms-reminder/route.ts
const response = await fetch(`${process.env.NEXT_PUBLIC_CONNECT_API_URL}/v1/communications/sms-reminder`, {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.CONNECT_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    appointment_id: req.body.appointmentId,
    patient_phone: req.body.patientPhone,
    patient_name: req.body.patientName,
    appointment_time: req.body.appointmentTime,
    clinic_name: req.body.clinicName,
  }),
});
const result = await response.json();
return res.json(result);
```

- [ ] Update package deduction and treatment metrics to call Connect
- [ ] Test end-to-end: Send reminder from portal → portal calls Connect → Connect calls Twilio
- [ ] Commit: `git commit -m "feat: portal calls Connect API instead of direct Twilio"`

---

## Phase 2C: Integration Hardening + Documentation

### Step 12: API Hardening (4-5 hours)

Harden Connect API for production reliability before Phase 5 customer launch.

- [ ] Add rate limiting to all Connect endpoints
- [ ] Add comprehensive error handling (transient vs permanent errors)
- [ ] Add retry logic for external service failures (Twilio, Stripe, Postmark)
- [ ] Add webhook idempotency (prevent duplicate processing)
- [ ] Load test all endpoints (verify they handle expected Phase 5 traffic)
- [ ] Add API key authentication + management UI
- [ ] Commit: `git commit -m "feat: harden Connect API for production"`

### Step 13: Documentation + Pricing Prep (4-5 hours)

**API Documentation:**
- [ ] Write complete OpenAPI/Swagger specs for all endpoints
- [ ] Create integration guides for developers (JavaScript + Python examples)
- [ ] Document authentication flow (API keys, token refresh)
- [ ] Create deployment guide for self-hosting Connect API

**Pricing Structure Prep (launch in Phase 5 — do NOT activate):**
- [ ] Configure Stripe subscription products for tiers (Free, Starter $49, Pro $99, Enterprise)
- [ ] Build metering infrastructure (track API call counts per account)
- [ ] Create pricing page UI (do not publish publicly until Phase 5)
- [ ] Commit: `git commit -m "feat: pricing structure prep + API documentation"`

### Step 14: Cross-Vertical Validation (4-6 hours)

Prove the module library works for a non-med-spa domain.

- [ ] Create a minimal test app for a different vertical (e.g., home services, fitness)
- [ ] Use `@baseplate/core` + `@baseplate/ui` + Connect APIs
- [ ] Verify auth, RBAC, scheduling, payments work without med spa-specific code
- [ ] Document what changes between verticals (config, not code)
- [ ] Commit: `git commit -m "feat: cross-vertical validation test app"`

### Step 15: Gate Check (2-3 hours)

**Phase 2 → Phase 3 gate threshold (build-focused):**
- ✅ All modules generalized (work for ANY vertical)
- ✅ 3 Connect endpoints live, documented, load-tested
- ✅ Cross-vertical validation passed
- ✅ API documentation complete (OpenAPI specs, guides)
- ✅ Pricing structure designed (not activated)

| Metric | Target | Actual |
|---|---|---|
| Connect endpoints built | 3 | ___ |
| Endpoints documented (OpenAPI) | 3 | ___ |
| Load test passed | Yes | ___ |
| Modules generalized | All | ___ |
| Cross-vertical test passed | Yes | ___ |
| API docs complete | Yes | ___ |

- [ ] If **gate passed:** Proceed to Phase 3 (Intelligence & Ecosystem Build)
- [ ] If **gate missed:** Continue building until all criteria met. No customer contact during build phases.

---

## Summary: Phase 2 Artifacts You'll Have

By end of Phase 2:

- ✅ Generalized module library (works for ANY vertical)
- ✅ Connect API service (separate from portal, independently deployable)
- ✅ 3 production-ready endpoints (sms-reminder, package-deduct, treatment-metrics)
- ✅ Complete API documentation (OpenAPI specs, integration guides)
- ✅ Cross-vertical validation (modules proven for 2+ domains)
- ✅ Pricing structure designed (Stripe products created, not activated)
- ✅ Load-tested, hardened API endpoints
- ✅ Clear blockers/feedback notes for Phase 3 intelligence layer

**Critical:** This is a pure build phase. No customer contact, no revenue, no pilot conversion. All monetization happens in Phase 5.
