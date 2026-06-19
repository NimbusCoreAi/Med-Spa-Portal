# MASTER MANUAL CONFIG — Baseplate OS / Med Spa

> **The living checklist for every manual setup, configuration, deployment, and human action across all phases.**
> This is NOT a planning doc — it is the operational execution checklist. Update it as you go.
> Pair with: `MASTER_PROGRESS.md` (project status) and `Med Spa App/CLAUDE.md` (dev commands).
> Last updated: June 2026 — **ALL CODE COMPLETE + SECURITY AUDITED + 41 FINDINGS REMEDIATED (28 migrations, 283 tests)**
> **CONFIG IN PROGRESS:** Supabase, Stripe, Twilio, GitHub accounts created. `.env.local` wired up (5 creds still missing). Migrations 0028–0029 + Supabase auth config next.

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[x]` | Complete |
| `[~]` | In progress |
| `[!]` | Blocked / needs attention |

---

## How to Use This Document

1. **Work top to bottom** — phases are sequential. Each phase has a gate at the bottom.
2. **When you're in a specific dashboard** (Stripe, Supabase, etc.), jump to [Section 7: Cross-Phase Service Reference](#7-cross-phase-service-reference) to see every task for that service across all phases at once.
3. **Check off items as you complete them.** This document IS the checklist.
4. **After completing a phase section**, update `MASTER_PROGRESS.md` to reflect the new status.
5. **Found a new manual task?** Add it to the appropriate section — this is a living document.

---

## Current Project State

> **ALL CODE IS COMPLETE across Phases 0-5.** 17 packages, 161+ tests, 13/13 builds pass. 28 SQL migrations (0001-0029, with 0026 deleted as dead code).
> What remains is **entirely manual**: account creation, deploys, configuration, customer recruitment.
> No more code needs to be written (except ML training after pilot data exists).

### ⚡ Next Actions (do these in order)

| # | Action | Where | Status |
|---|--------|-------|--------|
| 1 | ~~Get Supabase secret key~~ → paste into `.env.local` `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API Keys → `sb_secret_...` | [x] |
| 2 | ~~Run migrations 0001-0027~~ on Supabase via `supabase db push` | (DONE) | [x] |
| 3 | **Apply migrations 0028 + 0029** (critical fixes — package deduction & email patient upsert are broken without them) | `supabase db push` (project `xahvcetvyypjduqfcqfq`) | [ ] |
| 4 | **Disable email confirmation** in Supabase Auth (critical for signup to work) | Supabase Dashboard → Authentication → Settings | [ ] |
| 5 | **Set Site URL + Redirect URLs** to `http://localhost:3000` | Supabase Dashboard → Authentication → URL Configuration | [ ] |
| 6 | **Buy Twilio phone number** → paste into `.env.local` `TWILIO_PHONE_NUMBER` | Twilio Console → Phone Numbers → Buy | [ ] |
| 7 | **Install Stripe CLI + run webhook listener** → paste `whsec_...` into `.env.local` (register 7 events incl. `charge.refunded`) | `stripe listen --forward-to localhost:3000/api/webhooks/stripe` | [ ] |
| 8 | **Set `RATE_LIMIT_FAIL_OPEN=true`** in `.env.local` (until Upstash is provisioned) | `.env.local` | [ ] |
| 9 | **Resolve Postmark/Email** — use Resend (free) or buy a domain | See Section 2.5 | [ ] |
| 10 | **Run `pnpm dev`** in `Med Spa App/` and test signup flow | Local | [ ] |

---

## Table of Contents

- [1. Account & Credentials Tracker](#1-account--credentials-tracker)
- [2. Phase 1 (Remaining) — Staging Deploy & Smoke Test](#2-phase-1-remaining--staging-deploy--smoke-test)
- [3. Phase 2 — Platform Layer](#3-phase-2--platform-layer)
- [4. Phase 3 — Intelligence & Ecosystem](#4-phase-3--intelligence--ecosystem)
- [5. Phase 4 — Open-Source Launch](#5-phase-4--open-source-launch)
- [6. Phase 5 — Customer Onboarding](#6-phase-5--customer-onboarding)
- [7. Cross-Phase Service Reference](#7-cross-phase-service-reference)
- [8. Environment Variables Master List](#8-environment-variables-master-list)
- [9. Migration Tracker](#9-migration-tracker)
- [10. Discrepancies & Reconciliation Notes](#10-discrepancies--reconciliation-notes)

---

## 1. Account & Credentials Tracker

> Fill this in as you create each account. Store actual keys/credentials in a password manager (1Password, Bitwarden, etc.) — NOT in this file.

### 1.1 External Service Accounts

| Service | URL | Account Email | Plan / Tier | Phase Needed | Account Created |
|---------|-----|---------------|-------------|--------------|-----------------|
| Supabase | supabase.com | NimbusCoreAi | Free (→ Pro in Phase 5) | Phase 1 | [x] |
| Stripe | dashboard.stripe.com | NimbusCoreAi | Test Mode (→ Live in Phase 5) | Phase 1 | [x] |
| Postmark | postmarkapp.com | — Gmail rejected (see notes) | Free trial / Developer | Phase 1 | [! ] |
| Twilio | twilio.com | NimbusCoreAi | Trial (→ Paid in Phase 5) | Phase 1 | [x] |
| Railway | railway.com | ____________ | Hobby (~$5/mo + usage) | Phase 1 | [ ] |
| GitHub | github.com/NimbusCoreAi | NimbusCoreAi | Free | Phase 1 | [x] |
| Upstash | console.upstash.com | ____________ | Free (10K cmds/day) | Phase 2C | [ ] |
| npm | npmjs.com | ____________ | Free | Phase 4C | [ ] |
| AWS (KMS) | aws.amazon.com | ____________ | Per-use pricing | Phase 5B | [ ] |
| MCP Registry | (TBD) | ____________ | Free | Phase 4B | [ ] |
| Loom | loom.com | ____________ | Free tier | Phase 5C | [ ] |
| HubSpot / Notion / Sheets | (choose one) | ____________ | Free | Phase 5C | [ ] |

### 1.2 Credentials Tracker

> Check the box once the credential is generated and stored in your password manager. Actual values go in `.env.local` (local) or Railway service variables (deployed).

| Credential | Env Var(s) | Phase Needed | Stored |
|------------|-----------|--------------|--------|
| Supabase Project URL | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_URL` | Phase 1 | [x] |
| Supabase anon/publishable key | `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY` | Phase 1 | [x] |
| Supabase service_role/secret key | `SUPABASE_SERVICE_ROLE_KEY` | Phase 1 | [x] |
| Supabase DB password | _(stored in password manager only)_ | Phase 1 | [ ] |
| Stripe secret key (test) | `STRIPE_SECRET_KEY` | Phase 1 | [x] |
| Stripe webhook signing secret (test) | `STRIPE_WEBHOOK_SECRET` | Phase 1 | **[ ] MISSING — run `stripe listen` or create dashboard webhook** |
| Stripe secret key (live) | `STRIPE_SECRET_KEY` | Phase 5A | [ ] |
| Stripe webhook signing secret (live) | `STRIPE_WEBHOOK_SECRET` | Phase 5A | [ ] |
| **Stripe Price ID — Connect plan** | `STRIPE_PRICE_CONNECT` | Phase 5A | [ ] |
| **Stripe Price ID — Intelligence add-on** | `STRIPE_PRICE_INTELLIGENCE` | Phase 5A | [ ] |
| Postmark Server API token | `POSTMARK_API_TOKEN` | Phase 1 | **[ ] MISSING — Gmail signup rejected** |
| Postmark sender email | `POSTMARK_FROM_EMAIL` | Phase 1 | **[ ] MISSING — see Postmark notes below** |
| Twilio Account SID | `TWILIO_ACCOUNT_SID` | Phase 1 | [x] |
| Twilio Auth Token | `TWILIO_AUTH_TOKEN` | Phase 1 | [x] |
| Twilio phone number (E.164) | `TWILIO_PHONE_NUMBER` | Phase 1 | **[ ] MISSING — buy number in Twilio Console** |
| Connect API key (shared) | `CONNECT_API_KEY` | Phase 2B | [ ] |
| Upstash Redis REST URL | `UPSTASH_REDIS_REST_URL` | Phase 2C | [ ] |
| Upstash Redis REST token | `UPSTASH_REDIS_REST_TOKEN` | Phase 2C | [ ] |
| Rate-limit fail-open (dev/staging) | `RATE_LIMIT_FAIL_OPEN` | Phase 1 (dev) | [ ] set `=true` locally until Upstash provisioned |
| Per-clinic SMS daily cap | `SMS_DAILY_LIMIT_PER_CLINIC` | Phase 2C | [ ] (defaults to 50) |
| SMS intake_url host allowlist | `CONNECT_INTAKE_URL_ALLOWLIST` | Phase 2C | [ ] (recommended in prod) |
| Encryption key (PHI) | _(stored in AWS KMS)_ | Phase 5B | [ ] |
| **ML Serve URL** | `ML_SERVER_URL` | Phase 5F | [ ] |

### 1.3 Domain & DNS

| Item | Value | Phase Needed | Configured |
|------|-------|--------------|------------|
| Supabase project ref | `xahvcetvyypjduqfcqfq` | Phase 1 | [x] |
| Supabase project URL | `https://xahvcetvyypjduqfcqfq.supabase.co` | Phase 1 | [x] |
| GitHub repo | `https://github.com/NimbusCoreAi/Med-Spa-Portal.git` | Phase 1 | [x] |
| GitHub initial commit | `f8005c5` pushed to `origin/main` | Phase 1 | [x] |
| Production domain | ____________ | Phase 5A | [ ] |
| DNS provider | ____________ | Phase 1/5A | [ ] |
| Postmark DKIM record | _(from Postmark dashboard)_ | Phase 1 | [ ] |
| Postmark Return-Path record | _(from Postmark dashboard)_ | Phase 1 | [ ] |
| Railway custom domain (CNAME) | _(from Railway dashboard)_ | Phase 5A | [ ] |

---

## 2. Phase 1 (Remaining) — Staging Deploy & Smoke Test

> **Prerequisite:** All Phase 1 code is complete. 283 tests pass, 17/17 packages typecheck, 35 routes build. Only manual steps remain.
> **This is THE critical path — everything downstream depends on this completing first.**

### 2.1 Create External Service Accounts

- [x] **Supabase** — Sign up at supabase.com
- [x] **Supabase** — Create new project (ref: `xahvcetvyypjduqfcqfq`)
  - Name: `medspa-portal-staging`
   - Region: `US East (N. Virginia)` — **select the nearest Railway region (US East) for lowest latency**
  - Pricing: Free tier
  - Generate strong DB password → store in password manager
- [x] **Stripe** — Sign up at dashboard.stripe.com → switch to **Test Mode**
- [!] **Postmark** — Sign up at postmarkapp.com — **BLOCKED: Gmail rejected (DMARC policy). See Section 2.5 notes.**
- [ ] **Postmark** — Create a Server (e.g., "Med Spa Portal")
- [x] **Twilio** — Sign up at twilio.com → complete setup wizard → verify your phone number
- [ ] **Railway** — Sign up at railway.com
- [x] **GitHub** — Repo created and initial commit pushed: `https://github.com/NimbusCoreAi/Med-Spa-Portal.git`

### 2.2 Generate API Keys & Credentials

- [x] **Supabase** → Project Settings → API → copy **Project URL**
  - → `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL` = `https://xahvcetvyypjduqfcqfq.supabase.co`
- [x] **Supabase** → Project Settings → API → copy **publishable** key (`sb_publishable_...`)
  - → `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_ANON_KEY`
- [x] **Supabase** → Project Settings → API → copy **secret_key** (`sb_secret_...`) (server-only, bypasses RLS)
  - → `SUPABASE_SERVICE_ROLE_KEY`
- [x] **Stripe** → Developers → API Keys → copy **Secret key** (`sk_test_...`)
  - → `STRIPE_SECRET_KEY`
- [ ] **Postmark** → Server → API Tokens → copy **Server API token**
  - → `POSTMARK_API_TOKEN` — **⚠️ BLOCKED (Gmail issue)**
- [ ] **Postmark** → Sender Signatures or Domains → note verified sender email
  - → `POSTMARK_FROM_EMAIL` — **⚠️ BLOCKED**
- [x] **Twilio** → Console → Dashboard → copy **Account SID** (`AC...` redacted — do not commit real SID)
  - → `TWILIO_ACCOUNT_SID`
- [x] **Twilio** → Console → Dashboard → click "Show" → copy **Auth Token**
  - → `TWILIO_AUTH_TOKEN`
- [ ] **Twilio** → Phone Numbers → Manage → Buy a number → copy E.164 number
  - → `TWILIO_PHONE_NUMBER` — **⚠️ STILL NEEDED**
  - Note: Trial accounts get a free number but can only send to verified numbers
  - Add pilot/test phone numbers to "Verified Caller IDs" while on trial

### 2.3 Run Database Migrations

> **Migrations 0001–0027 have been applied** via `supabase db push` (linked to project `xahvcetvyypjduqfcqfq`).
> **⚠️ Migrations 0028 + 0029 are NEW and NOT YET APPLIED — they fix two silent, production-breaking bugs.** Run them before testing:
> - **`0028_credit_package_updated_at.sql`** — `0023`'s `deduct_package_session` RPC writes `updated_at` on `credit_packages`, which has no such column. Without 0028, every package deduction throws at runtime.
> - **`0029_patient_email_plain_unique.sql`** — `0020` created a unique index on the expression `(clinic_id, lower(email))`, but the upsert uses `onConflict: 'clinic_id,email'`, which Postgres can't infer from an expression index. Without 0029, every email-based patient booking throws `42P10`. 0029 replaces it with a plain `(clinic_id, email)` index (app lowercases email before insert).
> - **`0026_dashboard_metrics_rpc.sql` was DELETED** (dead code — the RPC had zero callers; reporting now reads the `payments` ledger directly). If you already ran 0026 against your DB, the unused `get_dashboard_metrics()` function lingers harmlessly; no action needed.
>
> **To apply 0028 + 0029:** `cd "Med Spa App" && supabase link --project-ref xahvcetvyypjduqfcqfq && supabase db push`
>
> 5 migration files (0004, 0006, 0012, 0021, 0022) were fixed for Supabase compatibility during initial deployment — see Section 10.11 for details. **⚠️ Note: these 5 fixes were applied to the remote DB but are NOT committed to git. Commit them so a fresh `git clone` + `db push` reproduces your deployed schema.**

**Phase 1 Migrations (core portal):**
- [ ] `0001_init_clinics.sql` — Tables: `clinics`, `staff`, `patients`, `audit_logs` + indexes
- [ ] `0002_rls_policies.sql` — Row Level Security on all 4 tables + access policies
- [ ] `0003_intake_forms.sql` — Tables: `intake_forms`, `intake_submissions` + RLS
- [ ] `0004_scheduling.sql` — Tables: `providers`, `rooms`, `appointments` + GIST double-booking constraint + RLS
- [ ] `0005_payments.sql` — Payment columns on `appointments` (`amount`, `payment_status`, `payment_link_url`, etc.)
- [ ] `0006_rename_treatment_to_service.sql` — Renames `treatment_type` → `service_type`
- [ ] `0007_tighten_rls_policies.sql` — Removes overly permissive anonymous-access policies
- [ ] `0008_staff_insert_policy.sql` — Adds INSERT policy on `staff` so signup can create owner record

**Phase 2 Migrations (Connect API + marketplace):**
- [ ] `0009_credit_packages.sql` — `credit_packages`, `package_transactions` + RLS
- [ ] `0010_api_usage.sql` — `api_usage` table for metering
- [ ] `0011_fix_package_deduction.sql` — Fixes atomic deduction RPC

**Phase 3 Migrations (intelligence + marketplace):**
- [ ] `0012_intelligence_seed.sql` — Seeds synthetic test data for risk scoring
- [ ] `0013_marketplace.sql` — `modules`, `installed_modules`, `module_subscriptions` tables

**Phase 5 Migrations (billing + feedback):**
- [ ] `0014_subscriptions.sql` — `subscriptions` table (clinic_id, stripe_customer_id, stripe_subscription_id, plan, status, current_period_end) + RLS
- [ ] `0015_feedback.sql` — `feedback` table (clinic_id, submitted_by, category, message, priority, status) + RLS

**Security Remediation Migrations (Phases 1-5 hardening):**
- [ ] `0016_api_keys.sql` — `clinic_api_keys` table (per-clinic hashed API keys replacing shared key)
- [ ] `0017_payments_table.sql` — `payments` table (standalone payment records)
- [ ] `0018_stripe_events.sql` — `processed_stripe_events` table (webhook idempotency)
- [ ] `0019_fix_rls_identity.sql` — Fixes RLS identity drift on `subscriptions` + `feedback`
- [ ] `0020_patient_unique_email.sql` — Unique constraint on `patients(clinic_id, lower(email))`
- [ ] `0021_room_exclusion.sql` — GiST exclusion constraint preventing room double-booking
- [ ] `0022_on_delete_policies.sql` — ON DELETE cascade/set null on appointments, intake, package_transactions FKs
- [ ] `0023_package_expiry_guard.sql` — Blocks session deduction on expired credit packages in RPC

**Data Integrity + Performance Migrations:**
- [ ] `0024_money_cents.sql` — Converts `appointments.amount` + `credit_packages.amount_paid` from NUMERIC(10,2) dollars to INTEGER cents (idempotent, guarded by column type check)
- [ ] `0025_seed_is_synthetic.sql` — Adds `is_synthetic BOOLEAN` column to clinics, patients, providers, rooms, appointments, payments for seed data cleanup
- ~~`0026_dashboard_metrics_rpc.sql`~~ — **DELETED (dead code — RPC had zero callers). Skip.**
- [ ] `0027_performance_indexes.sql` — Composite indexes on appointments, payments, patients, marketplace_subscriptions

**Post-Review Fix Migrations (REQUIRED — apply with `supabase db push`):**
- [ ] `0028_credit_package_updated_at.sql` — Adds `updated_at` column to `credit_packages` so the `0023` deduction RPC stops throwing "column updated_at does not exist"
- [ ] `0029_patient_email_plain_unique.sql` — Replaces the expression index from 0020 with a plain `(clinic_id, email)` unique index so `findOrCreatePatient`'s `onConflict: 'clinic_id,email'` works; normalizes stored emails to lowercase

> **Total: 28 migrations** (0001–0025, 0027–0029; 0026 deleted). All are additive (no destructive changes). Run in exact numeric order.

### 2.4 Configure Supabase Dashboard

- [ ] **Auth → Providers** — Ensure **Email** provider is enabled (default on)
- [ ] **Auth → URL Configuration** — Set **Site URL** to `http://localhost:3000` (update to Railway domain after deploy)
- [ ] **Auth → URL Configuration** — Add **Redirect URLs**: `http://localhost:3000/**` (add Railway domain after deploy)
- [ ] **CRITICAL: Auth → Settings** — **Disable "Confirm email"**
  - If left ON, `signUp()` creates the user but does NOT establish a session, causing clinic + staff inserts to fail.
  - Re-enable in Phase 5A after production deploy.
  - **Note:** The enhanced signup API (`/api/auth/signup-enhanced`) now sets `email_confirm: false` by default.
- [ ] **Settings → Database** — Enable **daily backups** (recommended even on free tier if available)

### 2.5 Postmark Email Verification

> **WHY YOU NEED A TRANSACTIONAL EMAIL SERVICE:**
> Your app sends automated emails: appointment confirmations, intake form links, payment receipts,
> password resets. You can't send these from a personal Gmail/Outlook account because:
> 1. Email providers limit automated/sending volume (Gmail caps ~500/day, blocks programmatic SMTP)
> 2. Without SPF/DKIM/DMARC DNS records, emails land in spam
> 3. You need delivery analytics (bounces, opens, spam complaints) for production
> Postmark (and alternatives like Resend) solve all of this — they're SMTP relays optimized for
> transactional email with built-in deliverability infrastructure.

> **WHY POSTMARK REJECTS GMAIL:**
> Gmail (and Yahoo/AOL) enforce a strict DMARC policy (`p=reject`). This means no third-party
> server (like Postmark) is allowed to send email "from" a `@gmail.com` address — it will be
> rejected/bounced. This is an anti-spam measure, not a Postmark bug.

> **HOW TO FIX — Choose ONE:**

**Option A — Use Resend.com instead (FREE TIER, fastest path) (RECOMMENDED for testing):**
- [ ] Sign up at https://resend.com (accepts Gmail login, free tier = 3,000 emails/month)
- [ ] Verify your email address (Resend lets you send FROM your Gmail as a verified sender on free tier)
- [ ] Get API key → store as `POSTMARK_API_TOKEN` (the code uses this var name — Resend's API is SMTP-compatible)
- [ ] Set `POSTMARK_FROM_EMAIL` to your verified Gmail address
- [ ] **Note:** The `@baseplate/core/notifications` module uses the `postmark` npm package. For Resend,
      either: (a) use Resend's SMTP relay (host: `smtp.resend.com`, port 587), or (b) swap the Postmark
      client for Resend's SDK (`resend` npm package) in `packages/integrations/postmark/`.
      **SMTP relay requires no code change** — Postmark supports custom SMTP hosts.

**Option B — Buy a custom domain ($10-15/year) and use Postmark properly:**
- [ ] Buy a cheap domain (Namecheap, Cloudflare, Porkbun — ~$10/yr for `.com` or ~$2/yr for `.xyz`)
- [ ] Postmark → Domains → Add your domain
- [ ] Add provided **DKIM DNS record** to your DNS provider's control panel
- [ ] Add **Return-Path DNS record** to your DNS provider
- [ ] Wait for verification (minutes to hours)
- [ ] Set `POSTMARK_FROM_EMAIL=noreply@yourdomain.com`

**Option C — Postmark Sender Signature with a non-Gmail address:**
- [ ] Use a custom domain email, a work email, or an Outlook/Yahoo address
- [ ] Postmark → Sender Signatures → Add signature email
- [ ] Check inbox → click confirmation link

**Option D — Skip email for now (defer to Phase 5):**
- [ ] The app will still run — email sending fails gracefully (logged, not crashed)
- [ ] SMS notifications (Twilio) and all other features work without email
- [ ] Come back to this when you have a custom domain or choose Resend

### 2.6 Stripe Webhook Registration

> **IMPORTANT:** The webhook now handles BOTH payment events AND subscription events (Phase 5 code).

**For local development (Stripe CLI):**
- [ ] Install Stripe CLI (`brew install stripe/stripe-cli/stripe` or download from GitHub)
- [ ] Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- [ ] Capture `whsec_...` signing secret → `STRIPE_WEBHOOK_SECRET` in `.env.local`

**For production (after Railway deploy — see 2.10):**
- [ ] Stripe Dashboard → Developers → Webhooks → Add endpoint
  - URL: `https://YOUR-DOMAIN.up.railway.app/api/webhooks/stripe`
  - **Register ALL of these events (7 total):**
    - `checkout.session.completed`
    - `payment_intent.succeeded`
    - `payment_intent.payment_failed`
    - `charge.refunded` *(records refunds in the `payments` ledger so revenue reflects them)*
    - `customer.subscription.created` *(Phase 5 — subscription billing)*
    - `customer.subscription.updated` *(Phase 5 — subscription billing)*
    - `customer.subscription.deleted` *(Phase 5 — subscription billing)*
- [ ] Copy endpoint's signing secret → update `STRIPE_WEBHOOK_SECRET` in Railway
- [ ] Redeploy Railway service to pick up new webhook secret

### 2.7 Local Environment Setup

- [ ] Run `pnpm install` in `Med Spa App/` directory
- [ ] Copy `apps/portal-medspa/.env.local.example` → `.env.local`
- [ ] Fill in all required values (see [Section 8](#8-environment-variables-master-list))
  - Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`
  - Set `PHI_ENABLED=false` (keep false until BAA signed)
  - Set `STRIPE_PRICE_CONNECT=` and `STRIPE_PRICE_INTELLIGENCE=` (leave empty for now — create Stripe products in Phase 2C)
- [ ] Run `pnpm typecheck` — expect **17/17 packages pass**
- [ ] Run `pnpm test` — expect **283 tests, 0 failures** (149 core + 25 intelligence + 46 UI + 23 patterns + 12 connect-api + 4 twilio + 24 others)
- [ ] Run `pnpm build` — expect **13/13 builds pass**
- [ ] Run `pnpm dev` — verify app loads at `http://localhost:3000`

### 2.8 Local Manual Testing

- [ ] **Sign up** — Navigate to `/auth/signup`, fill clinic name, location, email, password, submit
- [ ] Verify redirect to `/dashboard` (confirms signup → clinic + staff record created)
- [ ] **Verify RBAC** — Navigate to `/dashboard/audit-logs` — page should load (confirms `owner` role)
- [ ] **Verify sidebar** — "Audit Logs" link should be visible (owner role)
- [ ] **Create a provider** — Dashboard → Providers → Add
- [ ] **Create a room** — Dashboard → Rooms → Add
- [ ] **Create an appointment** — Dashboard → Calendar
- [ ] **Generate payment link** — From appointment → Payment panel
- [ ] **Verify audit logs** — Dashboard → Audit Logs → confirm recent actions visible
- [ ] **Verify feedback widget** — Click floating button (bottom-right) → submit feedback → verify it appears in `/dashboard/feedback`
- [ ] **Verify pricing page** — Navigate to `/pricing` → 3-tier comparison cards render
- [ ] **Verify health endpoint** — `curl http://localhost:3000/api/health` → returns JSON status
- [ ] **Test logout** — Should redirect to login page

**Patient-facing flow (optional for local):**
- [ ] Create an intake form at Dashboard → Forms
- [ ] Open `/patient/book/<clinic-id>` — provider list loads
- [ ] Select provider + date → time slots appear
- [ ] Fill patient info, confirm booking → appointment created
- [ ] Open `/patient/intake/<form-id>` — form renders
- [ ] Fill form, type signature, check consent, submit → confirmation shown

**Fallback (if signup fails or staff record not created):**
- [ ] Manually run SQL in Supabase SQL Editor to insert the owner staff record. The `id` MUST be the auth user's UUID, role must be `'owner'`.

### 2.9 Railway Deployment

- [x] Push code to GitHub: `pnpm-lock.yaml` is committed, initial commit `f8005c5` pushed to `https://github.com/NimbusCoreAi/Med-Spa-Portal.git`
- [ ] **Replace `<PUBLIC_REPO_URL>` placeholder** in 3 files:
  - `Med Spa App/package.json` (root)
  - `Med Spa App/packages/sdk/package.json`
  - `Med Spa App/README.md`
- [ ] Railway → New Project → Deploy from GitHub repo
- [ ] **CRITICAL:** Set **Root Directory** to `Med Spa App/apps/portal-medspa` (so the pnpm workspace resolves)
- [ ] Buildpack: Railway auto-detects Next.js via Nixpacks (no config file required)
- [ ] Add all environment variables under the Service → Variables tab (see [Section 8](#8-environment-variables-master-list))
  - Update `NEXT_PUBLIC_APP_URL` to your Railway domain
- [ ] Click **Deploy** — wait for build (~2-3 min)
- [ ] App live at `https://<project-name>.up.railway.app`

### 2.10 Post-Deploy Configuration Updates

- [ ] **Stripe webhook** → update endpoint to `https://YOUR-DOMAIN.up.railway.app/api/webhooks/stripe`
  - Ensure ALL 7 events are registered (see Section 2.6)
- [ ] Copy new signing secret → update `STRIPE_WEBHOOK_SECRET` in Railway → redeploy
- [ ] **Supabase Auth URLs** → set Site URL to `https://YOUR-DOMAIN.up.railway.app`
- [ ] **Supabase Auth URLs** → add Redirect URL `https://YOUR-DOMAIN.up.railway.app/**`
- [ ] **SSL** — Railway provides automatic HTTPS/TLS — verify it's active

### 2.11 Post-Deploy Smoke Test

**Admin Happy Path:**
- [ ] Open staging URL — landing page loads
- [ ] Sign Up — fill clinic details, submit → redirect to `/dashboard`
- [ ] Dashboard overview — metrics render, date selector works, no console errors
- [ ] Add a Provider — appears in list
- [ ] Add a Room — appears in list
- [ ] Verify Patients list loads
- [ ] Create an appointment — saved, shows in calendar
- [ ] Generate payment link — Stripe checkout URL generated
- [ ] Complete a test Stripe payment — redirected to `/payments/success`
- [ ] Verify payment status updated to "completed" (via webhook)
- [ ] **Verify dashboard revenue displays correctly** — after a payment, check `/dashboard` → Total Revenue should show the dollar amount (e.g., `$50.00` not `$0.50` or `$5,000.00`). This confirms the integer-cents migration (0024) is working end-to-end.
- [ ] Send confirmation email — Postmark email received in inbox
- [ ] Send confirmation SMS — Twilio SMS received (if verified number on trial)
- [ ] Audit Logs page — loads, shows recent actions
- [ ] **Feedback widget** — click floating button → submit feedback → verify in `/dashboard/feedback`
- [ ] **Pricing page** — `/pricing` renders with 3 tiers
- [ ] **Health check** — `curl https://YOUR-DOMAIN.up.railway.app/api/health` returns healthy status
- [ ] Logout — redirected to login

**Patient-Facing Flow:**
- [ ] Open booking page `/patient/book/<clinic-id>` — provider list loads
- [ ] Select provider + date → time slots appear
- [ ] Fill patient info, confirm booking — appointment created
- [ ] Open intake form `/patient/intake/<form-id>` — form renders
- [ ] Fill form, type signature, check consent, submit — confirmation shown

**RBAC Verification (optional):**
- [ ] In Supabase, manually add a `staff` record with `role: 'staff'` for same clinic
- [ ] Log in as the staff user
- [ ] Check sidebar — "Audit Logs" link should be **hidden**
- [ ] Manually navigate to `/dashboard/audit-logs` — should redirect to `/dashboard`

### 2.12 Phase 1 Finalization

- [ ] Update `MASTER_PROGRESS.md` — change Phase 1 status to Complete
- [ ] Check off all Phase 1 items in `MASTER_PROGRESS.md`
- [ ] Mark the Phase 1 → 2 gate as met
- [ ] Commit documentation update and push

---

### Phase 1 → Phase 2 Gate

| Criteria | Status |
|----------|--------|
| All features built and tested (**283 tests**, 0 failures) | [x] |
| Module library gaps closed (16+ modules in packages/) | [x] |
| Architecture fixes applied (all 9 gaps resolved) | [x] |
| HIPAA resolved (documented, free-tier non-PHI, BAA-ready) | [x] |
| **Phase 5 code gaps built** (pricing/billing, observability, signup, feedback) | [x] |
| **Security audited** (IDOR patched, auth enforced, email verification required) | [x] |
| Staging smoke test passes | [ ] ← **sole blocker** |

---

## 3. Phase 2 — Platform Layer

> **Goal:** Build Connect API endpoints, generalize all modules, prepare repo for open-source.
> **Code status:** ✅ Complete. These are the manual deploy/verification tasks.

### 3A — Module Generalization & Repo Prep

> Code cleanup is DONE (audit confirmed zero TODO/FIXME/HACK markers). These are verification tasks only.

**Gate Verification:**
- [x] Grep entire `Med Spa App/` for `TODO`, `FIXME`, `HACK`, `XXX` — **CLEAN** (zero markers found)
- [x] Verify no API keys, secrets, or real emails in source files — **CLEAN** (security audit confirmed)
- [ ] Create/update `Med Spa App/.env.example` at repo root with all variables
- [ ] Verify `apps/portal-medspa/.env.local.example` is current and accurate (updated with `STRIPE_PRICE_*`)

**Final Quality Gate:**
- [x] Run `pnpm typecheck` — **17/17 packages pass**
- [x] Run all tests — **283 tests pass, 0 failures**
- [x] Run `pnpm build` — **13/13 builds pass**

### 3B — Connect API Build & Deploy

> Connect API deploys to Railway as a **second service** (not Render/Express — see [Section 10](#10-discrepancies--reconciliation-notes)).

**Database Migration:**
- [ ] Run migration **`0009_credit_packages.sql`** on staging Supabase (via SQL Editor)
- [ ] Run migration **`0010_api_usage.sql`** on staging Supabase
- [ ] Run migration **`0011_fix_package_deduction.sql`** on staging Supabase

**API Key Generation:**
- [ ] Per-clinic API keys are now stored in the `clinic_api_keys` table (migration `0016`). The Connect API authenticates each request by SHA-256 hashing the `x-api-key` header and looking up the hash.
- [ ] To enable Connect API access for a clinic, insert a row: `INSERT INTO clinic_api_keys (clinic_id, key_hash) VALUES ('<clinic-uuid>', '<sha256-of-key>')`. Generate the raw key with `openssl rand -hex 32`, store the raw key in your password manager, and store `echo -n '<raw-key>' | sha256sum | cut -d' ' -f1` as `key_hash`.
- [ ] The **portal no longer proxies through the Connect API** — it calls `@baseplate/core` and `@baseplate/marketplace` functions directly using the session's `clinicId`. The `CONNECT_API_KEY` env var is only needed if you deploy the Connect API for **external integrators** (third-party apps using the SDK).
- [ ] The `CONNECT_API_URL` and `CONNECT_API_KEY` env vars are **no longer required for the portal** (portal-medspa). Only set them on the connect-api Railway service.

**Environment Variables (Local):**
- [ ] Add `CONNECT_API_URL=http://localhost:3001` to portal `.env.local` and Connect API `.env.local`
- [ ] Add `CONNECT_API_KEY=<your-key>` to portal `.env.local` and Connect API `.env.local`

**Connect API Deployment (Railway):**
- [ ] Push code to GitHub
- [ ] Railway → New Project → Deploy from GitHub repo
- [ ] Set **Root Directory** to `Med Spa App/apps/connect-api`
- [ ] Add env vars to Railway service: `CONNECT_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
- [ ] Deploy
- [ ] Test health endpoint: `curl https://connect-api-xxx.up.railway.app/api/health`
- [ ] Test authenticated endpoint: `curl -X POST .../api/v1/reporting/treatment-metrics -H "x-api-key: YOUR_KEY" ...`
- [ ] Update portal's `CONNECT_API_URL` in Railway service variables to production Connect API URL

**Manual End-to-End Testing:**
- [ ] Test SMS reminder endpoint → verify Twilio SMS sent
- [ ] Test package deduction endpoint → verify Supabase record updated
- [ ] Test treatment metrics endpoint → verify report data returned
- [ ] Test churn-prediction endpoint → verify heuristic fallback works (returns risk score + confidence)

### 3C — Hardening

**Upstash Redis Setup (Rate Limiting):**
- [ ] Create account at https://console.upstash.com
- [ ] Create a Redis database (free tier: 10K commands/day)
- [ ] Copy `UPSTASH_REDIS_REST_URL`
- [ ] Copy `UPSTASH_REDIS_REST_TOKEN`
- [ ] Add both to Connect API env vars in Railway
- [ ] Install dependencies in connect-api: `@upstash/redis` + `@upstash/ratelimit`

**Rate Limit Testing:**
- [ ] Send 101 rapid requests to a Connect API endpoint → verify 429 response on the 101st

**Stripe Pricing Products (Create Now — Needed for Phase 5 subscription billing):**
- [ ] Stripe Dashboard → Products → Create: **Connect** — $49/mo recurring
  - Copy the Price ID (`price_xxx`) → this is your `STRIPE_PRICE_CONNECT` env var
- [ ] Stripe Dashboard → Products → Create: **Intelligence** — $99/mo recurring (add-on)
  - Copy the Price ID (`price_xxx`) → this is your `STRIPE_PRICE_INTELLIGENCE` env var
- [ ] Add `STRIPE_PRICE_CONNECT` and `STRIPE_PRICE_INTELLIGENCE` to portal `.env.local` and Railway service variables
- [ ] **Do NOT** activate public billing yet — just create the products

**Load Testing:**
- [ ] Load test all 3 Connect API endpoints — send 100 concurrent requests each (Apache Bench or Node script)
- [ ] Verify p95 < 2s and 0% error rate
- [ ] Document load test results

### 3D — Cross-Vertical Validation

> Code is built. `apps/portal-homeservices/` exists with 13 routes and `apps/test-home-services/` validates cross-vertical usage.

- [x] Create minimal test app at `apps/test-home-services/`
- [x] Verify `@baseplate/core` (auth, RBAC, scheduling) works without med-spa context
- [x] Verify `@baseplate/patterns` (FormBuilder) with non-medical fields
- [x] Verify `@baseplate/ui` (Button, Form, Table)
- [ ] Document what worked and what needed config changes (do this during deploy)

---

### Phase 2 → Phase 3 Gate

| Criteria | Status |
|----------|--------|
| Connect API deployed and all endpoints functional | [ ] |
| All modules generalized (vertical-agnostic, <5% modification) | [x] |
| Rate limiting active and tested | [ ] |
| API usage logging working | [ ] |
| **Stripe subscription products created** (`STRIPE_PRICE_CONNECT`, `STRIPE_PRICE_INTELLIGENCE`) | [ ] |
| Cross-vertical test app passes | [x] |
| Repo open-source ready | [x] |

---

## 4. Phase 3 — Intelligence & Ecosystem

> **Code status:** ✅ Complete. All built and tested.
> **Manual tasks:** Seed data, test intelligence endpoints, deploy home services portal.

### 4A — Intelligence Layer

- [x] Build rules-based risk scoring (6 rules: no-show, churn, revenue drop, package abandonment, inventory expiry, follow-up gap)
- [x] Risk-score API endpoint returns explainable recommendations
- [ ] Seed synthetic test data (10-20 test tenants, 100-200 test payments, edge cases)
  - Migration `0012_intelligence_seed.sql` handles this — run it on staging
- [ ] Create a test tenant with various payment scenarios to locally test risk-score endpoint
- [ ] Test all risk flags against synthetic data
- [ ] Verify risk-score API endpoint returns explainable recommendations against seeded data

### 4B — Second Vertical Portal (Home Services)

- [x] `apps/portal-homeservices/` built with 13 routes
- [x] Domain language updated ("patients" → "customers", "treatments" → "services")
- [x] RBAC factory built (`createRBAC()` for configurable roles)
- [ ] Connect second vertical portal to Stripe/Postmark/Supabase for testing
- [ ] Deploy to Railway staging
- [ ] Verify portal works end-to-end with synthetic data

### 4C — ML Infrastructure Scaffolding

- [x] `ml-models/` directory with notebooks, training scripts, model storage, `requirements.txt`
- [x] Churn prediction model infrastructure built
- [x] LTV prediction model infrastructure built
- [x] Anomaly detection infrastructure built
- [x] Demand forecasting infrastructure built
- [x] Connect API churn-prediction endpoint built (heuristic fallback)
- [ ] Update Intelligence pricing tier in Stripe products ($199-499/mo for ML tier vs $99-199/mo rules-based)

---

### Phase 3 → Phase 4 Gate

| Criteria | Status |
|----------|--------|
| Rules-based intelligence engine built and tested | [x] (code) / [ ] (needs synthetic data test) |
| Marketplace framework built | [x] |
| MCP server built (11 tools, modularized) | [x] |
| ML infrastructure scaffolded (not trained) | [x] |
| Home services portal built (13 routes) | [x] |
| `@baseplate/core` proven reusable (<5% modification) | [x] |

---

## 5. Phase 4 — Open-Source Launch

> **Code status:** ✅ Complete + gap fixes applied + security audited.
> **Manual tasks:** GitHub push, marketing, MCP testing.

### 5A — Marketplace Infrastructure

- [x] Marketplace DB tables built (migration `0013_marketplace.sql`)
- [x] `docs/MARKETPLACE_SPEC.md` created
- [x] Marketplace UI in portal (browse, search, install, uninstall)
- [ ] Run migration `0013_marketplace.sql` on staging Supabase
- [ ] Set up `modules@baseplate.dev` (or similar) email inbox for module submissions
- [ ] *(Deferred)* Configure Stripe Connect for developer payouts

### 5B — MCP Server Publishing

- [x] MCP server built with 11 tools (modularized into 8 domain files)
- [x] `MCP_SERVER.md` documentation created
- [ ] Test MCP server with Claude — prompt "Build me a med spa portal" and verify it scaffolds correctly
- [ ] Test MCP server with Cursor
- [ ] Publish MCP server to an MCP registry
- [ ] Update GitHub README to mention the Baseplate MCP server

### 5C — Open-Source Launch (GitHub + Marketing)

**Publishing:**
- [ ] **Replace `<PUBLIC_REPO_URL>` placeholder** in 3 files (package.json ×2 + README.md)
- [ ] **Publish the complete platform repo to GitHub** as open-source (MIT license)
- [ ] Create GitHub Release with tag `v0.1.0`
- [ ] Configure repo: topics (`saas`, `monorepo`, `mcp`, `vertical-saas`, `nextjs`, `supabase`), description, homepage URL

**Marketing / Community:**
- [ ] Post "Show HN: Baseplate MCP Server" to Hacker News — file: `docs/marketing/hn-post.md`
- [ ] Post Twitter/X thread — file: `docs/marketing/twitter-thread.md`
- [ ] Post to Reddit r/webdev (Day 1), r/SaaS (Day 2), r/Entrepreneur (Day 3) — file: `docs/marketing/reddit-posts.md`
- [ ] Send dev outreach emails — file: `docs/marketing/dev-outreach-emails.md`

**Developer Recruitment:**
- [ ] Recruit 2-3 initial marketplace developers
- [ ] Review submitted module code for security and usability
- [ ] Publish first marketplace modules (e.g., "SMS Reminders", "Calendar Sync")

### 5D — Third Vertical Scaffold (Optional — Phase 6+)

- [ ] Select and scaffold Vertical #3 (candidates: Real Estate Brokerages, Accounting Firms)

---

### Phase 4 → Phase 5 Gate

| Criteria | Status |
|----------|--------|
| Repo published to GitHub (open-source) | [ ] |
| All docs complete and accurate | [x] |
| MCP server published to registry | [ ] |
| Marketplace framework live (code built) | [x] |
| **Phase 5 code gaps built** (pricing, billing, observability, signup, feedback) | [x] |
| **Security audited and patched** | [x] |

---

## 6. Phase 5 — Customer Onboarding

> **This is the first customer-facing phase.** Production deploy, pilot recruitment, onboarding, feedback, revenue.
> **Code status:** ✅ ALL code gaps built (pricing/billing, observability, self-service signup, feedback widget).
> **Security:** ✅ Audited and patched (IDOR holes fixed, session auth enforced on all APIs).
> Heavy manual configuration: Stripe live mode, Supabase Pro, Twilio paid, HIPAA compliance, DNS/domain.

### 6A — Production Deploy (Infrastructure Switch)

#### Stripe — Switch to Live Mode

- [ ] Stripe Dashboard → exit Test Mode (toggle top right)
- [ ] Copy **live secret key** (`sk_live_...`) → update `STRIPE_SECRET_KEY` in Railway
- [ ] Stripe Dashboard → Developers → Webhooks → update endpoint URL to production domain
  - **Ensure all 7 events are registered** (see Section 2.6 for full list including `charge.refunded` + subscription events)
- [ ] Copy **live webhook signing secret** → update `STRIPE_WEBHOOK_SECRET` in Railway
- [ ] Verify Stripe Products exist for subscription tiers (created in Phase 2C):
  - **Connect** ($49/mo) → Price ID = `STRIPE_PRICE_CONNECT`
  - **Intelligence** ($99/mo add-on) → Price ID = `STRIPE_PRICE_INTELLIGENCE`
- [ ] Test a live payment — process a $1 test charge, verify webhook fires correctly

#### Supabase — Upgrade to Pro + Production Config

- [ ] Upgrade to **Pro tier** ($25/month) via Dashboard → Project Settings → Billing
- [ ] Set **Site URL** to production domain (Authentication → Settings)
- [ ] Add production domain to **Redirect URLs** (Authentication → Settings)
- [ ] **Re-enable email confirmation** (Authentication → Settings → Confirm email → ON)
  - Safe now — the signup API requires email verification (`email_confirm: false` in code)
- [ ] Verify automated backups enabled (Dashboard → Database → Backups)

#### Twilio — Upgrade from Trial

- [ ] Twilio Console → Billing → add a payment method
- [ ] Upgrade to a **paid account** (removes trial restrictions)
- [ ] Verify Twilio phone number works for outbound SMS to pilot clinic numbers
- [ ] Send a test SMS to a real phone number to confirm

#### Postmark — Verify Production Domain

- [ ] Postmark → Domains → ensure **DKIM DNS records** are verified (green)
- [ ] Ensure **Return-Path DNS records** are verified
- [ ] Update `POSTMARK_FROM_EMAIL` to production domain (e.g., `noreply@yourdomain.com`)
- [ ] Test sending an email through the production app → confirm receipt

#### Railway — Production Config

- [ ] Update ALL environment variables to production values (Railway → Service → Variables):
  - `NEXT_PUBLIC_APP_URL` → production domain
  - `STRIPE_SECRET_KEY` → live key
  - `STRIPE_WEBHOOK_SECRET` → live signing secret
  - `STRIPE_PRICE_CONNECT` → live Price ID (from Stripe products)
  - `STRIPE_PRICE_INTELLIGENCE` → live Price ID (from Stripe products)
  - `POSTMARK_FROM_EMAIL` → production domain email
- [ ] Redeploy (Railway → Service → Settings → Redeploy)
- [ ] Verify app loads at production URL without errors

#### DNS / Domain Configuration

- [ ] Configure production domain DNS — add a CNAME record pointing to your Railway service (per Railway custom-domain settings)
- [ ] Verify DKIM DNS records for Postmark email domain authentication
- [ ] Verify Return-Path DNS records for Postmark
- [ ] Verify SSL certificate is active (Railway provides automatic HTTPS/TLS)

#### Production Smoke Test (15 steps)

- [ ] **Step 1:** Go to production URL — verify landing/login page loads
- [ ] **Step 2:** Sign up a new clinic — verify clinic + owner account created
- [ ] **Step 3:** Log in — verify dashboard loads
- [ ] **Step 4:** Add a provider + room — verify saved successfully
- [ ] **Step 5:** Add a patient — verify saved successfully
- [ ] **Step 6:** Create an appointment — verify appointment appears
- [ ] **Step 7:** Generate payment link — verify Stripe checkout URL created (LIVE)
- [ ] **Step 8:** Complete a real payment ($1 test) — verify payment processed and status updated via webhook
- [ ] **Step 9:** Check email notification — verify Postmark email received
- [ ] **Step 10:** Check SMS notification — verify Twilio SMS received
- [ ] **Step 11:** Submit an intake form — verify saved with e-signature
- [ ] **Step 12:** Check audit logs — verify recent actions logged
- [ ] **Step 13:** Submit feedback via widget — verify it saves and appears in `/dashboard/feedback`
- [ ] **Step 14:** Verify `/pricing` page renders with 3 tiers
- [ ] **Step 15:** Verify `/api/health` returns healthy status

---

### 6B — HIPAA Compliance Activation

> **Required before any real patient data (PHI) is stored.**

#### BAAs & Legal Agreements

- [ ] **Sign Supabase BAA** — available at https://supabase.com/docs/guides/security/hipaa
  - Requires Supabase Pro tier (Section 6A). Supabase (with BAA) is where PHI can live at rest.
- [ ] ⚠️ **Railway does NOT offer a HIPAA BAA** (no tier does). Railway is acceptable for **dev / staging / early production with NO real PHI**. Before any real Protected Health Information is stored or processed by the app host, **migrate the portal + Connect API to a HIPAA-eligible host with a signed BAA** (AWS, GCP, or Azure). A DPA is GDPR, not HIPAA — it does not satisfy the BAA requirement. See [Section 7.9](#79-legal--compliance-agreements-tracker) for the migration path.

#### Encryption Activation

- [ ] Set `PHI_ENABLED=true` in environment variables (Railway + Supabase)
- [ ] Generate encryption keys via the `generateKey()` function (TweetNaCl module)
- [ ] **Set up AWS KMS** (or equivalent key management service) for production encryption key storage
- [ ] Store encryption keys securely in AWS KMS

#### Audit & Backup

- [ ] Set up a PostgreSQL scheduled job to enforce 6-year audit log retention policy
- [ ] Verify Supabase daily backups + 7-day Point-in-Time Recovery (PITR) is active (Pro plan)

#### Deferred HIPAA Items (Before Scaling Beyond Pilots)

- [ ] Conduct penetration testing
- [ ] Obtain formal HIPAA compliance certification (formal audit)
- [ ] Conduct disaster recovery testing (backup restore verification)
- [ ] Document breach notification procedure (incident response plan)

---

### 6C — Pilot Recruitment (Cold Outreach)

> Detailed leads and templates: `Phase & Build Docs/Phase 5 - Customer Onboarding/COLD_OUTREACH_PLAYBOOK.md` + `PILOT_LEADS_AND_TEMPLATES.md`
> 50+ verified leads across Canada (15+) and USA (35+) already identified.

#### Lead Tracking Setup

- [ ] Set up a lead tracking system (Google Sheets, Notion, or HubSpot Free CRM)
- [ ] Import 50+ leads from `PILOT_LEADS_AND_TEMPLATES.md`
- [ ] Segment by region, owner type, clinic size, specialty
- [ ] Select 15-20 warmest prospects for first batch
- [ ] *(Optional)* Purchase lead database — Orbital (~$500-2K, 42K+ operators), RenTech Digital, Scrap.io (62K+), or Provyx

#### Outreach Channel Accounts Setup

- [ ] Set up dedicated **business email** for cold outreach (10-15 emails/day)
- [ ] Set up/prepare **LinkedIn** account for connection requests (10-15/day)
- [ ] Set up **Instagram** account for engaging with med spa content + DMs (5-10/day)
- [ ] Set up **Facebook** account for engaging with clinic pages + DMs
- [ ] Set up **business phone line** for cold calls (10-15/day) and SMS follow-ups (TCPA compliance — use business number, not personal)
- [ ] Create a **Loom demo video** (3-5 minute screen recording)
- [ ] Create a **1-page HIPAA compliance checklist PDF** as a lead magnet

#### Outreach Execution

- [ ] Send initial cold emails to first batch of 5-7 clinics
- [ ] Send LinkedIn connection requests with personalized 300-char messages
- [ ] Engage on Instagram (like 3 posts, 1 genuine comment per target) before DMing
- [ ] Make cold calls following the call script (60-sec open, pain probe, value pitch, book demo)
- [ ] Send SMS follow-ups (only to publicly listed business numbers, with STOP opt-out language for TCPA)
- [ ] Conduct 15-minute discovery calls with interested clinics
- [ ] Send pilot confirmation emails (terms: free through Month 6, biweekly feedback calls, setup handled by you)
- [ ] **Secure firm commitments from 3+ clinics** (verbal or written)

**Expected conversion:** 60-150 cold leads → 3 pilots (2-5% close rate)

---

### 6D — Per-Clinic Onboarding (4-Touch Sequence)

> Repeat this entire section for EACH pilot clinic.

#### Touch 1: Kickoff Call (30-45 min)

- [ ] Create clinic account via production signup (provide owner credentials)
- [ ] Configure clinic settings (name, location, services offered)
- [ ] Add each provider (name, role, specialty)
- [ ] Set up provider schedule templates (working hours, lunch breaks)
- [ ] Add each treatment room/space
- [ ] Send follow-up email with login URL and quick-start summary

#### Touch 2: Data Setup Call (30-45 min)

- [ ] Set up service catalog (treatment types, durations, pricing, categories)
- [ ] Map services to providers (who can perform what)
- [ ] Manually add 10-20 existing patients (or bulk import) — minimum: first name, last name, email, phone
- [ ] Configure intake forms — review default fields, add/remove per clinic needs
- [ ] Add clinic-specific consent text (HIPAA acknowledgment, treatment consent)
- [ ] Test intake form end-to-end (fill as test patient, submit, verify save)
- [ ] Confirm Stripe payment link generation works for the clinic

#### Touch 3: Patient Flow Walkthrough (30-45 min)

- [ ] Walk through full patient journey in real-time: booking → notification → intake → check-in → payment → follow-up
- [ ] Process a live payment ($1 test or real)
- [ ] Verify webhook updates payment status in real-time
- [ ] Identify and log any workflow gaps or clinic-specific adjustments needed

#### Touch 4: Week 2 Check-in (20-30 min)

- [ ] Review usage data (appointments, intakes, payments since Touch 3)
- [ ] Review error logs from the clinic's account
- [ ] Address friction points and confusion
- [ ] Confirm biweekly feedback call schedule

#### Staff Training (Per Clinic)

- [ ] Create staff accounts for each team member (role-appropriate: owner or staff)
- [ ] Conduct a 15-20 minute group training session for all staff
- [ ] Create and distribute a 1-page quick-reference cheat sheet (login URL, daily tasks, support contact)
- [ ] Identify a "portal champion" at each clinic (go-to person for questions)
- [ ] Provide the portal champion with your direct contact info (email + phone)

#### Baseline Metrics Recording (Per Clinic)

Record these BEFORE the clinic starts using the portal for real patients:

- [ ] No-show rate (current %)
- [ ] Intake completion rate
- [ ] Avg time to collect payment
- [ ] Booking method (phone, walk-in, online)
- [ ] Reminder method (phone, email, SMS, none)
- [ ] Admin hours/day on scheduling/intake
- [ ] Current software costs
- [ ] Clinic size (number of providers, rooms, patients/month)

> Track improvement at each biweekly feedback call (Week 2, 4, 6, 8, Month 3, Month 6).

---

### 6E — Feedback Infrastructure

> **In-app feedback widget is built.** The floating button appears on all dashboard pages. Below is the manual process layer.

#### Tracking Setup

- [ ] Set up a feedback log (spreadsheet: ID, Date, Clinic, Category, Feedback, Priority, Status, Resolution, Action Date)
- [ ] Set up async feedback channel per pilot (Option A: Shared Google Doc; Option B: Email thread; Option C: Slack/WhatsApp group)
- [ ] Establish a "close-the-loop" process (notify pilot for every resolved item → mark Verified → mark Closed)
- [ ] Monitor in-app feedback submissions via `/dashboard/feedback` page

#### Feedback Cadence (Recurring)

- [ ] **Week 2:** Initial check-in call (20-30 min)
- [ ] **Biweekly (Weeks 4, 6, 8...):** Structured feedback call (20-30 min each)
- [ ] **Month 3:** Deep-dive review (45-60 min) — full metrics comparison, pain-point audit, testimonial check, conversion preview
- [ ] **Month 6:** Pilot review and conversion conversation (45-60 min) — present metrics, request case study + testimonial, discuss pricing, request referrals

---

### 6F — ML Model Training

> **Prerequisite:** 3+ clinics actively using the portal for 4-6 weeks of real data minimum. 50+ clinics recommended for best accuracy.
> **Code is scaffolded.** This is where you train real models.

- [ ] Collect training data from pilot usage (appointments, no-shows, payments, patient behavior)
- [ ] Update `ml-models/src/features.py` — add Supabase data fetcher for real data
- [ ] Train churn prediction model on real pilot data
- [ ] Train LTV (lifetime value) model on real pilot data
- [ ] Train demand forecasting model on real pilot data
- [ ] Validate model accuracy against pilot data
- [ ] Deploy FastAPI serve endpoint (Railway / Fly.io) — set `ML_SERVER_URL` env var on Connect API
- [ ] Update Connect API churn-prediction endpoint to call ML serve (currently uses heuristic fallback)
- [ ] Surface ML insights in pilot dashboards
- [ ] Collect feedback on ML insight usefulness from pilot clinics

---

### 6G — Revenue Conversion

#### Stripe Configuration

> **Pricing page and self-service signup are BUILT.** Only Stripe product config remains.

- [x] Pricing page built at `/pricing` (3-tier comparison cards)
- [x] Self-service signup flow built (`/api/auth/signup-enhanced`)
- [x] Subscription checkout API built (`/api/subscriptions/create`)
- [x] Billing portal API built (`/api/subscriptions/portal`)
- [x] Webhook handles subscription lifecycle events
- [x] Billing settings page built (`/dashboard/settings/billing`)
- [ ] Configure Stripe subscription products in production: Connect ($49-99/mo) + Intelligence add-on ($99-199/mo)
- [ ] Set up Stripe subscriptions for each converted pilot clinic
- [ ] Set up billing automation — invoice generation, payment retry logic, dunning emails

#### Conversion Conversations (Month 4-5 per pilot)

- [ ] Schedule and conduct conversion conversations with each pilot owner
- [ ] Present metrics — time saved, no-show reduction, payment speed improvement
- [ ] Offer early-adopter discount (e.g., 20% off first year for pilot clinics)
- [ ] Secure commitment or graceful exit

#### Second Outreach Round

- [ ] Update outreach materials with pilot testimonials and real metrics
- [ ] Launch second cold outreach round targeting 20-30 new clinics
- [ ] Target 5-7 new paying customers from the second round
- [ ] Collect 1+ written or video case study from pilot data (baseline → improvement metrics)
- [ ] Collect 1+ testimonial (written or video) from a satisfied pilot

---

### Phase 5 → Phase 6+ Gate

| Criteria | Status |
|----------|--------|
| 3+ pilots onboarded | [ ] |
| 2+ pilots using weekly without hand-holding | [ ] |
| No critical bugs blocking daily usage | [ ] |
| Intake completion rate >80% | [ ] |
| Payment webhook success ~100% | [ ] |
| $500+ MRR from converted pilots | [ ] |
| ML models trained on real data | [ ] |
| Clear feature roadmap from real feedback | [ ] |
| 1+ case study written | [ ] |
| 1+ testimonial collected | [ ] |
| Pricing page live with self-service signup | [x] (code) / [ ] (deployed) |

---

## 7. Cross-Phase Service Reference

> When you're in a specific dashboard, check here for every task for that service across all phases.

### 7.1 All Stripe Tasks

| Phase | Task | Status |
|-------|------|--------|
| 1 | Create account, switch to Test Mode | [x] |
| 1 | Copy test secret key → `STRIPE_SECRET_KEY` | [x] |
| 1 | Set up Stripe CLI for local webhook testing → `STRIPE_WEBHOOK_SECRET` | [ ] |
| 1 | Register webhook endpoint with **7 events** (3 payment + 1 refund + 3 subscription) | [ ] |
| 2C | Create pricing products: Connect ($49/mo) → `STRIPE_PRICE_CONNECT` | [ ] |
| 2C | Create pricing products: Intelligence ($99/mo) → `STRIPE_PRICE_INTELLIGENCE` | [ ] |
| 5A | Switch to Live Mode | [ ] |
| 5A | Copy live secret key → update Railway `STRIPE_SECRET_KEY` | [ ] |
| 5A | Update webhook endpoint to production domain (all 7 events) | [ ] |
| 5A | Copy live webhook signing secret → update Railway | [ ] |
| 5A | Test live $1 payment, verify webhook fires | [ ] |
| 5G | Set up subscriptions for converted pilot clinics | [ ] |
| 5G | Set up billing automation (invoices, retries, dunning) | [ ] |
| 4A | *(Deferred)* Configure Stripe Connect for marketplace developer payouts | [ ] |

### 7.2 All Supabase Tasks

| Phase | Task | Status |
|-------|------|--------|
| 1 | Create project (`medspa-portal-staging`, US East, Free tier) | [x] |
| 1 | Copy Project URL, anon/publishable key, service_role key | [~] URL + publishable key done; **secret key still needed** |
| 1 | Run migrations **0001-0008** (Phase 1 core, in order) | [x] |
| 1 | Enable Email auth provider | [ ] |
| 1 | Set Site URL + Redirect URLs | [ ] |
| 1 | **CRITICAL:** Disable email confirmation (for Phase 1) | [ ] |
| 1 | Enable daily backups | [ ] |
| 1 (post-deploy) | Update Site URL + Redirect URLs to Railway domain | [ ] |
| 2B | Run migrations **0009, 0010, 0011** (Connect API + packages + fixes) | [x] |
| 3A | Run migration **0012** (intelligence seed data) | [x] |
| 4A | Run migration **0013** (marketplace tables) | [x] |
| **5** | Run migrations **0014, 0015** (subscriptions + feedback tables) | [x] |
| **Sec** | Run migrations **0016-0023** (per-clinic API keys, payments table, webhook idempotency, RLS fixes, patient unique, room exclusion, ON DELETE, package expiry) | [x] |
| **Sec** | Run migrations **0024-0027** (money→cents, is_synthetic seed column, ~~dashboard RPC~~, performance indexes) | [x] |
| **Fix** | **Apply migrations 0028 + 0029** (critical fixes: package-deduction `updated_at` column; plain email unique index) | **[ ] ⚠️** |
| 5A | Upgrade to **Pro tier** ($25/mo) | [ ] |
| 5A | Set Site URL to production domain | [ ] |
| 5A | Add production domain to Redirect URLs | [ ] |
| 5A | **Re-enable email confirmation** | [ ] |
| 5A | Verify automated backups + PITR active | [ ] |
| 5B | Sign **BAA** (requires Pro tier) | [ ] |
| 5B | Set up scheduled job for 6-year audit log retention | [ ] |

### 7.3 All Railway Tasks

| Phase | Task | Status |
|-------|------|--------|
| 1 | Create project, set Root Directory to `apps/portal-medspa` | [ ] |
| 1 | Add service variables (see Section 8) | [ ] |
| 1 | Deploy portal | [ ] |
| 1 (post-deploy) | Update `STRIPE_WEBHOOK_SECRET` → redeploy | [ ] |
| 2B | Create second Railway service for Connect API, set Root Directory to `apps/connect-api` | [ ] |
| 2B | Add Connect API service variables | [ ] |
| 2B | Deploy Connect API | [ ] |
| 2B | Update portal's `CONNECT_API_URL` to production Connect API URL | [ ] |
| 3B | Deploy home services portal to staging | [ ] |
| 5A | Update ALL service variables to production values (including `STRIPE_PRICE_*`) | [ ] |
| 5A | Redeploy | [ ] |
| 5B | ⚠️ No HIPAA BAA available on Railway — migrate to AWS/GCP/Azure (with BAA) before processing PHI | [ ] |

### 7.4 All Postmark Tasks

| Phase | Task | Status |
|-------|------|--------|
| 1 | Create account + create Server | [ ] |
| 1 | Copy Server API token → `POSTMARK_API_TOKEN` | [ ] |
| 1 | Verify sender identity (Sender Signature OR Domain Authentication) | [ ] |
| 1 | Set verified sender email → `POSTMARK_FROM_EMAIL` | [ ] |
| 5A | Verify DKIM DNS records are green | [ ] |
| 5A | Verify Return-Path DNS records | [ ] |
| 5A | Update `POSTMARK_FROM_EMAIL` to production domain | [ ] |
| 5A | Test email through production app | [ ] |

### 7.5 All Twilio Tasks

| Phase | Task | Status |
|-------|------|--------|
| 1 | Create account, complete setup wizard, verify your phone | [x] |
| 1 | Copy Account SID → `TWILIO_ACCOUNT_SID` | [x] |
| 1 | Copy Auth Token → `TWILIO_AUTH_TOKEN` | [x] |
| 1 | Buy SMS-capable phone number → `TWILIO_PHONE_NUMBER` | **[ ] MISSING** |
| 1 | Add pilot/test phone numbers to Verified Caller IDs (trial only) | [ ] |
| 5A | Add payment method | [ ] |
| 5A | Upgrade to paid account | [ ] |
| 5A | Verify number works for outbound SMS to pilot clinics | [ ] |
| 5A | Send test SMS to a real phone number | [ ] |

### 7.6 New Accounts Needed (By Phase)

| Service | Phase | Purpose | Account Created |
|---------|-------|---------|-----------------|
| Upstash | 2C | Rate limiting (Redis) | [ ] |
| npm | 4C | Publish SDKs (`@baseplate/*`) | [ ] |
| MCP Registry | 4B | Publish MCP server for AI tool discovery | [ ] |
| AWS (KMS) | 5B | Production encryption key management | [ ] |
| Loom | 5C | Demo video for outreach | [ ] |
| CRM (HubSpot/Notion/Sheets) | 5C | Lead tracking | [ ] |
| Lead database (Orbital, etc.) | 5C | *(Optional)* Expanded lead sourcing | [ ] |

### 7.7 Webhook Endpoints Registry

| Webhook | Service | URL | Events | Phase | Configured |
|---------|---------|-----|--------|-------|------------|
| Stripe (payment + subscription) | Stripe → Portal | `https://YOUR-DOMAIN/api/webhooks/stripe` | `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted` | 1 (staging) / 5A (prod) | [ ] |

### 7.8 DNS / Domain Task Registry

| Task | Provider | Phase | Done |
|------|----------|-------|------|
| Postmark DKIM record | DNS provider → Postmark | 1 / 5A | [ ] |
| Postmark Return-Path record | DNS provider → Postmark | 1 / 5A | [ ] |
| Production domain → Railway (CNAME) | DNS provider → Railway | 5A | [ ] |
| SSL certificate (automatic via Railway) | Railway | 5A | [ ] |
| Supabase Site URL → production domain | Supabase dashboard | 5A | [ ] |
| Supabase Redirect URLs → production domain | Supabase dashboard | 5A | [ ] |

### 7.9 Legal / Compliance Agreements Tracker

| Agreement | Provider | Phase | Required Before | Signed |
|-----------|----------|-------|-----------------|--------|
| BAA (Business Associate Agreement) | Supabase | 5B | Any real PHI stored | [ ] |
| BAA (app host — AWS/GCP/Azure) | AWS/GCP/Azure | 5B | Any real PHI processed on the app host | [ ] |
| Pilot Agreement (informal email) | Each pilot clinic | 5C | Pilot onboarding begins | [ ] |

> ⚠️ **Railway does not offer a HIPAA BAA.** Keep PHI out of the app host (Railway) until you migrate to a BAA-signed provider (AWS/GCP/Azure). Supabase (with BAA) can hold PHI at rest; the portal/Connect API on Railway should be treated as a no-PHI tier until migrated.

### 7.10 Billing Upgrade Timeline

| Service | Current | Target | Phase | Cost | Upgraded |
|---------|---------|--------|-------|------|----------|
| Supabase | Free | Pro | 5A | $25/mo | [ ] |
| Stripe | Test Mode | Live Mode | 5A | Per-transaction | [ ] |
| Twilio | Trial | Paid | 5A | Per-usage | [ ] |
| Railway | Hobby (~$5/mo + usage) | Migrate app host to AWS/GCP/Azure (BAA) when PHI needed | 5B | ~$5+/mo | [ ] |
| Postmark | Developer | Standard (if volume) | 5A+ | $15+/mo | [ ] |

---

## 8. Environment Variables Master List

> Complete list of every environment variable across all phases.
> Local: `apps/portal-medspa/.env.local` | Deployed: Railway → Service → Variables

### Phase 1 — Portal (Required)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_APP_URL` | Public app URL (Stripe redirects) | `http://localhost:3000` | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL (browser/middleware) | `https://xxx.supabase.co` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser/middleware) | `eyJhbG...` | Yes |
| `SUPABASE_URL` | Supabase URL (server, fallback) | Same as above | Yes |
| `SUPABASE_ANON_KEY` | Supabase anon key (server, fallback) | Same as above | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-only, bypasses RLS) | `eyJhbG...` | Yes |
| `STRIPE_SECRET_KEY` | Stripe API key (test: `sk_test_...`, live: `sk_live_...`) | `sk_test_...` | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `whsec_...` | Yes |
| `POSTMARK_API_TOKEN` | Postmark Server API token | `xxxxxxxx-xxxx-...` | Yes |
| `POSTMARK_FROM_EMAIL` | Verified sender email | `noreply@yourdomain.com` | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | `AC...` | Yes |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | `xxxxxxxx` | Yes |
| `TWILIO_PHONE_NUMBER` | Twilio SMS number (E.164) | `+15125551234` | Yes |

### Phase 1 — Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `STRIPE_SUCCESS_URL` | Stripe success redirect | `${NEXT_PUBLIC_APP_URL}/payments/success` |
| `STRIPE_CANCEL_URL` | Stripe cancel redirect | `${NEXT_PUBLIC_APP_URL}/payments/cancelled` |
| `PHI_ENABLED` | Enable PHI field encryption | `false` (keep false until BAA signed) |

### Phase 2 — Connect API (Additional)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `CONNECT_API_URL` | Connect API base URL (external integrators only — portal calls core directly) | `http://localhost:3001` | External only |
| `CONNECT_API_KEY` | Shared API key (legacy — per-clinic keys now used via `clinic_api_keys` table) | `(random hex string)` | External only |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL (rate limiting) | `https://xxx.upstash.io` | Phase 2C |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis auth token | `AX...` | Phase 2C |
| `RATE_LIMIT_FAIL_OPEN` | Dev/staging escape hatch — lets the Connect API respond when Upstash is unprovisioned (returns 200 instead of 500). **Leave unset in production** (rate limiting fails closed there). | `true` | Dev/staging until Upstash provisioned |
| `SMS_DAILY_LIMIT_PER_CLINIC` | Per-clinic daily SMS volume cap (prevents SMS-pumping / toll fraud via one key). | `50` | No (defaults to 50) |
| `CONNECT_INTAKE_URL_ALLOWLIST` | Comma-separated hosts permitted in SMS `intake_url` (anti-phishing). Unset = allow any URL (with a prod warning). | `intake.yourapp.com,yourapp.com` | Recommended in prod |

### Phase 5 — Subscription Billing (NEW)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `STRIPE_PRICE_CONNECT` | Stripe Price ID for Connect subscription plan | `price_1QxX...` | Yes (for billing) |
| `STRIPE_PRICE_INTELLIGENCE` | Stripe Price ID for Intelligence add-on | `price_1QxY...` | Yes (for billing) |

### Phase 5 — Production Updates

| Variable | Change |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | → Production domain |
| `STRIPE_SECRET_KEY` | → Live key (`sk_live_...`) |
| `STRIPE_WEBHOOK_SECRET` | → Live webhook signing secret |
| `STRIPE_PRICE_CONNECT` | → Live Price ID from Stripe product |
| `STRIPE_PRICE_INTELLIGENCE` | → Live Price ID from Stripe product |
| `POSTMARK_FROM_EMAIL` | → Production domain email |
| `PHI_ENABLED` | → `true` (after BAA signed) |

### Phase 5 — ML Serving (Deferred — after pilot data)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `ML_SERVER_URL` | FastAPI ML serve endpoint URL | `https://ml-serve.fly.dev` | Phase 5F only |

---

## 9. Migration Tracker

> Run via Supabase Dashboard → SQL Editor or `supabase db push` CLI.
> **Migrations 0001–0027 have been applied** via `supabase db push` (project ref: `xahvcetvyypjduqfcqfq`).
> **⚠️ Migrations 0028 + 0029 are NEW and NOT YET APPLIED** — they fix two silent, production-breaking bugs (see §2.3). Run `supabase db push` to apply.
> **`0026_dashboard_metrics_rpc.sql` was DELETED** — it was dead code (the RPC had zero callers; reporting now reads the `payments` ledger directly).
> 5 migration files were fixed for PostgreSQL/Supabase compatibility during deployment (see Section 10.11). **⚠️ These 5 fixes are applied to the remote DB but NOT committed to git — commit them so a fresh clone reproduces the deployed schema.**

| # | File | What It Creates | Phase | Run |
|---|------|-----------------|-------|-----|
| 0001 | `0001_init_clinics.sql` | `clinics`, `staff`, `patients`, `audit_logs` + indexes | 1 | [x] |
| 0002 | `0002_rls_policies.sql` | RLS on all 4 tables + access policies | 1 | [x] |
| 0003 | `0003_intake_forms.sql` | `intake_forms`, `intake_submissions` + RLS | 1 | [x] |
| 0004 | `0004_scheduling.sql` | `providers`, `rooms`, `appointments` + GIST constraint + RLS | 1 | [x] *(fixed: immutable expr)* |
| 0005 | `0005_payments.sql` | Payment columns on `appointments` | 1 | [x] |
| 0006 | `0006_rename_treatment_to_service.sql` | `treatment_type` → `service_type` | 1 | [x] *(fixed: idempotent guard)* |
| 0007 | `0007_tighten_rls_policies.sql` | Removes overly permissive policies | 1 | [x] |
| 0008 | `0008_staff_insert_policy.sql` | INSERT policy on `staff` for signup | 1 | [x] |
| 0009 | `0009_credit_packages.sql` | `credit_packages`, `package_transactions` + RLS | 2B | [x] |
| 0010 | `0010_api_usage.sql` | `api_usage` table for metering | 2C | [x] |
| 0011 | `0011_fix_package_deduction.sql` | Fixes atomic deduction RPC | 2B | [x] |
| 0012 | `0012_intelligence_seed.sql` | Synthetic test data for risk scoring | 3A | [x] *(fixed: auth.users FK, UUIDs, payments conditional)* |
| 0013 | `0013_marketplace.sql` | `modules`, `installed_modules`, `module_subscriptions` | 4A | [x] |
| **0014** | **`0014_subscriptions.sql`** | **`subscriptions` table + RLS (Phase 5 billing)** | **5** | [x] |
| **0015** | **`0015_feedback.sql`** | **`feedback` table + RLS (Phase 5 feedback widget)** | **5** | [x] |
| 0016 | `0016_api_keys.sql` | `clinic_api_keys` table (per-clinic hashed API keys) | Sec | [x] |
| 0017 | `0017_payments_table.sql` | `payments` table (standalone payment records) | Sec | [x] |
| 0018 | `0018_stripe_events.sql` | `processed_stripe_events` table (webhook idempotency) | Sec | [x] |
| 0019 | `0019_fix_rls_identity.sql` | Fixes RLS identity drift on subscriptions + feedback | Sec | [x] |
| 0020 | `0020_patient_unique_email.sql` | Unique constraint patients(clinic_id, lower(email)) | Sec | [x] |
| 0021 | `0021_room_exclusion.sql` | GiST exclusion constraint (room double-booking) | Sec | [x] *(fixed: immutable expr)* |
| 0022 | `0022_on_delete_policies.sql` | ON DELETE cascade/set null on FKs | Sec | [x] *(fixed: ADD CONSTRAINT syntax)* |
| 0023 | `0023_package_expiry_guard.sql` | Blocks deduction on expired packages (RPC) | Sec | [x] |
| 0024 | `0024_money_cents.sql` | Converts amount columns from NUMERIC dollars to INTEGER cents (idempotent) | Data | [x] |
| 0025 | `0025_seed_is_synthetic.sql` | `is_synthetic` column on 6 tables for seed cleanup | Data | [x] |
| ~~0026~~ | ~~`0026_dashboard_metrics_rpc.sql`~~ | ~~`get_dashboard_metrics()` SQL function~~ | Data | **DELETED** (dead code — no callers) |
| 0027 | `0027_performance_indexes.sql` | Composite indexes (appointments, payments, patients, marketplace) | Data | [x] |
| **0028** | **`0028_credit_package_updated_at.sql`** | **Adds `updated_at` to `credit_packages` — fixes the `0023` deduction RPC which threw "column updated_at does not exist" on every call** | **Fix** | **[ ] ⚠️ APPLY** |
| **0029** | **`0029_patient_email_plain_unique.sql`** | **Replaces 0020's expression index with a plain `(clinic_id, email)` unique index so the upsert's `onConflict` works; lowercases stored emails** | **Fix** | **[ ] ⚠️ APPLY** |

---

## 10. Discrepancies & Reconciliation Notes

> Known conflicts between source documents. The **canonical resolution** is noted for each.

### 10.1 Test Count

- **Conflict:** Phase 1 guide says 203 tests. Audit reports 236 tests. Security audit says 262 tests.
- **Resolution:** **283 tests** is current (verified via `pnpm -r test`: 149 core + 25 intelligence + 46 UI + 23 patterns + 12 connect-api + 4 twilio + 24 others).

### 10.2 Package Count

- **Conflict:** Phase 1 guide says 10 packages. Phase 4 says 17 packages.
- **Resolution:** **17 packages** is current (post-module-extraction + SDK + marketplace + intelligence). Verify with `pnpm typecheck`.

### 10.3 Route Count

- **Conflict:** Phase 1 guide says 24 routes. Phase 5 build shows 35 routes.
- **Resolution:** **35 routes** is current (portal-medspa only). Added: pricing, signup/success, feedback, settings/billing, subscriptions APIs, feedback API, health endpoint, signup-enhanced API.

### 10.4 Supabase Project Name

- **Conflict:** One guide says `medspa-portal-staging`, the other says `medspa-portal-prod`.
- **Resolution:** Use **`medspa-portal-staging`** for Phase 1. Production config happens in Phase 5A (you can rename or create a new project then).

### 10.5 Stripe Webhook Events

- **Resolution:** Register **7 events** total:
  - Payment events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`
  - Refund event: `charge.refunded` *(marks the matching `payments` ledger row as `refunded` so revenue reflects refunds)*
  - Subscription events (Phase 5): `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

### 10.6 Connect API Deployment Target

- **Resolution:** **Railway (Next.js)** is canonical. Disregard Render/Express approach in older docs.

### 10.7 Postmark Env Var Name

- **Resolution:** **`POSTMARK_API_TOKEN`** is canonical (matches actual code).

### 10.8 Phase 5 Code Gaps — Now Built

- **Resolution:** The following Phase 5 features are now **code-complete**:
  - Pricing page (`/pricing`) — 3-tier comparison cards
  - Stripe subscription billing (`@baseplate/core/billing` module + checkout/portal APIs + webhook handling)
  - Self-service signup (`/api/auth/signup-enhanced` with plan selection)
  - Feedback collection (migration 0015, API, dashboard page, floating widget)
  - Production observability (`@baseplate/core/monitoring` module, health endpoint, error boundaries)

### 10.9 Security Audit Fixes Applied

- **Resolution:** A comprehensive security audit identified **41 findings** across 11 phases. All have been **fixed and verified** (35 commits, 17/17 typecheck, 283 tests passing). Full details in `Med Spa App/CODE_REVIEW.md` and `Med Spa App/docs/superpowers/plans/2026-06-16-progress-summary.md`.

**Phase 1 — Tenant Isolation (CRITICAL):**
  - Per-clinic API keys with SHA-256 hash lookup (migration 0016); all 7 Connect API routes derive clinicId from the key
  - Portal proxy routes call core functions directly with session clinicId (no shared API key)
  - Payment-link IDOR: loads appointment and asserts clinic/patient ownership

**Phase 2 — DB Safety:**
  - Stripe webhook idempotency via `processed_stripe_events` (migration 0018)
  - Payment-status no-regression guard; atomic patient upsert; room exclusion constraint
  - RLS identity drift fixed (migration 0019); ON DELETE policies; package expiry guard

**Phase 3 — Security Hardening:**
  - Rate limiter fail-closed in prod + hashed keys; signup rate-limited + generic errors + compensating rollback
  - Middleware switched from `getSession()` → `getUser()` (revalidates JWT)
  - **⚠️ Correction (post-review):** the original remediation only switched `middleware.ts` to `getUser()`. The shared helper `getUserContext()` in `lib/supabase/server.ts` — which backs **all 13 protected API routes** — still used `getSession()` (parses the cookie JWT without a server round-trip, so revoked/disabled users stayed valid until token expiry). This was fixed in commit `adf49d7`: `getUserContext()` now calls `getUser()` too.

**Phase 4-5 — Compliance + Auth:**
  - Swallowed audit catches → `logError`; request-id correlation; marketplace types standardized to snake_case

**Post-Remediation Deep Review (9 additional fixes):**
  - Connect API key flow: portal routes bypass Connect API, call core directly
  - Money cents mismatch: PaymentPanel sends cents, dashboard displays cents/100, migration 0024 idempotency guarded
  - `res.ok` checks added to all 11 fetch() calls across 7 refactored components
  - Cancel appointment IDOR: ownership check + already-cancelled guard
  - Booking routes: rate-limited + clinic verification
  - `err.message` redaction across 16 portal routes
  - Client components: removed all non-type imports from `@baseplate/core` barrel
  - SDK `ChurnPredictionResult` type corrected to match API response
  - `@baseplate/core/client` barrel created for client-safe imports

### 10.10 Money Stored as Integer Cents

- **Resolution:** Migration `0024` converts `appointments.amount` and `credit_packages.amount_paid` from `NUMERIC(10,2)` (dollars) to `INTEGER` (cents). **All money values in the database are now stored as integer cents** (e.g., `5000` = `$50.00`).
- When writing manual SQL queries against these columns, remember to multiply/divide by 100.
- The application code handles this automatically:
  - `PaymentPanel` converts input to cents before sending.
  - Both dashboard paths display cents/100: `DashboardOverview` (via `/api/dashboard/metrics`) and the reporting API (via `/api/reporting/metrics`).
  - **⚠️ Important:** `reporting/index.ts` does **NOT** sum `appointments.amount` (that caused a 100× revenue inflation bug after 0024). It now sources revenue from the canonical **`payments.amount_cents`** ledger and divides by 100 — the same source `/api/dashboard/metrics` uses. Provider revenue attribution flows through the `appointment_id → provider_id` map.
- The migration is **idempotent** — it guards with a column type check so re-running won't double-multiply.

### 10.11 Migration Fixes Applied During Initial Deploy

- **Resolution:** 5 migration files had bugs that prevented them from running on a fresh Supabase project. All were fixed in-place and applied successfully via `supabase db push`:
  - **0004** — GiST exclusion constraint used `(duration_minutes || ' minutes')::INTERVAL` (text→interval cast is not IMMUTABLE). Fixed to `duration_minutes * INTERVAL '1 minute'`.
  - **0006** — `ALTER TABLE ... RENAME COLUMN treatment_type` failed because 0004 already creates the column as `service_type`. Wrapped in `DO $$ ... IF EXISTS ... $$` guard.
  - **0012** — Three issues: (a) `clinics.owner_id` FK to `auth.users` failed for synthetic UUIDs → added synthetic `auth.users` inserts; (b) synthetic UUIDs contained invalid hex chars (`p`, `k`) → replaced with valid hex (`d1`-`d5`, `e1`); (c) referenced `payments` table before migration 0017 creates it → wrapped in conditional `DO $$ IF EXISTS ... $$`; (d) `audit_logs.resource_id` is UUID but received string `'login'` → changed to `NULL`; (e) `audit_logs.user_id` FK → changed to valid synthetic owner UUID.
  - **0021** — Same IMMUTABLE issue as 0004. Same fix applied.
  - **0022** — `ADD CONSTRAINT IF NOT EXISTS` is not valid PostgreSQL syntax → wrapped in `DO $$ IF NOT EXISTS ... $$` block.

---

> **Document maintenance:** After completing any phase milestone, update this document (check off items) AND update `MASTER_PROGRESS.md` (change phase status, add commit to build log). These two documents are the operational source of truth.
