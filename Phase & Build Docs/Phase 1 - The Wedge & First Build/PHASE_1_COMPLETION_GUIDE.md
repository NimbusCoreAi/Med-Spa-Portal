# Phase 1 Completion Guide — Staging Deploy & Smoke Test

> **Purpose:** This is the ONLY remaining work to complete Phase 1. All code is done —
> 203 tests pass, 10 packages typecheck, 24 routes build. What remains is setting up
> external service accounts, deploying to staging, and running the smoke test.
>
> **Estimated time:** 3-4 hours (mostly account setup + waiting for provisioning)
> **Cost:** $0 (all free tiers)
>
> **Prerequisites:** Git repo with latest code (base commit `1be8f44`)
>
> **After completing this guide:** Phase 1 is 100% complete. Update `MASTER_PROGRESS.md`
> and proceed to Phase 2.

---

## Quick Reference: What's Done vs What's Left

### ✅ Done (All Code)
- 10 packages with 203 tests, 0 failures
- 24 routes (15 pages + 9 API routes)
- 8 SQL migrations (schema, RLS, scheduling, payments, intake, staff)
- RBAC full enforcement (IDOR protection, role-based sidebar, auth gates)
- HIPAA compliance documentation (`Med Spa App/docs/HIPAA_COMPLIANCE.md`)
- 16 core modules, 6 UI components, 6 patterns, 3 integrations
- Session-based auth (@supabase/ssr, clinicId from session, no env var needed)
- Server-side reporting aggregation
- Stripe payment success/cancel pages
- CI/CD pipeline

### ⬜ Remaining (Manual Steps Only)
1. Create 4 external service accounts (Supabase, Stripe, Postmark, Twilio)
2. Run 8 database migrations on Supabase
3. Set 13 environment variables
4. Deploy to Vercel
5. Run the 19-step smoke test
6. Update MASTER_PROGRESS.md

---

## Part 1: Service Account Setup

You need accounts on 4 services. Create them in this order (Supabase first since you need
its keys for local testing). All have free tiers.

### A. Supabase (Database + Auth) — ~10 min

1. Go to **https://supabase.com** → sign in or create account
2. Click **New Project**
3. Fill in:
   - **Name:** `medspa-portal-staging`
   - **Database Password:** Generate a strong password → **store it securely**
   - **Region:** `US East (N. Virginia)` — must match Vercel region (`iad1`)
   - **Pricing Plan:** Free tier
4. Wait ~2 minutes for provisioning

#### Run Database Migrations (8 files, in order)

1. Go to **Supabase Dashboard → SQL Editor**
2. For each file below, open the file, copy all SQL, paste into the editor, click **Run**

> **CRITICAL:** Run them in exact numeric order. Each depends on tables from prior migrations.

| # | File Path | What It Creates |
|---|-----------|-----------------|
| 1 | `Med Spa App/supabase/migrations/0001_init_clinics.sql` | Tables: `clinics`, `staff`, `patients`, `audit_logs` + indexes |
| 2 | `Med Spa App/supabase/migrations/0002_rls_policies.sql` | Row Level Security on all 4 tables + access policies |
| 3 | `Med Spa App/supabase/migrations/0003_intake_forms.sql` | Tables: `intake_forms`, `intake_submissions` + RLS |
| 4 | `Med Spa App/supabase/migrations/0004_scheduling.sql` | Tables: `providers`, `rooms`, `appointments` + GIST double-booking constraint + RLS |
| 5 | `Med Spa App/supabase/migrations/0005_payments.sql` | Payment columns on `appointments` |
| 6 | `Med Spa App/supabase/migrations/0006_rename_treatment_to_service.sql` | `treatment_type` → `service_type` |
| 7 | `Med Spa App/supabase/migrations/0007_tighten_rls_policies.sql` | Removes overly permissive anonymous-access policies |
| 8 | `Med Spa App/supabase/migrations/0008_staff_insert_policy.sql` | Adds INSERT policy on `staff` (so signup can create owner record) |

#### Get API Keys

1. Go to **Supabase Dashboard → Project Settings (gear) → API**
2. Copy these 3 values:

| Value | Env Var(s) |
|-------|------------|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_URL` |
| **anon public** key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_ANON_KEY` |
| **service_role** key | `SUPABASE_SERVICE_ROLE_KEY` |

> **Security:** The service-role key bypasses RLS. Never put it in client-side code.
> It's used only server-side by API routes and the Stripe webhook.

#### Configure Auth

1. Go to **Authentication → Providers** → ensure **Email** is enabled (default)
2. Go to **Authentication → URL Configuration**
3. Set **Site URL** to: `http://localhost:3000` (update to Vercel URL after deploy)
4. Add **Redirect URLs:**
   - `http://localhost:3000/**`
   - `https://YOUR-VERCEL-DOMAIN.vercel.app/**` (add after Vercel deploy)

> **CRITICAL — Email Confirmation:**
>
> Supabase enables email confirmation by default. If left ON, `signUp()` creates the auth
> user but does NOT establish a session, causing clinic + staff inserts to fail.
>
> **Disable it:** Authentication → Settings → "Confirm email" → **OFF**
>
> You can re-enable in Phase 2 when you build a server-side signup function.

**Checklist:**
- [ ] Supabase project created
- [ ] All 8 migrations run successfully (verify: no errors in SQL Editor)
- [ ] API keys copied (URL, anon key, service-role key)
- [ ] Auth settings: email confirmation OFF, Site URL set, Redirect URLs added

---

### B. Stripe (Payments) — ~5 min

1. Go to **https://dashboard.stripe.com** → sign up or sign in
2. Ensure you're in **Test Mode** (toggle top right)
3. Go to **Developers → API Keys**
4. Copy the **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY`

#### Local Webhook Testing (Stripe CLI)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run in a terminal:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. It prints a `whsec_...` signing secret → `STRIPE_WEBHOOK_SECRET` (for local dev)
4. To test: `stripe trigger checkout.session.completed` in another terminal

> The production webhook endpoint will be configured after Vercel deploy (Part 3).

**Checklist:**
- [ ] Stripe account created
- [ ] Secret key copied (`STRIPE_SECRET_KEY`)
- [ ] Local webhook secret set up via Stripe CLI

---

### C. Postmark (Email) — ~10 min

1. Go to **https://postmarkapp.com** → sign up
2. Create a **Server** (e.g., "Med Spa Portal")
3. Copy the **Server API token** → `POSTMARK_API_TOKEN`

#### Verify Sender Identity

**Option A — Sender Signature (faster, single email):**
1. Go to **Sender Signatures → Add Signature**
2. Enter your from email (e.g., `noreply@yourdomain.com`)
3. Check inbox → click confirmation link
4. Use that email as `POSTMARK_FROM_EMAIL`

**Option B — Domain Authentication (for production):**
1. Go to **Domains → Add Domain**
2. Add provided DNS records (DKIM + Return-Path)
3. Wait for verification (minutes to hours)

**Checklist:**
- [ ] Postmark account created
- [ ] API token copied (`POSTMARK_API_TOKEN`)
- [ ] Sender identity verified (`POSTMARK_FROM_EMAIL`)

---

### D. Twilio (SMS) — ~10 min

1. Go to **https://www.twilio.com** → sign up
2. Complete the setup wizard (verify your phone number)

#### Get Credentials

1. Go to **Twilio Console** (https://console.twilio.com)
2. Copy:
   - **Account SID** (`AC...`) → `TWILIO_ACCOUNT_SID`
   - **Auth Token** (click "Show") → `TWILIO_AUTH_TOKEN`

#### Get a Phone Number

1. Go to **Phone Numbers → Manage → Buy a number**
2. Search for a number with **SMS capability**
3. Purchase (trial accounts get a free number)
4. Copy E.164 format (e.g., `+15125551234`) → `TWILIO_PHONE_NUMBER`

> **Trial limitations:** SMS only to verified numbers. Messages prefixed with trial notice.
> Upgrade before pilot launch (Phase 5) to remove restrictions.

**Checklist:**
- [ ] Twilio account created
- [ ] Account SID + Auth Token copied
- [ ] SMS phone number purchased/copied

---

## Part 2: Local Verification

Before deploying, verify everything works locally.

### Step 1: Install Dependencies

```bash
cd "Med Spa App"
pnpm install
```

### Step 2: Create `.env.local`

Copy `apps/portal-medspa/.env.local.example` to `apps/portal-medspa/.env.local` and fill in:

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
STRIPE_WEBHOOK_SECRET=whsec_...

# ─── Postmark ───
POSTMARK_API_TOKEN=...
POSTMARK_FROM_EMAIL=noreply@yourdomain.com

# ─── Twilio ───
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+15125551234
```

> **No `NEXT_PUBLIC_CLINIC_ID` needed** — clinicId is auto-extracted from the user's session.

### Step 3: Run Verification Gates

```bash
pnpm typecheck    # Should show: 10/10 packages pass
pnpm test         # Should show: 203 tests, 0 failures
```

### Step 4: Start Dev Server

```bash
pnpm dev
```

Verify the app loads at **http://localhost:3000**.

### Step 5: Create the First Clinic (Admin Signup)

1. Navigate to **http://localhost:3000/auth/signup**
2. Fill in:
   - **Clinic Name:** e.g., "Glow Aesthetics"
   - **Clinic Location:** e.g., "Austin, TX"
   - **Email:** your email
   - **Password:** min 8 characters
3. Click **Sign Up**
4. You should be redirected to `/dashboard`

> **If signup fails:** The most common cause is email confirmation being enabled.
> Go back to Supabase → Authentication → Settings → "Confirm email" → OFF.
> If the staff record didn't create, use the [Fallback SQL](#fallback-sql-staff-table) below.

### Step 6: Verify RBAC

1. Navigate to **http://localhost:3000/dashboard/audit-logs**
2. Page should load (not redirect) — confirms `staff` record was created with `owner` role
3. Sidebar should show "Audit Logs" link (only visible to owners)

### Step 7: Test Happy Path Locally

- [ ] Login works
- [ ] Dashboard loads with metrics (may be zeros — no data yet)
- [ ] Create a provider (Providers page)
- [ ] Create a room (Rooms page)
- [ ] Create an appointment (Calendar page)
- [ ] Generate a payment link (Payment panel in Calendar)
- [ ] Audit logs page shows recent actions
- [ ] Logout works

### Step 8: Test Patient-Facing Flows (Optional but Recommended)

1. Open the booking page: `http://localhost:3000/patient/book/<clinic-id>`
   - Get the clinic ID from Supabase Dashboard → Table Editor → clinics → copy `id`
2. Select a provider and time slot
3. Confirm a booking
4. Open the intake form: `http://localhost:3000/patient/intake/<form-id>`
   - Create an intake form first at Dashboard → Forms

**Checklist:**
- [ ] `.env.local` created with all 13 values
- [ ] `pnpm typecheck` passes (10/10)
- [ ] `pnpm test` passes (203 tests)
- [ ] Dev server runs
- [ ] First clinic + admin created via signup
- [ ] Dashboard loads correctly
- [ ] Audit logs page accessible
- [ ] Happy path tested

---

## Part 3: Staging Deployment (Vercel)

### Step 1: Push to GitHub

```bash
cd "A:\Projects\Working\Substrate Ai Infrastructure\Advance Plan & Build"
git add -A
git commit -m "Phase 1 ready for staging deploy"
git push origin main
```

### Step 2: Import into Vercel

1. Go to **https://vercel.com** → sign in
2. Click **Add New → Project**
3. Import your Git repository
4. **CRITICAL — Root Directory:** Click **Edit** and set to:
   ```
   Med Spa App/apps/portal-medspa
   ```
5. The `vercel.json` handles the monorepo build config automatically

### Step 3: Add Environment Variables in Vercel

In **Settings → Environment Variables**, add all 13 variables from your `.env.local`:

| Variable | Staging Value |
|----------|---------------|
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-PROJECT.vercel.app` (your Vercel domain) |
| All others | Same as `.env.local` |

> `SUPABASE_SERVICE_ROLE_KEY` is safe — Vercel won't expose it to the browser
> (name doesn't start with `NEXT_PUBLIC_`).

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build (~2-3 min): `pnpm install` → `next build`
3. App live at `https://<project-name>.vercel.app`

### Step 5: Post-Deploy Configuration

**Update Stripe webhook:**
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://YOUR-DOMAIN.vercel.app/api/webhooks/stripe`
3. Events to send:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the signing secret → update `STRIPE_WEBHOOK_SECRET` in Vercel
5. Redeploy to pick up the new secret

**Update Supabase Auth URLs:**
1. Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL** to: `https://YOUR-DOMAIN.vercel.app`
3. Add Redirect URL: `https://YOUR-DOMAIN.vercel.app/**`

> Stripe test keys only for staging. Switch to production keys in Phase 5.

**Checklist:**
- [ ] Code pushed to GitHub
- [ ] Vercel project created (root directory: `Med Spa App/apps/portal-medspa`)
- [ ] All 13 env vars added in Vercel
- [ ] First deployment successful (build passes)
- [ ] Stripe webhook URL updated to staging + new secret set
- [ ] Supabase auth URLs updated to staging domain

---

## Part 4: Post-Deploy Smoke Test

Run this on the staging deployment. Do NOT skip any step.

### Admin Happy Path (14 steps)

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 1 | Open staging URL in browser | Landing page loads with Login/Sign Up buttons | ☐ |
| 2 | Click "Sign Up", fill clinic details, submit | Redirected to `/dashboard` | ☐ |
| 3 | View dashboard overview | Shows metrics (zeros for new clinic), date selector works, no console errors | ☐ |
| 4 | Go to Providers → add one (name + specialties) | Provider appears in list | ☐ |
| 5 | Go to Rooms → add one (name + capacity) | Room appears in list | ☐ |
| 6 | Go to Patients → verify list loads | Empty list or shows test patient | ☐ |
| 7 | Go to Calendar → create an appointment | Appointment saved, shows in calendar view | ☐ |
| 8 | Click on the appointment → generate payment link | Stripe checkout URL generated | ☐ |
| 9 | Open the payment link in a new tab, complete a test payment | Stripe checkout succeeds, redirected to `/payments/success` | ☐ |
| 10 | Go back to Calendar, check the appointment | Payment status updated to "completed" (via webhook) | ☐ |
| 11 | From Calendar, send a confirmation email | Postmark email received in inbox | ☐ |
| 12 | From Calendar, send a confirmation SMS | Twilio SMS received (if verified number on trial) | ☐ |
| 13 | Go to Audit Logs page | Page loads, shows recent actions (signup, creates, payment) | ☐ |
| 14 | Click Logout | Redirected to login page | ☐ |

### Patient-Facing Flow (5 steps)

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 15 | Open booking page: `/patient/book/<clinic-id>` | Provider list loads from API | ☐ |
| 16 | Select a provider + date, view available slots | Time slots appear (or "no availability" if none set) | ☐ |
| 17 | Fill patient info, confirm booking | "Booking confirmed" message, appointment created | ☐ |
| 18 | Open intake form: `/patient/intake/<form-id>` | Form renders with all fields | ☐ |
| 19 | Fill form, type name for signature, check consent, submit | "Thank you" confirmation shown | ☐ |

### RBAC Verification (Optional but recommended)

| Step | Action | Expected Result | Pass? |
|------|--------|-----------------|-------|
| 20 | In Supabase, manually add a `staff` record with `role: 'staff'` for the same clinic | — | ☐ |
| 21 | Log in as the staff user | Dashboard loads | ☐ |
| 22 | Check sidebar | "Audit Logs" link should be **hidden** | ☐ |
| 23 | Manually navigate to `/dashboard/audit-logs` | Redirected to `/dashboard` (middleware blocks) | ☐ |

### Getting the Clinic ID for Patient Links

1. Supabase Dashboard → Table Editor → `clinics` → copy the `id` UUID
2. Booking URL: `https://YOUR-DOMAIN.vercel.app/patient/book/<clinic-id>`
3. For intake: First create an intake form at Dashboard → Forms, then get the form ID from the `intake_forms` table

**Checklist:**
- [ ] All 14 admin happy-path steps pass
- [ ] All 5 patient-facing flow steps pass
- [ ] (Optional) RBAC verification passes

---

## Part 5: Troubleshooting

### Signup Fails (Most Common)

**Symptom:** After clicking Sign Up, you get an error or the dashboard doesn't load.

**Cause 1 — Email Confirmation is ON:**
- Go to Supabase → Authentication → Settings → "Confirm email" → OFF
- Try again

**Cause 2 — Staff record not created:**

Check if the staff record exists:
```sql
SELECT u.id AS auth_user_id, u.email, s.id AS staff_id, s.role
FROM auth.users u
LEFT JOIN staff s ON s.id = u.id
WHERE u.email = 'your-email@example.com';
```

If `staff_id` is NULL, manually insert it:
```sql
INSERT INTO staff (id, clinic_id, email, name, role)
VALUES (
  '<AUTH_USER_ID>',
  '<CLINIC_ID>',
  'your-email@example.com',
  'Your Name',
  'owner'
);
```

> **CRITICAL:** The `id` column MUST be the auth user's UUID (from `auth.users.id`),
> NOT a random UUID. The middleware checks `staff.id = session.user.id`.

### Payment Status Not Updating

**Symptom:** Payment succeeds in Stripe but appointment still shows "pending".

**Cause:** Webhook not reaching your app.

1. Verify the webhook endpoint URL is correct in Stripe Dashboard
2. Check Stripe Dashboard → Developers → Webhooks → your endpoint → "Attempts"
3. Ensure `STRIPE_WEBHOOK_SECRET` matches the endpoint's signing secret
4. For local testing: ensure Stripe CLI is running (`stripe listen --forward-to ...`)

### Dashboard Shows "Unauthorized" or Redirects to Login

**Cause:** Session not persisting.

1. Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set correctly
2. Verify Supabase Auth → URL Configuration → Site URL matches your domain
3. Clear browser cookies and try again

### API Routes Return 403 Forbidden

**Cause:** IDOR protection kicking in.

The API routes verify that the `clinicId` in the request body matches the `clinicId`
from your session. If you're seeing 403s:
1. Verify you're logged in
2. Verify your staff record has the correct `clinic_id`
3. Check that the client component is sending the right `clinicId`

### Build Fails on Vercel

1. Check that Root Directory is set to `Med Spa App/apps/portal-medspa`
2. Verify all 13 env vars are set in Vercel
3. Check the Vercel build logs for the specific error
4. Ensure `pnpm-lock.yaml` is committed

---

## Part 6: Finalize Phase 1

After the smoke test passes:

### Step 1: Update MASTER_PROGRESS.md

1. Open `MASTER_PROGRESS.md`
2. Change Phase 1 status from `🟡 ~95% done` to `✅ Complete`
3. Check off all items in the "Staging Deploy & Smoke Test" section
4. Check off all items in the "Phase 1 → Phase 2 Gate" section
5. Update the verification snapshot with staging results

### Step 2: Mark the Gate

In `MASTER_PROGRESS.md` → Gate Criteria table:
- Change **Phase 1 → 2** from unchecked to: `✅ Met — staging deployed, smoke test passed`

### Step 3: Commit the Documentation Update

```bash
git add MASTER_PROGRESS.md
git commit -m "Phase 1 COMPLETE: staging deployed, smoke test passed"
git push origin main
```

### Step 4: Celebrate 🎉

Phase 1 is done. You have:
- A working HIPAA-designed Med Spa portal
- 25+ reusable modules in packages/
- Full RBAC, audit logging, encryption pre-wired
- Deployed to staging with all integrations working

**Next:** Phase 2 (Platform Layer Build) — connect API, module generalization, open-source prep.

---

## Appendix: Environment Variable Reference

### Required (13 variables)

| Variable | Required | Browser? | Source |
|----------|----------|----------|--------|
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | Your deployment URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Supabase → Settings → API → anon public |
| `SUPABASE_URL` | Yes | No | Same as `NEXT_PUBLIC_SUPABASE_URL` |
| `SUPABASE_ANON_KEY` | Yes | No | Same as `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | **Never** | Supabase → Settings → API → service_role |
| `STRIPE_SECRET_KEY` | Yes | No | Stripe → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Yes | No | Stripe → Developers → Webhooks → Signing secret |
| `POSTMARK_API_TOKEN` | Yes | No | Postmark → Server → API Tokens |
| `POSTMARK_FROM_EMAIL` | Yes | No | Your verified sender email |
| `TWILIO_ACCOUNT_SID` | Yes | No | Twilio Console → Dashboard |
| `TWILIO_AUTH_TOKEN` | Yes | No | Twilio Console → Dashboard |
| `TWILIO_PHONE_NUMBER` | Yes | No | Twilio → Phone Numbers (E.164) |

### Optional

| Variable | Default if unset |
|----------|-----------------|
| `STRIPE_SUCCESS_URL` | `${NEXT_PUBLIC_APP_URL}/payments/success` |
| `STRIPE_CANCEL_URL` | `${NEXT_PUBLIC_APP_URL}/payments/cancelled` |
| `PHI_ENABLED` | `false` (keep `false` until BAA signed — see `docs/HIPAA_COMPLIANCE.md`) |

---

## Appendix: Fallback SQL — Staff Table

If signup fails or you need to manually create staff records.

### Create the Owner Staff Record

```sql
-- Step 1: Find the auth user ID and clinic ID
SELECT u.id AS auth_user_id, u.email, c.id AS clinic_id, c.name AS clinic_name
FROM auth.users u
JOIN clinics c ON c.owner_id = u.id
WHERE u.email = 'owner@example.com';

-- Step 2: Insert the owner staff record
INSERT INTO staff (id, clinic_id, email, name, role)
VALUES (
  '<AUTH_USER_ID>',      -- from Step 1 (MUST match auth.users.id)
  '<CLINIC_ID>',         -- from Step 1
  'owner@example.com',   -- must match auth email
  'Clinic Owner',        -- display name
  'owner'                -- exact string
);

-- Step 3: Verify
SELECT * FROM staff WHERE email = 'owner@example.com';
```

> **CRITICAL:** The `id` MUST be the auth user's UUID, NOT `gen_random_uuid()`.
> The middleware queries `staff.id = session.user.id`.

### Add a Non-Owner Staff Member

```sql
INSERT INTO staff (clinic_id, email, name, role)
VALUES (
  '<CLINIC_ID>',
  'staff@example.com',
  'Staff Name',
  'staff'
);
-- Non-owner staff use gen_random_uuid() for id — they authenticate via email matching in RLS
```

---

## Appendix: Verification Commands Quick Reference

```bash
# Typecheck all packages
cd "Med Spa App" && pnpm typecheck

# Run all tests
cd "Med Spa App" && pnpm test

# Build the portal
cd "Med Spa App/apps/portal-medspa" && npx next build

# Start dev server
cd "Med Spa App" && pnpm dev

# Stripe CLI (local webhook forwarding)
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger a test webhook event
stripe trigger checkout.session.completed
```
