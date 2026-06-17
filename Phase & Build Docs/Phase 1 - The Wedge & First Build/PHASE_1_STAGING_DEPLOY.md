# Phase 1 Completion Guide — Staging Deploy & Smoke Test

> **Purpose:** Everything a human must do to complete Phase 1 (staging deployment + smoke test).
> All code is built and tested (149 tests passing, 8 migrations). What remains is
> account setup, staging deployment, and verification.
>
> **Customer onboarding (pilots) is deferred to Phase 5.** See `PHASE_5_ONBOARDING_GUIDE.md`.
>
> **After completing this guide:** Update [`MASTER_PROGRESS.md`](MASTER_PROGRESS.md) —
> check off items in "What's Left" section and add commits to the Build Log.

---

## Table of Contents

- [Part 1: Phase 0 Summary (Pilot Leads)](#part-1-phase-0-summary-pilot-leads)
- [Part 2: Account Setup (5 Services)](#part-2-account-setup-5-services)
  - [A. Supabase (Database + Auth)](#a-supabase-database--auth)
  - [B. Stripe (Payments)](#b-stripe-payments)
  - [C. Postmark (Email)](#c-postmark-email)
  - [D. Twilio (SMS)](#d-twilio-sms)
- [Part 3: Local Development Verification](#part-3-local-development-verification)
- [Part 4: Staging Deployment (Vercel)](#part-4-staging-deployment-vercel)
- [Part 5: Post-Deploy Smoke Test](#part-5-post-deploy-smoke-test)
- [Parts 6-9: Moved to Phase 5](#parts-6-9-moved-to-phase-5)
- [Appendix: Environment Variable Reference](#appendix-environment-variable-reference)
- [Appendix: Fallback SQL (Staff Table)](#appendix-fallback-sql-staff-table)

---

## Part 1: Phase 0 Summary (Pilot Leads)

Pilot leads identified in Phase 0. See `PHASE_5_ONBOARDING_GUIDE.md`.

---

## Part 2: Account Setup (5 Services)

You need accounts on 4 external services before you can deploy. Estimated time: 1-2 hours.

### A. Supabase (Database + Auth)

#### Step 1: Create the Project

1. Go to **https://supabase.com** → sign in or create an account
2. Click **New Project**
3. Fill in:
   - **Name:** `medspa-portal-prod`
   - **Database Password:** generate a strong password, store it securely
   - **Region:** `US East (N. Virginia)` — matches the Vercel app region (`iad1`)
   - **Pricing Plan:** Free tier for development; upgrade to Pro before pilot launch
4. Wait ~2 minutes for provisioning

#### Step 2: Run Database Migrations (8 files, in order)

1. Go to **Supabase Dashboard → SQL Editor**
2. For each file below, copy the SQL content, paste into the editor, and click **Run**

> **IMPORTANT:** Run them in exact numeric order. Each depends on tables from prior migrations.

| Order | File | What It Creates |
|-------|------|-----------------|
| 1 | `0001_init_clinics.sql` | Tables: `clinics`, `staff`, `patients`, `audit_logs` + indexes |
| 2 | `0002_rls_policies.sql` | Row Level Security on all 4 tables + access policies |
| 3 | `0003_intake_forms.sql` | Tables: `intake_forms`, `intake_submissions` + RLS |
| 4 | `0004_scheduling.sql` | Tables: `providers`, `rooms`, `appointments` (with double-booking prevention) + RLS |
| 5 | `0005_payments.sql` | Payment columns on `appointments` (`amount`, `payment_status`, etc.) |
| 6 | `0006_rename_treatment_to_service.sql` | Renames `treatment_type` → `service_type` |
| 7 | `0007_tighten_rls_policies.sql` | Removes overly permissive anonymous-access policies |
| 8 | `0008_staff_insert_policy.sql` | Adds INSERT policy on `staff` so signup creates the owner record |

Migration files are at:
```
Med Spa App/supabase/migrations/
```

#### Step 3: Get the API Keys

1. Go to **Supabase Dashboard → Project Settings (gear icon) → API**
2. Copy these 3 values (you'll need them for `.env.local`):

| Value | Env Var(s) |
|-------|------------|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_URL` |
| **anon public** key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_ANON_KEY` |
| **service_role** secret key | `SUPABASE_SERVICE_ROLE_KEY` |

> **Security:** The service-role key bypasses RLS entirely. Never expose it to the browser.
> It is used server-side only by API routes and the Stripe webhook.

#### Step 4: Configure Auth Settings

1. Go to **Supabase Dashboard → Authentication → Providers**
2. Ensure **Email** provider is enabled (default)
3. Go to **Authentication → URL Configuration**
4. Set **Site URL** to: `http://localhost:3000` (for now — update to production URL after deploy)
5. Add **Redirect URLs:**
   - `http://localhost:3000/**`
   - `https://your-production-domain.vercel.app/**` (add after Vercel deploy)

> **CRITICAL — Email Confirmation:**
>
> Supabase enables email confirmation by default. If left ON, the `signUp()` function creates
> the auth user but does NOT establish a session, which causes the clinic + staff inserts to
> fail (RLS requires `auth.uid()`).
>
> **Recommendation for pilot:** Disable email confirmation during onboarding.
>
> Go to **Authentication → Settings → "Confirm email" → OFF**.
>
> You can re-enable it later once a server-side signup function is built (Phase 2).

- [ ] Supabase project created
- [ ] All 8 migrations run successfully
- [ ] API keys copied (URL, anon key, service-role key)
- [ ] Auth settings configured (Site URL, Redirect URLs, email confirmation OFF)

---

### B. Stripe (Payments)

#### Step 1: Create Account and Get API Keys

1. Go to **https://dashboard.stripe.com** → sign up or sign in
2. For testing, ensure you're in **Test Mode** (toggle in top right)
3. Go to **Developers → API Keys**
4. Copy the **Secret key** (starts with `sk_test_` or `sk_live_`) → `STRIPE_SECRET_KEY`

#### Step 2: Configure the Webhook Endpoint

> **Note:** The webhook endpoint URL won't work until you deploy to Vercel (Part 4).
> You can skip this step now and come back after deployment. But set up the local
> testing webhook below.

**For production (after Vercel deploy):**

1. Go to **Developers → Webhooks → Add endpoint**
2. Set **Endpoint URL** to: `https://YOUR-DOMAIN.vercel.app/api/webhooks/stripe`
3. Select these events (the code handles these specifically):
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Click **Add endpoint**
5. On the endpoint page, click **Reveal** under **Signing secret** → copy (starts with `whsec_`)
   → `STRIPE_WEBHOOK_SECRET`

**For local development (Stripe CLI):**

1. Install the Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. It prints a `whsec_...` signing secret → use as `STRIPE_WEBHOOK_SECRET` in `.env.local`
4. In a separate terminal: `stripe trigger checkout.session.completed` to test

- [ ] Stripe account created
- [ ] Secret key copied (`STRIPE_SECRET_KEY`)
- [ ] Local webhook secret set up via Stripe CLI (for dev)
- [ ] Production webhook endpoint configured (after deploy)

---

### C. Postmark (Email)

#### Step 1: Create Account and Server

1. Go to **https://postmarkapp.com** → sign up or sign in
2. Create a **Server** (e.g. "Med Spa Portal")
3. Copy the **Server API token** → `POSTMARK_API_TOKEN`

#### Step 2: Verify Sender Identity

Postmark requires you to prove you own the sending domain or email address.

**Option A — Sender Signature (faster, single email):**
1. Go to **Sender Signatures → Add Signature**
2. Enter your from email (e.g. `noreply@yourdomain.com`)
3. Check inbox for verification email → click confirmation link
4. Use that email as `POSTMARK_FROM_EMAIL`

**Option B — Domain Authentication (recommended for production):**
1. Go to **Domains → Add Domain**
2. Enter your sending domain (e.g. `yourdomain.com`)
3. Add the provided DNS records (DKIM + Return-Path) to your DNS provider
4. Wait for verification (minutes to hours)
5. Any address `@yourdomain.com` can be used as `POSTMARK_FROM_EMAIL`

- [ ] Postmark account created
- [ ] API token copied (`POSTMARK_API_TOKEN`)
- [ ] Sender identity verified (`POSTMARK_FROM_EMAIL`)

---

### D. Twilio (SMS)

#### Step 1: Create Account

1. Go to **https://www.twilio.com** → sign up or sign in
2. Complete the setup wizard (verify your own phone number)

#### Step 2: Get Credentials

1. Go to **Twilio Console** (https://console.twilio.com)
2. On the dashboard, copy:
   - **Account SID** (starts with `AC...`) → `TWILIO_ACCOUNT_SID`
   - **Auth Token** (click "Show" to reveal) → `TWILIO_AUTH_TOKEN`

#### Step 3: Get a Phone Number

1. Go to **Phone Numbers → Manage → Buy a number**
2. Search for a number with **SMS capability** in your area code
3. Purchase (trial accounts get a free number)
4. Copy the E.164-formatted number (e.g. `+15125551234`) → `TWILIO_PHONE_NUMBER`

> **Trial Account Limitations:**
> - Can only send SMS to **verified numbers** (you must add each pilot's phone to Verified Caller IDs)
> - Messages are prefixed with a trial notice
> - Upgrade to a paid account before pilot launch to remove these restrictions

- [ ] Twilio account created
- [ ] Account SID + Auth Token copied
- [ ] SMS-capable phone number purchased/copied

---

## Part 3: Local Development Verification

Before deploying to production, verify the app works locally.

### Step 1: Set Up Environment

```bash
cd "Med Spa App"
pnpm install
```

### Step 2: Create `.env.local`

Copy `apps/portal-medspa/.env.local.example` to `apps/portal-medspa/.env.local`
and fill in all values from the services you set up in Part 2.

> **No `NEXT_PUBLIC_CLINIC_ID` needed** — clinicId is now extracted from the user's session automatically.

```bash
# ─── App ───
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Supabase ───
NEXT_PUBLIC_SUPABASE_URL=https://XXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_URL=https://XXXXX.supabase.co
SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...

# ─── Stripe ───
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...                 # From Stripe CLI

# ─── Postmark ───
POSTMARK_API_TOKEN=...
POSTMARK_FROM_EMAIL=noreply@yourdomain.com

# ─── Twilio ───
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+15125551234
```

### Step 3: Start Dev Server

```bash
pnpm dev
```

Verify the app loads at **http://localhost:3000**.

### Step 4: Create the First Clinic (Admin User)

1. Navigate to **http://localhost:3000/auth/signup**
2. Fill in:
   - **Clinic Name:** e.g. "Glow Aesthetics"
   - **Clinic Location:** e.g. "Austin, TX"
   - **Email:** your email
   - **Password:** min 8 characters
3. Click **Sign Up**
4. You should be redirected to `/dashboard`

> **If signup fails:** Check the [Fallback SQL](#appendix-fallback-sql-staff-table) section.
> The most common cause is email confirmation being enabled (see Part 2A Step 4).

### Step 5: Verify RBAC Works

1. Navigate to **http://localhost:3000/dashboard/audit-logs**
2. The page should load (not redirect you away) — this confirms the `staff` record was created
3. If it redirects you back to `/dashboard`, see the [Fallback SQL](#appendix-fallback-sql-staff-table)

### Step 6: Test the Happy Path Locally

- [ ] Login works (auth)
- [ ] Dashboard loads with clinic data
- [ ] Can create a provider and a room
- [ ] Can create a patient
- [ ] Can create an appointment (scheduling)
- [ ] Can generate a payment link (Stripe)
- [ ] Audit logs page accessible (RBAC)

- [ ] `.env.local` created with all values
- [ ] Dev server runs
- [ ] First clinic + admin user created via signup
- [ ] Dashboard loads correctly (clinicId auto-extracted from session)
- [ ] Audit logs page accessible
- [ ] Happy path tested

---

## Part 4: Staging Deployment (Vercel)

### Step 1: Push to GitHub

```bash
git add -A
git commit -m "Phase 1 ready for staging deploy"
git push origin main
```

### Step 2: Import into Vercel

1. Go to **https://vercel.com** → sign in
2. Click **Add New → Project**
3. Import your Git repository
4. **CRITICAL — Root Directory:** Under **Root Directory**, click **Edit** and set it to:
   ```
   Med Spa App/apps/portal-medspa
   ```
5. The `vercel.json` in that directory handles the build config automatically

### Step 3: Add Environment Variables in Vercel

1. In the Vercel project **Settings → Environment Variables**
2. Add every variable from your `.env.local`, with this change:

| Variable | Staging Value |
|----------|-----------------|
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` |
| All others | Same as `.env.local` |

3. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (Vercel won't expose it to the browser since
   the name doesn't start with `NEXT_PUBLIC_`)

### Step 4: Deploy

1. Click **Deploy**
2. Wait for the build to complete (runs `pnpm install` then `next build`)
3. App will be live at `https://<project-name>.vercel.app`

### Step 5: Post-Deploy Configuration

**Update Stripe webhook to production:**
1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Update endpoint URL to: `https://YOUR-DOMAIN.vercel.app/api/webhooks/stripe`
3. Copy the new signing secret → update `STRIPE_WEBHOOK_SECRET` in Vercel
4. Redeploy (or it will pick up on next push)

**Update Supabase Auth URLs:**
1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL** to your production Vercel domain
3. Ensure **Redirect URLs** includes `https://YOUR-DOMAIN.vercel.app/**`

> **Note:** Switching to production Stripe keys happens in Phase 5. For Phase 1 staging, use Stripe test keys only.

- [ ] Code pushed to GitHub
- [ ] Project imported into Vercel (root directory set correctly)
- [ ] All env vars added in Vercel
- [ ] First deployment successful
- [ ] Stripe webhook URL updated to staging
- [ ] Supabase auth URLs updated to staging

---

## Part 5: Post-Deploy Smoke Test

Run this end-to-end test on the staging deployment before onboarding any pilots.

### The Happy Path

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Go to production URL | Landing/login page loads |
| 2 | Log in with admin credentials | Redirected to `/dashboard` |
| 3 | View dashboard overview | Shows clinic data, no errors |
| 4 | Go to Providers, add one | Provider appears in list |
| 5 | Go to Rooms, add one | Room appears in list |
| 6 | Go to Patients, add one | Patient appears in list |
| 7 | Create an appointment | Appointment saved, shows in calendar/list |
| 8 | Generate a payment link for the appointment | Stripe checkout URL generated |
| 9 | Open the payment link, complete a test payment | Stripe checkout succeeds |
| 10 | Check appointments | Payment status updated (via webhook) |
| 11 | Check that a Postmark email was sent | Confirmation email received |
| 12 | Check that a Twilio SMS was sent | SMS received (if number verified on trial) |
| 13 | Go to Audit Logs page | Page loads, shows recent actions |
| 14 | Log out | Redirected to login page |

### Test the Patient-Facing Flow

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open the booking page (patient-facing) | Provider list loads from API |
| 2 | Select a provider and time slot | Available slots load |
| 3 | Confirm a booking | Appointment created |
| 4 | Open the intake form link | Form renders dynamically |
| 5 | Fill and submit the intake form | Submission saved, confirmation shown |

- [ ] All 14 happy-path steps pass
- [ ] Patient booking flow works
- [ ] Patient intake flow works
- [ ] Stripe payment processes and webhook updates status
- [ ] Email notification sends
- [ ] SMS notification sends

---

## Appendix: Environment Variable Reference

### Full Variable List

| Variable | Required | Browser? | Source |
|----------|----------|----------|--------|
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | Your deployment URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Supabase Dashboard → Settings → API → anon public |
| `SUPABASE_URL` | Recommended | No | Same as `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | Recommended | No | Same as `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Never** | Supabase Dashboard → Settings → API → service_role |
| `STRIPE_SECRET_KEY` | Yes | No | Stripe Dashboard → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Yes | No | Stripe Dashboard → Developers → Webhooks → Signing secret |
| `POSTMARK_API_TOKEN` | Yes | No | Postmark Dashboard → Server → API Tokens |
| `POSTMARK_FROM_EMAIL` | Yes | No | Your verified email/domain in Postmark |
| `TWILIO_ACCOUNT_SID` | Yes | No | Twilio Console → Dashboard |
| `TWILIO_AUTH_TOKEN` | Yes | No | Twilio Console → Dashboard |
| `TWILIO_PHONE_NUMBER` | Yes | No | Twilio Console → Phone Numbers (E.164 format) |

### Optional Variables

| Variable | Default if unset |
|----------|-----------------|
| `STRIPE_SUCCESS_URL` | `${NEXT_PUBLIC_APP_URL}/payments/success` |
| `STRIPE_CANCEL_URL` | `${NEXT_PUBLIC_APP_URL}/payments/cancelled` |

---

## Appendix: Fallback SQL (Staff Table)

The `signUp()` function now creates a `staff` record automatically (migration 0008 + code fix).
If signup fails or you're troubleshooting, you can manually create the staff record:

### Step 1: Find the Auth User ID and Clinic ID

```sql
SELECT u.id AS auth_user_id, u.email, c.id AS clinic_id, c.name AS clinic_name
FROM auth.users u
JOIN clinics c ON c.owner_id = u.id
WHERE u.email = 'owner@example.com';
```

### Step 2: Insert the Owner Staff Record

```sql
INSERT INTO staff (id, clinic_id, email, name, role)
VALUES (
  '<AUTH_USER_ID>',      -- from Step 1 (the auth.users.id)
  '<CLINIC_ID>',         -- from Step 1 (the clinics.id)
  'owner@example.com',   -- must match auth email
  'Clinic Owner',        -- display name
  'owner'                -- exact string; middleware checks role === 'owner'
);
```

> **CRITICAL:** The `id` column MUST be set to the auth user's UUID.
> Do NOT let it default to `gen_random_uuid()` — the middleware queries
> `staff.id = session.user.id`, so a random UUID will never match.

### Step 3: Verify

```sql
SELECT * FROM staff WHERE email = 'owner@example.com';
```

Confirm `id` matches the auth user's UUID and `role` is `'owner'`.

### Adding Staff Members (Non-Owner)

To add a staff member for a clinic:

```sql
INSERT INTO staff (clinic_id, email, name, role)
VALUES (
  '<CLINIC_ID>',
  'staff@example.com',
  'Staff Name',
  'staff'
);
```

> Note: Non-owner staff records use `gen_random_uuid()` for `id` — this is fine because
> they authenticate via email matching (`staff.email = auth.email()` in RLS policies),
> not by ID. The `id = auth.uid()` pattern is only needed for the owner who accesses
> role-gated pages.
