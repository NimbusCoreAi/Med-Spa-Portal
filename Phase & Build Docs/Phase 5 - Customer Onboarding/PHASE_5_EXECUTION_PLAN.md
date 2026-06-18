# Phase 5 Execution Plan — Customer Onboarding

> **Status:** Planning complete. Ready for execution.
> **Last updated:** June 2026
> **Prerequisite:** Phase 4 gap fixes complete (code ready for GitHub launch)
> **Estimated effort:** Code gaps ~16-20 hrs. Manual/operational work spans 3-6 months.
> **Companion docs:** `PHASE_5_CODE_GAPS.md` (detailed build guide for code features)

---

## Table of Contents

- [Current State Assessment](#current-state-assessment)
- [Part 0: Phase 5 Prerequisites](#part-0-phase-5-prerequisites)
- [Part 1: Code Gaps](#part-1-code-gaps-build-before-pilots)
- [Part 2: Production Deploy](#part-2-production-deploy)
- [Part 3: HIPAA Compliance Activation](#part-3-hipaa-compliance-activation)
- [Part 4: Pilot Recruitment](#part-4-pilot-recruitment)
- [Part 5: Per-Clinic Onboarding](#part-5-per-clinic-onboarding-4-touch-sequence)
- [Part 6: Feedback Infrastructure](#part-6-feedback-infrastructure--cadence)
- [Part 7: ML Model Training](#part-7-ml-model-training)
- [Part 8: Revenue Conversion](#part-8-revenue-conversion)
- [Phase 5 Gate Check](#phase-5-gate-check)
- [Complete Skill Reference](#complete-skill-reference)
- [Execution Order](#execution-order-dependency-chain)

---

## Current State Assessment

| Area | Status |
|------|--------|
| Code (Phases 1-4) | ✅ Complete — 250 tests, 17 packages, all builds pass |
| Staging deploy | ⬜ Never done — no Supabase project, no Railway deploy |
| Connect API deploy | ⬜ Never deployed |
| GitHub public repo | ⬜ Not pushed (Phase 4 gap fixes done, repo not public) |
| Pricing/billing code | ⬜ Missing — no pricing page, no subscription billing |
| Production observability | ⬜ Missing — no error tracking, no health endpoint on portal |
| Feedback infrastructure | ⬜ Missing — no feedback table or UI |
| Self-service signup | ⬜ Missing — basic signup only, no plan selection |

**Bottom line:** Before Phase 5 proper begins, we need to close prior phase deploy gaps AND build 5 code features that Phase 5 requires.

---

## Part 0: Phase 5 Prerequisites

### Phase 1-4 carryover work that must complete before Phase 5.

---

### 0A. Staging Deploy (Phase 1 Completion)

> **Reference:** `MASTER_MANUAL_CONFIG.md` Section 2 (all items), `PHASE_1_COMPLETION_GUIDE.md`
> **Skill:** `verification-before-completion` (General Skills), `testing-plan` (Agent Core)
> **Subagent:** `devops-engineer` (03-Infrastructure), `qa-expert` (04-Quality & Security)

| # | Task | Type | Skill | Subagent | Status |
|---|------|------|-------|----------|--------|
| 1 | Create Supabase project (`medspa-portal-staging`, US East, Free) | Manual | — | `devops-engineer` | ⬜ |
| 2 | Create Stripe account (Test Mode) | Manual | — | `payment-integration` | ⬜ |
| 3 | Create Postmark account + Server | Manual | — | `devops-engineer` | ⬜ |
| 4 | Create Twilio account + buy number | Manual | — | `devops-engineer` | ⬜ |
| 5 | Create Railway account | Manual | — | `devops-engineer` | ⬜ |
| 6 | Generate all API keys/credentials | Manual | — | `devops-engineer` | ⬜ |
| 7 | Run migrations 0001-0013 on Supabase | Manual | `add-migration` | `postgres-pro` | ⬜ |
| 8 | Configure Supabase Auth (disable email confirm) | Manual | — | `devops-engineer` | ⬜ |
| 9 | Verify Postmark sender identity | Manual | — | `devops-engineer` | ⬜ |
| 10 | Set up Stripe CLI webhook forwarding | Manual | — | `payment-integration` | ⬜ |
| 11 | Fill `.env.local` with all 13 env vars | Manual | `sync-docs` | — | ⬜ |
| 12 | Deploy portal-medspa to Railway staging | Manual | `commit-and-push` | `devops-engineer` | ⬜ |
| 13 | Update Stripe webhook → staging URL | Manual | — | `payment-integration` | ⬜ |
| 14 | Update Supabase Auth URLs → staging domain | Manual | `sync-docs` | `devops-engineer` | ⬜ |
| 15 | **Run 19-step staging smoke test** | Manual | `testing-plan` | `qa-expert` | ⬜ |

**Smoke test sequence:** signup → dashboard → add provider → add room → add patient → create appointment → generate payment link → complete test payment → verify webhook → check email (Postmark) → check SMS (Twilio) → submit intake form → verify e-signature → check audit logs → test patient booking flow → test RBAC (staff vs owner) → logout

---

### 0B. Connect API Deploy (Phase 2 Completion)

> **Reference:** `MASTER_MANUAL_CONFIG.md` Section 3B-3C
> **Skill:** `audit-perf` (Agent Core — load testing), `add-observability` (Agent Core)
> **Subagent:** `devops-engineer`, `performance-engineer` (04-Quality & Security)

| # | Task | Type | Skill | Subagent | Status |
|---|------|------|-------|----------|--------|
| 1 | Generate `CONNECT_API_KEY` | Manual | — | `devops-engineer` | ⬜ |
| 2 | Deploy connect-api to Railway | Manual | `commit-and-push` | `devops-engineer` | ⬜ |
| 3 | Add Connect API env vars to Railway | Manual | — | `devops-engineer` | ⬜ |
| 4 | Create Upstash Redis database | Manual | — | `devops-engineer` | ⬜ |
| 5 | Add Upstash credentials to Railway env | Manual | — | `devops-engineer` | ⬜ |
| 6 | Create Stripe pricing products (prep only) | Manual | — | `payment-integration` | ⬜ |
| 7 | Test health endpoint | Manual | `verification-before-completion` | `qa-expert` | ⬜ |
| 8 | Test authenticated endpoints | Manual | `verification-before-completion` | `qa-expert` | ⬜ |
| 9 | Rate limit test (101 requests → 429) | Manual | `audit-perf` | `performance-engineer` | ⬜ |
| 10 | Update portal `CONNECT_API_URL` | Manual | `sync-docs` | `devops-engineer` | ⬜ |

---

### 0C. GitHub Public Push (Phase 4 Completion)

> **Skill:** `release` (Agent Core), `commit-and-push` (Agent Core), `internal-comms` (General Skills)
> **Subagent:** `content-marketer` (08-Business & Product)

| # | Task | Type | Skill | Subagent | Status |
|---|------|------|-------|----------|--------|
| 1 | Replace `<PUBLIC_REPO_URL>` in 3 files | Code | `sync-docs` | — | ⬜ |
| 2 | Create public GitHub repo | Manual | — | — | ⬜ |
| 3 | `git remote set-url` + push | Manual | `commit-and-push` | — | ⬜ |
| 4 | Tag `v0.1.0` + GitHub Release | Manual | `release` | `devops-engineer` | ⬜ |
| 5 | Marketing rollout (HN, Reddit, Twitter) | Manual | `internal-comms` | `content-marketer` | ⬜ |

---

## Part 1: Code Gaps (Build Before Pilots)

> **Detailed build guide:** `PHASE_5_CODE_GAPS.md`
> These are the code features Phase 5 requires that don't exist yet.
> Parts 1A-1D can be built in parallel. Part 1E is deferred to Part 7.

---

### 1A. Pricing Page + Stripe Subscription Billing

> **Skill:** `add-feature` (`mode=production`), `add-migration`, `harden-types`, `add-observability`, `write-tests`, `polish-ui`
> **Subagent:** `payment-integration` (07-Specialized Domains), `nextjs-developer` (02-Language Specialists), `api-designer` (01-Core Development)

**Problem:** No pricing page exists. No subscription billing — only one-time Stripe payment links. The Phase 5 gate requires "Pricing page live with self-service signup."

**Deliverables:**

| File | Purpose |
|------|---------|
| `apps/portal-medspa/src/app/pricing/page.tsx` | Public pricing page — 3 tiers (Free Pilot, Connect $49-99/mo, Intelligence $99-199/mo) |
| `apps/portal-medspa/src/app/api/subscriptions/create/route.ts` | Create Stripe Checkout session for subscription |
| `apps/portal-medspa/src/app/api/subscriptions/portal/route.ts` | Stripe Customer Portal redirect (manage billing) |
| `apps/portal-medspa/src/app/api/webhooks/stripe/route.ts` | **Extend** — handle `customer.subscription.created/updated/deleted` |
| `supabase/migrations/0014_subscriptions.sql` | `subscriptions` table + RLS |
| `packages/core/src/billing/index.ts` | New billing module: `createSubscription()`, `getSubscription()`, `updateSubscriptionStatus()` |

**Key behaviors:**
- Free Pilot tier: existing signup, no Stripe checkout
- Connect tier: Stripe Checkout → subscription → webhook updates table → portal unlocks
- Intelligence add-on: upsell from dashboard → second Stripe Checkout
- Customer Portal: Stripe-hosted page to manage card, cancel, view invoices

---

### 1B. Production Observability

> **Skill:** `add-observability`, `modify-feature` (`mode=balanced`), `write-tests`
> **Subagent:** `sre-engineer` (03-Infrastructure), `devops-engineer`

**Problem:** No error tracking, no health monitoring on the portal. Phase 5 requires "no critical bugs blocking daily usage" — need visibility to catch them.

**Deliverables:**

| File | Purpose |
|------|---------|
| `apps/portal-medspa/src/app/api/health/route.ts` | Health check (DB connectivity, Stripe, Connect API, Twilio balance) |
| `apps/portal-medspa/src/app/error.tsx` | Next.js error boundary (route-level) |
| `apps/portal-medspa/src/app/global-error.tsx` | Root-level error boundary |
| `packages/core/src/monitoring/index.ts` | Structured logging: `logError()`, `logInfo()`, `logMetric()` |
| `packages/core/src/monitoring/__tests__/monitoring.test.ts` | Tests for monitoring utilities |

**Integration points:**
- Wrap all existing API route handlers with error logging
- Add structured logging to Connect API call boundaries
- Health endpoint checks: Supabase, Stripe, Connect API, Twilio

**Decision needed:** Sentry (free tier, 5K errors/mo) vs. self-hosted logging?

---

### 1C. Self-Service Signup Flow

> **Skill:** `modify-feature` (`mode=production`), `polish-ui`, `add-e2e-test`, `harden-types`
> **Subagent:** `frontend-developer` (01-Core Development), `payment-integration` (07-Specialized Domains), `security-auditor` (04-Quality & Security)

**Problem:** Basic signup exists but there's no flow for: plan selection → Stripe checkout → account provisioning.

**Deliverables:**

| File | Purpose |
|------|---------|
| `apps/portal-medspa/src/app/signup/page.tsx` | **Enhance** — add plan selection step (Free Pilot vs. Connect $49/mo) |
| `apps/portal-medspa/src/app/signup/success/page.tsx` | Post-signup success (different paths for pilot vs. paid) |
| `apps/portal-medspa/src/app/api/auth/signup-enhanced/route.ts` | Enhanced signup creating Stripe customer + subscription if paid |

**Flow:**
1. User lands on `/pricing` → selects plan
2. Free Pilot: existing signup flow → dashboard
3. Connect $49/mo: signup → Stripe Checkout → webhook creates subscription → account activated
4. Intelligence add-on: upsell from dashboard settings → Stripe Checkout

---

### 1D. Feedback Collection Infrastructure

> **Skill:** `add-feature` (`mode=balanced`), `add-migration`, `add-empty-error-states`, `polish-ui`, `propagate-ui-pattern`
> **Subagent:** `frontend-developer` (01-Core Development), `qa-expert` (04-Quality & Security)

**Problem:** Feedback process is entirely manual (spreadsheets, calls). A basic in-app feedback mechanism catches bugs early.

**Deliverables:**

| File | Purpose |
|------|---------|
| `supabase/migrations/0015_feedback.sql` | `feedback` table (clinic_id, submitted_by, category, message, priority, status) + RLS |
| `apps/portal-medspa/src/app/api/feedback/route.ts` | POST: submit feedback; GET: list feedback (owner only) |
| `apps/portal-medspa/src/app/dashboard/feedback/page.tsx` | Feedback form + list of past submissions |
| `apps/portal-medspa/src/components/feedback-widget.tsx` | Floating feedback button → modal form on any dashboard page |

**Key behaviors:**
- Any staff member can submit feedback (bug, feature request, improvement, question)
- Owners see all feedback from their clinic
- Categories: Bug, Feature, Improvement, Question, Complaint
- Priority auto-assigned based on keywords ("broken", "can't", "critical" → High)

---

### 1E. ML Pipeline Wiring (Deferred to Part 7)

> **Built after pilots generate real data. See Part 7.**

**Deliverables (high-level — detailed in Part 7):**
- Update `ml-models/src/features.py` — add Supabase data fetcher for real data
- Update `ml-models/src/train.py` — train on real pilot data
- Update `ml-models/src/serve.py` — load trained `.joblib`, serve via FastAPI
- Update Connect API churn-prediction endpoint — call ML serve, fall back to heuristic

---

## Part 2: Production Deploy

> **Prerequisite:** Part 0A (staging) + Part 0B (Connect API) complete.
> **Reference:** `MASTER_MANUAL_CONFIG.md` Section 6A, `PHASE_5_ONBOARDING_GUIDE.md` Part 3
> **Skill:** `testing-plan` (Agent Core), `verification-before-completion` (General Skills)
> **Subagent:** `devops-engineer`, `qa-expert`

### 2A. Service Upgrades

| # | Service | Action | Cost | Skill | Subagent |
|---|---------|--------|------|-------|----------|
| 1 | Stripe | Switch to Live Mode, copy live keys to Railway | Per-transaction | — | `payment-integration` |
| 2 | Supabase | Upgrade to Pro ($25/mo), re-enable email confirmation | $25/mo | — | `devops-engineer` |
| 3 | Twilio | Upgrade from trial, add payment method | Per-usage | — | `devops-engineer` |
| 4 | Postmark | Verify production domain (DKIM + Return-Path) | $15+/mo | — | `devops-engineer` |
| 5 | Railway | Update all env vars to production values, redeploy | ~$5+/mo | `sync-docs` | `devops-engineer` |
| 6 | DNS | Configure production domain → Railway (A record/CNAME) | $10-15/yr domain | — | `devops-engineer` |

### 2B. Production Smoke Test (12 steps)

| Step | Action | Expected |
|------|--------|----------|
| 1 | Visit production URL | Login page loads |
| 2 | Sign up new clinic | Account created |
| 3 | Log in | Dashboard loads |
| 4 | Add provider + room | Saved |
| 5 | Add patient | Saved |
| 6 | Create appointment | Appears in calendar |
| 7 | Generate payment link | Stripe checkout URL (LIVE) |
| 8 | Complete $1 test payment | Processed + webhook fires |
| 9 | Check email | Postmark email received |
| 10 | Check SMS | Twilio SMS received |
| 11 | Submit intake form | Saved with e-signature |
| 12 | Check audit logs | Recent actions logged |

---

## Part 3: HIPAA Compliance Activation

> **When:** Before any real patient data (PHI) is stored. After first pilot commits.
> **Reference:** `MASTER_MANUAL_CONFIG.md` Section 6B
> **Skill:** `audit-authz` (Agent Core — verify RLS with real data)
> **Subagent:** `hipaa-compliance` (07-Specialized Domains), `security-auditor` (04-Quality & Security)

| # | Task | Notes | Skill | Subagent |
|---|------|-------|-------|----------|
| 1 | Sign Supabase BAA | Requires Pro tier (Part 2A) | — | `hipaa-compliance` |
| 2 | ⚠️ Railway does NOT offer a HIPAA BAA — migrate app host to AWS/GCP/Azure (with BAA) before processing real PHI | Railway is fine for dev/staging/early-prod with no real PHI | — | `hipaa-compliance` |
| 3 | Set `PHI_ENABLED=true` | Enables field-level encryption | `sync-docs` | — |
| 4 | Set up AWS KMS for encryption key storage | Production key management | — | `security-auditor`, `devops-engineer` |
| 5 | Generate encryption keys via `generateKey()` | TweetNaCl module | — | `security-auditor` |
| 6 | Set up 6-year audit log retention | PostgreSQL scheduled job | `add-migration` | `postgres-pro` |
| 7 | Verify Supabase daily backups + PITR | Pro plan feature | `audit-authz` | `devops-engineer` |
| 8 | *(Deferred)* Pen testing, formal HIPAA audit, DR testing | Before scaling beyond pilots | `audit` | `security-auditor`, `hipaa-compliance` |

---

## Part 4: Pilot Recruitment

> **Reference docs:** `COLD_OUTREACH_PLAYBOOK.md` (627 lines, 6 channels), `PILOT_LEADS_AND_TEMPLATES.md` (607 lines, 50+ leads)
> **Skill:** `internal-comms` (General Skills)
> **Subagent:** `content-marketer` (08-Business & Product), `growth-loops`, `sales-engineer`

### 4A. Lead Tracking Setup

| # | Task | Skill | Subagent |
|---|------|-------|----------|
| 1 | Set up CRM (Google Sheets, Notion, or HubSpot Free) | — | — |
| 2 | Import 50+ leads from `PILOT_LEADS_AND_TEMPLATES.md` | — | — |
| 3 | Segment by region, owner type, clinic size, specialty | — | `market-researcher` (10-Research) |
| 4 | Select 15-20 warmest prospects for first batch | — | `sales-engineer` (08-Business) |

### 4B. Outreach Channel Accounts

| # | Task | Skill | Subagent |
|---|------|-------|----------|
| 1 | Business email for cold outreach | `internal-comms` | `content-marketer` (08-Business) |
| 2 | LinkedIn connection requests | `internal-comms` | `content-marketer` (08-Business) |
| 3 | Instagram engagement + DMs | `internal-comms` | `content-marketer` (08-Business) |
| 4 | Facebook clinic page engagement + DMs | `internal-comms` | `content-marketer` (08-Business) |
| 5 | Business phone for cold calls + SMS | `internal-comms` | `sales-engineer` (08-Business) |
| 6 | Loom demo video (3-5 min) | `internal-comms` | `content-marketer` (08-Business) |
| 7 | HIPAA checklist PDF (lead magnet) | `internal-comms` | `content-marketer` (08-Business) |

### 4C. Outreach Execution

| Week | Action | Target | Skill | Subagent |
|------|--------|--------|-------|----------|
| 1 | First batch: 5-7 clinics (email-led sequence) | 5-7 contacted | `internal-comms` | `content-marketer` (08-Business) |
| 1-2 | LinkedIn connections, Instagram engagement | 10-15 touches | `internal-comms` | `content-marketer` (08-Business) |
| 2 | Follow-up emails + cold calls | 15-20 touches | `internal-comms` | `sales-engineer` (08-Business) |
| 2-3 | Second batch: 10-15 clinics | 15-22 contacted | `internal-comms` | `growth-loops` (08-Business) |
| 3 | Discovery calls (15 min each) | 5-10 calls | — | `sales-engineer` (08-Business) |
| 3-4 | **Secure 3+ pilot commitments** | 3 committed | — | `sales-engineer` (08-Business) |

**Expected conversion:** 60-150 cold leads → 3 pilots (2-5% close rate)

---

## Part 5: Per-Clinic Onboarding (4-Touch Sequence)

> **Repeat for each pilot.** Reference: `PHASE_5_ONBOARDING_GUIDE.md` Parts 4-6
> **Skill:** `testing-plan` (Agent Core)
> **Subagent:** `qa-expert`

| Touch | When | Duration | Focus | Skill | Subagent |
|-------|------|----------|-------|-------|----------|
| **1. Kickoff** | Pilot start | 30-45 min | Account setup, providers, rooms, schedule templates | `testing-plan` | `qa-expert` (04-Quality) |
| **2. Data Setup** | 2-3 days later | 30-45 min | Service catalog, patient import, intake forms, payment setup | `testing-plan` | `qa-expert` (04-Quality) |
| **3. Patient Flow** | 2-3 days later | 30-45 min | Full patient journey walkthrough (booking → notification → intake → payment) | `verification-before-completion` (General Skills) | `qa-expert` (04-Quality) |
| **4. Week 2 Check-in** | 2 weeks later | 20-30 min | Usage review, friction points, confirm feedback cadence | — | `qa-expert` (04-Quality) |

### Additional per-clinic tasks:
- Staff training session (15-20 min group)
- Distribute 1-page quick-reference cheat sheet
- Identify "portal champion" at each clinic
- Record baseline metrics (no-show rate, intake completion, payment time, admin hours, software costs)

---

## Part 6: Feedback Infrastructure & Cadence

> **Skill:** `fix-bug` (Agent Core — pilot-reported bugs), `add-regression-test` (Agent Core — pin fixes)
> **Subagent:** `qa-expert`, `debugger` (04-Quality & Security)

### 6A. Feedback Tracking (Manual + In-App)

| # | Task | Skill | Subagent |
|---|------|-------|----------|
| 1 | Set up feedback log spreadsheet | — | — |
| 2 | Set up async feedback channel per pilot | `internal-comms` | — |
| 3 | Establish close-the-loop process (notify → verify → close) | — | — |
| 4 | Monitor in-app feedback widget (from Part 1D) | `fix-bug` | `qa-expert` (04-Quality) |

### 6B. Feedback Cadence (Recurring)

| Call | When | Duration | Focus | Skill |
|------|------|----------|-------|-------|
| Touch 4 | Week 2 | 20-30 min | Initial friction, adoption check | — |
| Feedback 2 | Week 4 | 20-30 min | First real usage feedback | — |
| Feedback 3 | Week 6 | 20-30 min | Deeper feature requests | `fix-bug` (if bugs reported) |
| Feedback 4 | Week 8 | 20-30 min | Habit formation check | — |
| Deep-Dive | Month 3 | 45-60 min | Full metrics comparison, pain-point audit, testimonial check | `sync-docs` (capture metrics) |
| Feedback 6 | Month 4 | 20-30 min | ML insights review, conversion preview | — |
| Pilot Review | Month 6 | 45-60 min | Full review, conversion conversation | `internal-comms` (conversion pitch) |

### Triage rules:
- Critical bugs → fix same day
- High impact → fix within week
- Medium → batch into next sprint
- Low/features → log for roadmap

---

## Part 7: ML Model Training

> **Prerequisite:** 3+ clinics using portal for 4-6 weeks minimum. 50+ clinics recommended for best accuracy.
> **Skill:** `add-feature` (Agent Core), `modify-feature` (Agent Core)
> **Subagent:** `ml-engineer` (05-Data & AI), `data-engineer`, `data-scientist`, `python-pro` (02-Language Specialists)

| # | Task | Type | Skill | Subagent |
|---|------|------|-------|----------|
| 1 | Export pilot usage data from Supabase | Manual/Code | — | `data-engineer` (05-Data & AI) |
| 2 | Update `features.py` — Supabase data fetcher | Code | `modify-feature` | `data-engineer`, `python-pro` |
| 3 | Train churn prediction model | Code | `modify-feature` | `ml-engineer` (05-Data & AI) |
| 4 | Train LTV model | Code | `modify-feature` | `ml-engineer` |
| 5 | Train demand forecasting model | Code | `modify-feature` | `ml-engineer` |
| 6 | Validate model accuracy | Code | `verification-before-completion` | `data-scientist` (05-Data & AI) |
| 7 | Deploy FastAPI serve endpoint | Manual | `release` | `devops-engineer` (03-Infrastructure) |
| 8 | Update `serve.py` — load trained model | Code | `modify-feature` | `python-pro` (02-Language) |
| 9 | Update Connect API churn endpoint | Code | `modify-feature` → `add-observability` | `node-specialist` (02-Language) |
| 10 | Surface ML insights in dashboards | Code | `add-feature` → `polish-ui` | `frontend-developer` (01-Core) |
| 11 | Collect pilot feedback on ML | Manual | `testing-plan` | `qa-expert` (04-Quality) |

---

## Part 8: Revenue Conversion

> **Skill:** `internal-comms` (General Skills), `sync-docs` (Agent Core)
> **Subagent:** `content-marketer`, `growth-loops`, `business-analyst` (08-Business & Product)

### 8A. Stripe Subscription Configuration

| # | Task | Skill | Subagent |
|---|------|-------|----------|
| 1 | Configure subscription products in production Stripe | — | `payment-integration` (07-Specialized) |
| 2 | Set up billing automation (invoices, retries, dunning) | — | `payment-integration` (07-Specialized) |
| 3 | Publish pricing page as public `/pricing` | `sync-docs` | — |
| 4 | Verify self-service signup works with live Stripe | `add-e2e-test` | `qa-expert` (04-Quality) |

### 8B. Conversion Conversations (Month 4-5 per pilot)

| # | Task | Skill | Subagent |
|---|------|-------|----------|
| 1 | Present metrics (time saved, no-show reduction, payment speed) | `internal-comms` | `business-analyst` (08-Business) |
| 2 | Offer early-adopter discount (20% off first year) | `internal-comms` | `sales-engineer` (08-Business) |
| 3 | Secure commitment → set up Stripe subscription | — | `payment-integration` (07-Specialized) |
| 4 | Graceful exit for non-converters | `internal-comms` | — |

### 8C. Second Outreach Round

| # | Task | Skill | Subagent |
|---|------|-------|----------|
| 1 | Update outreach materials with pilot testimonials + metrics | `sync-docs` | `content-marketer` (08-Business) |
| 2 | Launch second cold outreach round (20-30 new clinics) | `internal-comms` | `growth-loops` (08-Business) |
| 3 | Target 5-7 new paying customers | `internal-comms` | `sales-engineer` (08-Business) |
| 4 | Write 1+ case study (baseline → improvement metrics) | `sync-docs` | `business-analyst` (08-Business) |
| 5 | Collect 1+ testimonial (written or video) | `internal-comms` | `content-marketer` (08-Business) |

---

## Phase 5 Gate Check

All must be true to exit Phase 5:

### Product Readiness
- [ ] No critical bugs blocking daily usage
- [ ] Intake completion rate >80%
- [ ] Payment webhook success ~100%
- [ ] All original pilot pain points addressed

### Adoption
- [ ] 3+ pilots onboarded
- [ ] 2+ pilots using weekly without hand-holding
- [ ] Each pilot has a portal champion

### Revenue
- [ ] $500+ MRR
- [ ] At least 1 pilot converted to paying customer
- [ ] Pricing page live with self-service signup

### Intelligence
- [ ] ML models trained on real data
- [ ] ML insights surfaced in at least 1 pilot dashboard
- [ ] Pilot feedback on ML insights collected

### Documentation
- [ ] 1+ case study written
- [ ] 1+ testimonial collected
- [ ] Clear feature roadmap from real feedback

---

## Complete Skill Reference

### Agent Core Skills (by part)

| Skill | Part(s) | Mode | Purpose |
|-------|---------|------|---------|
| `add-feature` | 1A, 1D, 7 | production / balanced | Pricing page, feedback, ML wiring |
| `modify-feature` | 1B, 1C, 7 | balanced / production | Observability, signup, Connect API |
| `add-migration` | 1A, 1D | — | Subscriptions table, feedback table |
| `add-observability` | 1A, 1B, 7 | — | Error tracking, subscription logging, ML calls |
| `harden-types` | 1A, 1C | — | Stripe event typing, plan types |
| `write-tests` | 1A, 1B | — | Billing module, monitoring |
| `add-e2e-test` | 1C | — | Signup → checkout → dashboard flow |
| `add-empty-error-states` | 1D | — | Feedback empty/error states |
| `polish-ui` | 1A, 1C, 1D | — | Pricing page, signup, feedback widget |
| `propagate-ui-pattern` | 1D | — | Match modal pattern |
| `fix-bug` | 6 | — | Fix bugs reported by pilots |
| `add-regression-test` | 6 | — | Pin bug fixes |
| `release` | 0C, 8A | production | Versioned releases |
| `commit-and-push` | 0C | production | Push to public repo |
| `sync-docs` | 8C | — | Update marketing with real metrics |
| `testing-plan` | 0A, 2B, 5 | — | QA plans for smoke test, onboarding |
| `audit-authz` | 3 | — | Verify RLS with real data |
| `audit-perf` | 0B | — | Load testing Connect API |
| `simplify` | 1A-1D | — | Post-change cleanup on all features |
| `check-pr-readiness` | 1A-1D | — | Verify before merging code gaps |
| `update-changelog` | 1A-1D | — | CHANGELOG entries for new features |

### General Skills

| Skill | Part(s) | Purpose |
|-------|---------|---------|
| `internal-comms` | 0C, 4C, 8C | All marketing/outreach copy |
| `verification-before-completion` | 0A, 2B | Verify deploys + smoke tests |

### Subagents (by category)

| Subagent | Category | Part(s) | Purpose |
|----------|----------|---------|---------|
| `devops-engineer` | 03-Infrastructure | 0A, 0B, 0C, 1B, 2 | Deploy, CI, health checks |
| `qa-expert` | 04-Quality & Security | 0A, 1D, 5, 6 | Smoke test, onboarding QA |
| `payment-integration` | 07-Specialized Domains | 1A, 1C | Stripe subscriptions + portal |
| `nextjs-developer` | 02-Language Specialists | 1A | App Router pricing page + API routes |
| `frontend-developer` | 01-Core Development | 1C, 1D | Signup flow, feedback widget |
| `sre-engineer` | 03-Infrastructure | 1B | Monitoring strategy, alerting |
| `security-auditor` | 04-Quality & Security | 1C, 3 | Verify signup security, HIPAA |
| `hipaa-compliance` | 07-Specialized Domains | 3 | BAA, encryption, audit retention |
| `content-marketer` | 08-Business & Product | 0C, 4, 8 | Outreach copy, case studies |
| `growth-loops` | 08-Business & Product | 4, 8 | Growth strategy, viral mechanics |
| `sales-engineer` | 08-Business & Product | 4 | Developer/pilot outreach |
| `ml-engineer` | 05-Data & AI | 1E, 7 | Model training, feature engineering |
| `data-engineer` | 05-Data & AI | 1E, 7 | Supabase data export pipeline |
| `data-scientist` | 05-Data & AI | 7 | Model accuracy validation |
| `python-pro` | 02-Language Specialists | 1E, 7 | FastAPI serve endpoint |
| `business-analyst` | 08-Business & Product | 8 | Case study metrics analysis |
| `debugger` | 04-Quality & Security | 6 | Pilot bug diagnosis |
| `performance-engineer` | 04-Quality & Security | 0B | Connect API load testing |
| `api-designer` | 01-Core Development | 1A | Billing module API design |

### Token Optimization (Run Throughout)

| Skill/Tool | When | Purpose |
|-----------|------|---------|
| `token-guard` | Before each part | Enforce token-saving habits |
| `session-handoff` | Between code gaps | Context handoff if >120K tokens |
| MCP: `audit_context_files` | At session start | Check startup overhead |
| MCP: `token_estimate` | Before reading large files | Cost awareness |

---

## Execution Order (Dependency Chain)

```
Part 0A (Staging Deploy)
  └→ Part 0B (Connect API Deploy)
       └→ Part 0C (GitHub Push)
            └→ Part 1A-1D (Code Gaps — parallel)
                 └→ Part 2 (Production Deploy)
                      └→ Part 3 (HIPAA — when first pilot commits)
                           └→ Part 4 (Pilot Recruitment)
                                └→ Part 5 (Onboarding — per clinic)
                                     └→ Part 6 (Feedback — ongoing)
                                          └→ Part 7 (ML Training — after 4-6 weeks data)
                                               └→ Part 8 (Revenue — Month 4-6)
                                                    └→ Gate Check
```

**Parts 1A-1D can run in parallel** — they're independent code features.
Part 1E (ML wiring) is deferred until Part 7 (after real data exists).

---

## What's Explicitly NOT in This Plan

| Item | Deferred To | Why |
|------|------------|-----|
| Third vertical scaffold | Phase 6+ | Demand-driven |
| Marketplace go-live (live transactions) | Phase 6+ | Needs customer base first |
| Advanced automation modules | Phase 6+ | Built from pilot feedback |
| Formal HIPAA certification/audit | Post-pilot | Before scaling beyond pilots |
| Mobile app | Phase 6+ | Web-first, PWA can bridge gap |

---

## Revenue Projection

| Source | Revenue |
|--------|---------|
| 3 pilot conversions ($49-99/mo) | $147-297/mo |
| Second outreach round (5-7 new customers) | $245-693/mo |
| Intelligence add-on (30% adoption) | $99-199/mo |
| **Total projected** | **$491-1,189/mo** |

---

> **Related Documents:**
> - `PHASE_5_CODE_GAPS.md` — Detailed build guide for code features (Parts 1A-1E)
> - `Phase & Build Docs/Phase 5 - Customer Onboarding/Phase 5 - Customer Onboarding.md` — Strategic overview
> - `Phase & Build Docs/Phase 5 - Customer Onboarding/PHASE_5_ONBOARDING_GUIDE.md` — Tactical onboarding guide
> - `Phase & Build Docs/Phase 5 - Customer Onboarding/COLD_OUTREACH_PLAYBOOK.md` — 6-channel outreach templates
> - `Phase & Build Docs/Phase 5 - Customer Onboarding/PILOT_LEADS_AND_TEMPLATES.md` — 50+ verified leads
> - `MASTER_MANUAL_CONFIG.md` — All manual config steps across all phases
> - `MASTER_PROGRESS.md` — Single source of truth for project status
