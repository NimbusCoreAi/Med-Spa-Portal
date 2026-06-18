# Phase 1: The Wedge & The First Build (Complete Med Spa Portal)
## Med Spa Portal — Baseplate Scaffold Template

> **🔧 MAINTENANCE:** For current status, see [`../../MASTER_PROGRESS.md`](../../MASTER_PROGRESS.md). After completing any milestone or sub-phase, update it: (1) "At a Glance" table, (2) check off "What's Left" items, (3) add commit to "Build Log". Do NOT update status here — update `MASTER_PROGRESS.md` instead.

**Status:** See `../../MASTER_PROGRESS.md` for current status.  
**Vertical:** Med Spas / Wellness Clinics  
**Duration:** Phase 1 (pure build — no customer contact until Phase 5)  
**Goal:** Build HIPAA-compliant portal solving 12 pain points. Complete module library, fix architecture, deploy to staging.

> High-level roadmap. For detailed feature specs, implementation checklist, database schema, and technical architecture, see `Phase 1 - Scaffold Specification.md`.

---

## INHERITANCE FROM PHASE 0

**What Phase 0 Validated:**
- ✅ **Vertical:** Med Spas (14.4% CAGR, $385M TAM, $150-300/mo WTP)
- ✅ **Pain Points:** 12 identified (5 from clinic owner calls, 7 from web research)
- ✅ **Scaffold Modules Needed:** Auth, RBAC, Audit Logs, Scheduling, Intake, Treatment Charting, Notifications, Payments, Inventory, Reporting
- ✅ **Pilot Leads:** 3 clinic owners identified (contact in Phase 5)
- ✅ **Competitive Gaps:** Mindbody/Vagaro/Zenoti weaknesses documented
- ✅ **Revenue Opportunity:** $500-2K/month per clinic (Phase 5 onward)

**Key Insight from Phase 0:**
No incumbent owns "HIPAA-compliant + integrated clinical + booking + payments + data" for med spas. **This is your wedge.**

---

## PHASE 1A: LEARN & BUILD THE CORE

### Pain Points Addressed (Phase 1A)
1. **Tool Fragmentation** — Unite Mindbody + Square + Google Drive into one portal
2. **Intake Follow-up** — Forgot intakes become trackable + remindable
3. **HIPAA Compliance Anxiety** — Encrypted, role-based access, audit logs

### What We're Building

**Core Modules (`packages/core`):**
- **Auth** — Email/password + magic link, multi-role support
- **RBAC** — Owner / Staff / Patient roles with permission enforcement
- **Audit Logs** — Every action logged: WHO, WHAT, WHEN (critical for HIPAA)
- **Types & Config** — Shared TypeScript types, environment variables

**Med Spa Portal (`apps/portal-medspa`):**
- **Sign-up & Login** — Clinic owner creates account, manages staff access
- **Intake Form Builder** — Admin creates custom medical history forms
- **Patient Intake Portal** — Patient fills out + digitally signs intake forms
- **Intake Status Tracking** — Staff sees who completed intakes before appointments

**UI Components (`packages/ui`):**
- Reusable Tailwind components (Button, Form, Table, Modal, Card)

### Phase 1A Deliverables
- [ ] Monorepo initialized (baseplate-core, portal-medspa, ui packages)
- [ ] Auth system working (signup, login, logout, role-based access)
- [ ] Audit logs functional (every action: WHO, WHAT, WHEN logged to DB)
- [ ] Intake form builder (admin can create medical history templates)
- [ ] Patient intake portal (patient fills + signs consent + submits)
- [ ] Intake status dashboard (staff sees completion status for all appointments)
- [ ] Code deployed to staging environment
- [ ] Code passes HIPAA baseline checklist (encryption, audit logs, RBAC, consent)

### Phase 1A Success Criteria
- [ ] Auth flow tested end-to-end (signup → login → role-based access)
- [ ] Intake form creation tested (admin creates form → patient fills → submits)
- [ ] Audit logs verified (check DB for logged actions)
- [ ] Staging deployment stable
- [ ] No critical bugs blocking next phase

---

## PHASE 1B: ADD THE REAL-WORLD WIRE

### Pain Points Addressed (Phase 1B)
4. **No-Show Prevention** — SMS reminders infrastructure ready
5. **Double-Booking** — Real-time scheduling with conflict detection
6. **Payment Tracking** — Stripe integration, payment status visibility
7. **Photo Compliance** — HIPAA-compliant photo storage architecture

### What We're Building

**Scheduling System:**
- **Real-time Calendar** — Provider + room + treatment type booking
- **Conflict Detection** — Prevent double-booking at time of entry (database constraints + app validation)
- **Self-Service Booking** — Patient can book appointments; staff can assign providers + rooms
- **Appointment Tracking** — Track: intake status, payment status, provider, room

**Payments Integration:**
- **Stripe Payment Links** — Staff generates payment link for patient; patient pays via Stripe
- **Payment Tracking** — Appointment shows: unpaid → pending → paid
- **Webhook Handling** — Stripe webhook updates appointment status when payment completes
- **Email Reminders** — Staff can manually send payment reminder emails

**Notifications Infrastructure:**
- **Postmark Email Integration** — Transactional email sending
- **Twilio SMS Integration** — SMS reminder capability
- **Note:** Automation (auto-send reminders) is Phase 2; Phase 1B is manual triggering

**Photo Storage Architecture (HIPAA-compliant):**
- **Encrypted Photo Storage** — Before/after photos encrypted at rest
- **Access Logs** — Every photo access logged (who viewed what when)
- **Separation from Intake** — Photos stored separately from intake (intake in intake forms; photos in encrypted vault)

### Phase 1B Deliverables
- [ ] Scheduling system live with real-time conflict prevention
- [ ] Database constraints prevent double-booking
- [ ] Stripe payment links generated + tested
- [ ] Payment webhooks updating appointment `payment_completed` status
- [ ] Postmark email system working (staff can send emails)
- [ ] Twilio SMS system working (staff can send SMS)
- [ ] Photo storage infrastructure set up (encrypted, logged access)
- [ ] Code deployed to staging; all integrations tested
- [ ] Payment workflow tested end-to-end (create link → patient pays → webhook updates DB)

### Phase 1B Success Criteria
- [ ] Scheduling prevents double-booking (attempt to book same room → fails)
- [ ] Payments webhook success rate 100% (test with Stripe test cards)
- [ ] Email/SMS delivery confirmed (check Postmark + Twilio dashboards)
- [ ] No critical bugs blocking staging deployment
- [ ] Staging environment stable

---

## PHASE 1C: POLISH, SECURITY & STAGING DEPLOY

### Pain Points Addressed (Phase 1C)
8-12. Final polish on remaining pain points — reporting, inventory, notifications refinement

### What We're Doing

**Polish & Optimization:**
- Fix all critical bugs found during internal testing
- Improve UX for common workflows
- Optimize slow queries + page load times
- Security review (OWASP top 10, HIPAA compliance checklist)

**Module Library Completion:**
- Close module gaps (errors, bookings, availability, hooks, next-api)
- Fix architecture issues (RBAC on all routes, multi-tenant isolation)
- Resolve HIPAA compliance posture (BAA or restrict intake fields)

**Staging Deploy + Smoke Test:**
- Deploy to Railway staging + Supabase
- Pass full happy path smoke test (signup → providers → booking → intake → payment → notifications)
- Verify all integrations work end-to-end

> **Customer onboarding (pilots) is deferred to Phase 5.** See `PHASE_5_ONBOARDING_GUIDE.md`.

### Phase 1 Build Completion Deliverables
- [ ] Module library gaps closed (errors, bookings, availability, hooks, next-api)
- [ ] RBAC enforced on all dashboard routes (not just audit logs)
- [ ] Multi-tenant isolation (extract clinicId from session, remove NEXT_PUBLIC_CLINIC_ID)
- [ ] HIPAA compliance posture resolved (BAA with Supabase OR restrict intake fields)
- [ ] Session-aware client (@supabase/ssr)
- [ ] Staging deployment (Railway + Supabase)
- [ ] Post-deploy smoke test passed (full happy path verified)

### Phase 1 → Phase 2 Gate Criteria (Build-Focused)

**All of the following must be true to proceed to Phase 2:**
- [ ] **All features built and tested** — 149+ tests passing, 0 failures
- [ ] **Module library gaps closed** — errors, bookings, availability, hooks, next-api packages extracted
- [ ] **RBAC complete** — role checks on every protected route
- [ ] **HIPAA resolved** — compliance posture documented and implemented
- [ ] **Multi-tenant isolation** — clinicId extracted from session, not hardcoded
- [ ] **Staging smoke test passes** — full happy path (signup → providers → booking → intake → payment → notifications)

**If gate is missed:** Continue building until all criteria met. No customer contact during Phase 1.

---

## TECHNICAL FOUNDATION

### Tech Stack
- **Frontend:** Next.js (React) + Tailwind CSS
- **Backend:** Next.js API routes (extracting to standalone `connect-api` service in Phase 2)
- **Database:** Postgres via Supabase (real-time, auth, row-level security)
- **Payments:** Stripe (not Square; better for Phase 2+ multi-provider model)
- **Email:** Postmark (transactional, high deliverability)
- **SMS:** Twilio (healthcare-grade)
- **Hosting:** Railway (frontend), Supabase (backend + database)
- **Auth:** Supabase Auth (simplicity + HIPAA compliance)

### Monorepo Structure (Day 1)
```
Med Spa App/
  apps/
    portal-medspa/        # Med spa portal (deployed to Railway)
    connect-api/          # Empty for now; becomes standalone service in Phase 2
  packages/
    core/                 # baseplate-core: Auth, RBAC, Audit Logs, Types
    ui/                   # Shared Tailwind component library
  pnpm-workspace.yaml
  turbo.json
  package.json
```

**Why this structure:**
- `packages/core` and `packages/ui` will be reused by Phase 3's second vertical
- Avoids code duplication across verticals
- Each `apps/` directory can be deployed independently

### HIPAA Baseline (Phase 1)

**What we own:**
- Data encryption at rest (Postgres + application-level)
- Encryption in transit (HTTPS/TLS via Railway + Supabase)
- Audit logs (WHO, WHAT, WHEN)
- Role-based access control
- Digital consent (signed, timestamped)
- Patient data separation (patients only see their own data)

**What we don't own yet (Phase 2+):**
- Vendor BAA (Business Associate Agreements)
- Encryption key management (AWS KMS)
- Disaster recovery + encrypted backups
- Penetration testing + compliance certification

**Compliance Posture:** "HIPAA-designed" (not yet certified). Acceptable for staging. Resolve BAA before Phase 5 pilot launch.

---

## PHASE 2 PREPARATION

### What Becomes a Connect Endpoint
These are built as **features in Phase 1**, then **extracted as APIs in Phase 2:**

1. **`POST /v1/payments/invoice`** ← Stripe integration
2. **`POST /v1/communications/sms-reminder`** ← Twilio SMS
3. **`POST /v1/inventory/deduct`** ← Treatment charting feature
4. **`POST /v1/reporting/treatment-metrics`** ← Dashboard
5. **`POST /v1/billing/package-deduct`** ← Appointment completion workflow

In Phase 2, these become **reusable APIs** that:
- New Scaffold templates call directly
- Other verticals (contractors, property management) consume
- Enable Connect monetization ($49-99/mo per clinic)

---

## RESOURCES & REFERENCE

**Implementation Details:**
- **`Phase 1 - Scaffold Specification.md`** — Feature-by-feature breakdown, database schema, implementation checklist, definition of done

**Context & Validation:**
- **`../Phase 0 - Vertical Validation/Phase 0 - Vertical Validation.md`** — Pain points, module mapping, gate criteria
- **`Comprehensive Med Spa Market Research.md`** — Vendor analysis, competitive intelligence (43+ sources)
- **`../Business Plan & Roadmap.md`** — Business model, pricing, full phases 1-5 strategy (build-first, onboard-last)

**Development Tools:**
- Use Cursor + Claude for feature building
- Use Claude for architecture reviews, code quality, testing strategy
- Reference Next.js, Supabase, Stripe docs as needed

---

## TIMELINE SUMMARY

| Phase | Focus | Key Deliverable | Gate Criteria |
|---|---|---|---|
| **Phase 1** | Complete Med Spa Portal | All features + module gaps + RBAC + HIPAA + staging deploy | Staging smoke test passes, all gates met |
| **Phase 2** | Platform Layer | Connect API + module generalization + open-source prep | API functional, modules vertical-agnostic |
| **Phase 3** | Intel & Ecosystem | Rules engine + marketplace + MCP + home services portal | All features built and tested |
| **Phase 4** | Open-Source Launch | Publish repo, docs, marketing | Repo published, docs complete |
| **Phase 5** | Customer Onboarding | Pilot recruitment, production deploy, feedback | 3+ pilots onboarded, 2+ using weekly |

**Proceed to Phase 2 when:** All Phase 1 build criteria met (staging smoke test passes).

